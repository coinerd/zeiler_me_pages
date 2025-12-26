import { useEffect, useState } from "react";

interface TOCEntry {
  id: string;
  text: string;
  level: number;
}

const TOC = () => {
  const [entries, setEntries] = useState<TOCEntry[]>([]);

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll("main h2, main h3"));
    const mapped = headings
      .filter((node): node is HTMLElement => node instanceof HTMLElement && Boolean(node.id))
      .map((node) => ({
        id: node.id,
        text: node.textContent || node.id,
        level: Number(node.tagName.slice(1)),
      }));
    setEntries(mapped);
  }, []);

  if (entries.length === 0) return null;

  return (
    <aside className="toc-container">
      <h2 className="toc-header">Inhaltsverzeichnis</h2>
      <ul className="space-y-2">
        {entries.map((entry) => (
          <li key={entry.id} className={`toc-item ${entry.level === 3 ? "level-3" : ""}`}>
            <a
              href={`#${entry.id}`}
              className="block py-1 transition-colors"
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default TOC;
