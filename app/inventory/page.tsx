import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import DashboardShell from '@/components/ui/DashboardShell';
import InventoryWorkspace from '@/components/ui/InventoryWorkspace';

export default async function InventoryPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  // Fallback to high-fidelity operator user profile for development/preview
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
            Inventory & Procurement Operations
          </h2>
          <p className="mt-1 text-zinc-400 text-sm">
            Oversee pharmaceutical drug registrations, cold chain logistics, automated supplier reorders, and stock movement ledger audits.
          </p>
        </div>

        <InventoryWorkspace />
      </div>
    </DashboardShell>
  );
}
