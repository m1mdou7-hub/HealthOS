export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/ui/DashboardShell';
import { AmbientGlow } from '@/components/ui/design-system';
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
            <div className="flex items-center gap-2">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accent-glow2)', color: 'var(--accent)', border: '1px solid var(--border-strong)', boxShadow: '0 0 24px var(--accent-glow2)' }}>
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="section-title text-xl sm:text-2xl">AI Clinical Assistant</h2>
            </div>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              Formulate diagnostics summaries, synthesize lab outcomes, and query research papers.
            </p>
          </div>
        </div>

        {/* Info panel */}
        <div className="p-4 rounded-2xl card-elevated border flex gap-3 text-sm" style={{ color: 'var(--text-sub)', borderColor: 'var(--border-strong)' }}>
          <ShieldAlert className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--warning)' }} />
          <p>
            <strong style={{ color: 'var(--text)' }}>Note:</strong> HealthOS AI is configured as a clinical decision support tool. It provides analytical guidance and synthesis of patient charts, but must be reviewed by a licensed medical professional before implementation.
          </p>
        </div>

        {/* Chat Area Placeholder */}
        <div className="h-96 rounded-3xl card-gradient flex flex-col justify-between overflow-hidden relative">
          <AmbientGlow className="-top-20 -end-24 w-72 h-72 opacity-60" />
          <AmbientGlow className="bottom-[-6rem] -start-20 w-80 h-80 opacity-40 pulse-glow" />
          {/* Output area */}
          <div className="relative flex-1 p-6 flex flex-col justify-center items-center text-center space-y-4">
            <div className="p-4 rounded-3xl flex items-center justify-center" style={{ background: 'var(--accent-glow2)', color: 'var(--accent)', border: '1px solid var(--border-strong)', boxShadow: '0 0 32px var(--accent-glow2)' }}>
              <BrainCircuit className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="section-title text-base">HealthOS Clinical Assistant Online</h3>
              <p className="text-xs max-w-sm" style={{ color: 'var(--text-muted)' }}>
                Ask a question like: &quot;Summarize Patient Carter&apos;s latest hematology panel,&quot; or &quot;Outline potential drug interactions for metformin.&quot;
              </p>
            </div>
          </div>

          {/* Input field */}
          <div className="relative p-4" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="relative">
              <input
                type="text"
                disabled
                placeholder="AI Workspace is locked for build simulation. Assistant prompts require model configuration..."
                className="w-full pl-4 pr-12 py-3 rounded-xl text-sm"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg btn-secondary opacity-50 cursor-not-allowed" style={{ color: 'var(--text-muted)' }}>
                <HeartHandshake className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
