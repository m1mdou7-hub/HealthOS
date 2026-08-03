'use client';

import { useEffect, useState } from 'react';
import { Download, WifiOff, Wifi } from 'lucide-react';

// Extend window to hold install prompt event
declare global {
  interface Window {
    __pwaInstallPrompt?: BeforeInstallPromptEvent;
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAProvider() {
  const [installable, setInstallable] = useState(false);
  const [isOffline, setIsOffline]     = useState(false);
  const [showBanner, setShowBanner]   = useState(false);
  const [installing, setInstalling]   = useState(false);

  useEffect(() => {
    // ── Register Service Worker ─────────────────────────────────────────
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.info('[HealthOS SW] Registered:', reg.scope);

          // Listen for background sync messages from SW
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data?.type === 'BACKGROUND_SYNC') {
              console.info('[HealthOS] Background sync triggered by SW');
            }
          });
        })
        .catch((err) => console.warn('[HealthOS SW] Registration failed:', err));
    }

    // ── Install prompt ──────────────────────────────────────────────────
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      window.__pwaInstallPrompt = e as BeforeInstallPromptEvent;
      setInstallable(true);
      // Show install banner after 3 seconds
      setTimeout(() => setShowBanner(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // ── Online / Offline detection ──────────────────────────────────────
    const handleOffline = () => setIsOffline(true);
    const handleOnline  = () => setIsOffline(false);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online',  handleOnline);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online',  handleOnline);
    };
  }, []);

  const handleInstall = async () => {
    if (!window.__pwaInstallPrompt) return;
    setInstalling(true);
    await window.__pwaInstallPrompt.prompt();
    const result = await window.__pwaInstallPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setInstallable(false);
      setShowBanner(false);
    }
    setInstalling(false);
  };

  return (
    <>
      {/* ── Offline toast strip ─────────────────────────────────────── */}
      <div
        className={`fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 text-xs font-semibold py-2 px-4 transition-all duration-500 ${
          isOffline
            ? 'bg-orange-500/90 backdrop-blur text-black translate-y-0'
            : '-translate-y-full pointer-events-none'
        }`}
      >
        <WifiOff className="w-3.5 h-3.5" />
        <span>وضع أوفلاين — البيانات محفوظة محلياً، ستتم المزامنة عند عودة الإنترنت</span>
      </div>

      {/* ── Back online flash ───────────────────────────────────────── */}

      {/* ── Install App banner ─────────────────────────────────────── */}
      {showBanner && installable && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9990] w-[90vw] max-w-md">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4 shadow-2xl shadow-black/60 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">ثبّت HealthOS</p>
              <p className="text-xs text-zinc-400 mt-0.5">استخدمه كتطبيق كامل بدون متصفح</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setShowBanner(false)}
                className="text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1"
              >
                لاحقاً
              </button>
              <button
                onClick={handleInstall}
                disabled={installing}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-colors disabled:opacity-60"
              >
                {installing ? 'جارٍ...' : 'تثبيت'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
