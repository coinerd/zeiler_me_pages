#!/usr/bin/env node

/**
 * Fix Windows line endings in deployment folder
 * Converts \r\n (Windows) to \n (Unix) for all .md files
 */

import fs from 'fs-extra';
import path from 'path';

const DEPLOYMENT_EDIT_FOLDER = 'C:/Users/julia/zeiler-deployment/zeiler_me_pages/EDIT';

/**
 * Recursively convert line endings in all .md files
 */
async function convertLineEndings(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await convertLineEndings(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      console.log(`Processing: ${fullPath}`);
      
      try {
        // Read file as string
        const content = await fs.readFile(fullPath, 'utf8');
        
        // Check if file has Windows line endings
        if (content.includes('\r\n')) {
          // Convert \r\n to \n
          const normalizedContent = content.replace(/\r\n/g, '\n');
          
          // Write back with Unix line endings
          await fs.writeFile(fullPath, normalizedContent, 'utf8');
          console.log(`  ✓ Converted Windows line endings to Unix`);
        } else {
          console.log(`  - Already has Unix line endings`);
        }
      } catch (error) {
        console.error(`  ✗ Error processing ${fullPath}:`, error.message);
      }
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Converting Windows line endings to Unix line endings...');
  console.log(`Deployment EDIT folder: ${DEPLOYMENT_EDIT_FOLDER}`);
  console.log('');
  
  try {
    await convertLineEndings(DEPLOYMENT_EDIT_FOLDER);
    console.log('');
    console.log('✓ Line ending conversion completed successfully!');
  } catch (error) {
    console.error('✗ Error during line ending conversion:', error);
    process.exit(1);
  }
}

main();
