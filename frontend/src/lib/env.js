import fs from "fs";
import path from "path";
import dotenv from "dotenv";

const maybeLoadEnv = () => {
  const candidates = [
    path.resolve(process.cwd(), "cms", ".env"),
    path.resolve(process.cwd(), "..", "cms", ".env"),
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "..", ".env"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      dotenv.config({ path: candidate, override: false });
    }
  }
};

maybeLoadEnv();

const sanitize = (value) => (value ? value.trim() : "");

const STRAPI_URL = sanitize(process.env.STRAPI_URL);
const STRAPI_TOKEN_RO = sanitize(process.env.STRAPI_TOKEN_RO);
const SITE_URL = sanitize(process.env.SITE_URL);
const BASE_PATH = sanitize(process.env.BASE_PATH);

if (!STRAPI_URL) {
  throw new Error(
    "STRAPI_URL is required. Set it in cms/.env or export it before running Astro commands."
  );
}

export const env = {
  strapiUrl: STRAPI_URL.replace(/\/$/, ""),
  strapiTokenRO: STRAPI_TOKEN_RO,
  siteUrl: SITE_URL ? SITE_URL.replace(/\/$/, "") : "http://localhost:4321",
  basePath: BASE_PATH || "",
};

/**
 * Prefix a path with the base path for GitHub Pages subdirectory deployment
 * @param {string} p - The path to prefix
 * @returns {string} - The path with base path prepended
 */
export const prefixPath = (p) => {
  if (!p) return p;
  if (p.startsWith("http")) return p;
  if (p.startsWith("data:")) return p; // data URLs
  if (p.startsWith("#")) return p; // anchor links
  
  // Remove leading slash from base path if present
  const base = env.basePath.replace(/^\/+/, "");
  // Ensure path starts with slash
  const cleanPath = p.startsWith("/") ? p : `/${p}`;
  
  if (base) {
    return `/${base}${cleanPath}`;
  }
  return cleanPath;
};

export const mediaUrl = (url) => {
  if (!url) return url;
  if (/^https?:/i.test(url)) return url;
  if (url.startsWith("/")) {
    // /uploads/ images are now downloaded to public/uploads during build
    // Just prefix with base path for GitHub Pages deployment
    if (url.startsWith("/uploads/")) {
      return prefixPath(url);
    }
    // Prefix other local paths with base path for GitHub Pages deployment
    return prefixPath(url);
  }
  return url;
};
