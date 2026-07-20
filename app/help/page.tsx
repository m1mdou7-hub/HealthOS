import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import DashboardShell from '@/components/ui/DashboardShell';
import HelpWorkspace from '@/components/ui/HelpWorkspace';

export default async function HelpPage() {
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
            HealthOS Assistance & Help Center
          </h2>
          <p className="mt-1 text-zinc-400 text-sm">
            Access secure user guides, system release documentation, system status, and engineering SLA support tickets.
          </p>
        </div>

        <HelpWorkspace />
      </div>
    </DashboardShell>
  );
}
