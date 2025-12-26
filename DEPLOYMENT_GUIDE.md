# Deployment Guide - Markdown-Based Editing System

## Overview

This guide explains how to deploy the markdown-based editing system to the live zeiler_me_pages repository and prepopulate the EDIT folder with current content.

## Repository Locations

| Repository | URL | Purpose |
|-------------|-----|----------|
| zeiler_me_new | https://github.com/coinerd/zeiler_me_new | Development repository (current) |
| zeiler_me_pages | https://github.com/coinerd/zeiler_me_pages | Production repository (target) |
| GitHub Pages | https://coinerd.github.io/zeiler_me_pages/ | Live website |

## What Needs to Be Done

### 1. Copy Implementation Files to zeiler_me_pages

The markdown-based editing system has been implemented in zeiler_me_new. These files need to be copied to zeiler_me_pages:

**Files to copy:**
- `frontend/scripts/parse-edit-folder.mjs` - Markdown parser
- `frontend/scripts/convert-html-to-markdown.mjs` - HTML to markdown converter
- `frontend/scripts/build-data.mjs` - Modified for dual-source
- `frontend/package.json` - Updated with new dependencies
- `.github/workflows/deploy-from-edit.yml` - GitHub Actions workflow
- `frontend/EDITING.md` - Editing guide
- `frontend/DEPLOYMENT.md` - Updated deployment guide
- `plans/markdown-editing-system-design.md` - System design
- `plans/markdown-editing-implementation-plan.md` - Implementation plan
- `IMPLEMENTATION_SUMMARY.md` - Implementation summary

### 2. Prepopulate EDIT Folder with Current Content

The EDIT folder needs to be populated with markdown files that match the current deployed site content.

**Options:**

**Option A: Convert existing HTML files**
- Run the `convert-html-to-markdown.mjs` script
- This will convert HTML files from `frontend/public/` to markdown in `EDIT/`
- Automatically extracts metadata and copies images

**Option B: Manually create markdown files**
- Create markdown files manually based on current site content
- Follow the frontmatter schema
- Copy images to EDIT folder

### 3. Deploy to GitHub Pages

Once the implementation files and EDIT folder are in place:
1. Commit and push changes to zeiler_me_pages
2. GitHub Actions will automatically build and deploy
3. Site will be live at https://coinerd.github.io/zeiler_me_pages/

## Detailed Steps

### Step 1: Prepare zeiler_me_pages Repository

```bash
# Clone the production repository
git clone https://github.com/coinerd/zeiler_me_pages.git
cd zeiler_me_pages

# Copy implementation files from zeiler_me_new
# (Assuming zeiler_me_new is in a sibling directory)
cp -r ../zeiler_me_new/frontend/* frontend/
cp -r ../zeiler_me_new/.github/workflows/deploy-from-edit.yml .github/workflows/
cp ../zeiler_me_new/frontend/EDITING.md frontend/
cp ../zeiler_me_new/IMPLEMENTATION_SUMMARY.md .
cp -r ../zeiler_me_new/plans/* plans/

# Install dependencies
cd frontend
npm install
```

### Step 2: Prepopulate EDIT Folder

**Option A: Automatic Conversion**

```bash
# Run the conversion script
cd frontend
node scripts/convert-html-to-markdown.mjs

# This will:
# 1. Scan frontend/public/ for HTML files
# 2. Convert HTML to markdown
# 3. Extract metadata (title, description, images)
# 4. Create markdown files in EDIT/ folder
# 5. Copy images to EDIT/ folder
```

**Option B: Manual Creation**

Create markdown files manually in the EDIT folder structure:

```
EDIT/
├── index.md                    # Homepage
├── detlef/
│   ├── index.md                # Detlef section
│   ├── deutsch.md               # Deutsch section page
│   ├── deutsch/                # Deutsch subsections
│   ├── geschichte/              # Geschichte subsections
│   ├── medien/                 # Medien subsections
│   └── projekte/               # Projekte subsections
└── julian/
    ├── index.md                # Julian section
    ├── artikel.md               # Artikel section page
    ├── artikel/                # Artikel subsections
    ├── techzap/                # TechZap subsections
    └── work/                   # Work subsections
```

Each markdown file should have frontmatter:

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

### Step 3: Test Locally

```bash
cd frontend

# Build from EDIT folder
USE_EDIT_FOLDER=true npm run build

# Preview the site
npm run preview
```

Verify:
- All pages render correctly
- Navigation structure matches expected
- Images load properly
- Breadcrumbs work correctly

### Step 4: Deploy to GitHub

```bash
cd ~/zeiler_me_pages

# Add all changes
git add .

# Commit
git commit -m "Add markdown-based editing system

- Add EDIT folder with converted content
- Add parse-edit-folder.mjs script
- Add convert-html-to-markdown.mjs script
- Update build-data.mjs for dual-source
- Add deploy-from-edit.yml workflow
- Add documentation
- Update package.json with new dependencies"

# Push to GitHub
git push origin main
```

### Step 5: Verify Deployment

1. Go to https://github.com/coinerd/zeiler_me_pages/actions
2. Check that "Deploy from EDIT Folder" workflow runs
3. Wait for workflow to complete (1-3 minutes)
4. Access https://coinerd.github.io/zeiler_me_pages/
5. Verify the site matches the original content

### Step 6: Test Editing Workflow

1. Navigate to a markdown file on GitHub
2. Click "Edit" button
3. Make a small change (e.g., update title)
4. Commit the change
5. Verify GitHub Actions triggers automatically
6. Check that the change appears on the live site

## Important Notes

### GitHub Pages Settings

Ensure GitHub Pages is configured correctly:

1. Go to https://github.com/coinerd/zeiler_me_pages/settings/pages
2. Set **Source** to **GitHub Actions**
3. Verify **Build and deployment** settings

### Dual-Source Behavior

The build process automatically detects which content source to use:

- **EDIT folder exists** → Uses markdown files
- **EDIT folder missing** → Falls back to Strapi CMS

This means you can:
- Use markdown files for easy editing
- Keep Strapi as a backup option
- Switch between methods by adding/removing EDIT folder

### Image Handling

Images should be placed in the EDIT folder alongside markdown files:

```
EDIT/
├── detlef/
│   ├── deutsch/
│   │   ├── essay-themen.md
│   │   ├── essay-themen-1.jpg
│   │   └── essay-themen-2.jpg
```

Reference images in frontmatter:

```yaml
---
images:
  - url: essay-themen-1.jpg
    alt: Essay Themen Bild 1
  - url: essay-themen-2.jpg
    alt: Essay Themen Bild 2
---
```

## Troubleshooting

### Build Fails

**Issue**: `npm run build` fails with EDIT folder

**Solutions**:
- Check YAML frontmatter syntax (proper indentation)
- Verify required fields (title) are present
- Check for markdown syntax errors
- Review build error messages

### GitHub Actions Fails

**Issue**: Workflow fails in GitHub Actions

**Solutions**:
- Check workflow logs in Actions tab
- Verify environment variables are set
- Ensure EDIT folder is committed
- Check that dependencies are in package.json

### Content Doesn't Match Original

**Issue**: Converted content doesn't match the original site

**Solutions**:
- Review conversion quality manually
- Fix frontmatter metadata
- Adjust markdown content as needed
- Add missing pages manually
- Verify image paths are correct

### Images Not Loading

**Issue**: Images don't load on the live site

**Solutions**:
- Verify images are in EDIT/ folder
- Check image paths in frontmatter
- Ensure image filenames match
- Clear browser cache

## Rollback Plan

If deployment has issues:

### Immediate Rollback

```bash
cd ~/zeiler_me_pages

# Delete EDIT folder to force Strapi fallback
rm -rf EDIT/
git add EDIT/
git commit -m "Rollback: Remove EDIT folder, use Strapi"
git push origin main
```

### Revert Commit

```bash
# Revert the last commit
git revert HEAD
git push origin main
```

## Success Criteria

Deployment is successful when:

- [ ] All implementation files are in zeiler_me_pages
- [ ] EDIT folder is populated with current content
- [ ] HTML to markdown conversion completed without errors
- [ ] Local build works with EDIT folder
- [ ] GitHub Actions workflow runs successfully
- [ ] Live site matches original content
- [ ] Images load correctly on live site
- [ ] Editing workflow works (edit, commit, deploy)
- [ ] Navigation structure is correct
- [ ] Breadcrumbs work properly

## Documentation

- **Editing Guide**: [`frontend/EDITING.md`](frontend/EDITING.md)
- **Deployment Plan**: [`plans/deployment-to-live-plan.md`](plans/deployment-to-live-plan.md)
- **System Design**: [`plans/markdown-editing-system-design.md`](plans/markdown-editing-system-design.md)
- **Implementation Plan**: [`plans/markdown-editing-implementation-plan.md`](plans/markdown-editing-implementation-plan.md)
- **Implementation Summary**: [`IMPLEMENTATION_SUMMARY.md`](IMPLEMENTATION_SUMMARY.md)

## Next Steps After Deployment

1. **Monitor** the site for the first few days
2. **Gather feedback** from content editors
3. **Make adjustments** based on usage
4. **Document** any customizations made
5. **Train users** on the new editing workflow

## Support

For issues during deployment:
1. Check GitHub Actions logs for errors
2. Review this deployment guide
3. Consult EDITING.md for editing issues
4. Open an issue on the repository

## Summary

The markdown-based editing system has been fully implemented in zeiler_me_new. To deploy it to the live zeiler_me_pages repository:

1. Copy implementation files to zeiler_me_pages
2. Prepopulate EDIT folder with current content (convert HTML or create manually)
3. Test locally
4. Commit and push to GitHub
5. Verify deployment at https://coinerd.github.io/zeiler_me_pages/

Once deployed, content can be edited directly via markdown files in the EDIT folder, with automatic deployment via GitHub Actions.
