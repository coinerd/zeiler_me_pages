// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

const site = process.env.SITE_URL && process.env.SITE_URL.trim().length > 0
  ? process.env.SITE_URL.trim().replace(/\/$/, '')
  : 'http://localhost:4321';

// Extract base path from SITE_URL for GitHub Pages subdirectory deployment
// For local development: BASE_PATH=/ (or not set)
// For GitHub Pages: BASE_PATH=/zeiler_me_pages
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
    sitemap(),
  ],
  // Configure build output
  build: {
    // Use 'assets' instead of '_astro' to avoid Jekyll ignoring the directory
    // Jekyll ignores directories starting with underscore
    assets: 'assets',
  },
  // Configure Vite base path for asset URLs
  vite: {
    base: base === '/' ? '/' : `${base}/`,
  },
});
