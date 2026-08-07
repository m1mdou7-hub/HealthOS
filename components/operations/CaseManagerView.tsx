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
    <div className="space-y-6 text-start" style={{ color: 'var(--text)' }}>
      <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="section-title text-base uppercase tracking-tight">Laboratory Case Manager</h3>
            <span className="badge badge-success font-mono">
              {activeCase.id}
            </span>
          </div>
          <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>View full clinical prescription parameters, audit logs, and status triggers.</p>
        </div>
        <button
          onClick={handleSave}
          id="save-case-manager-btn"
          className="btn-primary font-bold text-xs font-mono px-4 py-2 flex items-center gap-2"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaved ? 'SAVED!' : 'SAVE CHANGES'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core Case Attributes */}
        <div className="p-5 card-gradient rounded-2xl space-y-4 md:col-span-2">
          <span className="text-2xs font-bold uppercase tracking-widest font-mono block pb-2" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
            Prescription Parameters
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 card-elevated rounded-xl space-y-1">
              <span className="text-2xs uppercase font-bold flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><User className="w-3 h-3" style={{ color: 'var(--accent)' }} /> Patient</span>
              <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{activeCase.patientName}</p>
            </div>

            <div className="p-3 card-elevated rounded-xl space-y-1">
              <span className="text-2xs uppercase font-bold flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><User className="w-3 h-3" style={{ color: 'var(--accent)' }} /> Clinician</span>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-sub)' }}>Dr. {activeCase.doctorName}</p>
            </div>

            <div className="p-3 card-elevated rounded-xl space-y-1">
              <span className="text-2xs uppercase font-bold flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><Home className="w-3 h-3" style={{ color: 'var(--accent)' }} /> Fulfillment Lab</span>
              <p className="text-sm" style={{ color: 'var(--text-sub)' }}>{activeCase.laboratoryName}</p>
            </div>

            <div className="p-3 card-elevated rounded-xl space-y-1">
              <span className="text-2xs uppercase font-bold flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><Clipboard className="w-3 h-3" style={{ color: 'var(--accent)' }} /> Restoration & Format</span>
              <p className="text-sm" style={{ color: 'var(--text-sub)' }}>{activeCase.restorationType} ({activeCase.caseType})</p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-2xs font-bold uppercase tracking-widest font-mono block" style={{ color: 'var(--text-muted)' }}>
              Internal Technical Notes
            </span>
            <textarea
              value={internalNotes}
              id="case-internal-notes-textarea"
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Enter micro-marginal adjustments, ceramic layering mix guidelines, sintering speeds, or technician specific instructions..."
              className="w-full text-xs rounded-xl p-3 h-28 font-mono"
            />
          </div>
        </div>

        {/* Manufacturing status controls */}
        <div className="p-5 card-elevated rounded-2xl space-y-4">
          <span className="text-2xs font-bold uppercase tracking-widest font-mono block pb-2" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
            Workflow Configuration
          </span>

          <div className="space-y-4 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="text-2xs uppercase font-bold block" style={{ color: 'var(--text-muted)' }}>Manufacturing Status</label>
              <select
                value={status}
                id="case-status-select"
                onChange={(e) => setStatus(e.target.value as ManufacturingStage)}
                className="w-full rounded-xl p-2"
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
              <label className="text-2xs uppercase font-bold block" style={{ color: 'var(--text-muted)' }}>Manufacturing Priority</label>
              <select
                value={priority}
                id="case-priority-select"
                onChange={(e) => setPriority(e.target.value as CasePriority)}
                className="w-full rounded-xl p-2"
              >
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Standard">Standard</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-2xs uppercase font-bold block" style={{ color: 'var(--text-muted)' }}>Delivery Target Date</label>
              <input
                type="date"
                value={dueDate}
                id="case-due-date-input"
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl p-2"
              />
            </div>
          </div>

          <div className="pt-3 font-mono text-2xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <span className="block font-bold">PACS Audit Trail:</span>
            <p className="mt-1">Case record loaded on local node. Encryption layer enabled (AES-256).</p>
          </div>
        </div>

      </div>

      {/* Case Timeline Section */}
      <div className="p-5 card-gradient rounded-2xl space-y-4">
        <span className="text-2xs font-bold uppercase tracking-widest font-mono block pb-2" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
          Milestone Timeline Log
        </span>

        <div className="relative font-mono text-xs space-y-4 ms-4 ps-6" style={{ borderLeft: '1px solid var(--border-strong)' }}>
          {activeCase.timeline.map((item, idx) => {
            const isActive = item.stage === status;
            return (
              <div key={idx} className="relative">
                <span
                  className={`absolute -left-[30px] top-1.5 h-2 w-2 rounded-full ${
                    item.completed ? '' : isActive ? 'animate-ping' : ''
                  }`}
                  style={{
                    background: item.completed ? 'var(--success)' : isActive ? 'var(--warning)' : 'var(--surface-3)',
                    boxShadow: item.completed ? '0 0 8px var(--success)' : isActive ? '0 0 8px var(--warning)' : 'none'
                  }}
                />
                <div className="flex justify-between items-start">
                  <div>
                    <h5
                      className="font-bold"
                      style={{ color: item.completed ? 'var(--text)' : isActive ? 'var(--warning)' : 'var(--text-muted)' }}
                    >
                      {item.stage}
                    </h5>
                    {item.note && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.note}</p>}
                  </div>
                  {item.timestamp && (
                    <span className="text-2xs font-bold px-2 py-0.5 rounded kbd" style={{ color: 'var(--text-muted)' }}>
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
