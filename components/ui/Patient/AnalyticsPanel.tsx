import React from 'react';
import { Activity, ShieldAlert, CheckCircle2, TrendingUp } from 'lucide-react';
import { Patient } from '../PatientWorkspace';

interface AnalyticsPanelProps {
  activePatient: Patient;
}

export default function AnalyticsPanel({ activePatient }: AnalyticsPanelProps) {
  // Mock clinical analytics
  const metrics = [
    { label: "Bone Density index", value: "D2 Alveolar Ridge", percent: 85, color: "bg-blue-500" },
    { label: "Periodontal Attachment Index", value: "Stable Periodontium", percent: 92, color: "bg-emerald-500" },
    { label: "Occlusal Stress Distribution", value: "Canine Guidance Calibrated", percent: 78, color: "bg-purple-500" },
    { label: "Restorative Structural Ratio", value: "Lithium Disilicate Crown 88%", percent: 88, color: "bg-teal-500" }
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="bg-zinc-900/10 p-4 rounded-2xl border border-zinc-900">
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono">
          <Activity className="w-4 h-4 text-emerald-400" /> Patient Clinical Diagnostics Analytics
        </h3>
        <p className="text-[11px] text-zinc-400 mt-0.5">Statistical metrics for bone grafting, periodontal index margins, and occlusal guidance values.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((m, idx) => (
          <div key={idx} className="p-5 rounded-xl border border-zinc-900 bg-zinc-950/40 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-zinc-500 font-mono uppercase block">{m.label}</span>
                <h4 className="text-sm font-bold text-white mt-1">{m.value}</h4>
              </div>
              <TrendingUp className="w-4 h-4 text-zinc-500" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>Diagnostic Accuracy Index</span>
                <span>{m.percent}%</span>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-950">
                <div className={`h-full ${m.color} transition-all duration-300`} style={{ width: `${m.percent}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* HIPAA compliance statement */}
      <div className="p-4 rounded-xl border border-zinc-900/60 bg-zinc-950/20 flex items-center gap-3 text-xs text-zinc-400">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        <p className="leading-relaxed">
          EHR Diagnostic Analytics synchronized securely with HIPAA-compliant hospital clouds. Longitudinal statistics are compiled utilizing virtual PACS articulators and real-time intraoral scan registries.
        </p>
      </div>
    </div>
  );
}
