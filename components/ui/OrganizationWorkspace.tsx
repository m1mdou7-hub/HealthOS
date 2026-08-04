'use client';

import { WorkspaceSidebarNav } from './Workspace/WorkspaceSidebarNav';
import { WorkspaceTabPanel } from './Workspace/WorkspaceTabPanel';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Building2,
  Users,
  ShieldCheck,
  Activity,
  Bell,
  Lock,
  Settings2,
  Grid,
  List,
  Search,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Layers,
  Sliders,
  History,
  FileSpreadsheet,
  Globe,
  Palette,
  Eye,
  Check,
  UserCheck,
  Cpu,
  Bookmark,
  Calendar,
  Clock,
  ExternalLink,
  ShieldAlert,
  Server,
  Database,
  Smartphone,
  Fingerprint,
  RefreshCw,
  MoreVertical,
  CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import {
  getClinics,
  addClinicLocation,
  getBackups,
  createManualBackup,
  restoreBackup,
  appendAuditLog,
  getSystemHealth,
  getAuditLogs,
  runIntegrityScan,
  ClinicLocation,
  BackupArchive
} from '@/utils/enterpriseState';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// --- MOCK INTERFACES FOR THE ENTERPRISE SYSTEM ---
type ClinicHub = ClinicLocation;

interface OrgUser {
  id: string;
  name: string;
  role: 'Owner' | 'Administrator' | 'Doctor' | 'Lab Technician' | 'Assistant' | 'Receptionist' | 'Manager';
  email: string;
  clinic: string;
  status: 'Active' | 'Inactive' | 'Pending';
  avatarColor: string;
  phone: string;
}

interface TeamUnit {
  id: string;
  name: string;
  type: 'Clinical' | 'Lab' | 'Administrative';
  members: string[];
  assignedRooms: string[];
  availability: string;
  status: 'On Duty' | 'On Call' | 'Off Duty';
}

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  module: 'Auth' | 'Patient Records' | 'Appointments' | 'Clinical Notes' | 'Imaging' | 'Laboratory' | 'System Admin' | 'AI Core';
  status: 'Success' | 'Warn' | 'Denied';
  ipAddress: string;
}

interface CustomAnnouncement {
  id: string;
  title: string;
  content: string;
  type: 'Critical' | 'Announcement' | 'Maintenance';
  date: string;
  author: string;
  active: boolean;
}

// --- CORE REALISTIC MOCK DATA ---
const INITIAL_CLINICS: ClinicHub[] = [
  { id: 'C-01', name: 'مجمع هيلث أو إس الرئيسي للأسنان', location: 'طريق الملك فهد، الرياض', manager: 'د. كاترين أفيري', doctors: 12, patients: 1420, rooms: 8, hours: '08:00 - 20:00', status: 'Active' },
  { id: 'C-02', name: 'مركز الرعاية الطارئة بالشمال', location: 'طريق الأمير سلطان، جدة', manager: 'ماركوس ستيرلينغ', doctors: 6, patients: 850, rooms: 4, hours: 'عمليات 24/7', status: 'Active' },
  { id: 'C-03', name: 'مركز طب أسنان الأطفال والغرب', location: 'شارع الملك عبد الله، الخبر', manager: 'سيلينا كاين', doctors: 4, patients: 512, rooms: 3, hours: '09:00 - 17:00', status: 'Active' },
  { id: 'C-04', name: 'مركز الجراحة والاستعاضة الشرقية', location: 'طريق الكورنيش، الدمام', manager: 'لوسيوس فوكس', doctors: 8, patients: 940, rooms: 6, hours: '07:00 - 19:00', status: 'Maintenance' },
];

const INITIAL_USERS: OrgUser[] = [
  { id: 'U-101', name: 'د. كاترين أفيري', role: 'Owner', email: 'catherine.avery@healthos-group.com', clinic: 'مجمع هيلث أو إس الرئيسي للأسنان', status: 'Active', avatarColor: 'from-emerald-500 to-teal-600', phone: '+966 50 102 3920' },
  { id: 'U-102', name: 'د. بروس واين', role: 'Doctor', email: 'b.wayne@healthos-group.com', clinic: 'مركز الجراحة والاستعاضة الشرقية', status: 'Active', avatarColor: 'from-slate-700 to-zinc-900', phone: '+966 55 902 1244' },
  { id: 'U-103', name: 'ماركوس ستيرلينغ', role: 'Lab Technician', email: 'm.sterling@healthos-group.com', clinic: 'مجمع هيلث أو إس الرئيسي للأسنان', status: 'Active', avatarColor: 'from-amber-500 to-rose-600', phone: '+966 54 482 1922' },
  { id: 'U-104', name: 'لوسيوس فوكس', role: 'Administrator', email: 'l.fox@healthos-group.com', clinic: 'مركز الجراحة والاستعاضة الشرقية', status: 'Active', avatarColor: 'from-blue-600 to-indigo-700', phone: '+966 56 302 8854' },
  { id: 'U-105', name: 'سيلينا كاين', role: 'Manager', email: 's.kyle@healthos-group.com', clinic: 'مركز طب أسنان الأطفال والغرب', status: 'Active', avatarColor: 'from-purple-600 to-fuchsia-700', phone: '+966 50 120 4493' },
  { id: 'U-106', name: 'آنيا تشالوترا', role: 'Assistant', email: 'a.chalotra@healthos-group.com', clinic: 'مركز الرعاية الطارئة بالشمال', status: 'Active', avatarColor: 'from-pink-500 to-rose-600', phone: '+966 53 882 9411' },
  { id: 'U-107', name: 'د. إلينا روستوفا', role: 'Doctor', email: 'e.rostova@healthos-group.com', clinic: 'مركز طب أسنان الأطفال والغرب', status: 'Active', avatarColor: 'from-red-500 to-orange-600', phone: '+966 50 441 2902' },
  { id: 'U-108', name: 'باميلا إيسلي', role: 'Receptionist', email: 'p.isley@healthos-group.com', clinic: 'مركز الرعاية الطارئة بالشمال', status: 'Pending', avatarColor: 'from-green-500 to-emerald-600', phone: '+966 55 773 1945' },
  { id: 'U-109', name: 'د. روبرت كارتر', role: 'Doctor', email: 'r.carter@healthos-group.com', clinic: 'مركز الرعاية الطارئة بالشمال', status: 'Active', avatarColor: 'from-cyan-500 to-blue-600', phone: '+966 50 832 4410' },
  { id: 'U-110', name: 'هارلي كوين', role: 'Assistant', email: 'h.quinn@healthos-group.com', clinic: 'مجمع هيلث أو إس الرئيسي للأسنان', status: 'Inactive', avatarColor: 'from-rose-500 to-red-700', phone: '+966 54 293 1110' },
];

const INITIAL_DEPARTMENTS = [
  { name: 'طب الأسنان العام', head: 'د. روبرت كارتر', staffCount: 14, rooms: 'أ1 - أ4', code: 'GEN-DENT' },
  { name: 'الاستعاضة والتركيبات', head: 'د. كاترين أفيري', staffCount: 8, rooms: 'ب1 - ب3', code: 'PROSTH' },
  { name: 'زراعة الأسنان', head: 'د. بروس واين', staffCount: 6, rooms: 'ج1 - ج2', code: 'IMPL' },
  { name: 'تقويم الأسنان', head: 'د. إلينا روستوفا', staffCount: 5, rooms: 'د1 - د2', code: 'ORTHO' },
  { name: 'علاج العصب والجذور', head: 'د. كاترين أفيري', staffCount: 4, rooms: 'هـ1', code: 'ENDO' },
  { name: 'علاج اللثة والمحيط السني', head: 'د. فيكتور فريز', staffCount: 4, rooms: 'هـ2', code: 'PERIO' },
  { name: 'جراحة الفم والفكين', head: 'د. بروس واين', staffCount: 7, rooms: 'جراحة-01', code: 'ORAL-SURG' },
  { name: 'العناية وصحة الأسنان', head: 'سيلينا كاين', staffCount: 12, rooms: 'ص1 - ص6', code: 'HYG' },
];

const INITIAL_TEAMS: TeamUnit[] = [
  { id: 'T-01', name: 'فريق التجميل السني والابتسامة', type: 'Clinical', members: ['د. كاترين أفيري', 'آنيا تشالوترا', 'د. إلينا روستوفا'], assignedRooms: ['أ1', 'أ2', 'ب1'], availability: '95% أيام الأسبوع', status: 'On Duty' },
  { id: 'T-02', name: 'فريق الترميم وجراحة الفم المعقدة', type: 'Clinical', members: ['د. بروس واين', 'لوسيوس فوكس', 'آنيا تشالوترا'], assignedRooms: ['جراحة-01', 'ج1'], availability: '88% مناوبات حية', status: 'On Call' },
  { id: 'T-03', name: 'مختبر الدقة والتصنيع CAD/CAM', type: 'Lab', members: ['ماركوس ستيرلينغ', 'آنيا تشالوترا'], assignedRooms: ['غرفة الخرط 1', 'مختبر 3D'], availability: '100% الساعات الأساسية', status: 'On Duty' },
  { id: 'T-04', name: 'مكتب تنسيق واستقبال المرضى', type: 'Administrative', members: ['سيلينا كاين', 'باميلا إيسلي'], assignedRooms: ['الاستقبال الرئيسي', 'المكتب الغربي'], availability: '92% مستمر', status: 'On Duty' },
];

const INITIAL_AUDITS: AuditLog[] = [
  { id: 'LOG-449', timestamp: '2026-07-17 05:45:12', actor: 'د. كاترين أفيري', role: 'مالك المنظمة', action: 'تعديل خطة العلاج السريرية #8829', module: 'Patient Records', status: 'Success', ipAddress: '192.168.1.14' },
  { id: 'LOG-448', timestamp: '2026-07-17 05:33:02', actor: 'آنيا تشالوترا', role: 'مساعد طبيب', action: 'استعراض أشعة CBCT مقطعية للفك العلوي DICOM', module: 'Imaging', status: 'Success', ipAddress: '192.168.1.84' },
  { id: 'LOG-447', timestamp: '2026-07-17 05:12:44', actor: 'ماركوس ستيرلينغ', role: 'فني مختبر', action: 'تحميل خطوط حدود الحواف Exocad v3.2', module: 'Laboratory', status: 'Success', ipAddress: '10.0.4.15' },
  { id: 'LOG-446', timestamp: '2026-07-17 04:59:10', actor: 'عميل غير معروف', role: 'REST API خارجي', action: 'محاولة وصول غير مصرحة لسجلات السريرية', module: 'Auth', status: 'Denied', ipAddress: '185.122.9.44' },
  { id: 'LOG-445', timestamp: '2026-07-17 04:22:15', actor: 'لوسيوس فوكس', role: 'مدير النظام', action: 'تحديث مصفوفة أمان وصلاحيات HIPAA', module: 'System Admin', status: 'Success', ipAddress: '192.168.1.2' },
  { id: 'LOG-444', timestamp: '2026-07-17 03:50:00', actor: 'محرك التشخيص الذكي', role: 'ذكاء اصطناعي', action: 'توليد توصية لتركيبة زيركونيا متعددة الطبقات', module: 'AI Core', status: 'Success', ipAddress: 'المضيف المحلي' },
  { id: 'LOG-443', timestamp: '2026-07-17 03:10:22', actor: 'باميلا إيسلي', role: 'مسؤول الاستقبال', action: 'إعادة جدولة الموعد الطبي #10492', module: 'Appointments', status: 'Success', ipAddress: '192.168.2.19' },
  { id: 'LOG-442', timestamp: '2026-07-17 02:44:11', actor: 'هارلي كوين', role: 'مساعد طبيب', action: 'محاولة تصدير قاعدة بيانات المرضى', module: 'Patient Records', status: 'Warn', ipAddress: '192.168.1.92' },
];

const INITIAL_ANNOUNCEMENTS: CustomAnnouncement[] = [
  { id: 'A-01', title: 'تدقيق الأمان والامتثال السنوي لمعايير HIPAA', content: 'تدقيق خارجي نشط للامتثال السريري. يرجى التأكد من قفل جميع أجهزة الكمبيوتر تلقائياً بعد 3 دقائق من عدم النشاط.', type: 'Critical', date: '2026-07-16', author: 'لوسيوس فوكس (مسؤول الامتثال)', active: true },
  { id: 'A-02', title: 'صيانة وتحسين خوادم تصاوير الأشعة PACS', content: 'إعادة بناء كشافات قاعدة البيانات وضغط تخزين أجهزة الأشعة المقطعية. يتوقع تأخير طفيف عند استيراد ملفات STL.', type: 'Maintenance', date: '2026-07-15', author: 'فريق العمليات السحابية', active: true },
  { id: 'A-03', title: 'ورشة عمل تدريبية لعدسات الأسنان وقشور E.max', content: 'ستقود د. كاترين أفيري ورشة عمل تخصصية متقدمة في تصميم وتحضير عدسات السيراميك الفائقة الرقة يوم الأربعاء القادم.', type: 'Announcement', date: '2026-07-14', author: 'د. كاترين أفيري', active: true },
];

// --- CHARTS & TREND DATA ---
const AI_UTILIZATION_DATA = [
  { date: 'Mon', calls: 3420, clinical: 2100, lab: 1320 },
  { date: 'Tue', calls: 4120, clinical: 2500, lab: 1620 },
  { date: 'Wed', calls: 3890, clinical: 2340, lab: 1550 },
  { date: 'Thu', calls: 4500, clinical: 2900, lab: 1600 },
  { date: 'Fri', calls: 5120, clinical: 3100, lab: 2020 },
  { date: 'Sat', calls: 2400, clinical: 1500, lab: 900 },
  { date: 'Sun', calls: 1200, clinical: 800, lab: 400 },
];

const LICENSE_STATUS_CHART = [
  { name: 'Assigned Doctors', value: 34, color: '#10b981' },
  { name: 'Assigned Technicians', value: 20, color: '#3b82f6' },
  { name: 'Administrative Seats', value: 42, color: '#f59e0b' },
  { name: 'Clinical Assistants', value: 26, color: '#8b5cf6' },
  { name: 'Available Licenses', value: 28, color: '#4b5563' }
];

const PERMISSION_ROLES_TEMPLATES = {
  Owner: { charts: true, prescribe: true, billing: true, admin: true, directory: true, labs: true, ai: true },
  Administrator: { charts: false, prescribe: false, billing: true, admin: true, directory: true, labs: true, ai: true },
  Doctor: { charts: true, prescribe: true, billing: false, admin: false, directory: false, labs: true, ai: true },
  'Lab Technician': { charts: false, prescribe: false, billing: false, admin: false, directory: false, labs: true, ai: true },
  Assistant: { charts: true, prescribe: false, billing: false, admin: false, directory: false, labs: true, ai: false },
  Receptionist: { charts: false, prescribe: false, billing: true, admin: false, directory: false, labs: false, ai: false },
  Manager: { charts: false, prescribe: false, billing: true, admin: true, directory: true, labs: false, ai: true }
};

export default function OrganizationWorkspace() {
  const tOrg = useTranslations('OrganizationWorkspace');
  // Navigation Tabs matching 11 requested areas (including SLA backups)
  const [activeTab, setActiveTab] = useState<
    'Overview' | 'Clinics' | 'Departments' | 'Users' | 'Permissions' | 'Teams' | 'Audits' | 'Notifications' | 'Security' | 'Settings' | 'Backup'
  >('Overview');

  // Interactive core state
  const [clinics, setClinics] = useState<ClinicLocation[]>([]);
  const [backups, setBackups] = useState<BackupArchive[]>([]);
  const [users, setUsers] = useState<OrgUser[]>(INITIAL_USERS);
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);
  const [teams, setTeams] = useState<TeamUnit[]>(INITIAL_TEAMS);
  const [audits, setAudits] = useState<AuditLog[]>(INITIAL_AUDITS);
  const [announcements, setAnnouncements] = useState<CustomAnnouncement[]>(INITIAL_ANNOUNCEMENTS);

  // Sync with central persistent enterprise state
  useEffect(() => {
    setClinics(getClinics());
    setBackups(getBackups());

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        if (customEvent.detail.type === 'clinics') {
          setClinics(getClinics());
        } else if (customEvent.detail.type === 'backups') {
          setBackups(getBackups());
        } else if (customEvent.detail.type === 'audit') {
          // Sync local mock audit logs list with persistent list if we wish
          const realAuditLogs = getAuditLogs();
          const mappedLogs: AuditLog[] = realAuditLogs.map(l => ({
            id: l.id,
            timestamp: l.timestamp,
            actor: l.actor,
            role: l.role === 'Clinic Owner' ? 'Owner' : l.role === 'Laboratory Technician' ? 'Lab Technician' : 'Doctor',
            action: l.action,
            module: l.module as any,
            status: l.status,
            ipAddress: l.ipAddress
          }));
          setAudits(prev => [...mappedLogs, ...prev.filter(p => !p.id.startsWith('AUD-'))].slice(0, 40));
        }
      }
    };

    window.addEventListener('healthos_state_change', handleSync);
    return () => window.removeEventListener('healthos_state_change', handleSync);
  }, []);

  // Dynamic disaster recovery console message states
  const [drStatusMessage, setDrStatusMessage] = useState<string | null>(null);
  const [drStatusType, setDrStatusType] = useState<'success' | 'info' | 'warn'>('success');

  // Dynamic clinic creation state
  const [showAddClinicForm, setShowAddClinicForm] = useState(false);
  const [clinicNameInput, setClinicNameInput] = useState('');
  const [clinicLocInput, setClinicLocInput] = useState('');
  const [clinicManagerInput, setClinicManagerInput] = useState('Dr. Catherine Avery');
  const [clinicTimezoneInput, setClinicTimezoneInput] = useState('America/New_York (EST)');
  const [clinicHoursInput, setClinicHoursInput] = useState('08:00 - 20:00');

  // Search & Filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [userStatusFilter, setUserStatusFilter] = useState('All');

  const [clinicSearch, setClinicSearch] = useState('');
  const [clinicStatusFilter, setClinicStatusFilter] = useState('All');

  // Permission matrix role selector
  const [selectedPermissionRole, setSelectedPermissionRole] = useState<keyof typeof PERMISSION_ROLES_TEMPLATES>('Doctor');
  const [rolePermissions, setRolePermissions] = useState(PERMISSION_ROLES_TEMPLATES);

  // Security Center simulation states
  const [passwordMinLength, setPasswordMinLength] = useState(12);
  const [require2FA, setRequire2FA] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(15);
  const [securityScanRunning, setSecurityScanRunning] = useState(false);
  const [securityScore, setSecurityScore] = useState(96);

  // New item forms states
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newDepartmentHead, setNewDepartmentHead] = useState('Dr. Catherine Avery');
  const [newDepartmentRooms, setNewDepartmentRooms] = useState('Room G1');

  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementType, setNewAnnouncementType] = useState<'Critical' | 'Announcement' | 'Maintenance'>('Announcement');
  const [newAnnouncementContent, setNewAnnouncementContent] = useState('');

  // Branding Customizer Simulation
  const [brandColor, setBrandColor] = useState('emerald');
  const [workspaceName, setWorkspaceName] = useState('HealthOS Dental Group International');
  const [workspaceTimezone, setWorkspaceTimezone] = useState('America/New_York (EST)');
  const [primaryLanguage, setPrimaryLanguage] = useState('English (US)');

  // Drag-to-resize sidebar setup
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const isResizing = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = Math.max(180, Math.min(360, e.clientX - 60));
    setSidebarWidth(newWidth);
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Add custom department
  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartmentName.trim()) return;

    const code = newDepartmentName.toUpperCase().replace(/\s+/g, '-').substring(0, 8);
    setDepartments([
      ...departments,
      {
        name: newDepartmentName.trim(),
        head: newDepartmentHead,
        staffCount: 1,
        rooms: newDepartmentRooms,
        code
      }
    ]);
    setNewDepartmentName('');
  };

  // Add custom announcement
  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncementTitle.trim() || !newAnnouncementContent.trim()) return;

    const newA: CustomAnnouncement = {
      id: `A-${Date.now()}`,
      title: newAnnouncementTitle.trim(),
      content: newAnnouncementContent.trim(),
      type: newAnnouncementType,
      date: new Date().toISOString().substring(0, 10),
      author: 'EHR Workspace Director (You)',
      active: true
    };

    setAnnouncements([newA, ...announcements]);
    setNewAnnouncementTitle('');
    setNewAnnouncementContent('');
  };

  // Toggle single permission state
  const togglePermission = (permKey: keyof typeof PERMISSION_ROLES_TEMPLATES['Doctor']) => {
    setRolePermissions(prev => {
      const updatedRole = {
        ...prev[selectedPermissionRole],
        [permKey]: !prev[selectedPermissionRole][permKey]
      };
      return {
        ...prev,
        [selectedPermissionRole]: updatedRole
      };
    });

    // Append to audit log
    const newLog: AuditLog = {
      id: `LOG-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: 'Chief Security Officer (You)',
      role: 'Owner',
      action: `Updated permission '${permKey}' for role template '${selectedPermissionRole}'`,
      module: 'System Admin',
      status: 'Success',
      ipAddress: '192.168.1.1'
    };
    setAudits([newLog, ...audits]);
  };

  // Compute stats for overview metrics
  const totalClinics = clinics.length;
  const activeClinicsCount = clinics.filter(c => c.status === 'Active').length;
  const totalUsers = users.length;
  const activeUsersCount = users.filter(u => u.status === 'Active').length;

  // Filtered lists
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchRole = userRoleFilter === 'All' || u.role === userRoleFilter;
      const matchStatus = userStatusFilter === 'All' || u.status === userStatusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, userSearch, userRoleFilter, userStatusFilter]);

  const filteredClinics = useMemo(() => {
    return clinics.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(clinicSearch.toLowerCase()) || c.location.toLowerCase().includes(clinicSearch.toLowerCase()) || c.manager.toLowerCase().includes(clinicSearch.toLowerCase());
      const matchStatus = clinicStatusFilter === 'All' || c.status === clinicStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [clinics, clinicSearch, clinicStatusFilter]);

  // Security scanner simulation
  const runSecurityScan = () => {
    setSecurityScanRunning(true);
    setTimeout(() => {
      setSecurityScanRunning(false);
      setSecurityScore(99);
      // Append success audit log
      const log: AuditLog = {
        id: `LOG-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        actor: 'Security Daemon Core',
        role: 'AI Core',
        action: 'Completed enterprise access control scan. Zero vulnerabilities identified.',
        module: 'Auth',
        status: 'Success',
        ipAddress: 'System Core'
      };
      setAudits([log, ...audits]);
    }, 1200);
  };

  return (
    <div className="space-y-6 text-zinc-100 animate-fade-in relative font-sans">
      
      {/* HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-850/80 shadow-xl backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold text-white tracking-tight">{tOrg('headerTitle')}</h2>
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-0.5 rounded-full">
                {tOrg('adminConsole')}
              </span>
              <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-0.5 rounded-full">
                {brandColor.toUpperCase()} {tOrg('multiClinic')}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-sans">
              {tOrg('tenantDesc')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 text-xs bg-zinc-950/80 border border-zinc-800 text-zinc-300 px-3.5 py-2 rounded-xl font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{tOrg('hipaaStatus')}</span>
          </div>
          <div className="flex items-center gap-2 text-xs bg-zinc-950/80 border border-zinc-800 text-zinc-300 px-3.5 py-2 rounded-xl font-semibold">
            <Globe className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{tOrg('multiRegion')}</span>
          </div>
        </div>
      </div>

      {/* 11 SUBMODULES HORIZONTAL / GRID NAV TABS */}
      <div className="bg-zinc-900/40 p-2 rounded-2xl border border-zinc-850/80 flex flex-wrap gap-1.5 shadow-md">
        {[
          { id: 'Overview', key: 'Overview', icon: Layers, badge: tOrg('badges.unified') },
          { id: 'Clinics', key: 'Clinics', icon: Building2, badge: `${activeClinicsCount}/${totalClinics} OK` },
          { id: 'Departments', key: 'Departments', icon: Sliders, badge: `${departments.length} ${tOrg('badges.units')}` },
          { id: 'Users', key: 'Users', icon: Users, badge: `${activeUsersCount} ${tOrg('badges.active')}` },
          { id: 'Permissions', key: 'Permissions', icon: ShieldCheck, badge: tOrg('badges.matrix') },
          { id: 'Teams', key: 'Teams', icon: UserCheck, badge: `${teams.length} ${tOrg('badges.teams')}` },
          { id: 'Audits', key: 'Audits', icon: History, badge: tOrg('badges.pciLog') },
          { id: 'Notifications', key: 'Notifications', icon: Bell, badge: `${announcements.length} ${tOrg('badges.alerts')}`, badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
          { id: 'Security', key: 'Security', icon: Lock, badge: `${securityScore}/100`, badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
          { id: 'Settings', key: 'Settings', icon: Settings2, badge: tOrg('badges.branding') },
          { id: 'Backup', key: 'Backup', icon: Database, badge: `${backups.length} ${tOrg('badges.archives')}`, badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30' }
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const labelText = tOrg(`tabs.${item.key}`);
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-2 cursor-pointer border ${
                isActive 
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-extrabold shadow-lg shadow-emerald-500/20 scale-[1.02]' 
                  : 'bg-zinc-950/60 text-zinc-300 border-zinc-850 hover:bg-zinc-900 hover:text-white hover:border-zinc-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{labelText}</span>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-bold border ${
                  item.badgeColor || (isActive ? 'bg-zinc-950 text-emerald-400 border-emerald-500/30' : 'bg-zinc-900 text-zinc-400 border-zinc-800')
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          
          {/* ==================================================
              1. ORGANIZATION OVERVIEW
              ================================================== */}
          {activeTab === 'Overview' && (
            <WorkspaceTabPanel className="space-y-6">
              
              {/* Bento Box 4 Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Stat 1: Org ID */}
                <div className="p-5 bg-[#0d0d16]/40 border border-white/5 rounded-2xl flex flex-col justify-between space-y-3 shadow-lg hover:border-zinc-800 transition-all card-luxury">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{tOrg('overview_stats.orgId')}</span>
                    <Building2 className="w-4 h-4 text-gold-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white font-mono">ORG-8820-X92</h4>
                    <p className="text-xs text-zinc-400 mt-0.5 truncate font-sans">{workspaceName}</p>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-850">
                    <div className="h-full bg-gold-500 rounded-full w-full shadow-gold-glow" />
                  </div>
                </div>

                {/* Stat 2: Clinics & Rooms */}
                <div className="p-5 bg-[#0d0d16]/40 border border-white/5 rounded-2xl flex flex-col justify-between space-y-3 shadow-lg hover:border-zinc-800 transition-all card-luxury">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{tOrg('overview_stats.clinicsRooms')}</span>
                    <Globe className="w-4 h-4 text-gold-400" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white">{totalClinics} {tOrg('overview_stats.sitesLabel')}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5 font-sans">{tOrg('overview_stats.totalSuitesActive', { count: 21 })}</p>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-850">
                    <div className="h-full bg-gold-500 rounded-full w-4/5 shadow-gold-glow" />
                  </div>
                </div>

                {/* Stat 3: License Seats */}
                <div className="p-5 bg-[#0d0d16]/40 border border-white/5 rounded-2xl flex flex-col justify-between space-y-3 shadow-lg hover:border-zinc-800 transition-all card-luxury">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{tOrg('overview_stats.licenseSeats')}</span>
                    <span className="text-xs text-gold-400 font-mono font-bold bg-gold-500/10 px-2 py-0.5 rounded border border-gold-500/20">{tOrg('overview_stats.freeCount', { count: 28 })}</span>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white font-mono">122 / 150</h4>
                    <p className="text-xs text-zinc-400 mt-0.5 font-sans">{tOrg('overview_stats.subscriptionCapacity')}</p>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-850">
                    <div className="h-full bg-gold-500 rounded-full w-[81.3%] shadow-gold-glow" />
                  </div>
                </div>

                {/* Stat 4: Secure Cloud Storage */}
                <div className="p-5 bg-[#0d0d16]/40 border border-white/5 rounded-2xl flex flex-col justify-between space-y-3 shadow-lg hover:border-zinc-800 transition-all card-luxury">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{tOrg('overview_stats.secureCloudStorage')}</span>
                    <span className="text-xs text-cyan-400 font-mono font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">24%</span>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white font-mono">1.2 / 5.0 TB</h4>
                    <p className="text-xs text-zinc-400 mt-0.5 font-sans">{tOrg('overview_stats.mainStlStorage')}</p>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-850">
                    <div className="h-full bg-cyan-400 rounded-full w-[24%]" />
                  </div>
                </div>

              </div>

              {/* Chart & Quick Actions Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* AI API Utilization Trend Chart */}
                <div className="lg:col-span-2 p-6 bg-[#0d0d16]/30 border border-white/5 rounded-3xl space-y-4 shadow-xl card-luxury">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-white/5 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">{tOrg('overview_stats.aiTrendTitle')}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5 font-sans">{tOrg('overview_stats.aiTrendSub')}</p>
                    </div>
                    <span className="text-xs font-mono text-gold-400 bg-gold-500/10 border border-gold-500/20 px-3 py-1 rounded-xl self-start sm:self-auto font-semibold">
                      {tOrg('overview_stats.aiTrendProcessed', { count: '42,650' })}
                    </span>
                  </div>

                  <div className="h-[220px] w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={AI_UTILIZATION_DATA}>
                        <defs>
                          <linearGradient id="callsGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#c9a84c" stopOpacity={0.35}/>
                            <stop offset="95%" stopColor="#c9a84c" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="clinicalGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
                        <XAxis dataKey="date" stroke="#a1a1aa" style={{ fontSize: '11px' }} />
                        <YAxis stroke="#a1a1aa" style={{ fontSize: '11px' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#07070c', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '12px' }} />
                        <Area type="monotone" dataKey="calls" stroke="#c9a84c" strokeWidth={2.5} fillOpacity={1} fill="url(#callsGrad)" name="Total AI Calls" />
                        <Area type="monotone" dataKey="clinical" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#clinicalGrad)" name="Clinical AI" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Platform Quick Actions */}
                <div className="p-6 bg-[#0d0d16]/30 border border-white/5 rounded-3xl space-y-4 flex flex-col justify-between shadow-xl card-luxury">
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider font-sans border-b border-white/5 pb-3">{tOrg('overview_stats.quickActionsTitle')}</h4>
                    <div className="space-y-3 pt-3">
                      
                      <button 
                        onClick={() => { setActiveTab('Users') }}
                        className="w-full text-left p-3.5 bg-zinc-900/70 border border-zinc-800 hover:border-gold-500/60 hover:bg-zinc-850 rounded-2xl flex items-center gap-3.5 transition-all cursor-pointer group shadow-sm"
                      >
                        <div className="p-2 bg-gold-500/10 text-gold-400 rounded-xl group-hover:bg-gold-500 group-hover:text-zinc-950 transition-colors">
                          <Plus className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-white text-xs font-bold font-sans group-hover:text-gold-400 transition-colors">{tOrg('overview_stats.provisionUser')}</p>
                          <p className="text-[11px] text-zinc-400 mt-0.5 font-sans">{tOrg('overview_stats.provisionUserSub')}</p>
                        </div>
                      </button>

                      <button 
                        onClick={() => { setActiveTab('Permissions') }}
                        className="w-full text-left p-3.5 bg-zinc-900/70 border border-zinc-800 hover:border-gold-500/60 hover:bg-zinc-850 rounded-2xl flex items-center gap-3.5 transition-all cursor-pointer group shadow-sm"
                      >
                        <div className="p-2 bg-gold-500/10 text-gold-400 rounded-xl group-hover:bg-gold-500 group-hover:text-zinc-950 transition-colors">
                          <Sliders className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-white text-xs font-bold font-sans group-hover:text-gold-400 transition-colors">{tOrg('overview_stats.auditMatrix')}</p>
                          <p className="text-[11px] text-zinc-400 mt-0.5 font-sans">{tOrg('overview_stats.auditMatrixSub')}</p>
                        </div>
                      </button>

                      <button 
                        onClick={() => { setActiveTab('Security') }}
                        className="w-full text-left p-3.5 bg-zinc-900/70 border border-zinc-800 hover:border-gold-500/60 hover:bg-zinc-850 rounded-2xl flex items-center gap-3.5 transition-all cursor-pointer group shadow-sm"
                      >
                        <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl group-hover:bg-rose-500 group-hover:text-zinc-950 transition-colors">
                          <Lock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-white text-xs font-bold font-sans group-hover:text-gold-400 transition-colors">{tOrg('overview_stats.triggerScan')}</p>
                          <p className="text-[11px] text-zinc-400 mt-0.5 font-sans">{tOrg('overview_stats.triggerScanSub')}</p>
                        </div>
                      </button>

                    </div>
                  </div>
                </div>

              </div>

              {/* Active Operator & Bottom Telemetry Bar */}
              <div className="p-4 bg-[#0d0d16]/30 border border-white/5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-sans card-luxury">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-xs font-black text-white uppercase shadow-md">
                    CA
                  </div>
                  <div>
                    <h5 className="font-bold text-white">Dr. C. Avery</h5>
                    <p className="text-[11px] text-zinc-400 font-sans">{tOrg('overview_stats.roleLabel')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-sans text-gold-400 font-semibold bg-gold-500/10 px-3.5 py-1.5 rounded-xl border border-gold-500/20">
                  <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                  <span>{tOrg('overview_stats.pacsServerState')}</span>
                </div>

                <div className="text-zinc-400 font-sans text-xs">
                  {tOrg('overview_stats.ownerContact', { name: 'HealthOS Admin' })}
                </div>
              </div>

            </WorkspaceTabPanel>
          )}

              {/* ==================================================
                  2. CLINIC MANAGEMENT
                  ================================================== */}
              {activeTab === 'Clinics' && (
                <WorkspaceTabPanel
                  className="h-full flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <div>
                        <h3 className="text-base font-black text-white uppercase tracking-tight font-sans">{tOrg('clinics.activeSitesHeader')}</h3>
                        <p className="text-xs text-zinc-400 font-sans">{tOrg('clinics.activeSitesSub')}</p>
                      </div>
                      {showAddClinicForm ? (
                        <button 
                          onClick={() => setShowAddClinicForm(false)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d0d16] hover:bg-[#131320] text-zinc-300 text-xs font-bold transition-all border border-white/5"
                        >
                          {tOrg('clinics.cancelReg')}
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            setShowAddClinicForm(true);
                            setClinicNameInput('');
                            setClinicLocInput('');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-black text-xs font-bold transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> {tOrg('clinics.provisionSite')}
                        </button>
                      )}
                    </div>

                    {showAddClinicForm && (
                      <div className="p-4 bg-[#0d0d16] border border-white/5 rounded-2xl space-y-3 animate-fade-in card-luxury">
                        <span className="text-[10px] font-mono font-bold text-gold-400 uppercase tracking-widest block">{tOrg('clinics.registerProfile')}</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 font-bold uppercase">{tOrg('clinics.clinicNameLabel')}</label>
                            <input
                              type="text"
                              value={clinicNameInput}
                              onChange={(e) => setClinicNameInput(e.target.value)}
                              placeholder={tOrg('clinics.clinicNamePlaceholder')}
                              className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs outline-none focus:border-gold-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 font-bold uppercase">{tOrg('clinics.locationLabel')}</label>
                            <input
                              type="text"
                              value={clinicLocInput}
                              onChange={(e) => setClinicLocInput(e.target.value)}
                              placeholder={tOrg('clinics.locationPlaceholder')}
                              className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs outline-none focus:border-gold-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 font-bold uppercase">{tOrg('clinics.timezoneLabel')}</label>
                            <select
                              value={clinicTimezoneInput}
                              onChange={(e) => setClinicTimezoneInput(e.target.value)}
                              className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 text-xs outline-none focus:border-gold-500"
                            >
                              <option value="America/New_York (EST)">America/New_York (EST)</option>
                              <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                              <option value="Asia/Tokyo (JST)">Asia/Tokyo (JST)</option>
                              <option value="UTC (Zulu)">UTC (Zulu)</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 font-bold uppercase">{tOrg('clinics.hoursLabel')}</label>
                            <input
                              type="text"
                              value={clinicHoursInput}
                              onChange={(e) => setClinicHoursInput(e.target.value)}
                              placeholder={tOrg('clinics.hoursPlaceholder')}
                              className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs outline-none focus:border-gold-500"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => {
                              if (!clinicNameInput.trim() || !clinicLocInput.trim()) return;
                              addClinicLocation({
                                name: clinicNameInput.trim(),
                                location: clinicLocInput.trim(),
                                manager: clinicManagerInput,
                                hours: clinicHoursInput,
                                timezone: clinicTimezoneInput,
                                status: 'Active'
                              });
                              setShowAddClinicForm(false);
                            }}
                            className="px-4 py-1.5 bg-gold-500 hover:bg-gold-400 text-zinc-950 text-xs font-bold rounded-xl uppercase transition-all"
                          >
                            {tOrg('clinics.saveBtn')}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Filter & Search Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          type="text"
                          value={clinicSearch}
                          onChange={(e) => setClinicSearch(e.target.value)}
                          placeholder={tOrg('clinics.searchPlaceholder')}
                          className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 text-xs rounded-xl outline-none focus:border-gold-500 text-white font-mono placeholder:text-zinc-600"
                        />
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Status:</span>
                        <select
                          value={clinicStatusFilter}
                          onChange={(e) => setClinicStatusFilter(e.target.value)}
                          className="bg-zinc-905 border border-zinc-850 rounded-xl text-xs font-mono text-zinc-300 p-1.5 outline-none focus:border-emerald-500 w-36"
                        >
                          <option value="All">All statuses</option>
                          <option value="Active">Active</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Planned">Planned</option>
                        </select>
                      </div>
                    </div>

                    {/* Clinic Grid with visual rooms layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1">
                      {filteredClinics.map((c) => (
                        <div key={c.id} className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex flex-col justify-between h-[180px] space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold bg-zinc-950 border border-zinc-800 text-emerald-400 px-1.5 py-0.5 rounded-md">
                                  {c.id}
                                </span>
                                <h4 className="text-xs font-black text-white">{c.name}</h4>
                              </div>
                              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{c.location}</p>
                            </div>
                            <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full border ${
                              c.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              c.status === 'Maintenance' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              'bg-zinc-800 text-zinc-400 border border-zinc-700'
                            }`}>
                              {c.status}
                            </span>
                          </div>

                          {/* Visual room layout mapping */}
                          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
                            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5">Live Operatory Room Matrix</span>
                            <div className="flex gap-1.5">
                              {Array.from({ length: c.rooms }).map((_, i) => (
                                <div key={i} className="flex-1 text-center">
                                  <div className={`h-4 rounded border ${i % 3 === 0 ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'} text-[8px] font-mono flex items-center justify-center font-bold`}>
                                    R{i + 1}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-1 border-t border-zinc-900 text-[10px] font-mono text-zinc-400">
                            <span>Manager: <strong className="text-zinc-200">{c.manager}</strong></span>
                            <span>Drs: <strong className="text-white">{c.doctors}</strong> | Pts: <strong className="text-white">{c.patients}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-900/20 border border-zinc-900 rounded-2xl flex justify-between items-center text-xs font-mono text-zinc-500">
                    <span>TOTAL REGISTERED CLINICS: {clinics.length}</span>
                    <span>ONLINE MAP INTEGRATION: INACTIVE</span>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  3. DEPARTMENTS
                  ================================================== */}
              {activeTab === 'Departments' && (
                <WorkspaceTabPanel
                  className="h-full flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                      <div>
                        <h3 className="text-base font-black text-white uppercase tracking-tight">Platform Departments & Clinical Units</h3>
                        <p className="text-xs text-zinc-500 font-mono">Configure specialty department parameters and default staff supervisors.</p>
                      </div>
                    </div>

                    {/* Grid of existing departments with interactive custom adding form */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Left form */}
                      <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl space-y-3 h-[380px] flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">Provisions Custom Unit</span>
                          <p className="text-[10px] text-zinc-400 font-mono leading-relaxed">Instantly add a new specialty clinic segment to the EHR platform.</p>
                        </div>

                        <form onSubmit={handleAddDepartment} className="space-y-3 flex-1 justify-center mt-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-400 font-bold uppercase block">Department Name</label>
                            <input
                              type="text"
                              value={newDepartmentName}
                              onChange={(e) => setNewDepartmentName(e.target.value)}
                              placeholder="e.g. Cosmetic Dentistry"
                              className="w-full p-2 bg-zinc-950 border border-zinc-850 text-xs rounded-xl outline-none focus:border-emerald-500 text-white font-mono placeholder:text-zinc-600"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-400 font-bold uppercase block">Chief Director</label>
                            <select
                              value={newDepartmentHead}
                              onChange={(e) => setNewDepartmentHead(e.target.value)}
                              className="w-full p-2 bg-zinc-950 border border-zinc-850 text-xs rounded-xl outline-none focus:border-emerald-500 text-zinc-300 font-mono"
                            >
                              <option value="Dr. Catherine Avery">Dr. Catherine Avery</option>
                              <option value="Dr. Bruce Wayne">Dr. Bruce Wayne</option>
                              <option value="Dr. Elena Rostova">Dr. Elena Rostova</option>
                              <option value="Dr. Robert Carter">Dr. Robert Carter</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-400 font-bold uppercase block">Assigned Suites</label>
                            <input
                              type="text"
                              value={newDepartmentRooms}
                              onChange={(e) => setNewDepartmentRooms(e.target.value)}
                              placeholder="e.g. Suite C-04"
                              className="w-full p-2 bg-zinc-950 border border-zinc-850 text-xs rounded-xl outline-none focus:border-emerald-500 text-white font-mono placeholder:text-zinc-600"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black uppercase font-mono tracking-wider transition-colors cursor-pointer"
                          >
                            Add Specialty Unit
                          </button>
                        </form>
                      </div>

                      {/* Right list */}
                      <div className="lg:col-span-2 p-4 bg-zinc-900/10 border border-zinc-850 rounded-2xl h-[380px] overflow-y-auto scrollbar-thin space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block mb-2">Registered Speciality Directory</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {departments.map((dept, idx) => (
                            <div key={idx} className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl space-y-1 relative group">
                              <span className="text-[8px] font-mono font-black px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400 absolute top-2.5 right-2.5">
                                {dept.code}
                              </span>
                              <h4 className="text-xs font-black text-white">{dept.name}</h4>
                              <p className="text-[10px] text-zinc-400 font-mono">Head: <span className="text-zinc-300 font-bold">{dept.head}</span></p>
                              <p className="text-[9px] text-zinc-500 font-mono">Operational Rooms: {dept.rooms} • Staff count: {dept.staffCount}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-900/20 border border-zinc-900 rounded-2xl flex justify-between items-center text-xs font-mono text-zinc-500">
                    <span>DEPARTMENT TOTAL: {departments.length} UNITS CONFIGURATION</span>
                    <span>RESTRICTED EXPORT: TRUE</span>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  4. USER MANAGEMENT
                  ================================================== */}
              {activeTab === 'Users' && (
                <WorkspaceTabPanel
                  className="h-full flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                      <div>
                        <h3 className="text-base font-black text-white uppercase tracking-tight">Platform User & Staff Directory</h3>
                        <p className="text-xs text-zinc-500 font-mono">Manage credential parameters, security tokens, and clinic assignments for all seats.</p>
                      </div>
                      <button 
                        onClick={() => {
                          const newU: OrgUser = {
                            id: `U-${110 + users.length + 1}`,
                            name: 'Selina Kyle II',
                            role: 'Assistant',
                            email: 's.kyle2@healthos-group.com',
                            clinic: 'Westside Pediatric Dentistry',
                            status: 'Pending',
                            avatarColor: 'from-fuchsia-500 to-pink-600',
                            phone: '+1 (555) 002-3392'
                          };
                          setUsers([...users, newU]);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> Invite Team Seat
                      </button>
                    </div>

                    {/* Filter controls */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          type="text"
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          placeholder="Search users by name, email..."
                          className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 text-xs rounded-xl outline-none focus:border-emerald-500 text-white font-mono placeholder:text-zinc-600"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold shrink-0">Role:</span>
                        <select
                          value={userRoleFilter}
                          onChange={(e) => setUserRoleFilter(e.target.value)}
                          className="bg-zinc-905 border border-zinc-850 rounded-xl text-xs font-mono text-zinc-300 p-1.5 outline-none focus:border-emerald-500 w-full"
                        >
                          <option value="All">All roles</option>
                          <option value="Owner">Owner</option>
                          <option value="Administrator">Administrator</option>
                          <option value="Doctor">Doctor</option>
                          <option value="Lab Technician">Lab Technician</option>
                          <option value="Assistant">Assistant</option>
                          <option value="Receptionist">Receptionist</option>
                          <option value="Manager">Manager</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold shrink-0">Status:</span>
                        <select
                          value={userStatusFilter}
                          onChange={(e) => setUserStatusFilter(e.target.value)}
                          className="bg-zinc-905 border border-zinc-850 rounded-xl text-xs font-mono text-zinc-300 p-1.5 outline-none focus:border-emerald-500 w-full"
                        >
                          <option value="All">All statuses</option>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>
                    </div>

                    {/* Large tabular layout */}
                    <div className="overflow-x-auto rounded-xl border border-zinc-900 max-h-[340px] overflow-y-auto">
                      <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead>
                          <tr className="bg-zinc-950 text-zinc-500 text-[10px] uppercase font-bold border-b border-zinc-900">
                            <th className="p-3">Staff Member</th>
                            <th className="p-3">Role</th>
                            <th className="p-3">Facility Node</th>
                            <th className="p-3">Contact</th>
                            <th className="p-3">ID Link</th>
                            <th className="p-3">Security Token</th>
                            <th className="p-3">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
                          {filteredUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-zinc-900/20">
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${u.avatarColor} flex items-center justify-center text-[10px] font-black text-white uppercase`}>
                                    {u.name.split(' ').map(n=>n[0]).join('')}
                                  </div>
                                  <div>
                                    <p className="font-bold text-white text-[11px]">{u.name}</p>
                                    <span className="text-[9px] text-zinc-500">{u.email}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 font-bold text-zinc-200">{u.role}</td>
                              <td className="p-3 text-zinc-400">{u.clinic}</td>
                              <td className="p-3 text-[10px] text-zinc-500">{u.phone}</td>
                              <td className="p-3 font-bold text-emerald-400">{u.id}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] ${
                                  u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                  u.status === 'Inactive' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                  'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>
                                  {u.status}
                                </span>
                              </td>
                              <td className="p-3">
                                <button 
                                  onClick={() => {
                                    setUsers(users.filter(item => item.id !== u.id));
                                  }}
                                  className="text-rose-400 hover:text-rose-300 font-bold text-[10px] transition-colors"
                                >
                                  SUSPEND
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-900/20 border border-zinc-900 rounded-2xl flex justify-between items-center text-xs font-mono text-zinc-500">
                    <span>SEAT COUNT: {filteredUsers.length} MEMBERS ACCORDING TO FILTER</span>
                    <span>RESTRICTED EXPORT: TRUE</span>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  5. ROLES & PERMISSIONS
                  ================================================== */}
              {activeTab === 'Permissions' && (
                <WorkspaceTabPanel
                  className="h-full flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="border-b border-zinc-900 pb-2">
                      <h3 className="text-base font-black text-white uppercase tracking-tight">Fine-Grained Role Access Matrices</h3>
                      <p className="text-xs text-zinc-500 font-mono">Control HIPAA compliance scopes, treating clinical screens as modules with permission bounds.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                      {/* Left list of roles */}
                      <div className="p-3.5 bg-zinc-900/40 border border-zinc-850 rounded-2xl space-y-1 h-[380px] overflow-y-auto">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-mono block mb-2">Role Template</span>
                        {Object.keys(rolePermissions).map((role) => (
                          <button
                            key={role}
                            onClick={() => setSelectedPermissionRole(role as any)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold font-mono border transition-all cursor-pointer ${
                              selectedPermissionRole === role 
                                ? 'bg-purple-500 text-zinc-950 border-purple-400' 
                                : 'bg-transparent text-zinc-400 border-transparent hover:bg-zinc-950/40 hover:text-white'
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>

                      {/* Right permission toggles */}
                      <div className="lg:col-span-3 p-4 bg-zinc-900/10 border border-zinc-850 rounded-2xl h-[380px] space-y-4 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center border-b border-zinc-900 pb-2 mb-3">
                            <span className="text-xs font-black text-white font-mono uppercase">
                              Active Matrix: <span className="text-purple-400">{selectedPermissionRole}</span>
                            </span>
                            <span className="text-[9px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 border border-zinc-850 rounded">
                              HIPAA Scope Enforcement
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                              { key: 'charts', title: 'Read Treatment Charts', desc: 'Allows viewing visual restorative tooth charts and periodontal grids.' },
                              { key: 'prescribe', title: 'Write Prescription Parameters', desc: 'Allows issuing active medical recipes, pharmacotherapy guidelines.' },
                              { key: 'billing', title: 'View Financial Invoicing', desc: 'Allows access to billing modules, insurance claims, and price settings.' },
                              { key: 'admin', title: 'Full System Modifications', desc: 'Permission to adjust general workspace layouts, branding settings.' },
                              { key: 'directory', title: 'Edit Staff Access Sheets', desc: 'Allows adding, modifying, or terminating user access credentials.' },
                              { key: 'labs', title: 'Configure CAD/CAM Lab Orders', desc: 'Allows creating and managing mill/sinter manufacturing workflows.' },
                              { key: 'ai', title: 'Trigger Clinical AI Assist', desc: 'Permission to run automated model clinical diagnostics and summaries.' },
                            ].map((perm) => {
                              const isChecked = (rolePermissions[selectedPermissionRole] as any)[perm.key];
                              return (
                                <div
                                  key={perm.key}
                                  onClick={() => togglePermission(perm.key as any)}
                                  className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                                    isChecked 
                                      ? 'bg-purple-500/10 border-purple-500/40 text-purple-200' 
                                      : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800'
                                  }`}
                                >
                                  <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                    isChecked ? 'bg-purple-500 border-purple-400 text-zinc-950' : 'border-zinc-800 bg-zinc-900'
                                  }`}>
                                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <div>
                                    <h5 className="text-[11px] font-bold text-white">{perm.title}</h5>
                                    <p className="text-[9px] text-zinc-500 leading-relaxed font-mono">{perm.desc}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Audit Log Preview */}
                        <div className="p-2 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center justify-between font-mono text-[9px] text-zinc-500">
                          <span>LAST AUDITED: {new Date().toLocaleDateString()}</span>
                          <span className="text-purple-400 font-bold">MUTABLE ON-THE-FLY</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-900/20 border border-zinc-900 rounded-2xl flex justify-between items-center text-xs font-mono text-zinc-500">
                    <span>AUDIT ACTION LOGGED: TRUE</span>
                    <span>RESTRICTED EXPORT: TRUE</span>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  6. TEAMS
                  ================================================== */}
              {activeTab === 'Teams' && (
                <WorkspaceTabPanel
                  className="h-full flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                      <div>
                        <h3 className="text-base font-black text-white uppercase tracking-tight">Active Clinic Teams & Shifts</h3>
                        <p className="text-xs text-zinc-500 font-mono">Verify operational shifts, laboratory squads, and assigned operatories.</p>
                      </div>
                      <button 
                        onClick={() => {
                          const newTeam: TeamUnit = {
                            id: `T-0${teams.length + 1}`,
                            name: 'General Hygiene Clean & Polish',
                            type: 'Administrative',
                            members: ['Selina Kyle', 'Anya Chalotra'],
                            assignedRooms: ['Room H1', 'Room H2'],
                            availability: '80% Core Weeks',
                            status: 'On Duty'
                          };
                          setTeams([...teams, newTeam]);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> Launch Shift Team
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1">
                      {teams.map((t) => (
                        <div key={t.id} className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex flex-col justify-between h-[180px] space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold bg-zinc-950 border border-zinc-800 text-purple-400 px-1.5 py-0.5 rounded-md">
                                  {t.id}
                                </span>
                                <h4 className="text-xs font-black text-white">{t.name}</h4>
                              </div>
                              <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Focus: {t.type} operations</p>
                            </div>
                            <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full border ${
                              t.status === 'On Duty' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              t.status === 'On Call' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              'bg-zinc-800 text-zinc-400 border border-zinc-700'
                            }`}>
                              {t.status}
                            </span>
                          </div>

                          <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl space-y-1.5 font-mono text-[10px]">
                            <div className="flex justify-between text-zinc-400">
                              <span>Staff Roster:</span>
                              <span className="text-white font-bold">{t.members.join(', ')}</span>
                            </div>
                            <div className="flex justify-between text-zinc-400">
                              <span>Assigned Suites:</span>
                              <span className="text-zinc-300 font-bold">{t.assignedRooms.join(' / ')}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                            <span>Availability rate: <strong className="text-emerald-400">{t.availability}</strong></span>
                            <button 
                              onClick={() => {
                                setTeams(teams.filter(item => item.id !== t.id));
                              }}
                              className="text-rose-400 hover:underline"
                            >
                              Disband Team
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-900/20 border border-zinc-900 rounded-2xl flex justify-between items-center text-xs font-mono text-zinc-500">
                    <span>ROSTER TEAMS TOTAL: {teams.length} ON-CALL SHIFTS</span>
                    <span>ONLINE REALTIME FEED: ACTIVE</span>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  7. ACTIVITY & AUDIT LOG
                  ================================================== */}
              {activeTab === 'Audits' && (
                <WorkspaceTabPanel
                  className="h-full flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="border-b border-zinc-900 pb-2">
                      <h3 className="text-base font-black text-white uppercase tracking-tight">HIPAA System Audit & Security Ledger</h3>
                      <p className="text-xs text-zinc-500 font-mono">Immutable transaction logs monitoring patient chart views, treatment updates, login locations, and diagnostic actions.</p>
                    </div>

                    {/* Table-based Audit Log */}
                    <div className="overflow-x-auto rounded-xl border border-zinc-900 max-h-[380px] overflow-y-auto">
                      <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead>
                          <tr className="bg-zinc-950 text-zinc-500 text-[10px] uppercase font-bold border-b border-zinc-900">
                            <th className="p-3">Audit Timestamp</th>
                            <th className="p-3">Operator</th>
                            <th className="p-3">Submodule Scope</th>
                            <th className="p-3">Action logged</th>
                            <th className="p-3">Client IP Address</th>
                            <th className="p-3">Status code</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
                          {audits.map((log) => (
                            <tr key={log.id} className="hover:bg-zinc-900/20">
                              <td className="p-3 text-zinc-500">{log.timestamp}</td>
                              <td className="p-3 font-bold text-zinc-200">
                                <div className="flex flex-col">
                                  <span>{log.actor}</span>
                                  <span className="text-[9px] text-zinc-500">{log.role}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="bg-zinc-900 border border-zinc-800 text-[10px] px-2 py-0.5 rounded text-zinc-400">
                                  {log.module}
                                </span>
                              </td>
                              <td className="p-3 text-zinc-100 max-w-[200px] truncate">{log.action}</td>
                              <td className="p-3 text-zinc-500">{log.ipAddress}</td>
                              <td className="p-3">
                                <span className={`text-[9px] font-black font-mono px-2 py-0.5 rounded-full ${
                                  log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                  log.status === 'Warn' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                  'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                  {log.status.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-900/20 border border-zinc-900 rounded-2xl flex justify-between items-center text-xs font-mono text-zinc-500">
                    <span>IMMUTABLE LEDGER HASH: SHA-256 SECURED BY HEALTHOS SHARED TRUST</span>
                    <span>PCI COMPLIANT: TRUE</span>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  8. NOTIFICATIONS
                  ================================================== */}
              {activeTab === 'Notifications' && (
                <WorkspaceTabPanel
                  className="h-full flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                      <div>
                        <h3 className="text-base font-bold text-white uppercase tracking-tight font-sans">{tOrg('notices.headerTitle')}</h3>
                        <p className="text-xs text-zinc-400 font-sans">{tOrg('notices.headerSubtitle')}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Left publish form */}
                      <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl space-y-3 h-[380px] flex flex-col justify-between font-sans">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-sans block">{tOrg('notices.draftTitle')}</span>
                          <p className="text-[10px] text-zinc-400 font-sans">{tOrg('notices.draftDesc')}</p>
                        </div>

                        <form onSubmit={handleAddAnnouncement} className="space-y-3 flex-1 justify-center mt-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-sans text-zinc-400 font-bold uppercase block">{tOrg('notices.titleLabel')}</label>
                            <input
                              type="text"
                              value={newAnnouncementTitle}
                              onChange={(e) => setNewAnnouncementTitle(e.target.value)}
                              placeholder={tOrg('notices.titlePlaceholder')}
                              className="w-full p-2 bg-zinc-950 border border-zinc-850 text-xs rounded-xl outline-none focus:border-emerald-500 text-white font-sans placeholder:text-zinc-600"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-sans text-zinc-400 font-bold uppercase block">{tOrg('notices.typeLabel')}</label>
                            <select
                              value={newAnnouncementType}
                              onChange={(e: any) => setNewAnnouncementType(e.target.value)}
                              className="w-full p-2 bg-zinc-950 border border-zinc-850 text-xs rounded-xl outline-none focus:border-emerald-500 text-zinc-300 font-sans"
                            >
                              <option value="Announcement">{tOrg('notices.types.standard')}</option>
                              <option value="Critical">{tOrg('notices.types.critical')}</option>
                              <option value="Maintenance">{tOrg('notices.types.maintenance')}</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-sans text-zinc-400 font-bold uppercase block">{tOrg('notices.bodyLabel')}</label>
                            <textarea
                              value={newAnnouncementContent}
                              onChange={(e) => setNewAnnouncementContent(e.target.value)}
                              rows={3}
                              placeholder={tOrg('notices.bodyPlaceholder')}
                              className="w-full p-2 bg-zinc-950 border border-zinc-850 text-xs rounded-xl outline-none focus:border-emerald-500 text-white font-sans placeholder:text-zinc-600 resize-none"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-extrabold uppercase font-sans tracking-wider transition-colors cursor-pointer"
                          >
                            {tOrg('notices.broadcastBtn')}
                          </button>
                        </form>
                      </div>

                      {/* Right active announcements list */}
                      <div className="lg:col-span-2 p-4 bg-zinc-900/10 border border-zinc-850 rounded-2xl h-[380px] overflow-y-auto scrollbar-thin space-y-3 font-sans">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-sans block mb-2">{tOrg('notices.boardTitle')}</span>
                        <div className="space-y-2.5">
                          {announcements.map((item) => (
                            <div key={item.id} className="p-4.5 bg-zinc-950 border border-zinc-900 rounded-xl space-y-2 relative group font-sans">
                              <span className={`text-[9px] font-sans font-bold px-2 py-0.5 rounded-full border absolute top-3 right-3 ${
                                item.type === 'Critical' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' :
                                item.type === 'Maintenance' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                                'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              }`}>
                                {item.type === 'Critical' ? tOrg('notices.types.critical') :
                                 item.type === 'Maintenance' ? tOrg('notices.types.maintenance') :
                                 tOrg('notices.types.standard')}
                              </span>
                              <div className="flex items-start gap-2.5 font-sans">
                                <Bell className="w-4.5 h-4.5 mt-0.5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                                <div className="space-y-1">
                                  <h4 className="text-xs font-bold text-white font-sans">{item.title}</h4>
                                  <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">{item.content}</p>
                                  <p className="text-[9px] text-zinc-500 font-sans pt-1">
                                    {item.date} • {item.author}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-900/20 border border-zinc-900 rounded-2xl flex justify-between items-center text-xs font-mono text-zinc-500">
                    <span>BROADCASTS LOGGED: TRUE</span>
                    <span>RESTRICTED EXPORT: TRUE</span>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  9. SECURITY CENTER
                  ================================================== */}
              {activeTab === 'Security' && (
                <WorkspaceTabPanel
                  className="h-full flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="border-b border-zinc-900 pb-2 flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-black text-white uppercase tracking-tight">HealthOS Platform Security Engine</h3>
                        <p className="text-xs text-zinc-500 font-mono">HIPAA Compliance Shield, Password Parameters, and Active User Token Validation.</p>
                      </div>
                      <button
                        onClick={runSecurityScan}
                        disabled={securityScanRunning}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all uppercase ${
                          securityScanRunning 
                            ? 'bg-zinc-800 text-zinc-600 border border-zinc-750 cursor-not-allowed' 
                            : 'bg-rose-500 hover:bg-rose-400 text-zinc-950 cursor-pointer'
                        }`}
                      >
                        {securityScanRunning ? 'Scanning Server...' : 'Trigger Compliance Audit'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Security Parameters Panel */}
                      <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl h-[380px] flex flex-col justify-between space-y-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">Credential policies</span>
                        
                        <div className="space-y-4 flex-1 mt-2">
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                              <span>Min Password Length:</span>
                              <span className="text-white font-bold">{passwordMinLength} characters</span>
                            </div>
                            <input
                              type="range"
                              min="8"
                              max="24"
                              value={passwordMinLength}
                              onChange={(e) => setPasswordMinLength(Number(e.target.value))}
                              className="w-full accent-emerald-500 bg-zinc-950 rounded-lg appearance-none h-1.5"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                              <span>Auto-Logout Timeout:</span>
                              <span className="text-white font-bold">{sessionTimeout} minutes</span>
                            </div>
                            <input
                              type="range"
                              min="5"
                              max="60"
                              value={sessionTimeout}
                              step="5"
                              onChange={(e) => setSessionTimeout(Number(e.target.value))}
                              className="w-full accent-emerald-500 bg-zinc-950 rounded-lg appearance-none h-1.5"
                            />
                          </div>

                          {/* 2FA toggle placeholder */}
                          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Fingerprint className="w-5 h-5 text-emerald-400" />
                              <div>
                                <h5 className="text-[11px] font-bold text-white">Enforce 2FA Authenticator</h5>
                                <p className="text-[8px] text-zinc-500 font-mono">Requires secure auth code on log</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setRequire2FA(!require2FA)}
                              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${require2FA ? 'bg-emerald-500' : 'bg-zinc-800'}`}
                            >
                              <div className={`w-4 h-4 rounded-full bg-zinc-950 transition-transform ${require2FA ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                          </div>
                        </div>

                        {/* Interactive QR Placeholder */}
                        {require2FA && (
                          <div className="p-2.5 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center gap-3">
                            <div className="w-12 h-12 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-center shrink-0">
                              <div className="grid grid-cols-4 gap-0.5 p-1 w-full h-full">
                                {Array.from({ length: 16 }).map((_, i) => (
                                  <div key={i} className={`rounded-[1px] ${i % 3 === 0 || i % 5 === 1 ? 'bg-white' : 'bg-transparent'}`} />
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-white font-mono">Clinician Token Key</p>
                              <p className="text-[8px] text-zinc-500 font-mono">Scan code to register new authenticator device</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Device List & Health Console */}
                      <div className="md:col-span-2 p-4 bg-zinc-900/10 border border-zinc-850 rounded-2xl h-[380px] space-y-4 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center border-b border-zinc-900 pb-2 mb-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono">Active Operator Device Nodes</span>
                            <span className="text-[9px] font-mono text-emerald-400">Total verified devices: 4</span>
                          </div>

                          <div className="space-y-2">
                            {[
                              { device: 'Catherine Avery Desktop PC (Chrome)', ip: '192.168.1.14', location: 'Springfield Main Campus', lastActive: 'Active now', icon: Server },
                              { device: 'North Ward Tablet 3 (iOS)', ip: '192.168.1.84', location: 'Urgent Care operatory 2', lastActive: '14 mins ago', icon: Smartphone },
                              { device: 'Yuri Gagarin Lab Terminal (Windows)', ip: '10.0.4.15', location: 'CAD/CAM Milling Chamber', lastActive: '2 hrs ago', icon: Server },
                              { device: 'Lucius Fox MacBook (macOS)', ip: '192.168.1.2', location: 'Gotham Headquarter Office', lastActive: '1 day ago', icon: Server }
                            ].map((item, idx) => {
                              const DevIcon = item.icon;
                              return (
                                <div key={idx} className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center justify-between font-mono text-[10px]">
                                  <div className="flex items-center gap-2.5">
                                    <DevIcon className="w-4 h-4 text-zinc-500" />
                                    <div>
                                      <p className="font-bold text-white">{item.device}</p>
                                      <p className="text-[9px] text-zinc-500">{item.location} • {item.ip}</p>
                                    </div>
                                  </div>
                                  <span className="text-[9px] text-emerald-400">{item.lastActive}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Security rating */}
                        <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl flex justify-between items-center">
                          <div className="flex items-center gap-2 font-mono">
                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                            <div>
                              <p className="text-[11px] text-white font-bold">HIPAA Security rating</p>
                              <p className="text-[9px] text-zinc-500">Perfect compliance posture</p>
                            </div>
                          </div>
                          <span className="text-2xl font-black text-emerald-400 font-mono">{securityScore}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-900/20 border border-zinc-900 rounded-2xl flex justify-between items-center text-xs font-mono text-zinc-500">
                    <span>SECURITY PARAMS RE-AUDITED: COMPLETED SUCCESSFULLY</span>
                    <span>RESTRICTED EXPORT: TRUE</span>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  10. ORGANIZATION SETTINGS
                  ================================================== */}
              {activeTab === 'Settings' && (
                <WorkspaceTabPanel
                  className="h-full flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="border-b border-zinc-900 pb-2">
                      <h3 className="text-base font-black text-white uppercase tracking-tight">Organization Customization & Locales</h3>
                      <p className="text-xs text-zinc-500 font-mono">Modify workspace names, timezone constraints, and UI custom branding palettes.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left form params */}
                      <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl h-[380px] flex flex-col justify-between space-y-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">Tenant Localization Settings</span>
                        
                        <div className="space-y-3 flex-1 mt-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-400 font-bold uppercase block">Workspace Branding Name</label>
                            <input
                              type="text"
                              value={workspaceName}
                              onChange={(e) => setWorkspaceName(e.target.value)}
                              placeholder="Branding Name"
                              className="w-full p-2 bg-zinc-950 border border-zinc-850 text-xs rounded-xl outline-none focus:border-emerald-500 text-white font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-400 font-bold uppercase block">Timezone Scope</label>
                            <select
                              value={workspaceTimezone}
                              onChange={(e) => setWorkspaceTimezone(e.target.value)}
                              className="w-full p-2 bg-zinc-950 border border-zinc-850 text-xs rounded-xl outline-none focus:border-emerald-500 text-zinc-300 font-mono"
                            >
                              <option value="America/New_York (EST)">America/New_York (EST)</option>
                              <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                              <option value="Asia/Tokyo (JST)">Asia/Tokyo (JST)</option>
                              <option value="UTC (Zulu)">UTC (Zulu)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-400 font-bold uppercase block">Primary Language</label>
                            <select
                              value={primaryLanguage}
                              onChange={(e) => setPrimaryLanguage(e.target.value)}
                              className="w-full p-2 bg-zinc-950 border border-zinc-850 text-xs rounded-xl outline-none focus:border-emerald-500 text-zinc-300 font-mono"
                            >
                              <option value="English (US)">English (US)</option>
                              <option value="Spanish (ES)">Spanish (ES)</option>
                              <option value="Japanese (JA)">Japanese (JA)</option>
                            </select>
                          </div>

                          {/* Branding Color palette simulator */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase block">Workspace UI Accent color</span>
                            <div className="flex gap-2">
                              {['emerald', 'cyan', 'indigo', 'rose', 'amber'].map((color) => (
                                <button
                                  key={color}
                                  onClick={() => setBrandColor(color)}
                                  className={`p-1.5 rounded-lg border text-[10px] font-bold font-mono transition-all cursor-pointer ${
                                    brandColor === color 
                                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 font-black' 
                                      : 'bg-zinc-950 border-zinc-900 text-zinc-500'
                                  }`}
                                >
                                  {color.toUpperCase()}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="p-2.5 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center justify-between font-mono text-[9px] text-zinc-500">
                          <span>CHANGES RE-WRITE GLOBAL CACHE DIRECTLY</span>
                        </div>
                      </div>

                      {/* Right preview card */}
                      <div className="p-4 bg-zinc-900/10 border border-zinc-850 rounded-2xl h-[380px] flex flex-col justify-between">
                        <div className="space-y-4">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">Custom Client Branding Preview</span>
                          <p className="text-[10px] text-zinc-400 font-mono">This preview reflects how patient-facing letters and portals render.</p>

                          {/* Preview visual card */}
                          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-4 shadow-xl">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg ${
                                  brandColor === 'emerald' ? 'bg-emerald-500' :
                                  brandColor === 'cyan' ? 'bg-cyan-500' :
                                  brandColor === 'indigo' ? 'bg-indigo-500' :
                                  brandColor === 'rose' ? 'bg-rose-500' :
                                  'bg-amber-500'
                                } text-zinc-950 font-black flex items-center justify-center text-xs uppercase shadow`}>
                                  H
                                </div>
                                <div>
                                  <h4 className="text-xs font-black text-white">{workspaceName.substring(0, 24)}...</h4>
                                  <p className="text-[9px] text-zinc-500 font-mono">Dynamic localization: {workspaceTimezone}</p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1 border-t border-zinc-900 pt-3">
                              <p className="text-[11px] text-zinc-300">Dear Patient,</p>
                              <p className="text-[10px] text-zinc-500 font-mono leading-relaxed">
                                This treatment schedule is dynamically calculated in <span className="text-emerald-400 font-bold">{primaryLanguage}</span> based on multi-clinic timezone standards.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Reset */}
                        <button
                          onClick={() => {
                            setWorkspaceName('HealthOS Dental Group International');
                            setWorkspaceTimezone('America/New_York (EST)');
                            setPrimaryLanguage('English (US)');
                            setBrandColor('emerald');
                          }}
                          className="w-full py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 rounded-xl text-zinc-400 hover:text-white text-xs font-bold font-mono transition-colors uppercase cursor-pointer"
                        >
                          Reset Branding Parameters
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-900/20 border border-zinc-900 rounded-2xl flex justify-between items-center text-xs font-mono text-zinc-500">
                    <span>BRAND PARAMETERS COMPILATION STATUS: OK</span>
                    <span>RESTRICTED EXPORT: TRUE</span>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  11. DISASTER RECOVERY & SLA BACKUPS
                  ================================================== */}
              {activeTab === 'Backup' && (
                <WorkspaceTabPanel
                  className="h-full flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="border-b border-zinc-900 pb-2 flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-black text-white uppercase tracking-tight">SLA Backups & Disaster Recovery</h3>
                        <p className="text-xs text-zinc-500 font-mono">Manage real-time persistent cluster snapshots, cryptographically verifiable backups, and recovery states.</p>
                      </div>
                      <button
                        onClick={() => {
                          createManualBackup();
                          setDrStatusType('success');
                          setDrStatusMessage(`SLA Manual Archive triggered successfully. Verified sha256 checksum.`);
                          setTimeout(() => setDrStatusMessage(null), 6000);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-black text-xs font-bold transition-all cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> Trigger SLA Backup Snapshot
                      </button>
                    </div>

                    {drStatusMessage && (
                      <div className={`p-3 border rounded-xl font-mono text-xs flex justify-between items-center ${
                        drStatusType === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                        drStatusType === 'warn' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                        'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      }`}>
                        <span>{drStatusMessage}</span>
                        <button onClick={() => setDrStatusMessage(null)} className="p-0.5 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Left: SLA Health Telemetry */}
                      <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex flex-col justify-between h-[380px] space-y-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block mb-2">Cryptographic Cluster Checksum</span>
                          
                          <div className="space-y-2.5 font-mono text-xs mt-3">
                            <div className="flex justify-between items-center bg-zinc-950 p-2 rounded-xl border border-zinc-900">
                              <span className="text-zinc-400">Main Database DB:</span>
                              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">HEALTHY</span>
                            </div>
                            <div className="flex justify-between items-center bg-zinc-950 p-2 rounded-xl border border-zinc-900">
                              <span className="text-zinc-400">AWS PACS Storage:</span>
                              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">HEALTHY</span>
                            </div>
                            <div className="flex justify-between items-center bg-zinc-950 p-2 rounded-xl border border-zinc-900">
                              <span className="text-zinc-400">exocad CAD/CAM Node:</span>
                              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">HEALTHY</span>
                            </div>
                            <div className="flex justify-between items-center bg-zinc-950 p-2 rounded-xl border border-zinc-900">
                              <span className="text-zinc-400">Inference Engine Nodes:</span>
                              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">HEALTHY</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 text-[10px] font-mono text-zinc-400 space-y-1">
                            <p className="font-bold text-white uppercase tracking-wider text-[8px] text-zinc-500">Telemetry Scan Data</p>
                            <p>API Gateway Cluster: <span className="text-white">Active (99.99%)</span></p>
                            <p>Database Latency: <span className="text-emerald-400">11ms</span></p>
                          </div>

                          <button
                            onClick={() => {
                              runIntegrityScan();
                              setDrStatusType('info');
                              setDrStatusMessage(`Full cryptographic database checksum scan completed. Latency: 9ms. Status: ALL SECURE.`);
                              setTimeout(() => setDrStatusMessage(null), 6000);
                            }}
                            className="w-full py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-blue-500/50 rounded-xl text-blue-400 hover:text-white text-xs font-bold font-mono transition-all uppercase cursor-pointer"
                          >
                            Run Diagnostic Scan
                          </button>
                        </div>
                      </div>

                      {/* Right: Backups Archive list */}
                      <div className="lg:col-span-2 p-4 bg-zinc-900/30 border border-zinc-850 rounded-2xl flex flex-col justify-between h-[380px]">
                        <div className="space-y-2 flex-1 overflow-hidden flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block mb-1">Cryptographically Authenticated Backups List</span>
                          
                          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                            {backups.map((bkp) => (
                              <div key={bkp.id} className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center justify-between font-mono text-xs">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-white">{bkp.id}</span>
                                    <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border ${
                                      bkp.type === 'Manual' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    }`}>
                                      {bkp.type.toUpperCase()}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-zinc-500 font-semibold">Created: {bkp.timestamp} | Size: {bkp.size}</p>
                                  <p className="text-[9px] text-zinc-650 truncate max-w-xs">{bkp.checksum}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                  {bkp.status === 'Restored' ? (
                                    <span className="text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-lg">
                                      Active State
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        restoreBackup(bkp.id);
                                        setDrStatusType('success');
                                        setDrStatusMessage(`Successfully restored all clinical databases and tenant state to backup archive: ${bkp.id}`);
                                        setTimeout(() => setDrStatusMessage(null), 6000);
                                      }}
                                      className="px-3 py-1 bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-850 text-blue-400 hover:text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                                    >
                                      Restore
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-900/20 border border-zinc-900 rounded-2xl flex justify-between items-center text-xs font-mono text-zinc-500">
                    <span>SECURITY COMPLIANCE AUDITING: AES-256 ENCRYPTED</span>
                    <span>DR CONSOLE VERSION: v1.0.4-LTS</span>
                  </div>
                </WorkspaceTabPanel>
              )}

            </AnimatePresence>
          </div>
        </div>
  );
}
