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
import { staffAuthService, StaffMember, StaffRole } from '@/utils/services/staffAuthService';

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
    <div className="space-y-6 text-zinc-100 animate-fade-in relative font-sans">
      
      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-sans text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-500 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* SECTION TABS HEADER */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-zinc-900/40 p-3 rounded-3xl border border-zinc-850/80 shadow-md">
        <div className="flex flex-wrap gap-2 p-1.5 bg-zinc-950/80 rounded-2xl border border-zinc-850">
          {[
            { id: 'organization', key: 'organization', icon: Building },
            { id: 'profile', key: 'profile', icon: User },
            { id: 'app-config', key: 'appConfig', icon: Settings },
            { id: 'notifications', key: 'notifications', icon: Bell },
            { id: 'security', key: 'security', icon: Shield }
          ].map(t => {
            const Icon = t.icon;
            const isSel = tab === t.id;
            const labelText = tSet(`tabs.${t.key}`);
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-2 cursor-pointer border ${
                  isSel 
                    ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-extrabold shadow-lg shadow-emerald-500/20 scale-[1.02]' 
                    : 'bg-zinc-900/40 text-zinc-300 border-zinc-850 hover:bg-zinc-900 hover:text-white hover:border-zinc-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{labelText}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 bg-zinc-950/80 rounded-xl border border-zinc-800 text-xs font-semibold text-zinc-300 font-sans">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{tSet('nodeStatus')}</span>
        </div>
      </div>

      {/* TAB CONTENT */}
      {tab === 'organization' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Department List */}
            <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono block">{tSet('org.hierarchyTitle')}</span>
                  <p className="text-[11px] text-zinc-500">{tSet('org.hierarchyDesc')}</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {departments.map(dep => (
                  <div key={dep.id} className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl flex items-center justify-between text-xs font-mono">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-black">{dep.code}</span>
                        <h5 className="font-bold text-white text-[13px]">{dep.name}</h5>
                      </div>
                      <p className="text-[10px] text-zinc-500">
                        {tSet('org.head')}: <span className="text-zinc-300">{dep.head}</span> • {tSet('org.staffSize')}: <span className="text-blue-400">{dep.activeStaff}</span>
                      </p>
                    </div>

                    <button 
                      onClick={() => handleRemoveDept(dep.id)}
                      className="p-1.5 hover:bg-zinc-900 text-zinc-500 hover:text-red-400 transition-all cursor-pointer rounded-lg border border-transparent hover:border-zinc-800"
                      title="Delete department"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Dept Form */}
              <form onSubmit={handleAddDept} className="grid grid-cols-1 md:grid-cols-4 gap-2.5 pt-2 border-t border-zinc-900 font-mono text-xs">
                <input 
                  type="text" 
                  placeholder={tSet('org.deptNamePlaceholder')}
                  value={newDepName}
                  onChange={(e) => setNewDepName(e.target.value)}
                  className="md:col-span-2 bg-zinc-950 border border-zinc-850 p-2 text-white outline-none rounded-xl"
                />
                <input 
                  type="text" 
                  placeholder={tSet('org.deptCodePlaceholder')}
                  value={newDepCode}
                  onChange={(e) => setNewDepCode(e.target.value)}
                  maxLength={5}
                  className="bg-zinc-950 border border-zinc-850 p-2 text-white outline-none rounded-xl uppercase"
                />
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-black font-bold p-2 rounded-xl text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> {tSet('org.addDept')}
                </button>
              </form>
            </div>

            {/* Team seat licenses & Staff Management */}
            <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono block">{tSet('org.staffTitle')}</span>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{tSet('org.staffDesc')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(true)}
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> {tSet('org.inviteBtn')}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                {team.map(member => (
                  <div key={member.id} className="p-3.5 bg-zinc-950/80 border border-zinc-850 rounded-xl flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-white font-bold text-sm">{member.name}</p>
                        <span className="text-[9px] text-zinc-400 px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-semibold uppercase">{member.role}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">{member.email}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
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
            <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-4 font-mono text-xs">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">{tSet('org.subscriptionTitle')}</span>
              <div className="space-y-3.5">
                <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-xl">
                  <p className="text-white font-extrabold text-sm">{tSet('org.enterprisePlan')}</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{tSet('org.planExpiry')}</p>
                </div>
                <div className="space-y-1 text-zinc-400">
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
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleInviteStaff} className="bg-zinc-950 border border-zinc-850 p-6 rounded-3xl w-full max-w-md space-y-4 text-xs font-sans">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" /> {tSet('invite.title')}
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">{tSet('invite.subtitle')}</p>
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold">{tSet('invite.role')}</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as StaffRole })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none font-mono"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-zinc-850 pt-3">
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-semibold text-xs"
              >
                {tSet('invite.cancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                {tSet('invite.submit')}
              </button>
            </div>
          </form>
        </div>
      )}

        {/* ==================== 2. PERSONAL CREDENTIALS ==================== */}
        {tab === 'profile' && (
          <div className="max-w-4xl space-y-6">
            {personalForms}
          </div>
        )}

        {/* ==================== 3. CLINICAL PARAMETERS ==================== */}
        {tab === 'app-config' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
            <div className="lg:col-span-2 space-y-4">
              
              {/* App defaults settings */}
              <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-4">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono block">{tSet('appConfig.appointmentTitle')}</span>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-zinc-500">{tSet('appConfig.slotDuration')}</label>
                      <select 
                        value={slotDuration} 
                        onChange={(e) => setSlotDuration(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-white outline-none"
                      >
                        <option value="15">15 min</option>
                        <option value="30">30 min</option>
                        <option value="45">45 min</option>
                        <option value="60">60 min</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-500">{tSet('appConfig.cancellationPeriod')}</label>
                      <select 
                        className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-white outline-none"
                      >
                        <option>{tSet('appConfig.cancel24h')}</option>
                        <option>{tSet('appConfig.cancel48h')}</option>
                        <option>{tSet('appConfig.cancelAlways')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
                    <div>
                      <p className="text-white font-bold">{tSet('appConfig.allowCancel')}</p>
                      <p className="text-[10px] text-zinc-500">{tSet('appConfig.allowCancelDesc')}</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={allowCancel}
                      onChange={(e) => setAllowCancel(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* AI/Gemini configurations */}
              <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono block">{tSet('appConfig.aiTitle')}</span>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-zinc-500">{tSet('appConfig.primaryModel')}</label>
                      <select 
                        value={geminiModel} 
                        onChange={(e) => setGeminiModel(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-white outline-none"
                      >
                        <option value="gemini-3.5-flash">Gemini 3.5 Flash (Default)</option>
                        <option value="gemini-3.5-pro">Gemini 3.5 Pro (Clinical Notes)</option>
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash (Legacy)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-500">{tSet('appConfig.temperature')}</label>
                      <select 
                        value={geminiTemp} 
                        onChange={(e) => setGeminiTemp(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-white outline-none"
                      >
                        <option value="0.0">0.0 (Deterministic / Safe)</option>
                        <option value="0.2">0.2 (Recommended Clinical)</option>
                        <option value="0.7">0.7 (Exploratory)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1 text-[11px]">
                    <div className="flex justify-between items-center text-emerald-400 font-bold">
                      <span className="flex items-center gap-1">
                        <Key className="w-3.5 h-3.5" /> {tSet('appConfig.apiKeyStatus')}
                      </span>
                      <span>{tSet('appConfig.apiKeyConfigured')}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500">{tSet('appConfig.apiKeyDesc')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Language / Region Settings */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-4">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">{tSet('appConfig.regionTitle')}</span>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-zinc-500">{tSet('appConfig.defaultLanguage')}</label>
                    <select 
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-white outline-none"
                    >
                      <option>English (US)</option>
                      <option>English (UK)</option>
                      <option>Español (ES)</option>
                      <option>Français (FR)</option>
                      <option>العربية (AR)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-500">{tSet('appConfig.timezone')}</label>
                    <select 
                      value={selectedTimezone}
                      onChange={(e) => setSelectedTimezone(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-white outline-none"
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
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold p-2.5 rounded-xl text-center cursor-pointer transition-colors block mt-2"
                >
                  {tSet('appConfig.applyBtn')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 4. ALERTS & NOTIFICATIONS ==================== */}
        {tab === 'notifications' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
            
            {/* Active alert rules */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-4">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">{tSet('notifications.templatesTitle')}</span>
                <p className="text-[10px] text-zinc-500">{tSet('notifications.templatesDesc')}</p>

                <div className="space-y-3">
                  {smsTemplates.map(t => (
                    <div key={t.id} className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-white">{t.name}</span>
                        <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-black">{t.channel}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 bg-zinc-900/60 p-2 rounded-lg border border-zinc-900 leading-relaxed font-sans">{t.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Channels toggle */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-4">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">{tSet('notifications.channelsTitle')}</span>
                
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="text-white font-bold">{tSet('notifications.emailChannel')}</p>
                        <p className="text-[9px] text-zinc-500">{tSet('notifications.emailGateway')}</p>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={activeChannelMail}
                      onChange={(e) => setActiveChannelMail(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-between items-center p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-white font-bold">{tSet('notifications.smsChannel')}</p>
                        <p className="text-[9px] text-zinc-500">{tSet('notifications.smsGateway')}</p>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={activeChannelSms}
                      onChange={(e) => setActiveChannelSms(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-between items-center p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="text-white font-bold">{tSet('notifications.whatsappChannel')}</p>
                        <p className="text-[9px] text-zinc-500">{tSet('notifications.whatsappGateway')}</p>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={activeChannelWhatsapp}
                      onChange={(e) => setActiveChannelWhatsapp(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => triggerToast(tSet('notifications.saveBtn'))}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold p-2.5 rounded-xl text-center cursor-pointer transition-all block mt-2"
                >
                  {tSet('notifications.saveBtn')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 5. SECURITY & AUDITS ==================== */}
        {tab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
            
            {/* Audit Log Table */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-4">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">{tSet('security.auditTitle')}</span>
                <p className="text-[10px] text-zinc-500">{tSet('security.auditDesc')}</p>

                <div className="space-y-2">
                  {AUDIT_LOGS.map((log, i) => (
                    <div key={i} className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl flex justify-between items-center text-[11px]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-zinc-500 font-bold">{log.timestamp}</span>
                          <span className="font-extrabold text-white">{log.action}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{tSet('security.auditActor')}: {log.user} • {tSet('security.auditAsset')}: {log.resource}</p>
                      </div>
                      <span className="text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 font-mono">
                        {log.ip}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Security preferences */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-4">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">{tSet('security.hipaaTitle')}</span>
                
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-zinc-500">{tSet('security.passwordPolicy')}</label>
                    <select 
                      value={pwdComplexity} 
                      onChange={(e) => setPwdComplexity(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-white outline-none"
                    >
                      <option>{tSet('security.pwdStandard')}</option>
                      <option>{tSet('security.pwdHigh')}</option>
                      <option>{tSet('security.pwdSuperMax')}</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
                    <div>
                      <p className="text-white font-bold">{tSet('security.enforceMFA')}</p>
                      <p className="text-[10px] text-zinc-500">{tSet('security.enforceMFADesc')}</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={mfaEnforce}
                      onChange={(e) => setMfaEnforce(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => triggerToast(tSet('security.saveBtn'))}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold p-2.5 rounded-xl text-center cursor-pointer transition-all block mt-2"
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
