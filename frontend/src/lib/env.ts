export * from "./env.js";
const sanitize = (value?: string | null) => (value ? value.trim() : "");

const STRAPI_URL = sanitize(process.env.STRAPI_URL);
const STRAPI_TOKEN_RO = sanitize(process.env.STRAPI_TOKEN_RO);
const SITE_URL = sanitize(process.env.SITE_URL);

if (!STRAPI_URL) {
  throw new Error(
    "STRAPI_URL is required. Set it in cms/.env or export it before running Astro commands."
  );
}

export const env = {
  strapiUrl: STRAPI_URL.replace(/\/$/, ""),
  strapiTokenRO: STRAPI_TOKEN_RO,
  siteUrl: SITE_URL ? SITE_URL.replace(/\/$/, "") : "http://localhost:4321",
};

export const mediaUrl = (path: string) => {
  if (!path) return path;
  if (/^https?:/i.test(path)) return path;
  if (path.startsWith("/")) {
    if (path.startsWith("/uploads/")) {
      return `${env.strapiUrl}${path}`;
    }
    return path;
  }
  return path;
};
