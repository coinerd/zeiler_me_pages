# Deployment Checklist - Markdown-Based Editing System

## Prerequisites

Before starting deployment, ensure you have:

- [ ] Access to both zeiler_me_new and zeiler_me_pages repositories
- [ ] Git installed and configured
- [ ] Node.js 20+ installed
- [ ] Both repositories cloned locally

## Phase 1: Prepare Repositories

### Clone Repositories

```bash
# Create a working directory
mkdir ~/zeiler-deployment
cd ~/zeiler-deployment

# Clone both repositories
git clone https://github.com/coinerd/zeiler_me_new.git
git clone https://github.com/coinerd/zeiler_me_pages.git
```

Verify:
- [ ] zeiler_me_new cloned successfully
- [ ] zeiler_me_pages cloned successfully

## Phase 2: Copy Implementation Files

### Files to Copy from zeiler_me_new to zeiler_me_pages

| Source File | Target Location | Purpose |
|-------------|----------------|----------|
| `frontend/scripts/parse-edit-folder.mjs` | `frontend/scripts/` | Parse markdown files |
| `frontend/scripts/convert-html-to-markdown.mjs` | `frontend/scripts/` | Convert HTML to markdown |
| `frontend/scripts/build-data.mjs` | `frontend/scripts/` | Dual-source build logic |
| `frontend/package.json` | `frontend/` | Updated dependencies |
| `.github/workflows/deploy-from-edit.yml` | `.github/workflows/` | GitHub Actions workflow |
| `frontend/EDITING.md` | `frontend/` | Editing guide |
| `frontend/DEPLOYMENT.md` | `frontend/` | Updated deployment docs |
| `plans/markdown-editing-system-design.md` | `plans/` | System design |
| `plans/markdown-editing-implementation-plan.md` | `plans/` | Implementation plan |
| `IMPLEMENTATION_SUMMARY.md` | Root | Implementation summary |

### Copy Commands

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
```

Verify:
- [ ] All implementation files copied
- [ ] No errors during copy operation

## Phase 3: Install Dependencies

```bash
cd ~/zeiler-deployment/zeiler_me_pages/frontend
npm install
```

Verify:
- [ ] Dependencies installed successfully
- [ ] No npm errors
- [ ] `node_modules` folder created

## Phase 4: Prepopulate EDIT Folder

### Option A: Automatic Conversion (Recommended)

```bash
cd ~/zeiler-deployment/zeiler_me_pages/frontend
node scripts/convert-html-to-markdown.mjs
```

This will:
- Scan `frontend/public/` for HTML files
- Convert HTML to markdown
- Extract metadata (title, description, images)
- Create markdown files in `EDIT/` folder
- Copy images to `EDIT/` folder

Verify:
- [ ] Conversion completed without errors
- [ ] EDIT folder created with markdown files
- [ ] Images copied to EDIT folder
- [ ] Frontmatter is correct in converted files

### Option B: Manual Creation

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

2. **Create markdown files** following the frontmatter schema:
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

3. **Copy images** to EDIT folder:
   ```bash
   # Copy images from frontend/public to EDIT
   cp -r frontend/public/detlef/*.jpg EDIT/detlef/
   cp -r frontend/public/detlef/**/*.jpg EDIT/detlef/
   cp -r frontend/public/julian/*.jpg EDIT/julian/
   cp -r frontend/public/julian/**/*.jpg EDIT/julian/
   ```

Verify:
- [ ] All markdown files created
- [ ] All images copied
- [ ] Frontmatter is correct
- [ ] File structure matches expected

## Phase 5: Test Build Locally

```bash
cd ~/zeiler-deployment/zeiler_me_pages/frontend

# Build from EDIT folder
USE_EDIT_FOLDER=true npm run build

# Preview the site
npm run preview
```

Verify:
- [ ] Build completes without errors
- [ ] `src/data/pages.json` is generated
- [ ] `src/data/nav.json` is generated
- [ ] Preview site at http://localhost:4321
- [ ] All pages render correctly
- [ ] Navigation structure is correct
- [ ] Images load properly
- [ ] Breadcrumbs work correctly

## Phase 6: Commit Changes

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

Verify:
- [ ] All changes staged
- [ ] Commit message is descriptive
- [ ] Commit created successfully

## Phase 7: Push to GitHub

```bash
# Push to main branch
git push origin main
```

Verify:
- [ ] Push completed successfully
- [ ] No merge conflicts

## Phase 8: Verify GitHub Actions

1. Go to https://github.com/coinerd/zeiler_me_pages/actions
2. Check for "Deploy from EDIT Folder" workflow run
3. Click on the latest workflow run
4. Review the logs for each step

Verify:
- [ ] Workflow triggered automatically
- [ ] "Setup Node.js" step succeeded
- [ ] "Install dependencies" step succeeded
- [ ] "Build from EDIT folder" step succeeded
- [ ] "Upload artifact" step succeeded
- [ ] "Deploy to GitHub Pages" step succeeded
- [ ] No errors or warnings in logs

## Phase 9: Verify Live Site

1. Wait 1-3 minutes for deployment to complete
2. Access https://coinerd.github.io/zeiler_me_pages/
3. Test navigation to various pages
4. Verify images load correctly
5. Check that content matches original site

Verify:
- [ ] Site loads without errors
- [ ] Homepage displays correctly
- [ ] Navigation menu works
- [ ] All pages are accessible
- [ ] Images load correctly
- [ ] Content matches original site
- [ ] Breadcrumbs work properly
- [ ] Search functionality works

## Phase 10: Test Editing Workflow

1. Navigate to a markdown file on GitHub (e.g., `EDIT/index.md`)
2. Click the "Edit" button (pencil icon)
3. Make a small change (e.g., update a title or add a sentence)
4. Scroll down and click "Commit changes"
5. Enter a commit message
6. Click "Commit changes" button
7. Wait for GitHub Actions to trigger
8. Verify the change appears on the live site

Verify:
- [ ] GitHub web editor opens correctly
- [ ] Changes can be made and saved
- [ ] GitHub Actions triggers automatically
- [ ] Deployment completes successfully
- [ ] Changes appear on live site

## Troubleshooting

### Build Fails

**Symptoms:**
- `npm run build` exits with error
- Error messages about YAML or markdown

**Solutions:**
- Check YAML frontmatter syntax (proper indentation)
- Verify required fields (title) are present
- Review error messages for specific issues
- Check that EDIT folder exists

### GitHub Actions Fails

**Symptoms:**
- Workflow shows red "failed" status
- Errors in workflow logs

**Solutions:**
- Check workflow logs in Actions tab
- Verify environment variables are set
- Ensure EDIT folder is committed
- Check that dependencies are in package.json

### Images Not Loading

**Symptoms:**
- Images show broken link icon
- Images don't display on pages

**Solutions:**
- Verify images are in EDIT folder
- Check image paths in frontmatter
- Ensure image filenames match
- Clear browser cache (Ctrl+F5)

### Content Doesn't Match Original

**Symptoms:**
- Converted content looks different from original
- Missing pages or sections

**Solutions:**
- Review conversion quality manually
- Fix frontmatter metadata
- Adjust markdown content as needed
- Add missing pages manually
- Verify image paths are correct

## Rollback Procedures

### Immediate Rollback (Use Strapi)

If deployment has critical issues:

```bash
cd ~/zeiler-deployment/zeiler_me_pages

# Delete EDIT folder to force Strapi fallback
rm -rf EDIT/
git add EDIT/
git commit -m "Rollback: Remove EDIT folder, use Strapi"
git push origin main
```

### Revert Last Commit

If you want to undo the deployment:

```bash
# Revert the last commit
git revert HEAD

# Push the revert
git push origin main
```

## Success Criteria

Deployment is successful when ALL of the following are complete:

### Files and Structure
- [ ] All implementation files copied to zeiler_me_pages
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

## Post-Deployment Tasks

### 1. Monitor Site (First Week)

- [ ] Check site daily for any issues
- [ ] Monitor GitHub Actions for errors
- [ ] Gather feedback from content editors

### 2. Clean Up (Optional)

After verifying everything works for a week:

```bash
# Backup original HTML files
cd ~/zeiler-deployment/zeiler_me_pages/frontend/public
tar czf ../../public-html-backup.tar.gz detlef julian

# Remove original HTML files
rm -rf detlef julian

# Commit cleanup
cd ~/zeiler-deployment/zeiler_me_pages
git add frontend/public/
git commit -m "Remove original HTML files, using markdown content"
git push origin main
```

### 3. Update Documentation

- [ ] Update README.md with new editing workflow
- [ ] Add link to EDITING.md in repository
- [ ] Document any customizations made
- [ ] Create user guide for content editors

### 4. Train Users

- [ ] Share EDITING.md with content editors
- [ ] Provide training on markdown syntax
- [ ] Explain GitHub web editing workflow
- [ ] Set up permissions for collaborators

## Documentation Reference

| Document | Purpose | Location |
|-----------|----------|----------|
| Quick Start | Deployment overview | [`README-DEPLOYMENT.md`](README-DEPLOYMENT.md) |
| Detailed Guide | Step-by-step instructions | [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md) |
| Complete Plan | Detailed deployment plan | [`plans/deployment-to-live-plan.md`](plans/deployment-to-live-plan.md) |
| Editing Guide | How to edit content | [`frontend/EDITING.md`](frontend/EDITING.md) |
| System Design | Architecture details | [`plans/markdown-editing-system-design.md`](plans/markdown-editing-system-design.md) |
| Implementation | What was built | [`IMPLEMENTATION_SUMMARY.md`](IMPLEMENTATION_SUMMARY.md) |

## Estimated Timeline

| Phase | Estimated Time | Actual Time |
|--------|---------------|-------------|
| Prepare Repositories | 15 min | ___ |
| Copy Implementation Files | 15 min | ___ |
| Install Dependencies | 5 min | ___ |
| Prepopulate EDIT Folder | 1-2 hours | ___ |
| Test Build Locally | 30 min | ___ |
| Commit Changes | 10 min | ___ |
| Push to GitHub | 5 min | ___ |
| Verify GitHub Actions | 15 min | ___ |
| Verify Live Site | 30 min | ___ |
| Test Editing Workflow | 20 min | ___ |
| **Total** | **3-4.5 hours** | ___ |

## Support and Resources

### For Issues During Deployment

1. Check GitHub Actions logs for errors
2. Review this checklist
3. Consult detailed guides:
   - [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md)
   - [`plans/deployment-to-live-plan.md`](plans/deployment-to-live-plan.md)
   - [`frontend/EDITING.md`](frontend/EDITING.md)
4. Open an issue on the repository

### Helpful Commands

```bash
# Check EDIT folder structure
tree EDIT/

# Count markdown files
find EDIT -name "*.md" | wc -l

# Test build
cd frontend && USE_EDIT_FOLDER=true npm run build

# Preview site
cd frontend && npm run preview

# Check git status
git status

# View recent commits
git log --oneline -10
```

## Final Notes

- The markdown-based editing system is fully implemented and ready to deploy
- Strapi CMS remains available as a backup option
- Content can be edited directly via GitHub web interface
- Changes deploy automatically via GitHub Actions
- All documentation is available for reference

Once all checklist items are complete, the deployment is successful and the site is live at https://coinerd.github.io/zeiler_me_pages/!
