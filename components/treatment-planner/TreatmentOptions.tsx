'use client';

import React, { useState } from 'react';
import { Target, Layers, Plus } from 'lucide-react';

export interface Procedure {
  id: string;
  name: string;
  tooth?: number | string;
  status: 'Planned' | 'Completed' | 'Cancelled' | 'Deferred';
  provider: string;
  template?: string;
  alternativeTo?: string;
}

interface TreatmentOptionsProps {
  objectives: string[];
  setObjectives: (val: string[]) => void;
  procedures: Procedure[];
  setProcedures: (val: Procedure[]) => void;
}

const TEMPLATES = [
  'Zirconia Crown Prep & Temp',
  'Implant Placement w/ Guide',
  'Composite Restoration (MOD)',
  'Root Canal Therapy (Molar)'
];

const PROVIDERS = ['Dr. Smith (Prosthodontist)', 'Dr. Jones (General)', 'Dr. Lee (Endodontist)'];

export default function TreatmentOptions({
  objectives, setObjectives,
  procedures, setProcedures
}: TreatmentOptionsProps) {

  const [newObjective, setNewObjective] = useState('');

  const addObjective = () => {
    if (newObjective.trim() !== '') {
      setObjectives([...objectives, newObjective.trim()]);
      setNewObjective('');
    }
  };

  const addProcedure = () => {
    const newProc: Procedure = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Procedure',
      status: 'Planned',
      provider: PROVIDERS[0]
    };
    setProcedures([...procedures, newProc]);
  };

  const updateProcedure = (id: string, field: keyof Procedure, value: string) => {
    setProcedures(procedures.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removeProcedure = (id: string) => {
    setProcedures(procedures.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">

      {/* Treatment Objectives */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" /> Treatment Objectives & Alternatives
          </h4>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addObjective()}
              placeholder="New objective..."
              className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500/50 w-40"
            />
            <button
              onClick={addObjective}
              className="text-[10px] bg-zinc-900 hover:bg-zinc-800 px-2 py-1.5 rounded-lg text-zinc-400 font-mono transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {objectives.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {objectives.map((obj, i) => (
              <li key={i} className="bg-zinc-900 p-3 rounded-xl border border-zinc-850 text-xs text-zinc-300 flex justify-between">
                <span>{obj}</span>
                <button
                  onClick={() => setObjectives(objectives.filter((_, idx) => idx !== i))}
                  className="text-zinc-500 hover:text-red-400"
                >&times;</button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-zinc-600 italic">Define clinical goals and alternative treatment pathways here.</p>
        )}
      </div>

      {/* Planned Procedures */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" /> Treatment Options & Procedures
          </h4>
          <button
            onClick={addProcedure}
            className="text-xs bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Procedure
          </button>
        </div>

        <div className="space-y-3">
          {procedures.map((proc) => (
            <div key={proc.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-850 items-center">

              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[10px] uppercase font-mono text-zinc-500 font-bold">Procedure Name</label>
                <input
                  type="text"
                  value={proc.name}
                  onChange={(e) => updateProcedure(proc.id, 'name', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-xs text-white"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] uppercase font-mono text-zinc-500 font-bold">Tooth</label>
                <input
                  type="text"
                  value={proc.tooth || ''}
                  onChange={(e) => updateProcedure(proc.id, 'tooth', e.target.value)}
                  placeholder="e.g. 14, 15"
                  className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-xs text-white"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] uppercase font-mono text-zinc-500 font-bold">Template</label>
                <select
                  value={proc.template || ''}
                  onChange={(e) => updateProcedure(proc.id, 'template', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-xs text-zinc-300"
                >
                  <option value="">Custom</option>
                  {TEMPLATES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] uppercase font-mono text-zinc-500 font-bold">Provider</label>
                <select
                  value={proc.provider}
                  onChange={(e) => updateProcedure(proc.id, 'provider', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-xs text-zinc-300"
                >
                  {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] uppercase font-mono text-zinc-500 font-bold">Status</label>
                <select
                  value={proc.status}
                  onChange={(e) => updateProcedure(proc.id, 'status', e.target.value)}
                  className={`w-full p-2 rounded-lg text-xs font-bold border ${
                    proc.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    proc.status === 'Deferred' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    proc.status === 'Cancelled' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    'bg-zinc-950 text-zinc-300 border-zinc-800'
                  }`}
                >
                  <option value="Planned">Planned</option>
                  <option value="Completed">Completed</option>
                  <option value="Deferred">Deferred</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="md:col-span-1 flex justify-end">
                <button
                  onClick={() => removeProcedure(proc.id)}
                  className="text-zinc-600 hover:text-red-400 p-2"
                >
                  &times;
                </button>
              </div>

            </div>
          ))}

          {procedures.length === 0 && (
            <div className="text-center py-8 text-zinc-600 text-xs border border-dashed border-zinc-800 rounded-xl">
              No procedures added to this treatment option yet.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
