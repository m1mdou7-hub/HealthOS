export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server';
import { getUser, getSubscription, getProducts } from '@/utils/supabase/queries';
import DashboardShell from '@/components/ui/DashboardShell';
import Pricing from '@/components/ui/Pricing/Pricing';

export default async function PricingPage() {
  const supabase = createClient();
  const [user, subscription, products] = await Promise.all([
    getUser(supabase),
    getSubscription(supabase),
    getProducts(supabase)
  ]);

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
            Pricing Plans & Subscriptions
          </h2>
          <p className="mt-1 text-zinc-400 text-sm">
            Choose the perfect plan for your healthcare workspace or update your existing subscription.
          </p>
        </div>

        <Pricing
          user={activeUser}
          products={products ?? []}
          subscription={subscription ?? null}
        />
      </div>
    </DashboardShell>
  );
}
