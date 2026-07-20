'use client';

import React, { useState, useMemo } from 'react';
import {
  Zap,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  GitCommit,
  Plus,
  Search,
  Filter,
  Check,
  Building,
  Activity,
  PlusCircle,
  Database,
  RefreshCw,
  Cpu,
  Mail,
  Smartphone,
  Sparkles,
  Blocks,
  FileText,
  User,
  GitFork
} from 'lucide-react';

// --- MOCK AUTOMATION WORKFLOWS ---
const INITIAL_WORKFLOWS = [
  {
    id: 'flow-01',
    name: 'High-Value Implant SMS Followup',
    description: 'Triggers Twilio message after any surgical implant treatment over $3,000.',
    trigger: 'Treatment Completed',
    condition: 'Treatment Type == "Surgical Implant" && Price >= $3,000',
    action: 'Dispatch SMS via Twilio ("Followup Care Bundle")',
    active: true,
    lastTriggered: '12 mins ago',
    runsCount: 142
  },
  {
    id: 'flow-02',
    name: 'Automatic Reagent Restock PO',
    description: 'Drafts procurement purchase order when SARS test reagent reserves fall below 100.',
    trigger: 'Inventory Draw',
    condition: 'SKU Category == "Lab Reagents" && StockCount <= 100',
    action: 'Generate Purchase Order with Supplier A',
    active: true,
    lastTriggered: '1 hour ago',
    runsCount: 38
  },
  {
    id: 'flow-03',
    name: 'Lab Prosthesis Delivery Alert',
    description: 'Emails coordinator immediately when dental crown try-ins are marked complete by Lab Director.',
    trigger: 'Lab Result Cleared',
    condition: 'Prosthesis Type == "Crown / Cap"',
    action: 'Send Email Notification ("Fit-Ready")',
    active: false,
    lastTriggered: '2 days ago',
    runsCount: 84
  },
  {
    id: 'flow-04',
    name: 'Unpaid Invoice Claims Aging Followup',
    description: 'Flags insurance carrier with warning flag if claim remains unpaid past 45 days.',
    trigger: 'Invoice Aging Clock',
    condition: 'Invoice Status == "Pending Insurance" && DaysOutstanding >= 45',
    action: 'Log Security Audit & Alert Billing Admin',
    active: true,
    lastTriggered: '6 hours ago',
    runsCount: 12
  }
];

const EXECUTION_LOGS_MOCK = [
  { id: 'run-101', name: 'High-Value Implant SMS Followup', timestamp: '2026-07-17 06:12:00', status: 'Succeeded', details: 'SMS dispatched to patient +1-505-•••-1422. Delivery confirmation received from Twilio.' },
  { id: 'run-102', name: 'Automatic Reagent Restock PO', timestamp: '2026-07-17 05:22:11', status: 'Succeeded', details: 'Reserves dropped to 92 items. Drafted PO-948 for 500 Reagents. Forwarded to Supplier A.' },
  { id: 'run-103', name: 'High-Value Implant SMS Followup', timestamp: '2026-07-17 04:14:55', status: 'Succeeded', details: 'SMS dispatched to patient +1-312-•••-9901. Delivery confirmation received from Twilio.' },
  { id: 'run-104', name: 'Unpaid Invoice Claims Aging Followup', timestamp: '2026-07-16 23:45:12', status: 'Failed', details: 'Error connecting to Surescripts API: Credential verification expired. Retrying in 15m.' }
];

const TRIGGERS = ['Treatment Completed', 'Inventory Draw', 'Lab Result Cleared', 'Invoice Aging Clock', 'Patient Scheduled'];
const CONDITIONS = [
  'Price >= $3,000',
  'StockCount <= 100',
  'Prosthesis Type == "Crown / Cap"',
  'DaysOutstanding >= 45',
  'Specialty == "Maxillofacial"'
];
const ACTIONS = [
  'Dispatch SMS via Twilio',
  'Generate Purchase Order with Supplier A',
  'Send Email Notification',
  'Log Security Audit & Alert Billing Admin',
  'Dispatch Slack Integration Alert'
];

export default function AutomationsWorkspace() {
  const [tab, setTab] = useState<'workflows' | 'logs'>('workflows');
  const [workflows, setWorkflows] = useState(INITIAL_WORKFLOWS);
  const [logs, setLogs] = useState(EXECUTION_LOGS_MOCK);
  const [searchQuery, setSearchQuery] = useState('');

  // Creation State
  const [newTitle, setNewTitle] = useState('Weekly Inventory Cleanup Alert');
  const [newDesc, setNewDesc] = useState('Triggers general diagnostic alerts when chemical vials or cold-storage stocks decline.');
  const [selectedTrigger, setSelectedTrigger] = useState(TRIGGERS[0]);
  const [selectedCondition, setSelectedCondition] = useState(CONDITIONS[0]);
  const [selectedAction, setSelectedAction] = useState(ACTIONS[0]);

  // Notifications Toast State
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Toggle active/inactive state
  const handleToggleActive = (id: string) => {
    setWorkflows(prev => prev.map(flow => {
      if (flow.id === id) {
        const nextState = !flow.active;
        triggerToast(`Workflow "${flow.name}" is now ${nextState ? 'enabled' : 'disabled'}.`);
        return { ...flow, active: nextState };
      }
      return flow;
    }));
  };

  // Create new Automation workflow
  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return alert('Please specify a title');

    const newFlow = {
      id: `flow-0${workflows.length + 1}`,
      name: newTitle,
      description: newDesc,
      trigger: selectedTrigger,
      condition: selectedCondition,
      action: selectedAction,
      active: true,
      lastTriggered: 'Never',
      runsCount: 0
    };

    setWorkflows([newFlow, ...workflows]);
    
    // Add a corresponding mock execution history entry immediately
    const newLog = {
      id: `run-10${logs.length + 1}`,
      name: newTitle,
      timestamp: new Date().toISOString().substring(0, 19).replace('T', ' '),
      status: 'Succeeded',
      details: `Flow initialized. Live cron hooked onto trigger [${selectedTrigger}]. Ready for events.`
    };
    setLogs([newLog, ...logs]);

    setNewTitle('');
    setNewDesc('');
    triggerToast(`Workflow "${newFlow.name}" created and bound to workspace.`);
  };

  // Filtered flows
  const filteredWorkflows = useMemo(() => {
    return workflows.filter(flow => 
      flow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flow.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [workflows, searchQuery]);

  return (
    <div className="space-y-6 text-zinc-100 animate-fade-in relative">
      
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-mono text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-500 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* HORIZONTAL WORKSPACE TABS */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-3xl border border-zinc-900">
        <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-950 rounded-2xl border border-zinc-850">
          {[
            { id: 'workflows', label: '1. Active Flow Automations', icon: Zap },
            { id: 'logs', label: '2. Cron Execution Logs', icon: Play }
          ].map(t => {
            const Icon = t.icon;
            const isSel = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
                  isSel ? 'bg-blue-600 text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Search flow */}
        {tab === 'workflows' && (
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workflows..."
              className="w-full bg-zinc-950 border border-zinc-850 pl-10 pr-4 py-2 text-xs rounded-xl outline-none focus:border-blue-500 text-white transition-all font-mono"
            />
          </div>
        )}
      </div>

      {/* RENDER ACTIVE LABELS */}
      {tab === 'workflows' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active Workflows column */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Loop workflows */}
            <div className="space-y-3">
              {filteredWorkflows.map(flow => (
                <div 
                  key={flow.id} 
                  className={`p-5 rounded-2xl border transition-all space-y-3.5 relative ${
                    flow.active ? 'bg-zinc-900/40 border-zinc-900' : 'bg-zinc-950/20 border-zinc-950/60 opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${flow.active ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
                        <h4 className="text-sm font-bold text-white">{flow.name}</h4>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">{flow.description}</p>
                    </div>

                    <button
                      onClick={() => handleToggleActive(flow.id)}
                      className={`text-[10px] font-mono px-2 py-1 rounded-md border font-black transition-all cursor-pointer ${
                        flow.active 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-zinc-850 hover:text-zinc-500' 
                          : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20'
                      }`}
                    >
                      {flow.active ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>

                  {/* Flow blocks diagram mockup */}
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 flex items-center justify-between font-mono text-[10px]">
                    <div className="flex items-center gap-2 text-blue-400">
                      <Cpu className="w-3.5 h-3.5 shrink-0" />
                      <span>{flow.trigger}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-zinc-600" />
                    <div className="flex items-center gap-2 text-purple-400">
                      <GitFork className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate max-w-[130px]" title={flow.condition}>{flow.condition}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-zinc-600" />
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate max-w-[150px]" title={flow.action}>{flow.action}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                    <span>Runs Logged: <strong className="text-zinc-300">{flow.runsCount} executions</strong></span>
                    <span>Last fired: {flow.lastTriggered}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Creation Form block */}
          <div className="space-y-4">
            
            {/* visual flowchart mockup */}
            <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono block">Workflow Visual Path Preview</span>
              
              <div className="space-y-4 font-mono text-[11px] relative py-2">
                <div className="absolute left-7 top-6 bottom-6 w-0.5 bg-zinc-800" />
                
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 text-xs font-bold">1</div>
                  <div className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl flex-1">
                    <p className="text-[9px] text-zinc-500">TRIGGER EVENT</p>
                    <p className="text-white font-bold">{selectedTrigger}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400 text-xs font-bold">2</div>
                  <div className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl flex-1">
                    <p className="text-[9px] text-zinc-500">LOGICAL FILTER</p>
                    <p className="text-white font-bold">{selectedCondition}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 text-xs font-bold">3</div>
                  <div className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl flex-1">
                    <p className="text-[9px] text-zinc-500">IMMEDIATE ACTION</p>
                    <p className="text-white font-bold">{selectedAction}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Creation Wizard */}
            <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-4 font-mono text-xs">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">Create Visual Macro Rule</span>
              
              <form onSubmit={handleCreateWorkflow} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-zinc-500">Automation Rule Title</label>
                  <input 
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Notify Doctor Jenkins on Recall"
                    className="w-full bg-zinc-950 border border-zinc-850 p-2 text-white outline-none focus:border-blue-500 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-500">Assign Trigger</label>
                  <select 
                    value={selectedTrigger}
                    onChange={(e) => setSelectedTrigger(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-white outline-none"
                  >
                    {TRIGGERS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-500">Conditional Filter</label>
                  <select 
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-white outline-none"
                  >
                    {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-500">Perform Action</label>
                  <select 
                    value={selectedAction}
                    onChange={(e) => setSelectedAction(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-white outline-none"
                  >
                    {ACTIONS.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-black py-2.5 rounded-xl text-center font-bold cursor-pointer transition-colors mt-2"
                >
                  Save & Compile Macro Flow
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* RENDER EXECUTION HISTORY LOGS */}
      {tab === 'logs' && (
        <div className="p-5 rounded-3xl bg-zinc-900/30 border border-zinc-900 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Completed Automation Audit Log</span>
            <button 
              onClick={() => {
                setLogs(EXECUTION_LOGS_MOCK);
                triggerToast('Execution histories completely synchronized.');
              }}
              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-zinc-400 hover:text-white rounded-xl transition-all font-mono text-[10px] flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Sync History
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {logs.map(log => {
              const isSucc = log.status === 'Succeeded';
              return (
                <div key={log.id} className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                        isSucc ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {log.status}
                      </span>
                      <h5 className="font-bold text-white">{log.name}</h5>
                      <span className="text-[10px] text-zinc-500">Job: {log.id}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">{log.details}</p>
                  </div>

                  <span className="text-[10px] text-zinc-500 shrink-0">{log.timestamp}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
