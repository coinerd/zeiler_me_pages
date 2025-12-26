import React from "react";
import { NavigationProvider } from "./NavigationContext";
import NavigationTrigger from "./NavigationTrigger";
import NavigationOverlay from "./NavigationOverlay";

interface NavigationIslandProps {
  nav: any[];
}

/**
 * NavigationIsland - Single React island containing all navigation components
 * Wraps Provider, Trigger, and Overlay in the same React root
 * so they share the same React context
 */
export default function NavigationIsland({ nav }: NavigationIslandProps) {
  return (
    <NavigationProvider>
      <NavigationTrigger />
      <NavigationOverlay nav={nav} />
    </NavigationProvider>
  );
}
