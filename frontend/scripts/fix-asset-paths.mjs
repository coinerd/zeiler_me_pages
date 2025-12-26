#!/usr/bin/env node

/**
 * Fix asset paths in built HTML files for GitHub Pages subdirectory deployment.
 * This script adds the BASE_PATH prefix to all asset URLs that are missing it.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the .env file to get the BASE_PATH
const envPath = path.join(__dirname, '..', '.env');
let basePath = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const match = envContent.match(/^BASE_PATH=(.+)$/m);
  if (match) {
    basePath = match[1].trim();
  }
}

// Only run if base path is set
if (!basePath) {
  console.log('BASE_PATH is not set. Skipping asset path fix.');
  process.exit(0);
}

// Remove leading slash if present for consistency
const normalizedBasePath = basePath.startsWith('/') ? basePath.slice(1) : basePath;

console.log(`Fixing asset paths with base path: /${normalizedBasePath}`);

// Get the dist directory path
const distDir = path.join(__dirname, '..', 'dist');

// Function to fix asset paths in a file
function fixAssetPathsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // Fix component-url attributes (only if not already prefixed)
    const componentUrlRegex = new RegExp(`component-url="\\/(?!${normalizedBasePath}/)assets/`, 'g');
    if (componentUrlRegex.test(content)) {
      content = content.replace(componentUrlRegex, `component-url="/${normalizedBasePath}/assets/`);
      modified = true;
    }
    
    // Fix renderer-url attributes (only if not already prefixed)
    const rendererUrlRegex = new RegExp(`renderer-url="\\/(?!${normalizedBasePath}/)assets/`, 'g');
    if (rendererUrlRegex.test(content)) {
      content = content.replace(rendererUrlRegex, `renderer-url="/${normalizedBasePath}/assets/`);
      modified = true;
    }
    
    // Fix href attributes for CSS files (only if not already prefixed)
    const hrefCssRegex = new RegExp(`href="\\/(?!${normalizedBasePath}/)assets/`, 'g');
    if (hrefCssRegex.test(content)) {
      content = content.replace(hrefCssRegex, `href="/${normalizedBasePath}/assets/`);
      modified = true;
    }
    
    // Fix src attributes for JS files (only if not already prefixed)
    const srcJsRegex = new RegExp(`src="\\/(?!${normalizedBasePath}/)assets/`, 'g');
    if (srcJsRegex.test(content)) {
      content = content.replace(srcJsRegex, `src="/${normalizedBasePath}/assets/`);
      modified = true;
    }
    
    // Fix favicon href (only if not already prefixed)
    const faviconRegex = new RegExp(`href="\\/(?!${normalizedBasePath}/)favicon\\.svg"`, 'g');
    if (faviconRegex.test(content)) {
      content = content.replace(faviconRegex, `href="/${normalizedBasePath}/favicon.svg"`);
      modified = true;
    }
    
    // Fix src attributes for images (only if not already prefixed and not external URLs)
    // Matches: src="/detlef/..." but not: src="/zeiler_me_pages/..." or src="http://..."
    const imgSrcRegex = new RegExp(`src="\\/(?!${normalizedBasePath}/)(?!https?:\\/\\/)(?!data:)([^"]+\\.(?:jpg|jpeg|png|gif|svg|webp|avif))"`, 'g');
    if (imgSrcRegex.test(content)) {
      content = content.replace(imgSrcRegex, `src="/${normalizedBasePath}/$1"`);
      modified = true;
    }
    
    // Fix href attributes for links (only if not already prefixed and not external URLs)
    // Matches: href="/detlef/..." but not: href="/zeiler_me_pages/..." or href="http://..." or href="#..."
    const linkHrefRegex = new RegExp(`href="\\/(?!${normalizedBasePath}/)(?!https?:\\/\\/)(?!#)(?!mailto:)([^"]+)"`, 'g');
    if (linkHrefRegex.test(content)) {
      content = content.replace(linkHrefRegex, `href="/${normalizedBasePath}/$1"`);
      modified = true;
    }

    // Write the modified content back to the file
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Fixed asset paths in: ${path.relative(distDir, filePath)}`);
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
  }
}

// Function to fix asset paths in JavaScript files (for dynamic imports)
function fixAssetPathsInJSFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // Fix dynamic import() calls with asset URLs
    // Matches: import("/assets/...") but not: import("/zeiler_me_pages/assets/...")
    const importRegex = new RegExp(`import\\("/(?!${normalizedBasePath}/)([^"]+)"`, 'g');
    if (importRegex.test(content)) {
      content = content.replace(importRegex, `import("/${normalizedBasePath}/$1"`);
      modified = true;
    }

    // Write modified content back to file
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Fixed asset paths in JS: ${path.relative(distDir, filePath)}`);
    }
  } catch (error) {
    console.error(`Error processing JS file ${filePath}:`, error.message);
  }
}

// Function to fix asset paths in CSS files
function fixAssetPathsInCSSFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // Fix href attributes for CSS files (only if not already prefixed)
    const hrefCssRegex = new RegExp(`href="\\/(?!${normalizedBasePath}/)assets/`, 'g');
    if (hrefCssRegex.test(content)) {
      content = content.replace(hrefCssRegex, `href="/${normalizedBasePath}/assets/`);
      modified = true;
    }

    // Write modified content back to file
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Fixed asset paths in CSS: ${path.relative(distDir, filePath)}`);
    }
  } catch (error) {
    console.error(`Error processing CSS file ${filePath}:`, error.message);
  }
}

// Function to recursively find and fix HTML and JS files
function fixAssetPathsInDirectory(dir) {
  try {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Recursively process subdirectories
        fixAssetPathsInDirectory(filePath);
      } else if (file.endsWith('.html')) {
        // Fix asset paths in HTML files
        fixAssetPathsInFile(filePath);
      } else if (file.endsWith('.js')) {
        // Fix asset paths in JavaScript files (for dynamic imports)
        fixAssetPathsInJSFile(filePath);
      } else if (file.endsWith('.css')) {
        // Fix asset paths in CSS files
        fixAssetPathsInCSSFile(filePath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dir}:`, error.message);
  }
}

// Start fixing asset paths
if (fs.existsSync(distDir)) {
  fixAssetPathsInDirectory(distDir);
  console.log('Asset path fix completed.');
} else {
  console.error(`Dist directory not found: ${distDir}`);
  process.exit(1);
}
