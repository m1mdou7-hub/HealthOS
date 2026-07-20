'use client';

import React, { useState } from 'react';
import { LabCase, CasePriority, ManufacturingStage } from './labTypes';
import { User, Clipboard, Home, Calendar, HelpCircle, Save, AlertCircle, Sparkles } from 'lucide-react';

interface CaseManagerViewProps {
  activeCase: LabCase;
  onUpdateCase: (updatedCase: LabCase) => void;
}

export default function CaseManagerView({ activeCase, onUpdateCase }: CaseManagerViewProps) {
  const [internalNotes, setInternalNotes] = useState(activeCase.internalNotes);
  const [priority, setPriority] = useState<CasePriority>(activeCase.priority);
  const [status, setStatus] = useState<ManufacturingStage>(activeCase.status);
  const [dueDate, setDueDate] = useState(activeCase.dueDate);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    const updated: LabCase = {
      ...activeCase,
      internalNotes,
      priority,
      status,
      dueDate,
      progressPercent: getProgressForStage(status)
    };
    onUpdateCase(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const getProgressForStage = (stage: ManufacturingStage): number => {
    const stages: ManufacturingStage[] = [
      'Prescription received',
      'Design',
      'CAD',
      'CAM',
      'Milling',
      'Printing',
      'Sintering',
      'Staining',
      'Glazing',
      'Try-in',
      'Delivery',
      'Completion'
    ];
    const idx = stages.indexOf(stage);
    if (idx === -1) return 0;
    return Math.round(((idx + 1) / stages.length) * 100);
  };

  return (
    <div className="space-y-6 text-zinc-100 text-left">
      <div className="border-b border-zinc-900 pb-3 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-white uppercase tracking-tight">Laboratory Case Manager</h3>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">
              {activeCase.id}
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-mono">View full clinical prescription parameters, audit logs, and status triggers.</p>
        </div>
        <button
          onClick={handleSave}
          id="save-case-manager-btn"
          className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs font-mono px-4 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaved ? 'SAVED!' : 'SAVE CHANGES'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core Case Attributes */}
        <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-4 md:col-span-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block border-b border-zinc-900 pb-2">
            Prescription Parameters
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1"><User className="w-3 h-3 text-emerald-400" /> Patient</span>
              <p className="text-sm font-bold text-white">{activeCase.patientName}</p>
            </div>

            <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1"><User className="w-3 h-3 text-emerald-400" /> Clinician</span>
              <p className="text-sm font-semibold text-zinc-200">Dr. {activeCase.doctorName}</p>
            </div>

            <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1"><Home className="w-3 h-3 text-emerald-400" /> Fulfillment Lab</span>
              <p className="text-sm text-zinc-300">{activeCase.laboratoryName}</p>
            </div>

            <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1"><Clipboard className="w-3 h-3 text-emerald-400" /> Restoration & Format</span>
              <p className="text-sm text-zinc-200">{activeCase.restorationType} ({activeCase.caseType})</p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">
              Internal Technical Notes
            </span>
            <textarea
              value={internalNotes}
              id="case-internal-notes-textarea"
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Enter micro-marginal adjustments, ceramic layering mix guidelines, sintering speeds, or technician specific instructions..."
              className="w-full bg-zinc-900/50 border border-zinc-800 text-xs rounded-xl p-3 h-28 focus:border-emerald-500 text-zinc-300 outline-none font-mono placeholder:text-zinc-700"
            />
          </div>
        </div>

        {/* Manufacturing status controls */}
        <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block border-b border-zinc-900 pb-2">
            Workflow Configuration
          </span>

          <div className="space-y-4 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 uppercase font-bold block">Manufacturing Status</label>
              <select
                value={status}
                id="case-status-select"
                onChange={(e) => setStatus(e.target.value as ManufacturingStage)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 outline-none focus:border-emerald-500 text-zinc-200"
              >
                <option value="Prescription received">Prescription received</option>
                <option value="Design">Design</option>
                <option value="CAD">CAD</option>
                <option value="CAM">CAM</option>
                <option value="Milling">Milling</option>
                <option value="Printing">Printing</option>
                <option value="Sintering">Sintering</option>
                <option value="Staining">Staining</option>
                <option value="Glazing">Glazing</option>
                <option value="Try-in">Try-in</option>
                <option value="Delivery">Delivery</option>
                <option value="Completion">Completion</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 uppercase font-bold block">Manufacturing Priority</label>
              <select
                value={priority}
                id="case-priority-select"
                onChange={(e) => setPriority(e.target.value as CasePriority)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 outline-none focus:border-emerald-500 text-zinc-200"
              >
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Standard">Standard</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 uppercase font-bold block">Delivery Target Date</label>
              <input
                type="date"
                value={dueDate}
                id="case-due-date-input"
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 outline-none focus:border-emerald-500 text-zinc-200"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-900/60 font-mono text-[10px] text-zinc-500">
            <span className="block font-bold">PACS Audit Trail:</span>
            <p className="mt-1">Case record loaded on local node. Encryption layer enabled (AES-256).</p>
          </div>
        </div>

      </div>

      {/* Case Timeline Section */}
      <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block border-b border-zinc-900 pb-2">
          Milestone Timeline Log
        </span>

        <div className="relative border-l border-zinc-800 ml-4 pl-6 space-y-4 font-mono text-xs">
          {activeCase.timeline.map((item, idx) => {
            const isActive = item.stage === status;
            return (
              <div key={idx} className="relative">
                <span className={`absolute -left-[30px] top-1.5 h-2 w-2 rounded-full ${
                  item.completed ? 'bg-emerald-400' : isActive ? 'bg-amber-400 animate-ping' : 'bg-zinc-800'
                }`} />
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className={`font-bold ${item.completed ? 'text-white' : isActive ? 'text-amber-400' : 'text-zinc-500'}`}>
                      {item.stage}
                    </h5>
                    {item.note && <p className="text-[11px] text-zinc-400 mt-0.5">{item.note}</p>}
                  </div>
                  {item.timestamp && (
                    <span className="text-[9px] text-zinc-500 font-bold bg-zinc-900/40 px-2 py-0.5 border border-zinc-900 rounded">
                      {item.timestamp}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
