import { env, mediaUrl as rewriteMediaUrl } from "./env";

const DEFAULT_PAGE_SIZE = 100;

const headers = () => {
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

const applyQuery = (params: URLSearchParams, extras: Record<string, string | string[]>) => {
  for (const [key, value] of Object.entries(extras)) {
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
    } else if (value !== undefined && value !== null) {
      params.append(key, value);
    }
  }
};

export async function fetchAll(type: string, extraQuery: Record<string, string | string[]> = {}) {
  const results: any[] = [];
  let page = 1;

  while (true) {
    const params = new URLSearchParams();
    params.set("pagination[page]", String(page));
    params.set("pagination[pageSize]", String(DEFAULT_PAGE_SIZE));
    params.set("publicationState", "live");
    applyQuery(params, extraQuery);

    const url = `${env.strapiUrl}/api/${type}?${params.toString()}`;
    const response = await fetch(url, {
      headers: headers(),
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error(`Strapi request forbidden for ${type}. Check STRAPI_TOKEN_RO permissions.`);
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to fetch ${type}: ${response.status} ${text}`);
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
    "fields[0]": "title",
    "fields[1]": "slug",
    "fields[2]": "summary",
    "fields[3]": "body",
    "fields[4]": "publishedAt",
    "populate[2]": "children",
  });

export const getAllSections = () =>
  fetchAll("sections", {
    "fields[0]": "title",
    "fields[1]": "slug",
    "fields[2]": "order",
    populate: "deep",
  });

export const mediaUrl = rewriteMediaUrl;
