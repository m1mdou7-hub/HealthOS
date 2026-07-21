'use client';

import React from 'react';
import { History, ShieldCheck, CheckCircle2 } from 'lucide-react';

export interface ValidationLog {
  id: string;
  author: string;
  timestamp: string;
  version: string;
  message: string;
}

interface ReviewHistoryProps {
  logs: ValidationLog[];
  setLogs: (val: ValidationLog[]) => void;
  isValidated: boolean;
  setIsValidated: (val: boolean) => void;
}

export default function ReviewHistory({
  logs, setLogs,
  isValidated, setIsValidated
}: ReviewHistoryProps) {

  const handleValidate = () => {
    const newLog: ValidationLog = {
      id: Math.random().toString(36).substr(2, 9),
      author: 'Dr. Arthur Pendragon (Current User)',
      timestamp: new Date().toISOString(),
      version: `v1.${logs.length + 1}`,
      message: 'Treatment plan comprehensively reviewed and clinically validated.'
    };
    setLogs([newLog, ...logs]);
    setIsValidated(true);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {/* Validation Status */}
      <div className="md:col-span-1 bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-zinc-900/60">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Treatment Validation
          </h4>
          <div className="py-6 text-center">
            {isValidated ? (
              <div className="inline-flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="text-sm font-bold text-emerald-400 font-mono">CLINICALLY VALIDATED</span>
                <span className="text-[10px] text-zinc-500 max-w-[200px] leading-relaxed">
                  Plan approved for execution. Immutable hash recorded.
                </span>
              </div>
            ) : (
              <div className="inline-flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-amber-500" />
                </div>
                <span className="text-sm font-bold text-amber-500 font-mono">PENDING VALIDATION</span>
                <span className="text-[10px] text-zinc-500 max-w-[200px] leading-relaxed">
                  Plan requires formal sign-off before clinical execution can begin.
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleValidate}
          disabled={isValidated}
          className={`w-full py-3 rounded-xl font-bold text-xs transition-all ${
            isValidated
              ? 'bg-zinc-900 text-zinc-500 cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20'
          }`}
        >
          {isValidated ? 'Validation Sealed' : 'Sign & Validate Plan'}
        </button>
      </div>

      {/* History Log */}
      <div className="md:col-span-2 bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-zinc-900/60">
          <History className="w-4 h-4 text-purple-400" /> Review & Version History
        </h4>

        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
          {logs.map((log, idx) => (
            <div key={log.id} className="relative pl-6">
              {idx !== logs.length - 1 && (
                <div className="absolute top-6 bottom-0 left-[11px] w-px bg-zinc-800" />
              )}
              <div className="absolute top-1.5 left-0 w-6 h-6 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center shrink-0 z-10">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>

              <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-850 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-white">{log.author}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {log.version}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{log.message}</p>
                <div className="text-[9px] text-zinc-600 font-mono">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-center py-8 text-zinc-600 text-xs italic">
              No review history or validations recorded yet.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
