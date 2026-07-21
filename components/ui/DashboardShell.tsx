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
  UserCheck
} from 'lucide-react';
import { handleRequest } from '@/utils/auth-helpers/client';
import { SignOut } from '@/utils/auth-helpers/server';
import { 
  getActiveRole, 
  setActiveRole, 
  checkPageAccess, 
  UserRole 
} from '@/utils/enterpriseState';

interface DashboardShellProps {
  user: any;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Patients', href: '/patients', icon: Users },
  { name: 'Clinics', href: '/clinics', icon: Building2 },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'Medical Records', href: '/medical-records', icon: FileText },
  { name: 'AI Assistant', href: '/ai-assistant', icon: Sparkles },
  { name: 'Laboratory', href: '/laboratory', icon: FlaskConical },
  { name: 'Imaging', href: '/imaging', icon: Activity },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Analytics', href: '/analytics', icon: LineChart },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Pricing', href: '/pricing', icon: Sparkle },
  { name: 'Communication', href: '/communication', icon: MessageSquare },
  { name: 'Document Center', href: '/documents', icon: Folder },
  { name: 'Task Workspace', href: '/tasks', icon: CheckSquare },
  { name: 'Notification Hub', href: '/notifications', icon: Bell },
  { name: 'Audit & Compliance', href: '/audit', icon: ShieldCheck },
  { name: 'Platform Console', href: '/platform', icon: Globe },
  { name: 'Integrations', href: '/integrations', icon: Blocks },
  { name: 'Automations', href: '/automations', icon: Zap },
  { name: 'Developer', href: '/developer', icon: Terminal },
  { name: 'Help Center', href: '/help', icon: HelpCircle },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [commandFeedback, setCommandFeedback] = useState('');
  const [activeRole, setActiveRoleState] = useState<UserRole>('Super Admin');

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

  const isDevBypass = process.env.NODE_ENV !== 'production' && (user?.isDevBypass || process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true');

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {isDevBypass && (
        <div id="dev-mode-banner" className="bg-amber-500 text-black text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 border-b border-amber-600 select-none shrink-0 z-50">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-black text-amber-400 font-bold uppercase tracking-wider text-[9px] leading-none">
            DEV MODE
          </span>
          <span>Bypassing Supabase authentication for local development. Production authentication remains active and untouched.</span>
        </div>
      )}
      <div className="flex flex-1 bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:flex-shrink-0 border-r border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
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
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            PRO
          </span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 group ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
              >
                <Icon
                  className={`w-5 h-5 mr-3 transition-transform duration-150 group-hover:scale-105 ${
                    isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-100'
                  }`}
                />
                {item.name}
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
                <p className="text-xs font-medium text-zinc-200 truncate">
                  {user?.email || 'Medical Operator'}
                </p>
                <p className="text-[10px] text-zinc-500 truncate">HealthOS Workspace</p>
              </div>
            </div>
            <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
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
              {NAV_ITEMS.map((item) => {
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3 text-zinc-400" />
                    {item.name}
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
              <span>Search or run command...</span>
              <kbd className="ml-4 px-1.5 py-0.5 text-[9px] bg-zinc-900 border border-zinc-800 rounded text-zinc-600 font-mono">⌘K</kbd>
            </button>
          </div>

          <div className="flex items-center gap-4">
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
                <option value="Super Admin" className="bg-zinc-950 text-white">Super Admin</option>
                <option value="Clinic Owner" className="bg-zinc-950 text-white">Clinic Owner</option>
                <option value="Prosthodontist" className="bg-zinc-950 text-white">Prosthodontist</option>
                <option value="General Dentist" className="bg-zinc-950 text-white font-mono">General Dentist</option>
                <option value="Assistant" className="bg-zinc-950 text-white">Assistant</option>
                <option value="Receptionist" className="bg-zinc-950 text-white">Receptionist</option>
                <option value="Laboratory Technician" className="bg-zinc-950 text-white">Laboratory Technician</option>
                <option value="Read-only Auditor" className="bg-zinc-950 text-white">Read-only Auditor</option>
              </select>
            </div>

            <span className="text-xs text-zinc-400 font-mono hidden xl:inline">
              SYSTEM STATUS: <span className="text-emerald-400 font-semibold">SECURE</span>
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
                        Security Clearance Required
                      </h3>
                      <p className="text-xs font-mono text-zinc-400">
                        PATHWAY: {pathname.toUpperCase()} • PRIVILEGE LEVEL: {activeRole.toUpperCase()}
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
    </div>
  </div>
  );
}
