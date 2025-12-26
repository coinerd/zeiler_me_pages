# Markdown-Based Editing System - Implementation Plan

## Overview

This document provides a detailed implementation plan for making the GitHub Pages site editable via markdown content stored in an `EDIT` folder.

## Prerequisites

- Node.js 20+ installed
- Git repository access to https://github.com/coinerd/zeiler_me_pages
- Existing frontend project structure

## Implementation Steps

### Step 1: Create EDIT Folder Structure

**Location**: Root of repository (`/EDIT`)

The EDIT folder will mirror the current `frontend/public/` structure but with `.md` files instead of `.html` files.

**Actions**:
1. Create `EDIT/` directory at repository root
2. Create subdirectories: `EDIT/detlef/`, `EDIT/julian/`
3. Create nested subdirectories matching the current structure
4. Add `.gitkeep` files to empty directories

**Expected Structure**:
```
EDIT/
├── detlef/
│   ├── deutsch/
│   ├── geschichte/
│   ├── medien/
│   └── projekte/
├── julian/
│   ├── artikel/
│   ├── techzap/
│   └── work/
└── index.md
```

### Step 2: Install Required Dependencies

**Location**: `frontend/package.json`

**New Dependencies**:
```json
{
  "dependencies": {
    "gray-matter": "^4.0.3",
    "turndown": "^7.1.2"
  }
}
```

**Install Command**:
```bash
cd frontend
npm install gray-matter turndown
```

### Step 3: Create Markdown Parser Script

**File**: `frontend/scripts/parse-edit-folder.mjs`

**Purpose**: Parse markdown files from EDIT folder and generate page data

**Key Functions**:
- `parseEditFolder()` - Main entry point
- `extractFrontmatter()` - Parse YAML frontmatter
- `buildPagesFromMarkdown()` - Convert markdown files to page objects
- `buildNavFromMarkdown()` - Generate navigation structure
- `resolvePagePaths()` - Build URL paths from file structure
- `buildBreadcrumbs()` - Generate breadcrumb trails

**Output**: Same structure as Strapi-based `pages.json` and `nav.json`

### Step 4: Create HTML to Markdown Migration Script

**File**: `frontend/scripts/convert-html-to-markdown.mjs`

**Purpose**: Convert existing HTML files to markdown format

**Process**:
1. Scan `frontend/public/` for `.html` files
2. Extract metadata from HTML (title, meta description, images)
3. Convert HTML body to markdown using Turndown
4. Create frontmatter with extracted metadata
5. Write markdown files to `EDIT/` folder
6. Copy images to `EDIT/` folder

**Usage**:
```bash
cd frontend
node scripts/convert-html-to-markdown.mjs
```

### Step 5: Modify build-data.mjs

**File**: `frontend/scripts/build-data.mjs`

**Changes**:

1. Add dual-source logic at the beginning:
```javascript
const USE_EDIT_FOLDER = process.env.USE_EDIT_FOLDER === 'true' || 
                        fs.existsSync(path.join(repoRoot, 'EDIT'));
```

2. Add conditional execution:
```javascript
if (USE_EDIT_FOLDER) {
  console.log('Using EDIT folder as content source...');
  const { parseEditFolder } = await import('./parse-edit-folder.mjs');
  const { pages, nav } = await parseEditFolder();
  // Use pages and nav from EDIT folder
} else {
  console.log('Using Strapi as content source...');
  // Existing Strapi logic
}
```

3. Ensure both paths produce identical output structure

### Step 6: Create GitHub Actions Workflow

**File**: `.github/workflows/deploy-from-edit.yml`

**Triggers**:
- Push to `main` branch with changes to `EDIT/**`
- Manual workflow dispatch

**Workflow Steps**:
1. Checkout repository
2. Setup Node.js
3. Install dependencies
4. Build from EDIT folder (set `USE_EDIT_FOLDER=true`)
5. Upload artifact
6. Deploy to GitHub Pages

**Environment Variables**:
```yaml
SITE_URL: https://coinerd.github.io/zeiler_me_pages
BASE_PATH: /zeiler_me_pages
USE_EDIT_FOLDER: true
```

### Step 7: Update Existing GitHub Actions Workflow

**File**: `.github/workflows/deploy.yml`

**Changes**:
- Keep existing workflow for Strapi-based builds
- Add condition to skip if EDIT folder exists
- Or keep both workflows running independently

### Step 8: Create Example Markdown Files

**File**: `EDIT/index.md`

```markdown
---
title: Startseite
summary: Willkommen auf zeiler.me
publishedAt: 2024-01-01
order: 1
---

# Willkommen

Dies ist die Startseite von zeiler.me.
```

**File**: `EDIT/detlef/deutsch.md`

```markdown
---
title: Deutsch
summary: Deutschunterricht Materialien
publishedAt: 2024-01-01
order: 1
section: deutsch
---

# Deutsch

Hier finden Sie Materialien für den Deutschunterricht.
```

### Step 9: Update Documentation

**File**: `frontend/EDITING.md` (new file)

**Content**:
- How to edit content using markdown files
- Frontmatter reference
- File structure and URL mapping
- How to add new pages
- How to add images
- Local development workflow
- GitHub web editing workflow

**File**: `frontend/DEPLOYMENT.md` (update)

**Additions**:
- New section: "Editing via Markdown Files"
- Instructions for using EDIT folder
- GitHub Actions workflow for EDIT folder
- Comparison of Strapi vs Markdown editing

### Step 10: Test Local Build

**Commands**:
```bash
# Create a test markdown file
mkdir -p EDIT/detlef/test
cat > EDIT/detlef/test/test-page.md << 'EOF'
---
title: Test Page
summary: This is a test page
publishedAt: 2024-12-25
order: 1
section: deutsch
---

# Test Page

This is a test page created from markdown.
EOF

# Build locally
cd frontend
npm run build

# Preview
npm run preview
```

**Verification**:
- Check `src/data/pages.json` contains the test page
- Check `src/data/nav.json` includes the test page in navigation
- Preview the site at `http://localhost:4321`
- Navigate to `/detlef/test/test-page/`
- Verify content displays correctly

### Step 11: Migrate Existing Content

**Commands**:
```bash
# Run migration script
cd frontend
node scripts/convert-html-to-markdown.mjs

# Review converted files
ls -la EDIT/

# Test build with migrated content
npm run build
```

**Manual Review**:
- Check frontmatter is correct
- Verify markdown conversion quality
- Ensure images are referenced correctly
- Fix any conversion issues manually

### Step 12: Deploy to GitHub

**Commands**:
```bash
# Commit changes
git add EDIT/
git add frontend/scripts/parse-edit-folder.mjs
git add frontend/scripts/convert-html-to-markdown.mjs
git add frontend/scripts/build-data.mjs
git add .github/workflows/deploy-from-edit.yml
git add frontend/EDITING.md
git commit -m "Add markdown-based editing system"

# Push to trigger deployment
git push origin main
```

**Verification**:
- Check GitHub Actions tab for workflow execution
- Verify workflow completes successfully
- Access https://coinerd.github.io/zeiler_me_pages/
- Test navigation to various pages
- Verify images load correctly

## File-by-File Implementation

### New Files to Create

1. `EDIT/index.md` - Homepage markdown
2. `EDIT/detlef/index.md` - Detlef section index
3. `EDIT/julian/index.md` - Julian section index
4. `frontend/scripts/parse-edit-folder.mjs` - Markdown parser
5. `frontend/scripts/convert-html-to-markdown.mjs` - HTML to markdown converter
6. `.github/workflows/deploy-from-edit.yml` - GitHub Actions workflow
7. `frontend/EDITING.md` - Editing documentation

### Files to Modify

1. `frontend/package.json` - Add dependencies
2. `frontend/scripts/build-data.mjs` - Add dual-source logic
3. `frontend/DEPLOYMENT.md` - Add markdown editing section

## Testing Strategy

### Unit Testing

- Test frontmatter parsing
- Test markdown to page object conversion
- Test path resolution
- Test navigation building
- Test breadcrumb generation

### Integration Testing

- Test full build process with EDIT folder
- Test fallback to Strapi when EDIT missing
- Test GitHub Actions workflow
- Test deployment to GitHub Pages

### Manual Testing

- Edit markdown files in GitHub web interface
- Verify automatic deployment
- Test adding new pages
- Test adding images
- Test local development workflow

## Rollback Plan

If issues arise:

1. **Immediate**: Delete `EDIT` folder to fall back to Strapi
2. **Short-term**: Revert commit adding markdown system
3. **Long-term**: Keep both systems available, use Strapi as primary

## Success Criteria

- [ ] EDIT folder structure created
- [ ] Markdown parser script working
- [ ] HTML to markdown converter working
- [ ] build-data.mjs supports dual-source
- [ ] GitHub Actions workflow deployed
- [ ] Documentation updated
- [ ] Local build successful with EDIT folder
- [ ] Content migrated to markdown
- [ ] GitHub Pages deployment successful
- [ ] Site accessible and functional

## Estimated Complexity

| Component | Complexity | Notes |
|-----------|------------|-------|
| EDIT folder structure | Low | Manual creation |
| Markdown parser | Medium | Need to match Strapi output structure |
| HTML to markdown converter | Medium | Quality of conversion varies |
| build-data.mjs modifications | Medium | Careful to maintain backward compatibility |
| GitHub Actions workflow | Low | Standard deployment pattern |
| Documentation | Low | Straightforward |
| Testing | Medium | Need comprehensive testing |

## Next Steps

Once this plan is approved:

1. Switch to Code mode to implement the solution
2. Create files in order listed above
3. Test each component before moving to next
4. Deploy to GitHub for final verification
