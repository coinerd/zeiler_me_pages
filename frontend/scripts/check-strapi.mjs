import axios from "axios";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

const root = path.resolve("..");
const envPaths = [path.join(root, ".env"), path.join(root, "cms", ".env")];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }
}

const baseURL = (process.env.STRAPI_URL || "http://localhost:1337").replace(/\/$/, "");
const token = process.env.STRAPI_TOKEN_RO || process.env.STRAPI_TOKEN;

const headers = token
  ? {
      Authorization: `Bearer ${token}`,
    }
  : {};

try {
  const res = await axios.get(`${baseURL}/api/pages?pagination[page]=1`, { headers });
  console.log("status", res.status);
} catch (error) {
  console.error("error", error.code || error.message);
}
