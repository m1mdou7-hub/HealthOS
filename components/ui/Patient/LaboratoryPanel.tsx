'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  FlaskConical, Plus, Eye, Edit3, Trash2, Box,
  Calendar, CheckCircle2, Clock, AlertCircle, ChevronRight, Layers
} from 'lucide-react';
import { PatientCase, PatientDocument } from '../../../utils/services/clinicalService';
import { Patient } from '../PatientWorkspace';

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
    <div className="p-5 rounded-3xl border border-zinc-900 bg-zinc-950/30 space-y-5 hover:border-zinc-800 transition-all group">
      {/* Top bar */}
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-2xs font-mono text-zinc-500 uppercase">{c.id} · {c.createdDate}</span>
            <span className={`px-2 py-0.5 rounded text-2xs uppercase font-mono font-bold border ${
              c.priority === 'Urgent'
                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}>
              {t('lab_priority')}: {c.priority}
            </span>
            <span className="text-2xs font-mono text-zinc-500">{t('lab_clinician')}: {c.clinician}</span>
          </div>
          <h3 className="text-sm font-bold text-white">{c.name}</h3>
        </div>

        {/* Countdown badge */}
        <div className="flex items-center gap-3 shrink-0">
          {countdown && (
            <div className={`text-end ${countdown.overdue ? 'text-red-400' : 'text-emerald-400'}`}>
              <span className="text-2xs font-mono uppercase block">
                {countdown.overdue ? t('lab_overdue') : t('lab_countdown')}
              </span>
              <span className="text-lg font-black font-mono leading-tight">
                {countdown.overdue ? `+${countdown.days}` : countdown.days}
              </span>
            </div>
          )}
          <div className="flex gap-1.5 self-center">
            <button onClick={onEdit} className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded bg-zinc-900 hover:bg-red-900/30 text-zinc-400 hover:text-red-400 border border-zinc-800 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stage Kanban Pipeline tracker */}
      <div className="space-y-2">
        <span className="text-2xs font-mono text-zinc-500 uppercase tracking-widest font-bold block">{t('lab_stages_track')}</span>
        <div className="flex items-center gap-0">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < stageIndex;
            const isActive = idx === stageIndex;
            return (
              <React.Fragment key={stage}>
                <div className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                    : isCompleted
                    ? 'opacity-60'
                    : 'opacity-25'
                }`}>
                  <div className={`w-2 h-2 rounded-full border ${
                    isActive ? 'bg-emerald-400 border-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' :
                    isCompleted ? 'bg-zinc-400 border-zinc-400' :
                    'bg-zinc-800 border-zinc-700'
                  }`} />
                  <span className={`text-2xs font-mono font-bold whitespace-nowrap ${
                    isActive ? 'text-emerald-400' : isCompleted ? 'text-zinc-400' : 'text-zinc-600'
                  }`}>{stageKey[stage]}</span>
                </div>
                {idx < STAGES.length - 1 && (
                  <ChevronRight className={`w-3 h-3 shrink-0 ${idx < stageIndex ? 'text-zinc-600' : 'text-zinc-800'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-2xs font-mono text-zinc-500">
          <span>{t('lab_progress')}</span>
          <span className={progress === 100 ? 'text-emerald-400 font-bold' : ''}>{progress}%</span>
        </div>
        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-950/50">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              progress === 100 ? 'bg-emerald-400' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Shade Picker */}
      <div className="space-y-2 pt-1 border-t border-zinc-900/60">
        <span className="text-2xs font-mono text-zinc-500 uppercase tracking-widest font-bold block">{t('lab_shade_picker')}</span>
        <div className="flex gap-1.5 flex-wrap">
          {SHADE_PALETTE.map((shade) => (
            <button
              key={shade.code}
              title={shade.label}
              onClick={() => setSelectedShade(shade.code)}
              className={`group/shade relative w-7 h-7 rounded-full border-2 transition-all ${
                selectedShade === shade.code
                  ? 'border-emerald-400 scale-110 shadow-[0_0_8px_rgba(52,211,153,0.4)]'
                  : 'border-zinc-800 hover:border-zinc-600 hover:scale-105'
              }`}
              style={{ backgroundColor: shade.hex }}
            >
              {selectedShade === shade.code && (
                <span className="absolute -bottom-5 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 rtl:translate-x-1/2 text-2xs font-mono text-emerald-400 whitespace-nowrap font-bold">
                  {shade.code}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="mt-1 text-2xs font-mono text-zinc-400">
          {t('lab_shade')}: <span className="text-white font-bold">{SHADE_PALETTE.find(s => s.code === selectedShade)?.label}</span>
        </div>
      </div>

      {/* Notes */}
      {c.notes && (
        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900/60 text-xs text-zinc-400 leading-normal">
          <span className="font-bold text-zinc-300 block mb-1">{t('lab_instructions')}:</span>
          {c.notes}
        </div>
      )}
    </div>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-900/10 p-4 rounded-3xl border border-zinc-900 gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono">
            <FlaskConical className="w-4 h-4 text-emerald-400" /> {t('lab_title')}
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">{t('lab_desc')}</p>
        </div>
        <button
          onClick={onAddCase}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1 self-stretch sm:self-auto justify-center transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> {t('btn_file_case')}
        </button>
      </div>

      {/* Mini stats strip */}
      {totalCases > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Total Cases', value: totalCases, color: 'text-white', icon: <Layers className="w-4 h-4 text-zinc-500" /> },
            { label: 'Delivered', value: deliveredCount, color: 'text-emerald-400', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
            { label: 'Urgent', value: urgentCount, color: 'text-red-400', icon: <AlertCircle className="w-4 h-4 text-red-500" /> },
            { label: 'Overdue', value: overdueCount, color: 'text-orange-400', icon: <Clock className="w-4 h-4 text-orange-500" /> },
          ].map((stat) => (
            <div key={stat.label} className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-3 flex flex-col items-center gap-1 text-center">
              {stat.icon}
              <span className={`text-xl font-black font-mono ${stat.color}`}>{stat.value}</span>
              <span className="text-2xs text-zinc-500 font-mono uppercase tracking-wide">{stat.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Cases */}
      <div className="space-y-4">
        {cases.length === 0 ? (
          <div className="text-zinc-500 text-xs text-center py-10 border border-zinc-900 rounded-3xl bg-zinc-950/20 flex flex-col items-center gap-2">
            <FlaskConical className="w-8 h-8 text-zinc-800" />
            {t('lab_no_cases')}
          </div>
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
      <div className="p-5 rounded-3xl border border-zinc-900 bg-zinc-950/20 space-y-4">
        <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
          <Box className="w-4 h-4 text-emerald-400" /> {t('lab_stl_title')}
        </h4>
        {stlFiles.length === 0 ? (
          <p className="text-zinc-500 text-xs py-2">{t('lab_stl_empty')}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stlFiles.map((stl: PatientDocument) => (
              <div key={stl.id} className="p-3.5 rounded-xl border border-zinc-900 bg-zinc-950/60 flex items-center justify-between hover:border-zinc-800 transition-colors">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-emerald-400" />
                  <div>
                    <h5 className="text-xs font-bold text-zinc-200 truncate max-w-[180px]">{stl.name}</h5>
                    <span className="text-2xs font-mono text-zinc-500">{stl.date}</span>
                  </div>
                </div>
                <button
                  onClick={() => alert(`Launching CAD/CAM exocad interactive viewport for design file: ${stl.name}`)}
                  className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-2xs text-zinc-300 rounded flex items-center gap-1 font-mono uppercase transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
