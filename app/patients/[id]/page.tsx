export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/ui/DashboardShell';
import PatientWorkspace from '@/components/ui/PatientWorkspace';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientDetailPage(props: PageProps) {
  const { id } = await props.params;
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  const demoMode = Boolean((user as any).isDevBypass);
  const { data: patientRows } = demoMode
    ? { data: [] }
    : await (supabase as any)
        .from('patients')
        .select('*, patient_cases(*)')
        .order('created_at', { ascending: false });

  if (!demoMode && !patientRows?.some((patient: any) => patient.id === id)) {
    return redirect('/patients');
  }

  return (
    <DashboardShell user={user}>
      <PatientWorkspace demoMode={demoMode} initialRows={patientRows || []} />
    </DashboardShell>
  );
}
