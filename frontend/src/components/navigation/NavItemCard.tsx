import { useContext, useEffect } from "react";
import { useNavigation } from "./NavigationContext";
import { NavigationContext } from "./NavigationContext";
import { prefetchOnHover } from "../../lib/prefetch";

interface NavNode {
  id: string | number;
  title: string;
  path: string;
  children?: NavNode[];
  count?: number;
  description?: string;
}

interface NavItemCardProps {
  item: NavNode;
  sectionKey: string;
}

// Simple prefixPath implementation for client-side React component
const prefixPath = (p: string): string => {
  if (!p) return p;
  if (p.startsWith("http")) return p;
  if (p.startsWith("#")) return p;
  const basePath = (typeof document !== 'undefined' && document.documentElement.getAttribute('data-base-path')) || '';
  const cleanPath = p.startsWith("/") ? p : `/${p}`;
  if (basePath) {
    // basePath already starts with '/', so don't add another leading slash
    return `${basePath}${cleanPath}`;
  }
  return cleanPath;
};

/**
 * NavItemCard - Individual navigation item card
 * Features hover lift effect, shadow, and accent color reveal
 */
const NavItemCard = ({ item, sectionKey }: NavItemCardProps) => {
  const navigationContext = useContext(NavigationContext);
  const close = navigationContext?.close ?? (() => {});

  const handleClick = () => {
    close();
  };

  // Prefetch on hover
  useEffect(() => {
    const cancelPrefetch = prefetchOnHover(prefixPath(item.path), 150);
    
    return () => {
      if (cancelPrefetch) {
        cancelPrefetch();
      }
    };
  }, [item.path]);

  return (
    <a
      href={prefixPath(item.path)}
      className="nav-item-card"
      onClick={handleClick}
    >
      <div className="nav-item-content">
        <h3 className="nav-item-title">{item.title}</h3>
        {item.description && (
          <p className="nav-item-desc">{item.description}</p>
        )}
      </div>
    </a>
  );
};

export default NavItemCard;
