export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/ui/DashboardShell';
import PatientWorkspace from '@/components/ui/PatientWorkspace';

export default async function PatientsPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  const demoMode = Boolean((user as any).isDevBypass);
  const { data: patientRows } = demoMode
    ? { data: [] }
    : await (supabase as any)
        .from('healthos_patients')
        .select('*, healthos_patient_cases(*)')
        .order('created_at', { ascending: false });

  return (
    <DashboardShell user={user}>
      <PatientWorkspace demoMode={demoMode} initialRows={patientRows || []} />
    </DashboardShell>
  );
}
