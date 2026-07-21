'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Phone, MessageSquare, Mail, Calendar, HelpCircle, CheckCircle } from 'lucide-react';
import { RecallItem } from './types';

interface RecallCenterProps {
  recalls: RecallItem[];
  setRecalls: React.Dispatch<React.SetStateAction<RecallItem[]>>;
  onBookRecall: (patientName: string, procedureType: string) => void;
}

export default function RecallCenter({
  recalls,
  setRecalls,
  onBookRecall
}: RecallCenterProps) {
  const [activeTab, setActiveTab] = useState<RecallItem['status']>('Today');
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);

  const filteredRecalls = useMemo(() => {
    return recalls.filter(r => r.status === activeTab);
  }, [recalls, activeTab]);

  const triggerOutreach = (patient: string, channel: 'SMS' | 'Call' | 'Email') => {
    let msg = '';
    if (channel === 'SMS') {
      msg = `Simulated automated SMS sent to ${patient}: "Hi ${patient}, this is HealthOS Dental. Your ${activeTab === 'Overdue' ? 'overdue' : 'upcoming'} prosthetic check-up is ready to be booked. Click here: healthos.io/book"`;
    } else if (channel === 'Email') {
      msg = `Simulated high-priority Email sent to ${patient}: "Subject: Preventive Care Recall. Dear ${patient}, our records indicate you are due for your periodontal recall..."`;
    } else {
      msg = `Triage telephone protocol started. Dialer connected to patient: ${patient}.`;
    }

    setLastActionMessage(msg);
    setTimeout(() => {
      setLastActionMessage(null);
    }, 5000);
  };

  const handleMarkCompleted = (id: string) => {
    setRecalls(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'Completed',
          lastContacted: new Date().toISOString().split('T')[0]
        };
      }
      return r;
    }));
  };

  const getTabBadgeColor = (tab: RecallItem['status']) => {
    switch (tab) {
      case 'Today': return 'bg-emerald-500/15 text-emerald-400';
      case 'Overdue': return 'bg-rose-500/15 text-rose-400 animate-pulse';
      case 'Upcoming': return 'bg-purple-500/15 text-purple-400';
      case 'Completed': return 'bg-blue-500/15 text-blue-400';
      case 'Missing': default: return 'bg-zinc-800 text-zinc-400';
    }
  };

  return (
    <div id="recall-center" className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-emerald-400" /> Active Recall & Patient Retention Center
          </h3>
          <p className="text-zinc-400 text-xs mt-1">
            Re-engage dormant prosthesis patients. Generate recall pipelines, trigger mass dispatches, and schedule hygiene checks.
          </p>
        </div>
      </div>

      {/* Action Notification Toast Banner */}
      <AnimatePresence>
        {lastActionMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs rounded-xl flex items-center gap-2 text-left"
          >
            <MessageSquare className="w-4 h-4 text-purple-400 shrink-0" />
            <span>{lastActionMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Selectors with badge counts */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-900 pb-3">
        {(['Today', 'Overdue', 'Upcoming', 'Completed', 'Missing'] as const).map(tab => {
          const count = recalls.filter(r => r.status === tab).length;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                isActive 
                  ? 'bg-purple-600 text-white font-bold' 
                  : 'bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab} Recalls
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold ${getTabBadgeColor(tab)}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Recall Table */}
      <div className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950/40">
        <div className="grid grid-cols-12 bg-zinc-950 p-3.5 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-900">
          <div className="col-span-3 text-left">Patient</div>
          <div className="col-span-3 text-left">Recall Protocol</div>
          <div className="col-span-2 text-left">Target Date</div>
          <div className="col-span-2 text-left">Last Contact</div>
          <div className="col-span-2 text-center">Engagement Trigger</div>
        </div>

        <div className="divide-y divide-zinc-900/60 text-left">
          {filteredRecalls.map(item => (
            <div key={item.id} className="grid grid-cols-12 p-3.5 text-xs text-zinc-300 items-center hover:bg-zinc-900/10">
              <div className="col-span-3 font-semibold text-white">
                <p>{item.patientName}</p>
                <p className="text-[10px] text-zinc-500 font-mono">{item.phone}</p>
              </div>

              <div className="col-span-3">
                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-850 font-mono text-[10px] font-semibold text-zinc-300">
                  {item.type}
                </span>
              </div>

              <div className="col-span-2 font-mono text-zinc-400">
                {item.dueDate}
              </div>

              <div className="col-span-2 font-mono text-zinc-500 text-[11px]">
                {item.lastContacted || 'Never contacted'}
              </div>

              <div className="col-span-2 flex items-center justify-center gap-1.5">
                <button
                  onClick={() => triggerOutreach(item.patientName, 'Call')}
                  className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  title="Telephone call"
                >
                  <Phone className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => triggerOutreach(item.patientName, 'SMS')}
                  className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  title="SMS dispatch"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => triggerOutreach(item.patientName, 'Email')}
                  className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  title="Email campaign"
                >
                  <Mail className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onBookRecall(item.patientName, item.type)}
                  className="p-1.5 rounded bg-purple-950 hover:bg-purple-900 text-purple-400 hover:text-purple-300 border border-purple-900/40"
                  title="Instant Appointment"
                >
                  <Calendar className="w-3.5 h-3.5" />
                </button>
                {item.status !== 'Completed' && (
                  <button
                    onClick={() => handleMarkCompleted(item.id)}
                    className="p-1.5 rounded bg-emerald-950/40 hover:bg-emerald-900 text-emerald-400 hover:text-emerald-300 border border-emerald-900/30"
                    title="Mark Completed"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredRecalls.length === 0 && (
            <div className="p-8 text-center text-zinc-600 text-xs italic">
              No recalls found for this category state.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
