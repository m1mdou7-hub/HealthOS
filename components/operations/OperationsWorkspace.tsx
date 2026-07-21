'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Calendar, Shield, Users, RefreshCw, 
  Bell, Activity, UserCheck, Search, HelpCircle, Sparkles
} from 'lucide-react';

// Subcomponents
import EnterpriseScheduler from './EnterpriseScheduler';
import OperatoryManagement from './OperatoryManagement';
import DoctorManagement from './DoctorManagement';
import WaitingQueue from './WaitingQueue';
import RecallCenter from './RecallCenter';
import NotificationCenter from './NotificationCenter';
import TreatmentSessionManager from './TreatmentSessionManager';
import DashboardIntelligence from './DashboardIntelligence';
import SearchEngine from './SearchEngine';

// Seed & Mock Types
import { 
  MOCK_APPOINTMENTS, 
  MOCK_CHAIRS_STATUS, 
  MOCK_QUEUE, 
  MOCK_RECALLS, 
  MOCK_NOTIFICATIONS, 
  MOCK_TREATMENT_SESSIONS, 
  MOCK_DOCTORS, 
  MOCK_PATIENTS,
  Appointment,
  ChairStatus,
  QueueItem,
  RecallItem,
  OperationalNotification,
  TreatmentSession,
  Doctor
} from './types';

type TabId = 'dashboard' | 'scheduler' | 'operatory' | 'staff' | 'queue' | 'recalls' | 'sessions' | 'notifications' | 'search';

export default function OperationsWorkspace() {
  // Global Synchronized States
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [chairs, setChairs] = useState<ChairStatus[]>(MOCK_CHAIRS_STATUS);
  const [queue, setQueue] = useState<QueueItem[]>(MOCK_QUEUE);
  const [recalls, setRecalls] = useState<RecallItem[]>(MOCK_RECALLS);
  const [notifications, setNotifications] = useState<OperationalNotification[]>(MOCK_NOTIFICATIONS);
  const [sessions, setSessions] = useState<TreatmentSession[]>(MOCK_TREATMENT_SESSIONS);
  const [doctors, setDoctors] = useState<Doctor[]>(MOCK_DOCTORS);

  // Active workspace section
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  const chairsList = MOCK_CHAIRS_STATUS.map(c => c.name);

  // Action: Trigger direct booking for a recall patient from RecallCenter
  const handleBookRecallAppointment = (patientName: string, procedureType: string) => {
    // Navigate to Scheduler tab
    setActiveTab('scheduler');
    // Pre-populate notification or suggest appointment
    alert(`Ready to book ${patientName} for their '${procedureType}' recall. Click 'Add Appointment' to finalize slot!`);
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard intelligence', icon: LayoutDashboard },
    { id: 'scheduler', name: 'Enterprise Scheduler', icon: Calendar },
    { id: 'operatory', name: 'Operatory control', icon: Shield },
    { id: 'staff', name: 'Clinician Directory', icon: UserCheck },
    { id: 'queue', name: 'Triage Waiting Queue', icon: Users },
    { id: 'recalls', name: 'Recall Retention', icon: RefreshCw },
    { id: 'sessions', name: 'Treatment Session Logs', icon: Activity },
    { id: 'notifications', name: 'Notification Hub', icon: Bell },
    { id: 'search', name: 'Clinical Index Search', icon: Search },
  ] as const;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-zinc-100 pb-12 animate-fade-in">
      
      {/* Platform Title Banner */}
      <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-widest animate-pulse">
              HealthOS Enterprise Node
            </span>
            <span className="text-zinc-500">•</span>
            <span className="text-xs text-zinc-400 font-mono">Clinical Operations Platform (Sprint 4 Module)</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Multi-Doctor Prosthodontic Control Console
          </h2>
          <p className="text-zinc-400 text-xs">
            Integrated live data bus bridging operatory suites, surgeon schedules, waiting lists, and active EHR session histories.
          </p>
        </div>
        <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs font-mono text-purple-300 flex items-center gap-2 self-start md:self-auto">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Real-time Clinical Sync Engine active</span>
        </div>
      </div>

      {/* Horizontal Nav Bar */}
      <div className="border border-zinc-900 bg-zinc-950 p-2 rounded-2xl flex flex-wrap items-center gap-1">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                isActive 
                  ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/20' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{t.name}</span>
            </button>
          );
        })}
      </div>

      {/* Synchronized Content Space */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'dashboard' && (
              <DashboardIntelligence
                appointments={appointments}
                chairs={chairs}
                queue={queue}
                recalls={recalls}
                doctors={doctors}
              />
            )}

            {activeTab === 'scheduler' && (
              <EnterpriseScheduler
                appointments={appointments}
                setAppointments={setAppointments}
                doctors={doctors}
                chairs={chairsList}
              />
            )}

            {activeTab === 'operatory' && (
              <OperatoryManagement
                chairs={chairs}
                setChairs={setChairs}
                doctors={doctors}
              />
            )}

            {activeTab === 'staff' && (
              <DoctorManagement
                doctors={doctors}
                setDoctors={setDoctors}
              />
            )}

            {activeTab === 'queue' && (
              <WaitingQueue
                queue={queue}
                setQueue={setQueue}
              />
            )}

            {activeTab === 'recalls' && (
              <RecallCenter
                recalls={recalls}
                setRecalls={setRecalls}
                onBookRecall={handleBookRecallAppointment}
              />
            )}

            {activeTab === 'sessions' && (
              <TreatmentSessionManager
                sessions={sessions}
                setSessions={setSessions}
                patients={MOCK_PATIENTS}
                doctors={doctors}
                chairs={chairsList}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationCenter
                notifications={notifications}
                setNotifications={setNotifications}
              />
            )}

            {activeTab === 'search' && (
              <SearchEngine
                patients={MOCK_PATIENTS}
                appointments={appointments}
                sessions={sessions}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
