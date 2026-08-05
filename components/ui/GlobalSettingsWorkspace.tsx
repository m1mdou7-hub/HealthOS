'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Settings,
  User,
  Building,
  Calendar,
  Sparkles,
  Shield,
  Bell,
  Globe,
  Database,
  Search,
  CheckCircle2,
  Trash2,
  Plus,
  RefreshCw,
  Mail,
  Smartphone,
  Key,
  Laptop,
  Check,
  AlertCircle,
  Activity
} from 'lucide-react';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { staffAuthService, StaffMember, StaffRole } from '@/utils/services/staffAuthService';

// Custom spring toggle switch component matching Apple Design specs
interface SwitchProps {
  checked: boolean;
  onChange: (val: boolean) => void;
}

function SpringSwitch({ checked, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer outline-none active:scale-95 duration-100 flex items-center shrink-0 ${
        checked ? 'bg-white' : 'bg-zinc-800 border border-zinc-700'
      }`}
    >
      <motion.div
        className={`w-3.5 h-3.5 rounded-full ${checked ? 'bg-black' : 'bg-zinc-450'}`}
        animate={{ x: checked ? 16 : 0 }}
        transition={{ type: "spring", stiffness: 450, damping: 26 }}
      />
    </button>
  );
}

// --- MOCK CONSTANTS FOR ENTERPRISE WORKSPACE ---
const MOCK_DEPARTMENTS = [
  { id: 'dep-1', name: 'Prosthodontics', code: 'PRST', activeStaff: 12, head: 'Dr. Elena Rostova' },
  { id: 'dep-2', name: 'Maxillofacial Surgery', code: 'SURG', activeStaff: 8, head: 'Dr. Michael Chen' },
  { id: 'dep-3', name: 'Orthodontics & Diagnostics', code: 'ORTH', activeStaff: 14, head: 'Dr. Sarah Jenkins' },
  { id: 'dep-4', name: 'Clinical Laboratory Operations', code: 'LABO', activeStaff: 6, head: 'Dr. Marcus Vance' }
];

const MOCK_TEAM_MEMBERS = [
  { id: 'user-01', name: 'Dr. Elena Rostova', role: 'Clinical Owner', email: 'rostova@healthos.io', status: 'Active' },
  { id: 'user-02', name: 'Dr. Michael Chen', role: 'Lead Surgeon', email: 'chen.implant@healthos.io', status: 'Active' },
  { id: 'user-03', name: 'Dr. Sarah Jenkins', role: 'Cosmetic Specialist', email: 'jenkins@healthos.io', status: 'Active' },
  { id: 'user-04', name: 'Dr. Marcus Vance', role: 'Lab Director', email: 'vance.labs@healthos.io', status: 'Active' },
  { id: 'user-05', name: 'Amelia Vance', role: 'Lead Nurse Specialist', email: 'amelia.v@healthos.io', status: 'Active' },
  { id: 'user-06', name: 'Devon Carter', role: 'Systems Administrator', email: 'devon@healthos.io', status: 'Active' }
];

const AUDIT_LOGS = [
  { timestamp: '2026-07-17 06:14:22', user: 'devon@healthos.io', action: 'Rotated AI API Key', ip: '108.43.190.22', resource: 'Secrets Vault' },
  { timestamp: '2026-07-17 05:48:11', user: 'rostova@healthos.io', action: 'Approved Lab Reagent purchase order', ip: '108.43.190.22', resource: 'Procurement / SCM' },
  { timestamp: '2026-07-16 23:12:05', user: 'vance.labs@healthos.io', action: 'Calibrated Digital Miller 3D Printer', ip: '92.12.44.11', resource: 'Equipment IoT' },
  { timestamp: '2026-07-16 14:32:00', user: 'chen.implant@healthos.io', action: 'Created custom surgical guide template', ip: '194.22.88.99', resource: 'Workspace Settings' }
];

const TEMPLATES_SMS_EMAIL = [
  { id: 't-1', name: 'Appointment Confirmation', channel: 'Email/SMS', body: 'Hi {patient_name}, your clinical consultation is confirmed for {time} at {clinic_name}.' },
  { id: 't-2', name: 'Lab Result Cleared', channel: 'SMS/WhatsApp', body: 'Dear {patient_name}, your dental prosthesis is completed and cleared by {doctor_name}. Ready for try-in!' },
  { id: 't-3', name: 'Expiring Stock Warning', channel: 'Internal Email', body: 'Alert: Stock item {item_name} (SKU: {sku}) is expiring in under 30 days.' }
];

interface GlobalSettingsProps {
  personalForms: React.ReactNode;
}

export default function GlobalSettingsWorkspace({ personalForms }: GlobalSettingsProps) {
  const tSet = useTranslations('GlobalSettingsWorkspace');
  const [tab, setTab] = useState<'profile' | 'organization' | 'app-config' | 'notifications' | 'security'>('organization');
  
  // Organization state
  const [departments, setDepartments] = useState(MOCK_DEPARTMENTS);
  const [team, setTeam] = useState<StaffMember[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: 'clinician' as StaffRole,
    tempPassword: 'doctor123'
  });

  const [newDepName, setNewDepName] = useState('');
  const [newDepCode, setNewDepCode] = useState('');
  const [newDepHead, setNewDepHead] = useState('Dr. Elena Rostova');

  useEffect(() => {
    // Sync staff members from staffAuthService
    const members = staffAuthService.getStaffMembers();
    setTeam(members);
  }, []);
  
  // App Config form states
  const [slotDuration, setSlotDuration] = useState('30');
  const [allowCancel, setAllowCancel] = useState(true);
  const [geminiModel, setGeminiModel] = useState('gemini-3.5-flash');
  const [geminiTemp, setGeminiTemp] = useState('0.2');
  const [selectedLanguage, setSelectedLanguage] = useState('English (US)');
  const [selectedTimezone, setSelectedTimezone] = useState('America/Los_Angeles');

  // Notification states
  const [smsTemplates, setSmsTemplates] = useState(TEMPLATES_SMS_EMAIL);
  const [activeChannelMail, setActiveChannelMail] = useState(true);
  const [activeChannelSms, setActiveChannelSms] = useState(true);
  const [activeChannelWhatsapp, setActiveChannelWhatsapp] = useState(false);

  // Security toggles
  const [pwdComplexity, setPwdComplexity] = useState('High (12+ chars, Symbols, Case)');
  const [mfaEnforce, setMfaEnforce] = useState(true);

  // Success toast helper
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;
    const checkout = searchParams.get('checkout');
    if (checkout === 'success') {
      triggerToast(tSet('tabs.organization'));
    }
    const portal = searchParams.get('portal');
    if (portal === 'mock_success') {
      triggerToast(tSet('org.subscriptionTitle'));
    }
  }, [searchParams]);

  // Add Department
  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepName.trim() || !newDepCode.trim()) return;

    const newDep = {
      id: `dep-${departments.length + 1}`,
      name: newDepName,
      code: newDepCode.toUpperCase(),
      activeStaff: 0,
      head: newDepHead
    };

    setDepartments([...departments, newDep]);
    setNewDepName('');
    setNewDepCode('');
    triggerToast(`${tSet('org.hierarchyTitle')}: "${newDep.name}"`);
  };

  // Remove Department
  const handleRemoveDept = (id: string) => {
    const dep = departments.find(d => d.id === id);
    if (!dep) return;
    setDepartments(departments.filter(d => d.id !== id));
    triggerToast(`${dep.name}`);
  };

  const handleInviteStaff = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newMember = staffAuthService.inviteStaffMember({
        name: inviteForm.name,
        email: inviteForm.email,
        role: inviteForm.role as StaffRole,
        passwordHash: inviteForm.tempPassword
      });
      setTeam(staffAuthService.getStaffMembers());
      setShowInviteModal(false);
      setInviteForm({ name: '', email: '', role: 'clinician', tempPassword: 'doctor123' });
      triggerToast(`${tSet('invite.submit')}: ${newMember.name}`);
    } catch (err: any) {
      alert(err.message || tSet('org.staffDesc'));
    }
  };

  return (
    <div className="space-y-6 text-zinc-100 animate-fade-in relative font-sans text-sm">
      
      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-sans text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-500 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* SECTION TABS HEADER */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-zinc-950 p-3 rounded-3xl border border-zinc-850/80 shadow-md">
        <div className="flex flex-wrap gap-2 p-1.5 bg-black rounded-2xl border border-zinc-850 relative">
          {[
            { id: 'organization', key: 'organization', icon: Building, color: 'bg-blue-500/10 text-blue-400 border border-blue-500/10' },
            { id: 'profile', key: 'profile', icon: User, color: 'bg-zinc-800 text-zinc-300 border border-zinc-700' },
            { id: 'app-config', key: 'appConfig', icon: Settings, color: 'bg-zinc-800 text-zinc-300 border border-zinc-700' },
            { id: 'notifications', key: 'notifications', icon: Bell, color: 'bg-amber-500/10 text-amber-400 border border-amber-500/10' },
            { id: 'security', key: 'security', icon: Shield, color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' }
          ].map(t => {
            const Icon = t.icon;
            const isSel = tab === t.id;
            const labelText = tSet(`tabs.${t.key}`);
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className="relative px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold font-sans transition-all flex items-center gap-2 cursor-pointer outline-none active:scale-97"
              >
                {isSel && (
                  <motion.div
                    layoutId="activeTabUnderlay"
                    className="absolute inset-0 bg-white rounded-xl border border-zinc-200 z-0"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
                  />
                )}
                <span className={`relative z-10 flex items-center gap-2.5 ${
                  isSel ? 'text-black font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}>
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all ${
                    isSel 
                      ? 'bg-zinc-900 text-white border-zinc-800' 
                      : t.color
                  }`}>
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                  </div>
                  <span>{labelText}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 bg-zinc-950/80 rounded-xl border border-zinc-800 text-xs md:text-sm font-semibold text-zinc-300 font-sans">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{tSet('nodeStatus')}</span>
        </div>
      </div>

      {/* TAB CONTENT */}
      {tab === 'organization' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Department List */}
            <div className="p-6 rounded-3xl bg-zinc-950/20 border border-zinc-900 space-y-5">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-base font-bold text-white tracking-tight block">{tSet('org.hierarchyTitle')}</span>
                  <p className="text-xs md:text-sm text-zinc-400 mt-1 leading-normal">{tSet('org.hierarchyDesc')}</p>
                </div>
              </div>

              <div className="space-y-3">
                {departments.map(dep => (
                  <div key={dep.id} className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <Building className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md border border-zinc-700 font-mono font-bold">{dep.code}</span>
                          <h5 className="font-semibold text-white text-[15px]">{dep.name}</h5>
                        </div>
                        <p className="text-xs text-zinc-400">
                          {tSet('org.head')}: <span className="text-zinc-200 font-medium">{dep.head}</span> • {tSet('org.staffSize')}: <span className="text-zinc-200 font-bold">{dep.activeStaff}</span>
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleRemoveDept(dep.id)}
                      className="p-2 hover:bg-zinc-900 text-zinc-500 hover:text-red-400 transition-all cursor-pointer rounded-xl border border-transparent hover:border-zinc-800"
                      title="Delete department"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Dept Form */}
              <form onSubmit={handleAddDept} className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-4 border-t border-zinc-900 text-sm">
                <input 
                  type="text" 
                  placeholder={tSet('org.deptNamePlaceholder')}
                  value={newDepName}
                  onChange={(e) => setNewDepName(e.target.value)}
                  className="md:col-span-2 bg-zinc-950 border border-zinc-850 px-4 py-2.5 text-white outline-none rounded-xl focus:border-zinc-700 text-sm"
                />
                <input 
                  type="text" 
                  placeholder={tSet('org.deptCodePlaceholder')}
                  value={newDepCode}
                  onChange={(e) => setNewDepCode(e.target.value)}
                  maxLength={5}
                  className="bg-zinc-950 border border-zinc-850 px-4 py-2.5 text-white outline-none rounded-xl uppercase focus:border-zinc-700 text-sm font-mono"
                />
                <button 
                  type="submit"
                  className="bg-white hover:bg-zinc-100 text-black font-bold px-4 py-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 cursor-pointer text-sm"
                >
                  <Plus className="w-4 h-4" /> {tSet('org.addDept')}
                </button>
              </form>
            </div>

            {/* Team seat licenses & Staff Management */}
            <div className="p-6 rounded-3xl bg-zinc-950/20 border border-zinc-900 space-y-5">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-base font-bold text-white tracking-tight block">{tSet('org.staffTitle')}</span>
                  <p className="text-xs md:text-sm text-zinc-400 mt-1 leading-normal">{tSet('org.staffDesc')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(true)}
                  className="px-4 py-2.5 bg-white text-black hover:bg-zinc-100 font-bold text-sm rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> {tSet('org.inviteBtn')}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {team.map(member => (
                  <div key={member.id} className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white font-bold text-[15px]">{member.name}</p>
                          <span className="text-[10px] text-zinc-300 px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-semibold uppercase">{member.role}</span>
                        </div>
                        <p className="text-xs text-zinc-400">{member.email}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded font-bold uppercase border ${
                      member.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {member.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sub Info panel */}
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-zinc-950/20 border border-zinc-900 space-y-4 text-sm">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">{tSet('org.subscriptionTitle')}</span>
              <div className="space-y-3.5">
                <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl">
                  <p className="text-white font-extrabold text-base">{tSet('org.enterprisePlan')}</p>
                  <p className="text-xs text-zinc-400 mt-1">{tSet('org.planExpiry')}</p>
                </div>
                <div className="space-y-2 text-zinc-400 text-sm">
                  <div className="flex justify-between">
                    <span>{tSet('org.seatLicenses')}</span>
                    <span className="text-white font-bold">{team.length} {tSet('org.seats')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{tSet('org.multiClinic')}</span>
                    <span className="text-white font-bold">{tSet('org.activeClinics')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{tSet('org.supportDesk')}</span>
                    <span className="text-emerald-400 font-bold">{tSet('org.dedicatedSupport')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Staff Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInviteModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Content Drawer / Popup */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 250 }}
              dragElastic={0.1}
              onDragEnd={(e, info) => {
                if (info.velocity.y > 450 || info.offset.y > 120) {
                  setShowInviteModal(false);
                }
              }}
              className="relative bg-zinc-950 border border-zinc-850 p-6 rounded-3xl w-full max-w-md space-y-4 text-sm font-sans shadow-2xl z-10 select-none touch-none"
            >
              {/* Drag Handle for mobile sheet aesthetics */}
              <div className="mx-auto w-12 h-1 bg-zinc-800 rounded-full mb-1 cursor-grab active:cursor-grabbing shrink-0" />
              
              <form onSubmit={handleInviteStaff} className="space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-white" /> {tSet('invite.title')}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">{tSet('invite.subtitle')}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-zinc-300 font-semibold">{tSet('invite.fullName')}</label>
                    <input
                      type="text"
                      required
                      value={inviteForm.name}
                      onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                      placeholder={tSet('invite.namePlaceholder')}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-zinc-700 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-300 font-semibold">{tSet('invite.email')}</label>
                    <input
                      type="email"
                      required
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                      placeholder={tSet('invite.emailPlaceholder')}
                      dir="ltr"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-zinc-700 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-300 font-semibold">{tSet('invite.role')}</label>
                    <select
                      value={inviteForm.role}
                      onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as StaffRole })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-zinc-700 text-sm"
                    >
                      <option value="clinician">🩺 {tSet('invite.roleClinician')}</option>
                      <option value="receptionist">📋 {tSet('invite.roleReceptionist')}</option>
                      <option value="lab_tech">🧪 {tSet('invite.roleLabTech')}</option>
                      <option value="admin">👑 {tSet('invite.roleAdmin')}</option>
                      <option value="auditor">🛡️ {tSet('invite.roleAuditor')}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-300 font-semibold">{tSet('invite.tempPassword')}</label>
                    <input
                      type="text"
                      required
                      value={inviteForm.tempPassword}
                      onChange={(e) => setInviteForm({ ...inviteForm, tempPassword: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-zinc-700 text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-zinc-850 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-semibold text-sm active:scale-95 transition-transform"
                  >
                    {tSet('invite.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-white text-black hover:bg-zinc-100 font-bold text-sm flex items-center gap-1.5 active:scale-95 transition-transform"
                  >
                    {tSet('invite.submit')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

        {/* ==================== 2. PERSONAL CREDENTIALS ==================== */}
        {tab === 'profile' && (
          <div className="max-w-4xl space-y-6">
            {personalForms}
          </div>
        )}

        {/* ==================== 3. CLINICAL PARAMETERS ==================== */}
        {tab === 'app-config' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
            <div className="lg:col-span-2 space-y-4">
              
              {/* App defaults settings */}
              <div className="p-6 rounded-3xl bg-zinc-950/20 border border-zinc-900 space-y-4">
                <span className="text-base font-bold text-white tracking-tight block">{tSet('appConfig.appointmentTitle')}</span>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-zinc-400">{tSet('appConfig.slotDuration')}</label>
                      <select 
                        value={slotDuration} 
                        onChange={(e) => setSlotDuration(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 rounded-xl text-white outline-none focus:border-zinc-700 text-sm"
                      >
                        <option value="15">15 min</option>
                        <option value="30">30 min</option>
                        <option value="45">45 min</option>
                        <option value="60">60 min</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-400">{tSet('appConfig.cancellationPeriod')}</label>
                      <select 
                        className="w-full bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 rounded-xl text-white outline-none focus:border-zinc-700 text-sm"
                      >
                        <option>{tSet('appConfig.cancel24h')}</option>
                        <option>{tSet('appConfig.cancel48h')}</option>
                        <option>{tSet('appConfig.cancelAlways')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-850 rounded-2xl">
                    <div>
                      <p className="text-white font-bold">{tSet('appConfig.allowCancel')}</p>
                      <p className="text-xs text-zinc-400 mt-1">{tSet('appConfig.allowCancelDesc')}</p>
                    </div>
                    <SpringSwitch 
                      checked={allowCancel}
                      onChange={setAllowCancel}
                    />
                  </div>
                </div>
              </div>

              {/* AI/Gemini configurations */}
              <div className="p-6 rounded-3xl bg-zinc-950/20 border border-zinc-900 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-base font-bold text-white tracking-tight block">{tSet('appConfig.aiTitle')}</span>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-zinc-400">{tSet('appConfig.primaryModel')}</label>
                      <select 
                        value={geminiModel} 
                        onChange={(e) => setGeminiModel(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 rounded-xl text-white outline-none focus:border-zinc-700 text-sm"
                      >
                        <option value="gemini-3.5-flash">Gemini 3.5 Flash (Default)</option>
                        <option value="gemini-3.5-pro">Gemini 3.5 Pro (Clinical Notes)</option>
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash (Legacy)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-400">{tSet('appConfig.temperature')}</label>
                      <select 
                        value={geminiTemp} 
                        onChange={(e) => setGeminiTemp(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 rounded-xl text-white outline-none focus:border-zinc-700 text-sm"
                      >
                        <option value="0.0">0.0 (Deterministic / Safe)</option>
                        <option value="0.2">0.2 (Recommended Clinical)</option>
                        <option value="0.7">0.7 (Exploratory)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-1.5 text-xs md:text-sm">
                    <div className="flex justify-between items-center text-emerald-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Key className="w-4 h-4" /> {tSet('appConfig.apiKeyStatus')}
                      </span>
                      <span>{tSet('appConfig.apiKeyConfigured')}</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-normal">{tSet('appConfig.apiKeyDesc')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Language / Region Settings */}
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-zinc-950/20 border border-zinc-900 space-y-4">
                <span className="text-base font-bold text-white tracking-tight block">{tSet('appConfig.regionTitle')}</span>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-zinc-400">{tSet('appConfig.defaultLanguage')}</label>
                    <select 
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 rounded-xl text-white outline-none focus:border-zinc-700 text-sm"
                    >
                      <option>English (US)</option>
                      <option>English (UK)</option>
                      <option>Español (ES)</option>
                      <option>Français (FR)</option>
                      <option>العربية (AR)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400">{tSet('appConfig.timezone')}</label>
                    <select 
                      value={selectedTimezone}
                      onChange={(e) => setSelectedTimezone(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 rounded-xl text-white outline-none focus:border-zinc-700 text-sm"
                    >
                      <option value="America/Los_Angeles">America/Los_Angeles</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="UTC">UTC Greenwich Mean Time</option>
                      <option value="Asia/Riyadh">Asia/Riyadh (KSA)</option>
                      <option value="Asia/Dubai">Asia/Dubai (UAE)</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={() => triggerToast(tSet('appConfig.applyBtn'))}
                  className="w-full bg-white hover:bg-zinc-100 text-black font-bold p-3 rounded-xl text-center cursor-pointer transition-colors block mt-2 text-sm"
                >
                  {tSet('appConfig.applyBtn')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 4. ALERTS & NOTIFICATIONS ==================== */}
        {tab === 'notifications' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
            
            {/* Active alert rules */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-6 rounded-3xl bg-zinc-950/20 border border-zinc-900 space-y-4">
                <span className="text-base font-bold text-white tracking-tight block">{tSet('notifications.templatesTitle')}</span>
                <p className="text-xs md:text-sm text-zinc-400 mt-1 leading-normal">{tSet('notifications.templatesDesc')}</p>

                <div className="space-y-3">
                  {smsTemplates.map(t => (
                    <div key={t.id} className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-white">{t.name}</span>
                        <span className="text-[10px] bg-zinc-850 text-zinc-300 border border-zinc-800 px-2.5 py-0.5 rounded-md font-semibold">{t.channel}</span>
                      </div>
                      <p className="text-xs md:text-sm text-zinc-300 bg-zinc-900/30 p-3 rounded-xl border border-zinc-900/40 leading-relaxed font-sans">{t.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Channels toggle */}
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-zinc-950/20 border border-zinc-900 space-y-4">
                <span className="text-base font-bold text-white tracking-tight block">{tSet('notifications.channelsTitle')}</span>
                
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center p-4 bg-zinc-950 border border-zinc-850 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-white font-bold">{tSet('notifications.emailChannel')}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{tSet('notifications.emailGateway')}</p>
                      </div>
                    </div>
                    <SpringSwitch 
                      checked={activeChannelMail}
                      onChange={setActiveChannelMail}
                    />
                  </div>

                  <div className="flex justify-between items-center p-4 bg-zinc-950 border border-zinc-850 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-white font-bold">{tSet('notifications.smsChannel')}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{tSet('notifications.smsGateway')}</p>
                      </div>
                    </div>
                    <SpringSwitch 
                      checked={activeChannelSms}
                      onChange={setActiveChannelSms}
                    />
                  </div>

                  <div className="flex justify-between items-center p-4 bg-zinc-950 border border-zinc-850 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-white font-bold">{tSet('notifications.whatsappChannel')}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{tSet('notifications.whatsappGateway')}</p>
                      </div>
                    </div>
                    <SpringSwitch 
                      checked={activeChannelWhatsapp}
                      onChange={setActiveChannelWhatsapp}
                    />
                  </div>
                </div>

                <button 
                  onClick={() => triggerToast(tSet('notifications.saveBtn'))}
                  className="w-full bg-white hover:bg-zinc-100 text-black font-bold p-3 rounded-xl text-center cursor-pointer transition-all block mt-2 text-sm"
                >
                  {tSet('notifications.saveBtn')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 5. SECURITY & AUDITS ==================== */}
        {tab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
            
            {/* Audit Log Table */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-6 rounded-3xl bg-zinc-950/20 border border-zinc-900 space-y-4">
                <span className="text-base font-bold text-white tracking-tight block">{tSet('security.auditTitle')}</span>
                <p className="text-xs md:text-sm text-zinc-400 mt-1 leading-normal">{tSet('security.auditDesc')}</p>

                <div className="space-y-2.5">
                  {AUDIT_LOGS.map((log, i) => (
                    <div key={i} className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl flex justify-between items-center text-sm">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-400 font-semibold">{log.timestamp}</span>
                          <span className="font-bold text-white">{log.action}</span>
                        </div>
                        <p className="text-xs text-zinc-450 mt-1 leading-normal">{tSet('security.auditActor')}: {log.user} • {tSet('security.auditAsset')}: {log.resource}</p>
                      </div>
                      <span className="text-xs text-zinc-400 bg-zinc-900 border border-zinc-850 px-2.5 py-1 rounded-xl font-mono">
                        {log.ip}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Security preferences */}
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-zinc-950/20 border border-zinc-900 space-y-4">
                <span className="text-base font-bold text-white tracking-tight block">{tSet('security.hipaaTitle')}</span>
                
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-zinc-400">{tSet('security.passwordPolicy')}</label>
                    <select 
                      value={pwdComplexity} 
                      onChange={(e) => setPwdComplexity(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 rounded-xl text-white outline-none focus:border-zinc-700 text-sm"
                    >
                      <option>{tSet('security.pwdStandard')}</option>
                      <option>{tSet('security.pwdHigh')}</option>
                      <option>{tSet('security.pwdSuperMax')}</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-850 rounded-2xl text-sm">
                    <div>
                      <p className="text-white font-bold">{tSet('security.enforceMFA')}</p>
                      <p className="text-xs text-zinc-400 mt-1">{tSet('security.enforceMFADesc')}</p>
                    </div>
                    <SpringSwitch 
                      checked={mfaEnforce}
                      onChange={setMfaEnforce}
                    />
                  </div>
                </div>

                <button 
                  onClick={() => triggerToast(tSet('security.saveBtn'))}
                  className="w-full bg-white hover:bg-zinc-100 text-black font-bold p-3 rounded-xl text-center cursor-pointer transition-all block mt-2 text-sm"
                >
                  {tSet('security.saveBtn')}
                </button>
              </div>
            </div>
          </div>
        )}

    </div>
  );
}
