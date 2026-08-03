'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { createClient } from '@/utils/supabase/client';
import { Grid, Heart, Clipboard, Calendar as CalendarIcon, Layers, FlaskConical, DollarSign, HardDrive, Send, Activity, Sparkles, Plus, Edit3 } from 'lucide-react';

// Types & Services
import { clinicalService, PatientCase, Appointment } from '@/utils/services/clinicalService';

// Child Modular Components
import StickyPatientHeader from './Patient/StickyPatientHeader';
import ClinicalDashboard from './Patient/ClinicalDashboard';
import FloatingQuickActions from './Patient/FloatingQuickActions';
import BillingOverview from './Patient/BillingOverview';
import DocumentsPanel from './Patient/DocumentsPanel';
import CommunicationPanel from './Patient/CommunicationPanel';
import ClinicalPanel from './Patient/ClinicalPanel';
import PatientListView from './Patient/PatientListView';
import LaboratoryPanel from './Patient/LaboratoryPanel';
import AnalyticsPanel from './Patient/AnalyticsPanel';
import PatientWorkspaceSkeleton from './Patient/PatientWorkspaceSkeleton';
import PatientDetailsModal from './Patient/PatientDetailsModal';
import SoapNoteEditor from './Patient/SoapNoteEditor';
import TreatmentPlansPanel from './Patient/TreatmentPlansPanel';
import AppointmentsPanel from './Patient/AppointmentsPanel';
import RadiologyPanel from './Patient/RadiologyPanel';
import { PatientTimeline } from './Timeline/PatientTimeline';
import { ToothSelector, ToothStatus } from './Common/ToothSelector';

export interface Patient {
  id: string;
  name: string;
  photoUrl: string;
  age: number;
  gender: string;
  bloodGroup: string;
  allergyStatus: string;
  medicalAlerts: string[];
  phone: string;
  email: string;
  primaryDoctor: string;
  currentTreatment: string;
  status: 'Active' | 'New' | 'Under Treatment' | 'Completed';
  lastVisit: string;
  nextAppointment: string;
  aiRiskFlag: 'High' | 'Medium' | 'Low';
  riskDescription: string;
  summary: string;
  medicalHistory: string[];
  medications: string[];
  allergies: string[];
  timeline: { date: string; title: string; category: string; description: string }[];
  cases?: PatientCase[];
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5 // 5 minutes
    }
  }
});

interface PatientWorkspaceProps {
  demoMode?: boolean;
  initialRows?: any[];
}

function WorkspaceOrchestrator({ demoMode, initialRows }: PatientWorkspaceProps) {
  const router = useRouter();
  const params = useParams();
  const selectedPatientId = (params?.id as string | undefined) || null;
  const supabase = createClient();
  const queryClientLocal = useQueryClient();
  const t = useTranslations('PatientWorkspace');

  // Navigation
  const [workspaceTab, setWorkspaceTab] = useState<string>('overview');

  // Directory Patients state
  const [patients, setPatients] = useState<Patient[]>(() => {
    if (demoMode) return require('./PatientWorkspace').INITIAL_PATIENTS || [];
    return (initialRows || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      photoUrl: row.photo_url || '',
      age: row.age || 0,
      gender: row.gender || '',
      bloodGroup: row.blood_group || '',
      allergyStatus: row.allergy_status || 'No Known Allergies',
      medicalAlerts: Array.isArray(row.medical_alerts) ? row.medical_alerts : [],
      phone: row.phone || '',
      email: row.email || '',
      primaryDoctor: row.primary_doctor || '',
      currentTreatment: row.current_treatment || '',
      status: row.status || 'Active',
      lastVisit: row.last_visit || '',
      nextAppointment: row.next_appointment || 'Not scheduled',
      aiRiskFlag: row.ai_risk_flag || 'Low',
      riskDescription: row.risk_description || '',
      summary: row.summary || '',
      medicalHistory: Array.isArray(row.medical_history) ? row.medical_history : [],
      medications: Array.isArray(row.medications) ? row.medications : [],
      allergies: Array.isArray(row.allergies) ? row.allergies : [],
      timeline: Array.isArray(row.timeline) ? row.timeline : [],
      cases: Array.isArray(row.healthos_patient_cases) ? row.healthos_patient_cases : []
    }));
  });

  const activePatient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId) || patients[0];
  }, [patients, selectedPatientId]);

  // Sidebar copilot and CRUD states
  const [isCopilotSidebarOpen, setIsCopilotSidebarOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [patientForm, setPatientForm] = useState<any>({ name: '', age: 35, gender: 'Male', status: 'Active' });

  // Tooth Selector / Clinical Chart states
  const [activeTooth, setActiveTooth] = useState<number | null>(null);
  const [teethStatuses, setTeethStatuses] = useState<Record<number, ToothStatus>>(() => {
    // Demo patient default configurations
    return {
      11: 'missing',
      14: 'decayed',
      19: 'filled',
      30: 'crown'
    };
  });

  // Laboratory case modal
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<PatientCase | null>(null);
  const [caseForm, setCaseForm] = useState({
    name: '',
    status: 'In Design' as PatientCase['status'],
    priority: 'Standard' as PatientCase['priority'],
    clinician: 'Dr. Ahmed',
    stage: 'STL Alignment',
    progress: 10,
    notes: '',
    dueDate: ''
  });

  // Query nested patient structures
  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', activePatient?.id],
    queryFn: () => clinicalService.getAppointments(supabase as any, activePatient.id, !!demoMode),
    enabled: !!activePatient?.id
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices', activePatient?.id],
    queryFn: () => clinicalService.getInvoices(supabase as any, activePatient.id, !!demoMode),
    enabled: !!activePatient?.id
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments', activePatient?.id],
    queryFn: () => clinicalService.getPayments(supabase as any, activePatient.id, !!demoMode),
    enabled: !!activePatient?.id
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['treatmentPlans', activePatient?.id],
    queryFn: () => clinicalService.getTreatmentPlans(supabase as any, activePatient.id, !!demoMode),
    enabled: !!activePatient?.id
  });

  const { data: notesList = [] } = useQuery({
    queryKey: ['clinicalNotes', activePatient?.id],
    queryFn: () => clinicalService.getClinicalNotes(supabase as any, activePatient.id, !!demoMode),
    enabled: !!activePatient?.id
  });

  const { data: docs = [] } = useQuery({
    queryKey: ['documents', activePatient?.id],
    queryFn: () => clinicalService.getDocuments(supabase as any, activePatient.id, !!demoMode),
    enabled: !!activePatient?.id
  });

  const { data: gallery = [] } = useQuery({
    queryKey: ['imagingGallery', activePatient?.id],
    queryFn: () => clinicalService.getImagingGallery(supabase as any, activePatient.id, !!demoMode),
    enabled: !!activePatient?.id
  });

  // Outstanding Balance calculations
  const outstandingBalance = useMemo(() => {
    const invTotal = invoices.reduce((acc, inv) => acc + inv.treatmentItems.reduce((s, i) => s + i.fee, 0), 0);
    const payTotal = payments.reduce((acc, pay) => acc + pay.amount, 0);
    return Math.max(0, invTotal - payTotal);
  }, [invoices, payments]);

  // Today appointment
  const todayAppt = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const match = appointments.find(a => a.date === today && a.status !== 'Cancelled');
    return match ? `${match.startTime} (${match.procedure})` : 'Not scheduled';
  }, [appointments]);

  // Mutations
  const updatePatientStatusMutation = useMutation({
    mutationFn: ({ status }: { status: Patient['status'] }) =>
      clinicalService.updatePatientStatus(supabase as any, activePatient.id, status, !!demoMode),
    onSuccess: () => {
      setPatients(prev => prev.map(p => p.id === activePatient.id ? { ...p, status: patientForm.status } : p));
      queryClientLocal.invalidateQueries({ queryKey: ['active-patient', activePatient.id] });
    }
  });

  // Handlers
  const handleSavePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientForm.name.trim()) return;

    if (editingPatient) {
      updatePatientStatusMutation.mutate({ status: patientForm.status });
      setIsPatientModalOpen(false);
    } else {
      const newId = `PTS-${Math.floor(1000 + Math.random() * 9000)}`;
      const newPatient: Patient = {
        id: newId,
        name: patientForm.name,
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
        age: Number(patientForm.age || 35),
        gender: patientForm.gender || 'Male',
        bloodGroup: patientForm.bloodGroup || 'O+',
        allergyStatus: patientForm.allergies || 'No Known Allergies',
        medicalAlerts: patientForm.medicalAlerts ? patientForm.medicalAlerts.split(',').map((s: string) => s.trim()) : [],
        phone: patientForm.phone || '+1 (555) 000-0000',
        email: patientForm.email || `${patientForm.name.toLowerCase().replace(/\s+/g, '')}@healthos.org`,
        primaryDoctor: 'Dr. Ahmed',
        currentTreatment: 'Consultation',
        status: patientForm.status || 'Active',
        lastVisit: new Date().toISOString().split('T')[0],
        nextAppointment: 'Not scheduled',
        aiRiskFlag: 'Low',
        riskDescription: 'Baseline check',
        summary: patientForm.summary || 'Newly registered dental patient.',
        medicalHistory: patientForm.medicalHistory ? patientForm.medicalHistory.split(',').map((s: string) => s.trim()) : [],
        medications: [],
        allergies: patientForm.allergies ? [patientForm.allergies] : [],
        timeline: [],
        cases: []
      };
      setPatients(prev => [newPatient, ...prev]);
      setIsPatientModalOpen(false);
    }
  };

  const handleCaseAction = (actionType: string, targetId: string) => {
    alert(`Tracking action: ${actionType} on item ${targetId}`);
  };

  const handleQuickAction = (actionType: string) => {
    if (actionType === 'appointment') setWorkspaceTab('appointments');
    else if (actionType === 'note') setWorkspaceTab('clinical');
    else if (actionType === 'treatment') setWorkspaceTab('treatment');
    else if (actionType === 'invoice') setWorkspaceTab('billing');
    else if (actionType === 'payment') setWorkspaceTab('billing');
    else if (actionType === 'lab') setWorkspaceTab('laboratory');
    else if (actionType === 'radiology') setWorkspaceTab('radiology');
    else if (actionType === 'photo') setWorkspaceTab('documents');
    else if (actionType === 'referral') setWorkspaceTab('communication');
    else if (actionType === 'prescription') setWorkspaceTab('documents');
  };

  const menuTabs = [
    { id: 'overview', label: t('tab_overview'), icon: Grid },
    { id: 'timeline', label: t('tab_timeline'), icon: Activity },
    { id: 'clinical', label: t('tab_clinical'), icon: Heart },
    { id: 'treatment', label: t('tab_treatment'), icon: Clipboard },
    { id: 'appointments', label: t('tab_appointments'), icon: CalendarIcon },
    { id: 'radiology', label: t('tab_radiology'), icon: Layers },
    { id: 'laboratory', label: t('tab_laboratory'), icon: FlaskConical },
    { id: 'billing', label: t('tab_billing'), icon: DollarSign },
    { id: 'documents', label: t('tab_documents'), icon: HardDrive },
    { id: 'communication', label: t('tab_communication'), icon: Send },
    { id: 'analytics', label: t('tab_analytics'), icon: Activity }
  ];

  return (
    <div className="space-y-6 min-h-screen pb-16">
      <AnimatePresence mode="wait">
        {!selectedPatientId ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PatientListView
              patients={patients}
              onSelectPatient={(id) => router.push(`/patients/${id}`)}
              onAddPatient={() => {
                setEditingPatient(null);
                setPatientForm({ name: '', age: 35, gender: 'Male', status: 'Active' });
                setIsPatientModalOpen(true);
              }}
              onEditPatient={(p, e) => {
                e.stopPropagation();
                setEditingPatient(p);
                setPatientForm(p);
                setIsPatientModalOpen(true);
              }}
              onDeletePatient={(id, e) => {
                e.stopPropagation();
                if (confirm("Are you sure?")) setPatients(prev => prev.filter(p => p.id !== id));
              }}
              onArchivePatient={(id, e) => {
                e.stopPropagation();
                setPatients(prev => prev.map(p => p.id === id ? { ...p, status: 'Completed' } : p));
              }}
            />
          </motion.div>
        ) : !activePatient ? (
          <PatientWorkspaceSkeleton />
        ) : (
          <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 relative">
            <StickyPatientHeader
              activePatient={activePatient}
              outstandingBalance={outstandingBalance}
              todayAppointment={todayAppt}
              assignedDoctor={activePatient.primaryDoctor}
              onBack={() => router.push('/patients')}
            />

            {/* Horizontal Tabs Menu */}
            <div className="overflow-x-auto pb-1 flex border-b border-zinc-900 scrollbar-none gap-1 bg-zinc-950/20 p-2 rounded-xl border border-zinc-900/60 text-xs">
              {menuTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setWorkspaceTab(tab.id)}
                    className={`px-3.5 py-2.5 rounded-lg font-semibold shrink-0 transition-all flex items-center gap-1.5 border-b-2 border-transparent ${
                      workspaceTab === tab.id
                        ? 'bg-zinc-900 text-emerald-400 border-b-2 border-emerald-500'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content Switcher */}
            <div className="min-h-[400px]">
              {workspaceTab === 'overview' && (
                <div className="space-y-6">
                  <ClinicalDashboard
                    activePatient={activePatient}
                    appointments={appointments}
                    treatmentPlans={plans}
                    outstandingBalance={outstandingBalance}
                    labOrdersCount={activePatient.cases?.length || 0}
                    radiologyReportsCount={gallery.filter((g: any) => g.category === 'CBCT').length}
                    clinicalNotesCount={notesList.length}
                    alertsCount={activePatient.medicalAlerts?.filter(a => a !== 'None').length || 0}
                    onNavigateTab={setWorkspaceTab}
                  />
                  <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 text-left space-y-2">
                    <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">{t('demographics')}</h3>
                    <p className="text-xs text-zinc-400">{t('chiefComplaint')}: <strong className="text-zinc-200">{activePatient.summary}</strong></p>
                    <p className="text-xs text-zinc-400">{t('primaryInsurer')}: <strong className="text-zinc-200">{activePatient.allergyStatus}</strong></p>
                  </div>
                </div>
              )}
              {workspaceTab === 'timeline' && (
                <PatientTimeline
                  activePatient={activePatient}
                  appointments={appointments}
                  treatmentPlans={plans}
                  clinicalNotesList={notesList}
                  imagingGallery={gallery}
                  patientDocuments={docs}
                  invoices={invoices}
                  payments={payments}
                  onActionExecute={handleCaseAction}
                />
              )}
              {workspaceTab === 'clinical' && (
                <div className="space-y-6">
                  <ToothSelector
                    activeTooth={activeTooth}
                    setActiveTooth={setActiveTooth}
                    teethStatuses={teethStatuses}
                    setTeethStatuses={setTeethStatuses}
                  />
                  <SoapNoteEditor
                    supabase={supabase as any}
                    activePatient={activePatient}
                    demoMode={!!demoMode}
                    activeTooth={activeTooth}
                    activeToothStatus={activeTooth ? teethStatuses[activeTooth] : null}
                  />
                </div>
              )}
              {workspaceTab === 'treatment' && (
                <TreatmentPlansPanel supabase={supabase as any} activePatient={activePatient} demoMode={!!demoMode} />
              )}
              {workspaceTab === 'appointments' && (
                <AppointmentsPanel supabase={supabase as any} activePatient={activePatient} demoMode={!!demoMode} />
              )}
              {workspaceTab === 'radiology' && (
                <RadiologyPanel supabase={supabase as any} activePatient={activePatient} demoMode={!!demoMode} />
              )}
              {workspaceTab === 'laboratory' && (
                <LaboratoryPanel
                  supabase={supabase as any}
                  activePatient={activePatient}
                  demoMode={!!demoMode}
                  cases={activePatient.cases || []}
                  onAddCase={() => setIsCaseModalOpen(true)}
                  onEditCase={(item) => {
                    setEditingCase(item);
                    setCaseForm(item as any);
                    setIsCaseModalOpen(true);
                  }}
                  onDeleteCase={(id) => alert(`Laboratory case ${id} removed.`)}
                />
              )}
              {workspaceTab === 'billing' && (
                <BillingOverview supabase={supabase as any} activePatient={activePatient} demoMode={!!demoMode} />
              )}
              {workspaceTab === 'documents' && (
                <DocumentsPanel supabase={supabase as any} activePatient={activePatient} demoMode={!!demoMode} />
              )}
              {workspaceTab === 'communication' && (
                <CommunicationPanel supabase={supabase as any} activePatient={activePatient} demoMode={!!demoMode} />
              )}
              {workspaceTab === 'analytics' && (
                <AnalyticsPanel activePatient={activePatient} />
              )}
            </div>

            {/* Right Collapsible AI Sidebar */}
            <button
              onClick={() => setIsCopilotSidebarOpen(!isCopilotSidebarOpen)}
              className="fixed bottom-6 right-20 z-45 px-4 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xl shadow-purple-600/10 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4" /> AI Diagnostics
            </button>

            <ClinicalPanel
              isOpen={isCopilotSidebarOpen}
              onClose={() => setIsCopilotSidebarOpen(false)}
              activePatient={activePatient}
              supabase={supabase as any}
              outstandingBalance={outstandingBalance}
              upcomingAppointmentText={todayAppt}
              pendingProceduresCount={plans[0]?.items?.filter((i: any) => i.status !== 'Completed').length || 0}
              chiefComplaint={activePatient.summary}
              medicalConditions={activePatient.medicalHistory?.join(', ') || ''}
              medicalAllergies={activePatient.allergyStatus}
            />

            {/* Floating Quick Actions FAB */}
            <FloatingQuickActions onActionTrigger={handleQuickAction} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Patient details edit/create Modal */}
      <PatientDetailsModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        editingPatient={editingPatient}
        form={patientForm}
        onChange={setPatientForm}
        onSubmit={handleSavePatient}
      />
    </div>
  );
}

export default function PatientWorkspace(props: PatientWorkspaceProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WorkspaceOrchestrator {...props} />
    </QueryClientProvider>
  );
}

// Default initial datasets
export const INITIAL_PATIENTS: Patient[] = [
  {
    id: "PTS-9412",
    name: "Arthur Pendragon",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80",
    age: 52,
    gender: "Male",
    bloodGroup: "O+",
    allergyStatus: "Penicillin Allergy",
    medicalAlerts: ["Type II Diabetes", "Hypertension", "Penicillin Hypersensitivity"],
    phone: "+1 (555) 381-9921",
    email: "arthur.p@camelot.org",
    primaryDoctor: "Dr. Ahmed",
    currentTreatment: "Full Arch Zirconia Bridge",
    status: "Under Treatment",
    lastVisit: "2026-07-10",
    nextAppointment: "2026-07-18 09:00 AM (Crown Preparation)",
    aiRiskFlag: "High",
    riskDescription: "Elevated periodontal inflammation score; diabetic clearance advised.",
    summary: "Patient presents with generalized tooth mobility in the maxillary arch. Seeking a fixed, high-aesthetic solution.",
    medicalHistory: ["Type II Diabetes diagnosed in 2018 (controlled)", "Hypertension under Lisinopril therapy"],
    medications: ["Metformin 500mg BID", "Lisinopril 10mg QD"],
    allergies: ["Penicillin (severe hives)", "Latex (mild contact dermatitis)"],
    timeline: [
      { date: "Jul 10, 2026", title: "CBCT Double Arch Scan Completed", category: "Imaging", description: "CBCT reveals 7.5mm alveolar bone depth in anterior segments." }
    ],
    cases: [
      {
        id: "CASE-9412",
        name: "Full Arch Maxillary Zirconia Bridge",
        status: "In Design",
        priority: "High",
        clinician: "Dr. Ahmed",
        stage: "Virtual Articulation & STL Alignment",
        progress: 35,
        createdDate: "2026-07-10",
        dueDate: "2026-07-25",
        notes: "Keep minimum facial connector area at 12mm^2."
      }
    ]
  }
];
