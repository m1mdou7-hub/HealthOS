'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ListCollapse, ChevronUp, ChevronDown, UserPlus, Sparkles, X, Clock, HelpCircle } from 'lucide-react';
import { QueueItem, MOCK_DOCTORS } from './types';

interface WaitingQueueProps {
  queue: QueueItem[];
  setQueue: React.Dispatch<React.SetStateAction<QueueItem[]>>;
}

export default function WaitingQueue({
  queue,
  setQueue
}: WaitingQueueProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form State
  const [patientName, setPatientName] = useState('');
  const [patientType, setPatientType] = useState<QueueItem['type']>('Walk-in');
  const [urgency, setUrgency] = useState<QueueItem['urgency']>('Medium');
  const [doctorId, setDoctorId] = useState(MOCK_DOCTORS[0].id);

  // Helper: Calculate Priority Score dynamically
  const calculatePriorityScore = (item: QueueItem) => {
    let score = 0;
    
    // Type Base
    if (item.type === 'Emergency') score += 50;
    else if (item.type === 'VIP') score += 30;
    else if (item.type === 'Scheduled') score += 15;
    else score += 10; // Walk-in

    // Urgency Base
    if (item.urgency === 'Critical') score += 40;
    else if (item.urgency === 'High') score += 25;
    else if (item.urgency === 'Medium') score += 12;
    else score += 5; // Low

    // Wait Time Factor: 1 point for every 2 minutes of wait
    score += Math.floor(item.waitTime / 2);

    return score;
  };

  // Optimizer: Sort queue based on priority score descending
  const optimizeQueue = () => {
    setQueue(prev => {
      const sorted = [...prev].sort((a, b) => calculatePriorityScore(b) - calculatePriorityScore(a));
      return sorted;
    });
  };

  // Manual move helpers
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setQueue(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index - 1];
      next[index - 1] = temp;
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    setQueue(prev => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index + 1];
      next[index + 1] = temp;
      return next;
    });
  };

  const handleRemove = (id: string) => {
    setQueue(prev => prev.filter(q => q.id !== id));
  };

  const handleAddPatient = () => {
    if (!patientName.trim()) return;

    const newItem: QueueItem = {
      id: `Q-${Date.now()}`,
      patientName,
      type: patientType,
      urgency,
      arrivalTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      waitTime: 1,
      assignedDoctorId: doctorId
    };

    setQueue(prev => [...prev, newItem]);
    setPatientName('');
    setShowAddForm(false);
  };

  const getTypeStyle = (type: QueueItem['type']) => {
    switch (type) {
      case 'Emergency': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'VIP': return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'Scheduled': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Walk-in': default: return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const getUrgencyBadge = (urgency: QueueItem['urgency']) => {
    switch (urgency) {
      case 'Critical': return 'text-rose-400 font-bold uppercase tracking-wider animate-pulse';
      case 'High': return 'text-amber-400 font-semibold';
      case 'Medium': return 'text-zinc-300';
      case 'Low': default: return 'text-zinc-500';
    }
  };

  return (
    <div id="waiting-queue" className="p-6 card-elevated rounded-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold font-mono flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <ListCollapse className="w-4 h-4" style={{ color: 'var(--warning)' }} /> Triage waiting & walk-in queue
          </h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Prioritize physical check-ins. Use AI-assisted triage calculations to sort emergencies and VIPs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={optimizeQueue}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            style={{ background: 'color-mix(in srgb, var(--warning) 12%, transparent)', color: 'var(--warning)', border: '1px solid color-mix(in srgb, var(--warning) 25%, transparent)' }}
          >
            <Sparkles className="w-3.5 h-3.5" /> Optimize Queue Order
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" /> Check-in Patient
          </button>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden card-elevated">
        <div className="grid grid-cols-12 p-3.5 text-[10px] font-mono font-bold uppercase tracking-widest border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-3 text-left">Patient Chart</div>
          <div className="col-span-2 text-left">Category</div>
          <div className="col-span-2 text-left">Urgency</div>
          <div className="col-span-2 text-center">Wait Duration</div>
          <div className="col-span-1 text-center font-bold" style={{ color: 'var(--warning)' }}>Score</div>
          <div className="col-span-1 text-center">Actions</div>
        </div>

        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          <AnimatePresence initial={false}>
            {queue.map((item, index) => {
              const priorityScore = calculatePriorityScore(item);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-12 p-3.5 text-xs items-center hover:bg-zinc-900/20 text-left"
                  style={{ color: 'var(--text-sub)' }}
                >
                  <div className="col-span-1 text-center font-mono font-bold" style={{ color: 'var(--text-muted)' }}>
                    #{index + 1}
                  </div>
                  
                  <div className="col-span-3 font-semibold" style={{ color: 'var(--text)' }}>
                    {item.patientName}
                  </div>

                  <div className="col-span-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${getTypeStyle(item.type)}`}>
                      {item.type}
                    </span>
                  </div>

                  <div className="col-span-2 font-mono text-[11px]">
                    <span className={getUrgencyBadge(item.urgency)}>{item.urgency}</span>
                  </div>

                  <div className="col-span-2 text-center font-mono flex items-center justify-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} /> {item.waitTime}m
                  </div>

                  <div className="col-span-1 text-center font-mono font-black text-sm" style={{ color: 'var(--warning)' }}>
                    {priorityScore}
                  </div>

                  <div className="col-span-1 flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="btn-ghost p-1 rounded disabled:opacity-30"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === queue.length - 1}
                      className="btn-ghost p-1 rounded disabled:opacity-30"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-1 rounded hover:opacity-80"
                      style={{ color: 'var(--text-muted)' }}
                      title="Complete / Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {queue.length === 0 && (
            <div className="p-8 text-center text-xs italic" style={{ color: 'var(--text-muted)' }}>
              No patients checked in right now.
            </div>
          )}
        </div>
      </div>

      {/* Add Triage Patient Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card-elevated rounded-2xl max-w-sm w-full p-6 text-left shadow-2xl"
            >
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
                <h3 className="text-sm font-bold font-mono" style={{ color: 'var(--text)' }}>In-Clinic Patient Check-in</h3>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="btn-ghost p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 pt-4 text-xs" style={{ color: 'var(--text-sub)' }}>
                <div>
                  <label className="block text-[10px] uppercase font-mono mb-1 font-bold" style={{ color: 'var(--text-muted)' }}>Patient Name</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full p-2.5 rounded-lg border"
                    style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    placeholder="e.g. Clark Kent"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-mono mb-1 font-bold" style={{ color: 'var(--text-muted)' }}>Intake Type</label>
                    <select
                      value={patientType}
                      onChange={(e) => setPatientType(e.target.value as any)}
                      className="w-full p-2 rounded-lg border"
                      style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    >
                      <option value="Walk-in">Walk-in</option>
                      <option value="Emergency">Emergency</option>
                      <option value="VIP">VIP</option>
                      <option value="Scheduled">Scheduled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono mb-1 font-bold" style={{ color: 'var(--text-muted)' }}>Pain / Urgency</label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value as any)}
                      className="w-full p-2 rounded-lg border"
                      style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    >
                      <option value="Low">Low (No pain)</option>
                      <option value="Medium">Medium (Discomfort)</option>
                      <option value="High">High (Severe pain)</option>
                      <option value="Critical">Critical (Surgical emergency)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono mb-1 font-bold" style={{ color: 'var(--text-muted)' }}>Preferred Operator</label>
                  <select
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="w-full p-2 rounded-lg border font-mono"
                    style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  >
                    {MOCK_DOCTORS.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-ghost px-4 py-2 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddPatient}
                  className="btn-primary px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Check-in Triage
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
