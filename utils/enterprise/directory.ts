'use client';

import type { PracticeTypeId } from './practice';
import type { ResponsibilityId } from './responsibilities';

export type DepartmentId =
  | 'administration'
  | 'hr'
  | 'finance'
  | 'front-desk'
  | 'dentistry'
  | 'dermatology'
  | 'aesthetic'
  | 'laboratory'
  | 'imaging'
  | 'inventory'
  | 'marketing'
  | 'it'
  | 'quality'
  | 'analytics'
  | 'ai'
  | 'settings';

export interface Department {
  id: DepartmentId;
  name: string;
  code: string;
}

export const DEPARTMENTS: Department[] = [
  { id: 'administration', name: 'Administration', code: 'ADM' },
  { id: 'hr', name: 'Human Resources', code: 'HR' },
  { id: 'finance', name: 'Finance', code: 'FIN' },
  { id: 'front-desk', name: 'Front Desk', code: 'FDK' },
  { id: 'dentistry', name: 'Dentistry', code: 'DEN' },
  { id: 'dermatology', name: 'Dermatology', code: 'DER' },
  { id: 'aesthetic', name: 'Aesthetic Medicine', code: 'AES' },
  { id: 'laboratory', name: 'Laboratory', code: 'LAB' },
  { id: 'imaging', name: 'Imaging', code: 'IMG' },
  { id: 'inventory', name: 'Inventory', code: 'INV' },
  { id: 'marketing', name: 'Marketing', code: 'MKT' },
  { id: 'it', name: 'IT', code: 'IT' },
  { id: 'quality', name: 'Quality & Compliance', code: 'QA' },
  { id: 'analytics', name: 'Analytics', code: 'ANA' },
  { id: 'ai', name: 'AI', code: 'AI' },
  { id: 'settings', name: 'Settings', code: 'SET' }
];

export interface Specialty {
  id: string;
  name: string;
  department: DepartmentId;
}

export const SPECIALTIES: Specialty[] = [
  { id: 'general-dentistry', name: 'General Dentistry', department: 'dentistry' },
  { id: 'prosthodontics', name: 'Prosthodontics', department: 'dentistry' },
  { id: 'implantology', name: 'Implantology', department: 'dentistry' },
  { id: 'orthodontics', name: 'Orthodontics', department: 'dentistry' },
  { id: 'endodontics', name: 'Endodontics', department: 'dentistry' },
  { id: 'periodontics', name: 'Periodontics', department: 'dentistry' },
  { id: 'oral-surgery', name: 'Oral Surgery', department: 'dentistry' },
  { id: 'pediatric-dentistry', name: 'Pediatric Dentistry', department: 'dentistry' },
  { id: 'oral-medicine', name: 'Oral Medicine', department: 'dentistry' },
  { id: 'oral-radiology', name: 'Oral Radiology', department: 'dentistry' },

  { id: 'cosmetic-physician', name: 'Cosmetic Physician', department: 'aesthetic' },
  { id: 'injector-specialist', name: 'Injector Specialist', department: 'aesthetic' },
  { id: 'botox-specialist', name: 'Botox Specialist', department: 'aesthetic' },
  { id: 'dermal-filler', name: 'Dermal Filler Specialist', department: 'aesthetic' },
  { id: 'prp-specialist', name: 'PRP Specialist', department: 'aesthetic' },
  { id: 'hair-restoration', name: 'Hair Restoration Specialist', department: 'aesthetic' },
  { id: 'body-contouring', name: 'Body Contouring Specialist', department: 'aesthetic' },

  { id: 'dermatologist', name: 'Dermatologist', department: 'dermatology' },
  { id: 'cosmetic-dermatologist', name: 'Cosmetic Dermatologist', department: 'dermatology' },
  { id: 'laser-specialist', name: 'Laser Specialist', department: 'dermatology' },
  { id: 'skin-therapist', name: 'Skin Therapist', department: 'dermatology' },

  { id: 'lab-manager', name: 'Laboratory Manager', department: 'laboratory' },
  { id: 'lab-technician', name: 'Laboratory Technician', department: 'laboratory' },
  { id: 'cadcam-designer', name: 'CAD/CAM Designer', department: 'laboratory' },
  { id: 'digital-smile-designer', name: 'Digital Smile Designer', department: 'laboratory' },
  { id: 'ceramic-technician', name: 'Ceramic Technician', department: 'laboratory' },
  { id: '3d-printing', name: '3D Printing Specialist', department: 'laboratory' },

  { id: 'radiology-technician', name: 'Radiology Technician', department: 'imaging' },
  { id: 'cbct-technician', name: 'CBCT Technician', department: 'imaging' },
  { id: 'intraoral-scanner', name: 'Intraoral Scanner Specialist', department: 'imaging' },
  { id: 'clinical-photographer', name: 'Clinical Photographer', department: 'imaging' },

  { id: 'finance-manager', name: 'Finance Manager', department: 'finance' },
  { id: 'accountant', name: 'Accountant', department: 'finance' },
  { id: 'cashier', name: 'Cashier', department: 'finance' },
  { id: 'insurance-coordinator', name: 'Insurance Coordinator', department: 'finance' },

  { id: 'hr-manager', name: 'HR Manager', department: 'hr' },
  { id: 'hr-officer', name: 'HR Officer', department: 'hr' },
  { id: 'recruiter', name: 'Recruiter', department: 'hr' },
  { id: 'payroll-officer', name: 'Payroll Officer', department: 'hr' },

  { id: 'receptionist', name: 'Receptionist', department: 'front-desk' },
  { id: 'call-center', name: 'Call Center', department: 'front-desk' },
  { id: 'patient-coordinator', name: 'Patient Coordinator', department: 'front-desk' },
  { id: 'treatment-coordinator', name: 'Treatment Coordinator', department: 'front-desk' },
  { id: 'vip-coordinator', name: 'VIP Coordinator', department: 'front-desk' },

  { id: 'it-admin', name: 'IT Administrator', department: 'it' },
  { id: 'system-admin', name: 'System Administrator', department: 'it' },

  { id: 'quality-manager', name: 'Quality Manager', department: 'quality' },
  { id: 'compliance-officer', name: 'Compliance Officer', department: 'quality' },
  { id: 'internal-auditor', name: 'Internal Auditor', department: 'quality' },
  { id: 'read-only-auditor', name: 'Read-only Auditor', department: 'quality' }
];

export function getSpecialtiesByDepartment(departmentId: DepartmentId): Specialty[] {
  return SPECIALTIES.filter((s) => s.department === departmentId);
}

export const EMPLOYMENT_TYPES = [
  'Full Time',
  'Part Time',
  'Consultant',
  'Visiting Doctor',
  'Intern'
] as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const EMPLOYMENT_STATUSES = [
  'Active',
  'Vacation',
  'On Leave',
  'Suspended',
  'Resigned'
] as const;

export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number];

export type ModuleId =
  | 'dashboard'
  | 'patients'
  | 'appointments'
  | 'clinical'
  | 'imaging'
  | 'laboratory'
  | 'inventory'
  | 'billing'
  | 'hr'
  | 'marketing'
  | 'analytics'
  | 'ai'
  | 'communication'
  | 'documents'
  | 'tasks'
  | 'quality'
  | 'settings';

export interface ModuleDefinition {
  id: ModuleId;
  name: string;
}

export const PERMISSION_MODULES: ModuleDefinition[] = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'patients', name: 'Patients' },
  { id: 'appointments', name: 'Appointments' },
  { id: 'clinical', name: 'Clinical Records' },
  { id: 'imaging', name: 'Imaging' },
  { id: 'laboratory', name: 'Laboratory' },
  { id: 'inventory', name: 'Inventory' },
  { id: 'billing', name: 'Billing & Finance' },
  { id: 'hr', name: 'Human Resources' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'analytics', name: 'Analytics' },
  { id: 'ai', name: 'AI Assistant' },
  { id: 'communication', name: 'Communication' },
  { id: 'documents', name: 'Documents' },
  { id: 'tasks', name: 'Tasks' },
  { id: 'quality', name: 'Quality & Compliance' },
  { id: 'settings', name: 'System Settings' }
];

export const PERMISSION_ACTIONS = [
  'view',
  'create',
  'edit',
  'delete',
  'approve',
  'export',
  'manage'
] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export const FULL_ACTIONS: PermissionAction[] = [...PERMISSION_ACTIONS];
export const STANDARD_ACTIONS: PermissionAction[] = ['view', 'create', 'edit', 'export'];
export const VIEW_ONLY_ACTIONS: PermissionAction[] = ['view'];
export const READ_EXPORT_ACTIONS: PermissionAction[] = ['view', 'export'];

export type ModulePermissions = Partial<Record<ModuleId, PermissionAction[]>>;

export type AccessScopeType =
  | 'organization'
  | 'branch'
  | 'department'
  | 'doctor'
  | 'patients'
  | 'clinics';

export const ACCESS_SCOPES: { type: AccessScopeType; name: string }[] = [
  { type: 'organization', name: 'Entire Organization' },
  { type: 'branch', name: 'Specific Branch' },
  { type: 'department', name: 'Specific Department' },
  { type: 'doctor', name: 'Specific Doctor' },
  { type: 'patients', name: 'Specific Patients' },
  { type: 'clinics', name: 'Specific Clinics' }
];

export type PermissionTemplateCategory =
  | 'general'
  | 'department'
  | 'practice'
  | 'responsibility';

export interface PermissionTemplateHistoryEntry {
  version: number;
  timestamp: string;
  actor: string;
  action: string;
  note?: string;
}

export interface PermissionTemplate {
  id: string;
  name: string;
  description: string;
  modulePermissions: ModulePermissions;
  scope: AccessScopeType;
  category?: PermissionTemplateCategory;
  departmentIds?: DepartmentId[];
  practiceTypeIds?: PracticeTypeId[];
  responsibilityIds?: ResponsibilityId[];
  archived?: boolean;
  isDefault?: boolean;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
  history?: PermissionTemplateHistoryEntry[];
}

export const DEFAULT_PERMISSION_TEMPLATES: PermissionTemplate[] = [
  {
    id: 'owner',
    name: 'Super Admin',
    description: 'Full organizational control across every module.',
    modulePermissions: Object.fromEntries(
      PERMISSION_MODULES.map((m) => [m.id, [...FULL_ACTIONS]])
    ) as ModulePermissions,
    scope: 'organization'
  },
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Manages administration, finance, staff and settings; clinical view only.',
    modulePermissions: {
      dashboard: FULL_ACTIONS,
      patients: READ_EXPORT_ACTIONS,
      appointments: READ_EXPORT_ACTIONS,
      clinical: VIEW_ONLY_ACTIONS,
      imaging: VIEW_ONLY_ACTIONS,
      laboratory: VIEW_ONLY_ACTIONS,
      inventory: ['view', 'create', 'edit', 'export'],
      billing: FULL_ACTIONS,
      hr: FULL_ACTIONS,
      marketing: FULL_ACTIONS,
      analytics: ['view', 'export', 'manage'],
      ai: ['view', 'manage'],
      communication: FULL_ACTIONS,
      documents: ['view', 'create', 'edit', 'delete', 'manage'],
      tasks: FULL_ACTIONS,
      quality: ['view', 'approve', 'export', 'manage'],
      settings: FULL_ACTIONS
    },
    scope: 'organization'
  },
  {
    id: 'doctor',
    name: 'Clinician',
    description: 'Full clinical workflow for treating providers.',
    modulePermissions: {
      dashboard: VIEW_ONLY_ACTIONS,
      patients: ['view', 'create', 'edit', 'approve'],
      appointments: ['view', 'create', 'edit', 'approve'],
      clinical: ['view', 'create', 'edit', 'approve'],
      imaging: ['view', 'create', 'edit'],
      laboratory: ['view', 'create', 'approve'],
      inventory: VIEW_ONLY_ACTIONS,
      billing: VIEW_ONLY_ACTIONS,
      ai: ['view', 'create'],
      communication: ['view', 'create'],
      documents: ['view', 'create'],
      tasks: ['view', 'create'],
      quality: VIEW_ONLY_ACTIONS
    },
    scope: 'department'
  },
  {
    id: 'lab-technician',
    name: 'Laboratory Technician',
    description: 'Digital lab CAD/CAM design, manufacturing and imaging workflows.',
    modulePermissions: {
      dashboard: VIEW_ONLY_ACTIONS,
      patients: VIEW_ONLY_ACTIONS,
      clinical: VIEW_ONLY_ACTIONS,
      imaging: ['view', 'create', 'edit'],
      laboratory: ['view', 'create', 'edit', 'approve'],
      inventory: ['view', 'create', 'edit'],
      communication: ['view', 'create'],
      documents: ['view', 'create'],
      tasks: ['view', 'create', 'edit']
    },
    scope: 'department'
  },
  {
    id: 'assistant',
    name: 'Clinical Assistant',
    description: 'Chairside assistance and clinical documentation support.',
    modulePermissions: {
      dashboard: VIEW_ONLY_ACTIONS,
      patients: ['view', 'create', 'edit'],
      appointments: ['view', 'create'],
      clinical: ['view', 'create', 'edit'],
      imaging: VIEW_ONLY_ACTIONS,
      laboratory: VIEW_ONLY_ACTIONS,
      communication: ['view', 'create'],
      documents: ['view', 'create'],
      tasks: ['view', 'create']
    },
    scope: 'department'
  },
  {
    id: 'receptionist',
    name: 'Receptionist',
    description: 'Patient intake, scheduling, front desk and communication.',
    modulePermissions: {
      dashboard: VIEW_ONLY_ACTIONS,
      patients: ['view', 'create', 'edit'],
      appointments: ['view', 'create', 'edit', 'delete'],
      clinical: VIEW_ONLY_ACTIONS,
      billing: VIEW_ONLY_ACTIONS,
      communication: ['view', 'create', 'edit'],
      documents: ['view', 'create'],
      tasks: ['view', 'create', 'edit']
    },
    scope: 'branch'
  },
  {
    id: 'manager',
    name: 'Department Manager',
    description: 'Operational management of finance, HR, marketing and analytics.',
    modulePermissions: {
      dashboard: VIEW_ONLY_ACTIONS,
      patients: VIEW_ONLY_ACTIONS,
      appointments: VIEW_ONLY_ACTIONS,
      clinical: VIEW_ONLY_ACTIONS,
      inventory: ['view', 'create', 'edit', 'export'],
      billing: ['view', 'create', 'edit', 'approve', 'export', 'manage'],
      hr: ['view', 'create', 'edit', 'approve', 'manage'],
      marketing: ['view', 'create', 'edit', 'export', 'manage'],
      analytics: ['view', 'export', 'manage'],
      quality: VIEW_ONLY_ACTIONS,
      tasks: ['view', 'create', 'edit', 'manage']
    },
    scope: 'branch'
  },
  {
    id: 'auditor',
    name: 'Read-only Auditor',
    description: 'HIPAA audit and compliance review with export only.',
    modulePermissions: {
      dashboard: VIEW_ONLY_ACTIONS,
      patients: VIEW_ONLY_ACTIONS,
      appointments: VIEW_ONLY_ACTIONS,
      clinical: VIEW_ONLY_ACTIONS,
      imaging: VIEW_ONLY_ACTIONS,
      laboratory: VIEW_ONLY_ACTIONS,
      inventory: VIEW_ONLY_ACTIONS,
      billing: VIEW_ONLY_ACTIONS,
      hr: VIEW_ONLY_ACTIONS,
      marketing: VIEW_ONLY_ACTIONS,
      analytics: VIEW_ONLY_ACTIONS,
      quality: ['view', 'export', 'manage'],
      documents: ['view', 'export'],
      tasks: VIEW_ONLY_ACTIONS,
      settings: VIEW_ONLY_ACTIONS
    },
    scope: 'organization'
  }
];

// Example templates demonstrating category tagging. These are merged into the
// active set on load, so every organization sees the full adaptive template library.
const EXAMPLE_PERMISSION_TEMPLATES: PermissionTemplate[] = [
  // --- PRACTICE TYPE TEMPLATES ---
  {
    id: 'practice-solo',
    name: 'Solo Practice',
    description: 'All-in-one workspace for a solo practitioner running the practice alone.',
    modulePermissions: {
      dashboard: FULL_ACTIONS,
      patients: FULL_ACTIONS,
      appointments: FULL_ACTIONS,
      clinical: FULL_ACTIONS,
      imaging: FULL_ACTIONS,
      laboratory: FULL_ACTIONS,
      inventory: FULL_ACTIONS,
      billing: FULL_ACTIONS,
      hr: ['view', 'manage'],
      marketing: ['view', 'create', 'edit'],
      analytics: FULL_ACTIONS,
      ai: FULL_ACTIONS,
      communication: FULL_ACTIONS,
      documents: FULL_ACTIONS,
      tasks: FULL_ACTIONS,
      quality: FULL_ACTIONS,
      settings: FULL_ACTIONS
    },
    scope: 'organization',
    category: 'practice',
    practiceTypeIds: ['solo'],
    isDefault: true
  },
  {
    id: 'practice-small-clinic',
    name: 'Small Clinic',
    description: 'Compact team: clinician, receptionist and administrator under one roof.',
    modulePermissions: {
      dashboard: FULL_ACTIONS,
      patients: ['view', 'create', 'edit', 'export'],
      appointments: ['view', 'create', 'edit', 'delete', 'approve'],
      clinical: ['view', 'create', 'edit', 'approve'],
      imaging: ['view', 'create', 'edit'],
      laboratory: ['view', 'create', 'edit'],
      inventory: ['view', 'create', 'edit', 'export'],
      billing: FULL_ACTIONS,
      hr: ['view', 'create', 'edit', 'manage'],
      marketing: ['view', 'create', 'edit'],
      analytics: ['view', 'export'],
      ai: ['view', 'create'],
      communication: ['view', 'create', 'edit'],
      documents: ['view', 'create', 'edit', 'manage'],
      tasks: ['view', 'create', 'edit', 'manage'],
      quality: ['view', 'approve', 'export'],
      settings: ['view', 'manage']
    },
    scope: 'organization',
    category: 'practice',
    practiceTypeIds: ['small-clinic']
  },
  {
    id: 'practice-multi-specialty',
    name: 'Multi-Specialty Clinic',
    description: 'Specialists with department-scoped clinical access and shared administration.',
    modulePermissions: {
      dashboard: FULL_ACTIONS,
      patients: ['view', 'create', 'edit', 'approve'],
      appointments: ['view', 'create', 'edit', 'approve'],
      clinical: ['view', 'create', 'edit', 'approve', 'export'],
      imaging: ['view', 'create', 'edit'],
      laboratory: ['view', 'create', 'edit', 'approve'],
      inventory: ['view', 'export'],
      billing: ['view', 'create', 'edit', 'approve', 'export'],
      hr: ['view'],
      marketing: ['view'],
      analytics: ['view', 'export'],
      ai: ['view', 'create'],
      communication: ['view', 'create'],
      documents: ['view', 'create', 'edit'],
      tasks: ['view', 'create', 'edit'],
      quality: ['view', 'approve'],
      settings: ['view']
    },
    scope: 'department',
    category: 'practice',
    practiceTypeIds: ['multi-specialty']
  },
  {
    id: 'practice-multi-branch',
    name: 'Multi-Branch Organization',
    description: 'Enterprise template: branch managers plus an organization-wide audit layer.',
    modulePermissions: {
      dashboard: FULL_ACTIONS,
      patients: ['view', 'create', 'edit', 'approve', 'export'],
      appointments: ['view', 'create', 'edit', 'delete', 'approve'],
      clinical: ['view', 'create', 'edit', 'approve'],
      imaging: ['view', 'create', 'edit'],
      laboratory: ['view', 'create', 'edit', 'approve'],
      inventory: ['view', 'create', 'edit', 'export'],
      billing: ['view', 'create', 'edit', 'approve', 'export', 'manage'],
      hr: ['view', 'create', 'edit', 'approve', 'manage'],
      marketing: ['view', 'create', 'edit', 'export', 'manage'],
      analytics: ['view', 'export', 'manage'],
      ai: ['view', 'manage'],
      communication: FULL_ACTIONS,
      documents: ['view', 'create', 'edit', 'delete', 'manage'],
      tasks: FULL_ACTIONS,
      quality: ['view', 'approve', 'export', 'manage'],
      settings: ['view', 'manage']
    },
    scope: 'branch',
    category: 'practice',
    practiceTypeIds: ['multi-branch']
  },

  // --- DEPARTMENT-SPECIFIC TEMPLATES ---
  {
    id: 'dept-general-dentist',
    name: 'General Dentist',
    description: 'Complete general dentistry clinical workflow within the dental department.',
    modulePermissions: {
      dashboard: VIEW_ONLY_ACTIONS,
      patients: ['view', 'create', 'edit', 'approve'],
      appointments: ['view', 'create', 'edit', 'approve'],
      clinical: ['view', 'create', 'edit', 'approve'],
      imaging: ['view', 'create', 'edit'],
      laboratory: ['view', 'create', 'approve'],
      inventory: VIEW_ONLY_ACTIONS,
      billing: VIEW_ONLY_ACTIONS,
      ai: ['view', 'create'],
      communication: ['view', 'create'],
      documents: ['view', 'create'],
      tasks: ['view', 'create']
    },
    scope: 'department',
    category: 'department',
    departmentIds: ['dentistry']
  },
  {
    id: 'dept-prosthodontist',
    name: 'Prosthodontist',
    description: 'Prosthetics and restorative specialist with deep laboratory integration.',
    modulePermissions: {
      dashboard: VIEW_ONLY_ACTIONS,
      patients: ['view', 'create', 'edit', 'approve'],
      appointments: ['view', 'create', 'edit', 'approve'],
      clinical: ['view', 'create', 'edit', 'approve'],
      imaging: ['view', 'create', 'edit'],
      laboratory: ['view', 'create', 'edit', 'approve', 'manage'],
      inventory: VIEW_ONLY_ACTIONS,
      billing: VIEW_ONLY_ACTIONS,
      ai: ['view', 'create'],
      communication: ['view', 'create'],
      documents: ['view', 'create'],
      tasks: ['view', 'create', 'edit']
    },
    scope: 'department',
    category: 'department',
    departmentIds: ['dentistry']
  },
  {
    id: 'dept-implantologist',
    name: 'Implantologist',
    description: 'Surgical implantologist with advanced imaging and surgical planning access.',
    modulePermissions: {
      dashboard: VIEW_ONLY_ACTIONS,
      patients: ['view', 'create', 'edit', 'approve', 'delete'],
      appointments: ['view', 'create', 'edit', 'approve'],
      clinical: ['view', 'create', 'edit', 'approve', 'export'],
      imaging: ['view', 'create', 'edit', 'approve', 'manage'],
      laboratory: ['view', 'create', 'approve'],
      inventory: VIEW_ONLY_ACTIONS,
      billing: VIEW_ONLY_ACTIONS,
      ai: ['view', 'create'],
      communication: ['view', 'create'],
      documents: ['view', 'create', 'edit'],
      tasks: ['view', 'create', 'edit']
    },
    scope: 'department',
    category: 'department',
    departmentIds: ['dentistry']
  },

  // --- RESPONSIBILITY-BASED TEMPLATES ---
  {
    id: 'resp-finance',
    name: 'Finance',
    description: 'Billing, invoicing and financial analytics for the finance responsibility.',
    modulePermissions: {
      dashboard: ['view', 'export'],
      patients: ['view'],
      appointments: VIEW_ONLY_ACTIONS,
      clinical: VIEW_ONLY_ACTIONS,
      inventory: ['view', 'export'],
      billing: FULL_ACTIONS,
      hr: VIEW_ONLY_ACTIONS,
      marketing: VIEW_ONLY_ACTIONS,
      analytics: ['view', 'export', 'manage'],
      ai: ['view'],
      documents: ['view', 'export'],
      tasks: ['view', 'create', 'edit'],
      settings: VIEW_ONLY_ACTIONS
    },
    scope: 'organization',
    category: 'responsibility',
    responsibilityIds: ['finance']
  },
  {
    id: 'resp-hr',
    name: 'HR',
    description: 'Staff administration, payroll visibility and people analytics.',
    modulePermissions: {
      dashboard: VIEW_ONLY_ACTIONS,
      hr: FULL_ACTIONS,
      marketing: VIEW_ONLY_ACTIONS,
      analytics: ['view', 'export'],
      billing: ['view', 'export'],
      ai: ['view'],
      documents: ['view', 'create', 'edit', 'manage'],
      tasks: ['view', 'create', 'edit', 'manage'],
      settings: VIEW_ONLY_ACTIONS
    },
    scope: 'organization',
    category: 'responsibility',
    responsibilityIds: ['hr']
  },
  {
    id: 'resp-laboratory',
    name: 'Laboratory',
    description: 'Digital lab CAD/CAM, manufacturing and lab case management.',
    modulePermissions: {
      dashboard: VIEW_ONLY_ACTIONS,
      patients: VIEW_ONLY_ACTIONS,
      clinical: VIEW_ONLY_ACTIONS,
      imaging: ['view', 'create', 'edit'],
      laboratory: ['view', 'create', 'edit', 'approve', 'manage'],
      inventory: ['view', 'create', 'edit'],
      communication: ['view', 'create'],
      documents: ['view', 'create'],
      tasks: ['view', 'create', 'edit', 'manage']
    },
    scope: 'department',
    category: 'responsibility',
    responsibilityIds: ['laboratory']
  },
  {
    id: 'resp-it',
    name: 'IT',
    description: 'System administration, integrations and security operations.',
    modulePermissions: {
      dashboard: ['view', 'manage'],
      analytics: ['view', 'export', 'manage'],
      ai: ['view', 'manage'],
      communication: FULL_ACTIONS,
      documents: FULL_ACTIONS,
      tasks: FULL_ACTIONS,
      quality: ['view', 'approve', 'manage'],
      settings: FULL_ACTIONS
    },
    scope: 'organization',
    category: 'responsibility',
    responsibilityIds: ['it']
  },
  {
    id: 'resp-quality',
    name: 'Quality',
    description: 'Compliance, audits and quality assurance across every module.',
    modulePermissions: {
      dashboard: VIEW_ONLY_ACTIONS,
      patients: VIEW_ONLY_ACTIONS,
      appointments: VIEW_ONLY_ACTIONS,
      clinical: VIEW_ONLY_ACTIONS,
      imaging: VIEW_ONLY_ACTIONS,
      laboratory: VIEW_ONLY_ACTIONS,
      inventory: VIEW_ONLY_ACTIONS,
      billing: VIEW_ONLY_ACTIONS,
      hr: VIEW_ONLY_ACTIONS,
      marketing: VIEW_ONLY_ACTIONS,
      analytics: ['view', 'export'],
      quality: ['view', 'approve', 'export', 'manage'],
      documents: ['view', 'export'],
      tasks: VIEW_ONLY_ACTIONS,
      settings: ['view', 'export']
    },
    scope: 'organization',
    category: 'responsibility',
    responsibilityIds: ['quality']
  },
  {
    id: 'resp-reception',
    name: 'Receptionist',
    description: 'Front desk: appointments, patient intake, check-in, scheduling and communication.',
    modulePermissions: {
      dashboard: VIEW_ONLY_ACTIONS,
      patients: ['view', 'create', 'edit'],
      appointments: FULL_ACTIONS,
      clinical: VIEW_ONLY_ACTIONS,
      communication: ['view', 'create', 'edit'],
      documents: ['view', 'create'],
      tasks: ['view', 'create', 'edit'],
      billing: ['view', 'create']
    },
    scope: 'department',
    category: 'responsibility',
    responsibilityIds: ['reception']
  }
];

const TEMPLATE_STORAGE_KEY = 'healthos_permission_templates';

const IS_BROWSER = typeof window !== 'undefined';

const DEFAULT_TEMPLATE_SEED: PermissionTemplate[] = [
  ...DEFAULT_PERMISSION_TEMPLATES.map((t) => normalizePermissionTemplate(t)),
  ...EXAMPLE_PERMISSION_TEMPLATES
];

export function getPermissionTemplates(): PermissionTemplate[] {
  const seed = () => ensureSingleDefault(DEFAULT_TEMPLATE_SEED);
  if (!IS_BROWSER) return seed();
  const saved = localStorage.getItem(TEMPLATE_STORAGE_KEY);
  let stored: PermissionTemplate[] = [];
  if (saved) {
    try {
      stored = JSON.parse(saved) as PermissionTemplate[];
    } catch {
      stored = [];
    }
  }
  // Merge stored templates with seed defaults so newly shipped examples appear
  // while every user-created or archived template is preserved. Never hard delete.
  const seen = new Set<string>();
  stored.forEach((t) => seen.add(t.id));
  const merged = [
    ...stored.map((t) => normalizePermissionTemplate(t)),
    ...DEFAULT_TEMPLATE_SEED.filter((d) => !seen.has(d.id))
  ];
  const result = ensureSingleDefault(merged);
  savePermissionTemplates(result);
  return result;
}

export function savePermissionTemplates(templates: PermissionTemplate[]): void {
  if (!IS_BROWSER) return;
  localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
}

export function resetPermissionTemplates(): PermissionTemplate[] {
  const defaults = ensureSingleDefault(DEFAULT_TEMPLATE_SEED);
  savePermissionTemplates(defaults);
  return defaults;
}

export function hasPermission(
  modulePermissions: ModulePermissions | undefined,
  moduleId: ModuleId,
  action: PermissionAction
): boolean {
  if (!modulePermissions) return false;
  const actions = modulePermissions[moduleId];
  if (!actions) return false;
  return actions.includes(action);
}

export type WorkspaceId =
  | 'doctor'
  | 'reception'
  | 'finance'
  | 'laboratory'
  | 'inventory'
  | 'hr'
  | 'administration'
  | 'marketing'
  | 'it'
  | 'quality';

export interface Workspace {
  id: WorkspaceId;
  name: string;
  departments: DepartmentId[];
  primaryModule: ModuleId;
}

export const WORKSPACES: Workspace[] = [
  { id: 'doctor', name: 'Doctor', departments: ['dentistry', 'dermatology', 'aesthetic'], primaryModule: 'clinical' },
  { id: 'reception', name: 'Reception', departments: ['front-desk'], primaryModule: 'appointments' },
  { id: 'finance', name: 'Finance', departments: ['finance'], primaryModule: 'billing' },
  { id: 'laboratory', name: 'Laboratory', departments: ['laboratory'], primaryModule: 'laboratory' },
  { id: 'inventory', name: 'Inventory', departments: ['inventory'], primaryModule: 'inventory' },
  { id: 'hr', name: 'HR', departments: ['hr'], primaryModule: 'hr' },
  { id: 'administration', name: 'Administration', departments: ['administration', 'settings'], primaryModule: 'settings' },
  { id: 'marketing', name: 'Marketing', departments: ['marketing'], primaryModule: 'marketing' },
  { id: 'it', name: 'IT', departments: ['it'], primaryModule: 'settings' },
  { id: 'quality', name: 'Quality', departments: ['quality', 'analytics'], primaryModule: 'quality' }
];

export function getWorkspaceById(id: WorkspaceId): Workspace | undefined {
  return WORKSPACES.find((w) => w.id === id);
}

export function resolveWorkspacesForUser(args: {
  departmentId?: DepartmentId;
  modulePermissions?: ModulePermissions;
}): WorkspaceId[] {
  const { departmentId, modulePermissions } = args;
  const result = new Set<WorkspaceId>();

  if (departmentId) {
    const matched = WORKSPACES.filter((w) => w.departments.includes(departmentId));
    matched.forEach((w) => result.add(w.id));
  }

  if (modulePermissions) {
    WORKSPACES.forEach((w) => {
      if (hasPermission(modulePermissions, w.primaryModule, 'manage')) {
        result.add(w.id);
      }
    });
  }

  return Array.from(result);
}

const WORKSPACE_BY_ROLE: Record<string, WorkspaceId> = {
  'Super Admin': 'administration',
  'Clinic Owner': 'administration',
  Prosthodontist: 'doctor',
  'General Dentist': 'doctor',
  Assistant: 'doctor',
  Receptionist: 'reception',
  'Laboratory Technician': 'laboratory',
  'Read-only Auditor': 'quality'
};

export function getWorkspaceForRole(role: string): WorkspaceId {
  return WORKSPACE_BY_ROLE[role] ?? 'administration';
}

const TEMPLATE_BY_ROLE: Record<string, string> = {
  'Super Admin': 'owner',
  'Clinic Owner': 'owner',
  Prosthodontist: 'doctor',
  'General Dentist': 'doctor',
  Assistant: 'assistant',
  Receptionist: 'receptionist',
  'Laboratory Technician': 'lab-technician',
  'Read-only Auditor': 'auditor'
};

export function getTemplateIdForRole(role: string): string {
  return TEMPLATE_BY_ROLE[role] ?? 'admin';
}

// ============================================================
// PHASE 6 — PERMISSION TEMPLATE MANAGEMENT SYSTEM
// Pure helpers layered on top of the existing matrix primitives.
// Never hard-deletes templates — only archives them.
// ============================================================

let _tplSeq = 100;
export function generateTemplateId(prefix = 'tpl'): string {
  _tplSeq += 1;
  return prefix + '-' + Date.now().toString(36) + '-' + _tplSeq.toString(36);
}

function nowIso(): string {
  return new Date().toISOString();
}

function actorOr(actor?: string): string {
  return actor && actor.length > 0 ? actor : 'System';
}

export function buildTemplateHistory(
  t: PermissionTemplate,
  action: string,
  actor: string,
  note?: string
): PermissionTemplateHistoryEntry {
  return {
    version: (t.version ?? 1) + 1,
    timestamp: nowIso(),
    actor: actorOr(actor),
    action,
    note
  };
}

export function normalizePermissionTemplate(t: PermissionTemplate): PermissionTemplate {
  return {
    ...t,
    category: t.category ?? 'general',
    archived: t.archived ?? false,
    isDefault: t.isDefault ?? false,
    version: t.version ?? 1,
    departmentIds: t.departmentIds ?? [],
    practiceTypeIds: t.practiceTypeIds ?? [],
    responsibilityIds: t.responsibilityIds ?? [],
    history: t.history ?? []
  };
}

export function cloneModulePermissions(mp: ModulePermissions): ModulePermissions {
  const out: ModulePermissions = {};
  (Object.keys(mp) as ModuleId[]).forEach((m) => {
    out[m] = [...(mp[m] ?? [])];
  });
  return out;
}

export interface TemplateDiff {
  module: ModuleId;
  moduleName: string;
  onlyInA: PermissionAction[];
  onlyInB: PermissionAction[];
  inBoth: PermissionAction[];
}

export function comparePermissionTemplates(a: PermissionTemplate, b: PermissionTemplate): TemplateDiff[] {
  return PERMISSION_MODULES.map((mod) => {
    const aActions = a.modulePermissions[mod.id] ?? [];
    const bActions = b.modulePermissions[mod.id] ?? [];
    const onlyInA = aActions.filter((x) => !bActions.includes(x));
    const onlyInB = bActions.filter((x) => !aActions.includes(x));
    const inBoth = aActions.filter((x) => bActions.includes(x));
    return { module: mod.id, moduleName: mod.name, onlyInA, onlyInB, inBoth };
  });
}

export interface CreatePermissionTemplateInput {
  name: string;
  description?: string;
  scope?: AccessScopeType;
  category?: PermissionTemplateCategory;
  departmentIds?: DepartmentId[];
  practiceTypeIds?: PracticeTypeId[];
  responsibilityIds?: ResponsibilityId[];
  modulePermissions?: ModulePermissions;
  actor?: string;
}

export function createPermissionTemplate(input: CreatePermissionTemplateInput): PermissionTemplate {
  const now = nowIso();
  const actor = actorOr(input.actor);
  const t: PermissionTemplate = {
    id: generateTemplateId('tpl'),
    name: input.name,
    description: input.description ?? '',
    modulePermissions: input.modulePermissions ? cloneModulePermissions(input.modulePermissions) : {},
    scope: input.scope ?? 'department',
    category: input.category ?? 'general',
    departmentIds: input.departmentIds ?? [],
    practiceTypeIds: input.practiceTypeIds ?? [],
    responsibilityIds: input.responsibilityIds ?? [],
    archived: false,
    isDefault: false,
    version: 1,
    createdAt: now,
    updatedAt: now,
    history: [{ version: 1, timestamp: now, actor, action: 'created' }]
  };
  return t;
}

export function updatePermissionTemplate(
  t: PermissionTemplate,
  patch: Partial<Pick<PermissionTemplate, 'name' | 'description' | 'scope' | 'category' | 'departmentIds' | 'practiceTypeIds' | 'responsibilityIds'>>,
  actor?: string,
  note?: string
): PermissionTemplate {
  const nextVersion = (t.version ?? 1) + 1;
  return {
    ...t,
    ...patch,
    version: nextVersion,
    updatedAt: nowIso(),
    history: [
      ...(t.history ?? []),
      buildTemplateHistory(t, 'updated', actorOr(actor), note)
    ]
  };
}

export function duplicatePermissionTemplate(t: PermissionTemplate, actor?: string): PermissionTemplate {
  const now = nowIso();
  return {
    id: generateTemplateId('tpl'),
    name: t.name + ' (Copy)',
    description: t.description,
    modulePermissions: cloneModulePermissions(t.modulePermissions),
    scope: t.scope,
    category: t.category ?? 'general',
    departmentIds: [...(t.departmentIds ?? [])],
    practiceTypeIds: [...(t.practiceTypeIds ?? [])],
    responsibilityIds: [...(t.responsibilityIds ?? [])],
    archived: false,
    isDefault: false,
    version: 1,
    createdAt: now,
    updatedAt: now,
    history: [{ version: 1, timestamp: now, actor: actorOr(actor), action: 'duplicated from ' + t.id }]
  };
}

export function archivePermissionTemplate(t: PermissionTemplate, actor?: string): PermissionTemplate {
  return {
    ...t,
    archived: true,
    isDefault: false,
    updatedAt: nowIso(),
    history: [
      ...(t.history ?? []),
      buildTemplateHistory(t, 'archived', actorOr(actor))
    ]
  };
}

export function restorePermissionTemplate(t: PermissionTemplate, actor?: string): PermissionTemplate {
  return {
    ...t,
    archived: false,
    updatedAt: nowIso(),
    history: [
      ...(t.history ?? []),
      buildTemplateHistory(t, 'restored', actorOr(actor))
    ]
  };
}

export function clonePermissionsFromTemplate(
  target: PermissionTemplate,
  source: PermissionTemplate,
  actor?: string
): PermissionTemplate {
  return {
    ...target,
    modulePermissions: cloneModulePermissions(source.modulePermissions),
    scope: source.scope,
    version: (target.version ?? 1) + 1,
    updatedAt: nowIso(),
    history: [
      ...(target.history ?? []),
      buildTemplateHistory(target, 'cloned permissions from ' + source.id, actorOr(actor))
    ]
  };
}

export function markTemplateDefault(templates: PermissionTemplate[], id: string): PermissionTemplate[] {
  return templates.map((t) => ({
    ...t,
    isDefault: t.id === id && !t.archived,
    updatedAt: t.id === id ? nowIso() : t.updatedAt
  }));
}

export function getActiveTemplates(templates: PermissionTemplate[]): PermissionTemplate[] {
  return templates.filter((t) => !t.archived);
}

export function getArchivedTemplates(templates: PermissionTemplate[]): PermissionTemplate[] {
  return templates.filter((t) => t.archived);
}

export function getTemplatesByCategory(
  templates: PermissionTemplate[],
  category: PermissionTemplateCategory | 'all'
): PermissionTemplate[] {
  return category === 'all' ? templates : templates.filter((t) => (t.category ?? 'general') === category);
}

export function ensureSingleDefault(templates: PermissionTemplate[]): PermissionTemplate[] {
  const active = templates.filter((t) => !t.archived);
  const hasDefault = active.some((t) => t.isDefault);
  if (hasDefault) return templates;
  const first = active[0];
  if (!first) return templates;
  return markTemplateDefault(templates, first.id);
}

export function previewPermissionTemplate(t: PermissionTemplate): PermissionTemplate {
  return normalizePermissionTemplate({
    ...t,
    modulePermissions: cloneModulePermissions(t.modulePermissions)
  });
}

export function countTemplatePermissions(t: PermissionTemplate): number {
  return Object.values(t.modulePermissions).reduce((sum, actions) => sum + (actions?.length ?? 0), 0);
}

export interface AssignTarget {
  id: string;
  name: string;
  permissionTemplateId?: string;
}

export function assignTemplateToUsers<T extends AssignTarget>(
  users: T[],
  templateId: string,
  userIds: string[]
): T[] {
  return users.map((u) => (userIds.includes(u.id) ? { ...u, permissionTemplateId: templateId } : u));
}

export const PERMISSION_TEMPLATE_CATEGORIES: { id: PermissionTemplateCategory; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'department', label: 'Department' },
  { id: 'practice', label: 'Practice Type' },
  { id: 'responsibility', label: 'Responsibility' }
];

export interface Branch {
  id: string;
  name: string;
  code: string;
  organizationId: string;
}
