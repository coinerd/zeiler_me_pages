import { useRef } from "react";
import type { Section, NavNode } from "./NavSection";

interface NavCategoryProps {
  section: Section;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  itemCount?: number;
}

/**
 * NavCategory - Main category header with expand/collapse functionality
 * Features chevron icon, visual cues, and keyboard accessibility
 */
const NavCategory = ({ section, index, isExpanded, onToggle, itemCount }: NavCategoryProps) => {
  const sectionKey = section.title.toLowerCase().replace(/[^a-z0-9]/g, "");
  const headerRef = useRef<HTMLButtonElement>(null);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  };

  // Calculate item count
  const count = itemCount ?? section.children?.length ?? 0;

  return (
    <div className="nav-category" data-section={sectionKey}>
      {/* Category Header */}
      <button
        ref={headerRef}
        className="nav-category-header"
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isExpanded.toString()}
        aria-label={section.title + ", " + count + " items, " + (isExpanded ? "expanded" : "collapsed")}
        aria-controls={"category-items-" + sectionKey}
        type="button"
      >
        {/* Section Number and Title Wrapper - for "Drift" animation */}
        <div className="nav-category-content">
          {/* Section Number */}
          <span className="nav-category-number">
            {String(index + 1).padStart(2, "0")}
          </span>

          {/* Title and Count */}
          <div className="nav-category-info">
            <h2 className="nav-category-title">{section.title}</h2>
            <div className="nav-category-meta">
              {section.intro && (
                <p className="nav-category-intro">{section.intro}</p>
              )}
              <span className="nav-category-count" aria-label={`${count} items`}>
                {count}
              </span>
            </div>
          </div>
        </div>

        {/* Chevron Icon - with centered container for rotation */}
        <div className="nav-category-chevron-container">
          <svg
            className="nav-category-chevron"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </button>
    </div>
  );
};

export default NavCategory;
