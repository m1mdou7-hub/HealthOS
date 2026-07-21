export const dynamic = 'force-dynamic';
import CustomerPortalForm from '@/components/ui/AccountForms/CustomerPortalForm';
import EmailForm from '@/components/ui/AccountForms/EmailForm';
import NameForm from '@/components/ui/AccountForms/NameForm';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import {
  getUserDetails,
  getSubscription,
  getUser
} from '@/utils/supabase/queries';
import DashboardShell from '@/components/ui/DashboardShell';
import { ShieldAlert, CreditCard } from 'lucide-react';
import GlobalSettingsWorkspace from '@/components/ui/GlobalSettingsWorkspace';

export default async function SettingsPage() {
  const supabase = createClient();
  const [user, userDetails, subscription] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase),
    getSubscription(supabase)
  ]);

  if (!user) {
    return redirect('/signin');
  }

  // Wrap the database-backed server forms into a cohesive node
  const personalForms = (
    <div className="space-y-6">
      <CustomerPortalForm subscription={subscription} />
      <NameForm userName={userDetails?.full_name ?? ''} />
      <EmailForm userEmail={user.email} />
    </div>
  );

  return (
    <DashboardShell user={user}>
      <div className="space-y-6 animate-fade-in max-w-7xl">
        {/* Title */}
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight sm:text-2xl">
            Workspace Configuration Center
          </h2>
          <p className="mt-1 text-zinc-400 text-sm">
            Manage clinical departments, alert rule channels, API keys, and enterprise compliance metrics.
          </p>
        </div>

        {/* Master settings dashboard containing the forms & advanced workspaces */}
        <GlobalSettingsWorkspace personalForms={personalForms} />
      </div>
    </DashboardShell>
  );
}
