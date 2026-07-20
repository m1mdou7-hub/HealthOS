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
  const [tab, setTab] = useState<'profile' | 'organization' | 'app-config' | 'notifications' | 'security'>('organization');
  
  // Organization state
  const [departments, setDepartments] = useState(MOCK_DEPARTMENTS);
  const [team, setTeam] = useState(MOCK_TEAM_MEMBERS);
  const [newDepName, setNewDepName] = useState('');
  const [newDepCode, setNewDepCode] = useState('');
  const [newDepHead, setNewDepHead] = useState('Dr. Elena Rostova');
  
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
      triggerToast('Subscription upgraded! Your clinic workspace is now successfully running on the Enterprise Unlimited Plan.');
    }
    const portal = searchParams.get('portal');
    if (portal === 'mock_success') {
      triggerToast('Billing Portal settings loaded successfully.');
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
    triggerToast(`Clinical Department "${newDep.name}" added to organization hierarchy.`);
  };

  // Remove Department
  const handleRemoveDept = (id: string) => {
    const dep = departments.find(d => d.id === id);
    if (!dep) return;
    setDepartments(departments.filter(d => d.id !== id));
    triggerToast(`Department "${dep.name}" removed successfully.`);
  };

  return (
    <div className="space-y-6 text-zinc-100 animate-fade-in relative">
      
      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-mono text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-500 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* SECTION TABS HEADER */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-zinc-900/50 p-4 rounded-3xl border border-zinc-900">
        <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-950 rounded-2xl border border-zinc-850">
          {[
            { id: 'organization', label: '1. Organization & Core', icon: Building },
            { id: 'profile', label: '2. Personal Credentials', icon: User },
            { id: 'app-config', label: '3. Clinical Parameters', icon: Settings },
            { id: 'notifications', label: '4. Alerts & Notifications', icon: Bell },
            { id: 'security', label: '5. Security & Audits', icon: Shield }
          ].map(t => {
            const Icon = t.icon;
            const isSel = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
                  isSel ? 'bg-blue-600 text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-950 rounded-xl border border-zinc-850 text-[10px] font-mono text-zinc-400">
          <Database className="w-3.5 h-3.5 text-blue-400" />
          <span>Cloud Quota: 42.5 / 100 GB used</span>
        </div>
      </div>

      {/* WORKSPACE AREA */}
      <div className="space-y-6">

        {/* ==================== 1. ORGANIZATION & CORE ==================== */}
        {tab === 'organization' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Departments Setup */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Active Specialty Departments</h4>
                    <p className="text-[10px] text-zinc-500 font-mono">Hierarchy configurations for routing medical laboratory and treatment logs.</p>
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
                          Head: <span className="text-zinc-300">{dep.head}</span> • Staff Size: <span className="text-blue-400">{dep.activeStaff} operators</span>
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
                    placeholder="Dept Name (e.g. Endodontics)" 
                    value={newDepName}
                    onChange={(e) => setNewDepName(e.target.value)}
                    className="md:col-span-2 bg-zinc-950 border border-zinc-850 p-2 text-white outline-none rounded-xl"
                  />
                  <input 
                    type="text" 
                    placeholder="Code (e.g. ENDO)" 
                    value={newDepCode}
                    onChange={(e) => setNewDepCode(e.target.value)}
                    maxLength={5}
                    className="bg-zinc-950 border border-zinc-850 p-2 text-white outline-none rounded-xl uppercase"
                  />
                  <button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-black font-bold p-2 rounded-xl text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Dept
                  </button>
                </form>
              </div>

              {/* Team seat licenses */}
              <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-4">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono block">Registered System Seat Licenses</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                  {team.map(member => (
                    <div key={member.id} className="p-3 bg-zinc-950/50 border border-zinc-850 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-white font-bold">{member.name}</p>
                        <p className="text-[10px] text-zinc-500">{member.email}</p>
                        <span className="text-[9px] text-zinc-400 px-1 py-0.5 bg-zinc-900 border border-zinc-800 rounded mt-1.5 inline-block">{member.role}</span>
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold">
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
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Subscription Status</span>
                <div className="space-y-3.5">
                  <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-xl">
                    <p className="text-white font-extrabold text-sm">Enterprise Ultimate Plan</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Expires July 2027 • Standard HIPAA SLA</p>
                  </div>
                  <div className="space-y-1 text-zinc-400">
                    <div className="flex justify-between">
                      <span>Seat Licenses:</span>
                      <span className="text-white font-bold">6 of 15 seats</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Multi-Clinic Hubs:</span>
                      <span className="text-white font-bold">3 active clinics</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Support Desk:</span>
                      <span className="text-emerald-400 font-bold">Dedicated 24/7 Account Mgr</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono block">Default Appointment Parameters</span>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-zinc-500">Normal Slot Duration</label>
                      <select 
                        value={slotDuration} 
                        onChange={(e) => setSlotDuration(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-white outline-none"
                      >
                        <option value="15">15 Minutes</option>
                        <option value="30">30 Minutes</option>
                        <option value="45">45 Minutes</option>
                        <option value="60">60 Minutes</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-500">Cancellation Period</label>
                      <select 
                        className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-white outline-none"
                      >
                        <option>24 Hours Before</option>
                        <option>48 Hours Before</option>
                        <option>Always Allowed</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
                    <div>
                      <p className="text-white font-bold">Allow Immediate Patient Cancellations</p>
                      <p className="text-[10px] text-zinc-500">If toggled, outpatients can withdraw in-app without admin fee rules.</p>
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
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono block">AI Core / Gemini LLM Defaults</span>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-zinc-500">Primary Model Hub</label>
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
                      <label className="text-zinc-500">Creativity Temperature</label>
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
                        <Key className="w-3.5 h-3.5" /> API Key Environment Status
                      </span>
                      <span>Configured</span>
                    </div>
                    <p className="text-[10px] text-zinc-500">Using secure server-side proxy route: process.env.GEMINI_API_KEY. No client leakage.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Language / Region Settings */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-4">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">Regional Localization</span>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-zinc-500">Default Language</label>
                    <select 
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-white outline-none"
                    >
                      <option>English (US)</option>
                      <option>English (UK)</option>
                      <option>Español (ES)</option>
                      <option>Français (FR)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-500">Clinic Timezone</label>
                    <select 
                      value={selectedTimezone}
                      onChange={(e) => setSelectedTimezone(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-white outline-none"
                    >
                      <option value="America/Los_Angeles">America/Los_Angeles</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="UTC">UTC Greenwich Mean Time</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={() => triggerToast('Clinical parameters and regional localization saved successfully.')}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold p-2.5 rounded-xl text-center cursor-pointer transition-colors block mt-2"
                >
                  Apply System Bounds
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
                <span className="text-xs font-bold text-white uppercase tracking-wider block">Dynamic SMS/Email Templating</span>
                <p className="text-[10px] text-zinc-500">Workspace macros auto-render during transactional patient appointments or dispatch triggers.</p>

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
                <span className="text-xs font-bold text-white uppercase tracking-wider block">Active Dispatch Channels</span>
                
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="text-white font-bold">Email Dispatcher</p>
                        <p className="text-[9px] text-zinc-500">SES SMTP Gateway</p>
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
                        <p className="text-white font-bold">SMS Outbox</p>
                        <p className="text-[9px] text-zinc-500">Twilio Webhook Node</p>
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
                        <p className="text-white font-bold">WhatsApp Business</p>
                        <p className="text-[9px] text-zinc-500">Meta Cloud API</p>
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
                  onClick={() => triggerToast('Notification template states and channels applied.')}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold p-2.5 rounded-xl text-center cursor-pointer transition-all block mt-2"
                >
                  Save Dispatch States
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
                <span className="text-xs font-bold text-white uppercase tracking-wider block">Real-time Workspace Audit Log</span>
                <p className="text-[10px] text-zinc-500">Read-only immutable sequence ledger of all administrator actions within HealthOS.</p>

                <div className="space-y-2">
                  {AUDIT_LOGS.map((log, i) => (
                    <div key={i} className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl flex justify-between items-center text-[11px]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-zinc-500 font-bold">{log.timestamp}</span>
                          <span className="font-extrabold text-white">{log.action}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Actor: {log.user} • Asset: {log.resource}</p>
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
                <span className="text-xs font-bold text-white uppercase tracking-wider block">HIPAA & Security Compliance</span>
                
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-zinc-500">Password Policy</label>
                    <select 
                      value={pwdComplexity} 
                      onChange={(e) => setPwdComplexity(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-white outline-none"
                    >
                      <option>Standard (8+ chars)</option>
                      <option>High (12+ chars, Symbols, Case)</option>
                      <option>Super-Max (16+ chars, rotated monthly)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
                    <div>
                      <p className="text-white font-bold">Enforce Two-Factor (MFA)</p>
                      <p className="text-[10px] text-zinc-500">Require TOTP token for clinical logins.</p>
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
                  onClick={() => triggerToast('Security policies updated. Audit logs synced.')}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold p-2.5 rounded-xl text-center cursor-pointer transition-all block mt-2"
                >
                  Save Security Policies
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
