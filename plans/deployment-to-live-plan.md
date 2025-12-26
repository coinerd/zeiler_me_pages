# Deployment Plan - Moving to zeiler_me_pages Repository

## Overview

This plan outlines the steps to deploy the markdown-based editing system to the live repository at https://github.com/coinerd/zeiler_me_pages and prepopulate the EDIT folder with current content from the deployed site.

## Repository Structure

```
Source (Development): https://github.com/coinerd/zeiler_me_new
Target (Production): https://github.com/coinerd/zeiler_me_pages
Live Site: https://coinerd.github.io/zeiler_me_pages/
```

## Current State

### zeiler_me_new (Development Repo)
- Contains all the markdown editing system implementation
- Has example markdown files in `EDIT/` folder
- Has modified build scripts and GitHub Actions workflows
- Has documentation

### zeiler_me_pages (Production Repo)
- Currently deployed to GitHub Pages
- Contains existing HTML content
- Needs to be updated with markdown editing system
- Needs EDIT folder prepopulated with current content

## Deployment Strategy

### Phase 1: Prepare Content Migration

**Goal**: Convert existing HTML content from the live site to markdown format.

#### Step 1.1: Clone zeiler_me_pages Repository

```bash
# Create a working directory
mkdir ~/zeiler-deployment
cd ~/zeiler-deployment

# Clone the production repository
git clone https://github.com/coinerd/zeiler_me_pages.git
cd zeiler_me_pages
```

#### Step 1.2: Copy Implementation Files from zeiler_me_new

```bash
# Copy the frontend folder from development repo
# (Assuming zeiler_me_new is already cloned locally)
cp -r ~/zeiler_me_new/frontend/* frontend/

# Copy the .github workflows
cp -r ~/zeiler_me_new/.github/workflows/deploy-from-edit.yml .github/workflows/

# Copy documentation
cp ~/zeiler_me_new/frontend/EDITING.md frontend/
cp ~/zeiler_me_new/IMPLEMENTATION_SUMMARY.md .

# Copy plans
cp -r ~/zeiler_me_new/plans/* plans/
```

#### Step 1.3: Install Dependencies

```bash
cd frontend
npm install
```

### Phase 2: Prepopulate EDIT Folder with Current Content

**Goal**: Convert existing HTML content to markdown and populate EDIT folder.

#### Step 2.1: Download Current Site Content

Option A: If you have access to the deployed site:

```bash
# Create a temporary directory for current content
mkdir -p ../current-site-content
cd ../current-site-content

# Download the current site
wget -r -np -nH --cut-dirs=3 -P . https://coinerd.github.io/zeiler_me_pages/

# Or use curl for individual files
# Or clone if the HTML is in the repo
```

Option B: If HTML files are already in zeiler_me_pages repo:

```bash
# The HTML files should be in frontend/public/
# They will be converted using the convert-html-to-markdown.mjs script
```

#### Step 2.2: Run HTML to Markdown Conversion

```bash
cd ~/zeiler-deployment/zeiler_me_pages/frontend

# Run the conversion script
node scripts/convert-html-to-markdown.mjs
```

This will:
- Scan `frontend/public/` for HTML files
- Extract metadata (title, description, images)
- Convert HTML body to markdown
- Create markdown files in `EDIT/` folder at repo root
- Copy images to `EDIT/` folder

#### Step 2.3: Review Converted Content

```bash
cd ~/zeiler-deployment/zeiler_me_pages

# Check the EDIT folder structure
tree EDIT/

# Review a few markdown files
cat EDIT/index.md
cat EDIT/detlef/deutsch.md
```

**Manual Cleanup Tasks**:
1. Check frontmatter is correct
2. Verify markdown conversion quality
3. Ensure image paths are correct
4. Fix any conversion issues manually
5. Add missing metadata (order, section, etc.)

#### Step 2.4: Test Build Locally

```bash
cd frontend

# Build the site from EDIT folder
USE_EDIT_FOLDER=true npm run build

# Preview the site
npm run preview
```

Verify:
- All pages render correctly
- Navigation structure matches expected
- Images load properly
- Breadcrumbs work correctly

### Phase 3: Deploy to GitHub

#### Step 3.1: Commit Changes

```bash
cd ~/zeiler-deployment/zeiler_me_pages

# Add all changes
git add .

# Commit
git commit -m "Add markdown-based editing system

- Add EDIT folder with converted content
- Add parse-edit-folder.mjs script
- Add convert-html-to-markdown.mjs script
- Update build-data.mjs for dual-source
- Add deploy-from-edit.yml workflow
- Add documentation (EDITING.md, IMPLEMENTATION_SUMMARY.md)
- Update DEPLOYMENT.md with markdown section
- Add gray-matter and turndown dependencies
"

# Push to GitHub
git push origin main
```

#### Step 3.2: Verify GitHub Actions

1. Go to https://github.com/coinerd/zeiler_me_pages/actions
2. Check that "Deploy from EDIT Folder" workflow is visible
3. Verify the workflow runs successfully

#### Step 3.3: Configure GitHub Pages Settings

1. Go to https://github.com/coinerd/zeiler_me_pages/settings/pages
2. Ensure **Source** is set to **GitHub Actions**
3. Verify **Build and deployment** is configured correctly

### Phase 4: Test Live Deployment

#### Step 4.1: Monitor GitHub Actions

1. Watch the workflow run in the Actions tab
2. Verify all steps complete successfully
3. Check for any errors or warnings

#### Step 4.2: Verify Live Site

1. Wait 1-3 minutes for deployment to complete
2. Access https://coinerd.github.io/zeiler_me_pages/
3. Test navigation to various pages
4. Verify images load correctly
5. Check that content matches the original site

#### Step 4.3: Test Editing Workflow

1. Navigate to a markdown file on GitHub
2. Click "Edit" button
3. Make a small change (e.g., update title)
4. Commit the change
5. Verify GitHub Actions triggers
6. Check that the change appears on the live site

## File Structure After Deployment

```
zeiler_me_pages/
├── EDIT/                          # Markdown content (prepopulated)
│   ├── index.md                    # Homepage
│   ├── detlef/
│   │   ├── index.md                # Detlef section
│   │   ├── deutsch.md               # Deutsch section page
│   │   ├── deutsch/                # Deutsch subsections
│   │   │   ├── essay-themen.md
│   │   │   ├── fremdenfeindlichkeit.md
│   │   │   └── ... (all converted pages)
│   │   ├── geschichte/              # Geschichte subsections
│   │   ├── medien/                 # Medien subsections
│   │   └── projekte/               # Projekte subsections
│   └── julian/
│       ├── index.md                # Julian section
│       ├── artikel.md               # Artikel section page
│       ├── artikel/                # Artikel subsections
│       ├── techzap/                # TechZap subsections
│       └── work/                   # Work subsections
├── frontend/
│   ├── scripts/
│   │   ├── build-data.mjs         # Modified for dual-source
│   │   ├── parse-edit-folder.mjs   # New
│   │   ├── convert-html-to-markdown.mjs  # New
│   │   └── ... (other scripts)
│   ├── src/
│   │   ├── data/
│   │   │   ├── pages.json         # Generated from EDIT folder
│   │   │   └── nav.json          # Generated from EDIT folder
│   │   └── ... (other source files)
│   ├── public/
│   │   ├── detlef/                # Original HTML (can be removed later)
│   │   ├── julian/                # Original HTML (can be removed later)
│   │   └── ... (other static files)
│   ├── package.json                # Updated with new dependencies
│   ├── EDITING.md                 # New: Editing guide
│   └── DEPLOYMENT.md              # Updated
├── .github/
│   └── workflows/
│       ├── deploy.yml               # Existing: Strapi deployment
│       └── deploy-from-edit.yml     # New: Markdown deployment
├── plans/
│   ├── markdown-editing-system-design.md
│   └── markdown-editing-implementation-plan.md
└── IMPLEMENTATION_SUMMARY.md
```

## Prepopulation Checklist

### Before Deployment

- [ ] Clone zeiler_me_pages repository
- [ ] Copy all implementation files from zeiler_me_new
- [ ] Install npm dependencies
- [ ] Verify HTML content is available for conversion
- [ ] Test conversion script locally

### After Conversion

- [ ] Run convert-html-to-markdown.mjs
- [ ] Review EDIT folder structure
- [ ] Check frontmatter in converted files
- [ ] Verify image paths are correct
- [ ] Test build locally: `USE_EDIT_FOLDER=true npm run build`
- [ ] Preview site locally: `npm run preview`
- [ ] Fix any conversion issues manually

### Before Push

- [ ] Commit all changes with descriptive message
- [ ] Verify GitHub Pages settings use GitHub Actions
- [ ] Check that deploy-from-edit.yml workflow is present

### After Deployment

- [ ] Monitor GitHub Actions workflow
- [ ] Verify live site at https://coinerd.github.io/zeiler_me_pages/
- [ ] Test navigation to various pages
- [ ] Verify images load correctly
- [ ] Test editing workflow (edit a file, commit, verify deployment)

## Troubleshooting

### Conversion Fails

**Issue**: Script errors when converting HTML to markdown

**Solutions**:
- Check that HTML files exist in `frontend/public/`
- Verify dependencies are installed: `npm install`
- Check console output for specific errors
- Review HTML files for malformed markup

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
- Ensure `EDIT` folder is committed
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
- Verify images are in `EDIT/` folder
- Check image paths in frontmatter
- Ensure image filenames match
- Clear browser cache

## Rollback Plan

If deployment has issues:

### Immediate Rollback

1. **Delete EDIT folder** to force Strapi fallback:
   ```bash
   cd ~/zeiler-deployment/zeiler_me_pages
   rm -rf EDIT/
   git add EDIT/
   git commit -m "Rollback: Remove EDIT folder, use Strapi"
   git push origin main
   ```

2. **Revert commit** if needed:
   ```bash
   git revert HEAD
   git push origin main
   ```

### Partial Rollback

If only some content has issues:

1. **Fix problematic files** in EDIT folder
2. **Commit and push** fixes
3. **Monitor deployment**

## Post-Deployment Tasks

### 1. Clean Up (Optional)

After verifying everything works:

```bash
# Remove original HTML files (backup first!)
cd frontend/public
tar czf ../public-html-backup.tar.gz detlef julian
rm -rf detlef julian

# Commit cleanup
git add frontend/public/
git commit -m "Remove original HTML files, using markdown content"
git push origin main
```

### 2. Update Documentation

- Update README.md with new editing workflow
- Add link to EDITING.md in repository
- Document any customizations made

### 3. Train Users

- Share EDITING.md with content editors
- Provide training on markdown syntax
- Explain GitHub web editing workflow
- Set up permissions for collaborators

## Success Criteria

Deployment is successful when:

- [ ] All files from zeiler_me_new are in zeiler_me_pages
- [ ] EDIT folder is prepopulated with current content
- [ ] HTML to markdown conversion completed without errors
- [ ] Local build works with EDIT folder
- [ ] GitHub Actions workflow runs successfully
- [ ] Live site matches original content
- [ ] Images load correctly on live site
- [ ] Editing workflow works (edit, commit, deploy)
- [ ] Navigation structure is correct
- [ ] Breadcrumbs work properly

## Timeline

| Phase | Estimated Time | Notes |
|--------|---------------|-------|
| Phase 1: Prepare | 30 minutes | Copy files, install dependencies |
| Phase 2: Prepopulate | 1-2 hours | Convert content, review, test |
| Phase 3: Deploy | 15 minutes | Commit, push, verify |
| Phase 4: Test | 30 minutes | Monitor, verify, test editing |
| **Total** | **2-3 hours** | Including testing and review |

## Next Steps After Deployment

1. **Monitor** the site for first few days
2. **Gather feedback** from content editors
3. **Make adjustments** based on usage
4. **Document** any customizations
5. **Archive** old HTML files (optional)

## Support

For issues during deployment:
1. Check GitHub Actions logs
2. Review this deployment plan
3. Consult EDITING.md for editing issues
4. Open an issue on the repository
