export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { getTranslations } from 'next-intl/server';
import DashboardShell from '@/components/ui/DashboardShell';
import CommunicationWorkspace from '@/components/ui/CommunicationWorkspace';

export default async function CommunicationPage() {
  const supabase = createClient();
  const user = await getUser(supabase);
  const tCom = await getTranslations('CommunicationWorkspace');

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
            {tCom('headerTitle')}
          </h2>
          <p className="mt-1 text-zinc-400 text-sm">
            Access secure HIPAA-compliant instant chats, patient SMS campaigns, WhatsApp channels, voice tele-health consultations, and team broadcasts.
          </p>
        </div>

        <CommunicationWorkspace />
      </div>
    </DashboardShell>
  );
}
