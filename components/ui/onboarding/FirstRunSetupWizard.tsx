'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Building2,
  Stethoscope,
  Layers,
  Globe,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Grid,
  ShieldCheck,
  Zap,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import {
  PRACTICE_TYPES,
  getPracticeType,
  saveOrganizationProfile,
  getOrganizationProfile,
  buildPracticeTemplate,
  savePracticeTemplate,
  type PracticeType,
  type PracticeTypeId,
  type OrganizationProfile
} from '@/utils/enterprise/practice';
import { getWorkspaceById } from '@/utils/enterprise/directory';
import { appendAuditLog } from '@/utils/enterpriseState';

const TYPE_META: Record<
  PracticeTypeId,
  { icon: typeof Stethoscope; gradient: string; accent: string }
> = {
  solo: { icon: Stethoscope, gradient: 'from-emerald-500 to-teal-600', accent: 'text-emerald-400' },
  'small-clinic': { icon: Building2, gradient: 'from-sky-500 to-blue-600', accent: 'text-sky-400' },
  'multi-specialty': { icon: Layers, gradient: 'from-violet-500 to-purple-600', accent: 'text-violet-400' },
  'multi-branch': { icon: Globe, gradient: 'from-rose-500 to-red-600', accent: 'text-rose-400' }
};

interface FirstRunSetupWizardProps {
  onComplete?: (profile: OrganizationProfile) => void;
  onSkip?: () => void;
}

export default function FirstRunSetupWizard({ onComplete, onSkip }: FirstRunSetupWizardProps) {
  const t = useTranslations('Onboarding');
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [practiceTypeId, setPracticeTypeId] = useState<PracticeTypeId | null>(null);
  const [orgName, setOrgName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [timezone, setTimezone] = useState('riyadh');
  const [language, setLanguage] = useState('arabic');
  const [seats, setSeats] = useState('4–12 seats');
  const [branches, setBranches] = useState('1 location');
  const [finished, setFinished] = useState(false);

  const practice: PracticeType | undefined = practiceTypeId
    ? getPracticeType(practiceTypeId)
    : undefined;

  const selectPractice = (id: PracticeTypeId) => {
    setPracticeTypeId(id);
    const p = getPracticeType(id);
    setSeats(p.seatRange);
    setBranches(p.branchRange);
  };

  const handleLaunch = () => {
    if (!practiceTypeId) return;
    const existing = getOrganizationProfile();
    const profile = saveOrganizationProfile({
      practiceTypeId,
      organizationName: orgName.trim() || (existing?.organizationName ?? 'HealthOS Dental Group'),
      branchName: branchName.trim() || (existing?.branchName ?? 'Main Campus'),
      timezone: t(`timezones.${timezone}`),
      primaryLanguage: t(`languages.${language}`),
      seats,
      branches,
      setupComplete: true,
      createdAt: existing?.createdAt ?? new Date().toISOString().replace('T', ' ').substring(0, 19)
    });
    savePracticeTemplate(buildPracticeTemplate(practiceTypeId));
    appendAuditLog(
      'System Onboarding',
      `First run setup complete for practice type [${practiceTypeId}]`,
      'System Admin',
      'Success'
    );
    setFinished(true);
    onComplete?.(profile);
  };

  const handleSkip = () => {
    if (practiceTypeId) {
      saveOrganizationProfile({
        practiceTypeId,
        organizationName: orgName.trim() || 'HealthOS Dental Group',
        branchName: branchName.trim() || 'Main Campus',
        timezone: t(`timezones.${timezone}`),
        primaryLanguage: t(`languages.${language}`),
        seats,
        branches,
        setupComplete: true,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });
    }
    onSkip?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      style={{ background: 'rgba(2,6,17,0.82)', backdropFilter: 'blur(14px)' }}
    >
      <div className="w-full max-w-3xl">
        {/* Progress rail */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[0, 1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black transition-all border ${
                  s === step
                    ? 'bg-gradient-to-tr from-rose-500 to-amber-500 text-white border-transparent shadow-lg shadow-rose-500/30 scale-110'
                    : s < step
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                }`}
              >
                {s < step ? <Check className="w-4 h-4" /> : s + 1}
              </div>
              {s < 2 && <div className={`w-10 h-px ${s < step ? 'bg-emerald-500/60' : 'bg-zinc-800'}`} />}
            </div>
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="card-gradient rounded-3xl overflow-hidden relative"
        >
          {/* Ambient glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[100px] pointer-events-none" style={{ background: 'var(--accent-glow2)' }} />

          {finished ? (
            <div className="relative p-8 sm:p-12 text-center space-y-5">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                className="mx-auto w-20 h-20 rounded-3xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">{t('finishedTitle')}</h2>
                <p className="text-sm text-zinc-400 mt-2 max-w-md mx-auto">{t('finishedSub')}</p>
              </div>
              <div className="flex justify-center">
                <span className="badge badge-success text-xs px-4 py-1.5 rounded-full">{practice?.name}</span>
              </div>
            </div>
          ) : (
            <div className="relative p-6 sm:p-10">
              {/* STEP 0 — PRACTICE TYPE */}
              {step === 0 && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl shrink-0" style={{ background: 'var(--accent-glow2)', border: '1px solid var(--border-strong)', color: 'var(--accent)' }}>
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight">{t('title')}</h2>
                      <p className="text-sm text-zinc-400 mt-1.5 max-w-xl leading-relaxed">{t('subtitle')}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest mb-1">{t('practiceType')}</h3>
                    <p className="text-xs text-zinc-500 mb-4">{t('practiceTypeSub')}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PRACTICE_TYPES.map((p) => {
                      const meta = TYPE_META[p.id];
                      const Icon = meta.icon;
                      const selected = practiceTypeId === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => selectPractice(p.id)}
                          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 group ${
                            selected
                              ? 'border-rose-500/60 bg-rose-500/10 shadow-lg shadow-rose-500/10 scale-[1.01]'
                              : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${meta.gradient} flex items-center justify-center text-white shadow-lg`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            {selected && (
                              <span className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center text-white">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">{t(`practiceTypes.${p.id}`)}</h4>
                            <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">{p.description}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400`}>
                              {p.seatRange}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
                              {p.branchRange}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 1 — ORG DETAILS */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl shrink-0" style={{ background: 'var(--accent-glow2)', border: '1px solid var(--border-strong)', color: 'var(--accent)' }}>
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight">{t('orgDetails')}</h2>
                      <p className="text-sm text-zinc-400 mt-1.5">{t('orgDetailsSub')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">{t('orgName')}</label>
                      <input
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder={t('orgNamePlaceholder')}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-sm text-white outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/10 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">{t('branchName')}</label>
                      <input
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                        placeholder={t('branchNamePlaceholder')}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-sm text-white outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/10 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">{t('timezone')}</label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-sm text-white outline-none focus:border-rose-500/50 transition-all"
                      >
                        {Object.keys(t.raw('timezones') as Record<string, string>).map((k) => (
                          <option key={k} value={k} style={{ background: '#0c0a14', color: '#fff' }}>
                            {t(`timezones.${k}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">{t('primaryLanguage')}</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-sm text-white outline-none focus:border-rose-500/50 transition-all"
                      >
                        {Object.keys(t.raw('languages') as Record<string, string>).map((k) => (
                          <option key={k} value={k} style={{ background: '#0c0a14', color: '#fff' }}>
                            {t(`languages.${k}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {practice && (
                    <div className="flex items-start gap-3 p-4 rounded-2xl border border-purple-500/30 bg-purple-500/10">
                      <Zap className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-white">{practice.name}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{t('adaptiveNote')}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2 — REVIEW */}
              {step === 2 && practice && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl shrink-0" style={{ background: 'var(--accent-glow2)', border: '1px solid var(--border-strong)', color: 'var(--accent)' }}>
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight">{t('review')}</h2>
                      <p className="text-sm text-zinc-400 mt-1.5">{t('reviewSub')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 card-elevated rounded-2xl space-y-2.5">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t('selectedPractice')}</span>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${TYPE_META[practice.id].gradient} flex items-center justify-center text-white`}>
                          {(() => { const I = TYPE_META[practice.id].icon; return <I className="w-5 h-5" />; })()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{practice.name}</h4>
                          <p className="text-xs text-zinc-500">{practice.sizeLabel} · {practice.branchRange}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 card-elevated rounded-2xl space-y-2.5">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t('orgName')}</span>
                      <h4 className="text-sm font-bold text-white truncate">{orgName.trim() || 'HealthOS Dental Group'}</h4>
                      <p className="text-xs text-zinc-500 truncate">{branchName.trim() || 'Main Campus'} · {t(`timezones.${timezone}`)}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 block">{t('whatGetsConfigured')}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-950/60 space-y-2">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <Building2 className="w-4 h-4 text-sky-400" />
                          <span className="text-[11px] font-bold uppercase tracking-wider">{t('departments')}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {practice.suggestedDepartments.map((d) => (
                            <span key={d} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">{d}</span>
                          ))}
                        </div>
                      </div>
                      <div className="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-950/60 space-y-2">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <Grid className="w-4 h-4 text-purple-400" />
                          <span className="text-[11px] font-bold uppercase tracking-wider">{t('workspaces')}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {practice.suggestedWorkspaces.map((w) => (
                            <span key={w} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">{getWorkspaceById(w)?.name ?? w}</span>
                          ))}
                        </div>
                      </div>
                      <div className="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-950/60 space-y-2">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span className="text-[11px] font-bold uppercase tracking-wider">{t('permissionTemplates')}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {practice.defaultPermissionTemplateIds.map((id) => (
                            <span key={id} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">{id}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* FOOTER NAV */}
              <div className="mt-8 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t('skip')}
                </button>

                <div className="flex items-center gap-2">
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={() => setStep((step - 1) as 0 | 1 | 2)}
                      className="btn-secondary px-4 py-2.5 text-xs font-bold rounded-2xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {t('back')}
                    </button>
                  )}
                  {step < 2 ? (
                    <button
                      type="button"
                      disabled={step === 0 && !practiceTypeId}
                      onClick={() => setStep((step + 1) as 0 | 1 | 2)}
                      className="btn-primary px-5 py-2.5 text-xs font-bold rounded-2xl flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {t('next')}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleLaunch}
                      className="btn-primary px-5 py-2.5 text-xs font-bold rounded-2xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      {t('launch')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <p className="text-center text-[11px] text-zinc-600 mt-4 font-sans">{t('skipHint')}</p>
      </div>
    </motion.div>
  );
}
