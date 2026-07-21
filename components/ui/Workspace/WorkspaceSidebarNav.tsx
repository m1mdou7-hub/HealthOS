import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: string;
}

/**
 * Props for the WorkspaceSidebarNav component.
 * @param items - Array of navigation items to render.
 * @param activeTab - The ID of the currently active tab.
 * @param onTabChange - Callback function triggered when a tab is selected.
 * @param className - Optional CSS class name for styling the container.
 * @param activeItemClassName - CSS classes for the active tab item.
 * @param inactiveItemClassName - CSS classes for the inactive tab item.
 * @param activeBadgeClassName - CSS classes for the badge when the tab is active.
 * @param inactiveBadgeClassName - CSS classes for the badge when the tab is inactive.
 */
interface WorkspaceSidebarNavProps {
  items: NavItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
  activeItemClassName?: string;
  inactiveItemClassName?: string;
  activeBadgeClassName?: string;
  inactiveBadgeClassName?: string;
}

export const WorkspaceSidebarNav = React.memo(function WorkspaceSidebarNav({
  items,
  activeTab,
  onTabChange,
  className = "flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin",
  activeItemClassName = "bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md",
  inactiveItemClassName = "bg-transparent text-zinc-400 border-transparent hover:bg-zinc-950/40 hover:text-white hover:border-zinc-800",
  activeBadgeClassName = "bg-zinc-950 text-emerald-400 border-emerald-500/30",
  inactiveBadgeClassName = "bg-zinc-950 text-zinc-500 border-zinc-850"
}: WorkspaceSidebarNavProps) {
  return (
    <div className={className} role="tablist" aria-orientation="vertical">
      {items.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            id={`${item.id}-tab`}
            role="tab"
            aria-selected={isActive}
            aria-controls={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-between border cursor-pointer ${
              isActive ? activeItemClassName : inactiveItemClassName
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded-md border ${
                item.badgeColor || (isActive ? activeBadgeClassName : inactiveBadgeClassName)
              }`}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
});
