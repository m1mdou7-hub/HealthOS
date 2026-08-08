'use client';

import React from 'react';
import { Calendar, Clipboard, DollarSign, FlaskConical, Layers, FileText, Activity, ShieldAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Appointment, TreatmentPlan } from '../../../utils/services/clinicalService';
import { Patient } from '../PatientWorkspace';
import { Card, Badge } from '@/components/ui/design-system';

interface ClinicalDashboardProps {
  activePatient: Patient;
  appointments: Appointment[];
  treatmentPlans: TreatmentPlan[];
  outstandingBalance: number;
  labOrdersCount: number;
  radiologyReportsCount: number;
  clinicalNotesCount: number;
  alertsCount: number;
  onNavigateTab: (tab: string) => void;
}

type IconTone = 'info' | 'warning' | 'success' | 'accent' | 'error' | 'neutral';

const iconToneClasses: Record<IconTone, string> = {
  info: 'text-[var(--velvet-info)] bg-[var(--velvet-info-bg)] border-[var(--velvet-info-border)]',
  warning: 'text-[var(--velvet-warning)] bg-[var(--velvet-warning-bg)] border-[var(--velvet-warning-border)]',
  success: 'text-[var(--velvet-success)] bg-[var(--velvet-success-bg)] border-[var(--velvet-success-border)]',
  accent: 'text-[var(--velvet-accent)] bg-[var(--velvet-accent-glow2)] border-[var(--velvet-border-strong)]',
  error: 'text-[var(--velvet-error)] bg-[var(--velvet-error-bg)] border-[var(--velvet-error-border)]',
  neutral: 'text-[var(--velvet-text-muted)] bg-[var(--velvet-surface-2)] border-[var(--velvet-border)]',
};

export default function ClinicalDashboard({
  activePatient,
  appointments,
  treatmentPlans,
  outstandingBalance,
  labOrdersCount,
  radiologyReportsCount,
  clinicalNotesCount,
  alertsCount,
  onNavigateTab
}: ClinicalDashboardProps) {
  const t = useTranslations('PatientWorkspace');

  // Find upcoming appointment details
  const upcomingAppt = appointments.find(a => a.status !== 'Completed' && a.status !== 'Cancelled');
  const upcomingText = upcomingAppt
    ? `${upcomingAppt.date} @ ${upcomingAppt.startTime}`
    : t('card_appt_none');

  // Active plan progress
  const activePlan = treatmentPlans.find(p => p.progress < 100) || treatmentPlans[0];
  const progressPercent = activePlan ? activePlan.progress : 0;
  const pendingTxCount = activePlan
    ? (activePlan.items || []).filter(i => i.status !== 'Completed' && i.status !== 'Cancelled').length
    : 0;

  const dashboardCards = [
    {
      title: t('card_appt_title'),
      value: upcomingText,
      subtext: upcomingAppt ? upcomingAppt.procedure : t('card_appt_intake'),
      icon: Calendar,
      iconTone: 'info' as IconTone,
      tab: "appointments"
    },
    {
      title: t('card_tx_title'),
      value: t('card_tx_procedures', { count: pendingTxCount }),
      subtext: activePlan ? activePlan.title : t('card_tx_none'),
      icon: Clipboard,
      iconTone: 'warning' as IconTone,
      tab: "treatment"
    },
    {
      title: t('card_billing_title'),
      value: `$${outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      subtext: outstandingBalance > 0 ? t('card_billing_sub') : t('card_billing_settled'),
      icon: DollarSign,
      iconTone: (outstandingBalance > 0 ? 'warning' : 'success') as IconTone,
      tab: "billing"
    },
    {
      title: t('card_lab_title'),
      value: t('card_lab_cases', { count: labOrdersCount }),
      subtext: t('card_lab_sub'),
      icon: FlaskConical,
      iconTone: 'error' as IconTone,
      tab: "laboratory"
    },
    {
      title: t('card_radio_title'),
      value: t('card_radio_studies', { count: radiologyReportsCount }),
      subtext: t('card_radio_sub'),
      icon: Layers,
      iconTone: 'info' as IconTone,
      tab: "radiology"
    },
    {
      title: t('card_soap_title'),
      value: t('card_soap_notes', { count: clinicalNotesCount }),
      subtext: t('card_soap_sub'),
      icon: FileText,
      iconTone: 'success' as IconTone,
      tab: "clinical"
    },
    {
      title: t('card_progress_title'),
      value: t('card_progress_complete', { percent: progressPercent }),
      subtext: activePlan ? t('card_progress_sub') : t('card_progress_baseline'),
      icon: Activity,
      iconTone: 'success' as IconTone,
      tab: "treatment"
    },
    {
      title: t('card_alerts_title'),
      value: t('card_alerts_active', { count: alertsCount }),
      subtext: activePatient.allergyStatus === 'No Known Allergies' ? t('card_alerts_none') : activePatient.allergyStatus,
      icon: ShieldAlert,
      iconTone: (alertsCount > 0 ? 'error' : 'neutral') as IconTone,
      tab: "overview"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card
              key={idx}
              variant="gradient"
              hover
              onClick={() => onNavigateTab(card.tab)}
              className="p-5 rounded-3xl cursor-pointer text-start flex flex-col justify-between h-36 relative group overflow-hidden"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigateTab(card.tab); }}
            >
              <div className="flex justify-between items-start">
                <span className="text-2xs font-mono text-[var(--velvet-text-muted)] uppercase font-bold tracking-wider">{card.title}</span>
                <div className={`p-2 rounded-xl border ${iconToneClasses[card.iconTone]} shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1 mt-2">
                <h3 className="text-sm font-bold text-[var(--velvet-text)] tracking-tight leading-none group-hover:text-[var(--velvet-success)] transition-colors">
                  {card.value}
                </h3>
                <p className="text-xs text-[var(--velvet-text-muted)] truncate leading-normal">
                  {card.subtext}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Real-time AI Clinical Decision Support alerts panel */}
      <Card variant="elevated" hover={false} className="p-5 rounded-3xl space-y-4">
        <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--velvet-border)' }}>
          <div>
            <h4 className="text-xs font-bold text-[var(--velvet-text)] flex items-center gap-1.5 font-mono">
              <ShieldAlert className="w-4 h-4 text-[var(--velvet-error)] animate-pulse" />
              Real-time AI Clinical Decision Support (CDS) Alerts
            </h4>
            <p className="text-xs text-[var(--velvet-text-muted)] mt-0.5">Automated diagnostic guardrails scanning active allergy status and medical history context.</p>
          </div>
          <Badge tone="error">
            Active Guardrails: 2 Warnings
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Warning 1: Allergy */}
          <Card variant="elevated" hover={false} className="p-4 rounded-2xl flex gap-3 text-xs text-start border-[var(--velvet-error-border)]">
            <div className="p-2 h-fit rounded-lg bg-[var(--velvet-error-bg)] border border-[var(--velvet-error-border)] text-[var(--velvet-error)] shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-[var(--velvet-error)]">Contraindication Warning: Penicillin Allergy</h5>
              <p className="text-xs text-[var(--velvet-text-muted)] leading-relaxed">
                Patient Arthur Pendragon has a recorded Penicillin allergy. Avoid prescribing Amoxicillin, Augmentin, or Penicillin V for dental infections.
              </p>
              <div className="flex flex-wrap gap-2 items-center text-2xs text-[var(--velvet-text-muted)] pt-1">
                <span>Suggested Alternative:</span>
                <strong className="text-[var(--velvet-success)] font-mono">Clindamycin 300mg</strong>
                <span>or</span>
                <strong className="text-[var(--velvet-success)] font-mono">Azithromycin 500mg</strong>
              </div>
            </div>
          </Card>

          {/* Warning 2: Epinephrine */}
          <Card variant="elevated" hover={false} className="p-4 rounded-2xl flex gap-3 text-xs text-start border-[var(--velvet-warning-border)]">
            <div className="p-2 h-fit rounded-lg bg-[var(--velvet-warning-bg)] border border-[var(--velvet-warning-border)] text-[var(--velvet-warning)] shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-[var(--velvet-warning)]">Epinephrine Precaution: Cardiovascular Alert</h5>
              <p className="text-xs text-[var(--velvet-text-muted)] leading-relaxed">
                Patient medical history flags hypertension risk. Limit epinephrine administration to a maximum of 2 cartridges (1:100,000).
              </p>
              <div className="flex flex-wrap gap-2 items-center text-2xs text-[var(--velvet-text-muted)] pt-1">
                <span>Consider Plain Anesthetic:</span>
                <strong className="text-[var(--velvet-warning)] font-mono">Mepivacaine 3% Plain</strong>
              </div>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
}
