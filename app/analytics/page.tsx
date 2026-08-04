export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import DashboardShell from '@/components/ui/DashboardShell';
import AnalyticsWorkspace from '@/components/ui/AnalyticsWorkspace';

export default async function AnalyticsPage() {
  const supabase = createClient();
  const user = await getUser(supabase);
  const tAna = await getTranslations('AnalyticsWorkspace');

  if (!user) {
    return redirect('/signin');
  }

  return (
    <DashboardShell user={user}>
      <div className="space-y-6 animate-fade-in font-sans">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight sm:text-2xl font-sans">
            {tAna('headerTitle')}
          </h2>
          <p className="mt-1 text-zinc-400 text-sm">
            Consolidated overview of clinical throughput, chair occupancy rates, and clinician load telemetry.
          </p>
        </div>

        {/* Operational Analytics Workspace */}
        <AnalyticsWorkspace />
      </div>
    </DashboardShell>
  );
}
