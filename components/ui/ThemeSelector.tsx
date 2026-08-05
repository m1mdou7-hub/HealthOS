'use client';

import React, { useState, useEffect } from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';

export type ActiveTheme = 'theme-crimson' | 'theme-earthy' | 'theme-amethyst';

export default function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState<ActiveTheme>('theme-crimson');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load persisted theme or fallback to crimson
    const savedTheme = localStorage.getItem('healthos_user_theme') as ActiveTheme;
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      applyThemeToDocument(savedTheme);
    }
  }, []);

  const applyThemeToDocument = (theme: ActiveTheme) => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.remove('theme-crimson', 'theme-earthy', 'theme-amethyst');
    body.classList.remove('theme-crimson', 'theme-earthy', 'theme-amethyst');
    root.classList.add(theme);
    body.classList.add(theme);
    localStorage.setItem('healthos_user_theme', theme);
  };

  const handleSelectTheme = (theme: ActiveTheme) => {
    setCurrentTheme(theme);
    applyThemeToDocument(theme);
    setIsOpen(false);
  };

  const themes = [
    {
      id: 'theme-crimson',
      name: 'العنابي الملكي (Crimson Dark)',
      subtitle: 'ثيم البلازما العنابي بالعمق الزجاجي',
      previewGradient: 'from-rose-600 via-pink-900 to-black',
      accentHex: '#e11d48',
      bgHex: '#000000'
    },
    {
      id: 'theme-earthy',
      name: 'المريمية المعدنية (Image 1: Earthy Sage)',
      subtitle: 'Morning Blue + Liver Chestnut + Arsenic',
      previewGradient: 'from-[#8A9992] via-[#55443A] to-[#121817]',
      accentHex: '#8A9992',
      bgHex: '#121817'
    },
    {
      id: 'theme-amethyst',
      name: 'الجمشت الملكي (Image 2: Royal Amethyst)',
      subtitle: 'Amethyst + Thistle + Dark Purple',
      previewGradient: 'from-[#9B71B2] via-[#E3D0EA] to-[#180a17]',
      accentHex: '#9B71B2',
      bgHex: '#180a17'
    }
  ];

  const currentThemeObj = themes.find(t => t.id === currentTheme) || themes[0];

  return (
    <div className="relative font-sans select-none" dir="rtl">
      
      {/* Header Button Launcher */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 flex items-center gap-2 text-xs font-bold text-white transition-all shadow-md cursor-pointer hover:border-white/20 active:scale-95"
        title="تغيير ثيم ومظهر المنظومة"
      >
        <Palette className="w-3.5 h-3.5 text-white animate-pulse" />
        <span className="hidden sm:inline text-[11px]">{currentThemeObj.name.split(' ')[0]}</span>
        <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: currentThemeObj.accentHex }} />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[99990]" onClick={() => setIsOpen(false)} />

          <div className="absolute left-0 mt-2 w-72 z-[99999] bg-zinc-950/95 border border-white/15 rounded-3xl p-3 shadow-2xl backdrop-blur-2xl space-y-2 animate-scale-in">
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-white/10">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>اختر الثيم والمظهر (Themes)</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-500">3 خيارات</span>
            </div>

            <div className="space-y-1.5">
              {themes.map(t => {
                const isSelected = currentTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTheme(t.id as ActiveTheme)}
                    className={`w-full p-2.5 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-white/10 border-white/30 shadow-lg'
                        : 'bg-zinc-900/50 border-white/[0.04] hover:bg-zinc-900 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${t.previewGradient} border border-white/20 shadow shrink-0 flex items-center justify-center`}>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{t.name}</span>
                        </div>
                        <span className="text-[9px] text-zinc-400 font-mono block">{t.subtitle}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-1.5 border-t border-white/10 text-center">
              <span className="text-[9px] text-zinc-500 font-mono">تُحفظ تفضيلات الثيم تلقائياً في المتصفح</span>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
