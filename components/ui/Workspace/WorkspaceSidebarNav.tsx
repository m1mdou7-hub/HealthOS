import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: string;
}

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

export function WorkspaceSidebarNav({
  items,
  activeTab,
  onTabChange,
  className = "flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin",
  activeItemClassName = "velvet-nav-item active",
  inactiveItemClassName = "velvet-nav-item",
  activeBadgeClassName = "velvet-badge",
  inactiveBadgeClassName = "velvet-badge-muted"
}: WorkspaceSidebarNavProps) {
  return (
    <div className={className}>
      {items.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full text-start px-3 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-between border cursor-pointer ${
              isActive ? activeItemClassName : inactiveItemClassName
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className={`text-2xs font-mono font-black px-1.5 py-0.5 rounded-md border ${
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
}
