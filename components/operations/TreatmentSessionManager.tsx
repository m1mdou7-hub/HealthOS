'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle, RefreshCw, Layers, Plus, Activity, User, ShieldAlert } from 'lucide-react';
import { TreatmentSession, Patient, Doctor, MOCK_PATIENTS, MOCK_DOCTORS, MOCK_CHAIRS_STATUS } from './types';

interface TreatmentSessionManagerProps {
  sessions: TreatmentSession[];
  setSessions: React.Dispatch<React.SetStateAction<TreatmentSession[]>>;
  patients: Patient[];
  doctors: Doctor[];
  chairs: string[];
}

const AVAILABLE_MATERIALS = [
  'Monolithic Zirconia Block #14',
  'PMMA Provisional Shell Arch',
  'Titanium Multi-unit Abutment #9',
  'E.Max Press Glass Ceramic Veneer',
  'Lidocaine 2% Local Anesthetic',
  'Suture Polyglactin 910 4-0',
  'Implant Fixation Screw 1.5mm',
  'Bone Grafting Mineral Matrix'
];

export default function TreatmentSessionManager({
  sessions,
  setSessions,
  patients,
  doctors,
  chairs
}: TreatmentSessionManagerProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Form States
  const [patientId, setPatientId] = useState(patients[0].id);
  const [doctorId, setDoctorId] = useState(doctors[0].id);
  const [procedure, setProcedure] = useState('Implant Surgery #14');
  const [chair, setChair] = useState(chairs[0]);
  const [assistant, setAssistant] = useState('Hygienist Jenkins');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('Administered Lidocaine 2% local block. Reflected full-thickness flap. Sintered template seated securely. Implemented implant post.');
  const [outcome, setOutcome] = useState('Prep complete - provisional crown seated');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([
    'Monolithic Zirconia Block #14',
    'Lidocaine 2% Local Anesthetic'
  ]);

  const handleToggleMaterial = (mat: string) => {
    setSelectedMaterials(prev => 
      prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat]
    );
  };

  const handleLogSession = () => {
    setIsSyncing(true);
    setSyncStatus('Constructing clinical block chain...');
    
    setTimeout(() => {
      setSyncStatus('Synchronizing with Patient Records & Exocad node...');
      
      setTimeout(() => {
        const patient = patients.find(p => p.id === patientId)!;
        const doctor = doctors.find(d => d.id === doctorId)!;

        const newSession: TreatmentSession = {
          id: `TXS-${Date.now()}`,
          patientId: patient.id,
          patientName: patient.name,
          procedure,
          chair,
          doctorId: doctor.id,
          doctorName: doctor.name,
          assistantName: assistant,
          duration,
          materials: selectedMaterials,
          clinicalNotes: notes,
          outcome,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toISOString().split('T')[0]
        };

        setSessions(prev => [newSession, ...prev]);
        setIsSyncing(false);
        setSyncStatus(null);
        alert(`Clinical session logged and synchronized with EHR & Timeline for ${patient.name}`);
      }, 1000);
    }, 1000);
  };

  return (
    <div id="treatment-session" className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" /> Treatment Session Manager & Sync
          </h3>
          <p className="text-zinc-400 text-xs mt-1">
            Log immediate operatory treatment steps, materials consumed, and notes. Syncs directly across clinical timelines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Log Session Form */}
        <div className="lg:col-span-7 bg-zinc-950/40 p-5 rounded-2xl border border-zinc-900/80 space-y-4 text-left">
          <h4 className="text-xs font-bold font-mono uppercase text-zinc-500 tracking-wider">Active Clinical Entry</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-mono text-zinc-500 mb-1 font-bold">Patient</label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-850 rounded-lg text-white"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-mono text-zinc-500 mb-1 font-bold">Lead Dentist</label>
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-850 rounded-lg text-white font-mono"
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] uppercase font-mono text-zinc-500 mb-1 font-bold">Procedure</label>
              <input 
                type="text"
                value={procedure}
                onChange={(e) => setProcedure(e.target.value)}
                className="w-full p-2 bg-zinc-900 border border-zinc-850 rounded-lg text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-mono text-zinc-500 mb-1 font-bold">Chair Location</label>
              <select
                value={chair}
                onChange={(e) => setChair(e.target.value)}
                className="w-full p-2 bg-zinc-900 border border-zinc-850 rounded-lg text-white text-xs"
              >
                {chairs.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-mono text-zinc-500 mb-1 font-bold">Clinical Assistant</label>
              <input 
                type="text"
                value={assistant}
                onChange={(e) => setAssistant(e.target.value)}
                className="w-full p-2 bg-zinc-900 border border-zinc-850 rounded-lg text-white text-xs"
              />
            </div>
          </div>

          {/* Materials checklist */}
          <div>
            <label className="block text-[10px] uppercase font-mono text-zinc-500 mb-1 font-bold">Materials Utilized</label>
            <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
              {AVAILABLE_MATERIALS.map(m => {
                const checked = selectedMaterials.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleToggleMaterial(m)}
                    className={`flex items-center gap-2 p-1.5 rounded text-[10px] font-mono font-bold transition-all ${
                      checked 
                        ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20' 
                        : 'bg-zinc-900 text-zinc-400 border border-transparent hover:bg-zinc-850'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${checked ? 'bg-purple-400' : 'bg-zinc-700'}`} />
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono text-zinc-500 mb-1 font-bold">Clinical Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full p-2.5 bg-zinc-900 border border-zinc-850 rounded-lg text-white text-xs font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-[10px] uppercase font-mono text-zinc-500 mb-1 font-bold">Outcome Status</label>
              <input
                type="text"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full p-2 bg-zinc-900 border border-zinc-850 rounded-lg text-white text-xs"
              />
            </div>
            
            <button
              onClick={handleLogSession}
              disabled={isSyncing}
              className="mt-4 px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/10 active:scale-95 disabled:opacity-50 disabled:cursor-wait"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Synchronizing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" /> Save & Sync Block
                </>
              )}
            </button>
          </div>

          <AnimatePresence>
            {isSyncing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-2.5 bg-purple-500/15 text-purple-300 font-mono text-[10px] uppercase font-bold rounded-lg border border-purple-500/20 text-center animate-pulse"
              >
                {syncStatus}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sync Timeline Output */}
        <div className="lg:col-span-5 bg-zinc-950/40 p-5 rounded-2xl border border-zinc-900/80 space-y-4 text-left flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold font-mono uppercase text-zinc-500 tracking-wider">Clinical Sync Log (EHR Feed)</h4>
            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1 mt-3 divide-y divide-zinc-900/60">
              {sessions.map((sess) => (
                <div key={sess.id} className="pt-3 first:pt-0 space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-white text-xs">{sess.patientName}</p>
                      <p className="text-[10px] text-purple-400 font-mono font-bold">{sess.procedure}</p>
                    </div>
                    <span className="text-[9px] text-zinc-500 font-mono">{sess.timestamp}</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed font-mono bg-zinc-950 p-2 rounded border border-zinc-900/80">
                    {sess.clinicalNotes}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {sess.materials.map(m => (
                      <span key={m} className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono text-zinc-400">
                        {m.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" /> Outcome: {sess.outcome}
                  </div>
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="py-12 text-center text-zinc-600 text-xs italic">
                  No sessions logged in this active clinical cycle yet.
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-[10px] font-mono text-emerald-400 flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>HIPAA Ledger Locked. All modifications append secure audit hashes.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
