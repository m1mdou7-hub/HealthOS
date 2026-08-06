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
  UserPlus,
  Grid
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
import { getWorkspaceForRole, getWorkspaceById } from '@/utils/enterprise/directory';
import { getOrganizationProfile } from '@/utils/enterprise/practice';
import { isConsolidatedPractice } from '@/utils/enterprise/adaptive';
import LicenseGate from '@/components/licensing/LicenseGate';
import LanguageSwitcher from '@/components/ui/language-switcher';
import { staffAuthService, StaffRole } from '@/utils/services/staffAuthService';
import VoiceSystem from '@/components/ui/VoiceSystem';
import StaffPhoneIntercom from '@/components/ui/StaffPhoneIntercom';
import ThemeSelector from '@/components/ui/ThemeSelector';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE } from '@/components/ui/design-system/motion';

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
  { name: 'Apple Demo', labelKey: 'appleDemo', href: '/apple-demo', icon: Sparkle },
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
    { name: 'Apple Demo', labelKey: 'appleDemo', href: '/apple-demo', icon: Sparkle },
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
    { name: 'Apple Demo', labelKey: 'appleDemo', href: '/apple-demo', icon: Sparkle },
  ],
  'Laboratory Technician': [
    { name: 'Dashboard', labelKey: 'dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Laboratory', labelKey: 'laboratory', href: '/laboratory', icon: FlaskConical },
    { name: 'Imaging', labelKey: 'imaging', href: '/imaging', icon: Activity },
    { name: 'Inventory', labelKey: 'inventory', href: '/inventory', icon: Package },
    { name: 'Settings', labelKey: 'settings', href: '/settings', icon: Settings },
    { name: 'Apple Demo', labelKey: 'appleDemo', href: '/apple-demo', icon: Sparkle },
  ],
  'Receptionist': [
    { name: 'Dashboard', labelKey: 'dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Appointments', labelKey: 'appointments', href: '/appointments', icon: Calendar },
    { name: 'Patients', labelKey: 'patients', href: '/patients', icon: Users },
    { name: 'Communication', labelKey: 'communication', href: '/communication', icon: MessageSquare },
    { name: 'Settings', labelKey: 'settings', href: '/settings', icon: Settings },
    { name: 'Apple Demo', labelKey: 'appleDemo', href: '/apple-demo', icon: Sparkle },
  ],
  'Read-only Auditor': [
    { name: 'Dashboard', labelKey: 'dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Audit & Compliance', labelKey: 'audit', href: '/audit', icon: ShieldCheck },
    { name: 'Settings', labelKey: 'settings', href: '/settings', icon: Settings },
    { name: 'Apple Demo', labelKey: 'appleDemo', href: '/apple-demo', icon: Sparkle },
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
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {isDevBypass && (
        <div id="dev-mode-banner" className="bg-amber-500 text-black text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 border-b border-amber-600 select-none shrink-0 z-50">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-black text-amber-400 font-bold uppercase tracking-wider text-[9px] leading-none">
            DEV MODE
          </span>
          <span>Bypassing Supabase authentication for local development. Production authentication remains active and untouched.</span>
        </div>
      )}
      <div className="flex flex-1 bg-transparent overflow-hidden font-sans relative">
      {/* Sidebar Spacer for Desktop layout */}
      <div className="hidden lg:block w-[72px] shrink-0" />

      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:flex-col absolute left-0 top-0 bottom-0 w-[72px] hover:w-64 z-50 border-r transition-all duration-300 ease-in-out group shadow-xl group-hover:[&>nav]:opacity-100">
        {/* Brand Header */}
        <div className="flex items-center h-16 px-[20px] border-b gap-3 overflow-hidden shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl shrink-0">
            <div className="absolute inset-0 rounded-xl" style={{ background: 'var(--gradient)', opacity: 0.9 }} />
            <svg
              className="relative z-10"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <span className="font-semibold text-lg tracking-tight opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap font-display">
            <span className="text-gradient">HealthOS</span>
          </span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap"
            style={{ background: 'var(--accent-glow2)', color: 'var(--accent)', border: '1px solid var(--border-strong)' }}>
            PRO
          </span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3.5 py-6 space-y-1 overflow-y-auto scrollbar-none">
          {getNavItemsForRole(activeRole).map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={tNav(item.labelKey)}
                href={item.href}
                className="group/nav relative flex items-center px-2.5 py-2.5 text-sm font-medium rounded-2xl transition-all duration-150 overflow-hidden"
                style={{
                  background: isActive ? 'var(--accent-glow2)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)'
                }}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: 'var(--accent-glow2)', boxShadow: 'inset 0 0 0 1px var(--border-strong)' }}
                    transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                  />
                )}
                <Icon
                  className={`relative z-10 w-5 h-5 shrink-0 transition-transform duration-150 group-hover/nav:scale-105`}
                  style={{ color: isActive ? 'var(--accent)' : undefined }}
                />
                <span className="relative z-10 ml-3 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">{tNav(item.labelKey)}</span>
                {isActive && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full" style={{ background: 'var(--accent)' }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Area */}
        <div className="p-3.5 border-t overflow-hidden shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full shrink-0"
                style={{ background: 'var(--surface-2)', color: 'var(--text-sub)', border: '1px solid var(--border)' }}>
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>
                  {user?.email || 'Medical Operator'}
                </p>
                <p className="text-[10px] truncate font-mono" style={{ color: 'var(--text-muted)' }}>Operator Console</p>
              </div>
            </div>
            <form onSubmit={(e) => handleRequest(e, SignOut, router)} className="opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shrink-0">
              <input type="hidden" name="pathName" value={pathname} />
              <button
                type="submit"
                title="Sign out"
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="relative flex flex-col w-full max-w-xs flex-1 border-r"
            style={{ background: 'var(--surface-solid)', borderColor: 'var(--border)' }}
          >
            {/* Close button */}
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-lg"
                style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Brand Header */}
            <div className="flex items-center h-16 px-6 border-b gap-3" style={{ borderColor: 'var(--border)' }}>
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg">
                <div className="absolute inset-0 rounded-lg" style={{ background: 'var(--gradient)' }} />
                <svg
                  className="relative z-10"
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"
                  strokeLinecap="round" strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <span className="font-semibold text-lg tracking-tight font-display">
                <span className="text-gradient">HealthOS</span>
              </span>
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
                    className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 ${
                      isActive ? 'border-l-2' : ''
                    }`}
                    style={{
                      background: isActive ? 'var(--accent-glow2)' : 'transparent',
                      color: isActive ? 'var(--accent)' : 'var(--text-sub)',
                      borderColor: 'var(--accent)'
                    }}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tNav(item.labelKey)}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom User Area */}
            <div className="p-4 border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0 gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full"
                    style={{ background: 'var(--surface-2)', color: 'var(--text-sub)' }}>
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>{user?.email}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Workspace Operator</p>
                  </div>
                </div>
                <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
                  <input type="hidden" name="pathName" value={pathname} />
                  <button
                    type="submit"
                    className="p-1.5 rounded-lg"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        {/* Ambient glowing backdrop elements */}
        <div className="absolute top-[-10%] left-[20%] w-[350px] h-[350px] rounded-full blur-[100px] pointer-events-none z-0 float-y"
          style={{ background: 'var(--accent-glow2)' }} />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none z-0 pulse-glow"
          style={{ background: 'var(--accent-glow2)' }} />

        {/* Top bar */}
        <header className="flex items-center justify-between h-16 px-6 border-b relative z-40 header-shimmer"
          style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center">
            {/* Mobile toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 mr-4 rounded-lg lg:hidden focus:outline-none"
              style={{ color: 'var(--text-muted)' }}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold tracking-tight mr-6 font-display text-gradient">{pageTitle}</h1>
            
            {/* Command Palette Launcher Button */}
            <button
              onClick={() => setCommandMenuOpen(true)}
              className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-mono transition-all cursor-pointer select-none"
              style={{
                background: 'var(--glass-fill)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                backdropFilter: 'blur(12px)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <Search className="w-4 h-4" />
              <span>{tCommon('searchOrRunCommand')}</span>
              <span className="ml-4 px-1.5 py-0.5 text-[9px] rounded font-mono"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                ⌘K
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
            {/* Internal Staff Phone & Intercom Widget */}
            <StaffPhoneIntercom />

            {/* Voice System Widget */}
            <VoiceSystem />

            {/* Theme Selector (2 themes × light/dark) */}
            <ThemeSelector />

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Active Role Selector Dropdown */}
            <div className="relative flex items-center gap-1.5 rounded-2xl px-3 py-1.5 transition-colors shrink-0"
              style={{ background: 'var(--glass-fill)', border: '1px solid var(--border)' }}>
              <UserCheck className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent)' }} />
              <select
                value={activeRole}
                onChange={(e) => {
                  const targetRole = e.target.value as UserRole;
                  setActiveRole(targetRole);
                }}
                className="bg-transparent border-none text-xs font-bold outline-none cursor-pointer font-sans"
                style={{ color: 'var(--text)' }}
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
                  <option key={roleKey} value={roleKey} style={{ background: 'var(--surface-solid)', color: 'var(--text)' }}>
                    {tRoles(roleKey)}
                  </option>
                ))}
              </select>
            </div>

            {/* Auto-resolved Primary Workspace for Active Role (adaptive) */}
            {(() => {
              const profile = getOrganizationProfile();
              const consolidated = profile ? isConsolidatedPractice(profile.practiceTypeId) : false;
              const ws = getWorkspaceById(getWorkspaceForRole(activeRole));
              if (!ws) return null;
              return (
                <div className="hidden lg:flex items-center gap-1.5 rounded-2xl px-3 py-1.5 shrink-0"
                  style={{ background: consolidated ? 'rgba(245,158,11,0.10)' : 'var(--glass-fill)', border: consolidated ? '1px solid rgba(245,158,11,0.35)' : '1px solid var(--border)' }}
                  title={consolidated ? `Consolidated workspace: ${ws.name}` : `Primary Workspace: ${ws.name}`}
                >
                  <Grid className="w-3.5 h-3.5 shrink-0" style={{ color: consolidated ? '#fbbf24' : 'var(--accent)' }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono" style={{ color: consolidated ? '#fbbf24' : 'var(--text-muted)' }}>
                    {ws.name}{consolidated ? ' · Unified' : ''}
                  </span>
                </div>
              );
            })()}

            {/* Quick Invite Staff Button for Admins */}
            {(activeRole === 'Super Admin' || activeRole === 'Clinic Owner') && (
              <button
                type="button"
                onClick={() => setShowQuickInviteModal(true)}
                className="magic-shimmer-btn px-3 py-1.5 text-white font-bold text-xs rounded-2xl flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
                title="إضافة وتحديد صلاحيات موظف جديد"
              >
                <UserPlus className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                <span className="hidden lg:inline">+ دعوة موظف</span>
              </button>
            )}

            <div className="hidden xl:flex items-center gap-2 border-r pr-3 mr-1 shrink-0" style={{ borderColor: 'var(--border)' }}>
              <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                {tCommon('systemStatus')}: <span className="uupm-badge-glass text-[10px] uppercase">{tCommon('secure')}</span>
              </span>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
            </div>
          </div>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-transparent">
          {(() => {
            const access = checkPageAccess(pathname, activeRole);
            if (!access.allowed) {
              return (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="min-h-[70vh] flex items-center justify-center p-4"
                >
                  <div className="w-full max-w-xl card-elevated p-8 text-center space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'var(--gradient)' }} />
                    
                    <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center animate-pulse"
                      style={{ background: 'var(--accent-glow2)', border: '1px solid var(--border-strong)', color: 'var(--accent)' }}>
                      <ShieldAlert className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-bold tracking-tight font-display">
                        <span className="text-gradient">{tAccess('clearanceRequired')}</span>
                      </h3>
                      <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }} dir="ltr">
                        {tAccess('pathway')}: {pathname.toUpperCase()} • {tAccess('privilegeLevel')}: {activeRole.toUpperCase()}
                      </p>
                    </div>

                    <div className="p-4 rounded-3xl text-left space-y-2"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                      <span className="text-[10px] font-bold font-mono block uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
                        Access Denied Policy ID: HealthOS-RBAC-0441
                      </span>
                      <p className="text-xs leading-relaxed font-sans" style={{ color: 'var(--text-sub)' }}>
                        {access.reason || "Your active seat role subscription does not possess the permissions necessary to view this module."}
                      </p>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        onClick={() => setActiveRole('Super Admin')}
                        className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                        style={{ background: 'var(--gradient)', color: '#fff' }}
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Impersonate Super Admin</span>
                      </button>
                      <button
                        onClick={() => router.push('/')}
                        className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-sub)' }}
                      >
                        <Lock className="w-4 h-4" />
                        <span>Return to Main Terminal</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            }
            return children;
          })()}
        </main>
      </div>

      {/* Universal Search & Command Palette Modal Overlay */}
      <AnimatePresence>
      {commandMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-default"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="relative w-full max-w-2xl card-elevated rounded-3xl flex flex-col overflow-hidden font-mono text-xs max-h-[70vh]"
          >
            {/* Header Input Search */}
            <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
              <Command className="w-5 h-5 shrink-0" style={{ color: 'var(--accent)' }} />
              <input
                type="text"
                autoFocus
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                placeholder="Search resources, navigate, or run local console procedures..."
                className="flex-1 bg-transparent border-none text-xs outline-none font-mono"
              />
              <button 
                onClick={() => setCommandMenuOpen(false)}
                className="p-1 rounded transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Command Feedback status banner if triggered */}
            {commandFeedback && (
              <div className="px-4 py-2 text-[10px] font-bold font-mono flex items-center gap-2 animate-pulse"
                style={{ background: 'var(--accent-glow2)', color: 'var(--accent)', borderBottom: '1px solid var(--border-strong)' }}>
                <Sparkle className="w-4 h-4 shrink-0" />
                <span>{commandFeedback}</span>
              </div>
            )}

            {/* Commands list grouped by category */}
            <div className="flex-1 overflow-y-auto p-2 space-y-3 max-h-[380px]">
              <div className="px-3 py-1 text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
                {commandQuery ? 'Search matches' : 'Authorized commands & shortcut routines'}
              </div>

              <div className="space-y-1">
                {filteredCommands.length === 0 ? (
                  <div className="py-8 text-center" style={{ color: 'var(--text-muted)' }}>No telemetry procedures matched query.</div>
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
                      className="px-3 py-2.5 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-colors group"
                      style={{ color: 'var(--text-sub)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border font-mono"
                          style={{ color: 'var(--accent)', background: 'var(--accent-glow2)', borderColor: 'var(--border-strong)' }}>
                          {cmd.category}
                        </span>
                        <span className="font-sans transition-colors">{cmd.name}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 transition-all group-hover:translate-x-0.5" style={{ color: 'var(--text-muted)' }} />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer hints */}
            <div className="p-3 border-t text-[10px] flex items-center justify-between"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              <span>Use <kbd className="px-1 py-0.5 rounded" style={{ background: 'var(--surface-2)' }}>↑↓</kbd> to select and <kbd className="px-1 py-0.5 rounded" style={{ background: 'var(--surface-2)' }}>Enter</kbd> to execute</span>
              <span>ESC to dismiss</span>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Quick Invite Staff Modal */}
      <AnimatePresence>
      {showQuickInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.form
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.3, ease: EASE }}
            onSubmit={handleQuickInviteSubmit}
            className="card-elevated p-6 rounded-3xl w-full max-w-md space-y-4 text-xs font-sans text-right" dir="rtl"
          >
            <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2 font-display">
                  <UserPlus className="w-4 h-4" style={{ color: 'var(--accent)' }} /> دعوة / إضافة موظف جديد لـ HealthOS
                </h3>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>يمكن للموظف استخدام البريد وكلمة المرور للدخول المباشر دون كود تفعيل.</p>
              </div>
              <button type="button" onClick={() => setShowQuickInviteModal(false)} className="p-1" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold block" style={{ color: 'var(--text-sub)' }}>اسم الموظف الكامل</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={quickInviteForm.name}
                  onChange={(e) => setQuickInviteForm({ ...quickInviteForm, name: e.target.value })}
                  placeholder="د. محمد السعيد"
                  className="w-full px-3.5 py-2.5 rounded-xl border outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold block" style={{ color: 'var(--text-sub)' }}>البريد الإلكتروني للموظف</label>
                <input
                  type="email"
                  required
                  value={quickInviteForm.email}
                  onChange={(e) => setQuickInviteForm({ ...quickInviteForm, email: e.target.value })}
                  placeholder="m.alsaeed@healthos.io"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-xl border font-mono outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold block" style={{ color: 'var(--text-sub)' }}>الدور والصلاحية (Role / RBAC)</label>
                <select
                  value={quickInviteForm.role}
                  onChange={(e) => setQuickInviteForm({ ...quickInviteForm, role: e.target.value as StaffRole })}
                  className="w-full px-3.5 py-2.5 rounded-xl border font-mono outline-none"
                >
                  <option value="clinician">🩺 طبيب معالج (Clinician - EHR Access)</option>
                  <option value="receptionist">📋 مسؤول استقبال (Receptionist - Scheduling)</option>
                  <option value="lab_tech">🧪 فني مختبر (Lab Tech - CAD/CAM & STL)</option>
                  <option value="admin">👑 مدير نظام (Clinic Admin)</option>
                  <option value="auditor">🛡️ مراجع سلامة (HIPAA Auditor)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold block" style={{ color: 'var(--text-sub)' }}>كلمة المرور المبدئية للموظف</label>
                <input
                  type="text"
                  required
                  value={quickInviteForm.tempPassword}
                  onChange={(e) => setQuickInviteForm({ ...quickInviteForm, tempPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border font-mono outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={() => setShowQuickInviteModal(false)}
                className="px-4 py-2 rounded-xl font-semibold text-xs cursor-pointer"
                style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                style={{ background: 'var(--gradient)', color: '#fff' }}
              >
                إرسال الدعوة واعتماد الحساب
              </button>
            </div>
          </motion.form>
        </div>
      )}
      </AnimatePresence>
    </div>
  </div>
  </LicenseGate>
  );
}
