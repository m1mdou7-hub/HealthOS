export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/ui/DashboardShell';
import OrganizationWorkspace from '@/components/ui/OrganizationWorkspace';

export default async function ClinicsPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  return (
    <DashboardShell user={user}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight sm:text-2xl">
            Organization & User Management
          </h2>
          <p className="mt-1 text-zinc-400 text-sm">
            Configure multi-clinic locations, departments, user roles, permission matrices, shifts, HIPAA audits, and workspace branding.
          </p>
        </div>

        <OrganizationWorkspace />
      </div>
    </DashboardShell>
  );
}
