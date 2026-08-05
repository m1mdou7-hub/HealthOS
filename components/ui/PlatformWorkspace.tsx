'use client';

import { motion } from 'motion/react';
import { useWorkspaceToast } from './Workspace/useWorkspaceToast';
import { WorkspaceToast } from './Workspace/WorkspaceToast';
import React, { useState, useMemo } from 'react';
import {
  Cpu,
  Layers,
  Settings2,
  Activity,
  HardDrive,
  Users,
  Radio,
  ToggleLeft,
  Wrench,
  ShieldAlert,
  DollarSign,
  Globe,
  Building,
  CheckCircle2,
  AlertTriangle,
  Play,
  RefreshCw,
  PlusCircle,
  MoreVertical,
  Sliders,
  Tv
} from 'lucide-react';

// --- MOCK ORGANIZATIONS ---
const INITIAL_TENANTS = [
  { id: 'org-1', name: 'Metropolitan Dental Group', plan: 'Enterprise Pro', licenses: '45 / 50', storage: '48.2 GB', health: 'Healthy', status: 'Active', region: 'us-east-1', mainContact: 'Dr. Sarah Jenkins' },
  { id: 'org-2', name: 'West Coast Oral Maxillofacial', plan: 'Enterprise Standard', licenses: '12 / 15', storage: '12.4 GB', health: 'Healthy', status: 'Active', region: 'us-west-2', mainContact: 'Dr. James Carter' },
  { id: 'org-3', name: 'Gotham Orthodontics clinic', plan: 'Elite Dedicated', licenses: '84 / 100', storage: '142.0 GB', health: 'Healthy', status: 'Active', region: 'us-east-1', mainContact: 'Bruce Wayne' },
  { id: 'org-4', name: 'Sovereign Lab Prosthetics', plan: 'Enterprise Lab Node', licenses: '6 / 10', storage: '184.2 GB', health: 'Warning Latency', status: 'Active', region: 'eu-west-1', mainContact: 'Barton Miller' }
];

const INITIAL_FLAGS = [
  { id: 'flg-1', name: 'AI-Assisted Dental Crown Auto-milling v3', enabled: true, tag: 'AI Restorations' },
  { id: 'flg-2', name: 'WebRTC Secure Call Quality Auto-escalation', enabled: true, tag: 'Telehealth Secure' },
  { id: 'flg-3', name: 'Multi-tenant Invoicing Automation', enabled: false, tag: 'Billing Pipeline' },
  { id: 'flg-4', name: 'Local Sintering Machine Live Telemetry', enabled: false, tag: 'IoT Node' }
];

export default function PlatformWorkspace() {
  const [activeTab, setActiveTab] = useState<'tenants' | 'flags' | 'maintenance'>('tenants');
  const [tenants, setTenants] = useState(INITIAL_TENANTS);
  const [flags, setFlags] = useState(INITIAL_FLAGS);
  
  // Custom states
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantPlan, setNewTenantPlan] = useState('Enterprise Standard');
  const [newTenantLicenses, setNewTenantLicenses] = useState('10');

  // Success notifications toast
  const { toastMsg, showToast, triggerToast } = useWorkspaceToast();

  // Register Tenant
  const handleRegisterTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName.trim()) return;

    const newOrg = {
      id: `org-${Date.now()}`,
      name: newTenantName,
      plan: newTenantPlan,
      licenses: `1 / ${newTenantLicenses}`,
      storage: '0.1 GB',
      health: 'Healthy',
      status: 'Active',
      region: 'us-east-1',
      mainContact: 'System Administrator'
    };

    setTenants([...tenants, newOrg]);
    setNewTenantName('');
    triggerToast(`Tenant Organization "${newOrg.name}" provisioned in us-east-1.`);
  };

  // Toggle Feature Flag
  const handleToggleFlag = (id: string) => {
    setFlags(prev => prev.map(f => {
      if (f.id === id) {
        const nextState = !f.enabled;
        triggerToast(`Feature Flag "${f.name}" ${nextState ? 'enabled globally' : 'disabled'}.`);
        return { ...f, enabled: nextState };
      }
      return f;
    }));
  };

  // Trigger Maintenance Operations
  const handleTriggerMaintenance = (opName: string) => {
    triggerToast(`Initializing maintenance routine: ${opName}...`);
    setTimeout(() => {
      triggerToast(`Maintenance routine complete. Node synchronized successfully.`);
    }, 1500);
  };

  return (
    <div className="space-y-6 text-zinc-100 animate-fade-in relative max-w-[1600px] mx-auto">
      
      {/* Toast Alert */}
      {showToast && <WorkspaceToast message={toastMsg} />}

      {/* METRIC HORIZONTAL GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active tenant Orgs', value: tenants.length, icon: Building, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Cumulative storage', value: '381.5 GB', icon: HardDrive, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Active Feature Flags', value: flags.filter(f => f.enabled).length, icon: Settings2, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Exocad API Heartbeat', value: '99.98%', icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/10' }
        ].map((stat, idx) => (
          <div key={idx} className="p-4 rounded-3xl bg-zinc-900/40 border border-zinc-900 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">{stat.label}</span>
              <span className="text-xl font-bold text-white font-mono">{stat.value}</span>
            </div>
            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* TABS SWAP CONTROLS */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-3xl border border-zinc-900">
        <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-950 rounded-3xl border border-zinc-850 relative">
          {[
            { id: 'tenants', label: '1. Tenant Organizations', icon: Building, color: 'bg-blue-500/10 text-blue-400 border border-blue-500/10' },
            { id: 'flags', label: '2. Global Feature Flags', icon: Settings2, color: 'bg-amber-500/10 text-amber-400 border border-amber-500/10' },
            { id: 'maintenance', label: '3. System Maintenance & Node Logs', icon: Wrench, color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' }
          ].map(t => {
            const Icon = t.icon;
            const isSel = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className="relative px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-2 cursor-pointer outline-none active:scale-97"
              >
                {isSel && (
                  <motion.div
                    layoutId="activePlatformTabUnderlay"
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
                  <span>{t.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 font-mono text-[10px] text-zinc-500 uppercase bg-zinc-950 px-2 py-1.5 rounded-xl border border-zinc-850">
          Cluster Version: <strong className="text-white ml-1">v2.10.4-LTS</strong>
        </div>
      </div>

      {/* RENDER ENGINE AREA */}
      {activeTab === 'tenants' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch font-mono text-xs">
          
          {/* Tenant List - 8 Columns */}
          <div className="lg:col-span-8 bg-zinc-900/20 border border-zinc-900 rounded-3xl p-5 space-y-4 flex flex-col justify-start">
            <span className="text-xs font-bold text-white uppercase tracking-wider block border-b border-zinc-900 pb-2">
              Provisioned Tenant Organizations
            </span>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {tenants.map(tenant => (
                <div key={tenant.id} className="p-4 bg-zinc-950 border border-zinc-850 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-sm">{tenant.name}</h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-zinc-500">
                      <span>Plan: <strong className="text-zinc-300">{tenant.plan}</strong></span>
                      <span>Licenses: <strong className="text-zinc-300">{tenant.licenses}</strong></span>
                      <span>Storage: <strong className="text-zinc-300">{tenant.storage}</strong></span>
                      <span>Zone: <strong className="text-zinc-300">{tenant.region}</strong></span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Contact Partner: {tenant.mainContact}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-black ${
                      tenant.health === 'Healthy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {tenant.health}
                    </span>

                    <button 
                      onClick={() => triggerToast(`Modifying subscriptions context for ${tenant.name}`)}
                      className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded"
                      title="More Tenant Options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Provisioning wizard - 4 Columns */}
          <div className="lg:col-span-4 p-5 rounded-3xl bg-zinc-900/30 border border-zinc-900 space-y-4">
            <span className="text-xs font-bold text-white uppercase tracking-wider block border-b border-zinc-900 pb-2">
              Ingest Tenant Organization
            </span>

            <form onSubmit={handleRegisterTenant} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-zinc-500">Clinic Organization Name</label>
                <input 
                  type="text"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  placeholder="e.g. Gotham Orthodontics Clinic"
                  className="w-full bg-zinc-950 border border-zinc-850 p-2 text-white outline-none focus:border-emerald-500 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500">Subscription Tier</label>
                <select 
                  value={newTenantPlan}
                  onChange={(e) => setNewTenantPlan(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-white outline-none"
                >
                  <option>Enterprise Pro</option>
                  <option>Enterprise Standard</option>
                  <option>Elite Dedicated</option>
                  <option>Enterprise Lab Node</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500">Maximum Seat Licenses Limit</label>
                <input 
                  type="number"
                  value={newTenantLicenses}
                  onChange={(e) => setNewTenantLicenses(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 p-2 text-white outline-none focus:border-emerald-500 rounded-xl"
                  min="5"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 py-2.5 rounded-xl text-center font-bold font-mono transition-all cursor-pointer mt-2"
              >
                Ingest & Provision Tenant
              </button>
            </form>
          </div>

        </div>
      )}

      {activeTab === 'flags' && (
        <div className="p-5 bg-zinc-900/30 border border-zinc-900 rounded-3xl space-y-5 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Multi-Tenant Global Feature Flags</h3>
              <p className="text-[10px] text-zinc-500">Instantly activate modular components across the database clusters.</p>
            </div>
            <button 
              onClick={() => triggerToast('Feature flags synced with cluster core.')}
              className="p-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 rounded-lg text-zinc-400 hover:text-white"
            >
              Sync Flags
            </button>
          </div>

          <div className="space-y-2">
            {flags.map(flag => (
              <div 
                key={flag.id} 
                onClick={() => handleToggleFlag(flag.id)}
                className="p-4 bg-zinc-950 border border-zinc-850 rounded-3xl flex items-center justify-between gap-4 cursor-pointer hover:border-zinc-800 transition-colors"
              >
                <div className="space-y-1">
                  <span className="text-[9px] text-purple-400 font-bold uppercase block">{flag.tag}</span>
                  <h5 className="text-xs font-bold text-zinc-300 font-sans">{flag.name}</h5>
                </div>

                <div className={`w-10 h-6 rounded-full p-0.5 transition-all flex items-center ${
                  flag.enabled ? 'bg-emerald-500 justify-end' : 'bg-zinc-800 justify-start'
                }`}>
                  <span className="w-5 h-5 rounded-full bg-zinc-950 shadow-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="p-5 bg-zinc-900/30 border border-zinc-900 rounded-3xl space-y-5 font-mono text-xs">
          <span className="text-xs font-bold text-white uppercase tracking-wider block border-b border-zinc-900 pb-2">
            Operations & Maintenance Actions
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Global Maintenance Banner', desc: 'Alert all connected tenants of minor backend latency curves.', action: 'Deploy Notice' },
              { title: 'Sync Central Exocad API', desc: 'Trigger active validation ping on all client-side rendering licenses.', action: 'Flush Licenses' },
              { title: 'Telemetry Node Calibration', desc: 'Sync furnace temperature logs and calibrate IoT sensors.', action: 'Run Calibration' }
            ].map((maint, idx) => (
              <div key={idx} className="p-4 bg-zinc-950 border border-zinc-850 rounded-3xl flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-xs">{maint.title}</h4>
                  <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">{maint.desc}</p>
                </div>

                <button 
                  onClick={() => handleTriggerMaintenance(maint.title)}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 py-1.5 rounded-xl font-bold font-mono transition-all"
                >
                  {maint.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
