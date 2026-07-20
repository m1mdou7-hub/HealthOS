import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/ui/DashboardShell';
import BillingWorkspace from '@/components/ui/BillingWorkspace';

export default async function BillingPage() {
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
            Billing, Claims & Insurance Operations
          </h2>
          <p className="mt-1 text-zinc-400 text-sm">
            Configure patient invoices, handle ADA procedure code validations, submit claims, record cash/credit cards, and review financial reports.
          </p>
        </div>

        <BillingWorkspace />
      </div>
    </DashboardShell>
  );
}
