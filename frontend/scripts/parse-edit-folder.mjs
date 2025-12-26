#!/usr/bin/env node

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const scriptsDir = path.dirname(__filename);
const projectRoot = path.resolve(scriptsDir, "..");
const repoRoot = path.resolve(projectRoot, "..");

const editFolder = path.join(repoRoot, "EDIT");

// Helper to clean titles (same as in build-data.mjs)
const cleanTitle = (title) => {
  if (!title) return title;
  const prefix = "ZEILER .me - IT & Medien, Geschichte, Deutsch - ";
  if (title.startsWith(prefix)) {
    return title.slice(prefix.length).trim();
  }
  const altPrefix = "ZEILER .me - IT & Medien, Geschichte, Deut... - ";
  if (title.includes("ZEILER .me")) {
    const parts = title.split("-");
    return parts.slice(-1)[0].trim();
  }
  return title;
};

// Helper to replace old website links
const replaceOldLinks = (body) => {
  if (!body || typeof body !== "string") return body;
  return body
    .replace(/https:\/\/www\.zeiler\.me\//g, '/')
    .replace(/\.html/g, '/');
};

// Normalize path helper
const normalizePath = (value, fallback = null) => {
  if (!value || typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (trimmed === "/") return "/";
  return `/${trimmed.replace(/^\/+|\/+$/g, "")}/`;
};

// Recursively scan directory for markdown files
async function scanDirectory(dir, basePath = "") {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      const subFiles = await scanDirectory(fullPath, relativePath);
      files.push(...subFiles);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push({
        path: fullPath,
        relativePath: relativePath.replace(/\\/g, '/'),
      });
    }
  }

  return files;
}

// Extract frontmatter and content from markdown file
function parseMarkdownFile(filePath, relativePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { data, content: body } = matter(content);

  // Extract title from frontmatter or first heading
  let title = data.title;
  if (!title) {
    const titleMatch = body.match(/^#\s+(.+)$/m);
    title = titleMatch ? titleMatch[1].trim() : path.basename(relativePath, '.md');
  }

  // Generate slug from filename
  const slug = path.basename(relativePath, '.md');

  // Generate path from relative path
  let urlPath = '/' + relativePath.replace(/\.md$/, '').replace(/\\/g, '/');
  if (!urlPath.endsWith('/')) {
    urlPath += '/';
  }

  // Handle index.md files
  if (slug === 'index') {
    const dirPath = path.dirname(relativePath);
    if (dirPath === '.') {
      urlPath = '/';
    } else {
      urlPath = '/' + dirPath.replace(/\\/g, '/') + '/';
    }
  }

  // Extract images from frontmatter or find in same directory
  const images = data.images || [];
  if (images.length === 0) {
    // Try to find images in the same directory
    const fileDir = path.dirname(filePath);
    const baseName = slug;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    for (let i = 1; i <= 10; i++) {
      for (const ext of imageExtensions) {
        const imageName = `${baseName}-${i}${ext}`;
        const imagePath = path.join(fileDir, imageName);
        if (fs.existsSync(imagePath)) {
          const relativeImagePath = path.join(path.dirname(relativePath), imageName).replace(/\\/g, '/');
          images.push({
            url: '/' + relativeImagePath,
            alt: title,
          });
        }
      }
    }
  }

  // Process image URLs to be absolute
  const processedImages = images.map(img => ({
    ...img,
    url: img.url ? (img.url.startsWith('/') ? img.url : '/' + img.url) : null,
  })).filter(img => img.url);

  return {
    title: cleanTitle(title),
    slug,
    path: urlPath,
    summary: data.summary || '',
    body: replaceOldLinks(body),
    images: processedImages,
    publishedAt: data.publishedAt || null,
    order: data.order !== undefined ? Number(data.order) : Number.MAX_SAFE_INTEGER,
    section: data.section || null,
    frontmatter: data,
  };
}

// Build breadcrumbs from path
function buildBreadcrumbs(page, pageMap) {
  const breadcrumbs = [];
  const pathParts = page.path.split('/').filter(p => p);

  // Build path incrementally
  let currentPath = '/';
  for (let i = 0; i < pathParts.length; i++) {
    if (i > 0) {
      currentPath += pathParts.slice(0, i + 1).join('/') + '/';
    } else {
      currentPath = '/' + pathParts[0] + '/';
    }

    const parentPage = pageMap.get(currentPath);
    if (parentPage && parentPage.path !== page.path) {
      breadcrumbs.push({
        title: parentPage.title,
        path: parentPage.path,
      });
    }
  }

  return breadcrumbs;
}

// Build page hierarchy and navigation
function buildHierarchy(pages) {
  const pageMap = new Map();
  pages.forEach(page => pageMap.set(page.path, page));

  // Build parent-child relationships
  pages.forEach(page => {
    if (page.path === '/') return;

    const parentPath = path.dirname(page.path.slice(0, -1));
    const normalizedParentPath = parentPath === '' ? '/' : parentPath + '/';
    
    const parent = pageMap.get(normalizedParentPath);
    if (parent) {
      page.parentId = parent.id;
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(page);
    }
  });

  // Sort children by order
  const sortChildren = (page) => {
    if (page.children) {
      page.children.sort((a, b) => {
        if (a.order === b.order) {
          return a.title.localeCompare(b.title, "de", { sensitivity: "base" });
        }
        return a.order - b.order;
      });
      page.children.forEach(sortChildren);
    }
  };

  pages.forEach(sortChildren);

  return { pageMap, pages };
}

// Auto-detect section roots from file structure
function detectSections(pages) {
  const sectionRoots = new Set();
  const sectionMap = new Map();

  // Find all pages that have children - these are potential section roots
  pages.forEach(page => {
    if (page.children && page.children.length > 0) {
      sectionRoots.add(page.path);
    }
  });

  // Consider pages at depth 2 (e.g., /detlef/deutsch/) as potential sections
  // BUT only if they are NOT already in sectionRoots (i.e., they have children)
  pages.forEach(page => {
    const pathParts = page.path.split('/').filter(p => p);
    if (pathParts.length === 2 && !sectionRoots.has(page.path)) {
      sectionRoots.add(page.path);
    }
  });

  // Create mapping from section path to section slug
  sectionRoots.forEach(sectionPath => {
    const pathParts = sectionPath.split('/').filter(p => p);
    if (pathParts.length > 0) {
      const sectionSlug = pathParts[pathParts.length - 1];
      sectionMap.set(sectionPath, sectionSlug);
    }
  });

  return sectionMap;
}

// Assign section values to pages based on their path
function assignSections(pages, sectionMap) {
  pages.forEach(page => {
    if (page.path === '/') return;

    // Find the longest matching section path that is a prefix of the page path
    let bestMatch = null;
    let bestMatchLength = 0;

    for (const [sectionPath, sectionSlug] of sectionMap.entries()) {
      if (page.path !== sectionPath && page.path.startsWith(sectionPath)) {
        if (sectionPath.length > bestMatchLength) {
          bestMatch = sectionSlug;
          bestMatchLength = sectionPath.length;
        }
      }
    }

    if (bestMatch) {
      page.section = bestMatch;
    }
  });
}

// Build navigation structure
function buildNavigation(pages, pageMap) {
  // Auto-detect sections from file structure
  const sectionMap = detectSections(pages);
  
  // Assign section values to pages
  assignSections(pages, sectionMap);

  // Group by section
  const sectionPagesMap = new Map();
  const rootPages = [];

  pages.forEach(page => {
    if (page.section) {
      if (!sectionPagesMap.has(page.section)) {
        sectionPagesMap.set(page.section, []);
      }
      sectionPagesMap.get(page.section).push(page);
    } else if (!page.parentId) {
      rootPages.push(page);
    }
  });

  // Build navigation items
  const navItems = [];

  // Process sections
  for (const [sectionSlug, sectionPages] of sectionPagesMap.entries()) {
    // Find the section root page (the page at the section path)
    const sectionPath = Array.from(sectionMap.entries()).find(([path, slug]) => slug === sectionSlug)?.[0];
    const sectionRoot = sectionPages.find(p => p.path === sectionPath);
    if (!sectionRoot) continue;

    const stripNode = (node) => ({
      id: node.id,
      title: node.title,
      path: node.path,
      summary: node.summary,
      children: node.children ? node.children.map(stripNode) : [],
    });

    navItems.push({
      id: sectionRoot.id,
      title: sectionRoot.title,
      slug: sectionSlug,
      path: sectionRoot.path,
      order: sectionRoot.order,
      intro: sectionRoot.frontmatter.intro || '',
      children: sectionRoot.children ? sectionRoot.children.map(stripNode) : [],
    });
  }

  // Add root pages without sections
  rootPages.forEach(page => {
    if (!page.section) {
      navItems.push({
        id: page.id,
        title: page.title,
        slug: page.slug,
        path: page.path,
        order: page.order,
        intro: '',
        children: page.children ? page.children.map(child => ({
          id: child.id,
          title: child.title,
          path: child.path,
          summary: child.summary,
          children: [],
        })) : [],
      });
    }
  });

  // Sort navigation items
  navItems.sort((a, b) => {
    if (a.order === b.order) {
      return a.title.localeCompare(b.title, "de", { sensitivity: "base" });
    }
    return a.order - b.order;
  });

  return navItems;
}

// Main function to parse EDIT folder
export async function parseEditFolder() {
  console.log("Parsing EDIT folder...");

  if (!await fs.pathExists(editFolder)) {
    throw new Error(`EDIT folder not found at ${editFolder}`);
  }

  // Scan for all markdown files
  const markdownFiles = await scanDirectory(editFolder);
  console.log(`Found ${markdownFiles.length} markdown files`);

  // Parse each markdown file
  const pages = markdownFiles.map((file, index) => {
    const parsed = parseMarkdownFile(file.path, file.relativePath);
    return {
      id: index + 1,
      ...parsed,
    };
  });

  console.log(`Parsed ${pages.length} pages`);

  // Build hierarchy
  const { pageMap } = buildHierarchy(pages);

  // Build breadcrumbs for each page
  pages.forEach(page => {
    let breadcrumbs = buildBreadcrumbs(page, pageMap);

    // Add section to breadcrumbs if exists
    if (page.section) {
      const sectionPath = `/${page.section}/`;
      const sectionPage = pageMap.get(sectionPath);
      if (sectionPage && !breadcrumbs.some(b => b.path === sectionPath)) {
        breadcrumbs.unshift({
          title: sectionPage.title,
          path: sectionPath,
        });
      }
    }

    // Add home to breadcrumbs
    if (!breadcrumbs.some(b => b.path === '/')) {
      breadcrumbs.unshift({
        title: "Startseite",
        path: "/",
      });
    }

    page.breadcrumbs = breadcrumbs;
  });

  // Build navigation
  const nav = buildNavigation(pages, pageMap);

  // Prepare output pages (same structure as Strapi)
  const pagesOutput = pages.map(page => ({
    id: page.id,
    title: page.title,
    slug: page.slug,
    path: page.path,
    summary: page.summary,
    body: page.body,
    images: page.images,
    publishedAt: page.publishedAt,
    breadcrumbs: page.breadcrumbs,
    section: page.section ? {
      id: page.section,
      title: page.section,
      slug: page.section,
    } : null,
    parentId: page.parentId,
  }));

  // Build search index
  const searchIndex = pages.map(page => ({
    title: page.title,
    path: page.path,
    summary: page.summary,
  }));

  return {
    pages: pagesOutput,
    nav,
    searchIndex,
  };
}

// If run directly, output the parsed data
if (import.meta.url === `file://${process.argv[1]}`) {
  parseEditFolder()
    .then(({ pages, nav, searchIndex }) => {
      console.log(`\nParsed ${pages.length} pages`);
      console.log(`Generated ${nav.length} navigation sections`);
      console.log(`Generated ${searchIndex.length} search index entries`);
    })
    .catch(error => {
      console.error("Error parsing EDIT folder:", error);
      process.exit(1);
    });
}
