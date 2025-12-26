/**
 * deploy.mjs - Deploy frontend dist folder to GitHub Pages
 * 
 * This script avoids the ENAMETOOLONG error by using git operations
 * directly instead of the gh-pages npm package.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');

console.log('🚀 Deploying to GitHub Pages...\n');

// Check if dist directory exists
if (!fs.existsSync(distDir)) {
  console.error('❌ Error: dist directory not found. Run "npm run build" first.');
  process.exit(1);
}

// Get list of files to deploy
const files = fs.readdirSync(distDir);
console.log(`📦 Found ${files.length} files in dist folder\n`);

// Create a temporary directory for git operations
const tempDir = path.join(__dirname, '..', '.deploy-temp');
const deployDir = path.join(tempDir, 'deploy');

try {
  // Clean up any previous deployment
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  fs.mkdirSync(deployDir, { recursive: true });

  // Copy dist contents to deploy directory
  console.log('📋 Copying dist files...');
  for (const file of files) {
    const src = path.join(distDir, file);
    const dest = path.join(deployDir, file);
    copyRecursive(src, dest);
  }

  // Create .nojekyll file to disable Jekyll processing
  // This is needed because Jekyll ignores directories starting with underscore (like _astro)
  console.log('📝 Creating .nojekyll file...');
  fs.writeFileSync(path.join(deployDir, '.nojekyll'), '');

  // Initialize git repo in deploy directory
  console.log('🔧 Initializing git repository...');
  execSync('git init', { cwd: deployDir, stdio: 'pipe' });
  execSync('git config user.name "GitHub Actions"', { cwd: deployDir, stdio: 'pipe' });
  execSync('git config user.email "actions@github.com"', { cwd: deployDir, stdio: 'pipe' });

  // Add remote origin for coinerd/zeiler_me_pages
  console.log('🔗 Setting up remote origin...');
  execSync('git remote add origin https://github.com/coinerd/zeiler_me_pages.git', { cwd: deployDir, stdio: 'pipe' });

  // Add all files and commit
  console.log('📝 Committing changes...');
  execSync('git add -A', { cwd: deployDir, stdio: 'pipe' });
  execSync('git commit -m "Deploy to GitHub Pages"', { cwd: deployDir, stdio: 'pipe' });

  // Push to gh-pages branch (force push to handle large file counts)
  console.log('🚀 Deploying to GitHub Pages...');
  execSync('git push -f origin HEAD:gh-pages', {
    cwd: deployDir,
    stdio: 'pipe',
    env: { ...process.env, GIT_ASKPASS: 'echo' }
  });

  console.log('\n✅ Deployment complete!');
  console.log('   Your site will be available at: https://coinerd.github.io/zeiler_me_pages/');
  console.log('   Note: It may take a few minutes for the site to be available.\n');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
} finally {
  // Clean up temporary directory
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

/**
 * Recursively copy files and directories
 */
function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const files = fs.readdirSync(src);
    for (const file of files) {
      copyRecursive(path.join(src, file), path.join(dest, file));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}
