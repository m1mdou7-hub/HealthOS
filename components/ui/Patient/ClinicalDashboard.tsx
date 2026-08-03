import React from 'react';
import { Calendar, Clipboard, DollarSign, FlaskConical, Layers, FileText, Activity, ShieldAlert } from 'lucide-react';
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
  // Find upcoming appointment details
  const upcomingAppt = appointments.find(a => a.status !== 'Completed' && a.status !== 'Cancelled');
  const upcomingText = upcomingAppt
    ? `${upcomingAppt.date} @ ${upcomingAppt.startTime}`
    : 'No upcoming visits';

  // Active plan progress
  const activePlan = treatmentPlans.find(p => p.progress < 100) || treatmentPlans[0];
  const progressPercent = activePlan ? activePlan.progress : 0;
  const pendingTxCount = activePlan
    ? (activePlan.items || []).filter(i => i.status !== 'Completed' && i.status !== 'Cancelled').length
    : 0;

  const dashboardCards = [
    {
      title: "Upcoming Appointment",
      value: upcomingText,
      subtext: upcomingAppt ? upcomingAppt.procedure : "Intake required",
      icon: Calendar,
      iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      tab: "appointments"
    },
    {
      title: "Pending Treatment",
      value: `${pendingTxCount} Procedures`,
      subtext: activePlan ? activePlan.title : "No active plan",
      icon: Clipboard,
      iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      tab: "treatment"
    },
    {
      title: "Outstanding Balance",
      value: `$${outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      subtext: outstandingBalance > 0 ? "Awaiting insurer / patient co-pay" : "Account settled",
      icon: DollarSign,
      iconColor: outstandingBalance > 0 ? "text-amber-500 bg-amber-500/10 border-amber-500/20" : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      tab: "billing"
    },
    {
      title: "Lab Cases / Orders",
      value: `${labOrdersCount} Active Cases`,
      subtext: "Tracked in prosthodontics queue",
      icon: FlaskConical,
      iconColor: "text-pink-400 bg-pink-500/10 border-pink-500/20",
      tab: "laboratory"
    },
    {
      title: "Radiology Reports",
      value: `${radiologyReportsCount} CBCT Studies`,
      subtext: "High-resolution DICOM slices",
      icon: Layers,
      iconColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      tab: "radiology"
    },
    {
      title: "Clinical SOAP Notes",
      value: `${clinicalNotesCount} Notes Logged`,
      subtext: "Auditable electronic records",
      icon: FileText,
      iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      tab: "clinical"
    },
    {
      title: "Treatment Progress",
      value: `${progressPercent}% Complete`,
      subtext: activePlan ? "Ongoing clinical course" : "Diagnostic baseline",
      icon: Activity,
      iconColor: "text-teal-400 bg-teal-500/10 border-teal-500/20",
      tab: "treatment"
    },
    {
      title: "Medical & Allergy Alerts",
      value: `${alertsCount} Active Alerts`,
      subtext: activePatient.allergyStatus === 'No Known Allergies' ? 'No drugs contraindications' : activePatient.allergyStatus,
      icon: ShieldAlert,
      iconColor: alertsCount > 0 ? "text-red-400 bg-red-500/10 border-red-500/20 animate-pulse" : "text-zinc-500 bg-zinc-900 border-zinc-800",
      tab: "overview"
    }
  ];

  return (
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
              <h3 className="text-lg font-bold text-white tracking-tight leading-none group-hover:text-emerald-400 transition-colors">
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
  );
}
