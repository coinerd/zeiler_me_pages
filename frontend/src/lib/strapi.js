import { env, mediaUrl as rewriteMediaUrl } from "./env.js";

const DEFAULT_PAGE_SIZE = 100;

const buildHeaders = () => {
  const base = {
    Accept: "application/json",
  };
  if (env.strapiTokenRO) {
    return {
      ...base,
      Authorization: `Bearer ${env.strapiTokenRO}`,
    };
  }
  return base;
};

const applyQuery = (params, extras, prefix = "") => {
  Object.entries(extras).forEach(([key, value]) => {
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (Array.isArray(value)) {
      value.forEach((entry, index) => {
        if (typeof entry === "object" && entry !== null) {
          applyQuery(params, entry, `${fullKey}[${index}]`);
        } else {
          params.append(`${fullKey}[${index}]`, entry);
        }
      });
    } else if (typeof value === "object" && value !== null) {
      applyQuery(params, value, fullKey);
    } else if (value !== undefined && value !== null) {
      params.append(fullKey, value);
    }
  });
};

export async function fetchAll(type, extraQuery = {}) {
  const results = [];
  let page = 1;

  while (true) {
    const params = new URLSearchParams();
    params.set("pagination[page]", String(page));
    params.set("pagination[pageSize]", String(DEFAULT_PAGE_SIZE));
    params.set("publicationState", "live");
    applyQuery(params, extraQuery);

    const url = `${env.strapiUrl}/api/${type}?${params.toString()}`;
    console.log(`Fetching: ${url}`);

    const response = await fetch(url, {
      headers: buildHeaders(),
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error(`Strapi request forbidden for ${type}. Check STRAPI_TOKEN_RO permissions.`);
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to fetch ${type}: ${response.status} ${text.substring(0, 200)}`);
    }

    const payload = await response.json();
    const data = Array.isArray(payload?.data) ? payload.data : [];
    const pagination = payload?.meta?.pagination;

    results.push(...data);

    if (!pagination || page >= pagination.pageCount) {
      break;
    }

    page += 1;
  }

  return results;
}

export const getAllPages = () =>
  fetchAll("pages", {
    "populate[0]": "parent",
    "populate[1]": "section",
    "populate[2]": "images",
    "populate[3]": "imageMetadata",
  });

export const getAllSections = () =>
  fetchAll("sections", {
    "fields[0]": "title",
    "fields[1]": "slug",
    "fields[2]": "order",
    "fields[3]": "intro",
  });

export const mediaUrl = rewriteMediaUrl;
