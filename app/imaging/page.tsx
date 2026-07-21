export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/ui/DashboardShell';
import ImagingWorkspace from '@/components/ui/ImagingWorkspace';

export default async function ImagingPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  return (
    <DashboardShell user={user}>
      <div className="space-y-6 animate-fade-in">
        <ImagingWorkspace />
      </div>
    </DashboardShell>
  );
}
