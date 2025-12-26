#!/usr/bin/env node

/**
 * Copy images from EDIT folder to public folder.
 * This ensures images are available when deployed to GitHub Pages.
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const scriptsDir = path.dirname(__filename);
const projectRoot = path.resolve(scriptsDir, '..');
const repoRoot = path.resolve(projectRoot, '..');

// Load environment variables
const frontendEnv = path.join(projectRoot, '.env');
if (fs.existsSync(frontendEnv)) {
  dotenv.config({ path: frontendEnv, override: false });
}

const editFolder = path.join(repoRoot, 'EDIT');
const publicDir = path.join(projectRoot, 'public');

console.log('Copying images from EDIT folder to public folder...');

// Ensure public directory exists
await fs.ensureDir(publicDir);

// Recursively copy all image files from EDIT to public
async function copyImages(dir, baseDir = '') {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(baseDir, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy images from subdirectories
      await copyImages(fullPath, relativePath);
    } else if (entry.isFile()) {
      // Check if file is an image
      const ext = path.extname(entry.name).toLowerCase();
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

      if (imageExtensions.includes(ext)) {
        const destPath = path.join(publicDir, relativePath);
        const destDir = path.dirname(destPath);

        // Ensure destination directory exists
        await fs.ensureDir(destDir);

        // Copy the image
        await fs.copy(fullPath, destPath);
        console.log(`  ✓ Copied: ${relativePath}`);
      }
    }
  }
}

try {
  await copyImages(editFolder);
  console.log('\n✓ Image copy completed.');
  console.log(`Images copied to: ${publicDir}`);
} catch (error) {
  console.error('Error copying images:', error);
  process.exit(1);
}
