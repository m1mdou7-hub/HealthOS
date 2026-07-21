export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import DashboardShell from '@/components/ui/DashboardShell';
import AuditWorkspace from '@/components/ui/AuditWorkspace';

export default async function AuditPage() {
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
            Audit & Compliance Console
          </h2>
          <p className="mt-1 text-zinc-400 text-sm">
            Monitor real-time security events, immutable access logs, user privilege matrices, and HIPAA/GDPR checklists under automatic telemetry tracking.
          </p>
        </div>

        <AuditWorkspace />
      </div>
    </DashboardShell>
  );
}
