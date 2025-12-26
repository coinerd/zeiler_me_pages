import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export type NavState = "closed" | "opening" | "open" | "closing";

interface NavigationContextType {
  isOpen: boolean;
  state: NavState;
  open: () => void;
  close: (reason?: string) => void;
  toggle: () => void;
  focusItem: (elementId: string) => void;
  expandedCategoryId: string | null;
  expandCategory: (id: string) => void;
  collapseCategory: (id: string) => void;
  toggleCategory: (id: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider = ({ children }: NavigationProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<NavState>("closed");
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  const open = useCallback(() => {
    console.log('[NavigationContext] open() called, current state:', state);
    if (state === "closed") {
      setIsOpen(true);
      setState("opening");
      console.log('[NavigationContext] State changed to: opening, isOpen: true');
      // Transition to open after animation completes (500ms)
      setTimeout(() => {
        setState("open");
        console.log('[NavigationContext] State changed to: open (after 500ms animation), reason: "open-animation-complete"');
      }, 500);
    } else {
      console.log('[NavigationContext] open() ignored - state is not "closed", current state:', state);
    }
  }, [state]);

  const close = useCallback((reason?: string) => {
    console.log('[NavigationContext] close() called, reason:', reason ?? 'unknown', 'current state:', state);
    if (state === "open" || state === "opening") {
      setState("closing");
      console.log('[NavigationContext] State changed to: closing');
      // Reset expanded category when overlay closes
      setExpandedCategoryId(null);
      // Transition to closed after animation completes (300ms)
      setTimeout(() => {
        setIsOpen(false);
        setState("closed");
        console.log('[NavigationContext] State changed to: closed, isOpen: false (after 300ms animation), reason:', reason ?? 'close-animation-complete');
      }, 300);
    } else {
      console.log('[NavigationContext] close() ignored - state is not "open" or "opening", current state:', state);
    }
  }, [state]);

  // Category expansion methods for accordion behavior
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

  const toggle = useCallback(() => {
    console.log('[NavigationContext] toggle() called, isOpen:', isOpen);
    if (isOpen) {
      close("toggle-close");
    } else {
      open();
    }
  }, [isOpen, open, close]);

  const focusItem = useCallback((elementId: string) => {
    console.log('[NavigationContext] focusItem() called, elementId:', elementId);
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
    }
  }, []);

  return (
    <NavigationContext.Provider value={{
      isOpen,
      state,
      open,
      close,
      toggle,
      focusItem,
      expandedCategoryId,
      expandCategory,
      collapseCategory,
      toggleCategory
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

// Hook to use the navigation context
export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};

// Export the context for direct access if needed
export { NavigationContext };
