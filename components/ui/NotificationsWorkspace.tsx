'use client';

import { WorkspaceSidebarNav } from './Workspace/WorkspaceSidebarNav';
import { useWorkspaceToast } from './Workspace/useWorkspaceToast';
import { WorkspaceToast } from './Workspace/WorkspaceToast';
import React, { useState, useMemo } from 'react';
import {
  Bell,
  ShieldAlert,
  Users,
  Calendar,
  FlaskConical,
  Package,
  CreditCard,
  Sparkles,
  Check,
  CheckCircle2,
  Sliders,
  SlidersHorizontal,
  X,
  RefreshCw,
  Info,
  Sliders as SlidersIcon,
  Shield,
  Eye,
  Mail,
  Smartphone
} from 'lucide-react';

// --- MOCK NOTIFICATIONS ---
const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'High Periodontal Risk Flagged',
    desc: 'AI Copilot detected active periodontal indicators for Arthur Pendragon during Exocad design file matching.',
    category: 'AI Alerts',
    time: '2 mins ago',
    unread: true,
    urgency: 'high'
  },
  {
    id: 'notif-2',
    title: 'Milling Node Calibration Check Required',
    desc: 'Milling machine 4 reported micro-deviation beyond 0.05mm threshold during sintering cycle.',
    category: 'System Alerts',
    time: '12 mins ago',
    unread: true,
    urgency: 'medium'
  },
  {
    id: 'notif-3',
    title: 'Patient Intake Signed Securely',
    desc: 'Patient Arthur Pendragon signed the surgical implant consent form via Twilio SMS dispatch.',
    category: 'Patient Alerts',
    time: '45 mins ago',
    unread: true,
    urgency: 'low'
  },
  {
    id: 'notif-4',
    title: 'Zirconia Crown Fitting Booked',
    desc: 'Clara Oswald booked a crown prep fitting for tomorrow at 10:15 AM.',
    category: 'Appointment Alerts',
    time: '1 hour ago',
    unread: false,
    urgency: 'low'
  },
  {
    id: 'notif-5',
    title: 'SLA Scan Export Finished Sintering',
    desc: 'Dental bridge trial PMMA for Clara Oswald has successfully finished the post-curing cycle.',
    category: 'Lab Alerts',
    time: '2 hours ago',
    unread: false,
    urgency: 'low'
  },
  {
    id: 'notif-6',
    title: 'N95 Respirator Reserves Alert',
    desc: 'Clinical inventory count for N95 respirator masks dropped below the 220 restocking limit (84 units left).',
    category: 'Inventory Alerts',
    time: '4 hours ago',
    unread: false,
    urgency: 'medium'
  },
  {
    id: 'notif-7',
    title: 'Aetna Claim Under Review',
    desc: 'Pre-auth claim for Bruce Wayne multi-unit implant is currently pending insurance carrier approval.',
    category: 'Insurance Alerts',
    time: 'Yesterday',
    unread: false,
    urgency: 'medium'
  },
  {
    id: 'notif-8',
    title: 'Invoice Unpaid Past 45 Days',
    desc: 'Invoice #84920 to UnitedHealthcare has breached the 45-day aging outstanding limit.',
    category: 'Billing Alerts',
    time: '2 days ago',
    unread: false,
    urgency: 'high'
  }
];

const CATEGORIES = [
  'All Notification Alerts',
  'AI Alerts',
  'System Alerts',
  'Patient Alerts',
  'Appointment Alerts',
  'Lab Alerts',
  'Inventory Alerts',
  'Billing Alerts',
  'Insurance Alerts'
];

export default function NotificationsWorkspace() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [selectedCategory, setSelectedCategory] = useState('All Notification Alerts');
  const [viewUnreadOnly, setViewUnreadOnly] = useState(false);

  // Preference Settings States
  const [preferences, setPreferences] = useState({
    emailAi: true,
    smsAi: true,
    pushAi: true,
    emailSystem: false,
    smsSystem: true,
    pushSystem: true,
    emailPatient: true,
    smsPatient: true,
    pushPatient: true,
    emailBilling: false,
    smsBilling: true,
    pushBilling: false
  });

  // Success notifications toast
  const { toastMsg, showToast, triggerToast } = useWorkspaceToast();

  // Mark single read
  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id) {
        return { ...n, unread: false };
      }
      return n;
    }));
    triggerToast('Notification marked as read.');
  };

  // Mark all read
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    triggerToast('All notifications marked as read.');
  };

  // Clear single notification
  const handleClearNotif = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    triggerToast('Alert dismissed from console.');
  };

  // Toggle single preference checkbox
  const handleTogglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => {
      const nextVal = !prev[key];
      triggerToast('Alert preferences synchronized.');
      return { ...prev, [key]: nextVal };
    });
  };

  // Filtered list
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notif => {
      const matchCat = selectedCategory === 'All Notification Alerts' || notif.category === selectedCategory;
      const matchUnread = !viewUnreadOnly || notif.unread;
      return matchCat && matchUnread;
    });
  }, [notifications, selectedCategory, viewUnreadOnly]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => n.unread).length;
  }, [notifications]);

  return (
    <div className="space-y-6 text-zinc-100 animate-fade-in relative max-w-[1600px] mx-auto">
      
      {/* Toast Alert */}
      {showToast && <WorkspaceToast message={toastMsg} />}

      {/* FILTER & CONTROL PANEL */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-3xl border border-zinc-900">
        <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-950 rounded-3xl border border-zinc-850">
          {CATEGORIES.map(cat => {
            const isSel = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                  isSel ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {cat.replace('Notification Alerts', 'Alerts')}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewUnreadOnly(!viewUnreadOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 border ${
              viewUnreadOnly 
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                : 'bg-zinc-950 text-zinc-400 border-zinc-850 hover:bg-zinc-900'
            }`}
          >
            <span>{viewUnreadOnly ? 'Showing Unread Only' : 'Show Unread Only'}</span>
            {unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center text-[9px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={handleMarkAllRead}
            className="p-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 rounded-xl text-zinc-300 font-mono text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" /> Mark All Read
          </button>
        </div>
      </div>

      {/* BENTO GRID WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Active Notifications Viewport - 8 Columns */}
        <div className="lg:col-span-8 bg-zinc-900/20 border border-zinc-900 rounded-3xl p-5 space-y-4 flex flex-col justify-start min-h-[500px]">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Live Gateway Logs</h3>
            <span className="text-[10px] font-mono text-zinc-500">{filteredNotifications.length} matches</span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[550px] pr-1">
            {filteredNotifications.length === 0 ? (
              <div className="py-16 text-center font-mono text-zinc-500 text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 stroke-1 text-zinc-600" />
                <p>No operational notifications in this filter segment.</p>
              </div>
            ) : (
              filteredNotifications.map(notif => {
                // Determine icon
                let Icon = Bell;
                let colorClass = 'text-blue-400 bg-blue-500/10';
                if (notif.category === 'AI Alerts') { Icon = Sparkles; colorClass = 'text-purple-400 bg-purple-500/10'; }
                else if (notif.category === 'System Alerts') { Icon = ShieldAlert; colorClass = 'text-amber-400 bg-amber-500/10'; }
                else if (notif.category === 'Patient Alerts') { Icon = Users; colorClass = 'text-pink-400 bg-pink-500/10'; }
                else if (notif.category === 'Appointment Alerts') { Icon = Calendar; colorClass = 'text-emerald-400 bg-emerald-500/10'; }
                else if (notif.category === 'Lab Alerts') { Icon = FlaskConical; colorClass = 'text-orange-400 bg-orange-500/10'; }
                else if (notif.category === 'Inventory Alerts') { Icon = Package; colorClass = 'text-cyan-400 bg-cyan-500/10'; }
                else if (notif.category === 'Billing Alerts' || notif.category === 'Insurance Alerts') { Icon = CreditCard; colorClass = 'text-rose-400 bg-rose-500/10'; }

                return (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-3xl border transition-all flex items-start justify-between gap-4 relative ${
                      notif.unread 
                        ? 'bg-zinc-900 border-zinc-800 shadow-lg' 
                        : 'bg-zinc-950/20 border-transparent hover:bg-zinc-900/30'
                    }`}
                  >
                    {notif.unread && (
                      <span className="absolute top-4 left-4 w-2 h-2 bg-emerald-500 rounded-full" />
                    )}

                    <div className={`flex gap-4 ${notif.unread ? 'pl-4' : ''}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white leading-snug">{notif.title}</h4>
                          <span className="text-[8px] font-mono text-zinc-500 uppercase bg-zinc-950 px-1.5 py-0.5 rounded">
                            {notif.category}
                          </span>
                        </div>

                        <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{notif.desc}</p>
                        <span className="text-[9px] font-mono text-zinc-500 block">{notif.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {notif.unread && (
                        <button
                          onClick={() => handleMarkRead(notif.id)}
                          className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded transition-colors"
                          title="Mark Read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleClearNotif(notif.id)}
                        className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-red-400 rounded transition-colors"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Global Notification Preferences panel - 4 Columns */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-3xl bg-zinc-900/30 border border-zinc-900 space-y-4 font-mono text-xs">
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider block">Alert Dispatch Tuning</span>
            </div>

            <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
              Configure real-time trigger rules to route high-value notifications via external notification APIs.
            </p>

            <div className="space-y-4">
              
              {/* Category block: AI Insights */}
              <div className="space-y-2">
                <span className="text-[10px] text-purple-400 uppercase font-bold block">AI Diagnostic Alerts</span>
                <div className="space-y-1.5">
                  {[
                    { label: 'Secure Email (SES)', key: 'emailAi' },
                    { label: 'SMS Callback (Twilio)', key: 'smsAi' },
                    { label: 'In-app WebSocket Push', key: 'pushAi' }
                  ].map(pref => (
                    <button
                      key={pref.key}
                      onClick={() => handleTogglePreference(pref.key as any)}
                      className="w-full text-left p-2.5 bg-zinc-950 border border-zinc-850 hover:border-zinc-800 rounded-xl flex items-center justify-between"
                    >
                      <span className="text-zinc-300 font-sans">{pref.label}</span>
                      <span className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        preferences[pref.key as keyof typeof preferences] ? 'bg-emerald-500 text-zinc-950 border-emerald-400' : 'border-zinc-800 bg-transparent'
                      }`}>
                        {preferences[pref.key as keyof typeof preferences] && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category block: System Logs */}
              <div className="space-y-2">
                <span className="text-[10px] text-amber-400 uppercase font-bold block">System telemetry Logs</span>
                <div className="space-y-1.5">
                  {[
                    { label: 'Secure Email (SES)', key: 'emailSystem' },
                    { label: 'SMS Callback (Twilio)', key: 'smsSystem' },
                    { label: 'In-app WebSocket Push', key: 'pushSystem' }
                  ].map(pref => (
                    <button
                      key={pref.key}
                      onClick={() => handleTogglePreference(pref.key as any)}
                      className="w-full text-left p-2.5 bg-zinc-950 border border-zinc-850 hover:border-zinc-800 rounded-xl flex items-center justify-between"
                    >
                      <span className="text-zinc-300 font-sans">{pref.label}</span>
                      <span className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        preferences[pref.key as keyof typeof preferences] ? 'bg-emerald-500 text-zinc-950 border-emerald-400' : 'border-zinc-800 bg-transparent'
                      }`}>
                        {preferences[pref.key as keyof typeof preferences] && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category block: Patient Updates */}
              <div className="space-y-2">
                <span className="text-[10px] text-pink-400 uppercase font-bold block">Patient Actions</span>
                <div className="space-y-1.5">
                  {[
                    { label: 'Secure Email (SES)', key: 'emailPatient' },
                    { label: 'SMS Callback (Twilio)', key: 'smsPatient' },
                    { label: 'In-app WebSocket Push', key: 'pushPatient' }
                  ].map(pref => (
                    <button
                      key={pref.key}
                      onClick={() => handleTogglePreference(pref.key as any)}
                      className="w-full text-left p-2.5 bg-zinc-950 border border-zinc-850 hover:border-zinc-800 rounded-xl flex items-center justify-between"
                    >
                      <span className="text-zinc-300 font-sans">{pref.label}</span>
                      <span className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        preferences[pref.key as keyof typeof preferences] ? 'bg-emerald-500 text-zinc-950 border-emerald-400' : 'border-zinc-800 bg-transparent'
                      }`}>
                        {preferences[pref.key as keyof typeof preferences] && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
