import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';
import { Calendar as CalendarIcon, Clock, CheckCircle2, User, Plus, Edit, XCircle } from 'lucide-react';
import { clinicalService, Appointment } from '../../../utils/services/clinicalService';
import { Patient } from '../PatientWorkspace';

interface AppointmentsPanelProps {
  supabase: SupabaseClient;
  activePatient: Patient;
  demoMode: boolean;
}

export default function AppointmentsPanel({ supabase, activePatient, demoMode }: AppointmentsPanelProps) {
  const queryClient = useQueryClient();
  const [showBookModal, setShowBookModal] = useState(false);
  const [reschedulingAppt, setReschedulingAppt] = useState<Appointment | null>(null);

  // Forms states
  const [bookForm, setBookForm] = useState({
    procedure: 'Crown Preparation',
    chair: 'Chair A',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    duration: 60,
    category: 'Treatment' as Appointment['category']
  });

  const [rescheduleForm, setRescheduleForm] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    chair: 'Chair A',
    doctorName: 'Dr. Ahmed'
  });

  // Query appointments
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments', activePatient.id],
    queryFn: () => clinicalService.getAppointments(supabase, activePatient.id, demoMode),
    enabled: !!activePatient.id
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ apptId, status }: { apptId: string; status: Appointment['status'] }) =>
      clinicalService.updateAppointmentStatus(supabase, activePatient.id, apptId, status, demoMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', activePatient.id] });
      queryClient.invalidateQueries({ queryKey: ['patient-next-appt', activePatient.id] });
    }
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ apptId, date, time, doctor, chair }: { apptId: string; date: string; time: string; doctor: string; chair: string }) =>
      clinicalService.rescheduleAppointment(supabase, activePatient.id, apptId, date, time, 'DR-01', doctor, chair, demoMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', activePatient.id] });
      setReschedulingAppt(null);
    }
  });

  const createMutation = useMutation({
    mutationFn: (newAppt: Omit<Appointment, 'id' | 'patientId' | 'patientName'>) =>
      clinicalService.createAppointment(supabase, activePatient.id, activePatient.name, newAppt, demoMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', activePatient.id] });
      setShowBookModal(false);
    }
  });

  const handleAction = (apptId: string, action: 'Confirm' | 'Check In' | 'Complete' | 'Cancel' | 'No Show') => {
    if (action === 'Confirm') {
      updateStatusMutation.mutate({ apptId, status: 'Confirmed' });
    } else if (action === 'Check In') {
      updateStatusMutation.mutate({ apptId, status: 'In-Progress' });
    } else if (action === 'Complete') {
      if (confirm("Are you sure you want to mark this appointment as Completed?")) {
        updateStatusMutation.mutate({ apptId, status: 'Completed' });
      }
    } else if (action === 'Cancel') {
      if (confirm("Are you sure you want to Cancel this appointment?")) {
        updateStatusMutation.mutate({ apptId, status: 'Cancelled' });
      }
    } else if (action === 'No Show') {
      if (confirm("Log this patient as a No Show? This will mark the appointment as Cancelled.")) {
        // Log in DB as Cancelled, note or status can carry it locally
        updateStatusMutation.mutate({ apptId, status: 'Cancelled' });
      }
    }
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      doctorId: 'DR-01',
      doctorName: activePatient.primaryDoctor || 'Dr. Ahmed',
      procedure: bookForm.procedure,
      chair: bookForm.chair,
      date: bookForm.date,
      startTime: bookForm.startTime,
      duration: Number(bookForm.duration),
      status: 'Confirmed',
      category: bookForm.category,
      isRecurring: false
    });
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingAppt) return;
    rescheduleMutation.mutate({
      apptId: reschedulingAppt.id,
      date: rescheduleForm.date,
      time: rescheduleForm.startTime,
      doctor: rescheduleForm.doctorName,
      chair: rescheduleForm.chair
    });
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-900/10 p-4 rounded-2xl border border-zinc-900 gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono">
            <CalendarIcon className="w-4 h-4 text-emerald-400" /> Patient Appointment Desk
          </h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">Reschedule visits, record intake completions, and adjust chair assignments.</p>
        </div>
        <button
          onClick={() => {
            setBookForm({
              procedure: 'Crown Preparation',
              chair: 'Chair A',
              date: new Date().toISOString().split('T')[0],
              startTime: '09:00',
              duration: 60,
              category: 'Treatment'
            });
            setShowBookModal(true);
          }}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1 self-stretch sm:self-auto justify-center"
        >
          <Plus className="w-3.5 h-3.5" /> Book Appointment
        </button>
      </div>

      {/* Appointment list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-zinc-500 text-xs text-center py-6 animate-pulse">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="text-zinc-500 text-xs text-center py-8 border border-zinc-900 rounded-2xl bg-zinc-950/20">
            No active appointments registered. Use the toolbar to schedule a visit.
          </div>
        ) : (
          appointments.map((appt) => (
            <div key={appt.id} className="p-4 rounded-xl bg-zinc-950/20 border border-zinc-900 flex flex-col sm:flex-row justify-between gap-4 hover:border-zinc-800 transition-colors">
              <div className="space-y-1.5 text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-zinc-500">{appt.date} • {appt.startTime} ({appt.duration} mins)</span>
                  <span className={`text-[8px] px-2 py-0.5 rounded font-mono font-bold border uppercase ${
                    appt.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    appt.status === 'In-Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    appt.status === 'Completed' ? 'bg-zinc-900 text-zinc-400 border-zinc-800' :
                    'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {appt.status}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500">{appt.chair}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{appt.procedure}</h4>
                <p className="text-[11px] text-zinc-400 flex items-center gap-1"><User className="w-3.5 h-3.5 text-zinc-500" /> Assigned: {appt.doctorName}</p>
              </div>

              {/* Action buttons */}
              {appt.status !== 'Completed' && appt.status !== 'Cancelled' && (
                <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center">
                  {appt.status === 'Pending' && (
                    <button
                      onClick={() => handleAction(appt.id, 'Confirm')}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-black text-[10px] font-bold"
                    >
                      Confirm
                    </button>
                  )}
                  {appt.status === 'Confirmed' && (
                    <button
                      onClick={() => handleAction(appt.id, 'Check In')}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold"
                    >
                      Check In
                    </button>
                  )}
                  {appt.status === 'In-Progress' && (
                    <button
                      onClick={() => handleAction(appt.id, 'Complete')}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-black text-[10px] font-bold"
                    >
                      Complete
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setReschedulingAppt(appt);
                      setRescheduleForm({
                        date: appt.date,
                        startTime: appt.startTime,
                        chair: appt.chair,
                        doctorName: appt.doctorName
                      });
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => handleAction(appt.id, 'No Show')}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-amber-400"
                  >
                    No Show
                  </button>
                  <button
                    onClick={() => handleAction(appt.id, 'Cancel')}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-950 border border-zinc-800 text-[10px] text-red-400"
                    title="Cancel Visit"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Book Appointment Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleBookAppointment} className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl w-full max-w-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white border-b border-zinc-900 pb-2">Schedule Patient Intake</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-zinc-400">Procedure Description</label>
                <input
                  type="text"
                  value={bookForm.procedure}
                  onChange={(e) => setBookForm({ ...bookForm, procedure: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-zinc-400">Date</label>
                  <input
                    type="date"
                    value={bookForm.date}
                    onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400">Start Time</label>
                  <input
                    type="text"
                    value={bookForm.startTime}
                    onChange={(e) => setBookForm({ ...bookForm, startTime: e.target.value })}
                    placeholder="e.g. 09:00"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-zinc-400">Chair Location</label>
                  <input
                    type="text"
                    value={bookForm.chair}
                    onChange={(e) => setBookForm({ ...bookForm, chair: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400">Duration (mins)</label>
                  <input
                    type="number"
                    value={bookForm.duration}
                    onChange={(e) => setBookForm({ ...bookForm, duration: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-zinc-900 pt-3">
              <button
                type="button"
                onClick={() => setShowBookModal(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
              >
                Schedule
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingAppt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleRescheduleSubmit} className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl w-full max-w-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white border-b border-zinc-900 pb-2">Reschedule Visit</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-zinc-400">Date</label>
                <input
                  type="date"
                  value={rescheduleForm.date}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400">Start Time</label>
                <input
                  type="text"
                  value={rescheduleForm.startTime}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, startTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400">Chair Location</label>
                <input
                  type="text"
                  value={rescheduleForm.chair}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, chair: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-zinc-900 pt-3">
              <button
                type="button"
                onClick={() => setReschedulingAppt(null)}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={rescheduleMutation.isPending}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
