#!/usr/bin/env node

/**
 * Download images from Strapi and save them to the public folder.
 * This ensures images are available when deployed to GitHub Pages.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Load environment variables
const rootEnv = path.join(projectRoot, '..', '.env');
const cmsEnv = path.join(projectRoot, '..', 'cms', '.env');
const frontendEnv = path.join(projectRoot, '.env');

if (fs.existsSync(rootEnv)) dotenv.config({ path: rootEnv, override: false });
if (fs.existsSync(cmsEnv)) dotenv.config({ path: cmsEnv, override: false });
if (fs.existsSync(frontendEnv)) dotenv.config({ path: frontendEnv, override: false });

const STRAPI_URL = process.env.STRAPI_URL?.replace(/\/$/, '');
const STRAPI_TOKEN_RO = process.env.STRAPI_TOKEN_RO;

if (!STRAPI_URL) {
  console.error('STRAPI_URL is not set. Skipping image download.');
  process.exit(0);
}

console.log(`Strapi URL: ${STRAPI_URL}`);
console.log(`Token present: ${!!STRAPI_TOKEN_RO}`);

// Read pages.json to find all image URLs
const pagesJsonPath = path.join(projectRoot, 'src', 'data', 'pages.json');
if (!fs.existsSync(pagesJsonPath)) {
  console.error('pages.json not found. Run build-data.mjs first.');
  process.exit(1);
}

const pages = JSON.parse(fs.readFileSync(pagesJsonPath, 'utf-8'));

// Collect all unique image URLs from Strapi
const imageUrls = new Set();

for (const page of pages) {
  if (Array.isArray(page.images)) {
    for (const img of page.images) {
      if (img.url && img.url.startsWith('/uploads/')) {
        imageUrls.add(img.url);
      }
    }
  }
}

console.log(`Found ${imageUrls.size} unique Strapi images to download.`);

if (imageUrls.size === 0) {
  console.log('No Strapi images to download. Exiting.');
  process.exit(0);
}

// Create public/uploads directory
const publicDir = path.join(projectRoot, 'public');
const uploadsDir = path.join(publicDir, 'uploads');
ensureDir(uploadsDir);

// Download images
async function downloadImage(urlPath) {
  const url = `${STRAPI_URL}${urlPath}`;
  const filename = path.basename(urlPath);
  const localPath = path.join(uploadsDir, filename);
  
  // Skip if file already exists
  if (fs.existsSync(localPath)) {
    console.log(`  ✓ Already exists: ${filename}`);
    return;
  }

  try {
    const headers = {};
    if (STRAPI_TOKEN_RO) {
      headers['Authorization'] = `Bearer ${STRAPI_TOKEN_RO}`;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      console.error(`  ✗ Failed to download ${filename}: ${response.status} ${response.statusText}`);
      return;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(localPath, buffer);
    console.log(`  ✓ Downloaded: ${filename}`);
  } catch (error) {
    console.error(`  ✗ Error downloading ${filename}:`, error.message);
  }
}

// Download all images
console.log('\nDownloading images...');
const downloadPromises = Array.from(imageUrls).map(downloadImage);
await Promise.all(downloadPromises);

console.log('\n✓ Image download completed.');
console.log(`Images saved to: ${uploadsDir}`);
