'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserCheck, ShieldAlert, Calendar, Plus, X, Heart, Shield, HelpCircle } from 'lucide-react';
import { Doctor } from './types';

interface DoctorManagementProps {
  doctors: Doctor[];
  setDoctors: React.Dispatch<React.SetStateAction<Doctor[]>>;
}

export default function DoctorManagement({
  doctors,
  setDoctors
}: DoctorManagementProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showLeavePlanner, setShowLeavePlanner] = useState(false);
  const [leaveDate, setLeaveDate] = useState('2026-07-21');
  const [leaveReason, setLeaveReason] = useState('Dental Academic Symposium');

  const handleStatusChange = (doctorId: string, nextStatus: Doctor['status']) => {
    setDoctors(prev => prev.map(d => {
      if (d.id === doctorId) {
        return { ...d, status: nextStatus };
      }
      return d;
    }));
  };

  const handleAddLeave = () => {
    if (!selectedDoctor) return;
    
    // Simulate updating doctor profile with a leave status or vacation
    setDoctors(prev => prev.map(d => {
      if (d.id === selectedDoctor.id) {
        return {
          ...d,
          status: 'On Leave'
        };
      }
      return d;
    }));

    setShowLeavePlanner(false);
    alert(`Successfully registered leave on ${leaveDate} for ${selectedDoctor.name} due to: ${leaveReason}`);
  };

  const getStatusBadge = (status: Doctor['status']) => {
    switch (status) {
      case 'Active': return 'bg-emerald-500/20 text-emerald-300';
      case 'Break': return 'bg-amber-500/20 text-amber-300';
      case 'On Leave': return 'bg-sky-500/20 text-sky-300';
      case 'Vacation': return 'bg-purple-500/20 text-purple-300';
    }
  };

  const getSpecialtyColor = (spec: string) => {
    if (spec.toLowerCase().includes('prostho')) return 'text-purple-400';
    if (spec.toLowerCase().includes('implant')) return 'text-emerald-400';
    return 'text-blue-400';
  };

  return (
    <div id="doctor-management" className="p-6 card-elevated rounded-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold font-mono flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <UserCheck className="w-4 h-4" style={{ color: 'var(--accent)' }} /> Surgeon & Prosthodontist Directory
          </h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Monitor working slots, active break offsets, double-book prevention locks, and active leave schedules.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedDoctor(doctors[0]);
            setShowLeavePlanner(true);
          }}
          className="btn-secondary px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all self-start md:self-auto"
        >
          <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} /> Plan Vacation / Leave
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="p-5 card-elevated card-hover rounded-2xl text-start space-y-4 transition-all flex flex-col justify-between"
          >
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-start justify-between">
                <span className="text-2xs font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{doctor.id}</span>
                <span className={`px-2 py-0.5 rounded text-2xs font-mono font-bold uppercase ${getStatusBadge(doctor.status)}`}>
                  {doctor.status}
                </span>
              </div>
              <h4 className="font-bold text-sm" style={{ color: 'var(--text)' }}>{doctor.name}</h4>
              <p className={`text-xs font-mono font-bold ${getSpecialtyColor(doctor.specialty)}`}>{doctor.specialty}</p>
            </div>

            {/* Shift hours details */}
            <div className="space-y-2 text-xs p-3 rounded-xl border" style={{ color: 'var(--text-sub)', background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
              <div className="flex justify-between font-mono">
                <span>Working Shift:</span>
                <span className="font-bold" style={{ color: 'var(--text)' }}>{doctor.workingHours.start} - {doctor.workingHours.end}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>Lunch Break:</span>
                <span style={{ color: 'var(--text-sub)' }}>
                  {doctor.breaks.map(b => `${b.start}-${b.end}`).join(', ')}
                </span>
              </div>
              <div className="pt-1.5 border-t flex items-center gap-1 text-2xs font-mono uppercase font-bold" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                <ShieldAlert className="w-3 h-3" style={{ color: 'var(--success)' }} /> Conflict Protection: Active
              </div>
            </div>

            {/* Status Change Controls */}
            <div className="space-y-1.5">
              <span className="text-2xs font-mono uppercase font-bold block" style={{ color: 'var(--text-muted)' }}>Quick Status Switch:</span>
              <div className="grid grid-cols-4 gap-1">
                {(['Active', 'Break', 'On Leave', 'Vacation'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(doctor.id, st)}
                    className={`py-1 rounded text-2xs font-mono font-black transition-all ${
                      doctor.status === st 
                        ? 'btn-primary' 
                        : 'btn-ghost'
                    }`}
                  >
                    {st.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Leave Planner Modal */}
      <AnimatePresence>
        {showLeavePlanner && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card-elevated rounded-2xl max-w-sm w-full p-6 text-start shadow-card"
            >
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
                <h3 className="text-sm font-bold font-mono" style={{ color: 'var(--text)' }}>Leave & Vacation Dispatch</h3>
                <button 
                  onClick={() => setShowLeavePlanner(false)}
                  className="btn-ghost p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 pt-4 text-xs" style={{ color: 'var(--text-sub)' }}>
                <div>
                  <label className="block text-2xs uppercase font-mono mb-1 font-bold" style={{ color: 'var(--text-muted)' }}>Select Clinician</label>
                  <select
                    value={selectedDoctor?.id || ''}
                    onChange={(e) => setSelectedDoctor(doctors.find(d => d.id === e.target.value) || null)}
                    className="w-full p-2.5 rounded-lg border font-mono"
                    style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-2xs uppercase font-mono mb-1 font-bold" style={{ color: 'var(--text-muted)' }}>Planned Start Date</label>
                    <input 
                      type="date"
                      value={leaveDate}
                      onChange={(e) => setLeaveDate(e.target.value)}
                      className="w-full p-2 rounded-lg border font-mono"
                      style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-2xs uppercase font-mono mb-1 font-bold" style={{ color: 'var(--text-muted)' }}>Leave Description / Reason</label>
                    <input 
                      type="text"
                      value={leaveReason}
                      onChange={(e) => setLeaveReason(e.target.value)}
                      className="w-full p-2 rounded-lg border"
                      style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                      placeholder="e.g., Medical board conference"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <button
                  type="button"
                  onClick={() => setShowLeavePlanner(false)}
                  className="btn-ghost px-4 py-2 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddLeave}
                  className="btn-primary px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Confirm Block
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
