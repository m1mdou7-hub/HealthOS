'use client';

import React, { useState, useMemo } from 'react';
import {
  Code2,
  Terminal,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Database,
  RefreshCw,
  Cpu,
  Mail,
  Smartphone,
  Sparkles,
  Blocks,
  FileText,
  User,
  Key,
  ShieldAlert,
  Search,
  Plus,
  Trash2,
  Copy,
  Check,
  CheckSquare,
  Activity,
  Hourglass,
  Sliders,
  Send
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

// --- MOCK API SCHEMAS & RESPONSES ---
const ENDPOINT_RESPONSES: Record<string, any> = {
  '/api/v1/patients': {
    status: 200,
    message: 'Success',
    count: 3,
    data: [
      { id: 'PAT-8821', first_name: 'Marcus', last_name: 'Patterson', email: 'patterson@gmail.com', dob: '1984-05-12' },
      { id: 'PAT-4112', first_name: 'Sarah', last_name: 'Jenkins', email: 'sarah.j@dental.org', dob: '1991-11-20' },
      { id: 'PAT-9903', first_name: 'Emily', last_name: 'Vance', email: 'emily@vance.net', dob: '1978-02-14' }
    ]
  },
  '/api/v1/clinics': {
    status: 200,
    message: 'Success',
    count: 2,
    data: [
      { id: 'CLI-01', name: 'HealthOS Digital Suite', location: 'Seattle Downtown Hub', activeChairs: 5 },
      { id: 'CLI-02', name: 'HealthOS Restorative Care', location: 'Bellevue Ortho Ward', activeChairs: 3 }
    ]
  },
  '/api/v1/laboratory': {
    status: 200,
    message: 'Success',
    count: 1,
    data: [
      { id: 'LAB-948', jobType: '3D Surgical Guide Fabrication', material: 'BioMed Amber Resin', status: 'In-Queue' }
    ]
  },
  '/api/v1/inventory': {
    status: 200,
    message: 'Success',
    count: 2,
    data: [
      { sku: 'SCM-N95-882', name: 'N95 Respirator Mask', stockLevel: 840, threshold: 220 },
      { sku: 'SCM-REAG-PCR', name: 'SARS-CoV-2 PCR Reagent Vial', stockLevel: 450, threshold: 100 }
    ]
  }
};

const INITIAL_WEBHOOKS = [
  { id: 'wh-01', url: 'https://billing.hospital.org/incoming-payloads', events: ['invoice.paid', 'insurance.denied'], active: true },
  { id: 'wh-02', url: 'https://iot.ortholabs.net/api/v2/guides', events: ['lab.completed'], active: true },
  { id: 'wh-03', url: 'https://crm.patientsync.io/webhooks/intake', events: ['patient.created'], active: false }
];

const LATENCY_CHART_DATA = [
  { hour: '00:00', latency: 42, requests: 1200 },
  { hour: '04:00', latency: 38, requests: 840 },
  { hour: '08:00', latency: 68, requests: 4200 },
  { hour: '12:00', latency: 54, requests: 5800 },
  { hour: '16:00', latency: 49, requests: 4900 },
  { hour: '20:00', latency: 41, requests: 2100 }
];

const CODE_EXAMPLES = {
  curl: `curl -X GET "https://api.healthos.io/api/v1/patients" \\
  -H "Authorization: Bearer sk_live_72bc••••••••••••" \\
  -H "Content-Type: application/json"`,
  
  typescript: `import { HealthOS } from '@healthos/sdk';

const healthos = new HealthOS({
  apiKey: 'sk_live_72bc••••••••••••'
});

const patients = await healthos.patients.list({
  limit: 10,
  status: 'Active'
});

console.log(patients.data);`,
  
  python: `from healthos import Client

client = Client(api_key="sk_live_72bc••••••••••••")

patients = client.patients.list(limit=10)
print(patients["data"])`
};

export default function DeveloperWorkspace() {
  const tDev = useTranslations('DeveloperWorkspace');
  const [tab, setTab] = useState<'explorer' | 'webhooks' | 'credentials' | 'docs'>('explorer');
  const [apiKeys, setApiKeys] = useState([
    { id: 'key-01', name: 'Primary Clinical Sync Key', token: 'sk_live_72bc17682f494e74a6ed0a345566dd82', created: '2026-07-15' },
    { id: 'key-02', name: 'Twilio Gateway Service Key', token: 'sk_live_883a9101ff2a44bdccab12ff48203c94', created: '2026-07-16' }
  ]);
  
  // API Explorer states
  const [selectedMethod, setSelectedMethod] = useState<'GET' | 'POST'>('GET');
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/v1/patients');
  const [apiResponse, setApiResponse] = useState<any>(ENDPOINT_RESPONSES['/api/v1/patients']);
  const [isSending, setIsSending] = useState(false);
  const [latencyText, setLatencyText] = useState('32 ms');

  // Webhooks states
  const [webhooks, setWebhooks] = useState(INITIAL_WEBHOOKS);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [selectedWebhookEvents, setSelectedWebhookEvents] = useState<string[]>(['patient.created']);

  // Copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Success notifications toast
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Run Explorer Request
  const handleSendRequest = () => {
    setIsSending(true);
    setTimeout(() => {
      const response = ENDPOINT_RESPONSES[selectedEndpoint] || { status: 404, error: 'Not Found' };
      setApiResponse(response);
      setLatencyText(`${Math.floor(Math.random() * 40) + 20} ms`);
      setIsSending(false);
      triggerToast(`Request to ${selectedEndpoint} dispatched successfully.`);
    }, 400);
  };

  // Generate new API Key
  const handleGenerateKey = () => {
    const randomHex = Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const newKey = {
      id: `key-0${apiKeys.length + 1}`,
      name: `User Key ${apiKeys.length + 1} (Clinical Pro)`,
      token: `sk_live_${randomHex}`,
      created: new Date().toISOString().substring(0, 10)
    };

    setApiKeys([newKey, ...apiKeys]);
    triggerToast(`API credential "${newKey.name}" generated safely.`);
  };

  // Revoke API Key
  const handleRevokeKey = (id: string) => {
    const key = apiKeys.find(k => k.id === id);
    if (!key) return;
    setApiKeys(apiKeys.filter(k => k.id !== id));
    triggerToast(`API credential "${key.name}" completely revoked.`);
  };

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    triggerToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Add webhook subscription
  const handleAddWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookUrl.trim()) return;

    const newWh = {
      id: `wh-0${webhooks.length + 1}`,
      url: newWebhookUrl,
      events: selectedWebhookEvents,
      active: true
    };

    setWebhooks([...webhooks, newWh]);
    setNewWebhookUrl('');
    triggerToast(`Webhook subscription configured for target ${newWh.url}.`);
  };

  // Toggle Webhook State
  const handleToggleWebhook = (id: string) => {
    setWebhooks(prev => prev.map(wh => {
      if (wh.id === id) {
        const nextState = !wh.active;
        triggerToast(`Webhook channel ${wh.url} is now ${nextState ? 'active' : 'paused'}.`);
        return { ...wh, active: nextState };
      }
      return wh;
    }));
  };

  // Delete Webhook
  const handleDeleteWebhook = (id: string) => {
    const wh = webhooks.find(w => w.id === id);
    if (!wh) return;
    setWebhooks(webhooks.filter(w => w.id !== id));
    triggerToast(`Deleted webhook subscription to ${wh.url}`);
  };

  return (
    <div className="space-y-6 text-zinc-100 animate-fade-in relative font-sans">
      
      {/* Toast notifications */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-sans text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-500 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* HORIZONTAL WORKSPACE TABS */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-zinc-900/40 p-3 rounded-3xl border border-zinc-850/80 shadow-md">
        <div className="flex flex-wrap gap-2 p-1.5 bg-zinc-950/80 rounded-2xl border border-zinc-850">
          {[
            { id: 'explorer', key: 'explorer', icon: Terminal },
            { id: 'webhooks', key: 'webhooks', icon: Blocks },
            { id: 'credentials', key: 'credentials', icon: Key },
            { id: 'docs', key: 'docs', icon: Code2 }
          ].map(t => {
            const Icon = t.icon;
            const isSel = tab === t.id;
            const labelText = tDev(`tabs.${t.key}`);
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

        <div className="flex items-center gap-2 px-3.5 py-2 bg-zinc-950/80 rounded-xl border border-zinc-800 text-xs font-semibold text-zinc-300">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>{tDev('gatewayStatus')}</span>
        </div>
      </div>

      {/* WORKSPACE SECTIONS */}
      <div className="space-y-6">

        {/* ==================== 1. API EXPLORER ==================== */}
        {tab === 'explorer' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans text-xs">
            
            {/* Explorer sandbox controls */}
            <div className="lg:col-span-1 p-5 rounded-2xl bg-zinc-900/40 border border-zinc-850/80 space-y-4 shadow-lg">
              <span className="text-sm font-bold text-white uppercase tracking-wider block font-sans">{tDev('sandbox.builderTitle')}</span>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-medium">{tDev('sandbox.httpMethod')}</label>
                  <select 
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-white outline-none rounded-xl font-sans"
                  >
                    <option value="GET">GET</option>
                    <option value="POST" disabled>POST (Write locked in sandbox)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-medium">{tDev('sandbox.endpoint')}</label>
                  <select 
                    value={selectedEndpoint}
                    onChange={(e) => setSelectedEndpoint(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-white outline-none rounded-xl font-sans"
                  >
                    <option value="/api/v1/patients">/api/v1/patients</option>
                    <option value="/api/v1/clinics">/api/v1/clinics</option>
                    <option value="/api/v1/laboratory">/api/v1/laboratory</option>
                    <option value="/api/v1/inventory">/api/v1/inventory</option>
                  </select>
                </div>

                <button 
                  onClick={handleSendRequest}
                  disabled={isSending}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 py-2.5 rounded-xl font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md shadow-emerald-500/10"
                >
                  {isSending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{tDev('sandbox.executeBtn')}</span>
                </button>
              </div>
            </div>

            {/* Sandbox response viewport */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-zinc-900/40 border border-zinc-850/80 space-y-3.5 flex flex-col justify-between shadow-lg">
              <div className="flex justify-between items-center text-xs text-zinc-400 border-b border-zinc-800 pb-2 font-sans">
                <span className="font-bold text-zinc-300">{tDev('sandbox.proxyLogs')}</span>
                <div className="flex items-center gap-3">
                  <span>{tDev('sandbox.status')}: <strong className="text-emerald-400 font-bold">200 OK</strong></span>
                  <span>{tDev('sandbox.latency')}: <strong className="text-zinc-200 font-bold font-mono">{latencyText}</strong></span>
                </div>
              </div>

              {/* JSON code block block */}
              <div className="flex-1 bg-zinc-950 p-4 rounded-xl border border-zinc-850 overflow-x-auto min-h-[220px] relative">
                <button 
                  onClick={() => handleCopy(JSON.stringify(apiResponse, null, 2), 'Response Body')}
                  className="absolute right-3 top-3 p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all cursor-pointer"
                  title="Copy JSON Payload"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <pre className="text-[11px] text-blue-400 leading-normal font-mono select-text">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 2. WEBHOOK SUBSCRIPTIONS ==================== */}
        {tab === 'webhooks' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
            
            {/* List active webhooks */}
            <div className="lg:col-span-2 space-y-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">Registered Endpoint Observers</span>
              
              {webhooks.map(wh => (
                <div key={wh.id} className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl flex justify-between items-start">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${wh.active ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
                      <h5 className="font-bold text-white truncate max-w-[320px]">{wh.url}</h5>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {wh.events.map(ev => (
                        <span key={ev} className="text-[9px] bg-blue-500/15 border border-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold font-mono">
                          {ev}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleToggleWebhook(wh.id)}
                      className={`text-[9px] font-mono px-2 py-1 rounded border font-black transition-all cursor-pointer ${
                        wh.active 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-zinc-800 text-zinc-500 border-zinc-850'
                      }`}
                    >
                      {wh.active ? 'ACTIVE' : 'PAUSED'}
                    </button>

                    <button 
                      onClick={() => handleDeleteWebhook(wh.id)}
                      className="p-1.5 bg-zinc-950 border border-zinc-850 hover:border-zinc-800 text-zinc-500 hover:text-red-400 rounded-lg cursor-pointer"
                      title="Remove Observer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Create Webhook subscription */}
            <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">Register Webhook Target</span>
              
              <form onSubmit={handleAddWebhook} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-zinc-500">Destination URL Endpoint</label>
                  <input 
                    type="url"
                    value={newWebhookUrl}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                    placeholder="https://yourserver.com/api/v1/wh"
                    className="w-full bg-zinc-950 border border-zinc-850 p-2 text-white outline-none rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-500">Event Topic Trigger</label>
                  <div className="space-y-1.5 text-[10px] text-zinc-400">
                    {['patient.created', 'appointment.scheduled', 'lab.completed', 'billing.unpaid', 'inventory.low'].map(ev => {
                      const has = selectedWebhookEvents.includes(ev);
                      return (
                        <button
                          type="button"
                          key={ev}
                          onClick={() => {
                            if (has) setSelectedWebhookEvents(selectedWebhookEvents.filter(e => e !== ev));
                            else setSelectedWebhookEvents([...selectedWebhookEvents, ev]);
                          }}
                          className={`w-full text-left p-1.5 border rounded-lg transition-all flex items-center justify-between ${
                            has ? 'bg-blue-950/40 text-blue-400 border-blue-800 font-bold' : 'bg-transparent border-zinc-850'
                          }`}
                        >
                          <span>{ev}</span>
                          {has && <Check className="w-3 h-3 text-blue-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-black py-2.5 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Subscribe to Topics
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ==================== 3. OAUTH & API KEYS ==================== */}
        {tab === 'credentials' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider block">Live Authorization Secret Keys</h4>
                    <p className="text-[10px] text-zinc-500 mt-1">Use these private keys to authorize API clients on behalf of this workspace.</p>
                  </div>
                  <button 
                    onClick={handleGenerateKey}
                    className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-600 hover:text-black transition-all cursor-pointer font-bold"
                  >
                    + Generate Secret
                  </button>
                </div>

                <div className="space-y-3">
                  {apiKeys.map(key => (
                    <div key={key.id} className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white text-[11px]">{key.name}</span>
                        <span className="text-[9px] text-zinc-500">Generated: {key.created}</span>
                      </div>

                      <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg flex justify-between items-center text-[10px]">
                        <span className="text-zinc-400 truncate max-w-[320px] select-all font-mono">{key.token}</span>
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => handleCopy(key.token, key.name)}
                            className="p-1 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded transition-all cursor-pointer border border-transparent hover:border-zinc-800"
                            title="Copy Key"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleRevokeKey(key.id)}
                            className="p-1 hover:bg-zinc-850 text-zinc-500 hover:text-red-400 rounded transition-all cursor-pointer border border-transparent hover:border-zinc-800"
                            title="Revoke Key"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Security advisory */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-3">
                <div className="flex gap-2.5 items-center text-rose-400">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider block">Developer Warning</span>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                  Never commit API keys directly to git records or expose them client-side in the browser. Always proxy REST requests through a server API route to keep keys hidden from client inspection.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 4. DOCUMENTATION ==================== */}
        {tab === 'docs' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs animate-fade-in">
            <div className="lg:col-span-2 p-5 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">SDK Code Implementations</span>
              <p className="text-[10px] text-zinc-500">Developer libraries wrapper methods for instant patient and laboratory integrations.</p>

              <div className="space-y-4">
                
                {/* TypeScript copy widget */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] text-zinc-500">
                    <span>Typescript (SDK Client v2.1)</span>
                    <button 
                      onClick={() => handleCopy(CODE_EXAMPLES.typescript, 'TypeScript Example')}
                      className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" /> Copy Sample
                    </button>
                  </div>
                  <pre className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-blue-400 text-[10px] overflow-x-auto select-text font-mono">
                    {CODE_EXAMPLES.typescript}
                  </pre>
                </div>

                {/* Python copy widget */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] text-zinc-500">
                    <span>Python (Client Library v1.4)</span>
                    <button 
                      onClick={() => handleCopy(CODE_EXAMPLES.python, 'Python Example')}
                      className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" /> Copy Sample
                    </button>
                  </div>
                  <pre className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-blue-400 text-[10px] overflow-x-auto select-text font-mono">
                    {CODE_EXAMPLES.python}
                  </pre>
                </div>
              </div>
            </div>

            {/* SDK download files */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-4 font-mono text-xs">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">Developer Downloads</span>
                <div className="space-y-2">
                  {[
                    { name: '@healthos/sdk-typescript-v2.1.tgz', size: '142 KB', downloads: '1.4k' },
                    { name: 'healthos-python-sdk-v1.4.tar.gz', size: '92 KB', downloads: '840' },
                    { name: 'healthos-java-bridge-v0.8-alpha.jar', size: '2.4 MB', downloads: '120' }
                  ].map((sdk, i) => (
                    <div key={i} className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="text-white font-bold text-[11px] truncate max-w-[170px]">{sdk.name}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{sdk.size} • {sdk.downloads} pulls</p>
                      </div>
                      <button 
                        onClick={() => triggerToast(`Downloading ${sdk.name} to local system.`)}
                        className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
                      >
                        ↓
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* LATENCY MONITORING AREA CHARTS */}
      <div className="p-5 rounded-3xl bg-zinc-900/30 border border-zinc-900 space-y-4">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">REST API Network Volume & Latency Trace</h4>
          <p className="text-[10px] text-zinc-500 font-mono">Real-time health telemetry from API gateway load balancer.</p>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={LATENCY_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1c1c20" strokeDasharray="3 3" />
              <XAxis dataKey="hour" stroke="#52525b" style={{ fontSize: '10px' }} />
              <YAxis stroke="#52525b" style={{ fontSize: '10px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: '11px' }} />
              <Area type="monotone" dataKey="latency" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#latencyGrad)" name="Gateway Latency (ms)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
