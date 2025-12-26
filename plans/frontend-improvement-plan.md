# Frontend Improvement Plan for zeiler.me

## Overview

This plan outlines improvements to the Astro-based frontend to ensure maximum robustness and accuracy in displaying all migrated content from the old Google Sites-based zeiler.me.

## Current State Analysis

### CMS Structure (Strapi)
- **Pages**: `title`, `slug`, `body` (Markdown), `images` (media array), `imageMetadata` (component)
- **Sections**: Hierarchical organization
- **Media Relation**: Tracks original paths and checksums
- **Migration tracking**: `externalId`, `migrationChecksum`, `originalSourcePath`

### Frontend Architecture (Astro)
- Static site generation (`prerender = true`)
- Data pipeline: Strapi → `build-data.mjs` → `src/data/*.json`
- Markdown rendering: `unified` → `remark` → `rehype` pipeline
- Styling: Tailwind CSS + `@tailwindcss/typography`

---

## Identified Issues & Improvements

### 1. Typography & Design System

**Problem**: Default Tailwind styles don't match old site's character

**Solution**:
- Add Google Fonts (Playfair Display, Open Sans)
- Define design tokens in Tailwind config:
  - Font families: Serif for headings, Sans for body
  - Warm color palette (beige backgrounds, brown accents)
  - Consistent spacing and line heights

### 2. Image Display & Layout

**Problem**: Images may not display at original sizes/positions

**Solution**:
- Enhance `rewriteUploads` to preserve image dimensions from metadata
- Add image component that:
  - Renders with correct width/height
  - Shows captions from `imageMetadata`
  - Handles responsive images with `srcset`
  - Preserves alignment (left/right/center float)
- Add figure/figcaption styling

### 3. Content Layout & Spacing

**Problem**: Default prose styles may not match old layout

**Solution**:
- Customize `@tailwindcss/typography` theme:
  - Proper spacing between paragraphs
  - List styling matching old site
  - Blockquote styling
  - Link colors matching theme
- Add container max-width for readability

### 4. YouTube & Embed Support

**Problem**: Old site contains YouTube embeds that need rendering

**Solution**:
- Add `rehype-embed` or custom plugin to transform YouTube URLs to iframes
- Support for Google Drive embeds
- Responsive embed container (16:9 aspect ratio)

### 5. Navigation Enhancement

**Problem**: Basic sidebar doesn't match old site's navigation

**Solution**:
- Improve sidebar with:
  - Active state styling
  - Better expand/collapse animations
  - Scroll-spy for current section
- Add section headers with descriptions

### 6. SEO & Meta Tags

**Problem**: Missing some SEO optimizations

**Solution**:
- Enhanced `lib/seo.js`:
  - Schema.org structured data (WebPage, Article)
  - Open Graph image from page's featured image
  - Twitter card tags
  - Canonical URLs with proper trailing slashes

### 7. Breadcrumbs

**Problem**: Current breadcrumbs are basic

**Solution**:
- Add Schema.org BreadcrumbList markup
- Improve styling to match navigation
- Handle edge cases (root page, missing parents)

### 8. Error Handling & Fallbacks

**Problem**: Missing content could cause errors

**Solution**:
- Add graceful error handling for:
  - Missing pages (404 page)
  - Broken image links (placeholder with info)
  - Invalid markdown (fallback to raw text)
- Add loading states for data fetching

---

## Implementation Tasks

### Phase 1: Design System & Typography
1. [ ] Update `tailwind.config.cjs` with custom theme
2. [ ] Add Google Fonts via `@fontsource` or link tags
3. [ ] Create base CSS layer with design tokens

### Phase 2: Image Handling
1. [ ] Enhance `lib/markdown.js` with image dimension handling
2. [ ] Create `components/Image.astro` component
3. [ ] Add image caption support
4. [ ] Implement responsive image attributes

### Phase 3: Content Rendering
1. [ ] Customize typography prose styles
2. [ ] Add YouTube embed support
3. [ ] Add Google Drive embed support
4. [ ] Style blockquotes and special content blocks

### Phase 4: Navigation & UI
1. [ ] Improve sidebar component styling
2. [ ] Add breadcrumb component with schema markup
3. [ ] Create 404 error page
4. [ ] Add skip links and accessibility improvements

### Phase 5: SEO & Metadata
1. [ ] Enhance SEO library with schema markup
2. [ ] Add Open Graph image generation
3. [ ] Implement proper canonical URLs
4. [ ] Add sitemap improvements

### Phase 6: Validation & Testing
1. [ ] Visual regression testing (compare with old site)
2. [ ] Image rendering validation
3. [ ] Cross-browser testing
4. [ ] Accessibility audit

---

## File Changes Summary

| File | Change |
|------|--------|
| `frontend/tailwind.config.cjs` | Add custom theme, fonts, colors |
| `frontend/src/styles/tailwind.css` | Base styles, typography overrides |
| `frontend/src/lib/markdown.js` | Enhanced image handling, embeds |
| `frontend/src/lib/seo.js` | Schema.org markup, OG tags |
| `frontend/src/components/Layout.astro` | Header/footer improvements |
| `frontend/src/components/Image.astro` | New image component |
| `frontend/src/components/Sidebar.tsx` | Enhanced navigation |
| `frontend/src/components/Breadcrumbs.astro` | Schema markup |
| `frontend/src/pages/404.astro` | Error page |
| `frontend/src/pages/[...slug].astro` | Enhanced content rendering |

---

## Visual Comparison Strategy

To ensure accuracy:
1. Compare key pages side-by-side
2. Check image placements and sizes
3. Verify typography and spacing
4. Test navigation hierarchy
5. Validate embedded content (YouTube, Drive)

---

## Next Steps

1. Review and approve this plan
2. Switch to Code mode for implementation
3. Implement Phase 1 (Design System)
4. Validate changes against old site
5. Iterate through remaining phases
