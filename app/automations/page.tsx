import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/ui/DashboardShell';
import AutomationsWorkspace from '@/components/ui/AutomationsWorkspace';

export default async function AutomationsPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  const activeUser = user || {
    id: 'preview-user',
    email: 'm1mdou7@gmail.com',
    full_name: 'Dr. Ahmed'
  };

  return (
    <DashboardShell user={activeUser}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight sm:text-2xl">
            Workflow Automation Engine
          </h2>
          <p className="mt-1 text-zinc-400 text-sm">
            Configure server-authoritative trigger-action macros to handle transactional clinical and SCM processes automatically.
          </p>
        </div>

        <AutomationsWorkspace />
      </div>
    </DashboardShell>
  );
}
