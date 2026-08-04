'use client';

import React from 'react';
import { ChevronLeft, ShieldAlert, AlertCircle, User, Activity } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Patient } from '../PatientWorkspace';

interface StickyPatientHeaderProps {
  activePatient: Patient;
  outstandingBalance: number;
  todayAppointment?: string;
  assignedDoctor: string;
  onBack: () => void;
}

export default function StickyPatientHeader({
  activePatient,
  outstandingBalance,
  todayAppointment = 'Not scheduled',
  assignedDoctor,
  onBack
}: StickyPatientHeaderProps) {
  const t = useTranslations('PatientWorkspace');
  const alertsCount = activePatient.medicalAlerts?.filter(a => a !== 'None').length || 0;
  const allergiesCount = activePatient.allergies?.length || 0;

  return (
    <div className="sticky top-0 z-40 bg-[#07070c]/70 backdrop-blur-xl border-b border-white/5 px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-black/45 relative overflow-hidden header-shimmer">
      {/* Left Back Arrow and Core Demographics */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg bg-[#0d0d16] hover:bg-[#131320] border border-white/5 text-zinc-400 hover:text-white transition-all active:scale-95"
          title={t('backToDirectory')}
        >
          <ChevronLeft className="w-4 h-4 text-gold-400" />
        </button>
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight font-display text-gold-gradient">{activePatient.name}</h2>
            <span className="text-[9px] font-mono bg-[#0d0d16] border border-white/5 px-2 py-0.5 rounded text-zinc-400">
              {activePatient.id}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[8px] font-mono uppercase font-semibold border hidden sm:inline-block ${
              activePatient.status === 'Completed'
                ? 'bg-gold-500/10 text-gold-400 border-gold-500/20 shadow-gold-glow'
                : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
            }`}>
              {activePatient.status}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
            <span>{activePatient.age} Yrs</span>
            <span>•</span>
            <span>{activePatient.gender}</span>
            <span>•</span>
            <span>{activePatient.bloodGroup || 'O+'}</span>
          </div>
        </div>
      </div>

      {/* Middle Warning Badges (Alerts & Allergies) */}
      <div className="flex items-center gap-2 shrink-0">
        {alertsCount > 0 && (
          <div className="px-2 py-1 rounded bg-red-950/20 border border-red-500/20 flex items-center gap-1 text-[10px] text-red-400 font-mono font-medium animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">{t('medicalAlerts')}:</span>
            <span>{alertsCount}</span>
          </div>
        )}
        {allergiesCount > 0 && (
          <div className="px-2 py-1 rounded bg-amber-950/25 border border-amber-500/20 flex items-center gap-1 text-[10px] text-amber-300 font-mono font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">{t('allergies')}:</span>
            <span>{activePatient.allergyStatus === 'No Known Allergies' ? t('none') : activePatient.allergyStatus}</span>
          </div>
        )}
      </div>

      {/* Right Dynamic Invoices, Scheduler, and Provider */}
      <div className="flex items-center gap-4 text-xs font-mono shrink-0 ml-auto sm:ml-0 text-left">
        <div className="hidden lg:block border-l border-white/5 pl-4">
          <span className="text-[9px] text-zinc-500 block uppercase">{t('assignedDoctor')}</span>
          <span className="text-zinc-300 flex items-center gap-1">
            <User className="w-3 h-3 text-gold-400" /> {assignedDoctor || activePatient.primaryDoctor}
          </span>
        </div>
        <div className="hidden md:block border-l border-white/5 pl-4">
          <span className="text-[9px] text-zinc-500 block uppercase">{t('todayAppointment')}</span>
          <span className="text-zinc-300 flex items-center gap-1">
            <Activity className="w-3 h-3 text-purple-400" />
            <span className="truncate max-w-[150px]">{todayAppointment === 'Not scheduled' ? t('none') : todayAppointment}</span>
          </span>
        </div>
        <div className="border-l border-white/5 pl-4">
          <span className="text-[9px] text-zinc-500 block uppercase">{t('outstanding')}</span>
          <span className={`font-bold ${outstandingBalance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            ${outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}
