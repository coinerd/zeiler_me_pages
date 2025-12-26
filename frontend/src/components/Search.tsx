import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";

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
  const cleanPath = p.startsWith("/") ? p : `/${p}`;
  if (basePath) {
    // basePath already starts with '/', so don't add another leading slash
    return `${basePath}${cleanPath}`;
  }
  return cleanPath;
};

const Search = () => {
  const [items, setItems] = useState<SearchItem[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isFocused, setFocused] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch("/search-index.json");
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

  const fuse = useMemo(() => {
    if (!items.length) return null;
    return new Fuse<SearchItem>(items, {
      keys: ["title", "summary"],
      threshold: 0.36,
      includeScore: true,
    });
  }, [items]);

  useEffect(() => {
    if (!fuse || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const hits = fuse.search(query.trim()).slice(0, 8).map((hit) => hit.item);
    setResults(hits);
  }, [query, fuse]);

  return (
    <div className="relative">
      <label htmlFor="site-search" className="sr-only">
        Suche
      </label>
      <div className="relative">
        <input
          id="site-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Durchsuchen…"
          className="search-input"
          autoComplete="off"
        />
        <svg
          className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none"
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
      </div>
      {isFocused && results.length > 0 && (
        <ul className="search-results animate-fade-in">
          {results.map((item) => (
            <li key={item.path}>
              <a
                href={prefixPath(item.path)}
                className="search-result-item"
              >
                <p className="font-medium text-ink dark:text-cream">{item.title}</p>
                {item.summary && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {item.summary.length > 140
                      ? `${item.summary.slice(0, 140)}…`
                      : item.summary}
                  </p>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Search;
