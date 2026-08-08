import React from 'react';
import { Activity, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Patient } from '../PatientWorkspace';
import { Card, Progress } from '@/components/ui/design-system';

interface AnalyticsPanelProps {
  activePatient: Patient;
}

export default function AnalyticsPanel({ activePatient }: AnalyticsPanelProps) {
  // Mock clinical analytics
  const metrics = [
    { label: "Bone Density index", value: "D2 Alveolar Ridge", percent: 85, tone: 'default' as const },
    { label: "Periodontal Attachment Index", value: "Stable Periodontium", percent: 92, tone: 'success' as const },
    { label: "Occlusal Stress Distribution", value: "Canine Guidance Calibrated", percent: 78, tone: 'default' as const },
    { label: "Restorative Structural Ratio", value: "Lithium Disilicate Crown 88%", percent: 88, tone: 'success' as const }
  ];

  return (
    <div className="space-y-6 text-start">
      {/* Header */}
      <Card variant="gradient" hover={false} className="p-4 rounded-3xl">
        <h3 className="text-sm font-bold text-[var(--velvet-text)] flex items-center gap-1.5 font-mono">
          <Activity className="w-4 h-4 text-[var(--velvet-success)]" /> Patient Clinical Diagnostics Analytics
        </h3>
        <p className="text-xs text-[var(--velvet-text-muted)] mt-0.5">Statistical metrics for bone grafting, periodontal index margins, and occlusal guidance values.</p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((m, idx) => (
          <Card key={idx} variant="elevated" hover={false} className="p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-2xs text-[var(--velvet-text-muted)] font-mono uppercase block">{m.label}</span>
                <h4 className="text-sm font-bold text-[var(--velvet-text)] mt-1">{m.value}</h4>
              </div>
              <TrendingUp className="w-4 h-4 text-[var(--velvet-text-muted)]" />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-2xs font-mono text-[var(--velvet-text-muted)]">
                <span>Diagnostic Accuracy Index</span>
                <span>{m.percent}%</span>
              </div>
              <Progress value={m.percent} size="sm" tone={m.tone} />
            </div>
          </Card>
        ))}
      </div>

      {/* HIPAA compliance statement */}
      <Card variant="elevated" hover={false} className="p-4 rounded-2xl flex items-center gap-3 text-xs text-[var(--velvet-text-muted)]">
        <CheckCircle2 className="w-5 h-5 text-[var(--velvet-success)] shrink-0" />
        <p className="leading-relaxed">
          EHR Diagnostic Analytics synchronized securely with HIPAA-compliant hospital clouds. Longitudinal statistics are compiled utilizing virtual PACS articulators and real-time intraoral scan registries.
        </p>
      </Card>
    </div>
  );
}
