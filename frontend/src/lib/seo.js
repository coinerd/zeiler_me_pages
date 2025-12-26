import { env, prefixPath } from "./env.js";

const SITE_NAME = "zeiler.me";
const DEFAULT_DESCRIPTION = "Artikel und Projekte von Detlef und Julian Zeiler - IT, Medien, Geschichte, Deutsch";
const SITE_URL = env.siteUrl;

/**
 * Build comprehensive SEO metadata for a page
 */
export const buildPageMeta = ({
  title,
  description,
  path = "/",
  image,
  publishedAt,
  updatedAt,
  author,
  type = "article",
}) => {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const safeDescription = description && description.trim().length > 0
    ? description.trim()
    : DEFAULT_DESCRIPTION;
  const canonical = `${SITE_URL.replace(/\/$/, "")}${prefixPath(path)}`;

  // Determine Open Graph image URL
  const ogImage = image
    ? image.startsWith("http") ? image : `${SITE_URL}${image}`
    : undefined;

  // Build schema.org structured data
  const schema = buildSchema({
    title: pageTitle,
    description: safeDescription,
    url: canonical,
    image: ogImage,
    publishedAt,
    updatedAt,
    author: author || "Detlef und Julian Zeiler",
    type,
  });

  return {
    title: pageTitle,
    description: safeDescription,
    canonical,
    schema,
    openGraph: {
      type,
      title: pageTitle,
      description: safeDescription,
      url: canonical,
      siteName: SITE_NAME,
      locale: "de_DE",
      image: ogImage,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: pageTitle,
      description: safeDescription,
      image: ogImage,
    },
  };
};

/**
 * Build Schema.org structured data
 */
const buildSchema = ({
  title,
  description,
  url,
  image,
  publishedAt,
  updatedAt,
  author,
  type,
}) => {
  const siteUrl = SITE_URL.replace(/\/$/, "");
  const mainEntity = {
    "@type": type === "homepage" ? "WebSite" : "WebPage",
    "@id": `${siteUrl}${prefixPath("/")}#website`,
    url: `${siteUrl}${prefixPath("/")}`,
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  };

  const pageSchema = {
    "@type": type === "homepage" ? "WebSite" : type === "article" ? "Article" : "WebPage",
    "@context": "https://schema.org",
    headline: title.replace(` | ${SITE_NAME}`, ""),
    description,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    author: {
      "@type": "Person",
      name: author,
      url: `${siteUrl}${prefixPath("/julian/about-me.html")}`,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}${prefixPath("/favicon.svg")}`,
      },
    },
  };

  // Add datePublished if available
  if (publishedAt) {
    pageSchema.datePublished = new Date(publishedAt).toISOString();
  }

  // Add dateModified if available
  if (updatedAt) {
    pageSchema.dateModified = new Date(updatedAt).toISOString();
  } else if (publishedAt) {
    pageSchema.dateModified = new Date(publishedAt).toISOString();
  }

  // Add image if available
  if (image) {
    pageSchema.image = {
      "@type": "ImageObject",
      url: image,
    };
  }

  // Return breadcrumb schema if path indicates hierarchy
  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    "@context": "https://schema.org",
    itemListElement: [],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [mainEntity, pageSchema, breadcrumbSchema],
  };
};

/**
 * Build breadcrumb schema from breadcrumb items
 */
export const buildBreadcrumbSchema = (items) => {
  return {
    "@type": "BreadcrumbList",
    "@context": "https://schema.org",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.title,
      item: item.path.startsWith("http")
        ? item.path
        : `${SITE_URL.replace(/\/$/, "")}${prefixPath(item.path)}`,
    })),
  };
};

/**
 * Generate sitemap entries
 */
export const generateSitemapEntries = (pages) => {
  const siteUrl = SITE_URL.replace(/\/$/, "");

  return pages.map((page) => ({
    url: `${siteUrl}${prefixPath(page.path)}`,
    lastmod: page.updatedAt || page.publishedAt,
    changefreq: "weekly",
    priority: page.path === "/" ? 1.0 : 0.8,
  }));
};
