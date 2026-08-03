'use client';

import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Loader2,
  LockKeyhole,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import {
  activateNexaLicense,
  clearStoredLicense,
  loadStoredLicenseKey,
  markLicenseVerified,
  NexaLicenseResult,
  storeVerifiedLicense,
  verifyNexaLicense
} from '@/utils/nexa-license';

const VERIFY_INTERVAL_MS = 5 * 60 * 1000;

type GateState = 'checking' | 'missing' | 'active' | 'blocked' | 'offline';

const errorMessages: Record<string, string> = {
  LICENSE_NOT_FOUND: 'مفتاح الترخيص غير صحيح.',
  PRODUCT_MISMATCH: 'هذا المفتاح غير مخصص لنظام HealthOS.',
  SUBSCRIPTION_SUSPENDED: 'الاشتراك موقوف من منصة Nexa.',
  PAYMENT_OVERDUE: 'الاشتراك متأخر في السداد.',
  SUBSCRIPTION_INACTIVE: 'الاشتراك غير نشط.',
  LICENSE_EXPIRED: 'انتهت مدة الاشتراك.',
  DEVICE_TYPE_NOT_ALLOWED: 'نوع هذا الجهاز غير مشمول في الباقة.',
  DEVICE_LIMIT_REACHED: 'تم الوصول إلى الحد الأقصى للأجهزة في الباقة.',
  DEVICE_NOT_ACTIVATED: 'هذا الجهاز غير مفعّل أو تم إلغاء تفعيله من منصة Nexa.',
  INVALID_REQUEST: 'تعذر التحقق من بيانات الترخيص.'
};

function resultMessage(result?: NexaLicenseResult | null) {
  if (!result) return '';
  return (
    errorMessages[result.code] || result.message || 'تعذر التحقق من الترخيص.'
  );
}

export default function LicenseGate({
  children
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<GateState>('checking');
  const [licenseKey, setLicenseKey] = useState('');
  const [result, setResult] = useState<NexaLicenseResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const verify = useCallback(async () => {
    const storedKey = loadStoredLicenseKey();
    if (!storedKey) {
      setState('missing');
      return;
    }

    try {
      const nextResult = await verifyNexaLicense(storedKey);
      setResult(nextResult);
      if (nextResult.valid) {
        markLicenseVerified();
        setState('active');
      } else {
        setState('blocked');
      }
    } catch {
      setState('offline');
    }
  }, []);

  useEffect(() => {
    void verify();

    const interval = window.setInterval(() => {
      void verify();
    }, VERIFY_INTERVAL_MS);
    const verifyWhenVisible = () => {
      if (document.visibilityState === 'visible') void verify();
    };

    window.addEventListener('focus', verify);
    document.addEventListener('visibilitychange', verifyWhenVisible);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', verify);
      document.removeEventListener('visibilitychange', verifyWhenVisible);
    };
  }, [verify]);

  async function activate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const key = licenseKey.trim();
    if (!key) return;

    setSubmitting(true);
    setResult(null);
    try {
      const nextResult = await activateNexaLicense(key);
      setResult(nextResult);
      if (nextResult.valid) {
        storeVerifiedLicense(key);
        setLicenseKey('');
        setState('active');
      } else {
        setState('blocked');
      }
    } catch {
      setState('offline');
    } finally {
      setSubmitting(false);
    }
  }

  function useAnotherKey() {
    clearStoredLicense();
    setResult(null);
    setLicenseKey('');
    setState('missing');
  }

  const isDevBypass =
    process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true';

  if (isDevBypass || state === 'active') {
    return <>{children}</>;
  }

  const checking = state === 'checking';
  const missing = state === 'missing';
  const offline = state === 'offline';

  return (
    <div
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-zinc-950 px-5 py-10 text-zinc-100"
    >
      <section className="w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/80 shadow-2xl shadow-black/40">
        <div className="border-b border-zinc-800 bg-gradient-to-l from-emerald-500/10 to-transparent px-7 py-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-zinc-950">
              {checking ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : offline ? (
                <AlertTriangle className="h-6 w-6" />
              ) : missing ? (
                <KeyRound className="h-6 w-6" />
              ) : (
                <LockKeyhole className="h-6 w-6" />
              )}
            </div>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-400">
              Nexa Licensing
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white">
            {checking
              ? 'جارٍ التحقق من الاشتراك'
              : missing
                ? 'تفعيل HealthOS'
                : offline
                  ? 'تعذر الاتصال بمنصة Nexa'
                  : 'لا يمكن فتح HealthOS'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {checking
              ? 'لحظات قليلة للتأكد من صلاحية الترخيص وهذا الجهاز.'
              : missing
                ? 'أدخل مفتاح الترخيص الصادر من منصة Nexa لتفعيل هذا الجهاز.'
                : offline
                  ? 'تحقق من اتصال الإنترنت ثم أعد المحاولة. سيبقى النظام مقفلاً حتى يتم التحقق.'
                  : resultMessage(result)}
          </p>
        </div>

        <div className="space-y-5 px-7 py-6">
          {missing && (
            <form className="space-y-4" onSubmit={activate}>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-zinc-300">
                  مفتاح الترخيص
                </span>
                <input
                  autoComplete="off"
                  autoFocus
                  value={licenseKey}
                  onChange={(event) => setLicenseKey(event.target.value)}
                  placeholder="NX-HOS-DEMO أو أدخل الكود الخاص بك"
                  dir="ltr"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 font-mono text-sm uppercase tracking-wider text-white placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
                <span className="mt-1.5 block text-[11px] text-zinc-500">
                  للتجربة المباشرة استخدم المفتاح: <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-emerald-400">NX-HOS-DEMO</code> أو <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-emerald-400">HEALTHOS-2026</code>
                </span>
              </label>
              <button
                disabled={submitting || !licenseKey.trim()}
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                تفعيل الجهاز
              </button>
            </form>
          )}

          {checking && (
            <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-400">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
              يتم الاتصال الآمن بخدمة التراخيص...
            </div>
          )}

          {!checking && !missing && (
            <div className="grid gap-3">
              <button
                onClick={() => void verify()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-zinc-950 transition hover:bg-emerald-400"
              >
                <RefreshCw className="h-4 w-4" />
                إعادة التحقق
              </button>
              <button
                onClick={useAnotherKey}
                className="w-full rounded-xl border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800"
              >
                استخدام مفتاح آخر
              </button>
            </div>
          )}

          <div className="flex items-start gap-3 border-t border-zinc-800 pt-5 text-xs leading-5 text-zinc-500">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            يرتبط الترخيص بهذا الجهاز، ويُعاد التحقق عند التشغيل وعند العودة
            للنظام وكل خمس دقائق.
          </div>
        </div>
      </section>
    </div>
  );
}
