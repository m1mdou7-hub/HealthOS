'use client';

import React, { useState } from 'react';
import { ShieldAlert, AlertCircle, CheckCircle, ClipboardList, Stethoscope, Plus } from 'lucide-react';

interface DiagnosisManagerProps {
  chiefComplaint: string;
  setChiefComplaint: (val: string) => void;
  findings: string[];
  setFindings: (val: string[]) => void;
  diagnoses: string[];
  setDiagnoses: (val: string[]) => void;
  prognosis: string;
  setPrognosis: (val: string) => void;
  warnings: string[];
  setWarnings: (val: string[]) => void;
}

export default function DiagnosisManager({
  chiefComplaint, setChiefComplaint,
  findings, setFindings,
  diagnoses, setDiagnoses,
  prognosis, setPrognosis,
  warnings, setWarnings
}: DiagnosisManagerProps) {

  const [newFinding, setNewFinding] = useState('');
  const [newDiagnosis, setNewDiagnosis] = useState('');

  const handleAddItem = (setter: (val: string[]) => void, current: string[], name: string, resetName: () => void) => {
    if (name.trim() !== '') {
      setter([...current, name.trim()]);
      resetName();
    }
  };

  const handleRemoveItem = (setter: (val: string[]) => void, current: string[], index: number) => {
    const newItems = [...current];
    newItems.splice(index, 1);
    setter(newItems);
  };

  return (
    <div className="space-y-6">

      {warnings.length > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-amber-500 uppercase tracking-wider font-mono">Clinical Warnings & Risk Flags</h4>
            <ul className="list-disc list-inside text-xs text-amber-400/80 space-y-1">
              {warnings.map((warn, i) => (
                <li key={i}>{warn}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Chief Complaint */}
        <div className="bg-zinc-950/40 p-5 rounded-2xl border border-zinc-900 space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-emerald-400" /> Chief Complaint
          </h4>
          <textarea
            value={chiefComplaint}
            onChange={(e) => setChiefComplaint(e.target.value)}
            placeholder="Patient's stated reason for visit in their own words..."
            className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-300 focus:border-emerald-500/50 outline-none resize-none h-24"
          />
        </div>

        {/* Prognosis */}
        <div className="bg-zinc-950/40 p-5 rounded-2xl border border-zinc-900 space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-purple-400" /> Treatment Prognosis
          </h4>
          <select
            value={prognosis}
            onChange={(e) => setPrognosis(e.target.value)}
            className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-300 focus:border-purple-500/50 outline-none"
          >
            <option value="">Select general prognosis...</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
            <option value="Hopeless">Hopeless</option>
          </select>
          <div className="text-[10px] text-zinc-500 font-mono pt-2">
            Prognosis dictates clinical sequencing and patient expectations.
          </div>
        </div>

        {/* Clinical Findings */}
        <div className="bg-zinc-950/40 p-5 rounded-2xl border border-zinc-900 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-400" /> Clinical Findings
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newFinding}
                onChange={(e) => setNewFinding(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem(setFindings, findings, newFinding, () => setNewFinding(''))}
                placeholder="New finding..."
                className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500/50 w-32"
              />
              <button
                onClick={() => handleAddItem(setFindings, findings, newFinding, () => setNewFinding(''))}
                className="text-xs bg-zinc-900 hover:bg-zinc-800 p-1.5 rounded-lg text-zinc-400 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {findings.length === 0 ? (
              <p className="text-xs text-zinc-600 italic">No clinical findings recorded.</p>
            ) : (
              findings.map((f, i) => (
                <div key={i} className="flex justify-between items-start gap-2 bg-zinc-900 p-2.5 rounded-lg border border-zinc-850">
                  <span className="text-xs text-zinc-300">{f}</span>
                  <button onClick={() => handleRemoveItem(setFindings, findings, i)} className="text-zinc-600 hover:text-red-400 text-xs px-1">&times;</button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Diagnoses */}
        <div className="bg-zinc-950/40 p-5 rounded-2xl border border-zinc-900 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-purple-400" /> Diagnosis Management
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newDiagnosis}
                onChange={(e) => setNewDiagnosis(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem(setDiagnoses, diagnoses, newDiagnosis, () => setNewDiagnosis(''))}
                placeholder="New diagnosis..."
                className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500/50 w-32"
              />
              <button
                onClick={() => handleAddItem(setDiagnoses, diagnoses, newDiagnosis, () => setNewDiagnosis(''))}
                className="text-xs bg-zinc-900 hover:bg-zinc-800 p-1.5 rounded-lg text-zinc-400 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {diagnoses.length === 0 ? (
              <p className="text-xs text-zinc-600 italic">No formal diagnoses recorded.</p>
            ) : (
              diagnoses.map((d, i) => (
                <div key={i} className="flex justify-between items-start gap-2 bg-zinc-900 p-2.5 rounded-lg border border-zinc-850">
                  <span className="text-xs text-zinc-300">{d}</span>
                  <button onClick={() => handleRemoveItem(setDiagnoses, diagnoses, i)} className="text-zinc-600 hover:text-red-400 text-xs px-1">&times;</button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
