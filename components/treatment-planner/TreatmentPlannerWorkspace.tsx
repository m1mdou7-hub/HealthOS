'use client';

import React, { useState } from 'react';
import { Clipboard, ShieldAlert } from 'lucide-react';
import ToothSelector, { ToothStatusType } from './ToothSelector';
import DiagnosisManager from './DiagnosisManager';
import TreatmentOptions, { Procedure } from './TreatmentOptions';
import ProcedureTimeline, { Phase } from './ProcedureTimeline';
import CostAndMaterials from './CostAndMaterials';
import ReviewHistory, { ValidationLog } from './ReviewHistory';

export default function TreatmentPlannerWorkspace() {

  // -- Tooth Selector State
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([]);
  const [toothStatus, setToothStatus] = useState<Record<number, ToothStatusType>>({
    8: 'decayed', 9: 'decayed', 10: 'missing', 14: 'treated'
  });

  const handleToggleTooth = (tooth: number) => {
    setSelectedTeeth(prev =>
      prev.includes(tooth) ? prev.filter(t => t !== tooth) : [...prev, tooth]
    );
  };

  // -- Diagnosis Manager State
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [findings, setFindings] = useState<string[]>(['Thin biotype in anterior maxilla', 'Class II mobility on #8']);
  const [diagnoses, setDiagnoses] = useState<string[]>(['Chronic periodontitis', 'Secondary caries']);
  const [prognosis, setPrognosis] = useState('');
  const [warnings, setWarnings] = useState<string[]>(['Diabetic clearance required for surgical phase']);

  // -- Treatment Options State
  const [objectives, setObjectives] = useState<string[]>(['Restore anterior aesthetics', 'Establish stable posterior occlusion']);
  const [procedures, setProcedures] = useState<Procedure[]>([
    { id: '1', name: 'Zirconia Crown', tooth: 8, status: 'Planned', provider: 'Dr. Smith' }
  ]);

  // -- Procedure Timeline State
  const [phases, setPhases] = useState<Phase[]>([
    { id: '1', name: 'Diagnostic Phase', status: 'In Progress', date: '2026-07-25', progress: 40 }
  ]);

  // -- Cost & Materials State
  const [totalCost, setTotalCost] = useState(0);
  const [materials, setMaterials] = useState([
    { id: '1', name: 'Implant Fixture 4.3mm', checked: false }
  ]);
  const [labWork, setLabWork] = useState([
    { id: '1', name: 'Surgical Guide Stent', checked: true }
  ]);

  // -- Review History State
  const [logs, setLogs] = useState<ValidationLog[]>([]);
  const [isValidated, setIsValidated] = useState(false);

  // -- UI Tabs
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'options' | 'timeline' | 'cost' | 'review'>('diagnosis');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Clipboard className="w-6 h-6 text-emerald-400" />
            Comprehensive Treatment Planner
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Design, phase, and sequence complex clinical treatment plans.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Odontogram takes top section */}
        <div className="lg:col-span-4">
          <ToothSelector
            selectedTeeth={selectedTeeth}
            onToggleTooth={handleToggleTooth}
            toothStatus={toothStatus}
          />
        </div>

        {/* Tab Navigation */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: 'diagnosis', label: 'Diagnosis & Findings' },
            { id: 'options', label: 'Treatment Options' },
            { id: 'timeline', label: 'Timeline & Sequencing' },
            { id: 'cost', label: 'Costs & Materials' },
            { id: 'review', label: 'Review & Validation' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-900 hover:text-white border border-zinc-850'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Quick status summary */}
          <div className="mt-8 p-4 bg-zinc-950/40 border border-zinc-900 rounded-2xl space-y-3">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Plan Status</h4>

            <div className="flex justify-between text-xs text-zinc-300">
              <span>Selected Teeth</span>
              <span className="font-mono">{selectedTeeth.length}</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-300">
              <span>Procedures</span>
              <span className="font-mono">{procedures.length}</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-300">
              <span>Validation</span>
              <span className={`font-mono font-bold ${isValidated ? 'text-emerald-400' : 'text-amber-500'}`}>
                {isValidated ? 'Approved' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="lg:col-span-3">
          {activeTab === 'diagnosis' && (
            <DiagnosisManager
              chiefComplaint={chiefComplaint} setChiefComplaint={setChiefComplaint}
              findings={findings} setFindings={setFindings}
              diagnoses={diagnoses} setDiagnoses={setDiagnoses}
              prognosis={prognosis} setPrognosis={setPrognosis}
              warnings={warnings} setWarnings={setWarnings}
            />
          )}
          {activeTab === 'options' && (
            <TreatmentOptions
              objectives={objectives} setObjectives={setObjectives}
              procedures={procedures} setProcedures={setProcedures}
            />
          )}
          {activeTab === 'timeline' && (
            <ProcedureTimeline
              phases={phases} setPhases={setPhases}
            />
          )}
          {activeTab === 'cost' && (
            <CostAndMaterials
              totalCost={totalCost} setTotalCost={setTotalCost}
              materials={materials} setMaterials={setMaterials}
              labWork={labWork} setLabWork={setLabWork}
            />
          )}
          {activeTab === 'review' && (
            <ReviewHistory
              logs={logs} setLogs={setLogs}
              isValidated={isValidated} setIsValidated={setIsValidated}
            />
          )}
        </div>

      </div>
    </div>
  );
}
