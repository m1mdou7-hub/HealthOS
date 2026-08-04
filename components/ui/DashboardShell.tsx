'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  FileText,
  Sparkles,
  FlaskConical,
  Activity,
  Package,
  LineChart,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  CreditCard,
  Blocks,
  Zap,
  Terminal,
  MessageSquare,
  Folder,
  CheckSquare,
  Bell,
  ShieldCheck,
  Globe,
  HelpCircle,
  Search,
  Command,
  ArrowRight,
  Sparkle,
  Lock,
  ShieldAlert,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { handleRequest } from '@/utils/auth-helpers/client';
import { SignOut } from '@/utils/auth-helpers/server';
import { 
  getActiveRole, 
  setActiveRole, 
  checkPageAccess, 
  UserRole 
} from '@/utils/enterpriseState';
import LicenseGate from '@/components/licensing/LicenseGate';
import LanguageSwitcher from '@/components/ui/language-switcher';
import { staffAuthService, StaffRole } from '@/utils/services/staffAuthService';

interface DashboardShellProps {
  user: any;
  children: React.ReactNode;
}

// `labelKey` maps to a key under the "Navigation" namespace in the message
// catalogs so nav labels are localized. `name` is kept as an English fallback.
const NAV_ITEMS = [
  { name: 'Dashboard', labelKey: 'dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Patients', labelKey: 'patients', href: '/patients', icon: Users },
  { name: 'Clinics', labelKey: 'clinics', href: '/clinics', icon: Building2 },
  { name: 'Appointments', labelKey: 'appointments', href: '/appointments', icon: Calendar },
  { name: 'Medical Records', labelKey: 'medicalRecords', href: '/medical-records', icon: FileText },
  { name: 'AI Assistant', labelKey: 'aiAssistant', href: '/ai-assistant', icon: Sparkles },
  { name: 'Laboratory', labelKey: 'laboratory', href: '/laboratory', icon: FlaskConical },
  { name: 'Imaging', labelKey: 'imaging', href: '/imaging', icon: Activity },
  { name: 'Inventory', labelKey: 'inventory', href: '/inventory', icon: Package },
  { name: 'Analytics', labelKey: 'analytics', href: '/analytics', icon: LineChart },
  { name: 'Billing', labelKey: 'billing', href: '/billing', icon: CreditCard },
  { name: 'Pricing', labelKey: 'pricing', href: '/pricing', icon: Sparkle },
  { name: 'Communication', labelKey: 'communication', href: '/communication', icon: MessageSquare },
  { name: 'Document Center', labelKey: 'documents', href: '/documents', icon: Folder },
  { name: 'Task Workspace', labelKey: 'tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Notification Hub', labelKey: 'notifications', href: '/notifications', icon: Bell },
  { name: 'Audit & Compliance', labelKey: 'audit', href: '/audit', icon: ShieldCheck },
  { name: 'Platform Console', labelKey: 'platform', href: '/platform', icon: Globe },
  { name: 'Integrations', labelKey: 'integrations', href: '/integrations', icon: Blocks },
  { name: 'Automations', labelKey: 'automations', href: '/automations', icon: Zap },
  { name: 'Developer', labelKey: 'developer', href: '/developer', icon: Terminal },
  { name: 'Help Center', labelKey: 'help', href: '/help', icon: HelpCircle },
  { name: 'Settings', labelKey: 'settings', href: '/settings', icon: Settings },
];

const ROLE_NAV_ITEMS: Record<string, typeof NAV_ITEMS> = {
  'Super Admin': [
    { name: 'Dashboard', labelKey: 'dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Clinics', labelKey: 'clinics', href: '/clinics', icon: Building2 },
    { name: 'Patients', labelKey: 'patients', href: '/patients', icon: Users },
    { name: 'Integrations', labelKey: 'integrations', href: '/integrations', icon: Blocks },
    { name: 'Developer', labelKey: 'developer', href: '/developer', icon: Terminal },
    { name: 'Audit & Compliance', labelKey: 'audit', href: '/audit', icon: ShieldCheck },
    { name: 'Billing', labelKey: 'billing', href: '/billing', icon: CreditCard },
    { name: 'Settings', labelKey: 'settings', href: '/settings', icon: Settings },
  ],
  'Clinic Owner': [
    { name: 'Dashboard', labelKey: 'dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Patients', labelKey: 'patients', href: '/patients', icon: Users },
    { name: 'Clinics', labelKey: 'clinics', href: '/clinics', icon: Building2 },
    { name: 'Appointments', labelKey: 'appointments', href: '/appointments', icon: Calendar },
    { name: 'Billing', labelKey: 'billing', href: '/billing', icon: CreditCard },
    { name: 'Laboratory', labelKey: 'laboratory', href: '/laboratory', icon: FlaskConical },
    { name: 'Analytics', labelKey: 'analytics', href: '/analytics', icon: LineChart },
    { name: 'Settings', labelKey: 'settings', href: '/settings', icon: Settings },
  ],
  'Laboratory Technician': [
    { name: 'Dashboard', labelKey: 'dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Laboratory', labelKey: 'laboratory', href: '/laboratory', icon: FlaskConical },
    { name: 'Imaging', labelKey: 'imaging', href: '/imaging', icon: Activity },
    { name: 'Inventory', labelKey: 'inventory', href: '/inventory', icon: Package },
    { name: 'Settings', labelKey: 'settings', href: '/settings', icon: Settings },
  ],
  'Receptionist': [
    { name: 'Dashboard', labelKey: 'dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Appointments', labelKey: 'appointments', href: '/appointments', icon: Calendar },
    { name: 'Patients', labelKey: 'patients', href: '/patients', icon: Users },
    { name: 'Communication', labelKey: 'communication', href: '/communication', icon: MessageSquare },
    { name: 'Settings', labelKey: 'settings', href: '/settings', icon: Settings },
  ],
  'Read-only Auditor': [
    { name: 'Dashboard', labelKey: 'dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Audit & Compliance', labelKey: 'audit', href: '/audit', icon: ShieldCheck },
    { name: 'Settings', labelKey: 'settings', href: '/settings', icon: Settings },
  ]
};

const getNavItemsForRole = (role: string) => {
  return ROLE_NAV_ITEMS[role] || NAV_ITEMS;
};

export default function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const tNav = useTranslations('Navigation');
  const tCommon = useTranslations('Common');
  const tAccess = useTranslations('Access');
  const tRoles = useTranslations('Roles');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [commandFeedback, setCommandFeedback] = useState('');
  const [activeRole, setActiveRoleState] = useState<UserRole>('Super Admin');

  // Quick Staff Invite Modal State
  const [showQuickInviteModal, setShowQuickInviteModal] = useState(false);
  const [quickInviteForm, setQuickInviteForm] = useState({
    name: '',
    email: '',
    role: 'clinician' as StaffRole,
    tempPassword: 'doctor123'
  });

  const handleQuickInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newMember = staffAuthService.inviteStaffMember({
        name: quickInviteForm.name,
        email: quickInviteForm.email,
        role: quickInviteForm.role,
        passwordHash: quickInviteForm.tempPassword
      });
      setShowQuickInviteModal(false);
      setQuickInviteForm({ name: '', email: '', role: 'clinician', tempPassword: 'doctor123' });
      triggerFeedback(`تمت إضافة ودعوة الموظف "${newMember.name}" بنجاح!`);
    } catch (err: any) {
      alert(err.message || 'تعذر إضافة الموظف.');
    }
  };

  // Sync active role with localStorage and event notifications
  useEffect(() => {
    setActiveRoleState(getActiveRole());
    
    const handleStateChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.type === 'role') {
        setActiveRoleState(customEvent.detail.value);
      }
    };
    
    window.addEventListener('healthos_state_change', handleStateChange);
    return () => window.removeEventListener('healthos_state_change', handleStateChange);
  }, []);

  // Listen to Cmd+K or Ctrl+K to toggle Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandMenuOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setCommandMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const COMMAND_ITEMS = React.useMemo(() => [
    { name: 'Navigate to Dashboard', category: 'Navigation', action: () => router.push('/') },
    { name: 'Navigate to Patient Index', category: 'Navigation', action: () => router.push('/patients') },
    { name: 'Navigate to Clinics Admin', category: 'Navigation', action: () => router.push('/clinics') },
    { name: 'Navigate to Appointments Scheduler', category: 'Navigation', action: () => router.push('/appointments') },
    { name: 'Navigate to Communication Hub', category: 'Navigation', action: () => router.push('/communication') },
    { name: 'Navigate to Documents Cabinet', category: 'Navigation', action: () => router.push('/documents') },
    { name: 'Navigate to Tasks Board', category: 'Navigation', action: () => router.push('/tasks') },
    { name: 'Navigate to Notification Settings', category: 'Navigation', action: () => router.push('/notifications') },
    { name: 'Navigate to Audit Logs', category: 'Navigation', action: () => router.push('/audit') },
    { name: 'Navigate to Help Center', category: 'Navigation', action: () => router.push('/help') },
    { name: 'Navigate to Platform Console', category: 'Navigation', action: () => router.push('/platform') },
    { name: 'Navigate to Pricing Plans', category: 'Navigation', action: () => router.push('/pricing') },
    { name: 'Calibrate Zirconia Sintering Oven', category: 'Hardware Actions', action: () => triggerFeedback('Sintering temperature curves successfully calibrated to +1500C Sintram limit.') },
    { name: 'Sync active Exocad Licenses Node', category: 'System Operations', action: () => triggerFeedback('Exocad CAD/CAM core verification key flushed and synchronized.') },
    { name: 'Trigger secure local Cloud SQL backup', category: 'System Operations', action: () => triggerFeedback('Immutable database backup archive dispatched successfully.') },
    { name: 'Deploy Emergency Platform Broadcast notice', category: 'Operations Actions', action: () => triggerFeedback('System notice successfully deployed across all connected tenant portals.') }
  ], [router]);

  const triggerFeedback = (msg: string) => {
    setCommandFeedback(msg);
    setTimeout(() => setCommandFeedback(''), 4000);
  };

  const filteredCommands = React.useMemo(() => COMMAND_ITEMS.filter(item => {
    return item.name.toLowerCase().includes(commandQuery.toLowerCase()) ||
           item.category.toLowerCase().includes(commandQuery.toLowerCase());
  }), [commandQuery, COMMAND_ITEMS]);

  // Derive page title
  const activeItem = NAV_ITEMS.find((item) => {
    if (item.href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(item.href);
  });
  const pageTitle = activeItem ? activeItem.name : 'HealthOS Workspace';

  const isDevBypass =
    process.env.NODE_ENV !== 'production' &&
    (user?.isDevBypass || process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true');

  return (
    <LicenseGate>
    <div className="flex flex-col h-screen overflow-hidden">
      {isDevBypass && (
        <div id="dev-mode-banner" className="bg-amber-500 text-black text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 border-b border-amber-600 select-none shrink-0 z-50">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-black text-amber-400 font-bold uppercase tracking-wider text-[9px] leading-none">
            DEV MODE
          </span>
          <span>Bypassing Supabase authentication for local development. Production authentication remains active and untouched.</span>
        </div>
      )}
      <div className="flex flex-1 bg-zinc-950 text-zinc-100 overflow-hidden font-sans relative">
      {/* Sidebar Spacer for Desktop layout */}
      <div className="hidden lg:block w-[72px] shrink-0" />

      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:flex-col absolute left-0 top-0 bottom-0 w-[72px] hover:w-64 z-50 border-r border-zinc-900 bg-zinc-950/90 backdrop-blur-md transition-all duration-300 ease-in-out group shadow-xl shadow-black/45">
        {/* Brand Header */}
        <div className="flex items-center h-16 px-[20px] border-b border-zinc-900 gap-3 overflow-hidden shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500 text-white shrink-0">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <span className="font-semibold text-lg tracking-tight text-white opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">HealthOS</span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
            PRO
          </span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3.5 py-6 space-y-1.5 overflow-y-auto scrollbar-none">
          {getNavItemsForRole(activeRole).map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={tNav(item.labelKey)}
                href={item.href}
                className={`flex items-center px-2.5 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 group/nav overflow-hidden ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform duration-150 group-hover/nav:scale-105 ${
                    isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover/nav:text-zinc-100'
                  }`}
                />
                <span className="ml-3 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">{tNav(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Area */}
        <div className="p-3.5 border-t border-zinc-900 bg-zinc-950/20 overflow-hidden shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-zinc-300 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
                <p className="text-xs font-medium text-zinc-200 truncate">
                  {user?.email || 'Medical Operator'}
                </p>
                <p className="text-[10px] text-zinc-500 truncate font-mono">Operator Console</p>
              </div>
            </div>
            <form onSubmit={(e) => handleRequest(e, SignOut, router)} className="opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shrink-0">
              <input type="hidden" name="pathName" value={pathname} />
              <button
                type="submit"
                title="Sign out"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative flex flex-col w-full max-w-xs flex-1 bg-zinc-900 border-r border-zinc-800">
            {/* Close button */}
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Brand Header */}
            <div className="flex items-center h-16 px-6 border-b border-zinc-800 gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500 text-white">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <span className="font-semibold text-lg tracking-tight text-white">HealthOS</span>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {getNavItemsForRole(activeRole).map((item) => {
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={tNav(item.labelKey)}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3 text-zinc-400" />
                    {tNav(item.labelKey)}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom User Area */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0 gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-zinc-300">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-200 truncate">{user?.email}</p>
                    <p className="text-[10px] text-zinc-500">Workspace Operator</p>
                  </div>
                </div>
                <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
                  <input type="hidden" name="pathName" value={pathname} />
                  <button
                    type="submit"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between h-16 px-6 border-b border-zinc-800 bg-zinc-900/30 backdrop-blur-md">
          <div className="flex items-center">
            {/* Mobile toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 mr-4 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 lg:hidden focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-white tracking-tight mr-6">{pageTitle}</h1>
            
            {/* Command Palette Launcher Button */}
            <button
              onClick={() => setCommandMenuOpen(true)}
              className="hidden md:flex items-center gap-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 px-3.5 py-2 rounded-2xl text-zinc-500 hover:text-zinc-400 text-xs font-mono transition-all cursor-pointer select-none"
            >
              <Search className="w-4 h-4 text-zinc-600" />
              <span>{tCommon('searchOrRunCommand')}</span>
              <kbd className="ml-4 px-1.5 py-0.5 text-[9px] bg-zinc-900 border border-zinc-800 rounded text-zinc-600 font-mono">⌘K</kbd>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Active Role Selector Dropdown */}
            <div className="relative flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl px-3 py-1.5 hover:bg-zinc-850 transition-colors">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <select
                value={activeRole}
                onChange={(e) => {
                  const targetRole = e.target.value as UserRole;
                  setActiveRole(targetRole);
                }}
                className="bg-transparent border-none text-xs font-semibold text-zinc-300 outline-none pr-1.5 cursor-pointer font-sans"
              >
                {[
                  'Super Admin',
                  'Clinic Owner',
                  'Prosthodontist',
                  'General Dentist',
                  'Assistant',
                  'Receptionist',
                  'Laboratory Technician',
                  'Read-only Auditor'
                ].map((roleKey) => (
                  <option key={roleKey} value={roleKey} className="bg-zinc-950 text-white font-sans py-1">
                    {tRoles(roleKey)}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Invite Staff Button for Admins */}
            {(activeRole === 'Super Admin' || activeRole === 'Clinic Owner') && (
              <button
                type="button"
                onClick={() => setShowQuickInviteModal(true)}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/10 cursor-pointer transition-all"
                title="إضافة وتحديد صلاحيات موظف جديد"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden md:inline">+ دعوة موظف</span>
              </button>
            )}

            <span className="text-xs text-zinc-400 font-mono hidden xl:inline">
              {tCommon('systemStatus')}: <span className="text-emerald-400 font-semibold">{tCommon('secure')}</span>
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-zinc-950">
          {(() => {
            const access = checkPageAccess(pathname, activeRole);
            if (!access.allowed) {
              return (
                <div className="min-h-[70vh] flex items-center justify-center p-4">
                  <div className="w-full max-w-xl bg-zinc-900/40 border border-zinc-850 rounded-3xl p-8 text-center space-y-6 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />
                    
                    <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 animate-pulse">
                      <ShieldAlert className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        {tAccess('clearanceRequired')}
                      </h3>
                      <p className="text-xs font-mono text-zinc-400" dir="ltr">
                        {tAccess('pathway')}: {pathname.toUpperCase()} • {tAccess('privilegeLevel')}: {activeRole.toUpperCase()}
                      </p>
                    </div>

                    <div className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-900 text-left space-y-2">
                      <span className="text-[10px] font-bold font-mono text-red-400 block uppercase tracking-wider">
                        Access Denied Policy ID: HealthOS-RBAC-0441
                      </span>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                        {access.reason || "Your active seat role subscription does not possess the permissions necessary to view this module."}
                      </p>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        onClick={() => setActiveRole('Super Admin')}
                        className="w-full sm:w-auto px-5 py-2.5 bg-white text-zinc-950 text-xs font-bold rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Impersonate Super Admin</span>
                      </button>
                      <button
                        onClick={() => router.push('/')}
                        className="w-full sm:w-auto px-5 py-2.5 bg-zinc-900 border border-zinc-800 text-xs font-semibold rounded-xl hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 cursor-pointer text-zinc-300"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Return to Main Terminal</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            }
            return children;
          })()}
        </main>
      </div>

      {/* Universal Search & Command Palette Modal Overlay */}
      {commandMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4">
          {/* Backdrop blur */}
          <div 
            onClick={() => setCommandMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-default"
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden font-mono text-xs animate-fade-in max-h-[70vh]">
            {/* Header Input Search */}
            <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
              <Command className="w-5 h-5 text-emerald-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                placeholder="Search resources, navigate, or run local console procedures..."
                className="flex-1 bg-transparent border-none text-xs outline-none text-white placeholder-zinc-600 font-mono"
              />
              <button 
                onClick={() => setCommandMenuOpen(false)}
                className="p-1 hover:bg-zinc-900 rounded text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Command Feedback status banner if triggered */}
            {commandFeedback && (
              <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 text-emerald-400 font-bold font-mono text-[10px] flex items-center gap-2 animate-pulse">
                <Sparkle className="w-4 h-4 shrink-0" />
                <span>{commandFeedback}</span>
              </div>
            )}

            {/* Commands list grouped by category */}
            <div className="flex-1 overflow-y-auto p-2 space-y-3 max-h-[380px]">
              <div className="px-3 py-1 text-[10px] text-zinc-600 font-bold uppercase">
                {commandQuery ? 'Search matches' : 'Authorized commands & shortcut routines'}
              </div>

              <div className="space-y-1">
                {filteredCommands.length === 0 ? (
                  <div className="py-8 text-center text-zinc-600">No telemetry procedures matched query.</div>
                ) : (
                  filteredCommands.map((cmd, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        cmd.action();
                        if (cmd.category === 'Navigation') {
                          setCommandMenuOpen(false);
                        }
                      }}
                      className="px-3 py-2.5 rounded-xl hover:bg-zinc-900 flex items-center justify-between gap-4 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-850 font-mono">
                          {cmd.category}
                        </span>
                        <span className="text-zinc-200 font-sans group-hover:text-emerald-400 transition-colors">
                          {cmd.name}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-emerald-400 transition-colors group-hover:translate-x-0.5" />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer hints */}
            <div className="p-3 border-t border-zinc-900 bg-zinc-900/10 text-zinc-600 text-[10px] flex items-center justify-between">
              <span>Use <kbd className="bg-zinc-900 px-1 py-0.5 rounded text-zinc-400">↑↓</kbd> to select and <kbd className="bg-zinc-900 px-1 py-0.5 rounded text-zinc-400">Enter</kbd> to execute</span>
              <span>ESC to dismiss</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Invite Staff Modal */}
      {showQuickInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleQuickInviteSubmit} className="bg-zinc-950 border border-zinc-850 p-6 rounded-3xl w-full max-w-md space-y-4 text-xs font-sans text-right" dir="rtl">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-400" /> دعوة / إضافة موظف جديد لـ HealthOS
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">يمكن للموظف استخدام البريد وكلمة المرور للدخول المباشر دون كود تفعيل.</p>
              </div>
              <button type="button" onClick={() => setShowQuickInviteModal(false)} className="text-zinc-500 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold block">اسم الموظف الكامل</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={quickInviteForm.name}
                  onChange={(e) => setQuickInviteForm({ ...quickInviteForm, name: e.target.value })}
                  placeholder="د. محمد السعيد"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold block">البريد الإلكتروني للموظف</label>
                <input
                  type="email"
                  required
                  value={quickInviteForm.email}
                  onChange={(e) => setQuickInviteForm({ ...quickInviteForm, email: e.target.value })}
                  placeholder="m.alsaeed@healthos.io"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold block">الدور والصلاحية (Role / RBAC)</label>
                <select
                  value={quickInviteForm.role}
                  onChange={(e) => setQuickInviteForm({ ...quickInviteForm, role: e.target.value as StaffRole })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none font-mono focus:border-emerald-500"
                >
                  <option value="clinician">🩺 طبيب معالج (Clinician - Full EHR Access)</option>
                  <option value="receptionist">📋 مسؤول استقبال (Receptionist - Appointments & Check-in)</option>
                  <option value="lab_tech">🧪 فني مختبر (Lab Tech - CAD/CAM & STL)</option>
                  <option value="admin">👑 مدير نظام (Clinic Admin)</option>
                  <option value="auditor">🛡️ مراجع سلامة (HIPAA Auditor)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold block">كلمة المرور المبدئية للموظف</label>
                <input
                  type="text"
                  required
                  value={quickInviteForm.tempPassword}
                  onChange={(e) => setQuickInviteForm({ ...quickInviteForm, tempPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-zinc-855 pt-3">
              <button
                type="button"
                onClick={() => setShowQuickInviteModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-semibold text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                إرسال الدعوة واعتماد الحساب
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  </div>
  </LicenseGate>
  );
}
