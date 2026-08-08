import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';
import { Calendar as CalendarIcon, Clock, CheckCircle2, User, Plus, Edit, XCircle } from 'lucide-react';
import { clinicalService, Appointment } from '../../../utils/services/clinicalService';
import { Patient } from '../PatientWorkspace';
import { Badge, Button, Card, EmptyState, Input, Modal, Skeleton } from '@/components/ui/design-system';

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
    <div className="space-y-6 text-start">
      {/* Header toolbar */}
      <Card variant="gradient" hover={false} className="p-4 rounded-3xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-sm font-bold text-[var(--velvet-text)] flex items-center gap-1.5 font-mono">
              <CalendarIcon className="w-4 h-4 text-[var(--velvet-success)]" /> Patient Appointment Desk
            </h3>
            <p className="text-xs text-[var(--velvet-text-muted)] mt-0.5">Reschedule visits, record intake completions, and adjust chair assignments.</p>
          </div>
          <Button
            variant="primary"
            size="sm"
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
            className="self-stretch sm:self-auto justify-center"
          >
            <Plus className="w-3.5 h-3.5" /> Book Appointment
          </Button>
        </div>
      </Card>

      {/* Appointment list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, idx) => (
              <Skeleton key={idx} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <Card variant="elevated" hover={false} className="py-8 rounded-3xl">
            <EmptyState
              icon={<CalendarIcon className="w-5 h-5" />}
              title="No active appointments"
              description="No active appointments registered. Use the toolbar to schedule a visit."
            />
          </Card>
        ) : (
          appointments.map((appt) => (
            <Card key={appt.id} variant="elevated" hover={false} className="p-4 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-1.5 text-start">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-[var(--velvet-text-muted)]">{appt.date} â€¢ {appt.startTime} ({appt.duration} mins)</span>
                  <Badge tone={
                    appt.status === 'Confirmed' ? 'success' :
                    appt.status === 'In-Progress' ? 'info' :
                    appt.status === 'Completed' ? 'accent' :
                    'error'
                  }>
                    {appt.status}
                  </Badge>
                  <span className="text-2xs font-mono text-[var(--velvet-text-muted)]">{appt.chair}</span>
                </div>
                <h4 className="text-sm font-bold text-[var(--velvet-text)]">{appt.procedure}</h4>
                <p className="text-xs text-[var(--velvet-text-muted)] flex items-center gap-1"><User className="w-3.5 h-3.5 text-[var(--velvet-text-muted)]" /> Assigned: {appt.doctorName}</p>
              </div>

              {/* Action buttons */}
              {appt.status !== 'Completed' && appt.status !== 'Cancelled' && (
                <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center">
                  {appt.status === 'Pending' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAction(appt.id, 'Confirm')}
                      className="text-2xs"
                    >
                      Confirm
                    </Button>
                  )}
                  {appt.status === 'Confirmed' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAction(appt.id, 'Check In')}
                      className="text-2xs"
                    >
                      Check In
                    </Button>
                  )}
                  {appt.status === 'In-Progress' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAction(appt.id, 'Complete')}
                      className="text-2xs"
                    >
                      Complete
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setReschedulingAppt(appt);
                      setRescheduleForm({
                        date: appt.date,
                        startTime: appt.startTime,
                        chair: appt.chair,
                        doctorName: appt.doctorName
                      });
                    }}
                    className="text-2xs"
                  >
                    Reschedule
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAction(appt.id, 'No Show')}
                    className="text-2xs"
                    style={{ color: 'var(--velvet-warning)' }}
                  >
                    No Show
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleAction(appt.id, 'Cancel')}
                    className="p-1.5 rounded-lg"
                    title="Cancel Visit"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Book Appointment Modal */}
      <Modal
        open={showBookModal}
        onOpenChange={setShowBookModal}
        title="Schedule Patient Intake"
        size="sm"
        actions={
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowBookModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="book-appt-form"
              variant="primary"
              size="sm"
              disabled={createMutation.isPending}
            >
              Schedule
            </Button>
          </>
        }
      >
        <form id="book-appt-form" onSubmit={handleBookAppointment} className="space-y-4 text-xs">
          <div className="space-y-3">
            <Input
              label="Procedure Description"
              value={bookForm.procedure}
              onChange={(e) => setBookForm({ ...bookForm, procedure: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Date"
                type="date"
                value={bookForm.date}
                onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                required
              />
              <Input
                label="Start Time"
                type="text"
                value={bookForm.startTime}
                onChange={(e) => setBookForm({ ...bookForm, startTime: e.target.value })}
                placeholder="e.g. 09:00"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Chair Location"
                value={bookForm.chair}
                onChange={(e) => setBookForm({ ...bookForm, chair: e.target.value })}
                required
              />
              <Input
                label="Duration (mins)"
                type="number"
                value={bookForm.duration}
                onChange={(e) => setBookForm({ ...bookForm, duration: Number(e.target.value) })}
                required
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        open={!!reschedulingAppt}
        onOpenChange={(open) => { if (!open) setReschedulingAppt(null); }}
        title="Reschedule Visit"
        size="sm"
        actions={
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setReschedulingAppt(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="reschedule-form"
              variant="primary"
              size="sm"
              disabled={rescheduleMutation.isPending}
            >
              Save
            </Button>
          </>
        }
      >
        <form id="reschedule-form" onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
          <div className="space-y-3">
            <Input
              label="Date"
              type="date"
              value={rescheduleForm.date}
              onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
              required
            />
            <Input
              label="Start Time"
              type="text"
              value={rescheduleForm.startTime}
              onChange={(e) => setRescheduleForm({ ...rescheduleForm, startTime: e.target.value })}
              required
            />
            <Input
              label="Chair Location"
              value={rescheduleForm.chair}
              onChange={(e) => setRescheduleForm({ ...rescheduleForm, chair: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
