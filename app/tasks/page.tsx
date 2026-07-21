export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import DashboardShell from '@/components/ui/DashboardShell';
import TasksWorkspace from '@/components/ui/TasksWorkspace';

export default async function TasksPage() {
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
            Productivity & Task Workspace
          </h2>
          <p className="mt-1 text-zinc-400 text-sm">
            Coordinate clinical procedures, assignments, Kanban try-ins, and timelines under secure audit tracking.
          </p>
        </div>

        <TasksWorkspace />
      </div>
    </DashboardShell>
  );
}
