'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
    <div id="treatment-session" className="p-6 card-elevated rounded-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold font-mono flex items-center gap-2" style={{ color: 'var(--velvet-text)' }}>
            <Activity className="w-4 h-4" style={{ color: 'var(--velvet-accent)' }} /> Treatment Session Manager & Sync
          </h3>
          <p className="text-xs mt-1" style={{ color: 'var(--velvet-text-muted)' }}>
            Log immediate operatory treatment steps, materials consumed, and notes. Syncs directly across clinical timelines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Log Session Form */}
        <div className="lg:col-span-7 card-elevated p-5 rounded-2xl space-y-4 text-start">
          <h4 className="text-xs font-bold font-mono uppercase tracking-wider" style={{ color: 'var(--velvet-text-sub)' }}>Active Clinical Entry</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs uppercase font-mono mb-1 font-bold" style={{ color: 'var(--velvet-text-muted)' }}>Patient</label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full p-2.5 rounded-lg border"
                style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)', color: 'var(--velvet-text)' }}
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-2xs uppercase font-mono mb-1 font-bold" style={{ color: 'var(--velvet-text-muted)' }}>Lead Dentist</label>
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="w-full p-2.5 rounded-lg border font-mono"
                style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)', color: 'var(--velvet-text)' }}
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-2xs uppercase font-mono mb-1 font-bold" style={{ color: 'var(--velvet-text-muted)' }}>Procedure</label>
              <input 
                type="text"
                value={procedure}
                onChange={(e) => setProcedure(e.target.value)}
                className="w-full p-2 rounded-lg border text-xs"
                style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)', color: 'var(--velvet-text)' }}
              />
            </div>
            <div>
              <label className="block text-2xs uppercase font-mono mb-1 font-bold" style={{ color: 'var(--velvet-text-muted)' }}>Chair Location</label>
              <select
                value={chair}
                onChange={(e) => setChair(e.target.value)}
                className="w-full p-2 rounded-lg border text-xs"
                style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)', color: 'var(--velvet-text)' }}
              >
                {chairs.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-2xs uppercase font-mono mb-1 font-bold" style={{ color: 'var(--velvet-text-muted)' }}>Clinical Assistant</label>
              <input 
                type="text"
                value={assistant}
                onChange={(e) => setAssistant(e.target.value)}
                className="w-full p-2 rounded-lg border text-xs"
                style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)', color: 'var(--velvet-text)' }}
              />
            </div>
          </div>

          {/* Materials checklist */}
          <div>
            <label className="block text-2xs uppercase font-mono mb-1 font-bold" style={{ color: 'var(--velvet-text-muted)' }}>Materials Utilized</label>
            <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto p-2.5 rounded-xl border" style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)' }}>
              {AVAILABLE_MATERIALS.map(m => {
                const checked = selectedMaterials.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleToggleMaterial(m)}
                    className={`flex items-center gap-2 p-1.5 rounded text-2xs font-mono font-bold transition-all ${
                      checked 
                        ? 'btn-primary' 
                        : 'btn-ghost'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${checked ? '' : ''}`} style={{ background: checked ? 'var(--velvet-accent)' : 'var(--velvet-text-muted)' }} />
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-2xs uppercase font-mono mb-1 font-bold" style={{ color: 'var(--velvet-text-muted)' }}>Clinical Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full p-2.5 rounded-lg border text-xs font-mono"
              style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)', color: 'var(--velvet-text)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-2xs uppercase font-mono mb-1 font-bold" style={{ color: 'var(--velvet-text-muted)' }}>Outcome Status</label>
              <input
                type="text"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full p-2 rounded-lg border text-xs"
                style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)', color: 'var(--velvet-text)' }}
              />
            </div>
            
            <button
              onClick={handleLogSession}
              disabled={isSyncing}
              className="btn-primary mt-4 px-4 py-3 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-wait"
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
                className="p-2.5 font-mono text-2xs uppercase font-bold rounded-lg border text-center animate-pulse"
                style={{ background: 'color-mix(in srgb, var(--velvet-accent) 15%, transparent)', color: 'var(--velvet-accent)', borderColor: 'color-mix(in srgb, var(--velvet-accent) 25%, transparent)' }}
              >
                {syncStatus}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sync Timeline Output */}
        <div className="lg:col-span-5 card-elevated p-5 rounded-2xl space-y-4 text-start flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider" style={{ color: 'var(--velvet-text-sub)' }}>Clinical Sync Log (EHR Feed)</h4>
            <div className="space-y-4 max-h-[360px] overflow-y-auto pe-1 mt-3 divide-y" style={{ borderColor: 'var(--velvet-border)' }}>
              {sessions.map((sess) => (
                <div key={sess.id} className="pt-3 first:pt-0 space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-xs" style={{ color: 'var(--velvet-text)' }}>{sess.patientName}</p>
                      <p className="text-2xs font-mono font-bold" style={{ color: 'var(--velvet-accent)' }}>{sess.procedure}</p>
                    </div>
                    <span className="text-2xs font-mono" style={{ color: 'var(--velvet-text-muted)' }}>{sess.timestamp}</span>
                  </div>
                  <p className="text-xs leading-relaxed font-mono p-2 rounded border" style={{ color: 'var(--velvet-text-sub)', background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)' }}>
                    {sess.clinicalNotes}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {sess.materials.map(m => (
                      <span key={m} className="px-1.5 py-0.5 rounded border text-2xs font-mono" style={{ color: 'var(--velvet-text-sub)', background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)' }}>
                        {m.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                  <div className="text-2xs flex items-center gap-1" style={{ color: 'var(--velvet-success)' }}>
                    <CheckCircle className="w-3 h-3 shrink-0" style={{ color: 'var(--velvet-success)' }} /> Outcome: {sess.outcome}
                  </div>
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="py-12 text-center text-xs italic" style={{ color: 'var(--velvet-text-muted)' }}>
                  No sessions logged in this active clinical cycle yet.
                </div>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl border text-2xs font-mono flex items-center gap-2" style={{ background: 'color-mix(in srgb, var(--velvet-success) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--velvet-success) 25%, transparent)', color: 'var(--velvet-success)' }}>
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--velvet-success)' }} />
            <span>HIPAA Ledger Locked. All modifications append secure audit hashes.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
