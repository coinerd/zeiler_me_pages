#!/usr/bin/env node

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import TurndownService from "turndown";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const scriptsDir = path.dirname(__filename);
const projectRoot = path.resolve(scriptsDir, "..");
const repoRoot = path.resolve(projectRoot, "..");

const publicDir = path.join(projectRoot, "public");
const editDir = path.join(repoRoot, "EDIT");

// Initialize Turndown service
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '_',
  strongDelimiter: '**',
});

// Helper to clean titles
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

// Extract title from HTML
function extractTitle(html) {
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  if (titleMatch) {
    return cleanTitle(titleMatch[1].trim());
  }
  
  const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
  if (h1Match) {
    return cleanTitle(h1Match[1].trim());
  }
  
  return null;
}

// Extract meta description
function extractDescription(html) {
  const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  if (metaMatch) {
    return metaMatch[1].trim();
  }
  return null;
}

// Extract images from HTML
function extractImages(html, relativePath) {
  const images = [];
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    const altMatch = match[0].match(/alt=["']([^"']*)["']/i);
    const alt = altMatch ? altMatch[1] : '';
    
    // Skip external images
    if (src.startsWith('http://') || src.startsWith('https://')) {
      continue;
    }
    
    images.push({
      url: src.startsWith('/') ? src : '/' + src,
      alt: alt,
    });
  }
  
  return images;
}

// Convert HTML to markdown
function convertHtmlToMarkdown(html) {
  // Remove script and style tags
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Convert to markdown
  const markdown = turndownService.turndown(html);
  
  // Clean up extra whitespace
  return markdown.replace(/\n{3,}/g, '\n\n');
}

// Process a single HTML file
async function processHtmlFile(htmlPath, relativePath) {
  console.log(`Processing: ${relativePath}`);
  
  const html = await fs.readFile(htmlPath, 'utf-8');
  
  // Extract metadata
  const title = extractTitle(html);
  const description = extractDescription(html);
  const images = extractImages(html, relativePath);
  
  // Remove head and body tags, keep only body content
  let bodyContent = html;
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) {
    bodyContent = bodyMatch[1];
  } else {
    // If no body tag, try to extract content after head
    const headEndMatch = html.indexOf('</head>');
    if (headEndMatch !== -1) {
      bodyContent = html.slice(headEndMatch + 7);
    }
  }
  
  // Convert to markdown
  const markdownBody = convertHtmlToMarkdown(bodyContent);
  
  // Generate frontmatter
  const frontmatter = {
    title: title || path.basename(relativePath, '.html'),
  };
  
  if (description) {
    frontmatter.summary = description;
  }
  
  if (images.length > 0) {
    frontmatter.images = images;
  }
  
  // Create markdown file with frontmatter
  const markdownContent = matter.stringify(markdownBody, frontmatter);
  
  return markdownContent;
}

// Recursively scan directory for HTML files
async function scanHtmlFiles(dir, basePath = "") {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      const subFiles = await scanHtmlFiles(fullPath, relativePath);
      files.push(...subFiles);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push({
        path: fullPath,
        relativePath: relativePath.replace(/\\/g, '/'),
      });
    }
  }

  return files;
}

// Copy images from public to EDIT
async function copyImages() {
  console.log("Copying images...");
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  let copiedCount = 0;
  
  async function copyImagesRecursive(sourceDir, targetDir) {
    const entries = await fs.readdir(sourceDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const sourcePath = path.join(sourceDir, entry.name);
      const targetPath = path.join(targetDir, entry.name);
      
      if (entry.isDirectory()) {
        await fs.ensureDir(targetPath);
        await copyImagesRecursive(sourcePath, targetPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (imageExtensions.includes(ext)) {
          await fs.copy(sourcePath, targetPath);
          copiedCount++;
        }
      }
    }
  }
  
  await copyImagesRecursive(publicDir, editDir);
  console.log(`Copied ${copiedCount} images`);
}

// Main conversion function
async function convertAllHtmlToMarkdown() {
  console.log("Starting HTML to Markdown conversion...");
  
  // Ensure EDIT directory exists
  await fs.ensureDir(editDir);
  
  // Scan for HTML files
  const htmlFiles = await scanHtmlFiles(publicDir);
  console.log(`Found ${htmlFiles.length} HTML files`);
  
  // Process each HTML file
  for (const file of htmlFiles) {
    try {
      const markdownContent = await processHtmlFile(file.path, file.relativePath);
      
      // Determine output path (change .html to .md)
      const relativePath = file.relativePath.replace(/\.html$/, '.md');
      const outputPath = path.join(editDir, relativePath);
      
      // Ensure output directory exists
      await fs.ensureDir(path.dirname(outputPath));
      
      // Write markdown file
      await fs.writeFile(outputPath, markdownContent, 'utf-8');
      
      console.log(`  ✓ ${file.relativePath} -> ${relativePath}`);
    } catch (error) {
      console.error(`  ✗ Error processing ${file.relativePath}:`, error.message);
    }
  }
  
  // Copy images
  await copyImages();
  
  console.log("\nConversion complete!");
  console.log(`Markdown files created in: ${editDir}`);
}

// If run directly
convertAllHtmlToMarkdown()
  .then(() => {
    console.log("\n✓ Conversion successful!");
    process.exit(0);
  })
  .catch(error => {
    console.error("\n✗ Conversion failed:", error);
    process.exit(1);
  });
