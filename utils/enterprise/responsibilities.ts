'use client';

// ---------------------------------------------------------------------------
// Responsibilities — an additional layer above Job Titles.
// One user can hold multiple responsibilities. Responsibilities drive adaptive
// workspace resolution and navigation suggestions.
// ---------------------------------------------------------------------------

import type { DepartmentId, ModuleId, WorkspaceId } from './directory';

export type ResponsibilityId =
  | 'clinical'
  | 'owner'
  | 'administration'
  | 'finance'
  | 'inventory'
  | 'analytics'
  | 'hr'
  | 'marketing'
  | 'reception'
  | 'laboratory'
  | 'imaging'
  | 'quality'
  | 'it';

export interface Responsibility {
  id: ResponsibilityId;
  name: string;
  description: string;
  departments: DepartmentId[];
  workspaces: WorkspaceId[];
  primaryModule: ModuleId;
}

export const RESPONSIBILITIES: Responsibility[] = [
  {
    id: 'clinical',
    name: 'Clinical',
    description: 'Patient treatment, diagnosis and clinical documentation.',
    departments: ['dentistry', 'dermatology', 'aesthetic'],
    workspaces: ['doctor'],
    primaryModule: 'clinical'
  },
  {
    id: 'owner',
    name: 'Owner',
    description: 'Full ownership control across the entire organization.',
    departments: ['administration'],
    workspaces: ['administration', 'doctor', 'reception', 'finance', 'inventory'],
    primaryModule: 'settings'
  },
  {
    id: 'administration',
    name: 'Administration',
    description: 'Organization administration, settings and governance.',
    departments: ['administration', 'settings'],
    workspaces: ['administration'],
    primaryModule: 'settings'
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Billing, revenue tracking and financial operations.',
    departments: ['finance'],
    workspaces: ['finance'],
    primaryModule: 'billing'
  },
  {
    id: 'inventory',
    name: 'Inventory',
    description: 'Stock control, supplies and ordering.',
    departments: ['inventory'],
    workspaces: ['inventory'],
    primaryModule: 'inventory'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Business intelligence and operational analytics.',
    departments: ['analytics'],
    workspaces: ['quality'],
    primaryModule: 'analytics'
  },
  {
    id: 'hr',
    name: 'HR',
    description: 'Human resources, payroll and staff management.',
    departments: ['hr'],
    workspaces: ['hr'],
    primaryModule: 'hr'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Patient acquisition and marketing campaigns.',
    departments: ['marketing'],
    workspaces: ['marketing'],
    primaryModule: 'marketing'
  },
  {
    id: 'reception',
    name: 'Reception',
    description: 'Front desk, scheduling and patient intake.',
    departments: ['front-desk'],
    workspaces: ['reception'],
    primaryModule: 'appointments'
  },
  {
    id: 'laboratory',
    name: 'Laboratory',
    description: 'Digital lab, CAD/CAM and manufacturing workflows.',
    departments: ['laboratory'],
    workspaces: ['laboratory'],
    primaryModule: 'laboratory'
  },
  {
    id: 'imaging',
    name: 'Imaging',
    description: 'Radiology, CBCT and intraoral scanning.',
    departments: ['imaging'],
    workspaces: ['doctor'],
    primaryModule: 'imaging'
  },
  {
    id: 'quality',
    name: 'Quality',
    description: 'Quality assurance and compliance audits.',
    departments: ['quality'],
    workspaces: ['quality'],
    primaryModule: 'quality'
  },
  {
    id: 'it',
    name: 'IT',
    description: 'Systems administration and technical support.',
    departments: ['it'],
    workspaces: ['it'],
    primaryModule: 'settings'
  }
];

export function getResponsibility(id: ResponsibilityId): Responsibility {
  return RESPONSIBILITIES.find((r) => r.id === id) ?? RESPONSIBILITIES[0];
}

export function getResponsibilitiesByIds(ids: ResponsibilityId[]): Responsibility[] {
  return RESPONSIBILITIES.filter((r) => ids.includes(r.id));
}

export function isResponsibilityId(value: unknown): value is ResponsibilityId {
  return RESPONSIBILITIES.some((r) => r.id === value);
}
