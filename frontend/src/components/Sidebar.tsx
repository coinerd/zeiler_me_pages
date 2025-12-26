import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "zeiler-sidebar-open";

// Simple prefixPath implementation for client-side React component
const prefixPath = (p: string, basePath: string = ""): string => {
  if (!p) return p;
  if (p.startsWith("http")) return p;
  if (p.startsWith("#")) return p;
  const cleanPath = p.startsWith("/") ? p : `/${p}`;
  if (basePath) {
    // Remove leading slash from basePath to avoid double slashes
    const cleanBasePath = basePath.startsWith("/") ? basePath.slice(1) : basePath;
    return `/${cleanBasePath}${cleanPath}`;
  }
  return cleanPath;
};

interface NavNode {
  id: string | number;
  title: string;
  path: string;
  children?: NavNode[];
}

interface Section {
  id: string | number;
  title: string;
  path: string;
  intro?: string;
  children: NavNode[];
}

interface SidebarProps {
  nav: Section[];
  currentPath: string;
  basePath?: string;
}

interface OpenMap {
  [key: string]: boolean;
}

const initialState = (): OpenMap => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) || {};
    }
  } catch (error) {
    console.warn("sidebar state restore failed", error);
  }
  return {};
};

const Sidebar = ({ nav, currentPath, basePath = "" }: SidebarProps) => {
  const [openMap, setOpenMap] = useState<OpenMap>(initialState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(openMap));
    } catch (error) {
      console.warn("sidebar state persist failed", error);
    }
  }, [openMap]);

  const normalizedPath = useMemo(() => {
    if (!currentPath) return "/";
    return currentPath.endsWith("/") ? currentPath : `${currentPath}/`;
  }, [currentPath]);

  const autoExpandedMap = useMemo<OpenMap>(() => {
    const map: OpenMap = { ...openMap };

    const checkNode = (node: NavNode, ancestors: string[]) => {
      if (node.path === normalizedPath) {
        ancestors.forEach((ancestor) => {
          if (!map[ancestor]) {
            map[ancestor] = true;
          }
        });
      }
      node.children?.forEach((child) => checkNode(child, [...ancestors, String(node.id)]));
    };

    nav.forEach((section) => {
      section.children.forEach((node) => checkNode(node, [String(section.id)]));
    });

    return map;
  }, [nav, normalizedPath, openMap]);

  const toggle = (id: string) => {
    setOpenMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNode = (node: NavNode, depth = 0): React.ReactElement => {
    const hasChildren = !!node.children && node.children.length > 0;
    const open = hasChildren ? autoExpandedMap[String(node.id)] : false;
    const isActive = node.path === normalizedPath;
    const indentClass = depth >= 2 ? "ml-6" : "ml-4";

    return (
      <li key={node.id}>
        <div className="sidebar-item">
          <a
            href={prefixPath(node.path, basePath)}
            className={`sidebar-item-link ${isActive ? "active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            {node.title}
          </a>
          {hasChildren && (
            <button
              onClick={() => toggle(String(node.id))}
              className="sidebar-toggle-btn"
              aria-expanded={open ? "true" : "false"}
              aria-controls={`sidebar-group-${node.id}`}
              title={open ? "Einklappen" : "Ausklappen"}
            >
              <span className="sr-only">{open ? "Einklappen" : "Ausklappen"}</span>
              {open ? "−" : "+"}
            </button>
          )}
        </div>
        {hasChildren && open && (
          <ul
            id={`sidebar-group-${node.id}`}
            className={`${indentClass} border-l border-gray-200 pl-3 dark:border-gray-700`}
          >
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <nav className="space-y-8" aria-label="Navigation">
      {nav.map((section) => {
        const open = autoExpandedMap[String(section.id)] ?? true;
        const isSectionActive = section.children?.some(
          (child) => child.path === normalizedPath || child.children?.some((c) => c.path === normalizedPath)
        );

        return (
          <section key={section.id} className="sidebar-section">
            <div className="sidebar-section-header">
              <a
                href={prefixPath(section.path, basePath)}
                className={`sidebar-section-title ${isSectionActive ? "text-amber-dark dark:text-amber" : ""}`}
              >
                {section.title}
              </a>
              <button
                onClick={() => toggle(String(section.id))}
                className="sidebar-toggle-btn"
                aria-expanded={open ? "true" : "false"}
                aria-controls={`section-${section.id}`}
                title={open ? "Einklappen" : "Ausklappen"}
              >
                <span className="sr-only">{open ? "Einklappen" : "Ausklappen"}</span>
                {open ? "−" : "+"}
              </button>
            </div>
            {open && section.intro && (
              <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {section.intro}
              </p>
            )}
            {open && (
              <ul id={`section-${section.id}`} className="space-y-1">
                {section.children.map((node) => renderNode(node))}
              </ul>
            )}
          </section>
        );
      })}
    </nav>
  );
};

export default Sidebar;
