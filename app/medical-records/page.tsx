import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/ui/DashboardShell';
import EhrWorkspace from '@/components/ui/EhrWorkspace';
import { Shield } from 'lucide-react';

export default async function MedicalRecordsPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  return (
    <DashboardShell user={user}>
      <div className="space-y-6 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight sm:text-2xl">
              Electronic Health Records (EHR)
            </h2>
            <p className="mt-1 text-zinc-400 text-sm">
              Standardized clinician chart workspace with active optical telemetry & diagnostic viewports.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl font-mono">
            <Shield className="w-4 h-4" /> HIPAA ENCRYPTED TERMINAL
          </div>
        </div>

        {/* EHR Core Workspace */}
        <EhrWorkspace />

      </div>
    </DashboardShell>
  );
}
