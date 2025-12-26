import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import { mediaUrl, prefixPath } from "./env.js";

/**
 * Rewrite media URLs (images and links)
 * Ensures local paths are prefixed correctly and Strapi URLs are resolved
 */
const rewriteUploads = () => (tree) => {
  visit(tree, "element", (node) => {
    if (!node.properties) return;

    // Handle images
    if (node.tagName === "img" && typeof node.properties.src === "string") {
      let src = node.properties.src;
      // Ensure local paths start with /
      if (!src.startsWith("/") && !/^https?:/i.test(src) && !/^data:/i.test(src)) {
        src = "/" + src;
      }
      node.properties.src = mediaUrl(src);
      // Add lazy loading and accessibility attributes
      node.properties.loading = node.properties.loading || "lazy";
      node.properties.decoding = node.properties.decoding || "async";
      node.properties.referrerPolicy = node.properties.referrerPolicy || "no-referrer";
      // Add alt text validation warning if missing
      if (!node.properties.alt) {
        node.properties.alt = "";
      }
    }

    // Handle links
    if (node.tagName === "a" && typeof node.properties.href === "string") {
      const href = node.properties.href;
      // Skip external links, data URLs, and anchor links
      if (/^https?:\/\//i.test(href) || /^data:/i.test(href) || href.startsWith("#")) {
        // External links get target=_blank
        if (/^https?:\/\//i.test(href)) {
          node.properties.target = "_blank";
          node.properties.rel = "noopener noreferrer";
          node.properties.class = node.properties.class
            ? `${node.properties.class} external-link`
            : "external-link";
        }
        return;
      }
      // Local paths - prefix with base path
      node.properties.href = prefixPath(href);
    }
  });
};

/**
 * Transform YouTube URLs to embed iframes
 * Supports:
 * - youtube.com/watch?v=ID
 * - youtu.be/ID
 * - youtube.com/embed/ID
 */
const youtubeEmbed = () => (tree) => {
  visit(tree, "element", (node) => {
    if (!node.properties) return;

    // Check for YouTube links that should become embeds
    if (node.tagName === "a" && typeof node.properties.href === "string") {
      const youtubeMatch = node.properties.href.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
      );

      if (youtubeMatch) {
        const videoId = youtubeMatch[1];
        // Replace the anchor with an iframe
        node.tagName = "div";
        node.properties.class = "video-embed";
        node.children = [
          {
            type: "element",
            tagName: "iframe",
            properties: {
              src: `https://www.youtube.com/embed/${videoId}`,
              allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
              allowfullscreen: true,
              title: `YouTube video: ${videoId}`,
            },
            children: [],
          },
        ];
      }
    }

    // Handle direct YouTube iframes in raw HTML
    if (node.tagName === "iframe" && typeof node.properties.src === "string") {
      if (node.properties.src.includes("youtube.com/embed") || node.properties.src.includes("youtu.be")) {
        node.properties.class = node.properties.class
          ? `${node.properties.class} youtube-embed`
          : "youtube-embed";
        node.properties.allow = node.properties.allow || "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        node.properties.allowfullscreen = node.properties.allowfullscreen || true;
      }
    }
  });
};

/**
 * Add figure wrapper around images with captions
 * Detects captions from alt text (pattern: "caption: text")
 */
const figureWrapper = () => (tree) => {
  visit(tree, "element", (node, index, parent) => {
    if (!parent || node.tagName !== "img") return;

    const alt = node.properties.alt || "";
    const captionMatch = alt.match(/^caption:\s*(.+)$/i);

    if (captionMatch) {
      // Remove caption prefix from alt
      node.properties.alt = captionMatch[1].trim();

      // Wrap image in figure
      const figure = {
        type: "element",
        tagName: "figure",
        properties: { class: "image-with-caption" },
        children: [node],
      };

      // Add figcaption
      const figcaption = {
        type: "element",
        tagName: "figcaption",
        properties: {},
        children: [{ type: "text", value: captionMatch[1].trim() }],
      };
      figure.children.push(figcaption);

      // Replace the original image with the figure
      parent.children[index] = figure;
    } else {
      // Add default figure wrapper for styling
      const figure = {
        type: "element",
        tagName: "figure",
        properties: { class: "image-wrapper" },
        children: [node],
      };
      parent.children[index] = figure;
    }
  });
};

/**
 * Handle Google Drive embeds (folder views, documents, etc.)
 */
const googleDriveEmbed = () => (tree) => {
  visit(tree, "element", (node) => {
    if (!node.properties) return;

    if (node.tagName === "a" && typeof node.properties.href === "string") {
      // Check for Google Drive links
      const driveMatch = node.properties.href.match(
        /(?:drive\.google\.com|docs\.google\.com)\/(?:file\/d\/|folderview\?id=|document\/d\/|presentation\/d\/)([a-zA-Z0-9_-]+)/
      );

      if (driveMatch) {
        const embedType = node.properties.href.includes("folderview")
          ? "folder"
          : node.properties.href.includes("presentation")
          ? "presentation"
          : "file";

        const id = driveMatch[1];

        node.tagName = "div";
        node.properties.class = `google-drive-embed ${embedType}`;

        if (embedType === "folder") {
          node.children = [
            {
              type: "element",
              tagName: "iframe",
              properties: {
                src: `https://drive.google.com/embeddedfolderview?id=${id}`,
                width: "100%",
                height: "400",
                frameborder: "0",
                title: "Google Drive folder",
              },
              children: [],
            },
          ];
        } else if (embedType === "presentation") {
          node.children = [
            {
              type: "element",
              tagName: "iframe",
              properties: {
                src: `https://docs.google.com/presentation/d/${id}/embed`,
                width: "960",
                height: "569",
                frameborder: "0",
                title: "Google Slides presentation",
              },
              children: [],
            },
          ];
        } else {
          // File preview link
          node.children = [
            {
              type: "element",
              tagName: "a",
              properties: {
                href: node.properties.href,
                target: "_blank",
                rel: "noopener noreferrer",
                class: "drive-file-link",
              },
              children: [{ type: "text", value: "View file on Google Drive" }],
            },
          ];
        }
      }
    }
  });
};

/**
 * Sanitize HTML - remove potentially dangerous elements/attributes
 */
const sanitizeHtml = () => (tree) => {
  const dangerousTags = ["script", "style"];
  const dangerousAttrs = ["onclick", "onload", "onerror", "onmouseover"];

  visit(tree, "element", (node) => {
    // Remove dangerous tags
    if (dangerousTags.includes(node.tagName)) {
      node.tagName = "div";
      node.children = [];
      return;
    }

    // Allow iframes only if they are from trusted sources (YouTube, Google Drive)
    if (node.tagName === "iframe") {
      const src = node.properties?.src || "";
      const isTrusted =
        src.includes("youtube.com/embed") ||
        src.includes("youtu.be") ||
        src.includes("drive.google.com") ||
        src.includes("docs.google.com");

      if (!isTrusted) {
        node.tagName = "div";
        node.children = [];
        return;
      }
    }

    // Remove dangerous attributes
    if (node.properties) {
      dangerousAttrs.forEach((attr) => {
        if (node.properties[attr]) {
          delete node.properties[attr];
        }
      });
    }
  });
};

export const renderMarkdown = async (markdown) => {
  if (!markdown) return "";

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rewriteUploads)
    .use(youtubeEmbed)
    .use(googleDriveEmbed)
    .use(figureWrapper)
    .use(sanitizeHtml)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "wrap",
      properties: {
        class: "heading-anchor",
      },
    })
    .use(rehypeStringify)
    .process(markdown);

  return String(file);
};

/**
 * Extract metadata from markdown for SEO purposes
 * Returns: { headings: string[], links: string[], images: object[] }
 */
export const extractMarkdownMetadata = (markdown) => {
  if (!markdown) return { headings: [], links: [], images: [] };

  const headings = [];
  const links = [];
  const images = [];

  // Simple regex-based extraction (could be enhanced with AST)
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;

  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2].trim(),
    });
  }

  while ((match = linkRegex.exec(markdown)) !== null) {
    links.push({
      text: match[1],
      url: match[2],
    });
  }

  while ((match = imageRegex.exec(markdown)) !== null) {
    images.push({
      alt: match[1] || "",
      src: match[2],
    });
  }

  return { headings, links, images };
};

export { mediaUrl };
