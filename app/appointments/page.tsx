export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/ui/DashboardShell';
import OperationsWorkspace from '@/components/operations/OperationsWorkspace';

export default async function AppointmentsPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  const demoMode = Boolean((user as any).isDevBypass);
  const [{ data: appointmentRows }, { data: patientRows }] = demoMode
    ? [{ data: [] }, { data: [] }]
    : await Promise.all([
        (supabase as any)
          .from('healthos_appointments')
          .select('*')
          .order('appointment_date', { ascending: true })
          .order('start_time', { ascending: true }),
        (supabase as any)
          .from('healthos_patients')
          .select('id, name, phone, email, medical_alerts, current_treatment')
          .order('name', { ascending: true })
      ]);

  const initialAppointments = (appointmentRows || []).map((row: any) => ({
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    procedure: row.procedure,
    chair: row.chair,
    date: row.appointment_date,
    startTime: String(row.start_time).slice(0, 5),
    duration: row.duration_minutes,
    status: row.status,
    category: row.category,
    isRecurring: row.is_recurring
  }));

  const initialPatients = (patientRows || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    phone: row.phone || '',
    email: row.email || '',
    dob: '',
    medicalAlerts: row.medical_alerts || [],
    currentTreatment: row.current_treatment || '',
    historyScore: 0,
    priorityType: 'Routine' as const
  }));

  return (
    <DashboardShell user={user}>
      <OperationsWorkspace
        demoMode={demoMode}
        initialAppointments={initialAppointments}
        initialPatients={initialPatients}
      />
    </DashboardShell>
  );
}
