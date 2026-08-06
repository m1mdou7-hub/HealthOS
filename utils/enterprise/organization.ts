'use client';

// ---------------------------------------------------------------------------
// Enterprise Organization Management — Organization, Branch, Department,
// Room, Chair and Equipment structure. Extends the existing enterprise
// architecture (directory.ts Branch, practice.ts profiles) without touching
// any existing logic. Same model serves Solo Practice through Multi-Branch.
// ---------------------------------------------------------------------------

import type { DepartmentId, WorkspaceId } from './directory';
import type { Branch } from './directory';
import type { PracticeTypeId } from './practice';
import type { ResponsibilityId } from './responsibilities';

// --- Organization ----------------------------------------------------------

export type CurrencyCode =
  | 'SAR'
  | 'AED'
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'EGP'
  | 'JOD'
  | 'KWD'
  | 'QAR'
  | 'BHD'
  | 'OMR'
  | 'OTHER';

export interface OrganizationContact {
  phone: string;
  email: string;
  address: string;
}

export interface LicenseInformation {
  number: string;
  issuedBy: string;
  issuedAt: string;
  expiresAt: string;
  status: 'Valid' | 'Expiring Soon' | 'Expired';
}

export interface EnterpriseOrganization {
  id: string;
  name: string;
  logo: string;
  brandColor: string;
  language: 'ar' | 'en';
  timezone: string;
  currency: CurrencyCode;
  workingDays: string[];
  workingHours: { open: string; close: string };
  contact: OrganizationContact;
  license: LicenseInformation;
  practiceTypeId: PracticeTypeId;
}

// --- Branch ----------------------------------------------------------------

export type BranchStatus = 'Active' | 'Maintenance' | 'Planned' | 'Closed';

export interface BranchNode extends Branch {
  status: BranchStatus;
  address: string;
  phone: string;
  manager: string;
  workingHours: string;
  assignedStaff: string[];
  departments: DepartmentId[];
  rooms: string[];
  inventory: string[];
}

// --- Room ------------------------------------------------------------------

export type RoomType =
  | 'operatory'
  | 'consultation'
  | 'surgery'
  | 'cbct'
  | 'photography'
  | 'laboratory'
  | 'sterilization'
  | 'meeting'
  | 'storage';

export const ROOM_TYPES: { id: RoomType; label: string }[] = [
  { id: 'operatory', label: 'Operatory' },
  { id: 'consultation', label: 'Consultation Room' },
  { id: 'surgery', label: 'Surgery Room' },
  { id: 'cbct', label: 'CBCT Room' },
  { id: 'photography', label: 'Photography Room' },
  { id: 'laboratory', label: 'Laboratory' },
  { id: 'sterilization', label: 'Sterilization Room' },
  { id: 'meeting', label: 'Meeting Room' },
  { id: 'storage', label: 'Storage Room' }
];

export type RoomStatus = 'Operational' | 'Maintenance' | 'Out of Service' | 'Planned';

export interface RoomNode {
  id: string;
  name: string;
  number: string;
  floor: string;
  type: RoomType;
  status: RoomStatus;
  branchId: string;
  departmentId: DepartmentId;
  doctors: string[];
  chairs: string[];
  equipment: string[];
}

// --- Chair ----------------------------------------------------------------

export type ChairStatus = 'Available' | 'Occupied' | 'Cleaning' | 'Maintenance';

export interface ChairNode {
  id: string;
  number: string;
  status: ChairStatus;
  roomId: string;
  branchId: string;
  departmentId: DepartmentId;
  doctorId: string;
}

// --- Equipment ------------------------------------------------------------

export type EquipmentCategory =
  | 'imaging'
  | 'clinical'
  | 'laboratory'
  | 'sterilization'
  | 'dental'
  | 'aesthetic'
  | 'office'
  | 'safety';

export const EQUIPMENT_CATEGORIES: { id: EquipmentCategory; label: string }[] = [
  { id: 'imaging', label: 'Imaging' },
  { id: 'clinical', label: 'Clinical' },
  { id: 'laboratory', label: 'Laboratory' },
  { id: 'sterilization', label: 'Sterilization' },
  { id: 'dental', label: 'Dental' },
  { id: 'aesthetic', label: 'Aesthetic' },
  { id: 'office', label: 'Office' },
  { id: 'safety', label: 'Safety' }
];

export type EquipmentStatus =
  | 'Operational'
  | 'Maintenance'
  | 'Out of Service'
  | 'Retired';

export interface EquipmentNode {
  id: string;
  name: string;
  category: EquipmentCategory;
  serialNumber: string;
  manufacturer: string;
  model: string;
  purchaseDate: string;
  warranty: string;
  maintenanceSchedule: string;
  branchId: string;
  roomId: string;
  chairId: string;
  status: EquipmentStatus;
}

// --- Structure container ---------------------------------------------------

export interface OrganizationStructure {
  organization: EnterpriseOrganization;
  branches: BranchNode[];
  rooms: RoomNode[];
  chairs: ChairNode[];
  equipment: EquipmentNode[];
}

export interface OrgSnapshot {
  organizations: EnterpriseOrganization[];
  branches: BranchNode[];
  departments: DepartmentId[];
  rooms: RoomNode[];
  chairs: ChairNode[];
  equipment: EquipmentNode[];
}

// --- Constants & storage ---------------------------------------------------

const ORG_STRUCTURE_KEY = 'healthos_org_structure';

const IS_BROWSER = typeof window !== 'undefined';

let _seq = 1000;
export function generateOrgId(prefix: string): string {
  _seq += 1;
  return prefix + '-' + Date.now().toString(36) + '-' + _seq.toString(36);
}

const CURRENCIES: CurrencyCode[] = [
  'SAR',
  'AED',
  'USD',
  'EUR',
  'GBP',
  'EGP',
  'JOD',
  'KWD',
  'QAR',
  'BHD',
  'OMR',
  'OTHER'
];

const WEEK_DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

// ---------------------------------------------------------------------------
// Seed builders — a single path works for all practice sizes; the practice
// type only scales the number of branches/rooms/chairs seeded.
// ---------------------------------------------------------------------------

function seedWorkingDays(practiceTypeId: PracticeTypeId): string[] {
  if (practiceTypeId === 'multi-branch') return [...WEEK_DAYS];
  return ['sun', 'mon', 'tue', 'wed', 'thu', 'sat'];
}

function seedBranchCount(practiceTypeId: PracticeTypeId): number {
  switch (practiceTypeId) {
    case 'solo':
    case 'small-clinic':
      return 1;
    case 'multi-specialty':
      return 2;
    case 'multi-branch':
      return 4;
    default:
      return 1;
  }
}

function seedDepartments(practiceTypeId: PracticeTypeId): DepartmentId[] {
  switch (practiceTypeId) {
    case 'solo':
      return ['dentistry', 'front-desk', 'administration'];
    case 'small-clinic':
      return ['dentistry', 'dermatology', 'front-desk', 'finance', 'inventory', 'administration'];
    case 'multi-specialty':
      return [
        'dentistry',
        'dermatology',
        'aesthetic',
        'laboratory',
        'imaging',
        'front-desk',
        'finance',
        'inventory',
        'administration'
      ];
    case 'multi-branch':
      return [
        'dentistry',
        'dermatology',
        'aesthetic',
        'laboratory',
        'imaging',
        'front-desk',
        'finance',
        'inventory',
        'hr',
        'marketing',
        'it',
        'quality',
        'administration'
      ];
    default:
      return ['dentistry', 'administration'];
  }
}

export function buildOrganization(
  practiceTypeId: PracticeTypeId,
  organizationName: string
): EnterpriseOrganization {
  const now = new Date().toISOString();
  return {
    id: 'org-main',
    name: organizationName || 'HealthOS Organization',
    logo: '',
    brandColor: 'emerald',
    language: 'ar',
    timezone: 'Asia/Riyadh',
    currency: 'SAR',
    workingDays: seedWorkingDays(practiceTypeId),
    workingHours: { open: '09:00', close: '18:00' },
    contact: { phone: '+966 11 000 0000', email: 'contact@healthos.io', address: 'Riyadh, KSA' },
    license: {
      number: 'HOS-' + practiceTypeId.toUpperCase().slice(0, 3) + '-2026',
      issuedBy: 'HealthOS Licensing Authority',
      issuedAt: now,
      expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
      status: 'Valid'
    },
    practiceTypeId
  };
}

export function buildBranches(
  organizationId: string,
  practiceTypeId: PracticeTypeId
): BranchNode[] {
  const departments = seedDepartments(practiceTypeId);
  const count = seedBranchCount(practiceTypeId);
  const names: { name: string; code: string; address: string }[] = [
    { name: 'Main Campus', code: 'HQ', address: 'King Fahd Rd, Riyadh' },
    { name: 'North Branch', code: 'NB', address: 'Prince Sultan Rd, Jeddah' },
    { name: 'East Branch', code: 'EB', address: 'Corniche Rd, Dammam' },
    { name: 'West Branch', code: 'WB', address: 'King Abdullah St, Al Khobar' }
  ];
  const branches: BranchNode[] = [];
  for (let i = 0; i < count; i++) {
    const n = names[i] ?? { name: 'Branch ' + (i + 1), code: 'BR' + (i + 1), address: '—' };
    branches.push({
      id: 'br-' + (i + 1),
      name: n.name,
      code: n.code + '-' + (i + 1),
      organizationId,
      status: 'Active',
      address: n.address,
      phone: '+966 11 000 00' + (i + 1) + '0',
      manager: '',
      workingHours: '09:00 - 18:00',
      assignedStaff: [],
      departments: [...departments],
      rooms: [],
      inventory: []
    });
  }
  return branches;
}

export function buildRoomsForBranch(
  branchId: string,
  departments: DepartmentId[],
  practiceTypeId: PracticeTypeId
): RoomNode[] {
  const clinicalDept = departments.find((d) => d === 'dentistry' || d === 'dermatology' || d === 'aesthetic') ?? 'dentistry';
  const labDept = departments.find((d) => d === 'laboratory' || d === 'imaging') ?? 'laboratory';
  const rooms: RoomNode[] = [
    { id: branchId + '-op-1', name: 'Operatory 1', number: 'OP-1', floor: 'G', type: 'operatory', status: 'Operational', branchId, departmentId: clinicalDept, doctors: [], chairs: [], equipment: [] },
    { id: branchId + '-op-2', name: 'Operatory 2', number: 'OP-2', floor: 'G', type: 'operatory', status: 'Operational', branchId, departmentId: clinicalDept, doctors: [], chairs: [], equipment: [] },
    { id: branchId + '-cs-1', name: 'Consultation 1', number: 'CS-1', floor: '1', type: 'consultation', status: 'Operational', branchId, departmentId: clinicalDept, doctors: [], chairs: [], equipment: [] }
  ];
  if (practiceTypeId !== 'solo') {
    rooms.push({ id: branchId + '-cbct-1', name: 'CBCT Suite', number: 'CBCT-1', floor: 'G', type: 'cbct', status: 'Operational', branchId, departmentId: labDept, doctors: [], chairs: [], equipment: [] });
    rooms.push({ id: branchId + '-lab-1', name: 'In-house Lab', number: 'LAB-1', floor: '1', type: 'laboratory', status: 'Operational', branchId, departmentId: labDept, doctors: [], chairs: [], equipment: [] });
    rooms.push({ id: branchId + '-st-1', name: 'Sterilization', number: 'ST-1', floor: 'G', type: 'sterilization', status: 'Operational', branchId, departmentId: clinicalDept, doctors: [], chairs: [], equipment: [] });
  }
  rooms.push({ id: branchId + '-sr-1', name: 'Surgery Suite', number: 'SR-1', floor: '1', type: 'surgery', status: 'Operational', branchId, departmentId: clinicalDept, doctors: [], chairs: [], equipment: [] });
  rooms.push({ id: branchId + '-ph-1', name: 'Photography Studio', number: 'PH-1', floor: '1', type: 'photography', status: 'Operational', branchId, departmentId: clinicalDept, doctors: [], chairs: [], equipment: [] });
  rooms.push({ id: branchId + '-mt-1', name: 'Meeting Room', number: 'MT-1', floor: '2', type: 'meeting', status: 'Operational', branchId, departmentId: departments.includes('administration') ? 'administration' : clinicalDept, doctors: [], chairs: [], equipment: [] });
  rooms.push({ id: branchId + '-sg-1', name: 'Storage', number: 'SG-1', floor: 'B', type: 'storage', status: 'Operational', branchId, departmentId: departments.includes('inventory') ? 'inventory' : clinicalDept, doctors: [], chairs: [], equipment: [] });
  return rooms;
}

export function buildChairsForRooms(rooms: RoomNode[]): ChairNode[] {
  const chairs: ChairNode[] = [];
  rooms.forEach((r) => {
    if (r.type === 'operatory' || r.type === 'surgery') {
      chairs.push({
        id: r.id + '-ch-1',
        number: r.number + '-1',
        status: 'Available',
        roomId: r.id,
        branchId: r.branchId,
        departmentId: r.departmentId,
        doctorId: ''
      });
      chairs.push({
        id: r.id + '-ch-2',
        number: r.number + '-2',
        status: 'Available',
        roomId: r.id,
        branchId: r.branchId,
        departmentId: r.departmentId,
        doctorId: ''
      });
    }
  });
  return chairs;
}

export function buildEquipmentForBranch(
  branchId: string,
  rooms: RoomNode[],
  practiceTypeId: PracticeTypeId
): EquipmentNode[] {
  const opRoom = rooms.find((r) => r.type === 'operatory');
  const cbctRoom = rooms.find((r) => r.type === 'cbct');
  const labRoom = rooms.find((r) => r.type === 'laboratory');
  const stRoom = rooms.find((r) => r.type === 'sterilization');
  const eq: EquipmentNode[] = [
    {
      id: branchId + '-eq-1',
      name: 'Dental Chair Unit',
      category: 'dental',
      serialNumber: 'DCU-' + branchId,
      manufacturer: 'Sirona',
      model: 'SINIUS 5',
      purchaseDate: '2024-01-15',
      warranty: '2027-01-15',
      maintenanceSchedule: 'Quarterly',
      branchId,
      roomId: opRoom?.id ?? '',
      chairId: opRoom ? opRoom.id + '-ch-1' : '',
      status: 'Operational'
    },
    {
      id: branchId + '-eq-2',
      name: 'Intraoral Scanner',
      category: 'imaging',
      serialNumber: 'IOS-' + branchId,
      manufacturer: '3Shape',
      model: 'TRIOS 5',
      purchaseDate: '2024-02-01',
      warranty: '2027-02-01',
      maintenanceSchedule: 'Quarterly',
      branchId,
      roomId: opRoom?.id ?? '',
      chairId: '',
      status: 'Operational'
    }
  ];
  if (cbctRoom) {
    eq.push({
      id: branchId + '-eq-3',
      name: 'CBCT Scanner',
      category: 'imaging',
      serialNumber: 'CBCT-' + branchId,
      manufacturer: 'NewTom',
      model: 'GiANO HR',
      purchaseDate: '2023-06-10',
      warranty: '2026-06-10',
      maintenanceSchedule: 'Annual',
      branchId,
      roomId: cbctRoom.id,
      chairId: '',
      status: 'Operational'
    });
  }
  if (labRoom) {
    eq.push({
      id: branchId + '-eq-4',
      name: 'Milling Machine',
      category: 'laboratory',
      serialNumber: 'ML-' + branchId,
      manufacturer: 'imes-icore',
      model: 'CORiTEC 350i',
      purchaseDate: '2023-11-20',
      warranty: '2026-11-20',
      maintenanceSchedule: 'Quarterly',
      branchId,
      roomId: labRoom.id,
      chairId: '',
      status: 'Operational'
    });
  }
  if (stRoom) {
    eq.push({
      id: branchId + '-eq-5',
      name: 'Autoclave Sterilizer',
      category: 'sterilization',
      serialNumber: 'AUT-' + branchId,
      manufacturer: 'Melag',
      model: 'Euroklav 23 VS+',
      purchaseDate: '2024-03-01',
      warranty: '2027-03-01',
      maintenanceSchedule: 'Monthly',
      branchId,
      roomId: stRoom.id,
      chairId: '',
      status: 'Operational'
    });
  }
  return eq;
}

export function buildOrganizationStructure(
  practiceTypeId: PracticeTypeId,
  organizationName: string
): OrganizationStructure {
  const organization = buildOrganization(practiceTypeId, organizationName);
  const departments = seedDepartments(practiceTypeId);
  const branches = buildBranches(organization.id, practiceTypeId);
  const rooms: RoomNode[] = [];
  const chairs: ChairNode[] = [];
  const equipment: EquipmentNode[] = [];

  branches.forEach((b) => {
    const branchRooms = buildRoomsForBranch(b.id, departments, practiceTypeId);
    const branchChairs = buildChairsForRooms(branchRooms);
    const branchEquipment = buildEquipmentForBranch(b.id, branchRooms, practiceTypeId);
    b.rooms = branchRooms.map((r) => r.id);
    b.inventory = branchEquipment.map((e) => e.id);
    rooms.push(...branchRooms);
    chairs.push(...branchChairs);
    equipment.push(...branchEquipment);
  });

  return { organization, branches, rooms, chairs, equipment };
}

// --- Persistence -----------------------------------------------------------

export function getOrganizationStructure(): OrganizationStructure {
  if (!IS_BROWSER) {
    return buildOrganizationStructure('small-clinic', 'HealthOS Organization');
  }
  const saved = localStorage.getItem(ORG_STRUCTURE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as OrganizationStructure;
      if (parsed && parsed.organization && Array.isArray(parsed.branches)) return parsed;
    } catch {
      /* fall through to rebuild */
    }
  }
  const built = buildOrganizationStructure('small-clinic', 'HealthOS Organization');
  localStorage.setItem(ORG_STRUCTURE_KEY, JSON.stringify(built));
  return built;
}

export function saveOrganizationStructure(structure: OrganizationStructure): OrganizationStructure {
  if (!IS_BROWSER) return structure;
  localStorage.setItem(ORG_STRUCTURE_KEY, JSON.stringify(structure));
  window.dispatchEvent(
    new CustomEvent('healthos_state_change', {
      detail: { type: 'org-structure', value: structure }
    })
  );
  return structure;
}

export function resetOrganizationStructure(
  practiceTypeId: PracticeTypeId
): OrganizationStructure {
  const structure = buildOrganizationStructure(practiceTypeId, 'HealthOS Organization');
  return saveOrganizationStructure(structure);
}

// --- CRUD helpers ----------------------------------------------------------

export function addBranch(
  structure: OrganizationStructure,
  input: Partial<BranchNode> & { name: string }
): OrganizationStructure {
  const branch: BranchNode = {
    id: generateOrgId('br'),
    name: input.name,
    code: input.code ?? 'BR',
    organizationId: structure.organization.id,
    status: input.status ?? 'Planned',
    address: input.address ?? '',
    phone: input.phone ?? '',
    manager: input.manager ?? '',
    workingHours: input.workingHours ?? '09:00 - 18:00',
    assignedStaff: input.assignedStaff ?? [],
    departments: input.departments ?? [],
    rooms: input.rooms ?? [],
    inventory: input.inventory ?? []
  };
  return { ...structure, branches: [...structure.branches, branch] };
}

export function updateBranch(
  structure: OrganizationStructure,
  branchId: string,
  patch: Partial<BranchNode>
): OrganizationStructure {
  return {
    ...structure,
    branches: structure.branches.map((b) => (b.id === branchId ? { ...b, ...patch } : b))
  };
}

export function removeBranch(structure: OrganizationStructure, branchId: string): OrganizationStructure {
  const branchRoomIds = new Set(
    structure.rooms.filter((r) => r.branchId === branchId).map((r) => r.id)
  );
  return {
    ...structure,
    branches: structure.branches.filter((b) => b.id !== branchId),
    rooms: structure.rooms.filter((r) => r.branchId !== branchId),
    chairs: structure.chairs.filter((c) => !branchRoomIds.has(c.roomId)),
    equipment: structure.equipment.filter((e) => e.branchId !== branchId)
  };
}

export function addRoom(structure: OrganizationStructure, input: Partial<RoomNode>): OrganizationStructure {
  const room: RoomNode = {
    id: generateOrgId('rm'),
    name: input.name ?? 'New Room',
    number: input.number ?? '',
    floor: input.floor ?? 'G',
    type: input.type ?? 'operatory',
    status: input.status ?? 'Planned',
    branchId: input.branchId ?? structure.branches[0]?.id ?? '',
    departmentId: input.departmentId ?? 'dentistry',
    doctors: input.doctors ?? [],
    chairs: input.chairs ?? [],
    equipment: input.equipment ?? []
  };
  return {
    ...structure,
    rooms: [...structure.rooms, room],
    branches: structure.branches.map((b) =>
      b.id === room.branchId ? { ...b, rooms: [...b.rooms, room.id] } : b
    )
  };
}

export function updateRoom(structure: OrganizationStructure, roomId: string, patch: Partial<RoomNode>): OrganizationStructure {
  return {
    ...structure,
    rooms: structure.rooms.map((r) => (r.id === roomId ? { ...r, ...patch } : r))
  };
}

export function removeRoom(structure: OrganizationStructure, roomId: string): OrganizationStructure {
  const chairIds = new Set(
    structure.chairs.filter((c) => c.roomId === roomId).map((c) => c.id)
  );
  return {
    ...structure,
    rooms: structure.rooms.filter((r) => r.id !== roomId),
    chairs: structure.chairs.filter((c) => !chairIds.has(c.id)),
    branches: structure.branches.map((b) => ({
      ...b,
      rooms: b.rooms.filter((id) => id !== roomId)
    })),
    equipment: structure.equipment.map((e) =>
      e.roomId === roomId ? { ...e, roomId: '', chairId: '' } : e
    )
  };
}

export function addChair(structure: OrganizationStructure, input: Partial<ChairNode>): OrganizationStructure {
  const chair: ChairNode = {
    id: generateOrgId('ch'),
    number: input.number ?? 'CH-1',
    status: input.status ?? 'Available',
    roomId: input.roomId ?? '',
    branchId: input.branchId ?? structure.branches[0]?.id ?? '',
    departmentId: input.departmentId ?? 'dentistry',
    doctorId: input.doctorId ?? ''
  };
  return {
    ...structure,
    chairs: [...structure.chairs, chair],
    rooms: structure.rooms.map((r) =>
      r.id === chair.roomId ? { ...r, chairs: [...r.chairs, chair.id] } : r
    )
  };
}

export function updateChair(structure: OrganizationStructure, chairId: string, patch: Partial<ChairNode>): OrganizationStructure {
  return {
    ...structure,
    chairs: structure.chairs.map((c) => (c.id === chairId ? { ...c, ...patch } : c))
  };
}

export function removeChair(structure: OrganizationStructure, chairId: string): OrganizationStructure {
  return {
    ...structure,
    chairs: structure.chairs.filter((c) => c.id !== chairId),
    rooms: structure.rooms.map((r) => ({
      ...r,
      chairs: r.chairs.filter((id) => id !== chairId)
    })),
    equipment: structure.equipment.map((e) =>
      e.chairId === chairId ? { ...e, chairId: '' } : e
    )
  };
}

export function addEquipment(structure: OrganizationStructure, input: Partial<EquipmentNode>): OrganizationStructure {
  const equipment: EquipmentNode = {
    id: generateOrgId('eq'),
    name: input.name ?? 'New Equipment',
    category: input.category ?? 'clinical',
    serialNumber: input.serialNumber ?? '',
    manufacturer: input.manufacturer ?? '',
    model: input.model ?? '',
    purchaseDate: input.purchaseDate ?? '',
    warranty: input.warranty ?? '',
    maintenanceSchedule: input.maintenanceSchedule ?? 'Annual',
    branchId: input.branchId ?? structure.branches[0]?.id ?? '',
    roomId: input.roomId ?? '',
    chairId: input.chairId ?? '',
    status: input.status ?? 'Operational'
  };
  return {
    ...structure,
    equipment: [...structure.equipment, equipment],
    branches: structure.branches.map((b) =>
      b.id === equipment.branchId ? { ...b, inventory: [...b.inventory, equipment.id] } : b
    )
  };
}

export function updateEquipment(structure: OrganizationStructure, equipmentId: string, patch: Partial<EquipmentNode>): OrganizationStructure {
  return {
    ...structure,
    equipment: structure.equipment.map((e) => (e.id === equipmentId ? { ...e, ...patch } : e))
  };
}

export function removeEquipment(structure: OrganizationStructure, equipmentId: string): OrganizationStructure {
  return {
    ...structure,
    equipment: structure.equipment.filter((e) => e.id !== equipmentId),
    branches: structure.branches.map((b) => ({
      ...b,
      inventory: b.inventory.filter((id) => id !== equipmentId)
    })),
    rooms: structure.rooms.map((r) => ({
      ...r,
      equipment: r.equipment.filter((id) => id !== equipmentId)
    }))
  };
}

// --- Resource assignment ---------------------------------------------------

export function assignStaffToBranch(
  structure: OrganizationStructure,
  branchId: string,
  staffIds: string[]
): OrganizationStructure {
  return updateBranch(structure, branchId, { assignedStaff: staffIds });
}

export function assignDepartmentToBranch(
  structure: OrganizationStructure,
  branchId: string,
  departmentId: DepartmentId,
  active: boolean
): OrganizationStructure {
  const branch = structure.branches.find((b) => b.id === branchId);
  if (!branch) return structure;
  const next = active
    ? Array.from(new Set([...branch.departments, departmentId]))
    : branch.departments.filter((d) => d !== departmentId);
  return updateBranch(structure, branchId, { departments: next });
}

export function assignDoctorToRoom(
  structure: OrganizationStructure,
  roomId: string,
  doctorId: string,
  active: boolean
): OrganizationStructure {
  const room = structure.rooms.find((r) => r.id === roomId);
  if (!room) return structure;
  const next = active
    ? Array.from(new Set([...room.doctors, doctorId]))
    : room.doctors.filter((d) => d !== doctorId);
  return updateRoom(structure, roomId, { doctors: next });
}

export function assignEquipmentToRoom(
  structure: OrganizationStructure,
  equipmentId: string,
  roomId: string
): OrganizationStructure {
  const equipment = structure.equipment.find((e) => e.id === equipmentId);
  if (!equipment) return structure;
  const updated: EquipmentNode = { ...equipment, roomId };
  return {
    ...structure,
    equipment: structure.equipment.map((e) => (e.id === equipmentId ? updated : e)),
    rooms: structure.rooms.map((r) => ({
      ...r,
      equipment: r.id === roomId
        ? Array.from(new Set([...r.equipment, equipmentId]))
        : r.equipment.filter((id) => id !== equipmentId)
    }))
  };
}

// --- Search & filters ------------------------------------------------------

export interface OrgSearchResults {
  organizations: EnterpriseOrganization[];
  branches: BranchNode[];
  departments: DepartmentId[];
  rooms: RoomNode[];
  chairs: ChairNode[];
  equipment: EquipmentNode[];
}

export function searchOrganizationStructure(
  structure: OrganizationStructure,
  query: string,
  departmentFilter: DepartmentId | 'all',
  branchFilter: string | 'all',
  roomTypeFilter: RoomType | 'all',
  chairFilter: 'all' | 'Available' | 'Occupied' | 'Cleaning' | 'Maintenance',
  equipmentCategoryFilter: EquipmentCategory | 'all',
  statusFilter: 'all' | 'Active' | 'Maintenance' | 'Planned' | 'Closed'
): OrgSearchResults {
  const q = query.trim().toLowerCase();

  const matchText = (...values: (string | undefined)[]) =>
    q === '' || values.some((v) => (v ?? '').toLowerCase().includes(q));

  const organizations = q === '' ? [structure.organization] : structure.organization.name.toLowerCase().includes(q) ? [structure.organization] : [];

  const branches = structure.branches.filter((b) => {
    if (branchFilter !== 'all' && b.id !== branchFilter) return false;
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (!matchText(b.name, b.code, b.address, b.manager)) return false;
    return true;
  });

  const branchIds = new Set(branches.map((b) => b.id));

  const rooms = structure.rooms.filter((r) => {
    if (!branchIds.has(r.branchId)) return false;
    if (departmentFilter !== 'all' && r.departmentId !== departmentFilter) return false;
    if (roomTypeFilter !== 'all' && r.type !== roomTypeFilter) return false;
    if (!matchText(r.name, r.number, r.floor)) return false;
    return true;
  });

  const roomIds = new Set(rooms.map((r) => r.id));
  const branchIdsAll = new Set(structure.branches.map((b) => b.id));

  const chairs = structure.chairs.filter((c) => {
    if (!roomIds.has(c.roomId) && !branchIds.has(c.branchId)) return false;
    if (chairFilter !== 'all' && c.status !== chairFilter) return false;
    if (!matchText(c.number)) return false;
    return true;
  });

  const equipment = structure.equipment.filter((e) => {
    if (!branchIds.has(e.branchId)) return false;
    if (equipmentCategoryFilter !== 'all' && e.category !== equipmentCategoryFilter) return false;
    if (!matchText(e.name, e.serialNumber, e.manufacturer, e.model)) return false;
    return true;
  });

  const departments = roomFilteredDepartments(structure, rooms, branchIdsAll);

  return { organizations, branches, departments, rooms, chairs, equipment };
}

function roomFilteredDepartments(
  structure: OrganizationStructure,
  rooms: RoomNode[],
  branchIdsAll: Set<string>
): DepartmentId[] {
  const deptIds = new Set<DepartmentId>();
  rooms.forEach((r) => {
    if (branchIdsAll.has(r.branchId)) deptIds.add(r.departmentId);
  });
  structure.branches.forEach((b) => b.departments.forEach((d) => deptIds.add(d)));
  return Array.from(deptIds);
}

export function getBranchById(structure: OrganizationStructure, branchId: string): BranchNode | undefined {
  return structure.branches.find((b) => b.id === branchId);
}

export function getRoomById(structure: OrganizationStructure, roomId: string): RoomNode | undefined {
  return structure.rooms.find((r) => r.id === roomId);
}

export function getChairById(structure: OrganizationStructure, chairId: string): ChairNode | undefined {
  return structure.chairs.find((c) => c.id === chairId);
}

export function getEquipmentById(structure: OrganizationStructure, equipmentId: string): EquipmentNode | undefined {
  return structure.equipment.find((e) => e.id === equipmentId);
}

// --- Dashboards (summary only, no analytics changes) ------------------------

export interface OrgDashboardSummary {
  branchCount: number;
  roomCount: number;
  chairCount: number;
  equipmentCount: number;
  activeBranches: number;
  operationalRooms: number;
  availableChairs: number;
  operationalEquipment: number;
  departments: DepartmentId[];
  equipmentByCategory: Record<EquipmentCategory, number>;
  roomsByType: Record<RoomType, number>;
  chairsByStatus: Record<ChairStatus, number>;
}

export function buildOrgDashboardSummary(structure: OrganizationStructure): OrgDashboardSummary {
  const equipmentByCategory = Object.fromEntries(
    EQUIPMENT_CATEGORIES.map((c) => [c.id, 0])
  ) as Record<EquipmentCategory, number>;
  const roomsByType = Object.fromEntries(
    ROOM_TYPES.map((t) => [t.id, 0])
  ) as Record<RoomType, number>;
  const chairsByStatus: Record<ChairStatus, number> = {
    Available: 0,
    Occupied: 0,
    Cleaning: 0,
    Maintenance: 0
  };

  structure.equipment.forEach((e) => {
    equipmentByCategory[e.category] = (equipmentByCategory[e.category] ?? 0) + 1;
  });
  structure.rooms.forEach((r) => {
    roomsByType[r.type] = (roomsByType[r.type] ?? 0) + 1;
  });
  structure.chairs.forEach((c) => {
    chairsByStatus[c.status] = (chairsByStatus[c.status] ?? 0) + 1;
  });

  const departments = new Set<DepartmentId>();
  structure.branches.forEach((b) => b.departments.forEach((d) => departments.add(d)));

  return {
    branchCount: structure.branches.length,
    roomCount: structure.rooms.length,
    chairCount: structure.chairs.length,
    equipmentCount: structure.equipment.length,
    activeBranches: structure.branches.filter((b) => b.status === 'Active').length,
    operationalRooms: structure.rooms.filter((r) => r.status === 'Operational').length,
    availableChairs: structure.chairs.filter((c) => c.status === 'Available').length,
    operationalEquipment: structure.equipment.filter((e) => e.status === 'Operational').length,
    departments: Array.from(departments),
    equipmentByCategory,
    roomsByType,
    chairsByStatus
  };
}

export interface BranchDashboardSummary {
  branch: BranchNode;
  roomCount: number;
  chairCount: number;
  equipmentCount: number;
  assignedStaffCount: number;
  operationalRooms: number;
  availableChairs: number;
  roomsByType: Partial<Record<RoomType, number>>;
}

export function buildBranchDashboardSummary(
  structure: OrganizationStructure,
  branchId: string
): BranchDashboardSummary | null {
  const branch = getBranchById(structure, branchId);
  if (!branch) return null;
  const rooms = structure.rooms.filter((r) => r.branchId === branchId);
  const chairs = structure.chairs.filter((c) => c.branchId === branchId);
  const equipment = structure.equipment.filter((e) => e.branchId === branchId);
  const roomsByType: Partial<Record<RoomType, number>> = {};
  rooms.forEach((r) => {
    roomsByType[r.type] = (roomsByType[r.type] ?? 0) + 1;
  });
  return {
    branch,
    roomCount: rooms.length,
    chairCount: chairs.length,
    equipmentCount: equipment.length,
    assignedStaffCount: branch.assignedStaff.length,
    operationalRooms: rooms.filter((r) => r.status === 'Operational').length,
    availableChairs: chairs.filter((c) => c.status === 'Available').length,
    roomsByType
  };
}

// --- Re-exported references for downstream reuse ---------------------------

export const ORG_WEEK_DAYS = WEEK_DAYS;
export const ORG_CURRENCIES = CURRENCIES;

export type { WorkspaceId, ResponsibilityId };
