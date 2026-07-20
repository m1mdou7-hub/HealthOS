'use client';

import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  BookOpen,
  Play,
  LifeBuoy,
  Activity,
  FileText,
  Plus,
  Search,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
  Sliders,
  ChevronRight,
  ExternalLink,
  Info
} from 'lucide-react';

// --- MOCK HELP CENTER ARTICLES ---
const KNOWLEDGE_ARTICLES = [
  { id: 'art-1', title: 'Importing DICOM Datasets to Exocad', category: 'CAD/CAM & Lab', views: 345, duration: '4 min read', desc: 'Step-by-step instructions for exporting structural dental scans from CBCT imaging centers into Exocad aligned files.' },
  { id: 'art-2', title: 'Sintering Multi-layered Zirconia Crowns', category: 'CAD/CAM & Lab', views: 512, duration: '6 min read', desc: 'Calibrating furnace temperature curves (Sintram) to preserve translucent gradient parameters of multi-layered restorations.' },
  { id: 'art-3', title: 'HIPAA-compliant Video Tele-dentistry Configuration', category: 'IT & Security', views: 189, duration: '3 min read', desc: 'Enabling camera permissions, secure peer-to-peer WebRTC tunneling, and logging automated notes directly inside EHR charts.' },
  { id: 'art-4', title: 'Filing Pre-Authorizations with Aetna & MetLife', category: 'Billing & Insurance', views: 423, duration: '5 min read', desc: 'How to attach tooth-specific anatomical charts, medical necessity statements, and x-ray DICOM slices to speed up pre-authorizations.' },
  { id: 'art-5', title: 'Configuring Automatic Twilio Patient Recall Triggers', category: 'Automations', views: 271, duration: '4 min read', desc: 'Drafting custom SMS template flows with shortcodes to remind active implant candidates of their upcoming crowns fittings.' }
];

const TUTORIAL_VIDEOS = [
  { id: 'vid-1', title: 'Fast-track Exocad Alignments Tutorial', duration: '12:45', author: 'Dr. Sarah Jenkins', category: 'Video Library', views: '1.2k views' },
  { id: 'vid-2', title: 'SprintRay 3D Printer Slicing Optimization', duration: '08:30', author: 'Lab Tech Barton', category: 'Video Library', views: '984 views' }
];

const RECENT_TICKETS = [
  { id: 'tkt-1', title: 'Milling furnace furnace temperature curve drift', status: 'In-Progress', category: 'Hardware Help', created: 'Yesterday, 04:00 PM', ticketId: '#HLP-8290' },
  { id: 'tkt-2', title: 'Exocad license token verification timeout', status: 'Resolved', category: 'Licensing', created: '2 days ago', ticketId: '#HLP-8105' }
];

const SYSTEM_STATUS = [
  { node: 'EHR Database Cloud SQL', latency: '4ms', status: 'Healthy' },
  { node: 'WebRTC Secure Video Turn Server', latency: '18ms', status: 'Healthy' },
  { node: 'Exocad CAD/CAM Core Engine API', latency: '45ms', status: 'Healthy' },
  { node: 'Twilio & WhatsApp Gateways', latency: '120ms', status: 'Healthy' }
];

export default function HelpWorkspace() {
  const [activeTab, setActiveTab] = useState<'kb' | 'tickets' | 'status' | 'whatsnew'>('kb');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Ticket creation form
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Hardware Help');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketsList, setTicketsList] = useState(RECENT_TICKETS);

  // Success notifications toast
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Search filter
  const filteredArticles = useMemo(() => {
    return KNOWLEDGE_ARTICLES.filter(art => {
      return art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             art.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
             art.category.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [searchQuery]);

  // Handle submit ticket
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle.trim()) return;

    const newTkt = {
      id: `tkt-${Date.now()}`,
      title: ticketTitle,
      status: 'Open',
      category: ticketCategory,
      created: 'Just now',
      ticketId: `#HLP-${Math.floor(1000 + Math.random() * 9000)}`
    };

    setTicketsList([newTkt, ...ticketsList]);
    setTicketTitle('');
    setTicketDesc('');
    triggerToast(`Support ticket ${newTkt.ticketId} opened successfully. SLA response < 2h.`);
  };

  return (
    <div className="space-y-6 text-zinc-100 animate-fade-in relative max-w-[1600px] mx-auto">
      
      {/* Toast Warning */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-mono text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-500/30">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* SEARCH HEADER BAR */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-zinc-950 to-zinc-900 border border-zinc-900 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />
        
        <div className="space-y-1 relative z-10">
          <h3 className="text-base font-bold text-white tracking-wide uppercase font-mono flex items-center gap-2">
            <LifeBuoy className="w-4 h-4 text-emerald-400" />
            <span>HealthOS System Knowledge & Assistance Node</span>
          </h3>
          <p className="text-xs text-zinc-400 max-w-xl font-sans">
            Find immediate diagnostic tutorials, calibrate hardware nodes, file engineering support tickets, and review current cluster performance.
          </p>
        </div>

        <div className="relative w-full md:w-96 z-10">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tutorials, FAQs, and guides..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono rounded-xl"
          />
        </div>
      </div>

      {/* FILTER & VIEW SWAP CONTROLS */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-950 rounded-2xl border border-zinc-850 w-max">
        {[
          { id: 'kb', label: '1. Knowledge Base & FAQs', icon: BookOpen },
          { id: 'tickets', label: '2. Support Tickets', icon: FileText },
          { id: 'status', label: '3. System Node Status', icon: Activity },
          { id: 'whatsnew', label: '4. What’s New & Release Notes', icon: Sparkles }
        ].map(t => {
          const Icon = t.icon;
          const isSel = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
                isSel ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* RENDERING SECTIONS */}
      {activeTab === 'kb' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Articles list - 8 Columns */}
          <div className="lg:col-span-8 bg-zinc-900/20 border border-zinc-900 rounded-3xl p-5 space-y-4">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono block border-b border-zinc-900 pb-2">
              Featured Clinical Walkthroughs
            </span>

            <div className="space-y-4">
              {filteredArticles.map(art => (
                <div key={art.id} className="p-4 bg-zinc-950/40 border border-zinc-900 hover:border-zinc-800 rounded-2xl space-y-2 transition-all group">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {art.category}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">{art.duration} • {art.views} views</span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug">
                    {art.title}
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">{art.desc}</p>
                  
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono pt-1">
                    <span>EHR Manual v2026.3</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video Library Tutorials - 4 Columns */}
          <div className="lg:col-span-4 bg-zinc-900/30 border border-zinc-900 rounded-3xl p-5 space-y-4">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono block border-b border-zinc-900 pb-2">
              Video Tutorial Library
            </span>

            <div className="space-y-3.5">
              {TUTORIAL_VIDEOS.map(vid => (
                <div key={vid.id} className="p-3 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-3 relative overflow-hidden group">
                  {/* Aspect Ratio Screen mockup */}
                  <div className="h-32 rounded-xl bg-zinc-900 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent opacity-80" />
                    <button 
                      onClick={() => triggerToast(`Streaming video lecture "${vid.title}"`)}
                      className="w-10 h-10 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center font-black cursor-pointer group-hover:scale-110 transition-transform relative z-10"
                    >
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </button>
                    <span className="absolute bottom-2 right-2 text-[9px] font-mono bg-zinc-950/80 px-1.5 py-0.5 rounded text-zinc-400">
                      {vid.duration}
                    </span>
                  </div>

                  <div className="space-y-1 font-mono text-xs">
                    <h5 className="font-bold text-white text-[11px] leading-snug">{vid.title}</h5>
                    <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                      <span>Lecturer: {vid.author}</span>
                      <span>{vid.views}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-mono text-xs">
          
          {/* Support form - 5 Columns */}
          <div className="lg:col-span-5 p-5 rounded-3xl bg-zinc-900/30 border border-zinc-900 space-y-4">
            <span className="text-xs font-bold text-white uppercase tracking-wider block border-b border-zinc-900 pb-2">
              File Engineering Incident Report
            </span>

            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="space-y-1">
                <label className="text-zinc-500">Incident Category</label>
                <select 
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl text-white outline-none"
                >
                  <option>Hardware Help</option>
                  <option>EHR Database Sync</option>
                  <option>Licensing Token</option>
                  <option>Secure Auth Gateway</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500">Short Incident Description</label>
                <input 
                  type="text"
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  placeholder="e.g. Sintering furnace high-temp threshold deviation"
                  className="w-full bg-zinc-950 border border-zinc-850 p-2.5 text-white outline-none focus:border-emerald-500 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500">Full Details & Debug Slices</label>
                <textarea 
                  rows={4}
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  placeholder="Paste terminal log dumps, diagnostic indices, machine IP address, or patient context."
                  className="w-full bg-zinc-950 border border-zinc-850 p-3 rounded-xl text-white outline-none focus:border-emerald-500"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 py-2.5 rounded-xl text-center font-bold font-mono transition-all cursor-pointer"
              >
                Dispatch Ticket to SLA Engineering Queue
              </button>
            </form>
          </div>

          {/* Recent tickets list - 7 Columns */}
          <div className="lg:col-span-7 p-5 rounded-3xl bg-zinc-900/20 border border-zinc-900 space-y-4">
            <span className="text-xs font-bold text-white uppercase tracking-wider block border-b border-zinc-900 pb-2">
              Recent SLA Support Tickets
            </span>

            <div className="space-y-3">
              {ticketsList.map(t => (
                <div key={t.id} className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{t.ticketId}</span>
                      <span className="text-[10px] text-zinc-500">• {t.category}</span>
                    </div>
                    <p className="text-xs text-zinc-400 font-sans leading-relaxed">{t.title}</p>
                    <span className="text-[10px] text-zinc-500 block">Created: {t.created}</span>
                  </div>

                  <div className="text-right">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded font-black ${
                      t.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'status' && (
        <div className="p-5 bg-zinc-900/30 border border-zinc-900 rounded-3xl space-y-5 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">HealthOS Platform telemetry Clusters</h3>
              <p className="text-[10px] text-zinc-500">Live heartbeat pings from HIPAA safe-nodes.</p>
            </div>
            <button 
              onClick={() => triggerToast('Checking cluster heartbeat endpoints...')}
              className="p-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 rounded-lg text-zinc-400 hover:text-white"
            >
              Refresh Heartbeats
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SYSTEM_STATUS.map(sys => (
              <div key={sys.node} className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-xs">{sys.node}</h4>
                  <p className="text-[10px] text-zinc-500">Secure AES TLS Channel • Gateway Latency: <strong className="text-zinc-300">{sys.latency}</strong></p>
                </div>

                <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {sys.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'whatsnew' && (
        <div className="p-5 bg-zinc-900/30 border border-zinc-900 rounded-3xl space-y-5 font-mono text-xs">
          <span className="text-xs font-bold text-white uppercase tracking-wider block border-b border-zinc-900 pb-2">
            Release Notes & What’s New
          </span>

          <div className="space-y-4">
            {[
              { version: 'v2026.3.0', date: 'July 12, 2026', title: 'Exocad Digital Articulator & DICOM multi-layered mapping', desc: 'Introduced automatic multi-point alignments for translucent dental crowns. Ingested tooth specific parameters from SprintRay printers directly into the local clinic records.' },
              { version: 'v2026.2.4', date: 'June 28, 2026', title: 'Twilio Patient Recall SMS Workflows', desc: 'Added conditional triggers and clinical SMS macros under active tracking. Fully integrated patient pre-authorization templates for major carriers.' }
            ].map(rel => (
              <div key={rel.version} className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-emerald-400">{rel.version} Update</h4>
                  <span className="text-[10px] text-zinc-500">{rel.date}</span>
                </div>
                <h5 className="font-bold text-white text-[13px]">{rel.title}</h5>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">{rel.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
