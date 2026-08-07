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
    <div
      className="sticky top-0 z-40 glass rounded-none border-0 border-b px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 header-shimmer"
      style={{ borderBottom: '1px solid var(--velvet-border)' }}
    >
      {/* Left Back Arrow and Core Demographics */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onBack}
          className="btn-ghost p-1.5 rounded-lg text-zinc-400 hover:text-white transition-all active:scale-95"
          title={t('backToDirectory')}
        >
          <ChevronLeft className="w-4 h-4 text-gold-400" />
        </button>
        <div className="flex flex-col text-start">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight font-display text-gold-gradient">{activePatient.name}</h2>
            <span className="kbd px-2 py-0.5">{activePatient.id}</span>
            <span className={`badge hidden sm:inline-flex ${
              activePatient.status === 'Completed' ? 'badge-success' : ''
            }`}>
              {activePatient.status}
            </span>
          </div>
          <div className="flex items-center gap-2 text-2xs text-zinc-500 mt-0.5">
            <span>{activePatient.age} Yrs</span>
            <span>â€¢</span>
            <span>{activePatient.gender}</span>
            <span>â€¢</span>
            <span>{activePatient.bloodGroup || 'O+'}</span>
          </div>
        </div>
      </div>

      {/* Middle Warning Badges (Alerts & Allergies) */}
      <div className="flex items-center gap-2 shrink-0">
        {alertsCount > 0 && (
          <div className="badge badge-danger px-2 py-1 text-2xs animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">{t('medicalAlerts')}:</span>
            <span>{alertsCount}</span>
          </div>
        )}
        {allergiesCount > 0 && (
          <div className="badge badge-warning px-2 py-1 text-2xs">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">{t('allergies')}:</span>
            <span>{activePatient.allergyStatus === 'No Known Allergies' ? t('none') : activePatient.allergyStatus}</span>
          </div>
        )}
      </div>

      {/* Right Dynamic Invoices, Scheduler, and Provider */}
      <div className="flex items-center gap-4 text-xs font-mono shrink-0 ms-auto sm:ms-0 text-start">
        <div className="hidden lg:block border-s border-white/5 ps-4">
          <span className="text-2xs text-zinc-500 block uppercase">{t('assignedDoctor')}</span>
          <span className="text-zinc-300 flex items-center gap-1">
            <User className="w-3 h-3 text-gold-400" /> {assignedDoctor || activePatient.primaryDoctor}
          </span>
        </div>
        <div className="hidden md:block border-s border-white/5 ps-4">
          <span className="text-2xs text-zinc-500 block uppercase">{t('todayAppointment')}</span>
          <span className="text-zinc-300 flex items-center gap-1">
            <Activity className="w-3 h-3 text-purple-400" />
            <span className="truncate max-w-[150px]">{todayAppointment === 'Not scheduled' ? t('none') : todayAppointment}</span>
          </span>
        </div>
        <div className="border-s border-white/5 ps-4">
          <span className="text-2xs text-zinc-500 block uppercase">{t('outstanding')}</span>
          <span className={`font-bold ${outstandingBalance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            ${outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}
