import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/ui/DashboardShell';
import Copilot from '@/components/ai/Copilot';
import { Sparkles, BrainCircuit, HeartHandshake, ShieldAlert } from 'lucide-react';

export default async function AIAssistantPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  return (
    <DashboardShell user={user}>
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight sm:text-2xl flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" /> AI Clinical Assistant
            </h2>
            <p className="mt-1 text-zinc-400 text-sm">
              Formulate diagnostics summaries, synthesize lab outcomes, and query research papers.
            </p>
          </div>
        </div>

        {/* Info panel */}
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex gap-3 text-sm text-purple-300">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <p>
            <strong>Note:</strong> HealthOS AI is configured as a clinical decision support tool. It provides analytical guidance and synthesis of patient charts, but must be reviewed by a licensed medical professional before implementation.
          </p>
        </div>

        {/* Chat Area Placeholder */}
        <Copilot />
      </div>
    </DashboardShell>
  );
}
