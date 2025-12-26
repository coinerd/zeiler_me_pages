# Editing Content via Markdown Files

This guide explains how to edit the website content using markdown files stored in the `EDIT` folder.

## Overview

The website can be edited in two ways:

1. **Markdown Files** (Recommended) - Edit markdown files directly in the `EDIT` folder
2. **Strapi CMS** - Use the Strapi admin panel (backup option)

The build process automatically detects which method to use:
- If `EDIT` folder exists → Uses markdown files
- If `EDIT` folder missing → Falls back to Strapi CMS

## Quick Start

### Editing via GitHub Web Interface

1. Navigate to the repository on GitHub
2. Go to the `EDIT` folder
3. Find the markdown file you want to edit
4. Click the "Edit" button (pencil icon)
5. Make your changes to the markdown content
6. Commit the changes
7. GitHub Actions automatically builds and deploys your changes

### Local Development

```bash
# Make changes to markdown files
cd EDIT/detlef/deutsch
nano essay-themen.md

# Build locally to test
cd ../../frontend
npm run build

# Preview the site
npm run preview
```

## EDIT Folder Structure

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

## Frontmatter Schema

Each markdown file includes YAML frontmatter at the top:

```yaml
---
title: Page Title
summary: Brief summary of the page content
publishedAt: 2024-01-15
order: 10
section: deutsch
images:
  - url: path/to/image-1.jpg
    alt: Image description
    caption: Optional caption
  - url: path/to/image-2.jpg
    alt: Another image
---

# Page Content

Markdown content goes here...
```

### Frontmatter Fields

| Field | Type | Required | Description |
|-------|------|-----------|-------------|
| `title` | string | Yes | Page title |
| `summary` | string | No | Brief summary for SEO and navigation |
| `publishedAt` | date | No | Publication date (ISO format: YYYY-MM-DD) |
| `order` | number | No | Sort order within section (lower = first) |
| `section` | string | No | Section slug (e.g., deutsch, geschichte) |
| `images` | array | No | Array of image objects |

### Image Object Fields

| Field | Type | Required | Description |
|-------|------|-----------|-------------|
| `url` | string | Yes | Image path (relative or absolute) |
| `alt` | string | Yes | Alt text for accessibility |
| `caption` | string | No | Optional caption text |

## File Structure to URL Mapping

The file structure directly maps to URLs:

| File Path | URL |
|-----------|-----|
| `EDIT/index.md` | `/` |
| `EDIT/detlef/deutsch.md` | `/detlef/deutsch/` |
| `EDIT/detlef/deutsch/essay-themen.md` | `/detlef/deutsch/essay-themen/` |
| `EDIT/detlef/deutsch/essay-themen/essay.md` | `/detlef/deutsch/essay-themen/essay/` |
| `EDIT/julian/artikel.md` | `/julian/artikel/` |

### Special Files

- `index.md` - Represents the directory itself (e.g., `EDIT/detlef/index.md` → `/detlef/`)
- Other `.md` files - Become subpages (e.g., `EDIT/detlef/deutsch.md` → `/detlef/deutsch/`)

## Adding New Pages

### 1. Create a new markdown file

```bash
# Example: Add a new page in the deutsch section
cd EDIT/detlef/deutsch
nano meine-neue-seite.md
```

```markdown
---
title: Meine Neue Seite
summary: Dies ist eine neue Seite
publishedAt: 2024-12-25
order: 20
section: deutsch
---

# Meine Neue Seite

Dies ist der Inhalt der neuen Seite.
```

### 2. Add images (optional)

Place images in the same directory as the markdown file:

```
EDIT/detlef/deutsch/
├── meine-neue-seite.md
└── meine-neue-seite-1.jpg
```

Reference the image in frontmatter:

```yaml
---
title: Meine Neue Seite
images:
  - url: meine-neue-seite-1.jpg
    alt: Bildbeschreibung
---
```

### 3. Commit and push

```bash
git add EDIT/detlef/deutsch/meine-neue-seite.md
git add EDIT/detlef/deutsch/meine-neue-seite-1.jpg
git commit -m "Add new page: Meine Neue Seite"
git push origin main
```

GitHub Actions will automatically build and deploy your changes.

## Editing Existing Pages

### Method 1: GitHub Web Interface

1. Navigate to the markdown file on GitHub
2. Click the "Edit" button
3. Make changes
4. Commit changes

### Method 2: Local Editing

```bash
# Edit the file
nano EDIT/detlef/deutsch/essay-themen.md

# Test locally
cd frontend
npm run build
npm run preview

# Commit and push
git add EDIT/detlef/deutsch/essay-themen.md
git commit -m "Update essay-themen page"
git push origin main
```

## Markdown Syntax

The website supports standard GitHub Flavored Markdown (GFM):

### Headings

```markdown
# Heading 1
## Heading 2
### Heading 3
```

### Text Formatting

```markdown
**Bold text**
*Italic text*
~~Strikethrough~~
`Inline code`
```

### Links

```markdown
[Link text](/path/to/page/)
[External link](https://example.com)
```

### Images

```markdown
![Alt text](/path/to/image.jpg)
```

### Lists

```markdown
- Unordered item 1
- Unordered item 2

1. Ordered item 1
2. Ordered item 2
```

### Code Blocks

```markdown
```javascript
const x = 1;
```
```

### Tables

```markdown
| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |
```

## Automatic Deployment

When you push changes to the `EDIT` folder:

1. GitHub Actions workflow is triggered
2. The site is built from markdown files
3. The built site is deployed to GitHub Pages
4. Changes are live at https://coinerd.github.io/zeiler_me_pages/

### Manual Trigger

You can also trigger deployment manually:

1. Go to the **Actions** tab on GitHub
2. Select **Deploy from EDIT Folder** workflow
3. Click **Run workflow**
4. Select the branch and click **Run workflow**

## Troubleshooting

### Build fails

**Check the GitHub Actions logs:**
1. Go to the **Actions** tab
2. Click on the failed workflow run
3. Review the error messages

**Common issues:**
- Invalid YAML frontmatter (check indentation)
- Missing required fields (title)
- Broken image paths
- Markdown syntax errors

### Images not loading

**Verify:**
- Image files exist in the `EDIT` folder
- Image paths in frontmatter are correct
- Images are in the same directory as the markdown file (or use absolute paths)

### Changes not appearing

**Wait for deployment:**
- GitHub Actions typically takes 1-3 minutes
- Check the **Actions** tab for deployment status
- Clear browser cache if needed

### Navigation not updating

**Check:**
- File structure matches desired navigation
- `order` field is set correctly
- `section` field matches parent directory

## Migration from HTML

If you have existing HTML files, convert them to markdown:

```bash
cd frontend
node scripts/convert-html-to-markdown.mjs
```

This will:
1. Scan `frontend/public/` for HTML files
2. Extract metadata (title, description, images)
3. Convert HTML body to markdown
4. Create markdown files in `EDIT/` folder
5. Copy images to `EDIT/` folder

Review the converted files and commit them:

```bash
git add EDIT/
git commit -m "Migrate content from HTML to markdown"
git push origin main
```

## Best Practices

### 1. Use Descriptive Titles

```yaml
---
title: Faschismus als Massenbewegung
---
```

### 2. Write Clear Summaries

```yaml
---
summary: Eine Analyse des Faschismus als Massenbewegung im 20. Jahrhundert
---
```

### 3. Organize Files Logically

```
EDIT/
├── detlef/
│   ├── deutsch/        # German language materials
│   ├── geschichte/     # History materials
│   ├── medien/        # Media education
│   └── projekte/      # Projects
└── julian/
    ├── artikel/        # Articles
    ├── techzap/       # Tech content
    └── work/         # Work portfolio
```

### 4. Use Consistent Naming

- Use lowercase filenames
- Use hyphens instead of spaces: `meine-seite.md`
- Avoid special characters

### 5. Add Alt Text to Images

```yaml
---
images:
  - url: mein-bild.jpg
    alt: Eine Beschreibung des Bildes für Screenreader
---
```

### 6. Test Locally Before Pushing

```bash
cd frontend
npm run build
npm run preview
```

## Advanced Features

### Custom Sort Order

Use the `order` field to control page order:

```yaml
---
order: 10  # Lower numbers appear first
---
```

### Section Grouping

Group pages by section:

```yaml
---
section: deutsch  # Groups under "Deutsch" in navigation
---
```

### Multiple Images

Add multiple images with captions:

```yaml
---
images:
  - url: bild-1.jpg
    alt: Erstes Bild
    caption: Dies ist das erste Bild
  - url: bild-2.jpg
    alt: Zweites Bild
    caption: Dies ist das zweite Bild
---
```

## Switching Back to Strapi

To use Strapi CMS instead of markdown files:

1. Delete or rename the `EDIT` folder
2. The build process will automatically fall back to Strapi
3. Push changes to trigger rebuild

```bash
# Temporarily disable markdown editing
mv EDIT EDIT.backup
git add EDIT.backup
git commit -m "Temporarily disable markdown editing"
git push origin main
```

## Resources

- [Markdown Guide](https://www.markdownguide.org/)
- [GitHub Flavored Markdown Spec](https://github.github.com/gfm/)
- [YAML Frontmatter](https://jekyllrb.com/docs/front-matter/)
- [Astro Documentation](https://docs.astro.build/)

## Support

For issues or questions:
1. Check the GitHub Actions logs
2. Review this documentation
3. Open an issue on the repository
