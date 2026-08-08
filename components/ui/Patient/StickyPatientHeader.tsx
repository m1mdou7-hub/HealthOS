'use client';

import React from 'react';
import { ChevronLeft, ShieldAlert, AlertCircle, User, Activity } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Patient } from '../PatientWorkspace';
import { Button, Badge, Kbd } from '@/components/ui/design-system';

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
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="rounded-lg text-[var(--velvet-text-muted)] active:scale-95"
          title={t('backToDirectory')}
          aria-label={t('backToDirectory')}
        >
          <ChevronLeft className="w-4 h-4 text-[var(--velvet-accent)]" />
        </Button>
        <div className="flex flex-col text-start">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-[var(--velvet-text)] tracking-tight font-display text-gold-gradient">{activePatient.name}</h2>
            <Kbd>{activePatient.id}</Kbd>
            <span className="hidden sm:inline-flex">
              <Badge tone={activePatient.status === 'Completed' ? 'success' : 'default'}>
                {activePatient.status}
              </Badge>
            </span>
          </div>
          <div className="flex items-center gap-2 text-2xs text-[var(--velvet-text-muted)] mt-0.5">
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
          <Badge tone="error" className="px-2 py-1 text-2xs animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">{t('medicalAlerts')}:</span>
            <span>{alertsCount}</span>
          </Badge>
        )}
        {allergiesCount > 0 && (
          <Badge tone="warning" className="px-2 py-1 text-2xs">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">{t('allergies')}:</span>
            <span>{activePatient.allergyStatus === 'No Known Allergies' ? t('none') : activePatient.allergyStatus}</span>
          </Badge>
        )}
      </div>

      {/* Right Dynamic Invoices, Scheduler, and Provider */}
      <div className="flex items-center gap-4 text-xs font-mono shrink-0 ms-auto sm:ms-0 text-start">
        <div className="hidden lg:block border-s ps-4" style={{ borderColor: 'var(--velvet-border)' }}>
          <span className="text-2xs text-[var(--velvet-text-muted)] block uppercase">{t('assignedDoctor')}</span>
          <span className="text-[var(--velvet-text-sub)] flex items-center gap-1">
            <User className="w-3 h-3 text-[var(--velvet-accent)]" /> {assignedDoctor || activePatient.primaryDoctor}
          </span>
        </div>
        <div className="hidden md:block border-s ps-4" style={{ borderColor: 'var(--velvet-border)' }}>
          <span className="text-2xs text-[var(--velvet-text-muted)] block uppercase">{t('todayAppointment')}</span>
          <span className="text-[var(--velvet-text-sub)] flex items-center gap-1">
            <Activity className="w-3 h-3 text-[var(--velvet-info)]" />
            <span className="truncate max-w-[150px]">{todayAppointment === 'Not scheduled' ? t('none') : todayAppointment}</span>
          </span>
        </div>
        <div className="border-s ps-4" style={{ borderColor: 'var(--velvet-border)' }}>
          <span className="text-2xs text-[var(--velvet-text-muted)] block uppercase">{t('outstanding')}</span>
          <span className={`font-bold ${outstandingBalance > 0 ? 'text-[var(--velvet-warning)]' : 'text-[var(--velvet-success)]'}`}>
            ${outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}
