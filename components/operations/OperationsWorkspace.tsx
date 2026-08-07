'use client';

import React, { useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Calendar, Shield, Users, RefreshCw, 
  Bell, Activity, UserCheck, Search, HelpCircle, Sparkles
} from 'lucide-react';
import { AmbientGlow } from '@/components/ui/design-system';

// Subcomponents
const EnterpriseScheduler = lazy(() => import('./EnterpriseScheduler'));
const OperatoryManagement = lazy(() => import('./OperatoryManagement'));
const DoctorManagement = lazy(() => import('./DoctorManagement'));
const WaitingQueue = lazy(() => import('./WaitingQueue'));
const RecallCenter = lazy(() => import('./RecallCenter'));
const NotificationCenter = lazy(() => import('./NotificationCenter'));
const TreatmentSessionManager = lazy(() => import('./TreatmentSessionManager'));
const DashboardIntelligence = lazy(() => import('./DashboardIntelligence'));
const SearchEngine = lazy(() => import('./SearchEngine'));

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
  Doctor,
  Patient
} from './types';

type TabId = 'dashboard' | 'scheduler' | 'operatory' | 'staff' | 'queue' | 'recalls' | 'sessions' | 'notifications' | 'search';

interface OperationsWorkspaceProps {
  demoMode: boolean;
  initialAppointments: Appointment[];
  initialPatients: Patient[];
}

export default function OperationsWorkspace({
  demoMode,
  initialAppointments,
  initialPatients
}: OperationsWorkspaceProps) {
  // Global Synchronized States
  const [appointments, setAppointments] = useState<Appointment[]>(
    demoMode ? MOCK_APPOINTMENTS : initialAppointments
  );
  const [chairs, setChairs] = useState<ChairStatus[]>(MOCK_CHAIRS_STATUS);
  const [queue, setQueue] = useState<QueueItem[]>(MOCK_QUEUE);
  const [recalls, setRecalls] = useState<RecallItem[]>(MOCK_RECALLS);
  const [notifications, setNotifications] = useState<OperationalNotification[]>(MOCK_NOTIFICATIONS);
  const [sessions, setSessions] = useState<TreatmentSession[]>(MOCK_TREATMENT_SESSIONS);
  const [doctors, setDoctors] = useState<Doctor[]>(MOCK_DOCTORS);
  const patients = demoMode ? MOCK_PATIENTS : initialPatients;

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
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 animate-fade-in" style={{ color: 'var(--text)' }}>
      
      {/* Platform Title Banner */}
      <div className="p-6 card-gradient flex flex-col md:flex-row md:items-center justify-between gap-6 text-start relative overflow-hidden">
        <div className="relative space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge badge-success uppercase tracking-widest animate-pulse">
              HealthOS Enterprise Node
            </span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span className="text-xs font-mono" style={{ color: 'var(--text-sub)' }}>Clinical Operations Platform (Sprint 4 Module)</span>
          </div>
          <h2 className="section-title text-xl md:text-2xl">
            Multi-Doctor Prosthodontic Control Console
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Integrated live data bus bridging operatory suites, surgeon schedules, waiting lists, and active EHR session histories.
          </p>
        </div>
        <div className="p-3 card-elevated rounded-xl text-xs font-mono flex items-center gap-2 self-start md:self-auto" style={{ color: 'var(--accent)' }}>
          <Sparkles className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
          <span>Real-time Clinical Sync Engine active</span>
        </div>
      </div>

      {/* Horizontal Nav Bar */}
      <div className="card-elevated p-2 rounded-2xl flex flex-wrap items-center gap-1">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`nav-item px-4 py-2.5 text-xs font-semibold ${isActive ? 'active font-bold' : ''}`}
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
            <Suspense fallback={<div className="text-zinc-500 p-8 text-center text-xs font-mono">Loading module...</div>}>
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
                  patients={patients}
                  demoMode={demoMode}
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
                  patients={patients}
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
                  patients={patients}
                  appointments={appointments}
                  sessions={sessions}
                />
              )}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
