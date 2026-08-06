'use client';

// ---------------------------------------------------------------------------
// Enterprise Organization Management UI — Organization / Branch / Department /
// Room / Chair / Equipment hierarchy with dashboards and search. Extends the
// existing enterprise architecture without touching analytics or scheduling.
// ---------------------------------------------------------------------------

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Building2,
  Users,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  DoorOpen,
  Armchair,
  Wrench,
  Layers,
  Network,
  Globe,
  Clock,
  CalendarDays,
  Phone,
  Mail,
  MapPin,
  BadgeCheck,
  CheckCircle2
} from 'lucide-react';
import {
  getOrganizationStructure,
  saveOrganizationStructure,
  addBranch,
  updateBranch,
  removeBranch,
  addRoom,
  updateRoom,
  removeRoom,
  addChair,
  updateChair,
  removeChair,
  addEquipment,
  updateEquipment,
  removeEquipment,
  assignStaffToBranch,
  assignDepartmentToBranch,
  assignDoctorToRoom,
  assignEquipmentToRoom,
  searchOrganizationStructure,
  buildOrgDashboardSummary,
  buildBranchDashboardSummary,
  getBranchById,
  getRoomById,
  ROOM_TYPES,
  EQUIPMENT_CATEGORIES,
  type OrganizationStructure,
  type BranchNode,
  type RoomNode,
  type ChairNode,
  type EquipmentNode,
  type RoomType,
  type RoomStatus,
  type ChairStatus,
  type EquipmentStatus,
  type EquipmentCategory
} from '@/utils/enterprise/organization';
import { DEPARTMENTS, type DepartmentId } from '@/utils/enterprise/directory';
import { getPracticeTypeById } from '@/utils/enterprise/practice';

type SubTab =
  | 'dashboard'
  | 'branches'
  | 'rooms'
  | 'chairs'
  | 'equipment'
  | 'departments';

interface OrgManagerProps {
  users: { id: string; name: string; role: string }[];
  onAudit: (action: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Maintenance: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Planned: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  Closed: 'bg-zinc-900 text-zinc-500 border-zinc-800',
  Operational: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'Out of Service': 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  Retired: 'bg-zinc-900 text-zinc-500 border-zinc-800',
  Available: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Occupied: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  Cleaning: 'bg-sky-500/15 text-sky-300 border-sky-500/30'
};

export default function OrganizationManager({ users, onAudit }: OrgManagerProps) {
  const t = useTranslations('OrgManager');

  const [structure, setStructure] = useState<OrganizationStructure | null>(null);
  const [activeTab, setActiveTab] = useState<SubTab>('dashboard');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<DepartmentId | 'all'>('all');
  const [branchFilter, setBranchFilter] = useState<string | 'all'>('all');
  const [roomTypeFilter, setRoomTypeFilter] = useState<RoomType | 'all'>('all');
  const [chairFilter, setChairFilter] = useState<ChairStatus | 'all'>('all');
  const [equipCategoryFilter, setEquipCategoryFilter] = useState<EquipmentCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Edit modals
  const [editBranch, setEditBranch] = useState<BranchNode | 'new' | null>(null);
  const [editRoom, setEditRoom] = useState<RoomNode | 'new' | null>(null);
  const [editChair, setEditChair] = useState<ChairNode | 'new' | null>(null);
  const [editEquipment, setEditEquipment] = useState<EquipmentNode | 'new' | null>(null);

  // Form field states
  const [formBranch, setFormBranch] = useState({ name: '', code: '', address: '', phone: '', manager: '', workingHours: '' });
  const [formRoom, setFormRoom] = useState({ name: '', number: '', floor: 'G', type: 'operatory' as RoomType, status: 'Planned' as RoomStatus, branchId: '', departmentId: 'dentistry' as DepartmentId });
  const [formChair, setFormChair] = useState({ number: '', status: 'Available' as ChairStatus, roomId: '', branchId: '', departmentId: 'dentistry' as DepartmentId });
  const [formEquipment, setFormEquipment] = useState({ name: '', category: 'clinical' as EquipmentCategory, serialNumber: '', manufacturer: '', model: '', purchaseDate: '', warranty: '', maintenanceSchedule: 'Annual', status: 'Operational' as EquipmentStatus, branchId: '', roomId: '' });

  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [branchDeptAssignee, setBranchDeptAssignee] = useState<{ branchId: string; dept: DepartmentId } | null>(null);
  const [roomDoctorAssignee, setRoomDoctorAssignee] = useState<{ roomId: string; doctorId: string; active: boolean } | null>(null);
  const [staffAssignBranchId, setStaffAssignBranchId] = useState<string | null>(null);
  const [staffAssignSelection, setStaffAssignSelection] = useState<Set<string>>(new Set());
  const [equipRoomAssignee, setEquipRoomAssignee] = useState<{ equipmentId: string; roomId: string } | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    setStructure(getOrganizationStructure());
  }, []);

  useEffect(() => {
    if (!structure) return;
    if (selectedBranchId && !structure.branches.some((b) => b.id === selectedBranchId)) {
      setSelectedBranchId(null);
    }
    if (branchFilter !== 'all' && !structure.branches.some((b) => b.id === branchFilter)) {
      setBranchFilter('all');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structure]);

  const persist = (next: OrganizationStructure) => {
    setStructure(next);
    saveOrganizationStructure(next);
  };

  const flash = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const results = useMemo(
    () =>
      structure
        ? searchOrganizationStructure(
            structure,
            search,
            deptFilter,
            branchFilter,
            roomTypeFilter,
            chairFilter,
            equipCategoryFilter,
            statusFilter as 'all' | 'Active' | 'Maintenance' | 'Planned' | 'Closed'
          )
        : { organizations: [], branches: [], departments: [], rooms: [], chairs: [], equipment: [] },
    [structure, search, deptFilter, branchFilter, roomTypeFilter, chairFilter, equipCategoryFilter, statusFilter]
  );

  if (!structure) {
    return (
      <div className="p-10 card-elevated rounded-3xl text-center text-sm text-zinc-500">Loading…</div>
    );
  }

  const summary = buildOrgDashboardSummary(structure);

  const selectedBranchSummary = selectedBranchId
    ? buildBranchDashboardSummary(structure, selectedBranchId)
    : null;

  const isConsolidated = structure.organization.practiceTypeId === 'solo' || structure.organization.practiceTypeId === 'small-clinic';

  const staffOptions = users;
  const doctorOptions = users.filter((u) => /doctor|owner/i.test(u.role));

  // ---- Handlers ----
  const openNewBranch = () => {
    setFormBranch({ name: '', code: '', address: '', phone: '', manager: '', workingHours: '09:00 - 18:00' });
    setEditBranch('new');
  };
  const openEditBranch = (b: BranchNode) => {
    setFormBranch({ name: b.name, code: b.code, address: b.address, phone: b.phone, manager: b.manager, workingHours: b.workingHours });
    setEditBranch(b);
  };
  const submitBranch = () => {
    if (!formBranch.name.trim()) return;
    if (editBranch === 'new') {
      const next = addBranch(structure, {
        name: formBranch.name.trim(),
        code: formBranch.code.trim() || 'BR',
        address: formBranch.address,
        phone: formBranch.phone,
        manager: formBranch.manager,
        workingHours: formBranch.workingHours
      });
      persist(next);
      onAudit(`Added branch [${formBranch.name.trim()}].`);
      flash('branch added');
    } else if (editBranch) {
      const next = updateBranch(structure, editBranch.id, {
        name: formBranch.name.trim(),
        code: formBranch.code.trim(),
        address: formBranch.address,
        phone: formBranch.phone,
        manager: formBranch.manager,
        workingHours: formBranch.workingHours
      });
      persist(next);
      onAudit(`Updated branch [${editBranch.id}] ${formBranch.name.trim()}.`);
      flash('branch updated');
    }
    setEditBranch(null);
  };
  const handleDeleteBranch = (b: BranchNode) => {
    const next = removeBranch(structure, b.id);
    persist(next);
    onAudit(`Removed branch [${b.id}] ${b.name}.`);
    flash('branch removed');
  };

  const openNewRoom = () => {
    const firstBranch = structure.branches[0];
    setFormRoom({ name: '', number: '', floor: 'G', type: 'operatory', status: 'Planned', branchId: firstBranch?.id ?? '', departmentId: 'dentistry' });
    setEditRoom('new');
  };
  const openEditRoom = (r: RoomNode) => {
    setFormRoom({ name: r.name, number: r.number, floor: r.floor, type: r.type, status: r.status, branchId: r.branchId, departmentId: r.departmentId });
    setEditRoom(r);
  };
  const submitRoom = () => {
    if (!formRoom.name.trim()) return;
    if (editRoom === 'new') {
      const next = addRoom(structure, {
        name: formRoom.name.trim(),
        number: formRoom.number.trim() || formRoom.name.trim(),
        floor: formRoom.floor,
        type: formRoom.type,
        status: formRoom.status,
        branchId: formRoom.branchId,
        departmentId: formRoom.departmentId
      });
      persist(next);
      onAudit(`Added room [${formRoom.name.trim()}] to branch ${formRoom.branchId}.`);
      flash('room added');
    } else if (editRoom) {
      const next = updateRoom(structure, editRoom.id, {
        name: formRoom.name.trim(),
        number: formRoom.number.trim(),
        floor: formRoom.floor,
        type: formRoom.type,
        status: formRoom.status,
        branchId: formRoom.branchId,
        departmentId: formRoom.departmentId
      });
      persist(next);
      onAudit(`Updated room [${editRoom.id}] ${formRoom.name.trim()}.`);
      flash('room updated');
    }
    setEditRoom(null);
  };
  const handleDeleteRoom = (r: RoomNode) => {
    const next = removeRoom(structure, r.id);
    persist(next);
    onAudit(`Removed room [${r.id}] ${r.name}.`);
    flash('room removed');
  };

  const openNewChair = () => {
    const firstRoom = structure.rooms[0];
    setFormChair({ number: '', status: 'Available', roomId: firstRoom?.id ?? '', branchId: firstRoom?.branchId ?? '', departmentId: firstRoom?.departmentId ?? 'dentistry' });
    setEditChair('new');
  };
  const openEditChair = (c: ChairNode) => {
    setFormChair({ number: c.number, status: c.status, roomId: c.roomId, branchId: c.branchId, departmentId: c.departmentId });
    setEditChair(c);
  };
  const submitChair = () => {
    if (!formChair.number.trim()) return;
    if (editChair === 'new') {
      const next = addChair(structure, {
        number: formChair.number.trim(),
        status: formChair.status,
        roomId: formChair.roomId,
        branchId: formChair.branchId,
        departmentId: formChair.departmentId
      });
      persist(next);
      onAudit(`Added chair [${formChair.number.trim()}] in room ${formChair.roomId}.`);
      flash('chair added');
    } else if (editChair) {
      const next = updateChair(structure, editChair.id, {
        number: formChair.number.trim(),
        status: formChair.status,
        roomId: formChair.roomId,
        branchId: formChair.branchId,
        departmentId: formChair.departmentId
      });
      persist(next);
      onAudit(`Updated chair [${editChair.id}] ${formChair.number.trim()}.`);
      flash('chair updated');
    }
    setEditChair(null);
  };
  const handleDeleteChair = (c: ChairNode) => {
    const next = removeChair(structure, c.id);
    persist(next);
    onAudit(`Removed chair [${c.id}] ${c.number}.`);
    flash('chair removed');
  };

  const openNewEquipment = () => {
    const firstBranch = structure.branches[0];
    setFormEquipment({ name: '', category: 'clinical', serialNumber: '', manufacturer: '', model: '', purchaseDate: '', warranty: '', maintenanceSchedule: 'Annual', status: 'Operational', branchId: firstBranch?.id ?? '', roomId: '' });
    setEditEquipment('new');
  };
  const openEditEquipment = (e: EquipmentNode) => {
    setFormEquipment({ name: e.name, category: e.category, serialNumber: e.serialNumber, manufacturer: e.manufacturer, model: e.model, purchaseDate: e.purchaseDate, warranty: e.warranty, maintenanceSchedule: e.maintenanceSchedule, status: e.status, branchId: e.branchId, roomId: e.roomId });
    setEditEquipment(e);
  };
  const submitEquipment = () => {
    if (!formEquipment.name.trim()) return;
    if (editEquipment === 'new') {
      const next = addEquipment(structure, {
        name: formEquipment.name.trim(),
        category: formEquipment.category,
        serialNumber: formEquipment.serialNumber,
        manufacturer: formEquipment.manufacturer,
        model: formEquipment.model,
        purchaseDate: formEquipment.purchaseDate,
        warranty: formEquipment.warranty,
        maintenanceSchedule: formEquipment.maintenanceSchedule,
        status: formEquipment.status,
        branchId: formEquipment.branchId,
        roomId: formEquipment.roomId
      });
      persist(next);
      onAudit(`Added equipment [${formEquipment.name.trim()}] to branch ${formEquipment.branchId}.`);
      flash('equipment added');
    } else if (editEquipment) {
      const next = updateEquipment(structure, editEquipment.id, {
        name: formEquipment.name.trim(),
        category: formEquipment.category,
        serialNumber: formEquipment.serialNumber,
        manufacturer: formEquipment.manufacturer,
        model: formEquipment.model,
        purchaseDate: formEquipment.purchaseDate,
        warranty: formEquipment.warranty,
        maintenanceSchedule: formEquipment.maintenanceSchedule,
        status: formEquipment.status,
        branchId: formEquipment.branchId,
        roomId: formEquipment.roomId
      });
      persist(next);
      onAudit(`Updated equipment [${editEquipment.id}] ${formEquipment.name.trim()}.`);
      flash('equipment updated');
    }
    setEditEquipment(null);
  };
  const handleDeleteEquipment = (e: EquipmentNode) => {
    const next = removeEquipment(structure, e.id);
    persist(next);
    onAudit(`Removed equipment [${e.id}] ${e.name}.`);
    flash('equipment removed');
  };

  const toggleStaffAssignee = (id: string) => {
    setStaffAssignSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const submitStaffAssign = () => {
    if (!staffAssignBranchId) return;
    const next = assignStaffToBranch(structure, staffAssignBranchId, Array.from(staffAssignSelection));
    persist(next);
    onAudit(`Assigned ${staffAssignSelection.size} staff member(s) to branch [${staffAssignBranchId}].`);
    flash('staff assigned');
    setStaffAssignBranchId(null);
    setStaffAssignSelection(new Set());
  };

  const roomOptions = structure.rooms.filter((r) => !formEquipment.branchId || r.branchId === formEquipment.branchId);

  const filterSelect = (label: string, value: string, onChange: (v: string) => void, options: { value: string; label: string }[]) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-xl text-xs text-white outline-none bg-zinc-950 border border-zinc-800 focus:border-purple-500/50 cursor-pointer"
    >
      <option value="all">{t('all')} — {label}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );

  const branchOptions = structure.branches.map((b) => ({ value: b.id, label: b.name }));
  const deptOptions = DEPARTMENTS.map((d) => ({ value: d.id, label: d.name }));
  const roomTypeOptions = ROOM_TYPES.map((r) => ({ value: r.id, label: t(`roomTypes.${r.id}`) }));
  const chairStatusOptions: { value: ChairStatus; label: string }[] = ['Available', 'Occupied', 'Cleaning', 'Maintenance'].map((s) => ({ value: s as ChairStatus, label: t(`filterByChairStatus`) + ': ' + s }));
  const equipCatOptions = EQUIPMENT_CATEGORIES.map((c) => ({ value: c.id, label: t(`equipmentCategories.${c.id}`) }));
  const statusOptions = ['Active', 'Maintenance', 'Planned', 'Closed'].map((s) => ({ value: s, label: s }));

  const subTabs: { id: SubTab; label: string; icon: typeof Building2; count: number }[] = [
    { id: 'dashboard', label: t('orgDashboard'), icon: Network, count: 0 },
    { id: 'branches', label: t('branches'), icon: Building2, count: structure.branches.length },
    { id: 'departments', label: t('department'), icon: Layers, count: summary.departments.length },
    { id: 'rooms', label: t('rooms'), icon: DoorOpen, count: structure.rooms.length },
    { id: 'chairs', label: t('chairs'), icon: Armchair, count: structure.chairs.length },
    { id: 'equipment', label: t('equipmentCount'), icon: Wrench, count: structure.equipment.length }
  ];

  const orgName = structure.organization.name;

  return (
    <div className="space-y-4">
      {/* Header / status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={openNewBranch} className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> {t('addBranch')}
          </button>
          {statusMsg && (
            <span className="text-[11px] font-bold px-3 py-1.5 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {statusMsg}
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950/60 border border-zinc-800 px-2 py-1 rounded-lg">
          {t('hierarchy')}: {t('platform')} › {t('organization')} › {t('branch')} › {t('department')} › {t('room')} › {t('chair')} › {t('equipment')}
        </span>
      </div>

      {/* Organization identity card */}
      <div className="p-4 card-gradient rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="p-3 rounded-2xl shrink-0 bg-white/10 border border-white/15 text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-black text-white uppercase tracking-tight truncate">{orgName}</h3>
            <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5 flex-wrap font-sans">
              <span className="font-mono">{getPracticeTypeById(structure.organization.practiceTypeId)?.name ?? structure.organization.practiceTypeId}</span>
              <span className="text-zinc-600">•</span>
              {isConsolidated ? 'CONSOLIDATED LAYOUT' : 'SEPARATED BY DEPARTMENT'}
              <span className="text-zinc-600">•</span>
              {structure.organization.currency} • {structure.organization.timezone}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0 text-[10px] font-mono">
          <span className="px-2 py-1 rounded-lg bg-zinc-950/60 border border-zinc-800 text-zinc-400 flex items-center gap-1.5">
            <Globe className="w-3 h-3" /> {structure.organization.language.toUpperCase()}
          </span>
          <span className="px-2 py-1 rounded-lg bg-zinc-950/60 border border-zinc-800 text-zinc-400 flex items-center gap-1.5">
            <CalendarDays className="w-3 h-3" /> {structure.organization.workingDays.length} {t('workingDaysLabel')}
          </span>
          <span className="px-2 py-1 rounded-lg bg-zinc-950/60 border border-zinc-800 text-zinc-400 flex items-center gap-1.5">
            <Clock className="w-3 h-3" /> {structure.organization.workingHours.open} – {structure.organization.workingHours.close}
          </span>
          <span className="px-2 py-1 rounded-lg bg-emerald-500/10 border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
            <BadgeCheck className="w-3 h-3" /> {structure.organization.license.number}
          </span>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none p-1.5 card-elevated rounded-2xl">
        {subTabs.map((s) => {
          const Icon = s.icon;
          const active = activeTab === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveTab(s.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                active ? 'bg-purple-500/15 text-purple-300 border-purple-500/40' : 'bg-zinc-950/60 text-zinc-500 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {s.label}
              {s.count > 0 && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">{s.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Global search + filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-2">
        <div className="relative md:col-span-2 lg:col-span-3">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-8 pr-3 py-2 rounded-xl text-xs text-white outline-none bg-zinc-950 border border-zinc-800 focus:border-purple-500/50"
          />
        </div>
        {filterSelect(t('filterByBranch'), branchFilter, setBranchFilter as (v: string) => void, branchOptions)}
        {filterSelect(t('filterByDepartment'), deptFilter, setDeptFilter as (v: string) => void, deptOptions)}
        {filterSelect(t('filterByRoomType'), roomTypeFilter, setRoomTypeFilter as (v: string) => void, roomTypeOptions)}
        {filterSelect(t('filterByCategory'), equipCategoryFilter, setEquipCategoryFilter as (v: string) => void, equipCatOptions)}
        {filterSelect(t('filterByStatus'), statusFilter, setStatusFilter as (v: string) => void, statusOptions)}
        {filterSelect(t('filterByChairStatus'), chairFilter, setChairFilter as (v: string) => void, chairStatusOptions)}
      </div>

      {/* ----------------- DASHBOARD ----------------- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          {/* Org summary strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <div className="p-3 card-elevated rounded-2xl">
              <p className="text-[9px] font-mono text-zinc-500 uppercase flex items-center gap-1.5"><Building2 className="w-3 h-3 text-emerald-400" /> {t('summaryBranches')}</p>
              <p className="text-xl font-black text-white">{summary.branchCount}</p>
              <p className="text-[9px] font-mono text-zinc-500">{summary.activeBranches} {t('summaryActiveBranches')}</p>
            </div>
            <div className="p-3 card-elevated rounded-2xl">
              <p className="text-[9px] font-mono text-zinc-500 uppercase flex items-center gap-1.5"><DoorOpen className="w-3 h-3 text-sky-400" /> {t('summaryRooms')}</p>
              <p className="text-xl font-black text-white">{summary.roomCount}</p>
              <p className="text-[9px] font-mono text-zinc-500">{summary.operationalRooms} {t('summaryOperationalRooms')}</p>
            </div>
            <div className="p-3 card-elevated rounded-2xl">
              <p className="text-[9px] font-mono text-zinc-500 uppercase flex items-center gap-1.5"><Armchair className="w-3 h-3 text-purple-400" /> {t('summaryChairs')}</p>
              <p className="text-xl font-black text-white">{summary.chairCount}</p>
              <p className="text-[9px] font-mono text-zinc-500">{summary.availableChairs} {t('summaryAvailableChairs')}</p>
            </div>
            <div className="p-3 card-elevated rounded-2xl">
              <p className="text-[9px] font-mono text-zinc-500 uppercase flex items-center gap-1.5"><Wrench className="w-3 h-3 text-amber-400" /> {t('summaryEquipment')}</p>
              <p className="text-xl font-black text-white">{summary.equipmentCount}</p>
              <p className="text-[9px] font-mono text-zinc-500">{summary.operationalEquipment} {t('summaryOperationalEquipment')}</p>
            </div>
          </div>

          {/* Org details + branch dashboard side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Org details */}
            <div className="p-4 card-elevated rounded-3xl space-y-3 lg:col-span-1">
              <h4 className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Network className="w-4 h-4 text-purple-400" /> {t('orgDetails')}
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-zinc-500">{t('fieldBrandColor')}</span><span className="flex items-center gap-1.5 font-bold"><span className="w-2.5 h-2.5 rounded-full" style={{ background: structure.organization.brandColor }} /> {structure.organization.brandColor}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">{t('fieldLanguage')}</span><span className="font-bold text-zinc-200">{structure.organization.language.toUpperCase()}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">{t('fieldTimezone')}</span><span className="font-bold text-zinc-200">{structure.organization.timezone}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">{t('currencyLabel')}</span><span className="font-bold text-zinc-200">{structure.organization.currency}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">{t('workingDaysLabel')}</span><span className="font-bold text-zinc-200">{structure.organization.workingDays.map((d) => t(`days.${d}`)).join(', ')}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">{t('workingHoursLabel')}</span><span className="font-bold text-zinc-200">{structure.organization.workingHours.open} – {structure.organization.workingHours.close}</span></div>
              </div>
              <div className="pt-3 border-t border-zinc-900 space-y-2 text-[10px] font-mono text-zinc-500">
                <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {structure.organization.contact.phone}</div>
                <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {structure.organization.contact.email}</div>
                <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {structure.organization.contact.address}</div>
                <div className="flex items-center gap-1.5"><BadgeCheck className="w-3 h-3 text-emerald-400" /> {structure.organization.license.number} – {structure.organization.license.status}</div>
              </div>
            </div>

            {/* Branch dashboard selector */}
            <div className="p-4 card-elevated rounded-3xl space-y-3 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-400" /> {t('branchDashboard')}
                </h4>
                <select
                  value={selectedBranchId ?? ''}
                  onChange={(e) => setSelectedBranchId(e.target.value || null)}
                  className="w-52 px-3 py-2 rounded-xl text-xs text-white outline-none bg-zinc-950 border border-zinc-800 focus:border-purple-500/50 cursor-pointer"
                >
                  <option value="">{t('selectBranch')}</option>
                  {structure.branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>
              {selectedBranchSummary ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-[10px] font-mono px-2 py-1 rounded-lg border ${STATUS_STYLES[selectedBranchSummary.branch.status] ?? ''}`}>{selectedBranchSummary.branch.status}</span>
                    <span className="text-[10px] font-mono text-zinc-500">{selectedBranchSummary.branch.address}</span>
                    <span className="text-[10px] font-mono text-zinc-500">{selectedBranchSummary.branch.workingHours}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                      <p className="text-[9px] font-mono text-zinc-500">{t('summaryRooms')}</p>
                      <p className="text-lg font-black text-white">{selectedBranchSummary.roomCount}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                      <p className="text-[9px] font-mono text-zinc-500">{t('summaryChairs')}</p>
                      <p className="text-lg font-black text-white">{selectedBranchSummary.chairCount}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                      <p className="text-[9px] font-mono text-zinc-500">{t('summaryEquipment')}</p>
                      <p className="text-lg font-black text-white">{selectedBranchSummary.equipmentCount}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                      <p className="text-[9px] font-mono text-zinc-500">{t('fieldAssignedStaff')}</p>
                      <p className="text-lg font-black text-white">{selectedBranchSummary.assignedStaffCount}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                      <p className="text-[9px] font-mono text-zinc-500">{t('summaryOperationalRooms')}</p>
                      <p className="text-lg font-black text-white">{selectedBranchSummary.operationalRooms}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedBranchSummary.branch.departments.map((d) => (
                      <span key={d} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                        {DEPARTMENTS.find((x) => x.id === d)?.name ?? d}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-500 py-8 text-center">{t('selectBranch')}</p>
              )}
            </div>
          </div>

          {/* Distribution summaries */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 card-elevated rounded-3xl">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono mb-3">{t('chartsRoomsByType')}</h4>
              <div className="space-y-1.5">
                {ROOM_TYPES.map((rt) => (
                  <div key={rt.id} className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400 w-28 truncate">{t(`roomTypes.${rt.id}`)}</span>
                    <div className="flex-1 h-2 rounded bg-zinc-900 overflow-hidden">
                      <div className="h-full bg-sky-500/70 rounded" style={{ width: `${Math.min(100, ((summary.roomsByType[rt.id] ?? 0) / Math.max(1, summary.roomCount)) * 100)}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 w-6 text-right">{summary.roomsByType[rt.id] ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 card-elevated rounded-3xl">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono mb-3">{t('chartsChairsByStatus')}</h4>
              <div className="space-y-1.5">
                {(['Available', 'Occupied', 'Cleaning', 'Maintenance'] as ChairStatus[]).map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400 w-28 truncate">{s}</span>
                    <div className="flex-1 h-2 rounded bg-zinc-900 overflow-hidden">
                      <div className="h-full bg-purple-500/70 rounded" style={{ width: `${Math.min(100, ((summary.chairsByStatus[s] ?? 0) / Math.max(1, summary.chairCount)) * 100)}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 w-6 text-right">{summary.chairsByStatus[s] ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 card-elevated rounded-3xl">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono mb-3">{t('chartsEquipmentByCategory')}</h4>
              <div className="space-y-1.5">
                {EQUIPMENT_CATEGORIES.map((c) => (
                  <div key={c.id} className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400 w-28 truncate">{t(`equipmentCategories.${c.id}`)}</span>
                    <div className="flex-1 h-2 rounded bg-zinc-900 overflow-hidden">
                      <div className="h-full bg-amber-500/70 rounded" style={{ width: `${Math.min(100, ((summary.equipmentByCategory[c.id] ?? 0) / Math.max(1, summary.equipmentCount)) * 100)}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 w-6 text-right">{summary.equipmentByCategory[c.id] ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- BRANCHES ----------------- */}
      {activeTab === 'branches' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {results.branches.length === 0 && (
            <div className="lg:col-span-3 p-10 card-elevated rounded-3xl text-center text-sm text-zinc-500">{t('noResults')}</div>
          )}
          {results.branches.map((b) => {
            const roomCount = structure.rooms.filter((r) => r.branchId === b.id).length;
            const chairCount = structure.chairs.filter((c) => c.branchId === b.id).length;
            const eqCount = structure.equipment.filter((e) => e.branchId === b.id).length;
            return (
              <div key={b.id} className="p-3.5 card-elevated rounded-3xl space-y-2.5 border border-zinc-800/80">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-2 rounded-xl shrink-0 bg-sky-500/10 border border-sky-500/30 text-sky-300">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-white truncate">{b.name}</p>
                      <p className="text-[9px] font-mono text-zinc-500">{b.code}</p>
                    </div>
                  </div>
                  <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${STATUS_STYLES[b.status] ?? ''}`}>{b.status}</span>
                </div>
                <div className="text-[10px] font-mono text-zinc-500 space-y-1">
                  <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {b.address || '—'}</p>
                  <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {b.phone || '—'}</p>
                  <p className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {b.workingHours || '—'}</p>
                  <p className="flex items-center gap-1.5"><Users className="w-3 h-3" /> {b.manager || '—'}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">{roomCount} {t('rooms')}</span>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">{chairCount} {t('chairs')}</span>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">{eqCount} {t('equipmentCount')}</span>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">{b.assignedStaff.length} {t('fieldAssignedStaff')}</span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <button onClick={() => openEditBranch(b)} className="btn-secondary px-2 py-1 text-[10px] font-bold rounded-lg inline-flex items-center gap-1 cursor-pointer">
                    <Pencil className="w-3 h-3" /> {t('editBranch')}
                  </button>
                  <button onClick={() => { setStaffAssignBranchId(b.id); setStaffAssignSelection(new Set(b.assignedStaff)); }} className="btn-secondary px-2 py-1 text-[10px] font-bold rounded-lg inline-flex items-center gap-1 cursor-pointer">
                    <Users className="w-3 h-3" /> {t('assignStaff')}
                  </button>
                  <button onClick={() => { setSelectedBranchId(b.id); setActiveTab('departments'); }} className="btn-secondary px-2 py-1 text-[10px] font-bold rounded-lg inline-flex items-center gap-1 cursor-pointer">
                    <Layers className="w-3 h-3" /> {t('assignDepartments')}
                  </button>
                  <button onClick={() => handleDeleteBranch(b)} className="btn-secondary px-2 py-1 text-[10px] font-bold rounded-lg inline-flex items-center gap-1 cursor-pointer text-rose-300">
                    <Trash2 className="w-3 h-3" /> {t('deleteBranch')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ----------------- DEPARTMENTS ----------------- */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {DEPARTMENTS.map((d) => {
            const assignedToBranches = structure.branches.filter((b) => b.departments.includes(d.id));
            const rooms = structure.rooms.filter((r) => r.departmentId === d.id);
            const chairs = structure.chairs.filter((c) => c.departmentId === d.id);
            const branch = selectedBranchId ? getBranchById(structure, selectedBranchId) : null;
            const isInSelected = branch ? branch.departments.includes(d.id) : false;
            return (
              <div key={d.id} className="p-3.5 card-elevated rounded-3xl space-y-2 border border-zinc-800/80">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-2 rounded-xl shrink-0 bg-violet-500/10 border border-violet-500/30 text-violet-300">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-white truncate">{d.name}</p>
                      <p className="text-[9px] font-mono text-zinc-500">{d.code}</p>
                    </div>
                  </div>
                  {branch && (
                    <button
                      onClick={() => {
                        const next = assignDepartmentToBranch(structure, branch.id, d.id, !isInSelected);
                        persist(next);
                        onAudit(`Assigned department [${d.id}] to branch [${branch.id}] = ${!isInSelected}.`);
                        flash('department assignment updated');
                      }}
                      className={`px-2 py-1 rounded-lg text-[9px] font-bold border transition-all cursor-pointer ${isInSelected ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-700'}`}
                    >
                      {isInSelected ? 'ASSIGNED' : 'ASSIGN'}
                    </button>
                  )}
                </div>
                <div className="text-[9px] font-mono text-zinc-500 space-y-1">
                  <p>{t('summaryBranches')}: {assignedToBranches.length > 0 ? assignedToBranches.map((b) => b.name).join(', ') : '—'}</p>
                  <p>{t('rooms')}: {rooms.length} • {t('chairs')}: {chairs.length}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ----------------- ROOMS ----------------- */}
      {activeTab === 'rooms' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={openNewRoom} className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> {t('addRoom')}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {results.rooms.length === 0 && (
              <div className="lg:col-span-3 p-10 card-elevated rounded-3xl text-center text-sm text-zinc-500">{t('noResults')}</div>
            )}
            {results.rooms.map((r) => {
              const branch = getBranchById(structure, r.branchId);
              const chairs = structure.chairs.filter((c) => c.roomId === r.id);
              const eq = structure.equipment.filter((e) => e.roomId === r.id);
              return (
                <div key={r.id} className="p-3.5 card-elevated rounded-3xl space-y-2.5 border border-zinc-800/80">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-2 rounded-xl shrink-0 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                        <DoorOpen className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-white truncate">{r.name}</p>
                        <p className="text-[9px] font-mono text-zinc-500">{r.number} • {t('fieldFloor')} {r.floor}</p>
                      </div>
                    </div>
                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${STATUS_STYLES[r.status] ?? ''}`}>{r.status}</span>
                  </div>
                  <div className="text-[9px] font-mono text-zinc-500 space-y-1">
                    <p>{t('fieldAssignedDepartments')}: {DEPARTMENTS.find((x) => x.id === r.departmentId)?.name ?? r.departmentId}</p>
                    <p>{t('branch')}: {branch?.name ?? r.branchId}</p>
                    <p className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-zinc-400">{t('fieldAssignedDoctors')}:</span>
                      {r.doctors.length > 0 ? r.doctors.map((dId) => (
                        <span key={dId} className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                          {users.find((u) => u.id === dId)?.name ?? dId}
                        </span>
                      )) : '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">{chairs.length} {t('chairs')}</span>
                    <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">{eq.length} {t('equipmentCount')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                    <button onClick={() => openEditRoom(r)} className="btn-secondary px-2 py-1 text-[10px] font-bold rounded-lg inline-flex items-center gap-1 cursor-pointer">
                      <Pencil className="w-3 h-3" /> {t('editRoom')}
                    </button>
                    <button onClick={() => setRoomDoctorAssignee({ roomId: r.id, doctorId: '', active: true })} className="btn-secondary px-2 py-1 text-[10px] font-bold rounded-lg inline-flex items-center gap-1 cursor-pointer">
                      <Users className="w-3 h-3" /> {t('assignDoctor')}
                    </button>
                    <button onClick={() => handleDeleteRoom(r)} className="btn-secondary px-2 py-1 text-[10px] font-bold rounded-lg inline-flex items-center gap-1 cursor-pointer text-rose-300">
                      <Trash2 className="w-3 h-3" /> {t('deleteRoom')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ----------------- CHAIRS ----------------- */}
      {activeTab === 'chairs' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={openNewChair} className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> {t('addChair')}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {results.chairs.length === 0 && (
              <div className="lg:col-span-4 p-10 card-elevated rounded-3xl text-center text-sm text-zinc-500">{t('noResults')}</div>
            )}
            {results.chairs.map((c) => {
              const room = getRoomById(structure, c.roomId);
              const branch = getBranchById(structure, c.branchId);
              return (
                <div key={c.id} className="p-3.5 card-elevated rounded-3xl space-y-2.5 border border-zinc-800/80">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-2 rounded-xl shrink-0 bg-purple-500/10 border border-purple-500/30 text-purple-300">
                        <Armchair className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-white truncate">{c.number}</p>
                        <p className="text-[9px] font-mono text-zinc-500">{c.id}</p>
                      </div>
                    </div>
                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${STATUS_STYLES[c.status] ?? ''}`}>{c.status}</span>
                  </div>
                  <div className="text-[9px] font-mono text-zinc-500 space-y-1">
                    <p>{t('room')}: {room?.name ?? c.roomId}</p>
                    <p>{t('branch')}: {branch?.name ?? c.branchId}</p>
                    <p>{t('department')}: {DEPARTMENTS.find((x) => x.id === c.departmentId)?.name ?? c.departmentId}</p>
                    <p>{t('fieldManager')}: {users.find((u) => u.id === c.doctorId)?.name ?? '—'}</p>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <button onClick={() => openEditChair(c)} className="btn-secondary px-2 py-1 text-[10px] font-bold rounded-lg inline-flex items-center gap-1 cursor-pointer">
                      <Pencil className="w-3 h-3" /> {t('editChair')}
                    </button>
                    <button onClick={() => handleDeleteChair(c)} className="btn-secondary px-2 py-1 text-[10px] font-bold rounded-lg inline-flex items-center gap-1 cursor-pointer text-rose-300">
                      <Trash2 className="w-3 h-3" /> {t('deleteChair')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ----------------- EQUIPMENT ----------------- */}
      {activeTab === 'equipment' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={openNewEquipment} className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> {t('addEquipment')}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {results.equipment.length === 0 && (
              <div className="lg:col-span-3 p-10 card-elevated rounded-3xl text-center text-sm text-zinc-500">{t('noResults')}</div>
            )}
            {results.equipment.map((e) => {
              const branch = getBranchById(structure, e.branchId);
              const room = getRoomById(structure, e.roomId);
              return (
                <div key={e.id} className="p-3.5 card-elevated rounded-3xl space-y-2.5 border border-zinc-800/80">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-2 rounded-xl shrink-0 bg-amber-500/10 border border-amber-500/30 text-amber-300">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-white truncate">{e.name}</p>
                        <p className="text-[9px] font-mono text-zinc-500">{e.category} • {e.serialNumber}</p>
                      </div>
                    </div>
                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${STATUS_STYLES[e.status] ?? ''}`}>{e.status}</span>
                  </div>
                  <div className="text-[9px] font-mono text-zinc-500 space-y-1">
                    <p>{e.manufacturer} • {e.model}</p>
                    <p>{t('branch')}: {branch?.name ?? e.branchId}</p>
                    <p>{t('room')}: {room?.name ?? (e.roomId || '—')}</p>
                    <p>{t('fieldMaintenance')}: {e.maintenanceSchedule} • {t('fieldWarranty')}: {e.warranty}</p>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                    <button onClick={() => openEditEquipment(e)} className="btn-secondary px-2 py-1 text-[10px] font-bold rounded-lg inline-flex items-center gap-1 cursor-pointer">
                      <Pencil className="w-3 h-3" /> {t('editEquipment')}
                    </button>
                    <button onClick={() => setEquipRoomAssignee({ equipmentId: e.id, roomId: e.roomId })} className="btn-secondary px-2 py-1 text-[10px] font-bold rounded-lg inline-flex items-center gap-1 cursor-pointer">
                      <DoorOpen className="w-3 h-3" /> {t('fieldAssignedRooms')}
                    </button>
                    <button onClick={() => handleDeleteEquipment(e)} className="btn-secondary px-2 py-1 text-[10px] font-bold rounded-lg inline-flex items-center gap-1 cursor-pointer text-rose-300">
                      <Trash2 className="w-3 h-3" /> {t('deleteEquipment')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------- BRANCH MODAL ---------- */}
      {editBranch && (
        <Modal title={editBranch === 'new' ? t('addBranch') : t('editBranch')} onClose={() => setEditBranch(null)}>
          <Field label={t('fieldName')}>
            <input value={formBranch.name} onChange={(e) => setFormBranch((p) => ({ ...p, name: e.target.value }))} className={inputCls} />
          </Field>
          <Field label={t('fieldCode')}>
            <input value={formBranch.code} onChange={(e) => setFormBranch((p) => ({ ...p, code: e.target.value }))} className={inputCls} />
          </Field>
          <Field label={t('fieldAddress')}>
            <input value={formBranch.address} onChange={(e) => setFormBranch((p) => ({ ...p, address: e.target.value }))} className={inputCls} />
          </Field>
          <Field label={t('fieldPhone')}>
            <input value={formBranch.phone} onChange={(e) => setFormBranch((p) => ({ ...p, phone: e.target.value }))} className={inputCls} />
          </Field>
          <Field label={t('fieldManager')}>
            <input value={formBranch.manager} onChange={(e) => setFormBranch((p) => ({ ...p, manager: e.target.value }))} className={inputCls} />
          </Field>
          <Field label={t('fieldWorkingHours')}>
            <input value={formBranch.workingHours} onChange={(e) => setFormBranch((p) => ({ ...p, workingHours: e.target.value }))} className={inputCls} />
          </Field>
          <ModalActions onCancel={() => setEditBranch(null)} onSubmit={submitBranch} submitLabel={t('save')} cancelLabel={t('cancel')} />
        </Modal>
      )}

      {/* ---------- ROOM MODAL ---------- */}
      {editRoom && (
        <Modal title={editRoom === 'new' ? t('addRoom') : t('editRoom')} onClose={() => setEditRoom(null)}>
          <Field label={t('fieldName')}>
            <input value={formRoom.name} onChange={(e) => setFormRoom((p) => ({ ...p, name: e.target.value }))} className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('fieldNumber')}>
              <input value={formRoom.number} onChange={(e) => setFormRoom((p) => ({ ...p, number: e.target.value }))} className={inputCls} />
            </Field>
            <Field label={t('fieldFloor')}>
              <input value={formRoom.floor} onChange={(e) => setFormRoom((p) => ({ ...p, floor: e.target.value }))} className={inputCls} />
            </Field>
          </div>
          <Field label={t('filterByRoomType')}>
            <select value={formRoom.type} onChange={(e) => setFormRoom((p) => ({ ...p, type: e.target.value as RoomType }))} className={inputCls}>
              {ROOM_TYPES.map((rt) => (
                <option key={rt.id} value={rt.id}>{t(`roomTypes.${rt.id}`)}</option>
              ))}
            </select>
          </Field>
          <Field label={t('filterByStatus')}>
            <select value={formRoom.status} onChange={(e) => setFormRoom((p) => ({ ...p, status: e.target.value as RoomStatus }))} className={inputCls}>
              {(['Operational', 'Maintenance', 'Out of Service', 'Planned'] as RoomStatus[]).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label={t('branch')}>
            <select value={formRoom.branchId} onChange={(e) => setFormRoom((p) => ({ ...p, branchId: e.target.value }))} className={inputCls}>
              {structure.branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </Field>
          <Field label={t('department')}>
            <select value={formRoom.departmentId} onChange={(e) => setFormRoom((p) => ({ ...p, departmentId: e.target.value as DepartmentId }))} className={inputCls}>
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </Field>
          <ModalActions onCancel={() => setEditRoom(null)} onSubmit={submitRoom} submitLabel={t('save')} cancelLabel={t('cancel')} />
        </Modal>
      )}

      {/* ---------- CHAIR MODAL ---------- */}
      {editChair && (
        <Modal title={editChair === 'new' ? t('addChair') : t('editChair')} onClose={() => setEditChair(null)}>
          <Field label={t('fieldNumber')}>
            <input value={formChair.number} onChange={(e) => setFormChair((p) => ({ ...p, number: e.target.value }))} className={inputCls} />
          </Field>
          <Field label={t('filterByChairStatus')}>
            <select value={formChair.status} onChange={(e) => setFormChair((p) => ({ ...p, status: e.target.value as ChairStatus }))} className={inputCls}>
              {(['Available', 'Occupied', 'Cleaning', 'Maintenance'] as ChairStatus[]).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label={t('room')}>
            <select value={formChair.roomId} onChange={(e) => setFormChair((p) => ({ ...p, roomId: e.target.value }))} className={inputCls}>
              {structure.rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </Field>
          <Field label={t('department')}>
            <select value={formChair.departmentId} onChange={(e) => setFormChair((p) => ({ ...p, departmentId: e.target.value as DepartmentId }))} className={inputCls}>
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </Field>
          <ModalActions onCancel={() => setEditChair(null)} onSubmit={submitChair} submitLabel={t('save')} cancelLabel={t('cancel')} />
        </Modal>
      )}

      {/* ---------- EQUIPMENT MODAL ---------- */}
      {editEquipment && (
        <Modal title={editEquipment === 'new' ? t('addEquipment') : t('editEquipment')} onClose={() => setEditEquipment(null)}>
          <Field label={t('fieldName')}>
            <input value={formEquipment.name} onChange={(e) => setFormEquipment((p) => ({ ...p, name: e.target.value }))} className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('filterByCategory')}>
              <select value={formEquipment.category} onChange={(e) => setFormEquipment((p) => ({ ...p, category: e.target.value as EquipmentCategory }))} className={inputCls}>
                {EQUIPMENT_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{t(`equipmentCategories.${c.id}`)}</option>
                ))}
              </select>
            </Field>
            <Field label={t('fieldSerial')}>
              <input value={formEquipment.serialNumber} onChange={(e) => setFormEquipment((p) => ({ ...p, serialNumber: e.target.value }))} className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('fieldManufacturer')}>
              <input value={formEquipment.manufacturer} onChange={(e) => setFormEquipment((p) => ({ ...p, manufacturer: e.target.value }))} className={inputCls} />
            </Field>
            <Field label={t('fieldModel')}>
              <input value={formEquipment.model} onChange={(e) => setFormEquipment((p) => ({ ...p, model: e.target.value }))} className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('fieldPurchaseDate')}>
              <input value={formEquipment.purchaseDate} onChange={(e) => setFormEquipment((p) => ({ ...p, purchaseDate: e.target.value }))} className={inputCls} />
            </Field>
            <Field label={t('fieldWarranty')}>
              <input value={formEquipment.warranty} onChange={(e) => setFormEquipment((p) => ({ ...p, warranty: e.target.value }))} className={inputCls} />
            </Field>
          </div>
          <Field label={t('fieldMaintenance')}>
            <input value={formEquipment.maintenanceSchedule} onChange={(e) => setFormEquipment((p) => ({ ...p, maintenanceSchedule: e.target.value }))} className={inputCls} />
          </Field>
          <Field label={t('filterByStatus')}>
            <select value={formEquipment.status} onChange={(e) => setFormEquipment((p) => ({ ...p, status: e.target.value as EquipmentStatus }))} className={inputCls}>
              {(['Operational', 'Maintenance', 'Out of Service', 'Retired'] as EquipmentStatus[]).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label={t('branch')}>
            <select value={formEquipment.branchId} onChange={(e) => setFormEquipment((p) => ({ ...p, branchId: e.target.value, roomId: '' }))} className={inputCls}>
              {structure.branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </Field>
          <Field label={t('room')}>
            <select value={formEquipment.roomId} onChange={(e) => setFormEquipment((p) => ({ ...p, roomId: e.target.value }))} className={inputCls}>
              <option value="">—</option>
              {roomOptions.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </Field>
          <ModalActions onCancel={() => setEditEquipment(null)} onSubmit={submitEquipment} submitLabel={t('save')} cancelLabel={t('cancel')} />
        </Modal>
      )}

      {/* ---------- STAFF ASSIGN MODAL ---------- */}
      {staffAssignBranchId && (
        <Modal title={t('assignStaff')} onClose={() => setStaffAssignBranchId(null)}>
          <p className="text-[10px] font-mono text-zinc-500">{staffAssignSelection.size} {t('fieldAssignedStaff')}</p>
          <div className="border border-zinc-900 rounded-2xl divide-y divide-zinc-900/60 max-h-[300px] overflow-y-auto">
            {staffOptions.length === 0 && <p className="p-6 text-center text-xs text-zinc-600">{t('emptyState')}</p>}
            {staffOptions.map((u) => (
              <label key={u.id} className="flex items-center gap-3 p-2.5 cursor-pointer hover:bg-zinc-900/30 transition-all">
                <input
                  type="checkbox"
                  checked={staffAssignSelection.has(u.id)}
                  onChange={() => toggleStaffAssignee(u.id)}
                  className="accent-purple-500"
                />
                <span className="text-xs font-bold text-white">{u.name}</span>
                <span className="text-[10px] font-mono text-zinc-500 ml-auto">{u.role}</span>
              </label>
            ))}
          </div>
          <ModalActions onCancel={() => setStaffAssignBranchId(null)} onSubmit={submitStaffAssign} submitLabel={t('assignStaff')} cancelLabel={t('cancel')} />
        </Modal>
      )}

      {/* ---------- ROOM DOCTOR ASSIGN MODAL ---------- */}
      {roomDoctorAssignee && (
        <Modal title={t('assignDoctor')} onClose={() => setRoomDoctorAssignee(null)}>
          <div className="space-y-1">
            {doctorOptions.map((u) => {
              const room = structure.rooms.find((r) => r.id === roomDoctorAssignee.roomId);
              const active = room?.doctors.includes(u.id) ?? false;
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    const next = assignDoctorToRoom(structure, roomDoctorAssignee.roomId, u.id, !active);
                    persist(next);
                    onAudit(`Assigned doctor [${u.id}] to room [${roomDoctorAssignee.roomId}] = ${!active}.`);
                    flash('doctor assignment updated');
                    setRoomDoctorAssignee(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-all cursor-pointer ${active ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'}`}
                >
                  <span className="font-bold">{u.name}</span>
                  <span className="text-[10px] font-mono">{active ? 'ASSIGNED' : 'ASSIGN'}</span>
                </button>
              );
            })}
          </div>
          <ModalActions onCancel={() => setRoomDoctorAssignee(null)} onSubmit={() => setRoomDoctorAssignee(null)} submitLabel={t('save')} cancelLabel={t('cancel')} />
        </Modal>
      )}

      {/* ---------- EQUIPMENT ROOM ASSIGN MODAL ---------- */}
      {equipRoomAssignee && (
        <Modal title={t('fieldAssignedRooms')} onClose={() => setEquipRoomAssignee(null)}>
          <div className="space-y-1">
            {structure.rooms.map((r) => {
              const active = r.equipment.includes(equipRoomAssignee.equipmentId);
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    const next = assignEquipmentToRoom(structure, equipRoomAssignee.equipmentId, r.id);
                    persist(next);
                    onAudit(`Assigned equipment [${equipRoomAssignee.equipmentId}] to room [${r.id}].`);
                    flash('equipment room updated');
                    setEquipRoomAssignee(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-all cursor-pointer ${active ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40' : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'}`}
                >
                  <span className="font-bold">{r.name}</span>
                  <span className="text-[10px] font-mono">{active ? 'ASSIGNED' : 'ASSIGN'}</span>
                </button>
              );
            })}
          </div>
          <ModalActions onCancel={() => setEquipRoomAssignee(null)} onSubmit={() => setEquipRoomAssignee(null)} submitLabel={t('save')} cancelLabel={t('cancel')} />
        </Modal>
      )}
    </div>
  );
}

// ---------- small presentational helpers ----------

const inputCls =
  'w-full p-2 rounded-xl text-white text-xs outline-none bg-zinc-950 border border-zinc-800 focus:border-purple-500/50';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] text-zinc-400 font-bold uppercase">{label}</label>
      {children}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="card-elevated rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            {title}
          </h4>
          <button onClick={onClose} className="text-zinc-500 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({
  onCancel,
  onSubmit,
  submitLabel,
  cancelLabel = 'Cancel'
}: {
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  cancelLabel?: string;
}) {
  return (
    <div className="flex justify-end gap-2">
      <button onClick={onCancel} className="btn-secondary px-4 py-2 text-xs font-bold rounded-xl cursor-pointer">
        {cancelLabel}
      </button>
      <button onClick={onSubmit} className="btn-primary px-5 py-2 text-xs font-bold rounded-xl cursor-pointer">
        {submitLabel}
      </button>
    </div>
  );
}
