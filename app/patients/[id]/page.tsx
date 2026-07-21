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

  return (
    <DashboardShell user={user}>
      <PatientWorkspace />
    </DashboardShell>
  );
}
