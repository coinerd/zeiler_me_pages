#!/usr/bin/env node

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const scriptsDir = path.dirname(__filename);
const projectRoot = path.resolve(scriptsDir, "..");
const repoRoot = path.resolve(projectRoot, "..");
const editFolder = path.join(repoRoot, "EDIT");

const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// Recursively scan directory for markdown files
async function scanDirectory(dir, basePath = "") {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);

    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      const subFiles = await scanDirectory(fullPath, relativePath);
      files.push(...subFiles);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push({
        path: fullPath,
        relativePath: relativePath.replace(/\\/g, '/'),
      });
    }
  }

  return files;
}

// Find and move images for a markdown file
async function findAndMoveImages(markdownFile) {
  const fileDir = path.dirname(markdownFile.path);
  const baseName = path.basename(markdownFile.relativePath, '.md');
  const parentDir = path.dirname(fileDir);
  const parentDirName = path.basename(parentDir);
  
  let movedCount = 0;
  
  console.log(`\nProcessing: ${markdownFile.relativePath}`);
  console.log(`  Base name: ${baseName}`);
  console.log(`  File dir: ${fileDir}`);
  console.log(`  Parent dir: ${parentDir}`);
  console.log(`  Parent dir name: ${parentDirName}`);
  
  // Check if parent directory exists and is different from file directory
  if (parentDir !== fileDir && fs.existsSync(parentDir)) {
    // Look for images in parent directory
    const parentEntries = await fs.readdir(parentDir, { withFileTypes: true });
    
    // Try images named after markdown file
    for (let i = 1; i <= 10; i++) {
      for (const ext of imageExtensions) {
        const imageName = `${baseName}-${i}${ext}`;
        
        // Check if image exists in parent directory
        const imageEntry = parentEntries.find(e => e.name === imageName);
        
        if (imageEntry) {
          const sourcePath = path.join(parentDir, imageName);
          const targetPath = path.join(fileDir, imageName);
          
          // Check if target already exists
          if (fs.existsSync(targetPath)) {
            console.log(`  Skipping ${imageName} (already exists in target)`);
            continue;
          }
          
          // Move the image
          await fs.move(sourcePath, targetPath);
          console.log(`  Moved: ${imageName}`);
          movedCount++;
        }
      }
    }
    
    // Also try images named after parent directory (for cases like mein-grovater-rudolf-zeiler/rudolf-zeiler.md)
    for (let i = 1; i <= 10; i++) {
      for (const ext of imageExtensions) {
        const imageName = `${parentDirName}-${i}${ext}`;
        
        // Check if image exists in parent directory
        const imageEntry = parentEntries.find(e => e.name === imageName);
        
        if (imageEntry) {
          const sourcePath = path.join(parentDir, imageName);
          const targetPath = path.join(fileDir, imageName);
          
          // Check if target already exists
          if (fs.existsSync(targetPath)) {
            console.log(`  Skipping ${imageName} (already exists in target)`);
            continue;
          }
          
          // Move the image
          await fs.move(sourcePath, targetPath);
          console.log(`  Moved: ${imageName}`);
          movedCount++;
        }
      }
    }
  }
  
  // Also check for images in the SAME directory as the markdown file
  if (fs.existsSync(fileDir)) {
    const fileEntries = await fs.readdir(fileDir, { withFileTypes: true });
    
    // Try images named after markdown file in the same directory
    for (let i = 1; i <= 10; i++) {
      for (const ext of imageExtensions) {
        const imageName = `${baseName}-${i}${ext}`;
        
        // Check if image exists in the same directory
        const imageEntry = fileEntries.find(e => e.name === imageName);
        
        if (imageEntry) {
          // Image is already in the correct location
          console.log(`  Image ${imageName} already in correct location`);
          movedCount++;
        }
      }
    }
  }
  
  return movedCount;
}

// Main function
async function main() {
  console.log("Scanning EDIT folder for markdown files...");
  const markdownFiles = await scanDirectory(editFolder);
  console.log(`Found ${markdownFiles.length} markdown files`);
  
  let totalMoved = 0;
  
  for (const markdownFile of markdownFiles) {
    const moved = await findAndMoveImages(markdownFile);
    totalMoved += moved;
  }
  
  console.log(`\nTotal images moved/found: ${totalMoved}`);
}

main().catch(error => {
  console.error("Error:", error);
  process.exit(1);
});
