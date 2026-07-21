export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import DashboardShell from '@/components/ui/DashboardShell';
import DocumentWorkspace from '@/components/ui/DocumentWorkspace';

export default async function DocumentsPage() {
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
            Enterprise Document Management System
          </h2>
          <p className="mt-1 text-zinc-400 text-sm">
            Access secure encrypted patient charts, electronic consents, insurance pre-authorizations, clinical photos, and 3D STL scans.
          </p>
        </div>

        <DocumentWorkspace />
      </div>
    </DashboardShell>
  );
}
