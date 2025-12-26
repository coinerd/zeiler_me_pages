# Academic Editorial Design Specification
## zeiler.me Frontend Redesign

---

## Design Philosophy

The **Academic Editorial** aesthetic combines the gravitas of scholarly publications with modern editorial sophistication. This design respects the academic nature of the content while creating a distinctive, memorable visual identity.

### Core Principles

1. **Typography-First**: Typography is the primary design element
2. **Readability Focus**: Optimized for long-form educational content
3. **Editorial Sophistication**: Magazine-quality layouts and details
4. **Subtle Elegance**: Refined details that reward attention
5. **Content Hierarchy**: Clear visual hierarchy for complex information

---

## Typography System

### Font Families

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Display | Instrument Serif | 400, 600, 700 | H1, H2, page titles |
| Headings | Instrument Serif | 600, 700 | H3-H6, section headers |
| Body | Crimson Pro | 400, 500, 600 | Paragraphs, body text |
| Body Italic | Crimson Pro | 400i, 600i | Emphasis, citations |
| Mono | JetBrains Mono | 400, 500 | Code, technical content |

### Typography Scale

| Element | Size | Line Height | Letter Spacing |
|---------|------|-------------|---------------|
| H1 | 3rem (48px) | 1.1 | -0.02em |
| H2 | 2.25rem (36px) | 1.2 | -0.01em |
| H3 | 1.75rem (28px) | 1.3 | 0 |
| H4 | 1.25rem (20px) | 1.4 | 0 |
| Body | 1.125rem (18px) | 1.7 | 0 |
| Small | 0.875rem (14px) | 1.5 | 0.01em |
| Caption | 0.75rem (12px) | 1.4 | 0.02em |

---

## Color Palette

### Primary Colors

```css
--color-ink: #1a2332;        /* Deep ink blue - primary text */
--color-ink-light: #2d3a4f;   /* Lighter ink for secondary text */
--color-cream: #faf8f5;       /* Paper-like background */
--color-cream-dark: #f5f2ed;  /* Darker cream for cards */
--color-white: #ffffff;       /* Pure white */
```

### Accent Colors

```css
--color-amber: #d4a373;      /* Warm amber - primary accent */
--color-amber-dark: #b8895a;  /* Darker amber for hover */
--color-amber-light: #e8c9a8; /* Light amber for backgrounds */
--color-sage: #8b9a7d;       /* Muted sage - secondary accent */
--color-rust: #c4785a;       /* Warm rust - tertiary accent */
```

### Neutral Grays

```css
--color-gray-50: #f9f8f6;
--color-gray-100: #f0ede8;
--color-gray-200: #e5e0d8;
--color-gray-300: #d4cfc4;
--color-gray-400: #b8b0a4;
--color-gray-500: #9a9082;
--color-gray-600: #7a6f60;
--color-gray-700: #5a5145;
--color-gray-800: #3d362e;
--color-gray-900: #25201b;
```

### Semantic Color Mapping

| Usage | Light Mode | Dark Mode |
|--------|------------|-----------|
| Background | `--color-cream` | `--color-ink` |
| Text Primary | `--color-ink` | `--color-cream` |
| Text Secondary | `--color-gray-600` | `--color-gray-400` |
| Accent | `--color-amber` | `--color-amber` |
| Border | `--color-gray-200` | `--color-gray-700` |
| Card Background | `--color-white` | `--color-gray-800` |

---

## Spacing System

### Base Unit: 4px

| Scale | Value | Usage |
|-------|-------|-------|
| 0 | 0 | None |
| 1 | 4px | Tight spacing |
| 2 | 8px | Small gaps |
| 3 | 12px | Compact spacing |
| 4 | 16px | Default spacing |
| 5 | 20px | Comfortable spacing |
| 6 | 24px | Section spacing |
| 8 | 32px | Large spacing |
| 10 | 40px | XL spacing |
| 12 | 48px | XXL spacing |
| 16 | 64px | Hero spacing |
| 20 | 80px | Section break |
| 24 | 96px | Major section |

---

## Component Specifications

### Header

**Structure**:
- Sticky positioning with backdrop blur
- Left: Logo/Brand name (Instrument Serif, bold)
- Center: Search bar (desktop)
- Right: Navigation indicator (mobile)

**Styling**:
- Background: `rgba(250, 248, 245, 0.95)` with backdrop blur
- Border: 1px solid `--color-gray-200`
- Height: 72px
- Logo: 1.5rem, `--color-ink`

**Interaction**:
- Hover on logo: Underline animation (amber)
- Focus states: 2px outline, `--color-amber`

### Sidebar Navigation

**Structure**:
- Fixed position on desktop (280px width)
- Collapsible sections
- Hierarchical tree view

**Styling**:
- Section headers: Instrument Serif, 1rem, semibold, `--color-ink`
- Section borders: 1px solid `--color-gray-200`
- Item text: Crimson Pro, 0.875rem, `--color-gray-600`
- Active item: `--color-amber-dark`, font-weight 600
- Hover: `--color-amber`, underline animation

**Expand/Collapse**:
- Button: 24x24px, rounded, `--color-gray-300` background
- Icon: Plus/minus, `--color-gray-600`
- Hover: `--color-amber` background, `--color-ink` icon

### Search Component

**Structure**:
- Input field with icon
- Dropdown results (max 8 items)

**Styling**:
- Input: Full width, 40px height, rounded-lg
- Background: `--color-white`
- Border: 1px solid `--color-gray-200`
- Focus: `--color-amber` border, 2px ring
- Placeholder: `--color-gray-400`

**Results Dropdown**:
- Background: `--color-white`
- Border: 1px solid `--color-gray-200`
- Shadow: `0 10px 40px rgba(0,0,0,0.1)`
- Item padding: 12px 16px
- Hover background: `--color-cream-dark`
- Title: `--color-ink`, 0.875rem, font-weight 500
- Summary: `--color-gray-500`, 0.75rem

### Table of Contents (TOC)

**Structure**:
- Sticky positioning (right column)
- H2 and H3 headings

**Styling**:
- Header: "Inhaltsverzeichnis", uppercase, 0.6875rem, `--color-gray-400`, tracking-wider
- H2 items: `--color-gray-600`, 0.875rem
- H3 items: Indented 16px, `--color-gray-500`, 0.8125rem
- Active: `--color-amber-dark`, font-weight 600
- Hover: `--color-amber`, underline animation

### Breadcrumbs

**Structure**:
- Horizontal list with chevron separators
- Current page: non-link, bold

**Styling**:
- Container: 0.875rem, `--color-gray-500`
- Links: `--color-gray-600`, underline-offset 2px
- Hover: `--color-amber`
- Separator: `›`, `--color-gray-300`, margin 8px
- Current: `--color-ink`, font-weight 600

### Homepage Cards

**Structure**:
- Section cards with intro
- Child items in grid (2 columns)

**Styling**:
- Card: `--color-white`, rounded-xl, border `--color-gray-200`
- Padding: 24px
- Shadow: `0 1px 3px rgba(0,0,0,0.05)`
- Hover: Shadow `0 4px 12px rgba(0,0,0,0.1)`, border `--color-amber-light`

**Section Title**:
- Font: Instrument Serif, 1.5rem, `--color-ink`
- Link: Underline animation, `--color-amber` on hover

**Intro Text**:
- Font: Crimson Pro, 1rem, `--color-gray-600`, line-height 1.6

**Child Items**:
- Grid: 2 columns, gap 12px
- Item: `--color-cream-dark`, rounded-lg, padding 16px
- Border: 1px solid `--color-gray-200`
- Hover: `--color-white`, border `--color-amber-light`

---

## Layout System

### Container Widths

| Breakpoint | Max Width | Padding |
|------------|------------|---------|
| Mobile (< 640px) | 100% | 16px |
| Tablet (640px - 1024px) | 100% | 24px |
| Desktop (1024px+) | 1200px | 32px |
| Large Desktop (1280px+) | 1400px | 40px |

### Grid Structure (Desktop)

```
┌─────────────────────────────────────────────────────────┐
│                    Header (72px)                     │
├──────────┬──────────────────────────────┬────────────┤
│          │                              │            │
│ Sidebar  │      Main Content             │   TOC      │
│ (280px)  │       (flex-1)               │  (240px)   │
│          │                              │            │
│ Sticky   │      Scrollable               │  Sticky    │
│          │                              │            │
└──────────┴──────────────────────────────┴────────────┘
```

### Mobile Layout

```
┌─────────────────────────┐
│   Header (72px)        │
├─────────────────────────┤
│   Search (mobile)      │
├─────────────────────────┤
│                         │
│   Main Content         │
│   (100% width)         │
│                         │
└─────────────────────────┘
```

---

## Animation System

### Page Load

1. **Header**: Fade in, slide down (300ms, ease-out)
2. **Sidebar**: Staggered fade in (items delay 50ms each)
3. **Main content**: Fade in, slide up (400ms, ease-out)
4. **TOC**: Fade in (500ms delay)

### Hover States

- **Links**: Underline expands from center (200ms, ease-out)
- **Buttons**: Scale 1.02, shadow increase (150ms, ease-out)
- **Cards**: Translate Y -4px, shadow increase (200ms, ease-out)

### Scroll Interactions

- **Content sections**: Fade in when 10% visible
- **TOC active state**: Smooth transition (200ms)
- **Sidebar**: Smooth scroll to active item

### Transitions

```css
transition-all duration-200 ease-out;
```

---

## Visual Details

### Decorative Elements

1. **Section Dividers**: Double line with 4px gap
   ```css
   border-top: 1px solid var(--color-gray-200);
   margin-top: 2px;
   ```

2. **Pull Quotes**: Large serif, italic, decorative border
   ```css
   border-left: 3px solid var(--color-amber);
   padding-left: 24px;
   font-size: 1.25rem;
   font-style: italic;
   ```

3. **Custom Bullets**: Small amber squares
   ```css
   list-style-type: none;
   padding-left: 20px;
   li::before {
     content: '';
     display: inline-block;
     width: 6px;
     height: 6px;
     background: var(--color-amber);
     margin-right: 12px;
     transform: translateY(-2px);
   }
   ```

### Background Effects

1. **Subtle Grain**: SVG noise overlay (5% opacity)
2. **Paper Texture**: CSS radial gradient pattern
   ```css
   background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0);
   background-size: 24px 24px;
   ```

3. **Gradient Accents**: Subtle amber gradients on hero sections

---

## Responsive Breakpoints

| Breakpoint | Min Width | Max Width | Layout Changes |
|------------|------------|------------|----------------|
| Mobile | 0px | 639px | Single column, hamburger menu |
| Tablet | 640px | 1023px | Single column, search in header |
| Desktop | 1024px | 1279px | Three column layout |
| Large Desktop | 1280px | ∞ | Three column, wider container |

---

## Accessibility Standards

- **Color Contrast**: WCAG AA (4.5:1 for text, 3:1 for large text)
- **Focus Indicators**: 2px outline, `--color-amber`
- **Skip Links**: Visible on focus, fixed top-left
- **Semantic HTML**: Proper heading hierarchy, landmark regions
- **Keyboard Navigation**: All interactive elements accessible via Tab
- **Reduced Motion**: Respect `prefers-reduced-motion`

---

## Dark Mode

### Adaptations

- Background: `--color-ink` (#1a2332)
- Text: `--color-cream` (#faf8f5)
- Cards: `--color-gray-800` (#3d362e)
- Borders: `--color-gray-700` (#5a5145)
- Accent: `--color-amber` (unchanged)

### Dark Mode Specifics

- Reduced shadows (dark backgrounds absorb shadows)
- Slightly reduced contrast for eye comfort
- Blue-tinted grays instead of pure black

---

## Implementation Priority

### Phase 1: Foundation
1. Update Tailwind config with new design system
2. Import new fonts
3. Create base CSS variables
4. Update Layout component structure

### Phase 2: Components
1. Redesign Header
2. Redesign Sidebar
3. Redesign Search
4. Redesign TOC
5. Redesign Breadcrumbs

### Phase 3: Pages
1. Redesign Homepage
2. Update content page templates
3. Add animations and transitions

### Phase 4: Polish
1. Add background effects
2. Refine spacing and typography
3. Test responsive design
4. Accessibility audit

---

## File Changes Required

```
frontend/
├── tailwind.config.cjs           # Update with new design system
├── src/
│   ├── styles/
│   │   └── tailwind.css          # Add new base styles, animations
│   ├── components/
│   │   ├── Layout.astro          # Redesign header, layout structure
│   │   ├── Sidebar.tsx          # Redesign navigation styling
│   │   ├── Search.tsx           # Redesign search UI
│   │   ├── TOC.tsx             # Redesign table of contents
│   │   └── Breadcrumbs.astro   # Redesign breadcrumbs
│   └── pages/
│       └── index.astro          # Redesign homepage
```

---

## Success Metrics

1. **Visual Distinctiveness**: Design is immediately recognizable as zeiler.me
2. **Readability**: Long-form content is comfortable to read
3. **Navigation**: Users can easily find and browse content
4. **Performance**: Animations are smooth (60fps)
5. **Accessibility**: WCAG AA compliant
6. **Responsive**: Works seamlessly across all devices
