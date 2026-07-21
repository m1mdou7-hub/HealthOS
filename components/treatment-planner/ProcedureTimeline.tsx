'use client';

import React from 'react';
import { Calendar, Clock, Link as LinkIcon, Activity } from 'lucide-react';

export interface Phase {
  id: string;
  name: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  date: string;
  linkedAppointmentId?: string;
  progress: number;
}

interface ProcedureTimelineProps {
  phases: Phase[];
  setPhases: (val: Phase[]) => void;
}

export default function ProcedureTimeline({ phases, setPhases }: ProcedureTimelineProps) {

  const addPhase = () => {
    const newPhase: Phase = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Phase',
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      progress: 0
    };
    setPhases([...phases, newPhase]);
  };

  const updatePhase = (id: string, field: keyof Phase, value: any) => {
    setPhases(phases.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  return (
    <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 space-y-6">

      <div className="flex items-center justify-between border-b border-zinc-900/60 pb-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" /> Sequencing & Procedure Timeline
          </h4>
          <p className="text-[10px] text-zinc-500 mt-1">
            Organize treatment phases, track completion progress, and link to clinical appointments.
          </p>
        </div>
        <button
          onClick={addPhase}
          className="text-xs bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1.5 rounded-lg border border-zinc-850 font-bold transition-colors"
        >
          + Add Phase
        </button>
      </div>

      <div className="space-y-4">
        {phases.map((phase, idx) => (
          <div key={phase.id} className="relative flex gap-4">

            {/* Timeline Line */}
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full mt-2 shrink-0 ${
                phase.status === 'Completed' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                phase.status === 'In Progress' ? 'bg-purple-500 animate-pulse' :
                'bg-zinc-700 border-2 border-zinc-600'
              }`} />
              {idx < phases.length - 1 && (
                <div className="w-0.5 h-full bg-zinc-800 mt-2" />
              )}
            </div>

            {/* Phase Content */}
            <div className="flex-1 bg-zinc-900/30 border border-zinc-850 rounded-xl p-4 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

                <input
                  type="text"
                  value={phase.name}
                  onChange={(e) => updatePhase(phase.id, 'name', e.target.value)}
                  className="bg-transparent border-b border-zinc-800 focus:border-emerald-500/50 outline-none text-sm font-bold text-white py-1 md:w-1/3"
                />

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800 text-xs text-zinc-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <input
                      type="date"
                      value={phase.date}
                      onChange={(e) => updatePhase(phase.id, 'date', e.target.value)}
                      className="bg-transparent border-none outline-none text-zinc-300"
                    />
                  </div>

                  <select
                    value={phase.status}
                    onChange={(e) => updatePhase(phase.id, 'status', e.target.value)}
                    className="bg-zinc-950 px-2 py-1.5 rounded-lg border border-zinc-800 text-xs font-bold text-zinc-300"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Progress & Linking */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[10px] font-mono font-bold text-zinc-500">
                    <span>Progress Tracking</span>
                    <span>{phase.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className={`h-full transition-all duration-500 ${
                        phase.status === 'Completed' ? 'bg-emerald-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${phase.progress}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0" max="100"
                    value={phase.progress}
                    onChange={(e) => updatePhase(phase.id, 'progress', parseInt(e.target.value))}
                    className="w-full h-1 mt-1 opacity-0 hover:opacity-100 cursor-ew-resize transition-opacity"
                  />
                </div>

                <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">
                  <LinkIcon className="w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={phase.linkedAppointmentId || ''}
                    onChange={(e) => updatePhase(phase.id, 'linkedAppointmentId', e.target.value)}
                    placeholder="Link Appt ID..."
                    className="w-24 bg-transparent border-none outline-none text-[10px] text-zinc-400 font-mono"
                  />
                </div>
              </div>
            </div>

          </div>
        ))}

        {phases.length === 0 && (
          <div className="text-center py-8 text-zinc-600 text-xs border border-dashed border-zinc-800 rounded-xl">
            No phases defined. Add phases to build your treatment timeline.
          </div>
        )}
      </div>
    </div>
  );
}
