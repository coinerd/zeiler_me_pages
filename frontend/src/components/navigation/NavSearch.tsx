import { useEffect, useState, useRef, useCallback, useContext } from "react";
import Fuse from "fuse.js";
import { useNavigation } from "./NavigationContext";
import { NavigationContext } from "./NavigationContext";
import { prefetchOnHover } from "../../lib/prefetch";

interface SearchItem {
  title: string;
  path: string;
  summary?: string;
}

// Simple prefixPath implementation for client-side React component
const prefixPath = (p: string): string => {
  if (!p) return p;
  if (p.startsWith("http")) return p;
  if (p.startsWith("#")) return p;
  const basePath = (typeof document !== 'undefined' && document.documentElement.getAttribute('data-base-path')) || '';
  // Normalize basePath - strip leading/trailing slashes
  const normalizedBase = basePath.replace(/^\/+|\/+$/g, '');
  const cleanPath = p.startsWith("/") ? p : `/${p}`;
  if (normalizedBase) {
    return `/${normalizedBase}${cleanPath}`;
  }
  return cleanPath;
};

/**
 * NavSearch - Search integration with Fuse.js
 * Features debounced search, keyboard navigation, and results display
 */
const NavSearch = () => {
  const [items, setItems] = useState<SearchItem[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isFocused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const navigationContext = useContext(NavigationContext);
  const close = navigationContext?.close ?? (() => {});

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        // Use prefixPath for proper base path resolution
        const searchIndexPath = prefixPath('/search-index.json');
        const response = await fetch(searchIndexPath);
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) {
          setItems(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.warn("search index failed", error);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const fuse = new Fuse<SearchItem>(items, {
    keys: ["title", "summary"],
    threshold: 0.36,
    includeScore: true,
  });

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const hits = fuse.search(query.trim()).slice(0, 8).map((hit) => hit.item);
    setResults(hits);
  }, [query, items]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setFocused(false);
      inputRef.current?.blur();
    }
  }, []);

  const handleResultClick = () => {
    close();
  };

  return (
    <div className="nav-search">
      <label htmlFor="nav-search-input" className="nav-search-label">
        ARCHIV DURCHSUCHEN
      </label>
      <div className="nav-search-wrapper">
        <input
          ref={inputRef}
          id="nav-search-input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder="Titel, Thema, Autor…"
          className="nav-search-input"
          autoComplete="off"
        />
        <svg
          className="nav-search-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {isFocused && results.length > 0 && (
          <div className="nav-search-results">
            {results.map((item) => (
              <a
                key={item.path}
                href={prefixPath(item.path)}
                className="nav-search-result-item"
                onClick={handleResultClick}
                onMouseEnter={() => prefetchOnHover(prefixPath(item.path), 150)()}
              >
                <p className="nav-search-result-title">{item.title}</p>
                {item.summary && (
                  <p className="nav-search-result-desc">
                    {item.summary.length > 120
                      ? `${item.summary.slice(0, 120)}…`
                      : item.summary}
                  </p>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NavSearch;
