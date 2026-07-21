'use client';

import React from 'react';

export type ToothStatusType = 'healthy' | 'decayed' | 'missing' | 'treated' | 'planned';

interface ToothSelectorProps {
  selectedTeeth: number[];
  onToggleTooth: (tooth: number) => void;
  toothStatus?: Record<number, ToothStatusType>;
}

export default function ToothSelector({
  selectedTeeth = [],
  onToggleTooth,
  toothStatus = {}
}: ToothSelectorProps) {
  const upperTeeth = Array.from({ length: 16 }, (_, i) => i + 1);
  const lowerTeeth = Array.from({ length: 16 }, (_, i) => 32 - i);

  const getStatusColor = (status?: ToothStatusType) => {
    switch (status) {
      case 'decayed': return 'bg-amber-500/20 text-amber-500 border-amber-500/50';
      case 'missing': return 'bg-zinc-800/50 text-zinc-500 border-zinc-700/50 line-through';
      case 'treated': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'planned': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      default: return 'bg-zinc-900 text-zinc-300 border-zinc-800';
    }
  };

  const renderToothRow = (teeth: number[]) => (
    <div className="flex justify-center gap-1.5 sm:gap-2 flex-wrap">
      {teeth.map(tooth => {
        const isSelected = selectedTeeth.includes(tooth);
        const status = toothStatus[tooth];
        return (
          <button
            key={tooth}
            type="button"
            onClick={() => onToggleTooth(tooth)}
            className={`
              relative flex flex-col items-center justify-center w-8 h-10 sm:w-10 sm:h-12
              rounded-lg border-2 text-xs font-mono font-bold transition-all hover:scale-105 active:scale-95
              ${getStatusColor(status)}
              ${isSelected ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-zinc-950 border-emerald-500' : ''}
            `}
          >
            {tooth}
            {status && (
              <span className={`absolute -bottom-1.5 w-1.5 h-1.5 rounded-full ${
                status === 'decayed' ? 'bg-amber-500' :
                status === 'treated' ? 'bg-emerald-500' :
                status === 'planned' ? 'bg-purple-500' : 'bg-transparent'
              }`} />
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="p-6 bg-zinc-950/40 border border-zinc-900 rounded-2xl space-y-6 overflow-x-auto">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Odontogram Map</h3>
          <p className="text-[10px] text-zinc-500">Interactive tooth-by-tooth selection and clinical status</p>
        </div>

        <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-400 uppercase font-bold bg-zinc-900 p-2 rounded-xl">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-zinc-900 border border-zinc-700" /> Healthy</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-amber-500/20 border border-amber-500/50" /> Decayed</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-zinc-800/50 border border-zinc-700/50" /> Missing</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-purple-500/20 border border-purple-500/50" /> Planned</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-emerald-500/20 border border-emerald-500/50" /> Treated</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <div className="text-[9px] text-center text-zinc-600 font-bold uppercase tracking-widest mb-2">Maxillary Arch</div>
          {renderToothRow(upperTeeth)}
        </div>
        <div className="h-px bg-zinc-900/60 w-full max-w-2xl mx-auto my-4" />
        <div className="space-y-1">
          {renderToothRow(lowerTeeth)}
          <div className="text-[9px] text-center text-zinc-600 font-bold uppercase tracking-widest mt-2">Mandibular Arch</div>
        </div>
      </div>
    </div>
  );
}
