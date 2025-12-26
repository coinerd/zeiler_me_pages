const sanitizeSegment = (value, fallback) => {
  if (!value || typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  return trimmed.replace(/^\/+|\/+$/g, "").replace(/\s+/g, "-");
};

const getSectionEntity = (page) => {
  // Handle flattened structure (v5) or nested (v4)
  const attrs = page.attributes || page;
  if (attrs?.section?.data) return attrs.section.data;
  if (attrs?.section) return attrs.section;
  return null;
};

const getSectionSlug = (page) => {
  const section = getSectionEntity(page);
  if (!section) return undefined;
  const sectionAttrs = section.attributes ?? section;
  return sanitizeSegment(sectionAttrs?.slug, undefined);
};

const getParentEntity = (page) => {
  const attrs = page.attributes || page;
  if (attrs?.parent?.data) return attrs.parent.data;
  if (attrs?.parent) return attrs.parent;
  return null;
};

const collectParentSegments = (page, pageMap) => {
  const segments = [];
  const visited = new Set();
  let current = page;

  while (true) {
    const parentRef = getParentEntity(current);
    const parentId = parentRef?.id;
    if (!parentId || visited.has(parentId)) break;
    visited.add(parentId);

    const parentPage = pageMap.get(parentId) || parentRef;
    const parentAttrs = parentPage.attributes ?? parentPage;
    const slug = sanitizeSegment(parentAttrs?.slug, parentId ? `page-${parentId}` : undefined);
    if (slug) {
      segments.unshift(slug);
    }

    if (!pageMap.has(parentId)) {
      break;
    }

    current = pageMap.get(parentId);
  }

  return segments;
};

export const resolvePagePaths = (pages) => {
  const pageMap = new Map(pages.map((page) => [page.id, page]));
  const seenPaths = new Map();
  const processed = [];

  for (const page of pages) {
    const attrs = page.attributes || page;

    // Priority: Use the existing 'route' from Strapi if available
    let path = "";
    if (attrs.route && typeof attrs.route === "string") {
      const minRoute = attrs.route.trim();
      if (minRoute) {
        path = minRoute.startsWith("/") ? minRoute : `/${minRoute}`;
        if (!path.endsWith("/")) path += "/";
      }
    }

    const segments = [];
    // Only rebuild segments if we don't have a route (fallback)
    // Or if we need segments for other logic (like breadcrumbs), we can still collect them
    // But path should ideally come from route.

    const slugSource = attrs?.slug;
    const slug = sanitizeSegment(slugSource, page?.id ? `page-${page.id}` : "page");
    const sectionSlug = getSectionSlug(page);
    const parentSegments = collectParentSegments(page, pageMap);

    if (sectionSlug) segments.push(sectionSlug);
    if (parentSegments.length) segments.push(...parentSegments);
    segments.push(slug);

    // If no route was found, construct path from segments
    if (!path) {
      path = `/${segments.join("/")}/`;
    }

    // Ensure we don't have /index/ in the path if it's not the root
    // This fixes the issue where an abstract "index" page might be part of the URL
    if (path.includes("/index/")) {
      path = path.replace(/\/index\//g, "/");
    }

    let counter = 1;
    while (seenPaths.has(path)) {
      if (counter === 1) {
        console.warn(
          `[paths] Duplicate detected for ${path}; appending deterministic suffix.`
        );
      }
      counter += 1;
      // If we are deduplicating based on route, we might be in trouble if routes are genuinely dupes.
      // But typically we append a suffix.
      const lastSegment = segments.at(-1) || `page-${page.id}`;
      // Strip trailing slash for modification
      const cleanPath = path.endsWith("/") ? path.slice(0, -1) : path;
      path = `${cleanPath}-d${counter}/`;
    }
    seenPaths.set(path, page.id);

    processed.push({
      ...page,
      path,
      segments,
    });
  }

  return processed;
};

export const buildBreadcrumbs = (page, pageMap) => {
  const crumbs = [];
  const visited = new Set();
  let current = page;

  while (current) {
    const currentAttrs = current.attributes ?? current;
    const title = currentAttrs?.title || "Untitled";
    crumbs.unshift({
      id: current.id,
      title,
      path: current.path,
    });

    const parentRef = getParentEntity(current);
    const parentId = parentRef?.id;
    if (!parentId || visited.has(parentId)) break;
    visited.add(parentId);
    current = pageMap.get(parentId);
  }

  return crumbs;
};
