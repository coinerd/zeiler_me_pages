import { useNavigation } from "./NavigationContext";
import NavCategory from "./NavCategory";
import NavCategoryItems from "./NavCategoryItems";

export interface Section {
  id: string | number;
  title: string;
  path: string;
  intro?: string;
  children: any[];
  layout?: "featured" | "standard" | "wide";
}

interface NavSectionProps {
  section: Section;
  index: number;
}

/**
 * NavSection - Section component with accordion-style expandable behavior
 * Features category header, expand/collapse, and item grid
 */
const NavSection = ({ section, index }: NavSectionProps) => {
  const { expandedCategoryId, toggleCategory } = useNavigation();
  const sectionKey = section.title.toLowerCase().replace(/[^a-z0-9]/g, "");
  const isExpanded = expandedCategoryId === sectionKey;

  // Handle expand/collapse using shared context
  const handleToggle = () => {
    toggleCategory(sectionKey);
  };

  return (
    <section
      className={`nav-section nav-section--accordion ${section.layout ? `nav-section--${section.layout}` : "nav-section--standard"}`}
      data-section={sectionKey}
      data-expanded={isExpanded}
    >
      <NavCategory
        section={section}
        index={index}
        isExpanded={isExpanded}
        onToggle={handleToggle}
        itemCount={section.children?.length}
      />
      <NavCategoryItems
        items={section.children}
        sectionKey={sectionKey}
        isVisible={isExpanded}
      />
    </section>
  );
};

export default NavSection;
