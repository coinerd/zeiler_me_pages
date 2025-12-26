import NavItemCard from "./NavItemCard";

interface NavNode {
  id: string | number;
  title: string;
  path: string;
  children?: NavNode[];
  count?: number;
  description?: string;
}

interface NavCategoryItemsProps {
  items: NavNode[];
  sectionKey: string;
  isVisible: boolean;
}

/**
 * NavCategoryItems - Renders sub-items when category is expanded
 * Features staggered fade-in animation
 */
const NavCategoryItems = ({ items, sectionKey, isVisible }: NavCategoryItemsProps) => {
  if (!isVisible || items.length === 0) {
    return null;
  }

  return (
    <div
      id={`category-items-${items[0]?.id || sectionKey}`}
      className="nav-category-items"
      role="region"
      aria-labelledby={`category-header-${items[0]?.id || sectionKey}`}
    >
      <div className="nav-category-items-grid">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="nav-category-item"
          >
            <NavItemCard
              item={item}
              sectionKey={sectionKey}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NavCategoryItems;
