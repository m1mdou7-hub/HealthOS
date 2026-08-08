'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Clock, User, Check, X, ChevronLeft, ChevronRight, 
  Trash2, Copy, Plus, Edit, RotateCcw, AlertCircle, RefreshCw 
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Appointment, Doctor, Patient } from './types';

interface EnterpriseSchedulerProps {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  doctors: Doctor[];
  chairs: string[];
  patients: Patient[];
  demoMode: boolean;
}

export default function EnterpriseScheduler({
  appointments,
  setAppointments,
  doctors,
  chairs,
  patients,
  demoMode
}: EnterpriseSchedulerProps) {
  const [selectedView, setSelectedView] = useState<'day' | 'week' | 'month' | 'timeline'>('day');
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2026-07-20'));
  
  // Modals / Editing States
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // New Appointment Form State
  const [formPatientId, setFormPatientId] = useState(patients[0]?.id || '');
  const [formDoctorId, setFormDoctorId] = useState(doctors[0].id);
  const [formProcedure, setFormProcedure] = useState('Crown Preparation');
  const [formChair, setFormChair] = useState(chairs[0]);
  const [formDate, setFormDate] = useState('2026-07-20');
  const [formTime, setFormTime] = useState('10:00');
  const [formDuration, setFormDuration] = useState(45);
  const [formCategory, setFormCategory] = useState<'Consultation' | 'Treatment' | 'Surgery' | 'Lab' | 'Recall'>('Treatment');
  const [formIsRecurring, setFormIsRecurring] = useState(false);
  const supabase = createClient();

  const toRow = (appointment: Appointment, recurringGroupId?: string) => ({
    id: appointment.id,
    patient_id: appointment.patientId,
    patient_name: appointment.patientName,
    doctor_id: appointment.doctorId,
    doctor_name: appointment.doctorName,
    procedure: appointment.procedure,
    chair: appointment.chair,
    appointment_date: appointment.date,
    start_time: appointment.startTime,
    duration_minutes: appointment.duration,
    status: appointment.status,
    category: appointment.category,
    is_recurring: Boolean(appointment.isRecurring),
    recurring_group_id: recurringGroupId || null
  });

  const persistError = (error: any) => {
    const isConflict = error?.code === '23P01';
    setConflictWarning(
      isConflict
        ? 'This doctor or chair is already booked during the selected time.'
        : error?.message || 'The appointment could not be saved.'
    );
  };

  const insertAppointments = async (nextAppointments: Appointment[]) => {
    if (!demoMode) {
      const recurringGroupId = nextAppointments.length > 1 ? crypto.randomUUID() : undefined;
      const { error } = await (supabase as any)
        .from('healthos_appointments')
        .insert(nextAppointments.map(appointment => toRow(appointment, recurringGroupId)));
      if (error) {
        persistError(error);
        return false;
      }
    }
    setAppointments(prev => [...prev, ...nextAppointments]);
    return true;
  };

  const updateAppointment = async (appointment: Appointment) => {
    if (!demoMode) {
      const { error } = await (supabase as any)
        .from('healthos_appointments')
        .update(toRow(appointment))
        .eq('id', appointment.id);
      if (error) {
        persistError(error);
        return false;
      }
    }
    setAppointments(prev => prev.map(item => item.id === appointment.id ? appointment : item));
    return true;
  };

  // Formatting date
  const getFormattedDate = (date: Date) => date.toISOString().split('T')[0];
  const currentDateStr = getFormattedDate(currentDate);

  // Conflict Detection Logic (Double Bookings)
  const checkConflicts = (doctor_id: string, chair: string, date: string, startTime: string, duration: number, ignoreApptId?: string) => {
    const [h, m] = startTime.split(':').map(Number);
    const startMin = h * 60 + m;
    const endMin = startMin + duration;

    for (const appt of appointments) {
      if (appt.id === ignoreApptId || appt.status === 'Cancelled' || appt.date !== date) continue;

      const [ah, am] = appt.startTime.split(':').map(Number);
      const apptStartMin = ah * 60 + am;
      const apptEndMin = apptStartMin + appt.duration;

      // Overlap checks
      const overlaps = startMin < apptEndMin && apptStartMin < endMin;
      if (overlaps) {
        if (appt.doctorId === doctor_id) {
          return `Conflict: ${appt.doctorName} is already booked for ${appt.patientName} at ${appt.startTime}.`;
        }
        if (appt.chair === chair) {
          return `Conflict: ${chair} is already occupied by ${appt.patientName} at ${appt.startTime}.`;
        }
      }
    }
    return null;
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, apptId: string) => {
    e.dataTransfer.setData('text/plain', apptId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetChair: string, targetTime: string) => {
    e.preventDefault();
    const apptId = e.dataTransfer.getData('text/plain');
    if (!apptId) return;

    const appt = appointments.find(a => a.id === apptId);
    if (!appt) return;

    // Check for potential conflicts before dropping
    const conflict = checkConflicts(appt.doctorId, targetChair, appt.date, targetTime, appt.duration, appt.id);
    if (conflict) {
      setConflictWarning(conflict);
      return;
    }

    await updateAppointment({ ...appt, chair: targetChair, startTime: targetTime });
  };

  // Navigating Date
  const handlePrevDate = () => {
    const next = new Date(currentDate);
    if (selectedView === 'week') next.setDate(next.getDate() - 7);
    else if (selectedView === 'month') next.setMonth(next.getMonth() - 1);
    else next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNextDate = () => {
    const next = new Date(currentDate);
    if (selectedView === 'week') next.setDate(next.getDate() + 7);
    else if (selectedView === 'month') next.setMonth(next.getMonth() + 1);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  // Category visual styles
  const getCategoryStyles = (category: Appointment['category']) => {
    switch (category) {
      case 'Consultation': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'Treatment': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Surgery': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Lab': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Recall': default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'Confirmed': return 'bg-emerald-500/20 text-emerald-300';
      case 'Completed': return 'bg-blue-500/20 text-blue-300';
      case 'In-Progress': return 'bg-purple-500/20 text-purple-300 animate-pulse';
      case 'Cancelled': return 'bg-rose-500/20 text-rose-300';
      case 'Pending': default: return 'bg-zinc-700 text-zinc-300';
    }
  };

  // Theme-consistent category accent color for use with inline var() styles
  const getCategoryColor = (category: Appointment['category']) => {
    switch (category) {
      case 'Consultation': return 'var(--velvet-info)';
      case 'Treatment': return 'var(--velvet-success)';
      case 'Surgery': return 'var(--velvet-accent)';
      case 'Lab': return 'var(--velvet-warning)';
      case 'Recall': default: return 'var(--velvet-text-muted)';
    }
  };

  // Actions: Create, Edit, Delete, Duplicate
  const handleCreateAppointment = async () => {
    const conflict = checkConflicts(formDoctorId, formChair, formDate, formTime, formDuration);
    if (conflict) {
      setConflictWarning(conflict);
      return;
    }

    const patient = patients.find(p => p.id === formPatientId);
    const doctor = doctors.find(d => d.id === formDoctorId)!;
    if (!patient) {
      setConflictWarning('Create a patient before booking an appointment.');
      return;
    }

    const base: Appointment = {
      id: `APT-${crypto.randomUUID()}`,
      patientId: patient.id,
      patientName: patient.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      procedure: formProcedure,
      chair: formChair,
      date: formDate,
      startTime: formTime,
      duration: formDuration,
      status: 'Confirmed',
      category: formCategory,
      isRecurring: formIsRecurring
    };

    const newAppts = [base];

    // If recurring is checked, schedule 3 weekly visits
    if (formIsRecurring) {
      for (let i = 1; i <= 3; i++) {
        const d = new Date(formDate);
        d.setDate(d.getDate() + i * 7);
        const recurringDateStr = d.toISOString().split('T')[0];

        newAppts.push({
          ...base,
          id: `APT-${crypto.randomUUID()}`,
          date: recurringDateStr,
          isRecurring: true
        });
      }
    }

    if (await insertAppointments(newAppts)) {
      setIsCreateModalOpen(false);
      setConflictWarning(null);
    }
  };

  const handleDuplicate = async (appt: Appointment) => {
    const nextDate = new Date(`${appt.date}T12:00:00`);
    nextDate.setDate(nextDate.getDate() + 1);
    const duplicated: Appointment = {
      ...appt,
      id: `APT-${crypto.randomUUID()}`,
      date: getFormattedDate(nextDate),
      status: 'Pending'
    };
    await insertAppointments([duplicated]);
  };

  const handleDelete = async (apptId: string) => {
    if (!demoMode) {
      const { error } = await (supabase as any)
        .from('healthos_appointments')
        .delete()
        .eq('id', apptId);
      if (error) {
        persistError(error);
        return;
      }
    }
    setAppointments(prev => prev.filter(a => a.id !== apptId));
  };

  const handleSaveEdit = async () => {
    if (!editingAppt) return;

    const conflict = checkConflicts(
      editingAppt.doctorId,
      editingAppt.chair,
      editingAppt.date,
      editingAppt.startTime,
      editingAppt.duration,
      editingAppt.id
    );

    if (conflict) {
      setConflictWarning(conflict);
      return;
    }

    if (await updateAppointment(editingAppt)) {
      setEditingAppt(null);
      setConflictWarning(null);
    }
  };

  return (
    <div id="enterprise-scheduler" className="p-6 card-elevated rounded-2xl space-y-6">
      
      {/* View Selectors & Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {(['day', 'week', 'month', 'timeline'] as const).map(v => (
            <button
              key={v}
              onClick={() => setSelectedView(v)}
              className={`nav-item px-4 py-2 text-xs font-semibold capitalize ${selectedView === v ? 'active font-bold' : ''}`}
            >
              {v} View
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 p-2 rounded-xl card-gradient">
          <button 
            onClick={handlePrevDate}
            className="btn-ghost p-1.5 rounded-lg"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold px-2" style={{ color: 'var(--velvet-text)' }}>
            {currentDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
          <button 
            onClick={handleNextDate}
            className="btn-ghost p-1.5 rounded-lg"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => {
            setFormDate(currentDateStr);
            setIsCreateModalOpen(true);
          }}
          disabled={patients.length === 0}
          className="btn-primary px-4 py-2 text-xs rounded-xl flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Appointment
        </button>
      </div>

      {/* Conflict Warning banner */}
      <AnimatePresence>
        {conflictWarning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl flex items-center gap-2 text-xs border"
            style={{ background: 'color-mix(in srgb, var(--velvet-error) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--velvet-error) 25%, transparent)', color: 'var(--velvet-error)' }}
          >
            <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--velvet-error)' }} />
            <span>{conflictWarning}</span>
            <button 
              onClick={() => setConflictWarning(null)}
              className="ms-auto text-2xs uppercase font-mono font-bold opacity-80 hover:opacity-100"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------- SCHEDULE RENDERERS ----------------- */}
      
      {/* 1. DAY VIEW & TIMELINE ROW (CHAIRS GRID) */}
      {(selectedView === 'day' || selectedView === 'timeline') && (
        <div className="overflow-x-auto">
          <div className="min-w-[800px] rounded-xl overflow-hidden border card-elevated" style={{ borderColor: 'var(--velvet-border)' }}>
            {/* Table Header: Operatory Chairs */}
            <div className="grid grid-cols-6 border-b p-3 text-xs font-mono font-bold card-gradient" style={{ borderColor: 'var(--velvet-border)', color: 'var(--velvet-text-sub)' }}>
              <div className="ps-2">Timeline Slot</div>
              {chairs.map(c => (
                <div key={c} className="text-center">{c}</div>
              ))}
            </div>

            {/* Time Rows */}
            {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(hour => (
              <div key={hour} className="grid grid-cols-6 border-b min-h-[90px] last:border-0 hover:bg-zinc-900/10" style={{ borderColor: 'var(--velvet-border)' }}>
                <div className="p-3 text-xs font-mono font-semibold border-e flex items-center" style={{ borderColor: 'var(--velvet-border)', color: 'var(--velvet-text-muted)' }}>
                  <Clock className="w-3.5 h-3.5 me-1.5" style={{ color: 'var(--velvet-text-sub)' }} /> {hour}
                </div>
                
                {chairs.map(chair => {
                  const matchingAppt = appointments.find(a => 
                    a.date === currentDateStr && 
                    a.chair === chair && 
                    a.startTime === hour &&
                    a.status !== 'Cancelled'
                  );

                  return (
                    <div
                      key={chair}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, chair, hour)}
                      className="p-2 border-e flex items-center justify-center relative min-h-[80px]"
                      style={{ borderColor: 'var(--velvet-border)' }}
                    >
                      {matchingAppt ? (
                        <motion.div
                          draggable
                          onDragStart={(e) => handleDragStart(e as any, matchingAppt.id)}
                          layoutId={`card-${matchingAppt.id}`}
                          className={`w-full p-2.5 rounded-xl border flex flex-col text-start text-xs cursor-grab active:cursor-grabbing transition-all card-hover ${getCategoryStyles(matchingAppt.category)}`}
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="font-bold truncate" style={{ color: 'var(--velvet-text)' }}>{matchingAppt.patientName}</span>
                            <span className={`text-2xs px-1 py-0.5 rounded font-bold ${getStatusBadge(matchingAppt.status)}`}>
                              {matchingAppt.status}
                            </span>
                          </div>
                          
                          <p className="text-2xs font-mono mt-1 truncate" style={{ color: 'var(--velvet-text-sub)' }}>{matchingAppt.procedure}</p>
                          <p className="text-2xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--velvet-text-muted)' }}>
                            <User className="w-2.5 h-2.5" /> {matchingAppt.doctorName}
                          </p>

                          <div className="mt-2 pt-2 border-t flex items-center justify-between text-2xs font-mono" style={{ borderColor: 'var(--velvet-border)' }}>
                            <span style={{ color: 'var(--velvet-text-sub)' }}>{matchingAppt.duration}m Duration</span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => setEditingAppt(matchingAppt)}
                                className="btn-ghost p-1 rounded"
                                title="Edit"
                              >
                                <Edit className="w-2.5 h-2.5" />
                              </button>
                              <button
                                onClick={() => handleDuplicate(matchingAppt)}
                                className="btn-ghost p-1 rounded"
                                title="Duplicate"
                              >
                                <Copy className="w-2.5 h-2.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(matchingAppt.id)}
                                className="p-1 rounded hover:opacity-80"
                                style={{ color: 'var(--velvet-error)' }}
                                title="Delete"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <button
                          onClick={() => {
                            setFormChair(chair);
                            setFormTime(hour);
                            setFormDate(currentDateStr);
                            setIsCreateModalOpen(true);
                          }}
                          className="w-full h-full rounded text-2xs font-mono opacity-0 hover:opacity-100 transition-all border border-dashed"
                          style={{ borderColor: 'var(--velvet-border)', color: 'var(--velvet-accent)' }}
                        >
                          + Book Slot
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. WEEK VIEW */}
      {selectedView === 'week' && (
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, idx) => {
            const startOfWeek = new Date(currentDate);
            const d = startOfWeek.getDay();
            const diff = startOfWeek.getDate() - d + idx;
            const weekDay = new Date(startOfWeek.setDate(diff));
            const weekDayStr = getFormattedDate(weekDay);
            const isToday = weekDayStr === '2026-07-20';

            const dailyAppts = appointments.filter(a => a.date === weekDayStr && a.status !== 'Cancelled');

            return (
              <div key={idx} className={`p-3 card-elevated rounded-2xl min-h-[350px] flex flex-col space-y-3 ${isToday ? 'card-gradient' : ''}`}>
                <div className="border-b pb-2 flex flex-col text-start" style={{ borderColor: 'var(--velvet-border)' }}>
                  <span className="text-2xs font-mono" style={{ color: 'var(--velvet-text-muted)' }}>
                    {weekDay.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span className={`text-sm font-bold font-mono ${isToday ? '' : ''}`} style={{ color: isToday ? 'var(--velvet-accent)' : 'var(--velvet-text-sub)' }}>
                    {weekDay.getDate()}
                  </span>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto max-h-[350px] scrollbar-none text-start">
                  {dailyAppts.length > 0 ? (
                    dailyAppts.map(appt => (
                      <div 
                        key={appt.id} 
                        className={`p-2 rounded-xl border text-xs leading-snug space-y-1 card-hover ${getCategoryStyles(appt.category)}`}
                      >
                        <div className="flex justify-between items-center font-bold" style={{ color: 'var(--velvet-text)' }}>
                          <span className="truncate max-w-[70%]">{appt.patientName}</span>
                          <span className="text-2xs font-mono" style={{ color: 'var(--velvet-text-muted)' }}>{appt.startTime}</span>
                        </div>
                        <p className="text-2xs truncate" style={{ color: 'var(--velvet-text-sub)' }}>{appt.procedure}</p>
                        <p className="text-2xs truncate" style={{ color: 'var(--velvet-text-muted)' }}>{appt.chair}</p>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-2xs italic" style={{ color: 'var(--velvet-text-muted)' }}>
                      No visits
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. MONTH VIEW */}
      {selectedView === 'month' && (
        <div className="grid grid-cols-7 gap-1 rounded-xl overflow-hidden card-elevated">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(w => (
            <div key={w} className="p-2 text-center text-2xs font-mono font-bold border-b" style={{ borderColor: 'var(--velvet-border)', color: 'var(--velvet-text-sub)', background: 'var(--velvet-surface-2)' }}>
              {w}
            </div>
          ))}
          {Array.from({ length: 35 }).map((_, idx) => {
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const startDay = startOfMonth.getDay();
            const offset = (startDay === 0 ? 6 : startDay - 1); // Align Monday
            const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), idx + 1 - offset);
            const cellDateStr = getFormattedDate(cellDate);
            const isCurrentMonth = cellDate.getMonth() === currentDate.getMonth();

            const cellAppts = appointments.filter(a => a.date === cellDateStr && a.status !== 'Cancelled');

            return (
              <div 
                key={idx} 
                className={`p-1.5 min-h-[75px] border-b border-e flex flex-col justify-between text-start ${
                  isCurrentMonth ? '' : 'opacity-50'
                }`}
                style={{ borderColor: 'var(--velvet-border)' }}
              >
                <span className="text-2xs font-mono font-bold" style={{ color: 'var(--velvet-text-muted)' }}>
                  {cellDate.getDate()}
                </span>
                <div className="mt-1 space-y-1">
                  {cellAppts.slice(0, 2).map(appt => (
                    <div 
                      key={appt.id} 
                      className={`px-1 py-0.5 rounded text-2xs font-mono truncate border ${getCategoryStyles(appt.category)}`}
                    >
                      {appt.startTime} {appt.patientName.split(' ')[0]}
                    </div>
                  ))}
                  {cellAppts.length > 2 && (
                    <span className="text-2xs font-mono ps-1" style={{ color: 'var(--velvet-accent)' }}>
                      +{cellAppts.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ----------------- MODALS ----------------- */}

      {/* 1. EDIT MODAL */}
      <AnimatePresence>
        {editingAppt && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card-elevated rounded-2xl max-w-md w-full p-6 text-start shadow-card"
            >
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--velvet-border)' }}>
                <h3 className="text-sm font-bold font-mono" style={{ color: 'var(--velvet-text)' }}>Quick Edit Appointment</h3>
                <button 
                  onClick={() => setEditingAppt(null)}
                  className="btn-ghost p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 pt-4 text-xs" style={{ color: 'var(--velvet-text-sub)' }}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-2xs uppercase font-mono mb-1 font-bold" style={{ color: 'var(--velvet-text-muted)' }}>Patient</label>
                    <input 
                      type="text" 
                      value={editingAppt.patientName}
                      disabled
                      className="w-full p-2 rounded-lg cursor-not-allowed border"
                      style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)', color: 'var(--velvet-text-muted)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-2xs uppercase font-mono mb-1 font-bold" style={{ color: 'var(--velvet-text-muted)' }}>Doctor</label>
                    <select
                      value={editingAppt.doctorId}
                      onChange={(e) => {
                        const doc = doctors.find(d => d.id === e.target.value)!;
                        setEditingAppt({ ...editingAppt, doctorId: doc.id, doctorName: doc.name });
                      }}
                      className="w-full p-2 rounded-lg border"
                      style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)', color: 'var(--velvet-text)' }}
                    >
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-2xs uppercase font-mono mb-1 font-bold" style={{ color: 'var(--velvet-text-muted)' }}>Procedure</label>
                    <input 
                      type="text" 
                      value={editingAppt.procedure}
                      onChange={(e) => setEditingAppt({ ...editingAppt, procedure: e.target.value })}
                      className="w-full p-2 rounded-lg border"
                      style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)', color: 'var(--velvet-text)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-2xs uppercase font-mono mb-1 font-bold" style={{ color: 'var(--velvet-text-muted)' }}>Chair</label>
                    <select
                      value={editingAppt.chair}
                      onChange={(e) => setEditingAppt({ ...editingAppt, chair: e.target.value })}
                      className="w-full p-2 rounded-lg border"
                      style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)', color: 'var(--velvet-text)' }}
                    >
                      {chairs.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-2xs uppercase font-mono mb-1 font-bold" style={{ color: 'var(--velvet-text-muted)' }}>Date</label>
                    <input 
                      type="date" 
                      value={editingAppt.date}
                      onChange={(e) => setEditingAppt({ ...editingAppt, date: e.target.value })}
                      className="w-full p-2 rounded-lg border"
                      style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)', color: 'var(--velvet-text)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-2xs uppercase font-mono mb-1 font-bold" style={{ color: 'var(--velvet-text-muted)' }}>Start Time</label>
                    <select
                      value={editingAppt.startTime}
                      onChange={(e) => setEditingAppt({ ...editingAppt, startTime: e.target.value })}
                      className="w-full p-2 rounded-lg border"
                      style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)', color: 'var(--velvet-text)' }}
                    >
                      {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-2xs uppercase font-mono mb-1 font-bold" style={{ color: 'var(--velvet-text-muted)' }}>Duration (m)</label>
                    <input 
                      type="number" 
                      value={editingAppt.duration}
                      onChange={(e) => setEditingAppt({ ...editingAppt, duration: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg border"
                      style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)', color: 'var(--velvet-text)' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-2xs uppercase font-mono mb-1 font-bold" style={{ color: 'var(--velvet-text-muted)' }}>Status</label>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(['Confirmed', 'Pending', 'In-Progress', 'Completed', 'Cancelled'] as const).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setEditingAppt({ ...editingAppt, status: s })}
                        className={`px-3 py-1.5 rounded-lg text-2xs font-mono font-bold transition-all ${
                          editingAppt.status === s 
                            ? 'btn-primary' 
                            : 'btn-ghost'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-3 border-t" style={{ borderColor: 'var(--velvet-border)' }}>
                <button
                  type="button"
                  onClick={() => setEditingAppt(null)}
                  className="btn-ghost px-4 py-2 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="btn-primary px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. CREATE MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card-elevated rounded-2xl max-w-md w-full p-6 text-start shadow-card"
            >
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--velvet-border)' }}>
                <h3 className="text-sm font-bold font-mono" style={{ color: 'var(--velvet-text)' }}>Create New Appointment</h3>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn-ghost p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 pt-4 text-xs" style={{ color: 'var(--velvet-text-sub)' }}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-2xs uppercase font-mono mb-1 font-bold" style={{ color: 'var(--velvet-text-muted)' }}>Patient</label>
                    <select
                      value={formPatientId}
                      onChange={(e) => setFormPatientId(e.target.value)}
                      className="w-full p-2 rounded-lg border"
                      style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)', color: 'var(--velvet-text)' }}
                    >
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-2xs uppercase font-mono mb-1 font-bold" style={{ color: 'var(--velvet-text-muted)' }}>Doctor</label>
                    <select
                      value={formDoctorId}
                      onChange={(e) => setFormDoctorId(e.target.value)}
                      className="w-full p-2 rounded-lg border"
                      style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)', color: 'var(--velvet-text)' }}
                    >
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-2xs uppercase font-mono mb-1 font-bold" style={{ color: 'var(--velvet-text-muted)' }}>Procedure</label>
                    <input 
                      type="text" 
                      value={formProcedure}
                      onChange={(e) => setFormProcedure(e.target.value)}
                      className="w-full p-2 rounded-lg border"
                      style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)', color: 'var(--velvet-text)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-2xs uppercase font-mono mb-1 font-bold" style={{ color: 'var(--velvet-text-muted)' }}>Chair</label>
                    <select
                      value={formChair}
                      onChange={(e) => setFormChair(e.target.value)}
                      className="w-full p-2 rounded-lg border"
                      style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)', color: 'var(--velvet-text)' }}
                    >
                      {chairs.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-2xs uppercase font-mono mb-1 font-bold" style={{ color: 'var(--velvet-text-muted)' }}>Date</label>
                    <input 
                      type="date" 
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full p-2 rounded-lg border"
                      style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)', color: 'var(--velvet-text)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-2xs uppercase font-mono mb-1 font-bold" style={{ color: 'var(--velvet-text-muted)' }}>Time</label>
                    <select
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full p-2 rounded-lg border"
                      style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)', color: 'var(--velvet-text)' }}
                    >
                      {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-2xs uppercase font-mono mb-1 font-bold" style={{ color: 'var(--velvet-text-muted)' }}>Duration (m)</label>
                    <input 
                      type="number" 
                      value={formDuration}
                      onChange={(e) => setFormDuration(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border"
                      style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)', color: 'var(--velvet-text)' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-2xs uppercase font-mono mb-1 font-bold" style={{ color: 'var(--velvet-text-muted)' }}>Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full p-2 rounded-lg border"
                      style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)', color: 'var(--velvet-text)' }}
                    >
                      {['Consultation', 'Treatment', 'Surgery', 'Lab', 'Recall'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 mt-5">
                    <input 
                      type="checkbox"
                      id="recurring-check"
                      checked={formIsRecurring}
                      onChange={(e) => setFormIsRecurring(e.target.checked)}
                      className="rounded border" style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)', accentColor: 'var(--velvet-accent)' }}
                    />
                    <label htmlFor="recurring-check" className="text-xs select-none" style={{ color: 'var(--velvet-text-sub)' }}>Recurring Weekly (3 wks)</label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-3 border-t" style={{ borderColor: 'var(--velvet-border)' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn-ghost px-4 py-2 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateAppointment}
                  className="btn-primary px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Book Appointment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
