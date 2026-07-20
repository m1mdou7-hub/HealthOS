import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/ui/DashboardShell';
import DeveloperWorkspace from '@/components/ui/DeveloperWorkspace';

export default async function DeveloperPage() {
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
            Developer Console & Core APIs
          </h2>
          <p className="mt-1 text-zinc-400 text-sm">
            Access secure OAuth access keys, test REST API queries, manage real-time webhook subscriptions, and view system diagnostic latencies.
          </p>
        </div>

        <DeveloperWorkspace />
      </div>
    </DashboardShell>
  );
}
