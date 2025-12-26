import { useEffect, useRef, useContext } from "react";
import { createPortal } from "react-dom";
import { useNavigation } from "./NavigationContext";
import { NavigationContext } from "./NavigationContext";
import type { NavState } from "./NavigationContext";
import NavSection from "./NavSection";
import type { Section } from "./NavSection";
import NavSearch from "./NavSearch";

interface NavigationOverlayProps {
  nav: Section[];
}

/**
 * NavigationOverlay - Main fullscreen overlay component
 * Features atmospheric effects, staggered animations, and keyboard navigation
 */
const NavigationOverlay = ({ nav }: NavigationOverlayProps) => {
  const navigationContext = useContext(NavigationContext);
  
  // Provide default values during SSR when context is not available
  const isOpen = navigationContext?.isOpen ?? false;
  const state: NavState = navigationContext?.state ?? "closed";
  const close = navigationContext?.close ?? (() => {});
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  
  // Get trigger button reference
  useEffect(() => {
    triggerRef.current = document.querySelector('.nav-trigger') as HTMLButtonElement | null;
  }, []);

  // Handle keyboard navigation (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        close("escape-key");
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      
      // Prevent body scroll
      document.body.style.overflow = "hidden";
      
      // Store previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
    } else {
      document.body.style.overflow = "";
      
      // Restore focus to trigger
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Log 1: Event target + composedPath
      console.log(
        '[NavigationOverlay] mousedown',
        'target=', e.target,
        'path=', e.composedPath?.().map(n => (n as Element)?.tagName || (n as Node)?.nodeName)
      );
      
      // Log 2: Containment checks
      const overlayEl = overlayRef.current;
      const buttonEl = triggerRef.current;
      
      console.log(
        '[NavigationOverlay] insideOverlay=',
        overlayEl?.contains(e.target as Node),
        'insideButton=',
        buttonEl?.contains(e.target as Node)
      );
      
      if (overlayEl && !overlayEl.contains(e.target as Node)) {
        console.log('[NavigationOverlay] Click detected outside overlay, calling close("outside-mousedown")');
        close("outside-mousedown");
      } else {
        console.log('[NavigationOverlay] Click detected inside overlay or button, not closing');
      }
    };

    if (isOpen) {
      console.log('[NavigationOverlay] Adding mousedown listener for click outside detection');
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      console.log('[NavigationOverlay] Removing mousedown listener (isOpen is false)');
    }

    return () => {
      console.log('[NavigationOverlay] Cleanup: Removing mousedown listener');
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, close]);

  const overlayContent = (
    <div
      ref={overlayRef}
      id="nav-overlay"
      className={`nav-overlay ${state}`}
      data-state={state}
      role="dialog"
      aria-modal="true"
      aria-labelledby="nav-overlay-title"
      {...(state === "closed" ? { "aria-hidden": "true" } : {})}
    >
      <h1 id="nav-overlay-title" className="sr-only">Navigation</h1>
      
      {/* Backdrop with atmospheric effects */}
      <div className="nav-backdrop" aria-hidden="true" />
      
      {/* Close Button */}
      <button
        type="button"
        className="nav-close"
        onClick={(e) => {
          console.log("[NavClose] click", {
            target: e.target,
            currentTarget: e.currentTarget,
            detail: e.detail,
            type: e.type,
            pointerType: e.pointerType,
            clientX: e.clientX,
            clientY: e.clientY,
          });
          close("close-button-click");
        }}
        aria-label="Navigation schließen"
      >
        <svg
          className="nav-close-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Main Container */}
      <div className="nav-container">
        <nav className="nav-grid" aria-label="Hauptnavigation">
          {/* Search */}
          <NavSearch />

          {/* Sections */}
          {nav.map((section, index) => (
            <NavSection key={section.id} section={section} index={index} />
          ))}
        </nav>
      </div>
    </div>
  );

  // Use portal to render overlay outside header constraints
  if (typeof document !== 'undefined' && document.body) {
    return createPortal(overlayContent, document.body);
  }
  return overlayContent;
};

export default NavigationOverlay;
