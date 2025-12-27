#!/usr/bin/env node

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import matter from "gray-matter";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const scriptsDir = path.dirname(__filename);
const projectRoot = path.resolve(scriptsDir, "..");
const repoRoot = path.resolve(projectRoot, "..");

// Load environment variables
const frontendEnv = path.join(projectRoot, ".env");
if (fs.existsSync(frontendEnv)) {
  dotenv.config({ path: frontendEnv, override: false });
}

const basePath = process.env.BASE_PATH || '';
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

// Helper to fix relative links based on file location vs deployed location
// This is CRITICAL for pages where the markdown file is in a different location
// than where the page is deployed
const fixRelativeLinks = (body, relativePath, urlPath) => {
  if (!body || typeof body !== "string") return body;
  
  // Calculate the depth difference between markdown file location and deployed URL
  // relativePath: path from EDIT folder to .md file (e.g., "detlef/deutsch/textinterpretation.md")
  // urlPath: deployed URL path (e.g., "/detlef/deutsch/textinterpretation/")
  
  const mdDir = path.dirname(relativePath).replace(/\\/g, '/'); // "detlef/deutsch"
  const deployedDir = urlPath.slice(0, -1).replace(/\\/g, '/'); // "/detlef/deutsch/textinterpretation"
  
  console.log(`\n=== RELATIVE LINK FIX ===`);
  console.log(`Markdown file directory: ${mdDir}`);
  console.log(`Deployed URL directory: ${deployedDir}`);
  
  // Check if the deployed directory is deeper than the markdown file directory
  // This happens when a .md file like "textinterpretation.md" is deployed as "/detlef/deutsch/textinterpretation/"
  const mdDepth = mdDir.split('/').filter(p => p).length;
  const deployedDepth = deployedDir.split('/').filter(p => p).length;
  
  console.log(`Markdown depth: ${mdDepth}, Deployed depth: ${deployedDepth}`);
  
  if (deployedDepth > mdDepth) {
    const depthDiff = deployedDepth - mdDepth;
    console.log(`Depth difference: ${depthDiff} - need to add ${depthDiff} "../" prefix to relative links`);
    
    // Fix relative links that don't start with / or http
    // Match markdown links: [text](path) or <a href="path">
    const fixedBody = body.replace(
      /(\[[^\]]+\]\(|<a\s+href=")(?!\/|https?:|mailto:|#)([^")\s>]+)(["\)])/g,
      (match, prefix, linkPath, suffix) => {
        // Don't modify if it already starts with ../
        if (linkPath.startsWith('../')) {
          return match;
        }
        
        // Add the required number of ../ prefixes
        const goUp = '../'.repeat(depthDiff);
        const newLinkPath = goUp + linkPath;
        
        console.log(`  Fixed relative link: ${linkPath} -> ${newLinkPath}`);
        return prefix + newLinkPath + suffix;
      }
    );
    
    console.log(`=== END RELATIVE LINK FIX ===\n`);
    return fixedBody;
  }
  
  console.log(`No depth difference detected, no relative link fixes needed`);
  console.log(`=== END RELATIVE LINK FIX ===\n`);
  return body;
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
    // Normalize entry name to remove Windows line endings, then normalize path
    const normalizedName = entry.name.replace(/[\r\n]+/g, '');
    const relativePath = path.join(basePath, normalizedName).replace(/\\/g, '/');

    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
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
  // Normalize relativePath to remove Windows line endings
  const normalizedRelativePath = relativePath.replace(/[\r\n]+/g, '');
  const content = fs.readFileSync(filePath, 'utf-8');
  const { data, content: body } = matter(content);

  // Extract title from frontmatter or first heading
  let title = data.title;
  if (!title) {
    const titleMatch = body.match(/^#\s+(.+)$/m);
    title = titleMatch ? titleMatch[1].trim() : path.basename(normalizedRelativePath, '.md');
  }
  
  // Generate slug from filename
  const slug = path.basename(normalizedRelativePath, '.md');
  
  // Generate path from relative path
  let urlPath = '/' + normalizedRelativePath.replace(/\.md$/, '').replace(/\\/g, '/');
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

  // Calculate directory of the markdown file relative to EDIT folder
  // This is CRITICAL for correct image path calculation
  const fileDirRelative = path.dirname(relativePath).replace(/\\/g, '/');
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  
  // DISCOVER IMAGES based on actual file structure
  // This approach is more reliable than trusting frontmatter
  const discoveredImages = [];
  
  // For index.md files, check if there's a subdirectory with images
  if (slug === 'index') {
    const fileDir = path.dirname(filePath);
    const subDirPath = path.join(fileDir, path.basename(fileDir));
    if (fs.existsSync(subDirPath) && fs.statSync(subDirPath).isDirectory()) {
      const subDirEntries = fs.readdirSync(subDirPath);
      const subDirName = path.basename(subDirPath);
      for (let i = 1; i <= 10; i++) {
        for (const ext of imageExtensions) {
          const imageName = `${subDirName}-${i}${ext}`;
          if (subDirEntries.includes(imageName)) {
            // Calculate path relative to markdown file's directory
            const relativeImagePath = path.join(fileDirRelative, subDirName, imageName).replace(/\\/g, '/');
            discoveredImages.push({
              url: '/' + relativeImagePath,
              alt: title,
            });
          }
        }
      }
    }
  } else {
    // For non-index.md files, check for images in same directory first
    const fileDir = path.normalize(path.dirname(filePath));
    const baseName = slug;
    
    // First, check if there's a subdirectory with the same name as the markdown file
    const subDirPath = path.join(fileDir, baseName);
    
    console.log(`DEBUG: Checking for subdirectory: ${subDirPath}, exists: ${fs.existsSync(subDirPath)}`);
    
    if (fs.existsSync(subDirPath) && fs.statSync(subDirPath).isDirectory()) {
      const subDirEntries = fs.readdirSync(subDirPath);
      for (let i = 1; i <= 10; i++) {
        for (const ext of imageExtensions) {
          const imageName = `${baseName}-${i}${ext}`;
          if (subDirEntries.includes(imageName)) {
            // Calculate path relative to markdown file's directory
            const relativeImagePath = path.join(fileDirRelative, baseName, imageName).replace(/\\/g, '/');
            discoveredImages.push({
              url: '/' + relativeImagePath,
              alt: title,
            });
          }
        }
      }
    } else {
      // Fallback: Try to find images in the same directory as the markdown file
      for (let i = 1; i <= 10; i++) {
        for (const ext of imageExtensions) {
          const imageName = `${baseName}-${i}${ext}`;
          const imagePath = path.join(fileDir, imageName);
          if (fs.existsSync(imagePath)) {
            // Calculate path relative to markdown file's directory
            const relativeImagePath = path.join(fileDirRelative, imageName).replace(/\\/g, '/');
            discoveredImages.push({
              url: '/' + relativeImagePath,
              alt: title,
            });
          }
        }
      }
    }
  }
  
  // If no images found, try to find images named after the markdown file
  // (e.g., mein-grovater-rudolf-zeiler-1.jpg for mein-grovater-rudolf-zeiler.md)
  if (discoveredImages.length === 0) {
    const fileDir = path.dirname(filePath);
    const baseName = slug;
    
    for (let i = 1; i <= 10; i++) {
      for (const ext of imageExtensions) {
        const imageName = `${baseName}-${i}${ext}`;
        const imagePath = path.join(fileDir, imageName);
        if (fs.existsSync(imagePath)) {
          // Calculate path relative to markdown file's directory
          const relativeImagePath = path.join(fileDirRelative, imageName).replace(/\\/g, '/');
          discoveredImages.push({
            url: '/' + relativeImagePath,
            alt: title,
          });
        }
      }
    }
  }
  
  // FALLBACK: If no images found, look in uploads folder
  if (discoveredImages.length === 0) {
    const uploadsDir = path.join(repoRoot, 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const uploadFiles = fs.readdirSync(uploadsDir);
      const baseName = slug;
      
      for (let i = 1; i <= 10; i++) {
        for (const ext of imageExtensions) {
          const imageName = `${baseName}-${i}${ext}`;
          const imagePath = path.join(uploadsDir, imageName);
          if (uploadFiles.some(file => file.name === imageName)) {
            discoveredImages.push({
              url: '/' + imageName,
              alt: title,
            });
          }
        }
      }
    }
  }
  
  // Use discovered images if any found, otherwise fall back to frontmatter
  // This ensures we prioritize actual file structure over potentially incorrect frontmatter
  console.log(`\n=== DIAGNOSTIC LOG for ${normalizedRelativePath} ===`);
  console.log(`BASE_PATH: "${basePath}"`);
  console.log(`File directory relative: "${fileDirRelative}"`);
  console.log(`Frontmatter images:`, JSON.stringify(data.images || [], null, 2));
  console.log(`Discovered images:`, JSON.stringify(discoveredImages, null, 2));
  console.log(`Using discovered images: ${discoveredImages.length > 0}`);
  
  const images = discoveredImages.length > 0 ? discoveredImages : (data.images || []);
  console.log(`Selected images array:`, JSON.stringify(images, null, 2));

  // NOTE: We do NOT add BASE_PATH prefix here because Astro will handle it automatically
  // via the 'base' configuration in astro.config.mjs
  const processedImages = images.map(img => {
    console.log(`Image URL (no transformation, Astro will add BASE_PATH): "${img.url}"`);
    return img;
  }).filter(img => img.url);
  console.log(`Final processed images:`, JSON.stringify(processedImages, null, 2));
  console.log(`=== END DIAGNOSTIC LOG ===\n`);

  // Apply relative link fixes before returning
  const fixedBody = fixRelativeLinks(replaceOldLinks(body), normalizedRelativePath, urlPath);
  
  return {
    title: cleanTitle(title),
    slug,
    path: urlPath,
    summary: data.summary || '',
    body: fixedBody,
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

  if (!fs.existsSync(editFolder)) {
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
