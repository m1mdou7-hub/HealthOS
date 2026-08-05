'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Palette, Check, Sun, Moon, Sparkles } from 'lucide-react';

export type ThemeId = 'graphite' | 'earthy';
export type Mode = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'healthos_theme_id';
export const MODE_STORAGE_KEY = 'healthos_mode';

export const THEMES: {
  id: ThemeId;
  name: string;
  enName: string;
  subtitle: string;
  previewGradient: string;
  accentHex: string;
  bgHex: string;
}[] = [
  {
    id: 'graphite',
    name: 'بروفيشنال داكن',
    enName: 'Dark Professional',
    subtitle: 'Amethyst Purple · Graphite · Orchid',
    previewGradient: 'from-[#9B71B2] via-[#3A1C36] to-[#0b0710]',
    accentHex: '#9B71B2',
    bgHex: '#0b0710'
  },
  {
    id: 'earthy',
    name: 'إيرث فاخر',
    enName: 'Luxury Earth',
    subtitle: 'Chestnut · Morning Blue · Almond',
    previewGradient: 'from-[#8A9992] via-[#55443A] to-[#100d0b]',
    accentHex: '#8A9992',
    bgHex: '#100d0b'
  }
];

export function getInitialTheme(): ThemeId {
  if (typeof window === 'undefined') return 'graphite';
  return (localStorage.getItem(THEME_STORAGE_KEY) as ThemeId) || 'graphite';
}

export function getInitialMode(): Mode {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(MODE_STORAGE_KEY) as Mode | null;
  if (stored === 'light' || stored === 'dark') return stored;
  const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)').matches;
  return prefersLight ? 'light' : 'dark';
}

export function applyThemeToDocument(theme: ThemeId, mode: Mode) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.setAttribute('data-mode', mode);
  root.classList.remove('theme-crimson', 'theme-earthy', 'theme-amethyst');
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  localStorage.setItem(MODE_STORAGE_KEY, mode);
}

export default function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('graphite');
  const [mode, setMode] = useState<Mode>('dark');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const theme = getInitialTheme();
    const initialMode = getInitialMode();
    setCurrentTheme(theme);
    setMode(initialMode);
    applyThemeToDocument(theme, initialMode);
  }, []);

  const handleSelectTheme = useCallback((theme: ThemeId) => {
    setCurrentTheme(theme);
    applyThemeToDocument(theme, getInitialMode());
    setIsOpen(false);
  }, []);

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      applyThemeToDocument(getInitialTheme(), next);
      return next;
    });
  }, []);

  const currentThemeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  return (
    <div className="relative font-sans select-none" dir="rtl">
      {/* Header Button Launcher */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 flex items-center gap-2 text-xs font-bold text-white transition-all shadow-md cursor-pointer hover:border-white/20 active:scale-95"
        title="تغيير الثيم والمظهر"
        aria-label="Theme selector"
      >
        <Palette className="w-3.5 h-3.5 text-white" />
        <span className="hidden sm:inline text-[11px]">{currentThemeObj.enName}</span>
        <span
          className="w-2.5 h-2.5 rounded-full border border-white/20"
          style={{ backgroundColor: currentThemeObj.accentHex }}
        />
      </button>

      {/* Mode toggle */}
      <button
        onClick={toggleMode}
        className="px-2.5 py-1.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
        title={mode === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
        aria-label="Toggle light / dark mode"
      >
        {mode === 'dark' ? (
          <Sun className="w-3.5 h-3.5 text-amber-300" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-indigo-300" />
        )}
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[99990]" onClick={() => setIsOpen(false)} />

          <div className="absolute left-0 mt-2 w-80 z-[99999] bg-zinc-950/95 border border-white/15 rounded-3xl p-3 shadow-2xl backdrop-blur-2xl space-y-2 animate-scale-in">
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-white/10">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>اختر الثيم والمظهر</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-500">2 ثيمات × 2 أوضاع</span>
            </div>

            {/* Mode segmented control */}
            <div className="flex gap-1 p-1 bg-black/40 border border-white/10 rounded-2xl">
              {(['dark', 'light'] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    applyThemeToDocument(currentTheme, m);
                  }}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    mode === m
                      ? 'bg-white/10 text-white border border-white/20 shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {m === 'dark' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                  {m === 'dark' ? 'داكن' : 'فاتح'}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              {THEMES.map((t) => {
                const isSelected = currentTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTheme(t.id)}
                    className={`w-full p-2.5 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-white/10 border-white/30 shadow-lg'
                        : 'bg-zinc-900/50 border-white/[0.04] hover:bg-zinc-900 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-xl bg-gradient-to-br ${t.previewGradient} border border-white/20 shadow shrink-0 flex items-center justify-center`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{t.name}</span>
                          <span className="text-[9px] font-mono text-zinc-500">{t.enName}</span>
                        </div>
                        <span className="text-[9px] text-zinc-400 font-mono block">{t.subtitle}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-1.5 border-t border-white/10 text-center">
              <span className="text-[9px] text-zinc-500 font-mono">
                تُحفظ التفضيلات تلقائياً · ثيم فوري عبر CSS Variables
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
