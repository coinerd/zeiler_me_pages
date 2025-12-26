import { useNavigation } from "./NavigationContext";
import { NavigationContext } from "./NavigationContext";
import { useContext } from "react";

/**
 * NavigationTrigger - The menu button in the header
 * Displays a hamburger icon that transforms to X when overlay is open
 */
const NavigationTrigger = () => {
  const navigationContext = useContext(NavigationContext);
  
  // Provide default values during SSR when context is not available
  const isOpen = navigationContext?.isOpen ?? false;
  const toggle = navigationContext?.toggle ?? (() => {});

  return (
    <button
      type="button"
      className="nav-trigger"
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
      aria-expanded={isOpen}
      aria-controls="nav-overlay"
      aria-label={isOpen ? "Navigation schließen" : "Navigation öffnen"}
    >
      <svg
        className="nav-trigger-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        {isOpen ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        )}
      </svg>
      <span className="nav-trigger-label">{isOpen ? "SCHLIEẞEN" : "MENÜ"}</span>
    </button>
  );
};

export default NavigationTrigger;
