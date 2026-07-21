export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/ui/DashboardShell';
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
        <div className="h-96 rounded-2xl border border-zinc-800 bg-zinc-900/50 flex flex-col justify-between overflow-hidden">
          {/* Output area */}
          <div className="flex-1 p-6 flex flex-col justify-center items-center text-center space-y-4">
            <div className="p-4 bg-purple-500/15 text-purple-400 rounded-2xl">
              <BrainCircuit className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">HealthOS Clinical Assistant Online</h3>
              <p className="text-xs text-zinc-500 max-w-sm">
                Ask a question like: &quot;Summarize Patient Carter&apos;s latest hematology panel,&quot; or &quot;Outline potential drug interactions for metformin.&quot;
              </p>
            </div>
          </div>

          {/* Input field */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-950/40">
            <div className="relative">
              <input
                type="text"
                disabled
                placeholder="AI Workspace is locked for build simulation. Assistant prompts require model configuration..."
                className="w-full pl-4 pr-12 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 placeholder-zinc-600 text-sm focus:outline-none"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-zinc-800 text-zinc-600 cursor-not-allowed">
                <HeartHandshake className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
