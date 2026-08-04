export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import DashboardShell from '@/components/ui/DashboardShell';
import IntegrationsWorkspace from '@/components/ui/IntegrationsWorkspace';

export default async function IntegrationsPage() {
  const supabase = createClient();
  const user = await getUser(supabase);
  const tInt = await getTranslations('IntegrationsWorkspace');

  const activeUser = user || {
    id: 'preview-user',
    email: 'm1mdou7@gmail.com',
    full_name: 'Dr. Ahmed'
  };

  return (
    <DashboardShell user={activeUser}>
      <div className="space-y-6 animate-fade-in font-sans">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight sm:text-2xl font-sans">
            {tInt('headerTitle')}
          </h2>
          <p className="mt-1 text-zinc-400 text-sm">
            Sync clinical diagnostic imaging, EHR systems, pharmacy hubs, and billing processors via native API webhooks.
          </p>
        </div>

        <IntegrationsWorkspace />
      </div>
    </DashboardShell>
  );
}
