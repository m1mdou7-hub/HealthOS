export const dynamic = 'force-dynamic';

import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/ui/DashboardShell';
import OperationalDashboard from '@/components/ui/Dashboard/OperationalDashboard';

export default async function HomePage() {
  const supabase = createClient();
  const loggedInUser = await getUser(supabase);

  if (!loggedInUser) {
    return redirect('/signin');
  }

  const demoMode = Boolean((loggedInUser as any).isDevBypass);

  return (
    <DashboardShell user={loggedInUser}>
      <OperationalDashboard demoMode={demoMode} />
    </DashboardShell>
  );
}
