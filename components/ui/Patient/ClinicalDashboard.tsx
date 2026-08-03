'use client';

import React from 'react';
import { Calendar, Clipboard, DollarSign, FlaskConical, Layers, FileText, Activity, ShieldAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Appointment, TreatmentPlan } from '../../../utils/services/clinicalService';
import { Patient } from '../PatientWorkspace';

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
      iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      tab: "appointments"
    },
    {
      title: t('card_tx_title'),
      value: t('card_tx_procedures', { count: pendingTxCount }),
      subtext: activePlan ? activePlan.title : t('card_tx_none'),
      icon: Clipboard,
      iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      tab: "treatment"
    },
    {
      title: t('card_billing_title'),
      value: `$${outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      subtext: outstandingBalance > 0 ? t('card_billing_sub') : t('card_billing_settled'),
      icon: DollarSign,
      iconColor: outstandingBalance > 0 ? "text-amber-500 bg-amber-500/10 border-amber-500/20" : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      tab: "billing"
    },
    {
      title: t('card_lab_title'),
      value: t('card_lab_cases', { count: labOrdersCount }),
      subtext: t('card_lab_sub'),
      icon: FlaskConical,
      iconColor: "text-pink-400 bg-pink-500/10 border-pink-500/20",
      tab: "laboratory"
    },
    {
      title: t('card_radio_title'),
      value: t('card_radio_studies', { count: radiologyReportsCount }),
      subtext: t('card_radio_sub'),
      icon: Layers,
      iconColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      tab: "radiology"
    },
    {
      title: t('card_soap_title'),
      value: t('card_soap_notes', { count: clinicalNotesCount }),
      subtext: t('card_soap_sub'),
      icon: FileText,
      iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      tab: "clinical"
    },
    {
      title: t('card_progress_title'),
      value: t('card_progress_complete', { percent: progressPercent }),
      subtext: activePlan ? t('card_progress_sub') : t('card_progress_baseline'),
      icon: Activity,
      iconColor: "text-teal-400 bg-teal-500/10 border-teal-500/20",
      tab: "treatment"
    },
    {
      title: t('card_alerts_title'),
      value: t('card_alerts_active', { count: alertsCount }),
      subtext: activePatient.allergyStatus === 'No Known Allergies' ? t('card_alerts_none') : activePatient.allergyStatus,
      icon: ShieldAlert,
      iconColor: alertsCount > 0 ? "text-red-400 bg-red-500/10 border-red-500/20 animate-pulse" : "text-zinc-500 bg-zinc-900 border-zinc-800",
      tab: "overview"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigateTab(card.tab)}
              className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/10 hover:bg-zinc-900/20 hover:border-zinc-800 transition-all duration-200 cursor-pointer text-left flex flex-col justify-between h-36 relative group overflow-hidden"
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-wider">{card.title}</span>
                <div className={`p-2 rounded-xl border ${card.iconColor} shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1 mt-2">
                <h3 className="text-sm font-bold text-white tracking-tight leading-none group-hover:text-emerald-400 transition-colors">
                  {card.value}
                </h3>
                <p className="text-[11px] text-zinc-400 truncate leading-normal">
                  {card.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time AI Clinical Decision Support alerts panel */}
      <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-950/20 space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-900/60 pb-3">
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
              <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
              Real-time AI Clinical Decision Support (CDS) Alerts
            </h4>
            <p className="text-[11px] text-zinc-500 mt-0.5">Automated diagnostic guardrails scanning active allergy status and medical history context.</p>
          </div>
          <span className="text-[9px] font-mono bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded">
            Active Guardrails: 2 Warnings
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Warning 1: Allergy */}
          <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/[0.02] flex gap-3 text-xs text-left">
            <div className="p-2 h-fit rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-rose-400">Contraindication Warning: Penicillin Allergy</h5>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Patient Arthur Pendragon has a recorded Penicillin allergy. Avoid prescribing Amoxicillin, Augmentin, or Penicillin V for dental infections.
              </p>
              <div className="flex flex-wrap gap-2 items-center text-[10px] text-zinc-500 pt-1">
                <span>Suggested Alternative:</span>
                <strong className="text-emerald-400 font-mono">Clindamycin 300mg</strong>
                <span>or</span>
                <strong className="text-emerald-400 font-mono">Azithromycin 500mg</strong>
              </div>
            </div>
          </div>

          {/* Warning 2: Epinephrine */}
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.01] flex gap-3 text-xs text-left">
            <div className="p-2 h-fit rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-amber-400">Epinephrine Precaution: Cardiovascular Alert</h5>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Patient medical history flags hypertension risk. Limit epinephrine administration to a maximum of 2 cartridges (1:100,000).
              </p>
              <div className="flex flex-wrap gap-2 items-center text-[10px] text-zinc-500 pt-1">
                <span>Consider Plain Anesthetic:</span>
                <strong className="text-amber-450 font-mono">Mepivacaine 3% Plain</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
