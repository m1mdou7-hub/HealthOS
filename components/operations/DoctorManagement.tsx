'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div id="doctor-management" className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-purple-400" /> Surgeon & Prosthodontist Directory
          </h3>
          <p className="text-zinc-400 text-xs mt-1">
            Monitor working slots, active break offsets, double-book prevention locks, and active leave schedules.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedDoctor(doctors[0]);
            setShowLeavePlanner(true);
          }}
          className="px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-all self-start md:self-auto"
        >
          <Calendar className="w-3.5 h-3.5 text-zinc-500" /> Plan Vacation / Leave
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="p-5 bg-zinc-950/40 rounded-2xl border border-zinc-900 text-left space-y-4 hover:border-zinc-800 transition-all flex flex-col justify-between"
          >
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{doctor.id}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${getStatusBadge(doctor.status)}`}>
                  {doctor.status}
                </span>
              </div>
              <h4 className="font-bold text-white text-sm">{doctor.name}</h4>
              <p className={`text-xs font-mono font-bold ${getSpecialtyColor(doctor.specialty)}`}>{doctor.specialty}</p>
            </div>

            {/* Shift hours details */}
            <div className="space-y-2 text-xs text-zinc-400 bg-zinc-900/30 p-3 rounded-xl border border-zinc-900/40">
              <div className="flex justify-between font-mono">
                <span>Working Shift:</span>
                <span className="text-white font-bold">{doctor.workingHours.start} - {doctor.workingHours.end}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>Lunch Break:</span>
                <span className="text-zinc-300">
                  {doctor.breaks.map(b => `${b.start}-${b.end}`).join(', ')}
                </span>
              </div>
              <div className="pt-1.5 border-t border-zinc-800/40 flex items-center gap-1 text-[9px] text-zinc-500 font-mono uppercase font-bold">
                <ShieldAlert className="w-3 h-3 text-emerald-400" /> Conflict Protection: Active
              </div>
            </div>

            {/* Status Change Controls */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono uppercase text-zinc-500 font-bold block">Quick Status Switch:</span>
              <div className="grid grid-cols-4 gap-1">
                {(['Active', 'Break', 'On Leave', 'Vacation'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(doctor.id, st)}
                    className={`py-1 rounded text-[8px] font-mono font-black transition-all ${
                      doctor.status === st 
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
                        : 'bg-zinc-950 text-zinc-500 hover:text-zinc-300 border border-transparent'
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
              className="bg-zinc-950 border border-zinc-900 rounded-2xl max-w-sm w-full p-6 text-left shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <h3 className="text-sm font-bold font-mono text-white">Leave & Vacation Dispatch</h3>
                <button 
                  onClick={() => setShowLeavePlanner(false)}
                  className="p-1 rounded hover:bg-zinc-900 text-zinc-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 pt-4 text-xs text-zinc-300">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-zinc-500 mb-1 font-bold">Select Clinician</label>
                  <select
                    value={selectedDoctor?.id || ''}
                    onChange={(e) => setSelectedDoctor(doctors.find(d => d.id === e.target.value) || null)}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-850 rounded-lg text-white font-mono"
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-zinc-500 mb-1 font-bold">Planned Start Date</label>
                    <input 
                      type="date"
                      value={leaveDate}
                      onChange={(e) => setLeaveDate(e.target.value)}
                      className="w-full p-2 bg-zinc-900 border border-zinc-850 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-zinc-500 mb-1 font-bold">Leave Description / Reason</label>
                    <input 
                      type="text"
                      value={leaveReason}
                      onChange={(e) => setLeaveReason(e.target.value)}
                      className="w-full p-2 bg-zinc-900 border border-zinc-850 rounded-lg text-white"
                      placeholder="e.g., Medical board conference"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-3 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setShowLeavePlanner(false)}
                  className="px-4 py-2 rounded-xl text-xs bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddLeave}
                  className="px-4 py-2 rounded-xl text-xs bg-purple-600 hover:bg-purple-500 text-white font-bold"
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
