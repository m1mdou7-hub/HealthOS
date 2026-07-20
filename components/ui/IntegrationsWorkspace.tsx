'use client';

import React, { useState, useMemo } from 'react';
import {
  Blocks,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Settings2,
  RefreshCw,
  Cpu,
  Globe,
  Database,
  Lock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Check,
  Building,
  Radio,
  FileText
} from 'lucide-react';

// --- MOCK INTEGRATIONS DATASET ---
const INITIAL_INTEGRATIONS = [
  {
    id: 'int-01',
    name: 'Epic Systems EHR Sync',
    description: 'Bilateral FHIR-compliant patient chart, medical history, and procedural record replication.',
    category: 'Clinical',
    status: 'Connected',
    logoColor: 'from-sky-500 to-indigo-600',
    apiUrl: 'https://fhir.epic.org/v2/endpoint',
    apiKey: 'sk_epic_••••••••••••••••3a9b',
    syncLogs: 'Last synced: 4 mins ago • 142 records synced'
  },
  {
    id: 'int-02',
    name: 'Dexis Digital Imaging Cloud',
    description: 'Auto-ingest high-resolution dental X-rays, intraoral scans, and CBCT imaging packages.',
    category: 'Imaging',
    status: 'Connected',
    logoColor: 'from-amber-500 to-orange-600',
    apiUrl: 'https://imaging.dexisapi.com/v1',
    apiKey: 'sk_dex_••••••••••••••••f821',
    syncLogs: 'Last synced: 1 hour ago • 12 scans imported'
  },
  {
    id: 'int-03',
    name: 'Twilio Client Outbox',
    description: 'Core gateway dispatching patient appointment reminders, clinical confirmations, and SMS channels.',
    category: 'Communications',
    status: 'Connected',
    logoColor: 'from-red-500 to-rose-600',
    apiUrl: 'https://api.twilio.com/2010-04-01',
    apiKey: 'sk_twi_••••••••••••••••721a',
    syncLogs: 'Last synced: Just now • 8 outbound SMS queued'
  },
  {
    id: 'int-04',
    name: 'Stripe Terminal & Billing',
    description: 'Process physical in-clinic card swipes and automate client subscription invoicing cycles.',
    category: 'Business',
    status: 'Disconnected',
    logoColor: 'from-indigo-500 to-purple-600',
    apiUrl: 'https://api.stripe.com/v3',
    apiKey: '',
    syncLogs: 'Connection inactive • Setup required'
  },
  {
    id: 'int-05',
    name: 'Google Calendar Enterprise',
    description: 'Sync clinical operator hours, clinic holidays, and surgeon chairs directly to external calendars.',
    category: 'Business',
    status: 'Connected',
    logoColor: 'from-blue-500 to-emerald-500',
    apiUrl: 'https://www.googleapis.com/calendar/v3',
    apiKey: 'sk_gcal_••••••••••••••••e19c',
    syncLogs: 'Last synced: 12 mins ago • Calendar in-sync'
  },
  {
    id: 'int-06',
    name: 'Formlabs Dental 3D Suite',
    description: 'Wireless calibration feed, print completion reports, and surgical guide fabrication triggers.',
    category: 'Hardware',
    status: 'Disconnected',
    logoColor: 'from-zinc-600 to-zinc-900',
    apiUrl: 'https://iot.formlabs.dental/v2',
    apiKey: '',
    syncLogs: 'Hardware pairing requested'
  },
  {
    id: 'int-07',
    name: 'Surescripts e-Prescription',
    description: 'Electronic prescribing portal directly communicating with local pharmacy fulfillment networks.',
    category: 'Clinical',
    status: 'Disconnected',
    logoColor: 'from-teal-500 to-emerald-600',
    apiUrl: 'https://api.surescripts.net/v1',
    apiKey: '',
    syncLogs: 'Credential verification pending'
  }
];

const CATEGORIES = ['All Categories', 'Clinical', 'Imaging', 'Communications', 'Business', 'Hardware'];

export default function IntegrationsWorkspace() {
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS);
  const [selectedCat, setSelectedCat] = useState('All Categories');
  const [searchText, setSearchText] = useState('');
  
  // Configuration drawer / modal state
  const [configuringItem, setConfiguringItem] = useState<typeof INITIAL_INTEGRATIONS[0] | null>(null);
  const [tempApiUrl, setTempApiUrl] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [tempWebhookUrl, setTempWebhookUrl] = useState('https://healthos.io/api/v1/webhooks/epic');

  // Success notifications toast
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Filter logic
  const filteredIntegrations = useMemo(() => {
    return integrations.filter(item => {
      const matchCat = selectedCat === 'All Categories' || item.category === selectedCat;
      const matchText = item.name.toLowerCase().includes(searchText.toLowerCase()) || 
                        item.description.toLowerCase().includes(searchText.toLowerCase());
      return matchCat && matchText;
    });
  }, [integrations, selectedCat, searchText]);

  // Toggle quick connection status
  const handleToggleStatus = (id: string) => {
    setIntegrations(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'Connected' ? 'Disconnected' : 'Connected';
        const log = nextStatus === 'Connected' ? 'Connection established • API health check passed' : 'Connection inactive';
        triggerToast(`${item.name} is now ${nextStatus}.`);
        return {
          ...item,
          status: nextStatus,
          syncLogs: log
        };
      }
      return item;
    }));
  };

  // Open config drawer
  const handleOpenConfig = (item: typeof INITIAL_INTEGRATIONS[0]) => {
    setConfiguringItem(item);
    setTempApiUrl(item.apiUrl || '');
    setTempApiKey(item.apiKey || '');
    setTempWebhookUrl(`https://healthos.io/api/v1/webhooks/${item.id}`);
  };

  // Save configuration parameters
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configuringItem) return;

    setIntegrations(prev => prev.map(item => {
      if (item.id === configuringItem.id) {
        return {
          ...item,
          apiUrl: tempApiUrl,
          apiKey: tempApiKey ? 'sk_usr_••••••••••••••••' + tempApiKey.substring(Math.max(0, tempApiKey.length - 4)) : '',
          status: tempApiUrl && tempApiKey ? 'Connected' : 'Disconnected',
          syncLogs: 'Configuration manual update • Gateway verified.'
        };
      }
      return item;
    }));

    const name = configuringItem.name;
    setConfiguringItem(null);
    triggerToast(`Integration rules saved for ${name}. Endpoint refreshed.`);
  };

  return (
    <div className="space-y-6 text-zinc-100 animate-fade-in relative">
      
      {/* Toast alert */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-mono text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-500 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* TOP FILTERS & SEARCH ROW */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-3xl border border-zinc-900">
        
        {/* Horizontal Category Pill selector */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-950 rounded-2xl border border-zinc-850">
          {CATEGORIES.map(cat => {
            const isSel = selectedCat === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                  isSel ? 'bg-blue-600 text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search input bar */}
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search API connectors..."
            className="w-full bg-zinc-950 border border-zinc-850 pl-10 pr-4 py-2 text-xs rounded-xl outline-none focus:border-blue-500 text-white transition-all font-mono"
          />
        </div>
      </div>

      {/* INTEGRATIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredIntegrations.map(item => {
          const isConn = item.status === 'Connected';
          return (
            <div 
              key={item.id} 
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between h-[230px] relative overflow-hidden group ${
                isConn ? 'bg-zinc-900/30 border-zinc-900' : 'bg-zinc-950/20 border-zinc-950 opacity-70 hover:opacity-90'
              }`}
            >
              <div className="space-y-3.5">
                
                {/* Header title & Logo */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.logoColor} flex items-center justify-center text-white font-mono font-black text-xs uppercase shadow`}>
                      {item.name.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">{item.name}</h4>
                      <span className="text-[9px] font-mono uppercase text-zinc-500 font-extrabold tracking-widest">{item.category}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(item.id)}
                    className={`text-[10px] font-mono px-2 py-1 rounded-md border font-black transition-all cursor-pointer ${
                      isConn 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20' 
                        : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:bg-blue-600/10 hover:text-blue-400 hover:border-blue-600/20'
                    }`}
                  >
                    {isConn ? 'ACTIVE' : 'CONNECT'}
                  </button>
                </div>

                {/* Description */}
                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans min-h-[50px]">{item.description}</p>
              </div>

              {/* Footer status logs & actions */}
              <div className="pt-3 border-t border-zinc-900/60 flex items-center justify-between mt-4">
                <span className="text-[9px] font-mono text-zinc-500 flex items-center gap-1">
                  <Radio className={`w-3 h-3 ${isConn ? 'text-emerald-400 animate-pulse' : 'text-zinc-600'}`} />
                  {item.syncLogs}
                </span>

                <button
                  onClick={() => handleOpenConfig(item)}
                  className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all border border-transparent hover:border-zinc-800 cursor-pointer"
                  title="Configure Parameters"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* RECENT WEBHOOK PAYLOADS LOG */}
      <div className="p-5 rounded-3xl bg-zinc-900/30 border border-zinc-900 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Incoming API Gateway Live-Stream</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Channel: REST Webhooks</span>
        </div>

        <div className="space-y-2.5 font-mono text-[11px]">
          {[
            { id: 'pay-01', method: 'POST', endpoint: '/webhooks/dexis', status: '200 OK', desc: 'Received high-resolution radiographic dental scan payload', size: '4.2 MB', duration: '142ms' },
            { id: 'pay-02', method: 'POST', endpoint: '/webhooks/epic', status: '200 OK', desc: 'FHIR bundle received: update treatment clearance for patient Patterson', size: '24 KB', duration: '48ms' },
            { id: 'pay-03', method: 'GET', endpoint: '/webhooks/twilio', status: '404 NF', desc: 'Incoming SMS response callback retry loop', size: '1.2 KB', duration: '8ms' }
          ].map(pay => (
            <div key={pay.id} className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                  pay.method === 'POST' ? 'bg-blue-500/10 text-blue-400' : 'bg-zinc-800 text-zinc-400'
                }`}>{pay.method}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-bold">{pay.endpoint}</span>
                    <span className={`text-[9px] font-black ${pay.status.startsWith('200') ? 'text-emerald-400' : 'text-rose-400'}`}>{pay.status}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-sans mt-0.5">{pay.desc}</p>
                </div>
              </div>

              <div className="text-right text-[10px] text-zinc-500">
                <span>{pay.size}</span>
                <span className="block text-[9px]">{pay.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CONFIGURATION DRAWER BACKDROP & COMPONENT */}
      {configuringItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-950 rounded-3xl border border-zinc-850 p-6 space-y-4 animate-scale-in">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Blocks className="w-5 h-5 text-blue-400" />
                <h4 className="text-sm font-extrabold text-white">Configure: {configuringItem.name}</h4>
              </div>
              <button 
                onClick={() => setConfiguringItem(null)}
                className="text-zinc-500 hover:text-white transition-all cursor-pointer font-bold font-mono text-xs"
              >
                CLOSE [X]
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4 font-mono text-xs">
              
              <div className="space-y-1">
                <label className="text-zinc-500 block">External Target Endpoint API URL</label>
                <input 
                  type="text" 
                  value={tempApiUrl}
                  onChange={(e) => setTempApiUrl(e.target.value)}
                  placeholder="https://api.yourdomain.com/v1"
                  className="w-full bg-zinc-900 border border-zinc-800 p-2.5 text-white outline-none rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500 block">Bearer Token or API Private Key</label>
                <input 
                  type="password" 
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="Paste sk_live_••••••••••••••"
                  className="w-full bg-zinc-900 border border-zinc-800 p-2.5 text-white outline-none rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500 block">HealthOS Static Webhook URL Target</label>
                <input 
                  type="text" 
                  value={tempWebhookUrl}
                  readOnly
                  className="w-full bg-zinc-900/40 border border-zinc-800 p-2.5 text-zinc-500 select-all outline-none rounded-xl"
                />
                <span className="text-[9px] text-zinc-600">This URL receives events forwarded directly from {configuringItem.name}.</span>
              </div>

              <div className="p-3 bg-blue-950/20 border border-blue-900/20 rounded-xl flex gap-2.5">
                <Lock className="w-4 h-4 shrink-0 text-blue-400" />
                <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                  Keys are symmetrically encrypted prior to storage in standard server environment vaults. No plain-text keys are stored on physical disk logs.
                </p>
              </div>

              <div className="flex gap-2.5">
                <button 
                  type="button"
                  onClick={() => setConfiguringItem(null)}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 py-2.5 rounded-xl font-bold cursor-pointer transition-colors text-center"
                >
                  Discard Changes
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-black py-2.5 rounded-xl font-bold cursor-pointer transition-colors text-center"
                >
                  Verify & Bind Endpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
