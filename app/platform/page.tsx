export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { getTranslations } from 'next-intl/server';
import DashboardShell from '@/components/ui/DashboardShell';
import PlatformWorkspace from '@/components/ui/PlatformWorkspace';

export default async function PlatformPage() {
  const supabase = createClient();
  const user = await getUser(supabase);
  const tPlt = await getTranslations('PlatformWorkspace');

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
            {tPlt('headerTitle')}
          </h2>
          <p className="mt-1 text-zinc-400 text-sm">
            Administer global clinic tenants, seat allocations, subscriptions billing, global announcements, and core system telemetry variables.
          </p>
        </div>

        <PlatformWorkspace />
      </div>
    </DashboardShell>
  );
}
