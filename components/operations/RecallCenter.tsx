'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
    <div id="recall-center" className="p-6 card-elevated rounded-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold font-mono flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <RefreshCw className="w-4 h-4" style={{ color: 'var(--success)' }} /> Active Recall & Patient Retention Center
          </h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
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
            className="p-3 rounded-xl flex items-center gap-2 text-xs text-left"
            style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)', color: 'var(--accent)' }}
          >
            <MessageSquare className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
            <span>{lastActionMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Selectors with badge counts */}
      <div className="flex flex-wrap items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
        {(['Today', 'Overdue', 'Upcoming', 'Completed', 'Missing'] as const).map(tab => {
          const count = recalls.filter(r => r.status === tab).length;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`nav-item px-4 py-2 text-xs font-semibold flex items-center gap-2 ${isActive ? 'active font-bold' : ''}`}
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
      <div className="rounded-xl overflow-hidden card-elevated">
        <div className="grid grid-cols-12 p-3.5 text-[10px] font-mono font-bold uppercase tracking-widest border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
          <div className="col-span-3 text-left">Patient</div>
          <div className="col-span-3 text-left">Recall Protocol</div>
          <div className="col-span-2 text-left">Target Date</div>
          <div className="col-span-2 text-left">Last Contact</div>
          <div className="col-span-2 text-center">Engagement Trigger</div>
        </div>

        <div className="divide-y text-left" style={{ borderColor: 'var(--border)' }}>
          {filteredRecalls.map(item => (
            <div key={item.id} className="grid grid-cols-12 p-3.5 text-xs items-center hover:bg-zinc-900/10" style={{ color: 'var(--text-sub)' }}>
              <div className="col-span-3 font-semibold" style={{ color: 'var(--text)' }}>
                <p>{item.patientName}</p>
                <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{item.phone}</p>
              </div>

              <div className="col-span-3">
                <span className="px-2 py-0.5 rounded border font-mono text-[10px] font-semibold" style={{ color: 'var(--text-sub)', background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                  {item.type}
                </span>
              </div>

              <div className="col-span-2 font-mono" style={{ color: 'var(--text-muted)' }}>
                {item.dueDate}
              </div>

              <div className="col-span-2 font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {item.lastContacted || 'Never contacted'}
              </div>

              <div className="col-span-2 flex items-center justify-center gap-1.5">
                <button
                  onClick={() => triggerOutreach(item.patientName, 'Call')}
                  className="btn-ghost p-1.5 rounded"
                  title="Telephone call"
                >
                  <Phone className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => triggerOutreach(item.patientName, 'SMS')}
                  className="btn-ghost p-1.5 rounded"
                  title="SMS dispatch"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => triggerOutreach(item.patientName, 'Email')}
                  className="btn-ghost p-1.5 rounded"
                  title="Email campaign"
                >
                  <Mail className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onBookRecall(item.patientName, item.type)}
                  className="p-1.5 rounded btn-secondary"
                  title="Instant Appointment"
                >
                  <Calendar className="w-3.5 h-3.5" />
                </button>
                {item.status !== 'Completed' && (
                  <button
                    onClick={() => handleMarkCompleted(item.id)}
                    className="p-1.5 rounded"
                    style={{ background: 'color-mix(in srgb, var(--success) 12%, transparent)', color: 'var(--success)', border: '1px solid color-mix(in srgb, var(--success) 25%, transparent)' }}
                    title="Mark Completed"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredRecalls.length === 0 && (
            <div className="p-8 text-center text-xs italic" style={{ color: 'var(--text-muted)' }}>
              No recalls found for this category state.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
