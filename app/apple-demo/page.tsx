export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/ui/DashboardShell';
import AppleDemoWorkspace from '@/components/ui/AppleDemoWorkspace';

export default async function AppleDemoPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  // If no user is logged in, and we are not bypassing, redirect to signin
  const demoMode = process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true';
  
  if (!user && !demoMode) {
    return redirect('/signin');
  }

  const activeUser = user || {
    id: 'preview-user',
    email: 'm1mdou7@gmail.com',
    full_name: 'Dr. Ahmed',
    isDevBypass: true
  };

  return (
    <DashboardShell user={activeUser}>
      <AppleDemoWorkspace />
    </DashboardShell>
  );
}
