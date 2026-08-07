'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  LayoutGrid,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Star,
  Sparkles,
  User,
  Save,
  ListPlus,
  X,
  Maximize2,
  AlignJustify
} from 'lucide-react';
import { WIDGET_CATALOG, getWidgetById } from '@/utils/enterprise/adaptive';
import type { WidgetId, WidgetDefinition } from '@/utils/enterprise/adaptive';
import {
  getLayoutsForUser,
  saveLayoutsForUser,
  ensureLayoutForUser,
  getActiveLayout,
  setActiveLayout,
  addLayout,
  deleteLayout,
  renameLayout,
  addWidgetToLayout,
  removeWidgetFromLayout,
  setWidgetSize,
  toggleWidgetFavorite,
  moveWidget,
  addShortcut,
  removeShortcut,
  type UserWorkspaceConfig,
  type WorkspaceLayout,
  type WidgetSize
} from '@/utils/enterprise/builder';

interface WorkspaceBuilderProps {
  users: { id: string; name: string; avatarColor?: string }[];
  widgetsForUser: (userId: string) => WidgetId[];
}

export default function WorkspaceBuilder({ users, widgetsForUser }: WorkspaceBuilderProps) {
  const t = useTranslations('WorkspaceBuilder');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [config, setConfig] = useState<UserWorkspaceConfig | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [newLayoutOpen, setNewLayoutOpen] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');
  const [newShortcut, setNewShortcut] = useState('');
  const widgetsForUserRef = useRef(widgetsForUser);
  useEffect(() => { widgetsForUserRef.current = widgetsForUser; });

  const selectedUser = users.find((u) => u.id === selectedUserId);

  useEffect(() => {
    if (users.length > 0 && !selectedUserId) {
      setSelectedUserId(users[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  useEffect(() => {
    if (!selectedUserId) {
      setConfig(null);
      return;
    }
    const adaptive = ensureLayoutForUser({
      userId: selectedUserId,
      workspace: 'unified',
      widgets: widgetsForUserRef.current(selectedUserId)
    });
    setConfig(adaptive);
    setStatus(null);
  }, [selectedUserId]);

  const activeLayout = getActiveLayout(config);

  const persist = (next: UserWorkspaceConfig) => {
    setConfig(saveLayoutsForUser(next.userId, next));
  };

  const show = (key: string) => {
    setStatus(key);
    setTimeout(() => setStatus(null), 2500);
  };

  if (!selectedUser) {
    return (
      <div className="p-8 card-elevated rounded-3xl text-center space-y-3">
        <User className="w-10 h-10 text-zinc-500 mx-auto" />
        <p className="text-sm text-zinc-400">{t('emptyUser')}</p>
      </div>
    );
  }

  const catalogWidgets = WIDGET_CATALOG;
  const usedWidgetIds = new Set(activeLayout?.widgets.map((w) => w.widgetId) ?? []);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-2xs font-mono text-zinc-500 uppercase font-bold shrink-0">{t('selectUser')}:</span>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="rounded-xl text-xs font-mono text-zinc-200 p-2 outline-none bg-zinc-950 border border-zinc-800"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Layout switcher */}
          {config && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-2xs font-mono text-zinc-500 uppercase font-bold shrink-0">{t('layouts')}:</span>
              {config.layouts.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => { const next = setActiveLayout(config, l.id); persist(next); }}
                  className={`px-2.5 py-1 rounded-lg text-2xs font-bold border transition-all cursor-pointer ${
                    l.id === config.activeLayoutId
                      ? 'bg-purple-500/15 text-purple-300 border-purple-500/40'
                      : 'bg-zinc-950/60 text-zinc-500 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {l.name}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); const next = deleteLayout(config, l.id); persist(next); }}
                    className="ms-1.5 text-zinc-500 hover:text-rose-400"
                  >
                    <X className="w-3 h-3 inline" />
                  </button>
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => { setNewLayoutName(''); setNewLayoutOpen(true); }}
            className="btn-secondary px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <ListPlus className="w-3.5 h-3.5" />
            {t('newLayout')}
          </button>
        </div>

        {status && (
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-300">
            {t(status)}
          </span>
        )}
      </div>

      {/* New layout modal */}
      {newLayoutOpen && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="card-elevated rounded-3xl w-full max-w-sm p-6 space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-tight font-mono">{t('newLayout')}</h4>
            <div className="space-y-1">
              <label className="text-2xs text-zinc-400 font-bold uppercase">{t('newLayoutName')}</label>
              <input
                value={newLayoutName}
                onChange={(e) => setNewLayoutName(e.target.value)}
                placeholder={t('layoutPlaceholder')}
                className="w-full p-2 rounded-xl text-white text-xs outline-none bg-zinc-950 border border-zinc-800 focus:border-purple-500/50"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setNewLayoutOpen(false)} className="btn-secondary px-4 py-1.5 text-xs font-bold">
                {t('remove')}
              </button>
              <button
                onClick={() => {
                  if (!config || !newLayoutName.trim()) return;
                  const next = addLayout(config, newLayoutName.trim(), 'unified', widgetsForUser(selectedUserId));
                  persist(next);
                  setNewLayoutOpen(false);
                  show('layoutCreated');
                }}
                className="btn-primary px-4 py-1.5 text-xs font-bold"
              >
                {t('createLayout')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Builder grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Widget catalog */}
        <div className="p-4 card-elevated rounded-3xl space-y-3">
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> {t('widgetCatalog')}
            </h4>
            <p className="text-xs text-zinc-500 mt-0.5">{t('widgetCatalogSub')}</p>
          </div>
          <div className="space-y-2 max-h-[380px] overflow-y-auto pe-1">
            {catalogWidgets.map((w: WidgetDefinition) => {
              const inUse = usedWidgetIds.has(w.id);
              return (
                <div key={w.id} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-200 truncate">{w.name}</p>
                    <p className="text-2xs text-zinc-500 truncate">{w.description}</p>
                  </div>
                  <button
                    type="button"
                    disabled={inUse}
                    onClick={() => {
                      if (!config || !activeLayout) return;
                      const next = addWidgetToLayout(config, activeLayout.id, w.id);
                      persist(next);
                      show('widgetAdded');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-2xs font-bold border transition-all cursor-pointer shrink-0 ${
                      inUse
                        ? 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'
                        : 'bg-purple-500/15 text-purple-300 border-purple-500/40 hover:bg-purple-500/25'
                    }`}
                  >
                    {inUse ? 'Added' : t('addWidget')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active layout editor */}
        <div className="p-4 card-elevated rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-amber-400" /> {t('layoutWidgets')}
              </h4>
              {activeLayout && (
                <span className="text-2xs font-mono text-zinc-500 mt-0.5 block">
                  {t('activeLayout')}: <span className="text-amber-300 font-bold">{activeLayout.name}</span>
                </span>
              )}
            </div>
            {config && activeLayout && (
              <button
                type="button"
                onClick={() => persist(config)}
                className="btn-primary px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                {t('layoutSaved')}
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pe-1">
            {activeLayout && activeLayout.widgets.length > 0 ? (
              [...activeLayout.widgets].sort((a, b) => a.order - b.order).map((w) => {
                const def = getWidgetById(w.widgetId);
                return (
                  <div key={w.instanceId} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (!config) return;
                          const next = toggleWidgetFavorite(config, activeLayout.id, w.instanceId);
                          persist(next);
                        }}
                        className={`shrink-0 ${w.favorite ? 'text-amber-400' : 'text-zinc-600 hover:text-zinc-400'}`}
                      >
                        <Star className={`w-3.5 h-3.5 ${w.favorite ? 'fill-amber-400' : ''}`} />
                      </button>
                      <span className="text-xs font-bold text-zinc-200 truncate">{def?.name ?? w.widgetId}</span>
                      <span className="text-2xs font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 uppercase">
                        {t(`sizes.${w.size}`)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <select
                        value={w.size}
                        onChange={(e) => {
                          if (!config) return;
                          const next = setWidgetSize(config, activeLayout.id, w.instanceId, e.target.value as WidgetSize);
                          persist(next);
                        }}
                        className="rounded-lg text-2xs font-mono text-zinc-300 p-1 outline-none bg-zinc-900 border border-zinc-800"
                      >
                        <option value="small">{t('sizes.small')}</option>
                        <option value="medium">{t('sizes.medium')}</option>
                        <option value="large">{t('sizes.large')}</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          if (!config) return;
                          const next = moveWidget(config, activeLayout.id, w.instanceId, 'up');
                          persist(next);
                        }}
                        className="p-1 text-zinc-500 hover:text-white"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!config) return;
                          const next = moveWidget(config, activeLayout.id, w.instanceId, 'down');
                          persist(next);
                        }}
                        className="p-1 text-zinc-500 hover:text-white"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!config) return;
                          const next = removeWidgetFromLayout(config, activeLayout.id, w.instanceId);
                          persist(next);
                          show('widgetRemoved');
                        }}
                        className="p-1 text-zinc-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-zinc-500">{t('noWidgets')}</div>
            )}
          </div>

          {/* Shortcuts */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-xs font-black text-white uppercase tracking-tight">{t('shortcuts')}</h5>
                <p className="text-2xs text-zinc-500">{t('shortcutsSub')}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeLayout?.shortcuts.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 text-2xs font-mono px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                  {s}
                  <button
                    type="button"
                    onClick={() => {
                      if (!config) return;
                      persist(removeShortcut(config, activeLayout.id, s));
                    }}
                    className="text-zinc-500 hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <div className="inline-flex items-center gap-1">
                <input
                  value={newShortcut}
                  onChange={(e) => setNewShortcut(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newShortcut.trim() && config && activeLayout) {
                      persist(addShortcut(config, activeLayout.id, newShortcut.trim()));
                      setNewShortcut('');
                    }
                  }}
                  placeholder="+ shortcut"
                  className="w-28 px-2 py-1 rounded-lg text-2xs font-mono text-white outline-none bg-zinc-950 border border-zinc-800 focus:border-purple-500/50"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newShortcut.trim() && config && activeLayout) {
                      persist(addShortcut(config, activeLayout.id, newShortcut.trim()));
                      setNewShortcut('');
                    }
                  }}
                  className="p-1 text-zinc-500 hover:text-purple-400"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 card-elevated rounded-2xl flex justify-between items-center text-xs font-mono text-zinc-500">
        <span>WORKSPACE BUILDER: PERSONAL LAYOUTS ENABLED</span>
        <span>{config?.layouts.length ?? 0} LAYOUTS SAVED</span>
      </div>
    </div>
  );
}
