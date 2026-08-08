'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  FlaskConical, Plus, Eye, Edit3, Trash2, Box,
  CheckCircle2, Clock, AlertCircle, ChevronRight, Layers
} from 'lucide-react';
import { PatientCase, PatientDocument } from '../../../utils/services/clinicalService';
import { Patient } from '../PatientWorkspace';
import { Card, Button, Badge, Progress, EmptyState } from '@/components/ui/design-system';

interface LaboratoryPanelProps {
  supabase: SupabaseClient;
  activePatient: Patient;
  demoMode: boolean;
  cases: PatientCase[];
  onAddCase: () => void;
  onEditCase: (item: PatientCase) => void;
  onDeleteCase: (id: string) => void;
}

// Shade palette data
const SHADE_PALETTE = [
  { code: 'A1', hex: '#f5ead0', label: 'A1 – Very Light' },
  { code: 'A2', hex: '#f0ddb6', label: 'A2 – Light' },
  { code: 'A3', hex: '#e8cc9a', label: 'A3 – Medium' },
  { code: 'A3.5', hex: '#deba80', label: 'A3.5 – Medium Dark' },
  { code: 'B1', hex: '#f2e8c8', label: 'B1 – Light Yellow' },
  { code: 'B2', hex: '#ead6a8', label: 'B2 – Yellow' },
  { code: 'C1', hex: '#d9c99a', label: 'C1 – Grey Light' },
  { code: 'C2', hex: '#c8b380', label: 'C2 – Grey' },
  { code: 'D2', hex: '#d4c090', label: 'D2 – Orange Light' },
  { code: 'D3', hex: '#c8ac78', label: 'D3 – Orange' },
];

// Stage pipeline
const STAGES = ['Design', 'Milling', 'Sintering', 'Glazing', 'Delivered'];

// Calculate days remaining or overdue
function getDaysRemaining(dueDate?: string): { days: number; overdue: boolean } | null {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const now = new Date();
  const diff = Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return { days: Math.abs(diff), overdue: diff < 0 };
}

// Progress percentage per stage
const STAGE_PROGRESS: Record<string, number> = {
  Design: 15,
  Milling: 35,
  Sintering: 60,
  Glazing: 85,
  Delivered: 100
};

function CaseCard({ c, t, onEdit, onDelete }: { c: PatientCase; t: any; onEdit: () => void; onDelete: () => void }) {
  const stageIndex = STAGES.indexOf(c.stage);
  const progress = STAGE_PROGRESS[c.stage] ?? c.progress ?? 0;
  const countdown = getDaysRemaining(c.dueDate);
  const [selectedShade, setSelectedShade] = useState(SHADE_PALETTE[1].code);

  const stageKey: Record<string, string> = {
    Design: t('lab_stage_design'),
    Milling: t('lab_stage_milling'),
    Sintering: t('lab_stage_sintering'),
    Glazing: t('lab_stage_glazing'),
    Delivered: t('lab_stage_delivered'),
  };

  return (
    <Card variant="elevated" className="p-5 rounded-3xl space-y-5 group">
      {/* Top bar */}
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-2xs font-mono text-[var(--velvet-text-muted)] uppercase">{c.id} · {c.createdDate}</span>
            <Badge tone={c.priority === 'Urgent' ? 'error' : 'neutral'} className="text-2xs uppercase font-mono font-bold">
              {t('lab_priority')}: {c.priority}
            </Badge>
            <span className="text-2xs font-mono text-[var(--velvet-text-muted)]">{t('lab_clinician')}: {c.clinician}</span>
          </div>
          <h3 className="text-sm font-bold text-[var(--velvet-text)]">{c.name}</h3>
        </div>

        {/* Countdown badge */}
        <div className="flex items-center gap-3 shrink-0">
          {countdown && (
            <div className={`text-end ${countdown.overdue ? 'text-[var(--velvet-error)]' : 'text-[var(--velvet-success)]'}`}>
              <span className="text-2xs font-mono uppercase block">
                {countdown.overdue ? t('lab_overdue') : t('lab_countdown')}
              </span>
              <span className="text-lg font-black font-mono leading-tight">
                {countdown.overdue ? `+${countdown.days}` : countdown.days}
              </span>
            </div>
          )}
          <div className="flex gap-1.5 self-center">
            <Button variant="ghost" size="sm" onClick={onEdit} className="p-1.5 text-[var(--velvet-text-muted)] hover:text-[var(--velvet-text)]" aria-label={`Edit ${c.name}`}>
              <Edit3 className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="p-1.5 text-[var(--velvet-text-muted)] hover:text-[var(--velvet-error)] hover:bg-[var(--velvet-error-bg)]" aria-label={`Delete ${c.name}`}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stage Kanban Pipeline tracker */}
      <div className="space-y-2">
        <span className="text-2xs font-mono text-[var(--velvet-text-muted)] uppercase tracking-widest font-bold block">{t('lab_stages_track')}</span>
        <div className="flex items-center gap-0">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < stageIndex;
            const isActive = idx === stageIndex;
            return (
              <React.Fragment key={stage}>
                <div className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[var(--velvet-success-bg)] border border-[var(--velvet-success-border)]'
                    : isCompleted
                    ? 'opacity-60'
                    : 'opacity-25'
                }`}>
                  <div className={`w-2 h-2 rounded-full border ${
                    isActive ? 'bg-[var(--velvet-success)] border-[var(--velvet-success)]' :
                    isCompleted ? 'bg-[var(--velvet-text-muted)] border-[var(--velvet-text-muted)]' :
                    'bg-[var(--velvet-surface-3)] border-[var(--velvet-border-strong)]'
                  }`} />
                  <span className={`text-2xs font-mono font-bold whitespace-nowrap ${
                    isActive ? 'text-[var(--velvet-success)]' : isCompleted ? 'text-[var(--velvet-text-muted)]' : 'text-[var(--velvet-text-faint)]'
                  }`}>{stageKey[stage]}</span>
                </div>
                {idx < STAGES.length - 1 && (
                  <ChevronRight className={`w-3 h-3 shrink-0 ${idx < stageIndex ? 'text-[var(--velvet-text-faint)]' : 'text-[var(--velvet-border-strong)]'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-2xs font-mono text-[var(--velvet-text-muted)]">
          <span>{t('lab_progress')}</span>
          <span className={progress === 100 ? 'text-[var(--velvet-success)] font-bold' : ''}>{progress}%</span>
        </div>
        <Progress value={progress} size="sm" tone={progress === 100 ? 'success' : 'default'} />
      </div>

      {/* Shade Picker */}
      <div className="space-y-2 pt-1 border-t" style={{ borderColor: 'var(--velvet-border)' }}>
        <span className="text-2xs font-mono text-[var(--velvet-text-muted)] uppercase tracking-widest font-bold block">{t('lab_shade_picker')}</span>
        <div className="flex gap-1.5 flex-wrap">
          {SHADE_PALETTE.map((shade) => (
            <button
              key={shade.code}
              title={shade.label}
              onClick={() => setSelectedShade(shade.code)}
              className={`group/shade relative w-7 h-7 rounded-full border-2 transition-all ${
                selectedShade === shade.code
                  ? 'border-[var(--velvet-success)] scale-110 shadow-[0_0_8px_var(--velvet-success-glow)]'
                  : 'border-[var(--velvet-border)] hover:border-[var(--velvet-border-strong)] hover:scale-105'
              }`}
              style={{ backgroundColor: shade.hex }}
            >
              {selectedShade === shade.code && (
                <span className="absolute -bottom-5 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 text-2xs font-mono text-[var(--velvet-success)] whitespace-nowrap font-bold">
                  {shade.code}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="mt-1 text-2xs font-mono text-[var(--velvet-text-muted)]">
          {t('lab_shade')}: <span className="text-[var(--velvet-text)] font-bold">{SHADE_PALETTE.find(s => s.code === selectedShade)?.label}</span>
        </div>
      </div>

      {/* Notes */}
      {c.notes && (
        <div className="p-3 bg-[var(--velvet-surface-2)] rounded-xl border text-xs text-[var(--velvet-text-muted)] leading-normal" style={{ borderColor: 'var(--velvet-border)' }}>
          <span className="font-bold text-[var(--velvet-text-sub)] block mb-1">{t('lab_instructions')}:</span>
          {c.notes}
        </div>
      )}
    </Card>
  );
}

export default function LaboratoryPanel({
  supabase,
  activePatient,
  demoMode,
  cases = [],
  onAddCase,
  onEditCase,
  onDeleteCase,
}: LaboratoryPanelProps) {
  const t = useTranslations('PatientWorkspace');

  const { data: documents = [] } = useQuery({
    queryKey: ['documents', activePatient.id],
    enabled: !!activePatient.id
  });

  const stlFiles = (documents as PatientDocument[]).filter(d => d.type === 'STL File');

  // Aggregate progress stats for the mini summary strip
  const totalCases = cases.length;
  const deliveredCount = cases.filter(c => c.stage === 'Delivered').length;
  const urgentCount = cases.filter(c => c.priority === 'Urgent').length;
  const overdueCount = cases.filter(c => {
    const r = getDaysRemaining(c.dueDate);
    return r?.overdue;
  }).length;

  return (
    <div className="space-y-6 text-start">
      {/* Header */}
      <Card variant="elevated" hover={false} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-3xl gap-3">
        <div>
          <h3 className="text-sm font-bold text-[var(--velvet-text)] flex items-center gap-1.5 font-mono">
            <FlaskConical className="w-4 h-4 text-[var(--velvet-success)]" /> {t('lab_title')}
          </h3>
          <p className="text-xs text-[var(--velvet-text-muted)] mt-0.5">{t('lab_desc')}</p>
        </div>
        <Button size="sm" onClick={onAddCase} className="self-stretch sm:self-auto justify-center">
          <Plus className="w-3.5 h-3.5" /> {t('btn_file_case')}
        </Button>
      </Card>

      {/* Mini stats strip */}
      {totalCases > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Total Cases', value: totalCases, color: 'text-[var(--velvet-text)]', icon: <Layers className="w-4 h-4 text-[var(--velvet-text-muted)]" /> },
            { label: 'Delivered', value: deliveredCount, color: 'text-[var(--velvet-success)]', icon: <CheckCircle2 className="w-4 h-4 text-[var(--velvet-success)]" /> },
            { label: 'Urgent', value: urgentCount, color: 'text-[var(--velvet-error)]', icon: <AlertCircle className="w-4 h-4 text-[var(--velvet-error)]" /> },
            { label: 'Overdue', value: overdueCount, color: 'text-[var(--velvet-warning)]', icon: <Clock className="w-4 h-4 text-[var(--velvet-warning)]" /> },
          ].map((stat) => (
            <Card key={stat.label} variant="elevated" hover={false} className="p-3 flex flex-col items-center gap-1 text-center">
              {stat.icon}
              <span className={`text-xl font-black font-mono ${stat.color}`}>{stat.value}</span>
              <span className="text-2xs text-[var(--velvet-text-muted)] font-mono uppercase tracking-wide">{stat.label}</span>
            </Card>
          ))}
        </div>
      )}

      {/* Cases */}
      <div className="space-y-4">
        {cases.length === 0 ? (
          <EmptyState
            icon={<FlaskConical className="w-8 h-8" />}
            title={t('lab_no_cases')}
          />
        ) : (
          cases.map((c) => (
            <CaseCard
              key={c.id}
              c={c}
              t={t}
              onEdit={() => onEditCase(c)}
              onDelete={() => onDeleteCase(c.id)}
            />
          ))
        )}
      </div>

      {/* 3D STL files */}
      <Card variant="elevated" hover={false} className="p-5 rounded-3xl space-y-4">
        <h4 className="text-xs font-bold text-[var(--velvet-text)] font-mono uppercase tracking-wider flex items-center gap-1.5">
          <Box className="w-4 h-4 text-[var(--velvet-success)]" /> {t('lab_stl_title')}
        </h4>
        {stlFiles.length === 0 ? (
          <p className="text-[var(--velvet-text-muted)] text-xs py-2">{t('lab_stl_empty')}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stlFiles.map((stl: PatientDocument) => (
              <Card key={stl.id} variant="elevated" hover className="p-3.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-[var(--velvet-success)]" />
                  <div>
                    <h5 className="text-xs font-bold text-[var(--velvet-text-sub)] truncate max-w-[180px]">{stl.name}</h5>
                    <span className="text-2xs font-mono text-[var(--velvet-text-muted)]">{stl.date}</span>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => alert(`Launching CAD/CAM exocad interactive viewport for design file: ${stl.name}`)}
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </Button>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
