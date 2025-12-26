# Final Deployment Guide - Markdown-Based Editing System

## 🎯 Goal

Deploy the markdown-based editing system from **zeiler_me_new** (development) to **zeiler_me_pages** (production) and prepopulate EDIT folder with current content to match the live site at https://coinerd.github.io/zeiler_me_pages/.

## 📍 Repository Locations

| Repository | URL | Status |
|-------------|-----|--------|
| zeiler_me_new | https://github.com/coinerd/zeiler_me_new | ✅ Implementation complete |
| zeiler_me_pages | https://github.com/coinerd/zeiler_me_pages | ⏳ Needs deployment |
| GitHub Pages | https://coinerd.github.io/zeiler_me_pages/ | 🌐 Live site |

## 📋 What Has Been Implemented

The following components have been created in zeiler_me_new:

### Core Scripts
- ✅ [`frontend/scripts/parse-edit-folder.mjs`](frontend/scripts/parse-edit-folder.mjs) - Parses markdown files
- ✅ [`frontend/scripts/convert-html-to-markdown.mjs`](frontend/scripts/convert-html-to-markdown.mjs) - Converts HTML to markdown
- ✅ [`frontend/scripts/build-data.mjs`](frontend/scripts/build-data.mjs) - Modified for dual-source

### GitHub Actions
- ✅ [`.github/workflows/deploy-from-edit.yml`](.github/workflows/deploy-from-edit.yml) - Auto-deploys EDIT folder changes

### Dependencies
- ✅ [`frontend/package.json`](frontend/package.json) - Updated with gray-matter and turndown

### Documentation
- ✅ [`frontend/EDITING.md`](frontend/EDITING.md) - Complete editing guide
- ✅ [`frontend/DEPLOYMENT.md`](frontend/DEPLOYMENT.md) - Updated deployment docs
- ✅ [`plans/markdown-editing-system-design.md`](plans/markdown-editing-system-design.md) - System design
- ✅ [`plans/markdown-editing-implementation-plan.md`](plans/markdown-editing-implementation-plan.md) - Implementation plan
- ✅ [`IMPLEMENTATION_SUMMARY.md`](IMPLEMENTATION_SUMMARY.md) - Implementation summary

### Deployment Guides
- ✅ [`README-DEPLOYMENT.md`](README-DEPLOYMENT.md) - Quick start guide
- ✅ [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md) - Detailed deployment guide
- ✅ [`plans/deployment-to-live-plan.md`](plans/deployment-to-live-plan.md) - Complete deployment plan
- ✅ [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md) - Comprehensive checklist
- ✅ [`scripts/deploy-to-live.mjs`](scripts/deploy-to-live.mjs) - Deployment automation script

### Example Files
- ✅ [`EDIT/index.md`](EDIT/index.md) - Homepage example
- ✅ [`EDIT/detlef/index.md`](EDIT/detlef/index.md) - Detlef section example
- ✅ [`EDIT/detlef/deutsch.md`](EDIT/detlef/deutsch.md) - Deutsch section example
- ✅ [`EDIT/julian/index.md`](EDIT/julian/index.md) - Julian section example

## 🚀 Deployment Steps

### Step 1: Clone Both Repositories

```bash
# Create a working directory
mkdir ~/zeiler-deployment
cd ~/zeiler-deployment

# Clone both repositories
git clone https://github.com/coinerd/zeiler_me_new.git
git clone https://github.com/coinerd/zeiler_me_pages.git

# Verify both are cloned
ls -la
# Should show zeiler_me_new and zeiler_me_pages directories
```

### Step 2: Copy Implementation Files to zeiler_me_pages

**Option A: Manual Copy**

```bash
cd ~/zeiler-deployment/zeiler_me_pages

# Copy frontend files
cp -r ../zeiler_me_new/frontend/* frontend/

# Copy GitHub Actions workflow
cp ../zeiler_me_new/.github/workflows/deploy-from-edit.yml .github/workflows/

# Copy documentation
cp ../zeiler_me_new/frontend/EDITING.md frontend/
cp ../zeiler_me_new/frontend/DEPLOYMENT.md frontend/
cp ../zeiler_me_new/IMPLEMENTATION_SUMMARY.md .
cp -r ../zeiler_me_new/plans/* plans/

# Verify files are copied
ls -la frontend/scripts/
ls -la .github/workflows/
```

**Option B: Use Deployment Script**

```bash
cd ~/zeiler-deployment
node ../zeiler_me_new/scripts/deploy-to-live.mjs
```

This script will:
- Copy all implementation files automatically
- Check for EDIT folder
- Install dependencies
- Provide next steps

### Step 3: Install Dependencies

```bash
cd ~/zeiler-deployment/zeiler_me_pages/frontend
npm install
```

Verify:
- [ ] `node_modules` folder created
- [ ] No npm errors

### Step 4: Prepopulate EDIT Folder with Current Content

**Option A: Automatic Conversion (Recommended)**

```bash
cd ~/zeiler-deployment/zeiler_me_pages/frontend

# Run conversion script
node scripts/convert-html-to-markdown.mjs
```

This will:
1. Scan `frontend/public/` for HTML files
2. Extract metadata (title, description, images)
3. Convert HTML body to markdown
4. Create markdown files in `EDIT/` folder
5. Copy images to `EDIT/` folder

**Option B: Manual Creation**

If automatic conversion doesn't work or you prefer manual control:

1. **Create folder structure:**
   ```bash
   cd ~/zeiler-deployment/zeiler_me_pages
   mkdir -p EDIT/detlef/deutsch
   mkdir -p EDIT/detlef/geschichte
   mkdir -p EDIT/detlef/medien
   mkdir -p EDIT/detlef/projekte
   mkdir -p EDIT/julian/artikel
   mkdir -p EDIT/julian/techzap
   mkdir -p EDIT/julian/work
   ```

2. **Create markdown files** based on current site content:
   - Navigate to https://coinerd.github.io/zeiler_me_pages/
   - For each page, create corresponding markdown file
   - Use frontmatter schema:
     ```yaml
     ---
     title: Page Title
     summary: Brief summary
     publishedAt: 2024-01-15
     order: 10
     section: deutsch
     images:
       - url: image-1.jpg
         alt: Image description
     ---
     
     # Page Content
     
     Markdown content goes here...
     ```

3. **Copy images** from `frontend/public/` to `EDIT/`:
   ```bash
   cd ~/zeiler-deployment/zeiler_me_pages
   
   # Copy all images
   cp -r frontend/public/detlef/*.jpg EDIT/detlef/
   cp -r frontend/public/detlef/**/*.jpg EDIT/detlef/
   cp -r frontend/public/julian/*.jpg EDIT/julian/
   cp -r frontend/public/julian/**/*.jpg EDIT/julian/
   ```

**Verify:**
- [ ] EDIT folder is populated with markdown files
- [ ] Images are copied to EDIT folder
- [ ] Frontmatter is correct in converted files
- [ ] File structure matches expected layout

### Step 5: Test Build Locally

```bash
cd ~/zeiler-deployment/zeiler_me_pages/frontend

# Build from EDIT folder
USE_EDIT_FOLDER=true npm run build

# Preview the site
npm run preview
```

**Verify:**
- [ ] Build completes without errors
- [ ] `src/data/pages.json` is generated
- [ ] `src/data/nav.json` is generated
- [ ] Preview site at http://localhost:4321
- [ ] All pages render correctly
- [ ] Navigation structure matches expected
- [ ] Images load properly
- [ ] Breadcrumbs work correctly

### Step 6: Commit Changes

```bash
cd ~/zeiler-deployment/zeiler_me_pages

# Check what will be committed
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "Add markdown-based editing system

- Add EDIT folder with converted content
- Add parse-edit-folder.mjs script
- Add convert-html-to-markdown.mjs script
- Update build-data.mjs for dual-source support
- Add deploy-from-edit.yml GitHub Actions workflow
- Add documentation (EDITING.md, DEPLOYMENT.md)
- Update package.json with new dependencies
- Add system design and implementation plan documents"
```

**Verify:**
- [ ] All changes staged
- [ ] Commit message is descriptive
- [ ] Commit created successfully

### Step 7: Push to GitHub

```bash
# Push to main branch
git push origin main
```

**Verify:**
- [ ] Push completed successfully
- [ ] No merge conflicts

### Step 8: Verify GitHub Actions

1. Go to https://github.com/coinerd/zeiler_me_pages/actions
2. Check for "Deploy from EDIT Folder" workflow run
3. Click on the latest workflow run
4. Review the logs for each step

**Verify:**
- [ ] Workflow triggered automatically
- [ ] "Setup Node.js" step succeeded
- [ ] "Install dependencies" step succeeded
- [ ] "Build from EDIT folder" step succeeded
- [ ] "Upload artifact" step succeeded
- [ ] "Deploy to GitHub Pages" step succeeded
- [ ] No errors or warnings in logs

### Step 9: Configure GitHub Pages Settings

1. Go to https://github.com/coinerd/zeiler_me_pages/settings/pages
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Verify the settings are saved

**Verify:**
- [ ] Source is set to "GitHub Actions"
- [ ] Branch is set to "main"

### Step 10: Verify Live Deployment

1. Wait 1-3 minutes for deployment to complete
2. Access https://coinerd.github.io/zeiler_me_pages/
3. Test navigation to various pages
4. Verify images load correctly
5. Check that content matches original site

**Verify:**
- [ ] Site loads without errors
- [ ] Homepage displays correctly
- [ ] Navigation menu works
- [ ] All pages are accessible
- [ ] Images load correctly
- [ ] Content matches original site
- [ ] Breadcrumbs work properly
- [ ] Search functionality works

### Step 11: Test Editing Workflow

1. Navigate to a markdown file on GitHub (e.g., `EDIT/index.md`)
2. Click "Edit" button (pencil icon)
3. Make a small change (e.g., update a title or add a sentence)
4. Scroll down and click "Commit changes"
5. Enter a commit message
6. Click "Commit changes" button
7. Wait for GitHub Actions to trigger
8. Verify that change appears on the live site

**Verify:**
- [ ] GitHub web editor opens correctly
- [ ] Changes can be made and saved
- [ ] GitHub Actions triggers automatically
- [ ] Deployment completes successfully
- [ ] Changes appear on live site

## 📊 Success Criteria

Deployment is successful when ALL of the following are complete:

### Files and Structure
- [ ] All implementation files are in zeiler_me_pages
- [ ] EDIT folder is populated with current content
- [ ] File structure matches expected layout
- [ ] Dependencies installed successfully

### Build and Test
- [ ] Local build works with EDIT folder
- [ ] Preview site displays correctly
- [ ] All pages render without errors
- [ ] Images load properly
- [ ] Navigation structure is correct
- [ ] Breadcrumbs work properly

### Deployment
- [ ] Changes committed to Git
- [ ] Pushed to GitHub successfully
- [ ] GitHub Actions workflow runs successfully
- [ ] No errors in workflow logs

### Live Site
- [ ] Site loads at https://coinerd.github.io/zeiler_me_pages/
- [ ] Content matches original site
- [ ] All pages are accessible
- [ ] Images load correctly
- [ ] Navigation works properly

### Editing Workflow
- [ ] GitHub web editor works
- [ ] Changes can be committed
- [ ] GitHub Actions triggers automatically
- [ ] Changes appear on live site

## 🔧 Troubleshooting

### Build Fails

**Issue**: `npm run build` fails with EDIT folder

**Solutions:**
- Check YAML frontmatter syntax (proper indentation)
- Verify required fields (title) are present
- Check for markdown syntax errors
- Review build error messages

### GitHub Actions Fails

**Issue**: Workflow fails in GitHub Actions

**Solutions:**
- Check workflow logs in Actions tab
- Verify environment variables are set
- Ensure EDIT folder is committed
- Check that dependencies are in package.json

### Content Doesn't Match Original

**Issue**: Converted content doesn't match original site

**Solutions:**
- Review conversion quality manually
- Fix frontmatter metadata
- Adjust markdown content as needed
- Add missing pages manually
- Verify image paths are correct

### Images Not Loading

**Issue**: Images don't load on the live site

**Solutions:**
- Verify images are in EDIT folder
- Check image paths in frontmatter
- Ensure image filenames match
- Clear browser cache

## 🔄 Rollback Plan

If deployment has critical issues:

### Immediate Rollback (Use Strapi)

```bash
cd ~/zeiler-deployment/zeiler_me_pages

# Delete EDIT folder to force Strapi fallback
rm -rf EDIT/
git add EDIT/
git commit -m "Rollback: Remove EDIT folder, use Strapi"
git push origin main
```

### Revert Last Commit

```bash
# Revert the last commit
git revert HEAD

# Push the revert
git push origin main
```

## 📚 Documentation Reference

| Document | Purpose | Location |
|-----------|----------|----------|
| Quick Start | Deployment overview | [`README-DEPLOYMENT.md`](README-DEPLOYMENT.md) |
| Detailed Guide | Step-by-step instructions | [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md) |
| Complete Plan | Detailed deployment plan | [`plans/deployment-to-live-plan.md`](plans/deployment-to-live-plan.md) |
| Checklist | Comprehensive checklist | [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md) |
| Editing Guide | How to edit content | [`frontend/EDITING.md`](frontend/EDITING.md) |
| System Design | Architecture details | [`plans/markdown-editing-system-design.md`](plans/markdown-editing-system-design.md) |
| Implementation | What was built | [`IMPLEMENTATION_SUMMARY.md`](IMPLEMENTATION_SUMMARY.md) |

## ⏱️ Estimated Timeline

| Phase | Estimated Time | Notes |
|--------|---------------|-------|
| Clone Repositories | 15 min | One-time setup |
| Copy Implementation Files | 15 min | One-time setup |
| Install Dependencies | 5 min | One-time setup |
| Prepopulate EDIT Folder | 1-2 hours | Depends on content size |
| Test Build Locally | 30 min | Verification |
| Commit Changes | 10 min | Git operations |
| Push to GitHub | 5 min | Network dependent |
| Verify GitHub Actions | 15 min | Monitor workflow |
| Verify Live Site | 30 min | Testing |
| Test Editing Workflow | 20 min | End-to-end test |
| **Total** | **3-4.5 hours** | Including testing and review |

## 🎉 Summary

The markdown-based editing system has been fully implemented in zeiler_me_new. To deploy it to the live zeiler_me_pages repository:

1. ✅ Clone both repositories (zeiler_me_new and zeiler_me_pages)
2. ✅ Copy implementation files from zeiler_me_new to zeiler_me_pages
3. ✅ Install dependencies
4. ✅ Prepopulate EDIT folder with current content (convert HTML or create manually)
5. ✅ Test build locally
6. ✅ Commit and push to GitHub
7. ✅ Verify GitHub Actions deployment
8. ✅ Test live site
9. ✅ Test editing workflow

Once deployed, content can be edited directly via markdown files in the `EDIT` folder, with automatic deployment via GitHub Actions to https://coinerd.github.io/zeiler_me_pages/.

## 🚀 Next Steps After Deployment

1. **Monitor** the site for the first few days
2. **Gather feedback** from content editors
3. **Make adjustments** based on usage
4. **Document** any customizations made
5. **Train users** on the new editing workflow

## 💡 Tips

- **Start small**: Test with a few pages first, then convert the rest
- **Review conversions**: Check the quality of converted markdown files
- **Test locally**: Always test the build before pushing to GitHub
- **Monitor logs**: Keep an eye on GitHub Actions for any errors
- **Backup first**: Keep a backup of the original HTML files
- **Document changes**: Use descriptive commit messages

## 🆘 Support

For issues during deployment:
1. Check GitHub Actions logs for errors
2. Review this deployment guide
3. Consult the detailed documentation
4. Open an issue on the repository

---

**Ready to deploy?** Follow the steps above and your site will be live with markdown-based editing in no time! 🚀
