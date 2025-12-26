import { getAllPages } from "../src/lib/strapi.js";

const pages = await getAllPages();
const firstFive = pages.slice(0, 5).map((page) => ({
  id: page.id,
  title: page.title,
  slug: page.slug,
  route: page.route,
  section: page.section?.title,
}));

const withParent = pages.find((page) => !!page.parent);

console.log(JSON.stringify({ firstFive, parentShape: withParent?.parent ?? null }, null, 2));
