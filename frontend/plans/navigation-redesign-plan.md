# Navigation Redesign Plan - Top-Down Expandable Navigation

## Overview

Improve the navigation overlay with a top-down approach where main categories are displayed first, and sub-items are revealed when a category is selected. This reduces cognitive load and creates a cleaner, more discoverable interface.

---

## Current State Analysis

### Issues with Current Design
1. **Information Overload**: All sections and items are displayed at once, creating a long scroll
2. **No Visual Hierarchy**: Users can't quickly scan main categories
3. **No Interactive Cues**: Sections appear static, not inviting interaction
4. **Poor Mobile Experience**: Long scrolling on small screens

### Current Navigation Flow
```
Navigation Opens
  ↓
All sections displayed (Deutsch, Geschichte, Medien, Projekte, Techzap, Artikel, Contact)
  ↓
All items within each section visible
  ↓
User must scroll through entire content
```

---

## Proposed Design: Top-Down Expandable Navigation

### New Navigation Flow
```
Navigation Opens
  ↓
Main categories displayed (collapsed state)
  ↓
User clicks/presses category
  ↓
Category expands to show sub-items
  ↓
Other categories remain collapsed
```

### Key Design Principles

1. **Progressive Disclosure**: Show only essential information first, reveal details on demand
2. **Visual Hierarchy**: Clear distinction between categories and items
3. **Interactive Cues**: Subtle animations indicating clickability
4. **Keyboard Accessible**: Full keyboard navigation support
5. **Responsive**: Works seamlessly on all devices

---

## Component Architecture

### New Components

#### 1. NavCategory (New)
```
Purpose: Display main category header with expand/collapse functionality

Props:
- section: Section data
- index: Number for ordering
- isExpanded: Boolean state
- onToggle: Function to handle expand/collapse

Features:
- Chevron icon (rotates on expand)
- Section number
- Section title
- Item count badge
- Subtle pulse animation on hover
- Keyboard accessible (Enter/Space to toggle)
```

#### 2. NavCategoryItems (New)
```
Purpose: Render sub-items when category is expanded

Props:
- items: Array of navigation items
- sectionKey: For styling and counts
- isVisible: Boolean for animation

Features:
- Staggered fade-in animation
- Item cards with hover effects
- Smooth height transition
```

### Modified Components

#### NavSection (Modified)
```
Changes:
- Add state management for expand/collapse
- Integrate NavCategory and NavCategoryItems
- Handle keyboard events
- Manage animation timing

New Props:
- defaultExpanded: Boolean (optional, default false)
```

#### NavigationOverlay (Modified)
```
Changes:
- Pass expanded state management to NavSection
- Update CSS classes for accordion behavior
- Ensure proper focus management
```

---

## Visual Design

### Color Scheme: The "Archival" Palette

The site maintains a beautiful "Academic/Archival" aesthetic—clean, serif-heavy, and spacious. These improvements preserve that "reading room" vibe while implementing new functionality.

#### Section-Specific Accent Colors
```css
/* Current colors (keep and refine) */
--section-deutsch: #c4785a;     /* Terra cotta */
--section-geschichte: #8b9a7d;   /* Sage green */
--section-medien: #d4a373;       /* Amber */
--section-projekte: #2d3a4f;      /* Deep navy */
--section-techzap: #5a5145;       /* Warm brown */
--section-artikel: #7a6f60;       /* Taupe */
--section-contact: #b8895a;       /* Bronze */

/* Strategic tinted backgrounds for active states */
--section-deutsch-tint: rgba(196, 120, 90, 0.08);   /* Faint terra cotta */
--section-geschichte-tint: rgba(139, 154, 125, 0.08); /* Faint sage */
--section-medien-tint: rgba(212, 163, 115, 0.08);   /* Faint amber */
--section-projekte-tint: rgba(45, 58, 79, 0.08);    /* Faint navy */
--section-techzap-tint: rgba(90, 81, 69, 0.08);     /* Faint brown */
--section-artikel-tint: rgba(122, 111, 96, 0.08);  /* Faint taupe */
--section-contact-tint: rgba(184, 137, 90, 0.08);  /* Faint bronze */
```

#### The "Ink & Paper" Color Concept
```css
/* Background: Keep the warm cream base */
--nav-bg: #faf8f5;              /* Warm cream - base background */

/* Text Colors */
--nav-text-primary: #2d3a4f;    /* Dark navy - main text */
--nav-text-secondary: #6b7280;  /* Medium grey - descriptions */
--nav-text-muted: #9ca3af;      /* Light grey - metadata */

/* Numbers and Chevrons: Use section accent colors */
--nav-number-color: var(--section-accent); /* Applied dynamically */
--nav-chevron-color: var(--section-accent); /* Applied dynamically */

/* Visual Separation: Thin, semi-transparent borders */
--nav-border: rgba(0, 0, 0, 0.05);  /* Very thin, notebook-like lines */
--nav-border-hover: rgba(0, 0, 0, 0.08); /* Slightly darker on hover */
```

**Color Application Strategy:**
- **Background**: Keep `var(--nav-bg)` (#faf8f5) as the base
- **Active State**: Use tinted background based on section color (e.g., `rgba(196, 120, 90, 0.08)` for Deutsch) - feels like highlighting a manuscript
- **Numbers as Anchors**: Use section accent color specifically for index numbers (01, 02) and chevrons
- **Main Text**: Keep dark (#2d3a4f) for readability - creates sophisticated color coding without overwhelming the eye
- **Visual Separation**: Use very thin, semi-transparent border (1px solid rgba(0,0,0,0.05)) mimicking notebook lines

### Typography Hierarchy: Editorial Style

**Simplified Font Strategy:**
Using three different serif fonts can create visual clutter and "font fighting." The refined approach uses better contrast with fewer fonts.

```
Category Header (Level 1):
  Font: Playfair Display
  Size: 1.75rem (desktop), 1.5rem (tablet), 1.25rem (mobile)
  Weight: 700 (Bold)
  Color: var(--nav-text-primary)
  Note: Matches the "Mein Großvater..." headline style

Sub-Items (Level 2) - Option A (Recommended):
  Font: Cormorant Garamond Italic
  Size: 1.25rem
  Weight: 400 (Regular)
  Style: Italic
  Color: var(--nav-text-primary)
  Note: Italics are used for book titles/sub-classifications in academic texts

Sub-Items (Level 2) - Option B (Alternative):
  Font: Inter or Lato (Sans-serif)
  Size: 1.125rem
  Weight: 500 (Medium)
  Color: var(--nav-text-primary)
  Note: Clean, geometric sans-serif for contrast

Item Description (Level 3):
  Font: Inter (Sans-serif) - if using Option A above
  Font: Cormorant Garamond (Serif) - if using Option B above
  Size: 0.85rem
  Weight: 400
  Letter-spacing: 0.02em
  Text-transform: uppercase (optional, for "label" style)
  Color: var(--nav-text-secondary)
  Opacity: 0.7
  Note: Ensures legibility at small sizes
```

**Revised Hierarchy Example:**
```
01 Deutsch (Playfair Bold, Dark Navy)
   Sprachkunst und Textinterpretation (Cormorant Italic, Dark Grey)
   Essays and analysis of classic texts (Inter, Light Grey)
```

---

## Interaction Design

### Expand/Collapse States

#### Collapsed State (Default)
```
┌─────────────────────────────────────────────┐
│ 01  Deutsch                    [12] ▶  │  ← Chevron points right
│     Sprachkunst und Textinterpretation    │
└─────────────────────────────────────────────┘
```

#### Expanded State
```
┌─────────────────────────────────────────────┐
│ 01  Deutsch                    [12] ▼  │  ← Chevron points down
│     Sprachkunst und Textinterpretation    │
│ ┌───────────────────────────────────────┐  │
│ │ Erörterung                        │  │
│ │ Essay-Themen                     │  │  ← Items fade in
│ │ Textinterpretation                 │  │
│ └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### Visual Cues for Interactivity

#### 1. Hover Animation - The "Drift" (Organic)
**Critique of Pulse Animation**: A "pulse" (scaling up/down) often feels like a "Buy Now" button or a gaming UI. It conflicts with the serene, historical vibe of the site.

**Recommended "Drift" Animation**: Instead of scaling, translate the text and the arrow slightly to the right. This mimics the motion of pulling a book off a shelf or opening a drawer.

```css
.nav-category-header {
  transition: background-color 0.3s ease, color 0.3s ease;
}

.nav-category-header:hover .nav-category-content {
  /* Move text slightly right instead of pulsing */
  transform: translateX(10px);
  transition: transform 0.4s cubic-bezier(0.215, 0.610, 0.355, 1.000);
}

.nav-category-header:hover .nav-category-chevron {
  /* Chevron also drifts with the content */
  transform: translateX(10px) rotate(0deg);
  transition: transform 0.4s cubic-bezier(0.215, 0.610, 0.355, 1.000);
}

.nav-category[aria-expanded="true"] .nav-category-chevron {
  /* Rotate when expanded */
  transform: translateX(10px) rotate(90deg);
}
```

#### 2. Chevron Rotation (Centered)
**Important**: Ensure the rotation is perfectly centered. Use a circular container for the SVG to ensure the axis of rotation is center.

```css
.nav-category-chevron-container {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.nav-category-chevron {
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-category[aria-expanded="true"] .nav-category-chevron {
  transform: rotate(90deg);
}
```

#### 3. Active State - The "Tint"
Instead of a generic grey hover, use a tinted background based on the section color. This feels like highlighting a manuscript.

```css
/* Refined Active State - The "Tint" */
.nav-category[data-section="deutsch"]:hover,
.nav-category[data-section="deutsch"][aria-expanded="true"] {
  /* Subtle tint of the accent color */
  background-color: rgba(196, 120, 90, 0.08);
  border-left: 4px solid var(--section-deutsch);
}

.nav-category[data-section="geschichte"]:hover,
.nav-category[data-section="geschichte"][aria-expanded="true"] {
  background-color: rgba(139, 154, 125, 0.08);
  border-left: 4px solid var(--section-geschichte);
}

/* Apply similar pattern for other sections */
```

#### 4. Visual Separation
Use very thin, semi-transparent borders between items rather than heavy dividers. This mimics the lines of a notebook.

```css
.nav-category {
  border-bottom: 1px solid var(--nav-border);
}

.nav-category:hover {
  border-bottom: 1px solid var(--nav-border-hover);
}
```

---

## Animation System: Organic vs. Mechanical

### The "Unfold" Animation (Expansion)
The staggered fade-in is excellent. Enhance it by adding a slight translateY to the sub-items. They should slide down into place as they fade in, as if a paper list is unrolling.

### Expand Animation Sequence
```
1. User clicks category (0ms)
   ↓
2. Chevron rotates (300ms, cubic-bezier(0.4, 0, 0.2, 1))
   ↓
3. Background highlights with tint (200ms, ease-out)
   ↓
4. Items container expands (400ms, cubic-bezier(0.4, 0, 0.2, 1))
   ↓
5. Items fade in with stagger and slide down (400ms total, 50ms per item)
```

### Collapse Animation Sequence
```
1. User clicks expanded category (0ms)
   ↓
2. Chevron rotates back (300ms, cubic-bezier(0.4, 0, 0.2, 1))
   ↓
3. Background returns to normal (200ms, ease-out)
   ↓
4. Items container collapses (300ms, cubic-bezier(0.4, 0, 0.2, 1))
   ↓
5. Items fade out and slide up (200ms, ease-out)
```

### CSS Keyframes
```css
/* Chevron rotation */
@keyframes chevronRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(90deg); }
}

/* Container expand */
@keyframes containerExpand {
  0% {
    max-height: 0;
    opacity: 0;
  }
  100% {
    max-height: 1000px;
    opacity: 1;
  }
}

/* Item reveal - The "Unfold" */
@keyframes itemReveal {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Item collapse */
@keyframes itemCollapse {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-10px);
  }
}
```

### Staggered Animation Implementation
```css
.nav-category-item {
  opacity: 0;
  transform: translateY(10px);
  animation: itemReveal 0.4s ease-out forwards;
}

/* Stagger each item */
.nav-category-item:nth-child(1) { animation-delay: 0ms; }
.nav-category-item:nth-child(2) { animation-delay: 50ms; }
.nav-category-item:nth-child(3) { animation-delay: 100ms; }
.nav-category-item:nth-child(4) { animation-delay: 150ms; }
.nav-category-item:nth-child(5) { animation-delay: 200ms; }
.nav-category-item:nth-child(6) { animation-delay: 250ms; }
.nav-category-item:nth-child(7) { animation-delay: 300ms; }
.nav-category-item:nth-child(8) { animation-delay: 350ms; }
.nav-category-item:nth-child(9) { animation-delay: 400ms; }
.nav-category-item:nth-child(10) { animation-delay: 450ms; }
```

---

## Keyboard Navigation

### Keyboard Support

#### Tab Navigation
- Tab through category headers
- Tab through expanded items
- Proper focus indicators

#### Enter/Space to Toggle
```
Category header focused
  ↓
Press Enter or Space
  ↓
Category expands/collapses
  ↓
Focus moves to first item (if expanding)
```

#### Escape to Close
```
Any state
  ↓
Press Escape
  ↓
All categories collapse
  ↓
Overlay closes
```

#### Arrow Keys (Optional Enhancement)
```
Up/Down: Navigate between categories
Right: Expand focused category
Left: Collapse focused category
```

---

## Space & Layout: The "Indented Outline"

The screenshots show generous whitespace. The navigation should mirror this with a clean, structured layout.

### The "Hanging Indent" Approach

When a category expands, sub-items are aligned with the text "Deutsch" rather than the number "01". This creates a clean vertical line for the eye to follow and clearly separates parent from child.

```
Collapsed State:
┌─────────────────────────────────────────────┐
│ 01  Deutsch                    [12] ▶  │
│     Sprachkunst und Textinterpretation    │
└─────────────────────────────────────────────┘

Expanded State (with hanging indent):
┌─────────────────────────────────────────────┐
│ 01  Deutsch                    [12] ▼  │
│     Sprachkunst und Textinterpretation    │
│ ┌───────────────────────────────────────┐  │
│ │   Erörterung                        │  │  ← Aligned with "Deutsch"
│ │   Essay-Themen                     │  │
│ │   Textinterpretation                 │  │
│ └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

**CSS Implementation:**
```css
.nav-category-header {
  padding: 1.5rem 0; /* Generous vertical rhythm */
}

.nav-category-items {
  margin-left: 3.5rem; /* Align with category text, not number */
  padding-top: 0.5rem;
  padding-bottom: 1rem;
  border-left: 1px solid var(--nav-border);
}
```

### Vertical Rhythm

Increase padding on NavCategory headers to let them breathe. Currently, they look a bit tight in standard lists.

```css
.nav-category-header {
  padding: 1.5rem 0; /* Increased from 1rem */
  border-bottom: 1px solid var(--nav-border);
}
```

## Responsive Design

### Desktop (1024px+): Split View "Preview" Pane
```
Layout: 2-column grid (Split View)
- Left Column: The list of Categories (01, 02, 03) - fixed width
- Right Column: When "Deutsch" is hovered/clicked, sub-items appear in the right column (fixed position)

Benefits:
- Prevents the menu from "jumping" vertically
- Feels more like browsing a library index
- Multiple categories can be expanded
- Smooth transitions
- Maximum visual impact

Category Width: 400px
Items Width: Remaining space (flex-grow)
```

**Desktop CSS:**
```css
@media (min-width: 1024px) {
  .nav-section {
    display: grid;
    grid-template-columns: 400px 1fr;
    gap: 2rem;
  }

  .nav-category-items {
    position: fixed;
    left: 400px;
    top: 0;
    right: 0;
    height: 100%;
    overflow-y: auto;
    padding: 2rem;
    background: var(--nav-bg);
  }
}
```

### Tablet (640px - 1024px)
```
Layout: Single column, stacked
- Categories displayed vertically
- Expanded items appear below category (accordion style)
- Hanging indent applied to sub-items

Behavior:
- One category expanded at a time (accordion)
- Smooth scroll to expanded category
- Touch-friendly targets (44px min)
```

### Mobile (< 640px)
```
Layout: Single column, stacked
- Categories displayed vertically
- Expanded items appear below category (accordion style)
- Hanging indent applied to sub-items

Behavior:
- One category expanded at a time (accordion)
- Smooth scroll to expanded category
- Large touch targets (48px min)
- Simplified animations
```

---

## Complete CSS Implementation

Here is a comprehensive CSS summary incorporating all the refined design suggestions:

```css
/* ========================================
   NAVIGATION REDESIGN - ARCHIVAL PALETTE
   ======================================== */

/* CSS Variables - Archival Palette */
:root {
  /* Section Accent Colors */
  --section-deutsch: #c4785a;
  --section-geschichte: #8b9a7d;
  --section-medien: #d4a373;
  --section-projekte: #2d3a4f;
  --section-techzap: #5a5145;
  --section-artikel: #7a6f60;
  --section-contact: #b8895a;

  /* Strategic Tinted Backgrounds */
  --section-deutsch-tint: rgba(196, 120, 90, 0.08);
  --section-geschichte-tint: rgba(139, 154, 125, 0.08);
  --section-medien-tint: rgba(212, 163, 115, 0.08);
  --section-projekte-tint: rgba(45, 58, 79, 0.08);
  --section-techzap-tint: rgba(90, 81, 69, 0.08);
  --section-artikel-tint: rgba(122, 111, 96, 0.08);
  --section-contact-tint: rgba(184, 137, 90, 0.08);

  /* Ink & Paper Colors */
  --nav-bg: #faf8f5;
  --nav-text-primary: #2d3a4f;
  --nav-text-secondary: #6b7280;
  --nav-text-muted: #9ca3af;

  /* Visual Separation */
  --nav-border: rgba(0, 0, 0, 0.05);
  --nav-border-hover: rgba(0, 0, 0, 0.08);

  /* Easing Functions */
  --ease-drift: cubic-bezier(0.215, 0.610, 0.355, 1.000);
  --ease-unfold: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-editorial: ease-out;
}

/* ========================================
   CATEGORY HEADER
   ======================================== */

.nav-category {
  border-bottom: 1px solid var(--nav-border);
  transition: border-color 0.3s ease;
}

.nav-category:hover {
  border-bottom: 1px solid var(--nav-border-hover);
}

.nav-category-header {
  padding: 1.5rem 0; /* Generous vertical rhythm */
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.nav-category-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.4s var(--ease-drift);
}

.nav-category-header:hover .nav-category-content {
  transform: translateX(10px);
}

/* Category Number - Section Accent Color */
.nav-category-number {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  font-size: 1.75rem;
  color: var(--section-accent); /* Applied dynamically */
  min-width: 2.5rem;
}

/* Category Title - Playfair Bold */
.nav-category-title {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  font-size: 1.75rem;
  color: var(--nav-text-primary);
}

/* Category Subtitle */
.nav-category-subtitle {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 1.125rem;
  color: var(--nav-text-primary);
  margin-left: 0.5rem;
}

/* Item Count Badge */
.nav-category-count {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: var(--nav-text-muted);
  background: var(--nav-border);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

/* ========================================
   CHEVRON ICON
   ======================================== */

.nav-category-chevron-container {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.nav-category-chevron {
  width: 16px;
  height: 16px;
  color: var(--section-accent); /* Applied dynamically */
  transition: transform 300ms var(--ease-unfold);
}

.nav-category-header:hover .nav-category-chevron {
  transform: translateX(10px);
}

.nav-category[aria-expanded="true"] .nav-category-chevron {
  transform: translateX(10px) rotate(90deg);
}

/* ========================================
   ACTIVE STATE - THE "TINT"
   ======================================== */

.nav-category[data-section="deutsch"]:hover,
.nav-category[data-section="deutsch"][aria-expanded="true"] {
  background-color: var(--section-deutsch-tint);
  border-left: 4px solid var(--section-deutsch);
}

.nav-category[data-section="geschichte"]:hover,
.nav-category[data-section="geschichte"][aria-expanded="true"] {
  background-color: var(--section-geschichte-tint);
  border-left: 4px solid var(--section-geschichte);
}

.nav-category[data-section="medien"]:hover,
.nav-category[data-section="medien"][aria-expanded="true"] {
  background-color: var(--section-medien-tint);
  border-left: 4px solid var(--section-medien);
}

.nav-category[data-section="projekte"]:hover,
.nav-category[data-section="projekte"][aria-expanded="true"] {
  background-color: var(--section-projekte-tint);
  border-left: 4px solid var(--section-projekte);
}

.nav-category[data-section="techzap"]:hover,
.nav-category[data-section="techzap"][aria-expanded="true"] {
  background-color: var(--section-techzap-tint);
  border-left: 4px solid var(--section-techzap);
}

.nav-category[data-section="artikel"]:hover,
.nav-category[data-section="artikel"][aria-expanded="true"] {
  background-color: var(--section-artikel-tint);
  border-left: 4px solid var(--section-artikel);
}

.nav-category[data-section="contact"]:hover,
.nav-category[data-section="contact"][aria-expanded="true"] {
  background-color: var(--section-contact-tint);
  border-left: 4px solid var(--section-contact);
}

/* ========================================
   CATEGORY ITEMS - HANGING INDENT
   ======================================== */

.nav-category-items {
  margin-left: 3.5rem; /* Align with category text, not number */
  padding-top: 0.5rem;
  padding-bottom: 1rem;
  border-left: 1px solid var(--nav-border);
  overflow: hidden;
  transition: max-height 400ms var(--ease-unfold), opacity 300ms ease;
}

.nav-category-item {
  opacity: 0;
  transform: translateY(10px);
  animation: itemReveal 0.4s var(--ease-editorial) forwards;
  padding: 0.75rem 0;
}

/* Staggered Animation */
.nav-category-item:nth-child(1) { animation-delay: 0ms; }
.nav-category-item:nth-child(2) { animation-delay: 50ms; }
.nav-category-item:nth-child(3) { animation-delay: 100ms; }
.nav-category-item:nth-child(4) { animation-delay: 150ms; }
.nav-category-item:nth-child(5) { animation-delay: 200ms; }
.nav-category-item:nth-child(6) { animation-delay: 250ms; }
.nav-category-item:nth-child(7) { animation-delay: 300ms; }
.nav-category-item:nth-child(8) { animation-delay: 350ms; }
.nav-category-item:nth-child(9) { animation-delay: 400ms; }
.nav-category-item:nth-child(10) { animation-delay: 450ms; }

/* Item Title - Cormorant Italic */
.nav-item-title {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 1.25rem;
  font-weight: 400;
  color: var(--nav-text-primary);
  display: block;
  margin-bottom: 0.25rem;
}

/* Item Description - Inter Sans-serif */
.nav-item-desc {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--nav-text-secondary);
  opacity: 0.7;
}

/* ========================================
   ANIMATIONS
   ======================================== */

@keyframes itemReveal {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes itemCollapse {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-10px);
  }
}

/* ========================================
   RESPONSIVE - DESKTOP SPLIT VIEW
   ======================================== */

@media (min-width: 1024px) {
  .nav-section {
    display: grid;
    grid-template-columns: 400px 1fr;
    gap: 2rem;
  }

  .nav-category-items {
    position: fixed;
    left: 400px;
    top: 0;
    right: 0;
    height: 100%;
    overflow-y: auto;
    padding: 2rem;
    background: var(--nav-bg);
    border-left: 1px solid var(--nav-border);
  }
}

/* ========================================
   RESPONSIVE - TABLET & MOBILE
   ======================================== */

@media (max-width: 1023px) {
  .nav-category-title {
    font-size: 1.5rem;
  }

  .nav-category-number {
    font-size: 1.5rem;
  }
}

@media (max-width: 639px) {
  .nav-category-header {
    padding: 1.25rem 0;
  }

  .nav-category-title {
    font-size: 1.25rem;
  }

  .nav-category-number {
    font-size: 1.25rem;
    min-width: 2rem;
  }

  .nav-category-items {
    margin-left: 2.5rem;
  }

  .nav-item-title {
    font-size: 1.125rem;
  }
}
```

---

## Accessibility Features

### ARIA Attributes
```html
<div
  class="nav-category"
  role="button"
  aria-expanded="true/false"
  aria-controls="category-items-{id}"
  tabindex="0"
>
  <!-- Category content -->
</div>

<div
  id="category-items-{id}"
  role="region"
  aria-labelledby="category-header-{id}"
  hidden="true/false"
>
  <!-- Items -->
</div>
```

### Screen Reader Announcements
```
Category expanded: "Deutsch expanded, 12 items available"
Category collapsed: "Deutsch collapsed"
```

### Focus Management
```
1. Category header focused
   ↓
2. User presses Enter/Space
   ↓
3. Category expands
   ↓
4. Focus moves to first item link
   ↓
5. User can Tab through items
   ↓
6. Shift+Tab returns to category header
```

---

## Implementation Steps

### Step 1: Foundation - CSS Variables & Color System
**Objective**: Establish the "Archival" color palette as the foundation for all navigation styling.

**Tasks**:
1. Add CSS variables for section accent colors (Deutsch, Geschichte, Medien, etc.)
2. Add CSS variables for tinted backgrounds (rgba with 0.08 opacity)
3. Add "Ink & Paper" color variables (nav-bg, nav-text-primary, etc.)
4. Add visual separation variables (nav-border, nav-border-hover)
5. Add easing function variables (--ease-drift, --ease-unfold, --ease-editorial)

**Files to Modify**:
- `frontend/src/styles/tailwind.css`

**Success Criteria**:
- All color variables are defined and accessible
- Tinted backgrounds are calculated correctly
- Easing functions are ready for animations

---

### Step 2: Component Structure - NavCategory & NavCategoryItems
**Objective**: Create expandable category components with proper HTML structure.

**Tasks**:
1. Create [`NavCategory.tsx`](frontend/src/components/navigation/NavCategory.tsx) component
   - Add chevron icon SVG with circular container
   - Implement section number, title, and subtitle display
   - Add item count badge
   - Set up expand/collapse state management
   - Add keyboard accessibility (Enter/Space to toggle)
2. Create [`NavCategoryItems.tsx`](frontend/src/components/navigation/NavCategoryItems.tsx) component
   - Render sub-items with hanging indent
   - Add staggered animation delays
   - Include item title and description

**Files to Create**:
- `frontend/src/components/navigation/NavCategory.tsx`
- `frontend/src/components/navigation/NavCategoryItems.tsx`

**Success Criteria**:
- Components render correctly in collapsed state
- Chevron icon displays with proper container
- Keyboard navigation works (Enter/Space toggles)
- ARIA attributes are properly set

---

### Step 3: Typography & Spacing - Editorial Hierarchy
**Objective**: Implement the refined typography system and generous spacing.

**Tasks**:
1. Apply typography hierarchy to components
   - Category Headers: Playfair Display Bold (1.75rem desktop, 1.5rem tablet, 1.25rem mobile)
   - Sub-Items: Cormorant Garamond Italic (1.25rem) OR Inter Sans-serif (1.125rem)
   - Item Descriptions: Inter Sans-serif (0.85rem, uppercase, letter-spacing 0.02em)
2. Implement hanging indent layout
   - Align sub-items with category text (margin-left: 3.5rem)
   - Add border-left to items container
3. Apply vertical rhythm
   - Increase header padding to 1.5rem 0
   - Add generous spacing between items (padding: 0.75rem 0)
4. Apply section accent colors to numbers and chevrons

**Files to Modify**:
- `frontend/src/components/navigation/NavCategory.tsx`
- `frontend/src/components/navigation/NavCategoryItems.tsx`
- `frontend/src/styles/tailwind.css`

**Success Criteria**:
- Typography matches editorial hierarchy specification
- Hanging indent aligns sub-items correctly
- Vertical rhythm feels spacious and breathable
- Section accent colors appear on numbers and chevrons

---

### Step 4: Interactions & Animations - Drift & Unfold
**Objective**: Implement organic animations that enhance the "reading room" experience.

**Tasks**:
1. Implement "Drift" hover animation
   - Translate content 10px right on hover (translateX)
   - Use cubic-bezier(0.215, 0.610, 0.355, 1.000) easing
   - Apply to both content and chevron
2. Implement "Unfold" expansion animation
   - Chevron rotates 90deg with centered axis
   - Items slide down (translateY 10px to 0)
   - Stagger items with 50ms delays
3. Implement "Tint" active state
   - Apply tinted background based on section color
   - Add 4px left border with section accent color
4. Add visual separation
   - Thin borders (1px solid rgba(0,0,0,0.05))
   - Slightly darker on hover

**Files to Modify**:
- `frontend/src/styles/tailwind.css`
- `frontend/src/components/navigation/NavCategory.tsx`

**Success Criteria**:
- Hover drift animation feels organic and smooth
- Chevron rotation is perfectly centered
- Items unfold with staggered animation
- Tinted backgrounds appear on hover/active states
- No "pulse" or mechanical scaling effects

---

### Step 5: Responsive Layout & Integration
**Objective**: Implement the desktop split view and integrate components into the navigation system.

**Tasks**:
1. Implement desktop split view (1024px+)
   - 2-column grid: 400px left column, flexible right column
   - Fixed positioning for items panel (left: 400px, right: 0)
   - Prevents menu "jumping" vertically
2. Implement tablet layout (640px - 1024px)
   - Single column, stacked accordion
   - Hanging indent applied
   - Touch-friendly targets (44px min)
3. Implement mobile layout (< 640px)
   - Single column, stacked accordion
   - Hanging indent applied (2.5rem margin-left)
   - Large touch targets (48px min)
   - Simplified animations
4. Integrate components into NavSection
   - Replace existing navigation structure
   - Connect state management
   - Test expand/collapse behavior
5. Update NavigationOverlay
   - Ensure proper focus management
   - Test keyboard navigation (Tab, Enter, Space, Escape)

**Files to Modify**:
- `frontend/src/components/navigation/NavSection.tsx`
- `frontend/src/components/navigation/NavigationOverlay.tsx`
- `frontend/src/styles/tailwind.css`

**Success Criteria**:
- Desktop split view works without menu jumping
- Tablet and mobile layouts are responsive
- Touch targets meet size requirements
- Keyboard navigation is fully functional
- All categories expand/collapse correctly
- Animations are smooth on all devices

---

## Files to Modify

### New Files
- `frontend/src/components/navigation/NavCategory.tsx`
- `frontend/src/components/navigation/NavCategoryItems.tsx`

### Modified Files
- `frontend/src/components/navigation/NavSection.tsx`
- `frontend/src/components/navigation/NavigationOverlay.tsx`
- `frontend/src/styles/tailwind.css`

### Documentation Files
- `frontend/plans/navigation-implementation.md` (update)
- `frontend/plans/navigation-redesign-plan.md` (this file)

---

## Testing Checklist

### Functional Testing
- [ ] Categories display correctly in collapsed state
- [ ] Clicking category expands to show items
- [ ] Clicking expanded category collapses items
- [ ] Chevron icon rotates on expand/collapse
- [ ] Items animate in with stagger
- [ ] Multiple categories can be expanded (desktop)
- [ ] Only one category expanded at a time (mobile/tablet)

### Keyboard Testing
- [ ] Tab navigates through categories
- [ ] Enter/Space toggles expand/collapse
- [ ] Focus moves to first item after expand
- [ ] Shift+Tab returns to category
- [ ] Escape closes overlay

### Responsive Testing
- [ ] Desktop: 2-column layout works
- [ ] Tablet: Stacked layout works
- [ ] Mobile: Touch targets are large enough
- [ ] Animations are smooth on all devices

### Accessibility Testing
- [ ] Screen reader announces state changes
- [ ] ARIA attributes are correct
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA

---

## Success Criteria

The navigation redesign will be successful when:

1. ✅ Main categories are immediately visible and scannable
2. ✅ Sub-items are revealed on demand, reducing initial load
3. ✅ Visual cues clearly indicate interactivity
4. ✅ Animations are smooth and enhance the experience
5. ✅ Keyboard navigation is fully supported
6. ✅ Design works seamlessly on all devices
7. ✅ Accessibility standards are met
8. ✅ Performance remains excellent (60fps animations)

---

## References

- [Current Navigation Implementation](navigation-implementation.md)
- [Design Specification](navigation-design-spec.md)
- [Academic Editorial Design Spec](academic-editorial-design-spec.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
