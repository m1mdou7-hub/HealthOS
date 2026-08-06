'use client';

// ---------------------------------------------------------------------------
// Adaptive Workspaces — intelligently resolve which workspaces and widgets a
// user should see based on their responsibilities, department, permission
// matrix and the organization's practice type.
//
//   • Solo / Small Clinic  → ONE consolidated intelligent workspace
//   • Multi-Specialty      → separate workspaces per department
//   • Multi-Branch         → full enterprise separation with oversight
// ---------------------------------------------------------------------------

import {
  WORKSPACES,
  resolveWorkspacesForUser,
  getWorkspaceById,
  hasPermission,
  type ModulePermissions,
  type WorkspaceId
} from './directory';
import type { ResponsibilityId } from './responsibilities';
import type { PracticeTypeId } from './practice';

export type WidgetId =
  | 'todays-patients'
  | 'todays-revenue'
  | 'appointments'
  | 'inventory-alerts'
  | 'ai-assistant'
  | 'tasks'
  | 'analytics'
  | 'owner-dashboard'
  | 'reception-queue'
  | 'lab-queue'
  | 'imaging-queue'
  | 'marketing-pulse'
  | 'hr-pulse'
  | 'quality-score'
  | 'documents';

export interface WidgetDefinition {
  id: WidgetId;
  name: string;
  description: string;
  workspace: WorkspaceId | 'unified';
  sizes: ('small' | 'medium' | 'large')[];
}

export const WIDGET_CATALOG: WidgetDefinition[] = [
  { id: 'todays-patients', name: "Today's Patients", description: 'Patients scheduled and checked in today.', workspace: 'doctor', sizes: ['small', 'medium'] },
  { id: 'todays-revenue', name: "Today's Revenue", description: 'Real-time revenue for the active day.', workspace: 'finance', sizes: ['small', 'medium', 'large'] },
  { id: 'appointments', name: 'Appointments', description: 'Upcoming appointments across the practice.', workspace: 'reception', sizes: ['small', 'medium', 'large'] },
  { id: 'inventory-alerts', name: 'Inventory Alerts', description: 'Low-stock and expiring inventory items.', workspace: 'inventory', sizes: ['small'] },
  { id: 'ai-assistant', name: 'AI Assistant', description: 'Clinical AI suggestions and diagnostics.', workspace: 'doctor', sizes: ['small', 'medium'] },
  { id: 'tasks', name: 'Tasks', description: 'Assigned tasks and follow-ups.', workspace: 'unified', sizes: ['small', 'medium'] },
  { id: 'analytics', name: 'Analytics', description: 'Business and clinical analytics.', workspace: 'quality', sizes: ['medium', 'large'] },
  { id: 'owner-dashboard', name: 'Owner Dashboard', description: 'Executive overview of the whole organization.', workspace: 'administration', sizes: ['large'] },
  { id: 'reception-queue', name: 'Reception Queue', description: 'Live front-desk patient queue.', workspace: 'reception', sizes: ['medium', 'large'] },
  { id: 'lab-queue', name: 'Lab Queue', description: 'Digital lab and manufacturing queue.', workspace: 'laboratory', sizes: ['medium', 'large'] },
  { id: 'imaging-queue', name: 'Imaging Queue', description: 'Pending CBCT and intraoral scans.', workspace: 'doctor', sizes: ['medium'] },
  { id: 'marketing-pulse', name: 'Marketing Pulse', description: 'Campaign and patient-acquisition metrics.', workspace: 'marketing', sizes: ['small', 'medium'] },
  { id: 'hr-pulse', name: 'HR Pulse', description: 'Staff, payroll and attendance overview.', workspace: 'hr', sizes: ['small', 'medium'] },
  { id: 'quality-score', name: 'Quality Score', description: 'Compliance and quality audit score.', workspace: 'quality', sizes: ['small'] },
  { id: 'documents', name: 'Documents', description: 'Recent documents and consent forms.', workspace: 'unified', sizes: ['small', 'medium'] }
];

export function getWidgetById(id: WidgetId): WidgetDefinition | undefined {
  return WIDGET_CATALOG.find((w) => w.id === id);
}

// ---------------------------------------------------------------------------
// Consolidated widgets shown in the single unified workspace of a solo / small
// practice — exactly the phase-4 brief: patients, revenue, appointments,
// inventory alerts, AI, tasks, analytics, owner dashboard, reception queue.
// ---------------------------------------------------------------------------

export const UNIFIED_WIDGETS: WidgetId[] = [
  'todays-patients',
  'todays-revenue',
  'appointments',
  'inventory-alerts',
  'ai-assistant',
  'tasks',
  'analytics',
  'owner-dashboard',
  'reception-queue'
];

// Widgets an individual responsibility can pull into its workspace.
export const WIDGETS_BY_RESPONSIBILITY: Record<ResponsibilityId, WidgetId[]> = {
  clinical: ['todays-patients', 'appointments', 'ai-assistant', 'imaging-queue', 'documents'],
  owner: ['owner-dashboard', 'todays-revenue', 'analytics', 'tasks', 'quality-score'],
  administration: ['owner-dashboard', 'tasks', 'documents', 'quality-score'],
  finance: ['todays-revenue', 'analytics', 'tasks'],
  inventory: ['inventory-alerts', 'tasks'],
  analytics: ['analytics', 'todays-revenue'],
  hr: ['hr-pulse', 'tasks'],
  marketing: ['marketing-pulse', 'tasks'],
  reception: ['reception-queue', 'appointments', 'todays-patients'],
  laboratory: ['lab-queue', 'inventory-alerts'],
  imaging: ['imaging-queue', 'todays-patients'],
  quality: ['quality-score', 'analytics', 'documents'],
  it: ['tasks', 'owner-dashboard']
};

export interface AdaptiveWorkspaceResult {
  /** True when the practice consolidates everything into one surface. */
  consolidated: boolean;
  /** Resolved workspace ids for this user. */
  workspaces: WorkspaceId[];
  /** Primary workspace id (falls back to first resolved). */
  primaryWorkspace: WorkspaceId | 'unified';
  /** Widget ids this user should see in their workspace(s). */
  widgets: WidgetId[];
}

export function resolveAdaptiveWorkspaces(args: {
  practiceTypeId?: PracticeTypeId;
  responsibilities?: ResponsibilityId[];
  departmentId?: Parameters<typeof resolveWorkspacesForUser>[0]['departmentId'];
  modulePermissions?: ModulePermissions;
}): AdaptiveWorkspaceResult {
  const { practiceTypeId, responsibilities = [], departmentId, modulePermissions } = args;

  const consolidated =
    practiceTypeId === 'solo' || practiceTypeId === 'small-clinic';

  // Base workspaces from department + permission matrix (existing engine).
  const baseWorkspaces = resolveWorkspacesForUser({ departmentId, modulePermissions });

  // Workspaces contributed by responsibilities.
  const responsibilityWorkspaces = new Set<WorkspaceId>();
  responsibilities.forEach((r) => {
    WIDGETS_BY_RESPONSIBILITY[r]?.forEach((widgetId) => {
      const def = getWidgetById(widgetId);
      if (def && def.workspace !== 'unified') {
        responsibilityWorkspaces.add(def.workspace as WorkspaceId);
      }
    });
  });

  let workspaces = Array.from(new Set([...baseWorkspaces, ...Array.from(responsibilityWorkspaces)]));
  // Consolidated practices: force the single unified surface, but keep the
  // underlying workspaces so navigation can still deep-link where needed.
  if (consolidated) {
    const preferred = ['doctor', 'reception', 'administration', 'finance'];
    const ordered = preferred.filter((w) => workspaces.includes(w as WorkspaceId)) as WorkspaceId[];
    const rest = workspaces.filter((w) => !preferred.includes(w));
    workspaces = [...ordered, ...rest];
    if (workspaces.length === 0) workspaces = ['doctor'];
  } else if (workspaces.length === 0) {
    workspaces = ['administration'];
  }

  // Widgets: unified for consolidated practices, otherwise per responsibility.
  let widgets: WidgetId[];
  if (consolidated) {
    widgets = [...UNIFIED_WIDGETS];
  } else {
    const seen = new Set<WidgetId>();
    responsibilities.forEach((r) => {
      WIDGETS_BY_RESPONSIBILITY[r]?.forEach((w) => seen.add(w));
    });
    // Ensure at least a useful default set.
    if (seen.size === 0) {
      ['todays-patients', 'appointments', 'tasks', 'analytics'].forEach((w) => seen.add(w as WidgetId));
    }
    widgets = Array.from(seen);
  }

  const primaryWorkspace = workspaces[0] ?? 'administration';

  return { consolidated, workspaces, primaryWorkspace, widgets };
}

export function resolveWorkspaceNav(args: {
  practiceTypeId?: PracticeTypeId;
  responsibilities?: ResponsibilityId[];
}): { consolidated: boolean; workspaceIds: WorkspaceId[] } {
  const { practiceTypeId, responsibilities = [] } = args;
  const consolidated = practiceTypeId === 'solo' || practiceTypeId === 'small-clinic';
  const workspaceIds = new Set<WorkspaceId>();
  responsibilities.forEach((r) => {
    WIDGETS_BY_RESPONSIBILITY[r]?.forEach((w) => {
      const def = getWidgetById(w);
      if (def && def.workspace !== 'unified') workspaceIds.add(def.workspace as WorkspaceId);
    });
  });
  const names = consolidated
    ? (['doctor', 'reception', 'administration'] as WorkspaceId[])
    : Array.from(workspaceIds);
  return { consolidated, workspaceIds: names.length ? names : (['doctor'] as WorkspaceId[]) };
}

export function isConsolidatedPractice(practiceTypeId?: PracticeTypeId): boolean {
  return practiceTypeId === 'solo' || practiceTypeId === 'small-clinic';
}

// Re-export for convenience in downstream UI.
export { WORKSPACES, getWorkspaceById, hasPermission };
