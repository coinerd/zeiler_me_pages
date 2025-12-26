#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Package content with all required dependencies
const packageJson = {
  "name": "frontend",
  "type": "module",
  "version": "0.0.1",
  "scripts": {
    "predev": "node ./scripts/build-data.mjs",
    "prebuild": "node ./scripts/build-data.mjs && node ./scripts/download-strapi-images.mjs",
    "dev": "astro dev",
    "build": "astro build",
    "postbuild": "node ./scripts/fix-asset-paths.mjs",
    "preview": "astro preview",
    "astro": "astro",
    "deploy": "node scripts/deploy.mjs"
  },
  "dependencies": {
    "@astrojs/check": "^0.9.6",
    "@astrojs/react": "^4.4.0",
    "@astrojs/sitemap": "^3.6.0",
    "@astrojs/tailwind": "^6.0.2",
    "@tailwindcss/typography": "^0.5.19",
    "astro": "^5.14.4",
    "axios": "^1.13.2",
    "dotenv": "^16.4.5",
    "fuse.js": "^7.1.0",
    "fs-extra": "^11.2.0",
    "gray-matter": "^4.0.3",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "rehype": "^13.0.2",
    "rehype-autolink-headings": "^7.1.0",
    "rehype-raw": "^7.0.0",
    "rehype-slug": "^6.0.0",
    "rehype-stringify": "^10.0.1",
    "remark": "^15.0.1",
    "remark-gfm": "^4.0.1",
    "remark-parse": "^11.0.0",
    "remark-rehype": "^11.1.2",
    "turndown": "^7.1.2",
    "typescript": "^5.9.3",
    "unified": "^11.0.5",
    "unist-util-visit": "^5.0.0"
  }
};

const packageJsonPath = path.join(projectRoot, 'package.json');
const packageLockPath = path.join(projectRoot, 'package-lock.json');

// Write package.json file
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');

// Delete old package-lock.json if it exists
if (fs.existsSync(packageLockPath)) {
  fs.unlinkSync(packageLockPath);
  console.log('✓ Old package-lock.json deleted');
}

console.log('✓ package.json regenerated successfully');
console.log('✓ All dependencies included (dotenv, fs-extra, gray-matter, turndown)');
console.log('✓ File written to:', packageJsonPath);
console.log('');
console.log('Next steps:');
console.log('1. Run: npm install');
console.log('2. Run: npm run build');
console.log('3. Commit both package.json and package-lock.json');
