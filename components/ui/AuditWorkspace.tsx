'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Activity,
  FileText,
  CheckSquare,
  Users,
  Lock,
  Download,
  Search,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  ExternalLink,
  Sliders
} from 'lucide-react';

// --- MOCK COMPLIANCE / AUDIT LOGS ---
const INITIAL_LOGS = [
  { id: 'log-1', category: 'Security Event', desc: 'Secure WebRTC TLS handshake established for patient Clara Oswald.', operator: 'Dr. Ahmed', ip: '192.168.1.14', time: '10:12 AM', code: 'SEC-204' },
  { id: 'log-2', category: 'Patient Access Log', desc: 'EHR Dental Implant CBCT scan downloaded from central storage node.', operator: 'Dr. Sarah Jenkins', ip: '192.168.1.18', time: '09:45 AM', code: 'PAT-402' },
  { id: 'log-3', category: 'Record Changes', desc: 'Patient Arthur Pendragon tooth-specific surgical guide status updated to [Milled-Sintered].', operator: 'Lab Tech Barton', ip: '10.0.4.82', time: '08:15 AM', code: 'EHR-109' },
  { id: 'log-4', category: 'Export Logs', desc: 'Billing pre-authorization medical charts bundle exported as AES-256 ZIP file.', operator: 'Billing Admin Jenkins', ip: '192.168.1.9', time: 'Yesterday, 04:30 PM', code: 'EXP-901' },
  { id: 'log-5', category: 'Security Event', desc: 'Exocad API token verified successfully from node #CAD-4.', operator: 'System Gateway', ip: 'localhost', time: 'Yesterday, 12:00 PM', code: 'SEC-101' },
  { id: 'log-6', category: 'Patient Access Log', desc: 'HIPAA consent form digitial signature verified for patient Arthur.', operator: 'Arthur Pendragon', ip: '172.56.2.14', time: '2 days ago', code: 'PAT-114' }
];

const HIPAA_CHECKLIST = [
  { id: 'hip-1', task: 'AES-256 Encrypted Storage at Rest', checked: true, tag: 'Technical Safeguard' },
  { id: 'hip-2', task: 'WebRTC Secure TLS Peer-to-Peer Tunneling', checked: true, tag: 'Transmission Security' },
  { id: 'hip-3', task: 'EHR Record Modification Logging & Immutable Audits', checked: true, tag: 'Integrity Audit Control' },
  { id: 'hip-4', task: 'Automatic Inactivity Session Logout (15 mins)', checked: false, tag: 'Access Control' },
  { id: 'hip-5', task: 'Tenant Isolation Cryptographic Partitioning', checked: true, tag: 'Administrative Safeguard' }
];

const GDPR_CHECKLIST = [
  { id: 'gdpr-1', task: 'Right to Rectification & Patient Deletion', checked: true, tag: 'Patient Rights' },
  { id: 'gdpr-2', task: 'Strict Multi-tenant Isolation Architecture', checked: true, tag: 'Data Protection' },
  { id: 'gdpr-3', task: 'Documented Consent Forms Repository', checked: true, tag: 'Lawfulness of Processing' },
  { id: 'gdpr-4', task: 'Automatic breach event dispatch triggers', checked: false, tag: 'Accountability' }
];

const TENANT_USERS = [
  { id: 'usr-1', name: 'Dr. Ahmed', role: 'Chief Restorative Officer', status: 'Verified', ip: '192.168.1.14', lastLogin: 'Today, 10:12 AM' },
  { id: 'usr-2', name: 'Dr. Sarah Jenkins', role: 'Periodontal Specialist', status: 'Verified', ip: '192.168.1.18', lastLogin: 'Today, 09:45 AM' },
  { id: 'usr-3', name: 'Lab Tech Barton', role: 'Lab Coordinator', status: 'Verified', ip: '10.0.4.82', lastLogin: 'Today, 08:15 AM' },
  { id: 'usr-4', name: 'Billing Admin Jenkins', role: 'Finance Executive', status: 'Pending Review', ip: '192.168.1.9', lastLogin: 'Yesterday, 04:30 PM' }
];

export default function AuditWorkspace() {
  const [activeTab, setActiveTab] = useState<'logs' | 'checklist' | 'users'>('logs');
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [selectedCategory, setSelectedCategory] = useState('All Audit Logs');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Checklist states
  const [hipaa, setHipaa] = useState(HIPAA_CHECKLIST);
  const [gdpr, setGdpr] = useState(GDPR_CHECKLIST);
  
  // Tenant user review state
  const [users, setUsers] = useState(TENANT_USERS);

  // Success notifications toast
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Checkbox toggle HIPAA
  const toggleHipaaItem = (id: string) => {
    setHipaa(prev => prev.map(item => {
      if (item.id === id) {
        const nextChecked = !item.checked;
        triggerToast(`HIPAA Safeguard checklist updated.`);
        return { ...item, checked: nextChecked };
      }
      return item;
    }));
  };

  // Checkbox toggle GDPR
  const toggleGdprItem = (id: string) => {
    setGdpr(prev => prev.map(item => {
      if (item.id === id) {
        const nextChecked = !item.checked;
        triggerToast(`GDPR safeguard checklist updated.`);
        return { ...item, checked: nextChecked };
      }
      return item;
    }));
  };

  // Revoke / Verify user access
  const handleToggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'Verified' ? 'Suspended' : 'Verified';
        triggerToast(`User ${u.name} status updated to ${nextStatus}. Access tokens revoked.`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  // Generate compliance report
  const handleGenerateReport = (framework: string) => {
    triggerToast(`Assembling comprehensive encrypted PDF compliance log package for ${framework}...`);
    setTimeout(() => {
      triggerToast(`${framework} compliance report successfully generated and saved to DMS folder.`);
    }, 2000);
  };

  // Filtering audit logs
  const filteredLogs = useMemo(() => {
    return logs.filter(lg => {
      const matchSearch = lg.desc.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          lg.operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lg.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'All Audit Logs' || lg.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [logs, searchQuery, selectedCategory]);

  // Calculations for HIPAA compliance score
  const complianceScore = useMemo(() => {
    const hipaaChecked = hipaa.filter(h => h.checked).length;
    const gdprChecked = gdpr.filter(g => g.checked).length;
    const total = hipaa.length + gdpr.length;
    const checked = hipaaChecked + gdprChecked;
    return Math.round((checked / total) * 100);
  }, [hipaa, gdpr]);

  return (
    <div className="space-y-6 text-zinc-100 animate-fade-in relative max-w-[1600px] mx-auto">
      
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-mono text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-500/30">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* COMPLIANCE INDEX OVERALL INDICATOR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <div className="md:col-span-1 p-5 rounded-3xl bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-900 space-y-4 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
          
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-widest block">Overall Audit Status</span>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">Platform Integrity</h3>
          </div>

          <div className="flex items-baseline gap-3 relative z-10">
            <span className="text-4xl font-bold text-white font-mono">{complianceScore}%</span>
            <span className="text-xs font-mono text-emerald-400">Compliance Index</span>
          </div>

          <p className="text-[11px] text-zinc-400 font-sans z-10">
            Audit index calculated from checked technical and structural controls. All nodes are isolated.
          </p>
        </div>

        <div className="md:col-span-2 p-5 rounded-3xl bg-zinc-900/40 border border-zinc-900 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Authorized Tenant Sessions', value: users.filter(u => u.status === 'Verified').length, icon: Users, color: 'text-blue-400', desc: 'Secure, verified accounts with active clinical scope.' },
            { label: 'Active Encryption Clusters', value: '4/4', icon: ShieldCheck, color: 'text-emerald-400', desc: 'All storage partitions, files, and channels encrypted with AES-256 TLS.' }
          ].map((stat, idx) => (
            <div key={idx} className="p-4 bg-zinc-950/60 border border-zinc-850 rounded-2xl flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">{stat.label}</span>
                  <span className="text-lg font-bold text-white font-mono">{stat.value}</span>
                </div>
                <div className={`p-2 rounded-xl bg-zinc-900 ${stat.color}`}>
                  <stat.icon className="w-4.5 h-4.5" />
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FILTER & CONTROL PANEL */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-3xl border border-zinc-900">
        <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-950 rounded-2xl border border-zinc-850">
          {[
            { id: 'logs', label: '1. Immutable Security Logs', icon: Activity },
            { id: 'checklist', label: '2. HIPAA & GDPR Checklists', icon: CheckSquare },
            { id: 'users', label: '3. Identity Access Reviews', icon: Users }
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

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleGenerateReport('HIPAA v2026')}
            className="px-3.5 py-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-zinc-300 font-mono text-xs flex items-center gap-1.5 rounded-xl cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Export Compliance PDF
          </button>
        </div>
      </div>

      {/* RENDERING SECTIONS */}
      {activeTab === 'logs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch font-mono text-xs">
          
          {/* Logs search & filters - 3 Columns */}
          <div className="lg:col-span-3 bg-zinc-900/30 border border-zinc-900 rounded-3xl p-5 space-y-4 flex flex-col justify-start">
            <span className="text-xs font-bold text-white uppercase tracking-wider block border-b border-zinc-900 pb-2">
              Log Filtering Node
            </span>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search codes, operators..."
                className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-850 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              {[
                'All Audit Logs',
                'Security Event',
                'Patient Access Log',
                'Record Changes',
                'Export Logs'
              ].map(cat => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left p-2.5 rounded-xl border text-[11px] font-bold font-mono transition-all block ${
                      isSelected 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-zinc-950/20 border-transparent text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Immutable logs list - 9 Columns */}
          <div className="lg:col-span-9 bg-zinc-900/20 border border-zinc-900 rounded-3xl p-5 space-y-4 flex flex-col justify-start">
            <span className="text-xs font-bold text-white uppercase tracking-wider block border-b border-zinc-900 pb-2">
              Encrypted Audit Stream Trail
            </span>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredLogs.map(lg => (
                <div key={lg.id} className="p-3.5 bg-zinc-950 border border-zinc-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold text-white uppercase bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                        {lg.code}
                      </span>
                      <span className="text-[9px] text-zinc-500">{lg.category}</span>
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{lg.desc}</p>
                    
                    <div className="flex items-center gap-4 text-[10px] text-zinc-500">
                      <span>Operator: <strong className="text-zinc-300 font-sans">{lg.operator}</strong></span>
                      <span>IP Address: <strong className="text-zinc-300">{lg.ip}</strong></span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500">{lg.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'checklist' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch font-mono text-xs">
          
          {/* HIPAA */}
          <div className="p-5 rounded-3xl bg-zinc-900/30 border border-zinc-900 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">HIPAA Audit Control Framework</span>
              <button 
                onClick={() => handleGenerateReport('HIPAA Core Safeguard')}
                className="text-[10px] font-bold text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded"
              >
                Sign Off HIPAA Framework
              </button>
            </div>

            <div className="space-y-2">
              {hipaa.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => toggleHipaaItem(item.id)}
                  className="p-3 bg-zinc-950 border border-zinc-850 rounded-2xl flex items-center justify-between gap-4 cursor-pointer hover:border-zinc-800 transition-colors"
                >
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-500 font-black uppercase block">{item.tag}</span>
                    <h5 className="text-[11px] text-zinc-300 font-sans">{item.task}</h5>
                  </div>

                  <span className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                    item.checked ? 'bg-emerald-500 text-zinc-950 border-emerald-400' : 'border-zinc-850 bg-transparent'
                  }`}>
                    {item.checked && <CheckSquare className="w-3.5 h-3.5 stroke-[3]" />}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* GDPR */}
          <div className="p-5 rounded-3xl bg-zinc-900/30 border border-zinc-900 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">GDPR Compliance Framework</span>
              <button 
                onClick={() => handleGenerateReport('GDPR Framework')}
                className="text-[10px] font-bold text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded"
              >
                Sign Off GDPR Framework
              </button>
            </div>

            <div className="space-y-2">
              {gdpr.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => toggleGdprItem(item.id)}
                  className="p-3 bg-zinc-950 border border-zinc-850 rounded-2xl flex items-center justify-between gap-4 cursor-pointer hover:border-zinc-800 transition-colors"
                >
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-500 font-black uppercase block">{item.tag}</span>
                    <h5 className="text-[11px] text-zinc-300 font-sans">{item.task}</h5>
                  </div>

                  <span className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                    item.checked ? 'bg-emerald-500 text-zinc-950 border-emerald-400' : 'border-zinc-850 bg-transparent'
                  }`}>
                    {item.checked && <CheckSquare className="w-3.5 h-3.5 stroke-[3]" />}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'users' && (
        <div className="p-5 bg-zinc-900/30 border border-zinc-900 rounded-3xl space-y-5 font-mono text-xs">
          <span className="text-xs font-bold text-white uppercase tracking-wider block border-b border-zinc-900 pb-2">
            Active Tenant User Identity Authorization Logs
          </span>

          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">{u.name}</h4>
                  <p className="text-[10px] text-zinc-500">System Role: <strong className="text-zinc-300 font-sans">{u.role}</strong> • IP Limit: {u.ip}</p>
                  <p className="text-[10px] text-zinc-500">Last Cryptographic Session: {u.lastLogin}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded font-black ${
                    u.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {u.status}
                  </span>

                  <button 
                    onClick={() => handleToggleUserStatus(u.id)}
                    className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold rounded-xl text-[10px]"
                  >
                    {u.status === 'Verified' ? 'Revoke Tokens' : 'Authorize User'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
