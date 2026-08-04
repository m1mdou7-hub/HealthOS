export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import DashboardShell from '@/components/ui/DashboardShell';
import LaboratoryWorkspace from '@/components/ui/LaboratoryWorkspace';

export default async function LaboratoryPage() {
  const supabase = createClient();
  const user = await getUser(supabase);
  const tLab = await getTranslations('LaboratoryWorkspace');

  if (!user) {
    return redirect('/signin');
  }

  return (
    <DashboardShell user={user}>
      <div className="space-y-6 animate-fade-in font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-sans">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight sm:text-2xl font-sans">
              {tLab('headerTitle')}
            </h2>
            <p className="mt-1 text-zinc-400 text-sm font-sans">
              Manage digital CAD/CAM dental restorations, monitor 3D milling tools, and configure multi-layer restorations.
            </p>
          </div>
        </div>

        {/* Real-time CAD/CAM Module Terminal */}
        <LaboratoryWorkspace />
      </div>
    </DashboardShell>
  );
}
