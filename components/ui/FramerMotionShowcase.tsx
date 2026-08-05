'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Move, Zap, Heart, RotateCcw, ShieldCheck, Layers, Play } from 'lucide-react';

export default function FramerMotionShowcase() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [count, setCount] = useState(1);

  const tabs = [
    { title: 'تحريك الفيزياء والزمبرك (Spring Physics)', desc: 'تحريك فيزيائي للمكونات مع حساب الدفع الارتدادي المرن' },
    { title: 'تحويل الأشكال الحي (Morphing Layout)', desc: 'انتقال الأشكال والسحب السلس عبر أنظمة Framer Motion' },
    { title: 'التفاعلات واللمس (Gesture Drag & Hover)', desc: 'سحب وسحب البطاقات في جميع الاتجاهات بحساسية عالية' }
  ];

  return (
    <div className="p-6 rounded-3xl bg-zinc-950 border border-white/10 space-y-6 select-none font-sans" dir="rtl">
      
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/10">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              استعراض مكتبة Framer Motion التفاعلية ⚡
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">تحريكات فيزيائية وسلسة بتقنية Motion 11+ في React</p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
          INSTALLED & READY 🟢
        </span>
      </div>

      {/* Interactive Tabs with Layout Morphing */}
      <div className="flex gap-2 p-1.5 bg-zinc-900 rounded-2xl border border-white/10 relative">
        {tabs.map((tab, idx) => {
          const isActive = selectedTab === idx;
          return (
            <button
              key={idx}
              onClick={() => setSelectedTab(idx)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors relative z-10 cursor-pointer ${
                isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 bg-rose-600 rounded-xl shadow-lg shadow-rose-600/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.title}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display with Framer Motion AnimatePresence */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/[0.08] min-h-[180px] flex items-center justify-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, y: 15, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="text-center space-y-4 max-w-md"
          >
            <p className="text-xs text-zinc-300 leading-relaxed font-semibold">{tabs[selectedTab].desc}</p>

            {/* Interactive Physics Elements depending on tab */}
            {selectedTab === 0 && (
              <div className="flex justify-center items-center gap-4 pt-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCount(count + 1)}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 cursor-pointer"
                >
                  اضغط للتكبير الفيزيائي ({count})
                </motion.button>
              </div>
            )}

            {selectedTab === 1 && (
              <div className="flex justify-center gap-3 pt-2">
                <motion.div
                  animate={{
                    scale: [1, 1.15, 1],
                    rotate: [0, 180, 360],
                    borderRadius: ["20%", "50%", "20%"]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-12 h-12 bg-gradient-to-br from-rose-500 to-indigo-600 shadow-xl"
                />
              </div>
            )}

            {selectedTab === 2 && (
              <div className="pt-2">
                <motion.div
                  drag
                  dragConstraints={{ left: -100, right: 100, top: -40, bottom: 40 }}
                  whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
                  className="p-4 bg-zinc-950 border border-rose-500/40 rounded-2xl cursor-grab shadow-2xl inline-block select-none"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                    <Move className="w-4 h-4" />
                    <span>حركني وسحبني في أي اتجاه! (Drag Me)</span>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
