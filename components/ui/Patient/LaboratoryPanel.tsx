import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';
import { FlaskConical, Plus, Eye, Edit3, Trash2, Box, Calendar } from 'lucide-react';
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

export default function LaboratoryPanel({
  supabase,
  activePatient,
  demoMode,
  cases = [],
  onAddCase,
  onEditCase,
  onDeleteCase
}: LaboratoryPanelProps) {
  // Query 3D STL files from documents
  const { data: documents = [] } = useQuery({
    queryKey: ['documents', activePatient.id],
    enabled: !!activePatient.id
  });

  const stlFiles = (documents as PatientDocument[]).filter(d => d.type === 'STL File');

  return (
    <div className="space-y-6 text-left">
      {/* Header action toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-900/10 p-4 rounded-2xl border border-zinc-900 gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono">
            <FlaskConical className="w-4 h-4 text-emerald-400" /> CAD/CAM Laboratory Coordinator
          </h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">Track zirconia bridge milling, E.max veneer glazing, and diagnostic STL models.</p>
        </div>
        <button
          onClick={onAddCase}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1 self-stretch sm:self-auto justify-center"
        >
          <Plus className="w-3.5 h-3.5" /> File Lab Case
        </button>
      </div>

      {/* Lab cases tracker cards */}
      <div className="space-y-4">
        {cases.length === 0 ? (
          <div className="text-zinc-500 text-xs text-center py-8 border border-zinc-900 rounded-2xl bg-zinc-950/20">
            No laboratory cases recorded for this patient. Click File Lab Case to submit one.
          </div>
        ) : (
          cases.map((c) => (
            <div key={c.id} className="p-5 rounded-2xl border border-zinc-900 bg-zinc-950/20 space-y-4">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="text-left flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">{c.id} • Registered {c.createdDate}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-mono font-bold border ${
                      c.priority === 'Urgent' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-zinc-900 text-zinc-400 border-zinc-800'
                    }`}>
                      {c.priority} Priority
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500">Clinician: {c.clinician}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">{c.name}</h3>
                  <p className="text-[11px] text-zinc-400 mt-1 font-mono">Stage: {c.stage}</p>
                </div>
                <div className="text-right flex items-center gap-4 shrink-0 font-mono text-xs">
                  <div>
                    <span className="text-[9px] text-zinc-500 block uppercase">Due Date</span>
                    <span className="text-white font-bold flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-zinc-500" /> {c.dueDate || 'N/A'}</span>
                  </div>
                  <div className="flex gap-1.5 self-center">
                    <button
                      onClick={() => onEditCase(c)}
                      className="text-zinc-400 hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteCase(c.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>Milling & Sintering Progress</span>
                  <span>{c.progress}%</span>
                </div>
                <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-950">
                  <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${c.progress}%` }} />
                </div>
              </div>

              {/* Notes */}
              {c.notes && (
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900/60 text-[11px] text-zinc-400 leading-normal">
                  <span className="font-bold text-zinc-300 block mb-1">Laboratory Instructions:</span>
                  {c.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 3D STL files preview list */}
      <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-950/20 space-y-4">
        <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Diagnostic 3D Scan Files (STL)</h4>
        {stlFiles.length === 0 ? (
          <p className="text-zinc-500 text-xs py-2">No STL scan files compiled. Go to the Documents tab to upload one.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stlFiles.map((stl) => (
              <div key={stl.id} className="p-3.5 rounded-xl border border-zinc-900 bg-zinc-950/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-emerald-400" />
                  <div>
                    <h5 className="text-[11px] font-bold text-zinc-200 truncate max-w-[180px]">{stl.name}</h5>
                    <span className="text-[9px] font-mono text-zinc-500">{stl.date}</span>
                  </div>
                </div>
                <button
                  onClick={() => alert(`Launching CAD/CAM exocad interactive viewport for design file: ${stl.name}`)}
                  className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 rounded flex items-center gap-1 font-mono uppercase"
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
