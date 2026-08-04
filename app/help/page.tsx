export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { getTranslations } from 'next-intl/server';
import DashboardShell from '@/components/ui/DashboardShell';
import HelpWorkspace from '@/components/ui/HelpWorkspace';

export default async function HelpPage() {
  const supabase = createClient();
  const user = await getUser(supabase);
  const tHlp = await getTranslations('HelpWorkspace');

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
            {tHlp('headerTitle')}
          </h2>
          <p className="mt-1 text-zinc-400 text-sm">
            Access secure user guides, system release documentation, system status, and engineering SLA support tickets.
          </p>
        </div>

        <HelpWorkspace />
      </div>
    </DashboardShell>
  );
}
