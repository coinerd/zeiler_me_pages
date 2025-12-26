#!/usr/bin/env node

// Helper to remove unwanted site prefix from titles
const cleanTitle = (title) => {
  if (!title) return title;
  const prefix = "ZEILER .me - IT & Medien, Geschichte, Deutsch - ";
  if (title.startsWith(prefix)) {
    return title.slice(prefix.length).trim();
  }
  // Also handle possible variations with trailing dash
  const altPrefix = "ZEILER .me - IT & Medien, Geschichte, Deut... - ";
  if (title.includes("ZEILER .me")) {
    // Remove everything up to the last hyphen
    const parts = title.split("-");
    return parts.slice(-1)[0].trim();
  }
  return title;
};

// Helper to replace old website links with new URLs
const replaceOldLinks = (body) => {
  if (!body || typeof body !== "string") return body;
  
  // Replace https://www.zeiler.me/ with /
  // Replace .html with /
  // This handles internal links from the old website
  return body
    .replace(/https:\/\/www\.zeiler\.me\//g, '/')
    .replace(/\.html/g, '/');
};

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import dotenv from "dotenv";

const normalizePath = (value, fallback = null) => {
  if (!value || typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (trimmed === "/") return "/";
  return `/${trimmed.replace(/^\/+|\/+$/g, "")}/`;
};

const __filename = fileURLToPath(import.meta.url);
const scriptsDir = path.dirname(__filename);
const projectRoot = path.resolve(scriptsDir, "..");
const repoRoot = path.resolve(projectRoot, "..");

const rootEnv = path.join(repoRoot, ".env");
if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv, override: false });
}

const cmsEnv = path.join(repoRoot, "cms", ".env");
if (fs.existsSync(cmsEnv)) {
  dotenv.config({ path: cmsEnv, override: false });
}

const frontendEnv = path.join(projectRoot, ".env");
if (fs.existsSync(frontendEnv)) {
  dotenv.config({ path: frontendEnv, override: false });
}

console.log(`STRAPI_TOKEN_RO present: ${!!process.env.STRAPI_TOKEN_RO}`);
if (process.env.STRAPI_TOKEN_RO) {
  console.log(`STRAPI_TOKEN_RO length: ${process.env.STRAPI_TOKEN_RO.length}`);
}

// Check if EDIT folder exists and should be used
const editFolderPath = path.join(repoRoot, 'EDIT');
const editFolderExists = await fs.pathExists(editFolderPath);
const useEditFolderEnv = process.env.USE_EDIT_FOLDER === 'true';
const USE_EDIT_FOLDER = useEditFolderEnv || editFolderExists;

console.log(`USE_EDIT_FOLDER env var: ${useEditFolderEnv}`);
console.log(`EDIT folder exists: ${editFolderExists}`);
console.log(`USE_EDIT_FOLDER: ${USE_EDIT_FOLDER}`);

try {
  let pagesOutput, nav, searchIndex;

  if (USE_EDIT_FOLDER) {
    console.log("Using EDIT folder as content source...");
    const { parseEditFolder } = await import("./parse-edit-folder.mjs");
    const result = await parseEditFolder();
    pagesOutput = result.pages;
    nav = result.nav;
    searchIndex = result.searchIndex;
  } else {
    console.log("Using Strapi as content source...");
    const [envModule, strapiModule, pathsModule] = await Promise.all([
      import("../src/lib/env.js"),
      import("../src/lib/strapi.js"),
      import("../src/lib/paths.js"),
    ]);

    const { env } = envModule;
    const { getAllPages, getAllSections } = strapiModule;
    const { resolvePagePaths, buildBreadcrumbs } = pathsModule;

    console.log("Fetching sections...");
    const sections = await getAllSections();
    console.log(`Fetched ${sections.length} sections`);

    const sectionsWithMeta = sections.map((section) => ({
      id: section.id,
      slug: section.slug || section?.attributes?.slug || null,
      title: cleanTitle(section.title || section?.attributes?.title) || "Untitled Section",
      order: Number(section.order ?? section?.attributes?.order ?? Number.MAX_SAFE_INTEGER),
      intro: section.intro || section?.attributes?.intro || "",
    }));
    const sectionMap = new Map(sectionsWithMeta.map((section) => [section.id, section]));

    console.log("Fetching pages...");
    const pages = await getAllPages();
    console.log(`Fetched ${pages.length} pages`);

    const pagesResolved = resolvePagePaths(pages);

    // POST-PROCESS: Re-link parents based on Path Hierarchy
    // This ensures the Navigation and Breadcrumbs match the URL structure derived from 'route'.
    const pathMap = new Map();
    pagesResolved.forEach((p) => {
      if (p.path) pathMap.set(p.path, p);
    });

    pagesResolved.forEach((page) => {
      // Skip root or missing paths
      if (!page.path || page.path === "/") return;

      // Determine parent path: /foo/bar/ -> /foo/
      // 1. Remove trailing slash
      let temp = page.path.endsWith("/") ? page.path.slice(0, -1) : page.path;
      // 2. Remove last segment
      const lastSlash = temp.lastIndexOf("/");
      if (lastSlash > 0) {
        const parentPath = temp.substring(0, lastSlash) + "/";
        const parentPage = pathMap.get(parentPath);

        if (parentPage) {
          // Found a parent by path!
          // Override the 'parent' attribute so subsequent logic (breadcrumbs, nav tree) follows this hierarchy.
          // We patch both 'attributes.parent' (for getParentEntity) and 'parent' (flat fallback).
          const parentRef = { id: parentPage.id, ...parentPage };

          if (page.attributes) {
            // If 'data' wrapper exists, update inside it, else direct
            if (page.attributes.parent && page.attributes.parent.data) {
              page.attributes.parent.data = parentRef;
            } else {
              page.attributes.parent = parentRef;
            }
          }
          page.parent = parentRef;

          // Also update 'parentId' for the immediate loop below (enrichedPages uses this indirectly or we fix it there)
          // enrichedPages derivation uses: const parentRef = attrs.parent?.data ?? attrs.parent ?? null;
          // So patching attrs.parent is sufficient.
        }
      }
    });

    const pageMap = new Map(pagesResolved.map((page) => [page.id, page]));

    const enrichedPages = pagesResolved.map((page) => {
      const attrs = page.attributes || page;
      let sectionId = null;
      if (attrs.section) {
        if (typeof attrs.section === 'object') {
          sectionId = attrs.section.id || attrs.section.data?.id;
        } else {
          sectionId = attrs.section;
        }
      }

      const sectionMeta = sectionId ? sectionMap.get(sectionId) : null;
      const route = attrs.route;
      const finalPath = page.path || normalizePath(route, `/page-${page.id}/`);

      let breadcrumbs = buildBreadcrumbs(page, pageMap).map((crumb) => ({
        title: cleanTitle(crumb.title),
        path: crumb.path || finalPath || "/",
      }));

      if (sectionMeta) {
        const sectionPath = `/${sectionMeta.slug}/`;
        if (!breadcrumbs.length || breadcrumbs[0].path !== sectionPath) {
          breadcrumbs = [
            {
              title: sectionMeta.title,
              path: sectionMeta.slug ? sectionPath : "/",
            },
            ...breadcrumbs,
          ];
        }
      }

      if (!breadcrumbs.some((crumb) => crumb.path === "/")) {
        breadcrumbs = [
          {
            title: "Startseite",
            path: "/",
          },
          ...breadcrumbs,
        ];
      }

      const parentRef = attrs.parent?.data ?? attrs.parent ?? null;
      const parentId = (parentRef && typeof parentRef === 'object') ? parentRef.id : (parentRef || null);
      const summary = attrs.summary || "";

      // Process images array - extract URLs and any associated metadata
      const imagesRaw = attrs.images;
      let images = Array.isArray(imagesRaw) ? imagesRaw.filter(Boolean).map((img, index) => {
        if (typeof img === 'string') {
          // Already a URL string
          return { url: img, alt: '', index };
        }
        if (img && typeof img === 'object') {
          // Strapi media object
          const url = img.url || (img.data && img.data.attributes && img.data.attributes.url);
          // Look for matching imageMetadata by index
          const metadata = attrs.imageMetadata && attrs.imageMetadata[index];
          const alt = metadata?.alt || metadata?.caption || '';
          return { url, alt, index, caption: metadata?.caption };
        }
        return null;
      }).filter(Boolean) : [];

      // FALLBACK: If no images in Strapi, look for matching images in public folder
      if (images.length === 0 && attrs.slug) {
        const publicDir = path.join(projectRoot, "public");
        // Determine the directory based on the route
        const routeDir = attrs.route ? path.join(publicDir, attrs.route.replace(/^\/|\/$/g, '')) : publicDir;
        const parentDir = path.dirname(routeDir);
        
        // Look for files like slug-1.jpg, slug-2.jpg in the parent directory
        // (based on the observed file structure)
        const possiblePatterns = [
          path.join(parentDir, `${attrs.slug}-1.jpg`),
          path.join(parentDir, `${attrs.slug}-2.jpg`),
          path.join(parentDir, `${attrs.slug}-3.jpg`),
          path.join(parentDir, `${attrs.slug}.jpg`),
          path.join(routeDir, `${attrs.slug}-1.jpg`),
          path.join(routeDir, `${attrs.slug}.jpg`),
        ];

        for (const fullPath of possiblePatterns) {
          if (fs.existsSync(fullPath)) {
            const relativePath = '/' + path.relative(publicDir, fullPath).replace(/\\/g, '/');
            images.push({
              url: relativePath,
              alt: attrs.title,
              index: images.length
            });
          }
        }
      }

      return {
        id: page.id,
        title: cleanTitle(attrs.title) || "Untitled Page",
        slug: attrs.slug || `page-${page.id}`,
        path: finalPath || `/page-${page.id}/`,
        summary,
        body: replaceOldLinks(attrs.body || ""),
        images,
        publishedAt: attrs.publishedAt || null,
        order: Number(attrs.order ?? Number.MAX_SAFE_INTEGER),
        section: sectionMeta
          ? {
              id: sectionMeta.id,
              title: sectionMeta.title,
              slug: sectionMeta.slug,
            }
          : null,
        parentId,
        breadcrumbs,
      };
    });

    const nodesById = new Map(
      enrichedPages.map((page) => [page.id, { ...page, children: [], sectionId: page.section?.id || "__other" }])
    );

    const rootsBySection = new Map();

    nodesById.forEach((node) => {
      if (node.parentId && nodesById.has(node.parentId)) {
        nodesById.get(node.parentId).children.push(node);
      } else {
        const key = node.sectionId || "__other";
        if (!rootsBySection.has(key)) {
          rootsBySection.set(key, []);
        }
        rootsBySection.get(key).push(node);
      }
    });


    const sortNodes = (list) => {
      list.sort((a, b) => {
        if (a.order === b.order) {
          return a.title.localeCompare(b.title, "de", { sensitivity: "base" });
        }
        return a.order - b.order;
      });
      list.forEach((child) => sortNodes(child.children));
    };

    rootsBySection.forEach((nodes) => sortNodes(nodes));

    nav = Array.from(rootsBySection.entries())
      .map(([sectionId, nodes]) => {
        const meta = sectionMap.get(sectionId) || {
          id: sectionId,
          title: "Weitere Inhalte",
          slug: null,
          order: Number.MAX_SAFE_INTEGER,
        };

        const strip = (node) => ({
          id: node.id,
          title: node.title,
          path: node.path,
          summary: node.summary,
          children: node.children.map(strip),
        });

        return {
          id: meta.id || sectionId,
          title: meta.title,
          slug: meta.slug,
          path: meta.slug ? `/${meta.slug}/` : "/",
          order: meta.order ?? Number.MAX_SAFE_INTEGER,
          intro: meta.intro || "",
          children: nodes.map(strip),
        };
      })
      .sort((a, b) => {
        if (a.order === b.order) {
          return a.title.localeCompare(b.title, "de", { sensitivity: "base" });
        }
        return a.order - b.order;
      });

    pagesOutput = enrichedPages.map((page) => ({
      id: page.id,
      title: page.title,
      slug: page.slug,
      path: page.path,
      summary: page.summary,
      body: page.body,
      images: page.images,
      publishedAt: page.publishedAt,
      breadcrumbs: page.breadcrumbs,
      section: page.section,
      parentId: page.parentId,
    }));

    searchIndex = enrichedPages.map((page) => ({
      title: page.title,
      path: page.path,
      summary: page.summary,
    }));
  }

  const dataDir = path.join(projectRoot, "src", "data");
  const publicDir = path.join(projectRoot, "public");

  await fs.ensureDir(dataDir);
  await fs.ensureDir(publicDir);

  await Promise.all([
    fs.writeJson(path.join(dataDir, "pages.json"), pagesOutput, { spaces: 2 }),
    fs.writeJson(path.join(dataDir, "nav.json"), nav, { spaces: 2 }),
    fs.writeJson(path.join(publicDir, "search-index.json"), searchIndex, { spaces: 2 }),
  ]);

  const robots = `User-agent: *
Allow: /
Sitemap: ${process.env.SITE_URL?.replace(/\/$/, "") || 'https://coinerd.github.io/zeiler_me_pages'}/sitemap-index.xml
`;

  await fs.writeFile(path.join(publicDir, "robots.txt"), robots, "utf8");

  const source = USE_EDIT_FOLDER ? "EDIT folder" : "Strapi";
  console.log(`Synced ${pagesOutput.length} pages from ${source}.`);
} catch (error) {
  console.error("build-data failed:", error.message || error);
  process.exit(1);
}
