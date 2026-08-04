export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import DashboardShell from '@/components/ui/DashboardShell';
import DeveloperWorkspace from '@/components/ui/DeveloperWorkspace';

export default async function DeveloperPage() {
  const supabase = createClient();
  const user = await getUser(supabase);
  const tDev = await getTranslations('DeveloperWorkspace');

  const activeUser = user || {
    id: 'preview-user',
    email: 'm1mdou7@gmail.com',
    full_name: 'Dr. Ahmed'
  };

  return (
    <DashboardShell user={activeUser}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight sm:text-2xl font-sans">
            {tDev('headerTitle')}
          </h2>
          <p className="mt-1 text-zinc-400 text-sm font-sans">
            Access secure OAuth access keys, test REST API queries, manage real-time webhook subscriptions, and view system diagnostic latencies.
          </p>
        </div>

        <DeveloperWorkspace />
      </div>
    </DashboardShell>
  );
}
