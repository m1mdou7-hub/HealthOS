'use client';

// ---------------------------------------------------------------------------
// Workspace Builder — per-user customizable workspace layouts.
// Every user can customize: widgets, widget order, widget size, favorites,
// shortcuts, and save multiple layouts.
// ---------------------------------------------------------------------------

import type { WidgetId } from './adaptive';
import type { WorkspaceId } from './directory';

export type WidgetSize = 'small' | 'medium' | 'large';

export interface WorkspaceWidgetInstance {
  instanceId: string;
  widgetId: WidgetId;
  size: WidgetSize;
  order: number;
  favorite: boolean;
}

export interface WorkspaceLayout {
  id: string;
  name: string;
  workspace: WorkspaceId | 'unified';
  widgets: WorkspaceWidgetInstance[];
  shortcuts: string[];
  updatedAt: string;
}

export interface UserWorkspaceConfig {
  userId: string;
  activeLayoutId: string;
  layouts: WorkspaceLayout[];
}

const IS_BROWSER = typeof window !== 'undefined';
const LAYOUTS_KEY_PREFIX = 'healthos_workspace_layouts_';

function getKey(userId: string): string {
  return `${LAYOUTS_KEY_PREFIX}${userId}`;
}

export function uid(prefix = 'inst'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.floor(Math.random() * 100000).toString(36)}`;
}

export function getLayoutsForUser(userId: string): UserWorkspaceConfig | null {
  if (!IS_BROWSER) return null;
  const saved = localStorage.getItem(getKey(userId));
  if (!saved) return null;
  try {
    return JSON.parse(saved) as UserWorkspaceConfig;
  } catch {
    return null;
  }
}

export function saveLayoutsForUser(userId: string, config: UserWorkspaceConfig): UserWorkspaceConfig {
  if (!IS_BROWSER) return config;
  localStorage.setItem(getKey(userId), JSON.stringify(config));
  return config;
}

/** Build a default layout for a user from an adaptive widget set. */
export function buildDefaultLayout(args: {
  userId: string;
  workspace: WorkspaceId | 'unified';
  widgets: WidgetId[];
  layoutName?: string;
}): UserWorkspaceConfig {
  const layout: WorkspaceLayout = {
    id: uid('layout'),
    name: args.layoutName ?? 'Default Layout',
    workspace: args.workspace,
    widgets: args.widgets.map((widgetId, index) => ({
      instanceId: uid(),
      widgetId,
      size: index % 3 === 0 ? 'medium' : 'small',
      order: index,
      favorite: index < 3
    })),
    shortcuts: ['dashboard', 'patients', 'appointments'],
    updatedAt: new Date().toISOString()
  };
  return {
    userId: args.userId,
    activeLayoutId: layout.id,
    layouts: [layout]
  };
}

export function ensureLayoutForUser(args: {
  userId: string;
  workspace: WorkspaceId | 'unified';
  widgets: WidgetId[];
}): UserWorkspaceConfig {
  const existing = getLayoutsForUser(args.userId);
  if (existing && existing.layouts.length > 0) return existing;
  const config = buildDefaultLayout(args);
  return saveLayoutsForUser(args.userId, config);
}

export function getActiveLayout(config: UserWorkspaceConfig | null): WorkspaceLayout | null {
  if (!config) return null;
  return config.layouts.find((l) => l.id === config.activeLayoutId) ?? config.layouts[0] ?? null;
}

export function setActiveLayout(config: UserWorkspaceConfig, layoutId: string): UserWorkspaceConfig {
  return { ...config, activeLayoutId: layoutId };
}

export function addLayout(
  config: UserWorkspaceConfig,
  name: string,
  workspace: WorkspaceId | 'unified',
  widgets: WidgetId[]
): UserWorkspaceConfig {
  const layout: WorkspaceLayout = {
    id: uid('layout'),
    name,
    workspace,
    widgets: widgets.map((widgetId, index) => ({
      instanceId: uid(),
      widgetId,
      size: 'small',
      order: index,
      favorite: false
    })),
    shortcuts: [],
    updatedAt: new Date().toISOString()
  };
  return {
    ...config,
    activeLayoutId: layout.id,
    layouts: [...config.layouts, layout]
  };
}

export function deleteLayout(config: UserWorkspaceConfig, layoutId: string): UserWorkspaceConfig {
  const remaining = config.layouts.filter((l) => l.id !== layoutId);
  if (remaining.length === 0) return config;
  return {
    ...config,
    activeLayoutId: config.activeLayoutId === layoutId ? remaining[0].id : config.activeLayoutId,
    layouts: remaining
  };
}

export function renameLayout(config: UserWorkspaceConfig, layoutId: string, name: string): UserWorkspaceConfig {
  return {
    ...config,
    layouts: config.layouts.map((l) => (l.id === layoutId ? { ...l, name } : l))
  };
}

export function addWidgetToLayout(
  config: UserWorkspaceConfig,
  layoutId: string,
  widgetId: WidgetId,
  size: WidgetSize = 'small'
): UserWorkspaceConfig {
  return {
    ...config,
    layouts: config.layouts.map((l) => {
      if (l.id !== layoutId) return l;
      if (l.widgets.some((w) => w.widgetId === widgetId)) return l;
      const instance: WorkspaceWidgetInstance = {
        instanceId: uid(),
        widgetId,
        size,
        order: l.widgets.length,
        favorite: false
      };
      return { ...l, widgets: [...l.widgets, instance], updatedAt: new Date().toISOString() };
    })
  };
}

export function removeWidgetFromLayout(
  config: UserWorkspaceConfig,
  layoutId: string,
  instanceId: string
): UserWorkspaceConfig {
  return {
    ...config,
    layouts: config.layouts.map((l) =>
      l.id === layoutId
        ? { ...l, widgets: l.widgets.filter((w) => w.instanceId !== instanceId), updatedAt: new Date().toISOString() }
        : l
    )
  };
}

export function setWidgetSize(
  config: UserWorkspaceConfig,
  layoutId: string,
  instanceId: string,
  size: WidgetSize
): UserWorkspaceConfig {
  return {
    ...config,
    layouts: config.layouts.map((l) =>
      l.id === layoutId
        ? {
            ...l,
            widgets: l.widgets.map((w) => (w.instanceId === instanceId ? { ...w, size } : w)),
            updatedAt: new Date().toISOString()
          }
        : l
    )
  };
}

export function toggleWidgetFavorite(
  config: UserWorkspaceConfig,
  layoutId: string,
  instanceId: string
): UserWorkspaceConfig {
  return {
    ...config,
    layouts: config.layouts.map((l) =>
      l.id === layoutId
        ? {
            ...l,
            widgets: l.widgets.map((w) => (w.instanceId === instanceId ? { ...w, favorite: !w.favorite } : w)),
            updatedAt: new Date().toISOString()
          }
        : l
    )
  };
}

export function moveWidget(
  config: UserWorkspaceConfig,
  layoutId: string,
  instanceId: string,
  direction: 'up' | 'down'
): UserWorkspaceConfig {
  return {
    ...config,
    layouts: config.layouts.map((l) => {
      if (l.id !== layoutId) return l;
      const widgets = [...l.widgets].sort((a, b) => a.order - b.order);
      const index = widgets.findIndex((w) => w.instanceId === instanceId);
      if (index === -1) return l;
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= widgets.length) return l;
      const [moved] = widgets.splice(index, 1);
      widgets.splice(swapIndex, 0, moved);
      const reordered = widgets.map((w, i) => ({ ...w, order: i }));
      return { ...l, widgets: reordered, updatedAt: new Date().toISOString() };
    })
  };
}

export function addShortcut(
  config: UserWorkspaceConfig,
  layoutId: string,
  shortcut: string
): UserWorkspaceConfig {
  return {
    ...config,
    layouts: config.layouts.map((l) => {
      if (l.id !== layoutId) return l;
      if (l.shortcuts.includes(shortcut)) return l;
      return { ...l, shortcuts: [...l.shortcuts, shortcut], updatedAt: new Date().toISOString() };
    })
  };
}

export function removeShortcut(
  config: UserWorkspaceConfig,
  layoutId: string,
  shortcut: string
): UserWorkspaceConfig {
  return {
    ...config,
    layouts: config.layouts.map((l) =>
      l.id === layoutId
        ? { ...l, shortcuts: l.shortcuts.filter((s) => s !== shortcut), updatedAt: new Date().toISOString() }
        : l
    )
  };
}
