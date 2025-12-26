#!/usr/bin/env node

/**
 * Deployment Script - Copy markdown editing system to zeiler_me_pages repository
 * 
 * This script helps copy implementation files from zeiler_me_new to zeiler_me_pages
 * and prepares the EDIT folder for deployment.
 */

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const scriptsDir = path.dirname(__filename);
const repoRoot = path.resolve(scriptsDir, "..");

// Configuration
const config = {
  sourceRepo: path.resolve(repoRoot, "../zeiler_me_new"),
  targetRepo: path.resolve(repoRoot, "../zeiler_me_pages"),
  filesToCopy: [
    { source: "frontend/scripts/parse-edit-folder.mjs", target: "frontend/scripts/" },
    { source: "frontend/scripts/convert-html-to-markdown.mjs", target: "frontend/scripts/" },
    { source: "frontend/scripts/build-data.mjs", target: "frontend/scripts/" },
    { source: "frontend/package.json", target: "frontend/" },
    { source: "frontend/EDITING.md", target: "frontend/" },
    { source: "frontend/DEPLOYMENT.md", target: "frontend/" },
    { source: ".github/workflows/deploy-from-edit.yml", target: ".github/workflows/" },
    { source: "plans/markdown-editing-system-design.md", target: "plans/" },
    { source: "plans/markdown-editing-implementation-plan.md", target: "plans/" },
    { source: "IMPLEMENTATION_SUMMARY.md", target: "" },
  ],
};

console.log("🚀 Markdown Editing System Deployment Script\n");

// Check if source repository exists
console.log("📋 Checking source repository...");
if (!await fs.pathExists(config.sourceRepo)) {
  console.error(`❌ Source repository not found: ${config.sourceRepo}`);
  console.log("   Please clone zeiler_me_new repository first:");
  console.log("   git clone https://github.com/coinerd/zeiler_me_new.git");
  process.exit(1);
}
console.log(`✅ Source repository found: ${config.sourceRepo}`);

// Check if target repository exists
console.log("\n📋 Checking target repository...");
if (!await fs.pathExists(config.targetRepo)) {
  console.error(`❌ Target repository not found: ${config.targetRepo}`);
  console.log("   Please clone zeiler_me_pages repository first:");
  console.log("   git clone https://github.com/coinerd/zeiler_me_pages.git");
  process.exit(1);
}
console.log(`✅ Target repository found: ${config.targetRepo}`);

// Copy implementation files
console.log("\n📦 Copying implementation files...");
for (const file of config.filesToCopy) {
  const sourcePath = path.join(config.sourceRepo, file.source);
  const targetPath = path.join(config.targetRepo, file.target, path.basename(file.source));

  if (!await fs.pathExists(sourcePath)) {
    console.warn(`⚠️  Source file not found: ${file.source}`);
    continue;
  }

  try {
    await fs.copy(sourcePath, targetPath);
    console.log(`   ✅ ${file.source} → ${file.target}${path.basename(file.source)}`);
  } catch (error) {
    console.error(`   ❌ Error copying ${file.source}:`, error.message);
  }
}

// Install dependencies
console.log("\n📦 Installing dependencies...");
const packageJsonPath = path.join(config.targetRepo, "frontend/package.json");
if (await fs.pathExists(packageJsonPath)) {
  try {
    execSync("npm install", {
      cwd: path.join(config.targetRepo, "frontend"),
      stdio: "inherit",
    });
    console.log("✅ Dependencies installed");
  } catch (error) {
    console.warn("⚠️  Error installing dependencies:", error.message);
    console.log("   Please run manually: cd frontend && npm install");
  }
} else {
  console.warn("⚠️  package.json not found in target repository");
}

// Check if EDIT folder exists in target
console.log("\n📋 Checking EDIT folder...");
const editFolder = path.join(config.targetRepo, "EDIT");
if (await fs.pathExists(editFolder)) {
  console.log("✅ EDIT folder exists in target repository");
  
  // Count markdown files
  const mdFiles = await findMarkdownFiles(editFolder);
  console.log(`   Found ${mdFiles.length} markdown files`);
  
  if (mdFiles.length === 0) {
    console.log("\n⚠️  EDIT folder is empty!");
    console.log("   You need to prepopulate it with content.");
    console.log("\n   Option 1: Run HTML to markdown conversion:");
    console.log("      cd frontend && node scripts/convert-html-to-markdown.mjs");
    console.log("\n   Option 2: Create markdown files manually");
    console.log("      See frontend/EDITING.md for guidance");
  }
} else {
  console.log("❌ EDIT folder not found in target repository");
  console.log("   You need to create and populate it with content.");
  console.log("\n   Option 1: Run HTML to markdown conversion:");
  console.log("      cd frontend && node scripts/convert-html-to-markdown.mjs");
  console.log("\n   Option 2: Create markdown files manually");
  console.log("      See frontend/EDITING.md for guidance");
}

// Summary
console.log("\n" + "=".repeat(60));
console.log("✅ Deployment preparation complete!");
console.log("=".repeat(60));
console.log("\n📝 Next steps:");
console.log("   1. Populate EDIT folder with content (if not already done)");
console.log("   2. Test build locally:");
console.log("      cd zeiler_me_pages/frontend");
console.log("      USE_EDIT_FOLDER=true npm run build");
console.log("   3. Commit and push changes:");
console.log("      cd zeiler_me_pages");
console.log("      git add .");
console.log('      git commit -m "Add markdown-based editing system"');
console.log("      git push origin main");
console.log("   4. Monitor GitHub Actions deployment");
console.log("   5. Verify at https://coinerd.github.io/zeiler_me_pages/");
console.log("\n📚 Documentation:");
console.log("   - Quick start: README-DEPLOYMENT.md");
console.log("   - Detailed guide: DEPLOYMENT_GUIDE.md");
console.log("   - Complete plan: plans/deployment-to-live-plan.md");
console.log("   - Editing guide: frontend/EDITING.md");

// Helper function to find markdown files
async function findMarkdownFiles(dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}
