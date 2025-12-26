# Navigation Accordion Implementation

## Overview

This document describes the implementation of accordion-style behavior for the navigation menu, where only one main category can be expanded at a time.

## Problem

Previously, the navigation menu allowed multiple categories to be expanded simultaneously. This created a cluttered user experience when users opened multiple categories without closing the previous ones.

## Solution

Implemented an accordion pattern where:
- Only one category can be expanded at a time
- Expanding a second category automatically collapses the first
- Clicking an already-expanded category collapses it
- All categories collapse when the overlay closes

## Changes Made

### 1. NavigationContext.tsx

**Added new state:**
```typescript
const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
```

**Added new methods:**
```typescript
const expandCategory = useCallback((id: string) => {
  console.log('[NavigationContext] expandCategory() called, id:', id);
  setExpandedCategoryId(id);
}, []);

const collapseCategory = useCallback((id: string) => {
  console.log('[NavigationContext] collapseCategory() called, id:', id);
  setExpandedCategoryId(null);
}, []);

const toggleCategory = useCallback((id: string) => {
  console.log('[NavigationContext] toggleCategory() called, id:', id, 'current expandedCategoryId:', expandedCategoryId);
  setExpandedCategoryId(prev => prev === id ? null : id);
}, [expandedCategoryId]);
```

**Updated close method:**
```typescript
const close = useCallback((reason?: string) => {
  // ... existing code ...
  setExpandedCategoryId(null); // Reset expanded category when overlay closes
  // ... rest of method ...
}, [state]);
```

**Updated context interface:**
```typescript
interface NavigationContextType {
  // ... existing properties ...
  expandedCategoryId: string | null;
  expandCategory: (id: string) => void;
  collapseCategory: (id: string) => void;
  toggleCategory: (id: string) => void;
}
```

### 2. NavSection.tsx

**Removed local state:**
```typescript
// Removed: const [isExpanded, setIsExpanded] = useState(false);
```

**Added context usage:**
```typescript
const { expandedCategoryId, toggleCategory } = useNavigation();
const sectionKey = section.title.toLowerCase().replace(/[^a-z0-9]/g, "");
const isExpanded = expandedCategoryId === sectionKey;
```

**Updated toggle handler:**
```typescript
const handleToggle = () => {
  toggleCategory(sectionKey);
};
```

**Removed unused code:**
- Removed `useState` import (no longer needed)
- Removed `useEffect` import (no longer needed)
- Removed `handleKeyDown` function (already handled in NavCategory)

## Technical Details

### State Management

The accordion behavior is managed through a single shared state in `NavigationContext`:
- `expandedCategoryId`: Tracks which category is currently expanded (or `null` if none)
- When a category is expanded, the context automatically updates to reflect the new state
- All `NavSection` components subscribe to this shared state

### ID Generation

Categories are identified by a normalized key:
```typescript
const sectionKey = section.title.toLowerCase().replace(/[^a-z0-9]/g, "");
```

This ensures consistent identification across the application.

### Toggle Logic

The `toggleCategory` method implements smart toggle behavior:
```typescript
setExpandedCategoryId(prev => prev === id ? null : id);
```

- If the clicked category is already expanded, it collapses
- If a different category is clicked, it expands and the previous one collapses
- If no category is expanded, the clicked one expands

## Accessibility

The implementation maintains full keyboard accessibility:
- Enter and Space keys work as expected (handled in NavCategory)
- Focus management is preserved
- ARIA attributes remain intact
- Screen reader announcements work correctly

## Testing

The changes have been:
1. Built successfully with `npm run build`
2. Deployed to GitHub Pages with `npm run deploy`
3. Available at: https://coinerd.github.io/zeiler_me_pages/

## Benefits

1. **Cleaner UI**: Only one category visible at a time reduces clutter
2. **Better UX**: Users can't accidentally open multiple categories
3. **Consistent Behavior**: Predictable accordion pattern familiar to users
4. **Maintainable Code**: Centralized state management in context
5. **Performance**: No unnecessary re-renders of unrelated sections

## Future Enhancements

Potential improvements for future iterations:
- Add animation when categories collapse/expand
- Persist expanded category in localStorage
- Add option to allow multiple expanded categories (configurable)
- Add keyboard shortcuts to navigate between categories

## Files Modified

- `frontend/src/components/navigation/NavigationContext.tsx`
- `frontend/src/components/navigation/NavSection.tsx`
- `frontend/src/styles/tailwind.css`

## CSS Changes

### Fix 1: Category Headers Pushed to Right (Desktop)

**Problem:** The `.nav-section` was using `position: fixed` for the expanded items panel, which caused it to overlay and push other category headers to the right.

**Solution:**
- Changed `.nav-section--accordion` to use `grid-column: span 12` instead of `span 6` on desktop
- Applied grid layout only to `.nav-section--accordion` (not all `.nav-section`)
- Added `position: relative` to `.nav-section--accordion` for proper positioning context
- Scoped `.nav-category-items` position rules to `.nav-section--accordion .nav-category-items` to prevent affecting other sections

This ensures all category headers remain aligned to the left side of the screen, regardless of which category is expanded.

### Fix 2: All Main Categories Full Width

**Problem:** Navigation sections were using different column spans (span 6 for standard, span 12 for accordion/wide), causing inconsistent layout and not utilizing full width.

**Solution:**
- Changed `.nav-section--standard` from `grid-column: span 6` to `span 12` on desktop
- Updated responsive breakpoints for tablet (1023px and below) to use `span 12` instead of `span 6`
- Changed `.nav-section--featured` from `grid-template-columns: 3fr 9fr` to `1fr` (single column layout)
- Changed `.nav-section--featured .nav-section-grid` from `repeat(3, 1fr)` to `repeat(auto-fit, minmax(200px, 1fr))`
- Changed `.nav-section-grid` from `repeat(3, 1fr)` to `repeat(auto-fit, minmax(200px, 1fr))`

This ensures all main categories now use full width across all screen sizes (desktop and tablet), providing a consistent and spacious layout.

### Fix 2: Navigation Items Cut Off at Right Side (Desktop)

**Problem:** Expanded category items were not completely visible - they were being cut off at the right side, especially for categories with many items like "02 Geschichte".

**Solution:**
- Removed `max-width: 1400px` from `.nav-grid` to allow full width usage
- Changed `.nav-category-items-grid` from `grid-template-columns: repeat(3, 1fr)` to `repeat(auto-fit, minmax(200px, 1fr))`
- Changed `.nav-container` `overflow-x` from `hidden` to `auto` to allow horizontal scrolling if needed
- Reduced padding from `0 2rem` to `0.5rem 1rem 0.5rem 0.5rem` for better space utilization
- Added `overflow-x: auto` to expanded category items to allow horizontal scrolling
- Added `width: 100%` and `box-sizing: border-box` to containers for proper sizing

**Current CSS State (Desktop - 1024px+):**
```css
/* Grid Layout - No max-width constraint */
.nav-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: clamp(1rem, 2vw, 2rem);
  padding: clamp(2rem, 5vw, 4rem);
  margin: 0 auto;
  background: var(--nav-bg);
}

/* Accordion Section - Full width */
.nav-section--accordion {
  grid-column: span 12;
  width: 100%;
  box-sizing: border-box;
}

/* Category Items Container - Auto-fit grid */
.nav-section--accordion .nav-category-items-grid {
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

/* Container - Allow horizontal scroll */
.nav-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: auto;
  z-index: 2;
  opacity: 0;
  transform: scale(0.95) translateY(20px);
}
```

These changes ensure that navigation items are completely visible and properly laid out, even for categories with many items.

## Related Documentation

- `frontend/plans/navigation-design-spec.md` - Original design specification
- `frontend/plans/navigation-implementation.md` - Initial implementation details
- `frontend/plans/navigation-redesign-plan.md` - Redesign planning document
