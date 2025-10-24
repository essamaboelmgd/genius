import { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  ClipboardCheck,
  StickyNote,
  Settings,
  ChevronLeft,
  Menu,
  X,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface SidebarItem {
  id: string;
  labelArabic: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  count?: number;
  children?: SidebarItem[];
}

interface SidebarProps {
  items: SidebarItem[];
  className?: string;
}

export const Sidebar = ({ items, className }: SidebarProps) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['courses', 'exams']);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const hasActiveChild = (item: SidebarItem) =>
    item.children?.some(child => isActive(child.path)) || false;

  const SidebarContent = () => (
    <nav className="flex flex-col gap-1 p-4" role="navigation" aria-label="قائمة الموقع">
      {items.map(item => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.includes(item.id);
        const itemIsActive = isActive(item.path) || hasActiveChild(item);

        return (
          <div key={item.id}>
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(item.id)}
                className={cn(
                  'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-smooth',
                  'hover:bg-sidebar-accent',
                  itemIsActive && 'bg-sidebar-accent text-accent font-medium'
                )}
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm">{item.labelArabic}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.count !== undefined && (
                    <span className="px-2 py-0.5 bg-accent text-accent-foreground text-xs rounded-full">
                      {item.count}
                    </span>
                  )}
                  <ChevronLeft
                    className={cn(
                      'w-4 h-4 transition-transform duration-200',
                      isExpanded && 'rotate-90'
                    )}
                  />
                </div>
              </button>
            ) : (
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth',
                    'hover:bg-sidebar-accent',
                    isActive && 'bg-sidebar-accent text-accent font-medium'
                  )
                }
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.labelArabic}</span>
                {item.count !== undefined && (
                  <span className="mr-auto px-2 py-0.5 bg-accent text-accent-foreground text-xs rounded-full">
                    {item.count}
                  </span>
                )}
              </NavLink>
            )}

            {hasChildren && isExpanded && (
              <div className="mr-8 mt-1 space-y-1" role="group">
                {item.children!.map(child => (
                  <NavLink
                    key={child.id}
                    to={child.path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-smooth',
                        'hover:bg-sidebar-accent',
                        isActive && 'bg-sidebar-accent text-accent font-medium'
                      )
                    }
                    onClick={() => setMobileOpen(false)}
                  >
                    {child.labelArabic}
                    {child.count !== undefined && (
                      <span className="mr-auto px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                        {child.count}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed bottom-4 left-4 z-50 lg:hidden p-3 bg-primary text-primary-foreground rounded-full shadow-lg"
        aria-label="فتح القائمة"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-16 right-0 h-[calc(100vh-4rem)] bg-sidebar border-l border-sidebar-border overflow-y-auto z-40',
          'transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0',
          'w-64',
          className
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
};
