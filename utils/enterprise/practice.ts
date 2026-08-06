'use client';

// ---------------------------------------------------------------------------
// Adaptive Workspace Architecture — Practice Types & Organization Profile.
// Phase 1: First Run Setup Wizard foundation. Practice templates for Phase 2
// are expressed as static suggestions on each type so everything stays data
// driven and editable later.
// ---------------------------------------------------------------------------

import type { DepartmentId, WorkspaceId } from './directory';
import type { ResponsibilityId } from './responsibilities';

export type PracticeTypeId =
  | 'solo'
  | 'small-clinic'
  | 'multi-specialty'
  | 'multi-branch';

// Navigation label keys — mirror the "Navigation" i18n namespace in DashboardShell.
export type NavKey =
  | 'dashboard'
  | 'patients'
  | 'clinics'
  | 'appointments'
  | 'medicalRecords'
  | 'aiAssistant'
  | 'laboratory'
  | 'imaging'
  | 'inventory'
  | 'analytics'
  | 'billing'
  | 'pricing'
  | 'communication'
  | 'documents'
  | 'tasks'
  | 'notifications'
  | 'audit'
  | 'platform'
  | 'integrations'
  | 'automations'
  | 'developer'
  | 'help'
  | 'settings';

export interface PracticeType {
  id: PracticeTypeId;
  name: string;
  tagline: string;
  description: string;
  sizeLabel: string;
  seatRange: string;
  branchRange: string;
  suggestedDepartments: DepartmentId[];
  suggestedWorkspaces: WorkspaceId[];
  suggestedResponsibilities: ResponsibilityId[];
  suggestedNavigation: NavKey[];
  defaultPermissionTemplateIds: string[];
}

export const PRACTICE_TYPES: PracticeType[] = [
  {
    id: 'solo',
    name: 'Solo Practice',
    tagline: 'One provider, complete control',
    description:
      'A single-doctor practice with minimal staff. One unified workspace surfaces every widget — patients, revenue, inventory, AI and tasks — in one intelligent screen.',
    sizeLabel: '1 provider',
    seatRange: '1–3 seats',
    branchRange: '1 location',
    suggestedDepartments: ['administration', 'dentistry', 'front-desk'],
    suggestedWorkspaces: ['doctor', 'reception', 'administration'],
    suggestedResponsibilities: ['owner', 'clinical', 'reception'],
    suggestedNavigation: ['dashboard', 'patients', 'clinics', 'appointments', 'medicalRecords', 'aiAssistant', 'billing', 'inventory', 'analytics', 'tasks', 'settings'],
    defaultPermissionTemplateIds: ['owner', 'doctor', 'receptionist']
  },
  {
    id: 'small-clinic',
    name: 'Small Clinic',
    tagline: 'A focused team, a shared workspace',
    description:
      '2–5 providers with a small support crew. Departments and permissions auto-suggest a lean but complete layout that stays fully editable.',
    sizeLabel: '2–5 providers',
    seatRange: '4–12 seats',
    branchRange: '1 location',
    suggestedDepartments: ['administration', 'dentistry', 'dermatology', 'front-desk', 'finance', 'inventory'],
    suggestedWorkspaces: ['doctor', 'reception', 'finance', 'inventory', 'administration'],
    suggestedResponsibilities: ['owner', 'clinical', 'reception', 'finance', 'inventory', 'administration'],
    suggestedNavigation: ['dashboard', 'patients', 'clinics', 'appointments', 'medicalRecords', 'aiAssistant', 'laboratory', 'imaging', 'inventory', 'analytics', 'billing', 'communication', 'tasks', 'settings'],
    defaultPermissionTemplateIds: ['owner', 'admin', 'doctor', 'receptionist', 'assistant']
  },
  {
    id: 'multi-specialty',
    name: 'Multi-Specialty Clinic',
    tagline: 'Separate workspaces per specialty',
    description:
      'Multiple specialties under one roof. Workspaces automatically separate by department — dentistry, dermatology, laboratory and imaging each get their own focused surface.',
    sizeLabel: '6–20 providers',
    seatRange: '15–60 seats',
    branchRange: '1–3 locations',
    suggestedDepartments: ['administration', 'dentistry', 'dermatology', 'aesthetic', 'laboratory', 'imaging', 'inventory', 'front-desk', 'finance', 'hr', 'marketing', 'quality'],
    suggestedWorkspaces: ['doctor', 'reception', 'laboratory', 'finance', 'inventory', 'marketing', 'hr', 'administration'],
    suggestedResponsibilities: ['owner', 'clinical', 'laboratory', 'imaging', 'reception', 'finance', 'inventory', 'hr', 'marketing', 'administration', 'quality'],
    suggestedNavigation: ['dashboard', 'patients', 'clinics', 'appointments', 'medicalRecords', 'aiAssistant', 'laboratory', 'imaging', 'inventory', 'analytics', 'billing', 'communication', 'documents', 'tasks', 'audit', 'settings'],
    defaultPermissionTemplateIds: ['owner', 'admin', 'doctor', 'lab-technician', 'receptionist', 'assistant', 'manager', 'auditor']
  },
  {
    id: 'multi-branch',
    name: 'Multi-Branch Organization',
    tagline: 'Enterprise governance across branches',
    description:
      'A full enterprise organization spanning multiple branches and specialties. Departments, responsibilities and permissions separate cleanly per branch while leadership keeps organization-wide oversight.',
    sizeLabel: '20+ providers',
    seatRange: '60+ seats',
    branchRange: '3+ locations',
    suggestedDepartments: ['administration', 'hr', 'finance', 'dentistry', 'dermatology', 'aesthetic', 'laboratory', 'imaging', 'inventory', 'marketing', 'it', 'quality', 'analytics', 'front-desk', 'ai'],
    suggestedWorkspaces: ['administration', 'doctor', 'reception', 'laboratory', 'finance', 'inventory', 'hr', 'marketing', 'it', 'quality'],
    suggestedResponsibilities: ['owner', 'clinical', 'laboratory', 'imaging', 'reception', 'finance', 'inventory', 'hr', 'marketing', 'administration', 'quality', 'it', 'analytics'],
    suggestedNavigation: ['dashboard', 'patients', 'clinics', 'appointments', 'medicalRecords', 'aiAssistant', 'laboratory', 'imaging', 'inventory', 'analytics', 'billing', 'communication', 'documents', 'tasks', 'notifications', 'audit', 'platform', 'integrations', 'automations', 'developer', 'settings'],
    defaultPermissionTemplateIds: ['owner', 'admin', 'doctor', 'lab-technician', 'receptionist', 'assistant', 'manager', 'auditor']
  }
];

export function getPracticeType(id: PracticeTypeId): PracticeType {
  return PRACTICE_TYPES.find((p) => p.id === id) ?? PRACTICE_TYPES[0];
}

export function getPracticeTypeById(id?: string): PracticeType | undefined {
  return PRACTICE_TYPES.find((p) => p.id === id);
}

export function isPracticeTypeId(value: unknown): value is PracticeTypeId {
  return PRACTICE_TYPES.some((p) => p.id === value);
}

export interface OrganizationProfile {
  practiceTypeId: PracticeTypeId;
  organizationName: string;
  branchName: string;
  timezone: string;
  primaryLanguage: string;
  seats: string;
  branches: string;
  setupComplete: boolean;
  createdAt: string;
}

const ORG_PROFILE_KEY = 'healthos_org_profile';
const IS_BROWSER = typeof window !== 'undefined';

export function getOrganizationProfile(): OrganizationProfile | null {
  if (!IS_BROWSER) return null;
  const saved = localStorage.getItem(ORG_PROFILE_KEY);
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved) as OrganizationProfile;
    if (!parsed || !isPracticeTypeId(parsed.practiceTypeId)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveOrganizationProfile(
  profile: OrganizationProfile
): OrganizationProfile {
  if (!IS_BROWSER) return profile;
  localStorage.setItem(ORG_PROFILE_KEY, JSON.stringify(profile));
  window.dispatchEvent(
    new CustomEvent('healthos_state_change', {
      detail: { type: 'org-profile', value: profile }
    })
  );
  return profile;
}

export function resetOrganizationProfile(): void {
  if (!IS_BROWSER) return;
  localStorage.removeItem(ORG_PROFILE_KEY);
  window.dispatchEvent(
    new CustomEvent('healthos_state_change', {
      detail: { type: 'org-profile', value: null }
    })
  );
}

export function isFirstRun(): boolean {
  return !getOrganizationProfile()?.setupComplete;
}

// ---------------------------------------------------------------------------
// Practice Template — the applied, editable configuration derived from a
// practice type. Templates are only starting points: every field is stored and
// can be overridden later from the Organization Workspace.
// ---------------------------------------------------------------------------

export interface PracticeTemplate {
  practiceTypeId: PracticeTypeId;
  departments: DepartmentId[];
  workspaces: WorkspaceId[];
  responsibilities: ResponsibilityId[];
  navigation: NavKey[];
  permissionTemplateIds: string[];
  source: 'suggested' | 'custom';
}

const PRACTICE_TEMPLATE_KEY = 'healthos_practice_template';

export function buildPracticeTemplate(
  practiceTypeId: PracticeTypeId
): PracticeTemplate {
  const p = getPracticeType(practiceTypeId);
  return {
    practiceTypeId,
    departments: [...p.suggestedDepartments],
    workspaces: [...p.suggestedWorkspaces],
    responsibilities: [...p.suggestedResponsibilities],
    navigation: [...p.suggestedNavigation],
    permissionTemplateIds: [...p.defaultPermissionTemplateIds],
    source: 'suggested'
  };
}

export function getPracticeTemplate(): PracticeTemplate | null {
  const profile = getOrganizationProfile();
  if (!profile) return null;
  if (!IS_BROWSER) return null;
  const saved = localStorage.getItem(PRACTICE_TEMPLATE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as PracticeTemplate;
      if (parsed && parsed.practiceTypeId === profile.practiceTypeId) return parsed;
    } catch {
      /* fall through to rebuild */
    }
  }
  const built = buildPracticeTemplate(profile.practiceTypeId);
  localStorage.setItem(PRACTICE_TEMPLATE_KEY, JSON.stringify(built));
  return built;
}

export function savePracticeTemplate(template: PracticeTemplate): PracticeTemplate {
  if (!IS_BROWSER) return template;
  localStorage.setItem(PRACTICE_TEMPLATE_KEY, JSON.stringify(template));
  window.dispatchEvent(
    new CustomEvent('healthos_state_change', {
      detail: { type: 'practice-template', value: template }
    })
  );
  return template;
}

export function resetPracticeTemplate(): PracticeTemplate {
  const profile = getOrganizationProfile();
  const built = buildPracticeTemplate(profile?.practiceTypeId ?? 'small-clinic');
  return savePracticeTemplate(built);
}
