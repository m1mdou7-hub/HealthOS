import React from 'react';

interface ToothSelectorProps {
  teeth: number[];
  teethStatuses: Record<number, string>;
  onToggleState: (toothId: number) => void;
}

export function ToothSelector({ teeth, teethStatuses, onToggleState }: ToothSelectorProps) {
  return (
    <div className="flex justify-center gap-2 overflow-x-auto py-2">
      {teeth.map((t) => {
        const status = teethStatuses[t] || 'sound';
        return (
          <button
            key={t}
            onClick={() => onToggleState(t)}
            className={`w-9 h-14 rounded-lg flex flex-col justify-between items-center p-1.5 border transition-all ${
              status === 'prep'
                ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                : status === 'restored'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                  : status === 'implant'
                    ? 'bg-blue-500/10 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10'
                    : status === 'missing'
                      ? 'bg-zinc-950 border-dashed border-zinc-800 text-zinc-600 opacity-40'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <span className="text-[8px] font-mono block text-center font-bold">{t}</span>
            <div className="w-4.5 h-4.5 rounded-full bg-zinc-950/40 border border-zinc-800/40 flex items-center justify-center font-bold text-[9px]">
              {status === 'sound' && 'S'}
              {status === 'prep' && 'P'}
              {status === 'restored' && 'C'}
              {status === 'implant' && 'I'}
              {status === 'missing' && 'X'}
            </div>
          </button>
        );
      })}
    </div>
  );
}
