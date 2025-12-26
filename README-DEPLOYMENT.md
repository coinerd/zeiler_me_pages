# Markdown-Based Editing System - Deployment Overview

## Quick Summary

The markdown-based editing system has been fully implemented in the **zeiler_me_new** repository. This document provides a clear roadmap for deploying it to the live **zeiler_me_pages** repository.

## What Has Been Built

A complete markdown-based editing system that allows:
- ✅ Editing content directly via markdown files in an `EDIT` folder
- ✅ Automatic deployment via GitHub Actions
- ✅ No CMS required (Strapi remains as backup)
- ✅ Version control for all content changes
- ✅ Simple GitHub web interface editing

## Repository Structure

```
Development: https://github.com/coinerd/zeiler_me_new
Production:  https://github.com/coinerd/zeiler_me_pages
Live Site:   https://coinerd.github.io/zeiler_me_pages/
```

## Deployment Roadmap

### Phase 1: Copy Implementation Files (30 minutes)

**Goal**: Move all implementation files from zeiler_me_new to zeiler_me_pages.

**Files to copy:**
- `frontend/scripts/parse-edit-folder.mjs` - Markdown parser
- `frontend/scripts/convert-html-to-markdown.mjs` - HTML to markdown converter
- `frontend/scripts/build-data.mjs` - Modified for dual-source
- `frontend/package.json` - Updated with new dependencies
- `.github/workflows/deploy-from-edit.yml` - GitHub Actions workflow
- `frontend/EDITING.md` - Editing guide
- `frontend/DEPLOYMENT.md` - Updated deployment guide
- Documentation files in `plans/` folder

**Commands:**
```bash
# Clone production repo
git clone https://github.com/coinerd/zeiler_me_pages.git
cd zeiler_me_pages

# Copy files from zeiler_me_new
cp -r ../zeiler_me_new/frontend/* frontend/
cp -r ../zeiler_me_new/.github/workflows/deploy-from-edit.yml .github/workflows/
cp ../zeiler_me_new/frontend/EDITING.md frontend/
cp -r ../zeiler_me_new/plans/* plans/
cp ../zeiler_me_new/IMPLEMENTATION_SUMMARY.md .

# Install dependencies
cd frontend
npm install
```

### Phase 2: Prepopulate EDIT Folder (1-2 hours)

**Goal**: Convert existing HTML content to markdown format.

**Option A: Automatic Conversion (Recommended)**

```bash
cd frontend
node scripts/convert-html-to-markdown.mjs
```

This will:
- Scan `frontend/public/` for HTML files
- Extract metadata (title, description, images)
- Convert HTML body to markdown
- Create markdown files in `EDIT/` folder
- Copy images to `EDIT/` folder

**Option B: Manual Creation**

Create markdown files manually following the frontmatter schema:

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

**Expected Structure:**
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

### Phase 3: Test Locally (30 minutes)

**Goal**: Verify everything works before deploying.

```bash
cd frontend

# Build from EDIT folder
USE_EDIT_FOLDER=true npm run build

# Preview site
npm run preview
```

**Verify:**
- [ ] All pages render correctly
- [ ] Navigation structure matches expected
- [ ] Images load properly
- [ ] Breadcrumbs work correctly
- [ ] Search index is generated

### Phase 4: Deploy to GitHub (15 minutes)

**Goal**: Push changes and trigger automatic deployment.

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

### Phase 5: Verify Live Deployment (30 minutes)

**Goal**: Confirm everything works on the live site.

**Steps:**
1. Go to https://github.com/coinerd/zeiler_me_pages/actions
2. Verify "Deploy from EDIT Folder" workflow runs successfully
3. Wait 1-3 minutes for deployment to complete
4. Access https://coinerd.github.io/zeiler_me_pages/
5. Test navigation to various pages
6. Verify images load correctly
7. Check that content matches to original site

**Test Editing Workflow:**
1. Navigate to a markdown file on GitHub
2. Click "Edit" button
3. Make a small change (e.g., update title)
4. Commit the change
5. Verify GitHub Actions triggers automatically
6. Check that the change appears on the live site

## Documentation

| Document | Purpose | Location |
|-----------|----------|----------|
| Editing Guide | How to edit content via markdown | [`frontend/EDITING.md`](frontend/EDITING.md) |
| Deployment Plan | Detailed deployment steps | [`plans/deployment-to-live-plan.md`](plans/deployment-to-live-plan.md) |
| Deployment Guide | Quick deployment reference | [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md) |
| System Design | Architecture and design | [`plans/markdown-editing-system-design.md`](plans/markdown-editing-system-design.md) |
| Implementation Plan | Implementation details | [`plans/markdown-editing-implementation-plan.md`](plans/markdown-editing-implementation-plan.md) |
| Implementation Summary | What was built | [`IMPLEMENTATION_SUMMARY.md`](IMPLEMENTATION_SUMMARY.md) |

## Key Features

### Automatic Deployment
- Changes to `EDIT` folder trigger GitHub Actions
- Site builds and deploys automatically
- No manual intervention required

### Dual-Source Support
- **EDIT folder exists** → Uses markdown files
- **EDIT folder missing** → Falls back to Strapi CMS
- Easy to switch between methods

### File-Based URLs
- File structure directly determines URLs
- `EDIT/detlef/deutsch.md` → `/detlef/deutsch/`
- `EDIT/detlef/deutsch/essay-themen.md` → `/detlef/deutsch/essay-themen/`

### Frontmatter Metadata
- YAML frontmatter for page metadata
- Supports title, summary, publishedAt, order, section, images
- Automatic extraction and processing

## Troubleshooting

### Build Fails
- Check YAML frontmatter syntax
- Verify required fields (title)
- Review build error messages

### GitHub Actions Fails
- Check workflow logs in Actions tab
- Verify environment variables
- Ensure EDIT folder is committed

### Images Not Loading
- Verify images are in EDIT folder
- Check image paths in frontmatter
- Clear browser cache

### Content Doesn't Match
- Review conversion quality
- Fix frontmatter metadata
- Adjust markdown content manually

## Rollback Plan

If deployment has issues:

```bash
# Delete EDIT folder to force Strapi fallback
cd ~/zeiler_me_pages
rm -rf EDIT/
git add EDIT/
git commit -m "Rollback: Remove EDIT folder, use Strapi"
git push origin main
```

## Success Criteria

Deployment is successful when:

- [ ] All implementation files are in zeiler_me_pages
- [ ] EDIT folder is populated with current content
- [ ] HTML to markdown conversion completed
- [ ] Local build works with EDIT folder
- [ ] GitHub Actions workflow runs successfully
- [ ] Live site matches original content
- [ ] Images load correctly on live site
- [ ] Editing workflow works (edit, commit, deploy)
- [ ] Navigation structure is correct
- [ ] Breadcrumbs work properly

## Estimated Timeline

| Phase | Time | Notes |
|--------|-------|-------|
| Copy Implementation Files | 30 min | One-time setup |
| Prepopulate EDIT Folder | 1-2 hours | Depends on content size |
| Test Locally | 30 min | Verification |
| Deploy to GitHub | 15 min | Push and wait |
| Verify Live Deployment | 30 min | Testing |
| **Total** | **2.5-3.5 hours** | Including testing |

## Next Steps

1. **Review** this deployment overview
2. **Follow** the detailed deployment plan in [`plans/deployment-to-live-plan.md`](plans/deployment-to-live-plan.md)
3. **Use** the quick reference in [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md)
4. **Deploy** to zeiler_me_pages repository
5. **Test** the live site
6. **Train** content editors on the new workflow

## Support

For issues during deployment:
1. Check GitHub Actions logs
2. Review documentation in [`frontend/EDITING.md`](frontend/EDITING.md)
3. Consult the deployment plan in [`plans/deployment-to-live-plan.md`](plans/deployment-to-live-plan.md)
4. Open an issue on the repository

## Summary

The markdown-based editing system is ready to deploy. Follow the phases above to:

1. Copy implementation files to zeiler_me_pages
2. Prepopulate EDIT folder with current content
3. Test locally
4. Deploy to GitHub
5. Verify live site

Once deployed, content can be edited directly via markdown files in the EDIT folder, with automatic deployment via GitHub Actions to https://coinerd.github.io/zeiler_me_pages/.
