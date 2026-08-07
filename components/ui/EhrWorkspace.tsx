'use client';

import { WorkspaceSidebarNav } from './Workspace/WorkspaceSidebarNav';
import { WorkspaceTabPanel } from './Workspace/WorkspaceTabPanel';
import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Shield,
  FolderOpen,
  User,
  Heart,
  Activity,
  AlertTriangle,
  Clock,
  Calendar,
  Layers,
  Sparkles,
  Database,
  Printer,
  ChevronRight,
  TrendingUp,
  Sliders,
  RotateCw,
  Plus,
  Trash2,
  CheckCircle,
  FileSpreadsheet,
  FileCheck,
  CreditCard,
  History,
  Send,
  Eye,
  Settings,
  HardDrive
} from 'lucide-react';
import Image from 'next/image';
import { AmbientGlow } from '@/components/ui/design-system';

// --- TYPE DEFINITIONS ---
interface PatientInfo {
  id: string;
  name: string;
  avatar: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  email: string;
  primaryDentist: string;
  medicalAlerts: string[];
  allergies: string[];
  currentTreatment: string;
  lastVisit: string;
  nextVisit: string;
}

interface SoapNote {
  id: string;
  date: string;
  clinician: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface DiagnosisItem {
  id: string;
  code: string;
  description: string;
  toothNo?: string;
  status: 'Active' | 'Resolved' | 'Suspected';
  onset: string;
}

interface ToothState {
  num: string; // 1-32 or A-T
  isPrimary: boolean;
  status: 'Healthy' | 'Implant' | 'Bridge' | 'Crown' | 'Missing' | 'RCT' | 'Caries' | 'Existing Filling';
}

// --- STATIC REALISTIC DENTAL MOCK DATA ---
const INITIAL_PATIENT: PatientInfo = {
  id: 'EHR-2026-9482',
  name: 'Amelia Vance',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200',
  age: 34,
  gender: 'Female',
  bloodGroup: 'O+ (O-Positive)',
  phone: '+1 (555) 382-9102',
  email: 'amelia.vance@clinical.org',
  primaryDentist: 'Dr. Elena Rostova',
  medicalAlerts: ['Mild Mitral Valve Prolapse', 'Bleeding Tendency (Mild)'],
  allergies: ['Penicillin', 'Sulfa Drugs', 'Latex'],
  currentTreatment: '#11 NobelActive Implant Crown + Digital Wax-up Reconstruction',
  lastVisit: '2026-06-12 (Surgical Guide Try-In)',
  nextVisit: '2026-07-20 (Implant Placement Surgery)'
};

const INITIAL_SOAP_NOTES: SoapNote[] = [
  {
    id: 'S-103',
    date: '2026-06-12',
    clinician: 'Dr. Elena Rostova',
    subjective: 'Patient reports no recent dental discomfort. Excited to proceed with #11 NobelActive implant surgery next month.',
    objective: 'Standard clinical evaluation. Gingival tissue around #11 site is completely healed. Adequate bone width verified via CBCT.',
    assessment: 'Partially edentulous maxilla, congenitally missing #11. Excellent bone density in zone.',
    plan: 'Stage I implant surgery scheduled for 2026-07-20. Suture removal 7 days post-op.'
  },
  {
    id: 'S-102',
    date: '2026-05-10',
    clinician: 'Dr. Elena Rostova',
    subjective: 'Patient presents for secondary consult regarding maxillary aesthetic reconstruction.',
    objective: '3D intraoral scans obtained using 3Shape TRIOS. STL models exported to Exocad for virtual wax-up. Bone height in #11 is 11.5mm.',
    assessment: 'Congenitally missing #11 with mild ridge resorption. Restorative space is optimal.',
    plan: 'Generate 3D printed surgical drill guide. Patient approved final digital design.'
  }
];

const INITIAL_DIAGNOSES: DiagnosisItem[] = [
  { id: 'DX-501', code: 'K00.0', description: 'Anodontia (Congenitally Missing #11)', toothNo: '11', status: 'Active', onset: '2012-08-14' },
  { id: 'DX-502', code: 'K02.61', description: 'Dental Caries on Dentin (#14)', toothNo: '14', status: 'Active', onset: '2026-05-10' },
  { id: 'DX-503', code: 'K05.10', description: 'Chronic Simple Gingivitis, Generalized', status: 'Resolved', onset: '2024-03-22' },
  { id: 'DX-504', code: 'K04.01', description: 'Reversible Pulpitis (#19)', toothNo: '19', status: 'Resolved', onset: '2021-11-04' }
];

const INITIAL_TEETH_STATE: ToothState[] = [
  // Upper Maxilla (1-16)
  ...Array.from({ length: 16 }, (_, i) => ({
    num: String(i + 1),
    isPrimary: false,
    status: (i + 1 === 11 ? 'Missing' : i + 1 === 14 ? 'Caries' : i + 1 === 3 ? 'Existing Filling' : 'Healthy') as ToothState['status']
  })),
  // Lower Mandible (17-32)
  ...Array.from({ length: 16 }, (_, i) => ({
    num: String(i + 17),
    isPrimary: false,
    status: (i + 17 === 19 ? 'RCT' : i + 17 === 30 ? 'Crown' : 'Healthy') as ToothState['status']
  })),
  // Primary Teeth (A-T)
  ...'ABCDEFGHIJKLMNOPQRST'.split('').map(letter => ({
    num: letter,
    isPrimary: true,
    status: 'Healthy' as ToothState['status']
  }))
];

export default function EhrWorkspace() {
  // Active Main Category / Grouping and selected tab
  const [activeTab, setActiveTab] = useState<string>('Visual Profile');
  const [familyHistoryOpen, setFamilyHistoryOpen] = useState(false);
  const [socialHistoryOpen, setSocialHistoryOpen] = useState(false);
  const [profileCardOpen, setProfileCardOpen] = useState(true);

  // Local Editable States
  const [patient, setPatient] = useState<PatientInfo>(INITIAL_PATIENT);
  const [soapNotes, setSoapNotes] = useState<SoapNote[]>(INITIAL_SOAP_NOTES);
  const [diagnoses, setDiagnoses] = useState<DiagnosisItem[]>(INITIAL_DIAGNOSES);
  const [teeth, setTeeth] = useState<ToothState[]>(INITIAL_TEETH_STATE);

  // SOAP Note Form
  const [newSubj, setNewSubj] = useState('');
  const [newObj, setNewObj] = useState('');
  const [newAssess, setNewAssess] = useState('');
  const [newPlan, setNewPlan] = useState('');

  // Selected tooth on Interactive Chart
  const [selectedToothNum, setSelectedToothNum] = useState<string>('11');

  // Diagnostics / Viewers States
  const [cbctPlane, setCbctPlane] = useState<'Axial' | 'Sagittal' | 'Coronal'>('Axial');
  const [cbctSlice, setCbctSlice] = useState<number>(45);
  const [stlRotate, setStlRotate] = useState<number>(0);
  const [stlType, setStlType] = useState<'Upper' | 'Lower' | 'Bite' | 'Waxup'>('Upper');

  // AI Copilot simulation
  const [aiPromptResponse, setAiPromptResponse] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // New Prescription Form
  const [prescriptions, setPrescriptions] = useState([
    { id: 'Rx-01', rxName: 'Amoxicillin 500mg', instructions: 'Contraindicated (Allergic - Sulfa/Penicillin Alert)', status: 'Void' },
    { id: 'Rx-02', rxName: 'Chlorhexidine Gluconate 0.12% Oral Rinse', instructions: 'Rinse 15ml twice daily post-brushing for 14 days', status: 'Active' },
    { id: 'Rx-03', rxName: 'Ibuprofen 600mg Tablets', instructions: 'Take 1 tablet every 6 hours as needed for surgical post-op pain', status: 'Active' }
  ]);
  const [newRxName, setNewRxName] = useState('');
  const [newRxInst, setNewRxInst] = useState('');

  const tabsConfig = [
    {
      group: 'Summary & Intelligence',
      items: [
        { name: 'Visual Profile', icon: Sparkles },
        { name: 'Overview', icon: FolderOpen },
        { name: 'Timeline', icon: History },
        { name: 'AI Copilot', icon: Sparkles }
      ]
    },
    {
      group: 'Clinical Records',
      items: [
        { name: 'SOAP Notes', icon: FileText },
        { name: 'Diagnosis', icon: Activity },
        { name: 'Prescriptions', icon: Layers }
      ]
    },
    {
      group: 'Clinical Histories',
      items: [
        { name: 'Medical History', icon: Heart },
        { name: 'Dental History', icon: User }
      ]
    },
    {
      group: 'Planning & Operative',
      items: [
        { name: 'Treatment Plan', icon: FileCheck },
        { name: 'Dental Chart', icon: Database },
        { name: 'Lab Cases', icon: Sliders }
      ]
    },
    {
      group: 'Medical Imaging',
      items: [
        { name: 'Radiographs', icon: HardDrive },
        { name: 'CBCT', icon: Sliders },
        { name: 'Intraoral Scans', icon: Eye },
        { name: 'STL Files', icon: RotateCw }
      ]
    },
    {
      group: 'Administration',
      items: [
        { name: 'Documents', icon: FileSpreadsheet },
        { name: 'Consent Forms', icon: Shield },
        { name: 'Billing Summary', icon: CreditCard }
      ]
    }
  ];

  // Helper colors for Tooth Status
  const getToothStatusColor = (status: ToothState['status']) => {
    switch (status) {
      case 'Implant': return 'bg-emerald-500 border-emerald-400 text-white';
      case 'Bridge': return 'bg-sky-500 border-sky-400 text-white';
      case 'Crown': return 'bg-purple-500 border-purple-400 text-white';
      case 'Missing': return 'bg-zinc-800 border-zinc-700 text-zinc-500 line-through';
      case 'RCT': return 'bg-amber-600 border-amber-500 text-white';
      case 'Caries': return 'bg-rose-600 border-rose-500 text-white animate-pulse';
      case 'Existing Filling': return 'bg-zinc-500 border-zinc-400 text-white';
      case 'Healthy':
      default:
        return 'bg-zinc-900 border-zinc-700 text-zinc-300';
    }
  };

  // Click tooth handler to assign status
  const updateToothStatus = (num: string, newStatus: ToothState['status']) => {
    setTeeth(prev => prev.map(t => t.num === num ? { ...t, status: newStatus } : t));
  };

  // Selected tooth details
  const currentSelectedTooth = useMemo(() => {
    return teeth.find(t => t.num === selectedToothNum);
  }, [teeth, selectedToothNum]);

  // AI actions triggers
  const triggerCopilotAction = (actionType: 'summary' | 'soap' | 'prescription' | 'patient_exp') => {
    setIsAiLoading(true);
    setAiPromptResponse('');
    setTimeout(() => {
      setIsAiLoading(false);
      if (actionType === 'summary') {
        setAiPromptResponse(
          `**CLINICAL SUMMARY: AMELIA VANCE**\n\n` +
          `- **Primary Restoration Area:** Congenitally missing tooth #11 with high aesthetic requirements. Bone width is measured at 7.2mm on axial plane.\n` +
          `- **Key Physiological Alerts:** Mitral Valve Prolapse requires careful cardiovascular monitor during localized epinephrine administration. Mild Bleeding Tendency suggests precise suture tensioning.\n` +
          `- **Pathology Alert:** Active carious lesion noted on Dentin #14 (K02.61). Requires conservative class I composite restoration post-implant.`
        );
      } else if (actionType === 'soap') {
        const generatedSoap = {
          id: `S-${Math.floor(Math.random() * 900) + 200}`,
          date: new Date().toISOString().split('T')[0],
          clinician: 'Dr. Elena Rostova (AI Assist)',
          subjective: 'Patient reports mild apprehension regarding implant placement. Denies pain in other quadrants.',
          objective: 'Periodontal probing depths are within 2-3mm. Primary osteotomy site #11 marked via custom surgical guide. Bone volume verified.',
          assessment: 'Congenital absence of #11 with robust supporting alveolar bone. Non-smoker, good tissue quality.',
          plan: 'Proceed with stage I NobelActive titanium implant surgery. Direct placement of 4.3mm healing abutment. Follow-up 7 days.'
        };
        setSoapNotes(prev => [generatedSoap, ...prev]);
        setAiPromptResponse(`**SUCCESS: GENERATED SOAP NOTE SADDED TO TIMELINE**\n\nSee "SOAP Notes" tab to view/edit the generated clinically consistent note.`);
      } else if (actionType === 'prescription') {
        setAiPromptResponse(
          `**EXOCAD CAD/CAM DESIGN & LAB PRESCRIPTION SPECIFICATIONS**\n\n` +
          `**Patient:** Amelia Vance (EHR-2026-9482)\n` +
          `**Zone:** Tooth #11 Maxillary Canine Restoration\n` +
          `**Restoration Type:** Titanium Custom Abutment + Layered Zirconia Screw-Retained Crown\n` +
          `**Shade Specification:** Vita Master A1 Body, A2 cervical zone with 45% translucency on incisal edge.\n` +
          `**Technician Instructions:** Minimize emergence profile thickness to respect the interproximal gingival margin. Match anatomical features of #21 canine.`
        );
      } else if (actionType === 'patient_exp') {
        setAiPromptResponse(
          `**PATIENT-FRIENDLY CLINICAL EXPLANATION**\n\n` +
          `*Hello Amelia, here is a simplified explanation of your upcoming treatment:* \n\n` +
          `1. **What we are doing:** We are placing a tiny titanium tooth implant in the space where your canine (#11) is missing. The implant acts just like a strong root.\n` +
          `2. **The 3D Guide:** We designed a computer-generated guide that sits on your teeth during surgery to make sure the implant goes in with pinpoint precision.\n` +
          `3. **Why this helps you:** Once the implant is fully secure in the bone, we will attach a custom crown that matches your natural smile perfectly.`
        );
      }
    }, 850);
  };

  // Add new SOAP Note
  const handleAddSoapNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubj || !newObj || !newAssess || !newPlan) return;
    const newNote: SoapNote = {
      id: `S-${Math.floor(Math.random() * 900) + 300}`,
      date: new Date().toISOString().split('T')[0],
      clinician: 'Dr. Elena Rostova',
      subjective: newSubj,
      objective: newObj,
      assessment: newAssess,
      plan: newPlan
    };
    setSoapNotes([newNote, ...soapNotes]);
    setNewSubj('');
    setNewObj('');
    setNewAssess('');
    setNewPlan('');
  };

  // Add Prescription
  const handleAddPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRxName) return;
    setPrescriptions([
      ...prescriptions,
      {
        id: `Rx-${Math.floor(Math.random() * 900) + 100}`,
        rxName: newRxName,
        instructions: newRxInst || 'Take as directed by doctor',
        status: 'Active'
      }
    ]);
    setNewRxName('');
    setNewRxInst('');
  };

  return (
    <div className="space-y-6 text-[var(--text)] animate-fade-in">

      {/* ==================================================
          1. PATIENT HEADER (HIPAA Compliant)
          ================================================== */}
      <div id="patient-header" className="relative card-gradient p-6 space-y-4">
        <AmbientGlow className="-top-24 -end-28 w-72 h-72 opacity-60" />
        <AmbientGlow className="-bottom-32 -start-24 w-80 h-80 opacity-40 pulse-glow" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Avatar and Name */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-full border-2 border-emerald-500 overflow-hidden shrink-0">
              <Image 
                src={patient.avatar} 
                alt={patient.name} 
                fill 
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="section-title text-xl">{patient.name}</h1>
                <span className="badge badge-success font-mono">
                  {patient.id}
                </span>
              </div>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 font-mono">
                <span className="font-bold text-zinc-300">AGE:</span> {patient.age} y/o 
                <span className="text-zinc-600">|</span> 
                <span className="font-bold text-zinc-300">GENDER:</span> {patient.gender} 
                <span className="text-zinc-600">|</span> 
                <span className="font-bold text-emerald-400">BLOOD:</span> {patient.bloodGroup}
              </p>
              <p className="text-xs text-zinc-500 font-mono">
                {patient.phone} • {patient.email}
              </p>
            </div>
          </div>

          {/* Core Metrics & Dates */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 card-elevated p-4 text-xs shrink-0 font-mono">
            <div>
              <span className="text-zinc-500 block uppercase font-bold text-2xs">Primary Dentist</span>
              <span className="text-zinc-200 font-semibold">{patient.primaryDentist}</span>
            </div>
            <div>
              <span className="text-zinc-500 block uppercase font-bold text-2xs">Last Visit</span>
              <span className="text-zinc-200">{patient.lastVisit}</span>
            </div>
            <div>
              <span className="text-zinc-500 block uppercase font-bold text-2xs">Next Scheduled</span>
              <span className="text-emerald-400 font-bold">{patient.nextVisit}</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-zinc-500 block uppercase font-bold text-2xs">Active Protocol</span>
              <span className="text-purple-400 font-bold">Implant #11 Maxilla</span>
            </div>
          </div>

        </div>

        {/* Alerts and Allergies Section */}
        <div className="relative flex flex-wrap gap-2.5 border-t border-zinc-800/80 pt-4">
          <div className="flex items-center gap-1.5 text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-xl font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span className="uppercase font-mono text-2xs">Allergies:</span>
            <span>{patient.allergies.join(', ')}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-xl font-bold">
            <Activity className="w-4 h-4" />
            <span className="uppercase font-mono text-2xs">Medical Alerts:</span>
            <span>{patient.medicalAlerts.join(', ')}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-xl font-bold">
            <Layers className="w-4 h-4" />
            <span className="uppercase font-mono text-2xs">Treatment Focus:</span>
            <span>{patient.currentTreatment}</span>
          </div>
        </div>
      </div>

      {/* ==================================================
          2. WORKSPACE GRID: SIDEBAR TABS & ACTIVE VIEW
          ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side Navigation (EHR Tab Groups) */}
        <div className="lg:col-span-3 space-y-4 card-elevated p-4">
          <div className="px-2 pb-2 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-black tracking-wider uppercase text-[var(--text-muted)] font-mono flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[var(--accent)]" /> EHR Explorer Panel
            </span>
            <span className="text-2xs font-mono text-[var(--text-muted)] font-bold">v3.5.0-PRO</span>
          </div>

          <div className="space-y-4">
            {tabsConfig.map((group) => (
              <div key={group.group} className="space-y-1">
                <h4 className="text-2xs font-bold text-[var(--text-muted)] uppercase tracking-widest px-2 font-mono">{group.group}</h4>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = activeTab === item.name;
                    return (
                      <button
                        key={item.name}
                        onClick={() => setActiveTab(item.name)}
                        className={`nav-item justify-between w-full text-xs ${
                          isActive ? 'active font-bold' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <IconComponent className={`w-4 h-4 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
                          <span>{item.name}</span>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-[var(--accent)] opacity-80' : 'text-[var(--text-muted)] opacity-50'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side Content Panel */}
        <div className="lg:col-span-9 card-gradient p-6 min-h-[640px] flex flex-col justify-between">

          {/* Header Title for Current Tab */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
            <div>
              <h3 className="section-title text-base flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--accent)', boxShadow: '0 0 12px var(--accent-glow)' }} />
                {activeTab}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Clinical dashboard data segment of the electronic health chart.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> Last updated: Just now
              </span>
              <button 
                onClick={() => window.print()} 
                className="btn-secondary p-2 cursor-pointer"
                title="Print EHR Segment"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Tab Component Renderings */}
          <div className="flex-1">

            {activeTab === 'Visual Profile' && (
              <div className="space-y-6 animate-fade-in relative">
                {/* Background Red/Orange Glow */}
                <div className="absolute top-12 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 rtl:translate-x-1/2 w-80 h-48 rounded-full blur-[100px] pointer-events-none z-0 pulse-glow" style={{ background: 'var(--accent-glow2)' }} />
                
                {/* 1. Header controls (hexagon, sliders, bell) */}
                <div className="relative z-10 card-gradient flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold" style={{ background: 'var(--accent-glow2)', color: 'var(--accent)', border: '1px solid var(--border-strong)' }}>
                      {/* Hexagon shape */}
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">Clinical Visual Profile</h4>
                      <p className="text-2xs text-zinc-500 font-mono uppercase">Node: {patient.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-glow2)', color: 'var(--accent)', border: '1px solid var(--border-strong)' }}>
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center relative" style={{ background: 'var(--accent-glow2)', color: 'var(--accent)', border: '1px solid var(--border-strong)' }}>
                      <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1 end-1 border border-zinc-950" />
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 2. Accordions */}
                <div className="relative z-10 space-y-3">
                  {/* Family History */}
                  <div className="card-elevated overflow-hidden">
                    <button 
                      onClick={() => setFamilyHistoryOpen(!familyHistoryOpen)}
                      className="w-full flex items-center justify-between p-5 text-sm font-bold text-white hover:bg-zinc-900/40 transition-colors"
                    >
                      <span>Record: Family History</span>
                      <svg 
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                        className={`transition-transform duration-200 ${familyHistoryOpen ? 'rotate-180' : ''}`}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                    {familyHistoryOpen && (
                      <div className="p-5 border-t border-zinc-900/80 text-xs text-zinc-400 space-y-2 leading-relaxed">
                        <p>• Maternal Grandmother: Diagnosed with Type II Diabetes, managed under standard insulin protocol.</p>
                        <p>• Paternal Uncle: History of early-onset cardiovascular disease (Myocardial Infarction at age 48).</p>
                        <p>• No recorded history of congenital anomalies or amelogenesis imperfecta.</p>
                      </div>
                    )}
                  </div>

                  {/* Social History */}
                  <div className="card-elevated overflow-hidden">
                    <button 
                      onClick={() => setSocialHistoryOpen(!socialHistoryOpen)}
                      className="w-full flex items-center justify-between p-5 text-sm font-bold text-white hover:bg-zinc-900/40 transition-colors"
                    >
                      <span>Anamnesis: Social History</span>
                      <svg 
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                        className={`transition-transform duration-200 ${socialHistoryOpen ? 'rotate-180' : ''}`}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                    {socialHistoryOpen && (
                      <div className="p-5 border-t border-zinc-900/80 text-xs text-zinc-400 space-y-2 leading-relaxed">
                        <p>• Occupation: Senior software developer, high visual workstation strain.</p>
                        <p>• Habits: Occasional social wine consumer (1-2 units weekly). Non-smoker.</p>
                        <p>• Diet: High acidic beverage intake (black coffee, citrus water), monitored for micro-erosion.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Patient Profile Card */}
                <div className="relative z-10 card-elevated p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">Patient Profile</h4>
                      <p className="text-2xs text-zinc-500 uppercase font-mono mt-0.5">Summary Case Data</p>
                    </div>
                    <button 
                      onClick={() => setProfileCardOpen(!profileCardOpen)}
                      className="btn-ghost p-1.5 cursor-pointer"
                    >
                      <svg 
                        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                        className={`transition-transform duration-200 ${profileCardOpen ? '' : 'rotate-180'}`}
                      >
                        <path d="M18 15l-6-6-6 6" />
                      </svg>
                    </button>
                  </div>

                  {profileCardOpen && (
                    <div className="space-y-6">
                      {/* Grid Data */}
                      <div className="grid grid-cols-3 gap-4 text-xs font-sans">
                        <div>
                          <span className="text-2xs font-bold text-zinc-500 block uppercase tracking-wider font-mono">Age:</span>
                          <span className="text-white font-medium block mt-1">{patient.age} / {patient.gender === 'Female' ? 'Female' : 'Male'}</span>
                        </div>
                        <div>
                          <span className="text-2xs font-bold text-zinc-500 block uppercase tracking-wider font-mono">Gender:</span>
                          <span className="text-white font-medium block mt-1">{patient.gender}</span>
                        </div>
                        <div>
                          <span className="text-2xs font-bold text-zinc-500 block uppercase tracking-wider font-mono">Ethnicity:</span>
                          <span className="text-white font-medium block mt-1">Other / Caucasian</span>
                        </div>
                      </div>

                      {/* Weight and Trend */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-2xs font-bold text-zinc-500 uppercase tracking-wider font-mono">Weight and Trend</span>
                          <span className="text-white font-bold text-sm">63.6 kg</span>
                        </div>
                        {/* Custom Dash/Dot SVG sparkline */}
                        <div className="py-2.5 card-elevated px-4 flex items-center">
                          <svg className="w-full h-4 text-white/50" viewBox="0 0 400 20" preserveAspectRatio="none">
                            <line 
                              x1="10" y1="10" x2="390" y2="10" 
                              stroke="currentColor" 
                              strokeWidth="3.5" 
                              strokeLinecap="round" 
                              strokeDasharray="2 6 20 6 35 6 3 6 6 6 3 6 45 6 15 6 3 6"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Biological Age */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-4 border-t border-zinc-900/60">
                        <div>
                          <span className="text-2xs font-bold text-zinc-500 block uppercase tracking-wider font-mono">Biological Age</span>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs font-mono text-zinc-500">ID: SV-7294</span>
                            <div className="flex items-center gap-1.5 badge badge-danger">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                              Critical
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 card-elevated p-3">
                          <div className="flex items-center justify-between gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              <span className="text-rose-400 font-bold font-mono">31.2</span>
                            </div>
                            <div className="w-24 bg-zinc-900 h-1.5 rounded-full overflow-hidden relative">
                              <div className="bg-rose-500 h-full rounded-full" style={{ width: '85%' }} />
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span className="text-emerald-400 font-bold font-mono">19.2</span>
                            </div>
                            <div className="w-24 bg-zinc-900 h-1.5 rounded-full overflow-hidden relative">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '45%' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Clinical Folder Sleeves (Tomography & Radiography) */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  {/* Tomography Folder Sleeve */}
                  <div className="card-gradient p-5 group min-h-[240px] flex flex-col justify-between card-hover cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-bold text-white text-base">Tomography</h5>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">Jan 12, 2020</p>
                      </div>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center group-hover:text-white transition-colors" style={{ background: 'var(--accent-glow2)', color: 'var(--accent)', border: '1px solid var(--border-strong)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                      </div>
                    </div>

                    {/* Popping-out radiography scan stacked previews */}
                    <div className="relative h-24 mt-4 flex items-center justify-center">
                      {/* Scan Left */}
                      <div className="absolute w-20 h-24 bg-zinc-950 border border-zinc-850 rounded-xl overflow-hidden shadow-card transition-all duration-300 transform -rotate-12 -translate-x-7 group-hover:-translate-y-4 group-hover:-rotate-15">
                        <img src="https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=200&h=200&fit=crop" className="w-full h-full object-cover opacity-50 filter grayscale contrast-125 select-none pointer-events-none" />
                      </div>
                      {/* Scan Right */}
                      <div className="absolute w-20 h-24 bg-zinc-950 border border-zinc-850 rounded-xl overflow-hidden shadow-card transition-all duration-300 transform rotate-12 translate-x-7 group-hover:-translate-y-4 group-hover:rotate-15">
                        <img src="https://images.unsplash.com/photo-1559757175-006f15d7426c?q=80&w=200&h=200&fit=crop" className="w-full h-full object-cover opacity-50 filter grayscale contrast-125 select-none pointer-events-none" />
                      </div>
                      {/* Scan Center */}
                      <div className="absolute w-24 h-28 bg-zinc-950 border border-zinc-700 rounded-xl overflow-hidden shadow-card transition-all duration-300 transform group-hover:-translate-y-6 group-hover:scale-105 z-10 flex flex-col justify-end">
                        <img src="https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=200&h=200&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-75 filter grayscale contrast-125 select-none pointer-events-none" />
                        <span className="relative z-10 w-full bg-zinc-950/80 text-center py-1 font-mono text-2xs text-zinc-400 border-t border-zinc-850">image: 12</span>
                      </div>
                    </div>
                  </div>

                  {/* Radiography Folder Sleeve */}
                  <div className="card-gradient p-5 group min-h-[240px] flex flex-col justify-between card-hover cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-bold text-white text-base">Radiography</h5>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">Feb 14, 2022</p>
                      </div>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center group-hover:text-white transition-colors" style={{ background: 'var(--accent-glow2)', color: 'var(--accent)', border: '1px solid var(--border-strong)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                      </div>
                    </div>

                    {/* Popping-out radiography scan stacked previews */}
                    <div className="relative h-24 mt-4 flex items-center justify-center">
                      {/* Scan Left */}
                      <div className="absolute w-20 h-24 bg-zinc-950 border border-zinc-850 rounded-xl overflow-hidden shadow-card transition-all duration-300 transform -rotate-12 -translate-x-7 group-hover:-translate-y-4 group-hover:-rotate-15">
                        <img src="https://images.unsplash.com/photo-1559757175-006f15d7426c?q=80&w=200&h=200&fit=crop" className="w-full h-full object-cover opacity-50 filter grayscale contrast-125 select-none pointer-events-none" />
                      </div>
                      {/* Scan Right */}
                      <div className="absolute w-20 h-24 bg-zinc-950 border border-zinc-850 rounded-xl overflow-hidden shadow-card transition-all duration-300 transform rotate-12 translate-x-7 group-hover:-translate-y-4 group-hover:rotate-15">
                        <img src="https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=200&h=200&fit=crop" className="w-full h-full object-cover opacity-50 filter grayscale contrast-125 select-none pointer-events-none" />
                      </div>
                      {/* Scan Center */}
                      <div className="absolute w-24 h-28 bg-zinc-950 border border-zinc-700 rounded-xl overflow-hidden shadow-card transition-all duration-300 transform group-hover:-translate-y-6 group-hover:scale-105 z-10 flex flex-col justify-end">
                        <img src="https://images.unsplash.com/photo-1579684389782-64d84b5e901d?q=80&w=200&h=200&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-75 filter grayscale contrast-125 select-none pointer-events-none" />
                        <span className="relative z-10 w-full bg-zinc-950/80 text-center py-1 font-mono text-2xs text-zinc-400 border-t border-zinc-850">image: 14</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================
                3. OVERVIEW TAB
                ================================================== */}
            {activeTab === 'Overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  
                  {/* Summary Card */}
                  <div className="p-4 card-elevated space-y-2">
                    <span className="text-2xs font-black uppercase tracking-wider text-zinc-500 font-mono block">Patient Summary</span>
                    <p className="text-xs text-zinc-300 leading-normal">
                      Amelia is a 34 y/o healthy female patient currently in the restorative phase of an aesthetic implant reconstruction. 
                      She presents with a congenitally missing maxillary right lateral incisor (#11) with mild bone resorption. Oral hygiene is excellent.
                    </p>
                  </div>

                  {/* Medical Conditions */}
                  <div className="p-4 card-elevated space-y-2">
                    <span className="text-2xs font-black uppercase tracking-wider text-zinc-500 font-mono block">Medical Conditions</span>
                    <ul className="text-xs space-y-1.5 text-zinc-300">
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Mild Mitral Valve Prolapse</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Mild Bleeding Tendency</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-zinc-600" /> Otherwise Healthy systemic history</li>
                    </ul>
                  </div>

                  {/* Medications & Allergies */}
                  <div className="p-4 card-elevated space-y-2">
                    <span className="text-2xs font-black uppercase tracking-wider text-zinc-500 font-mono block">Medications & Allergies</span>
                    <div className="space-y-2">
                      <div>
                        <span className="text-2xs font-bold text-zinc-500 uppercase block font-mono">Current Meds:</span>
                        <span className="text-xs text-zinc-300 font-mono">Ibuprofen 600mg (prn), Lisinopril 10mg (daily)</span>
                      </div>
                      <div>
                        <span className="text-2xs font-bold text-rose-400 uppercase block font-mono">Contraindicated:</span>
                        <span className="text-xs text-rose-300 font-bold font-mono">Penicillin, Sulfa, Latex</span>
                      </div>
                    </div>
                  </div>

                  {/* Treatment Progress */}
                  <div className="p-4 card-elevated space-y-2">
                    <span className="text-2xs font-black uppercase tracking-wider text-zinc-500 font-mono block">Treatment Progress</span>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono font-bold">
                        <span>Restoration #11</span>
                        <span className="text-emerald-400">75% Complete</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '75%' }} />
                      </div>
                      <span className="text-2xs text-zinc-500 block">Status: Surgical guide approved, awaiting stage I implant surgery.</span>
                    </div>
                  </div>

                  {/* Upcoming Appointment */}
                  <div className="p-4 card-elevated space-y-2">
                    <span className="text-2xs font-black uppercase tracking-wider text-zinc-500 font-mono block">Upcoming Appointment</span>
                    <div className="space-y-1">
                      <p className="text-xs text-zinc-200 font-bold">July 20, 2026 at 09:00 AM</p>
                      <p className="text-xs text-zinc-400">Dr. Elena Rostova - Surgery Suite A</p>
                      <span className="inline-block text-2xs font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">
                        STAGE I SURGERY
                      </span>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="p-4 card-elevated space-y-2">
                    <span className="text-2xs font-black uppercase tracking-wider text-zinc-500 font-mono block">Financial Summary</span>
                    <div className="space-y-1 text-xs font-mono">
                      <div className="flex justify-between text-zinc-400"><span>Estimated Cost:</span> <span>$8,450.00</span></div>
                      <div className="flex justify-between text-emerald-400"><span>Ins. Pre-Auth:</span> <span>-$4,200.00</span></div>
                      <div className="flex justify-between text-white font-bold border-t border-zinc-850 pt-1">
                        <span>Patient Due:</span> <span>$4,250.00</span>
                      </div>
                    </div>
                  </div>

                  {/* Outstanding Lab Cases */}
                  <div className="p-4 card-elevated space-y-2 md:col-span-2">
                    <span className="text-2xs font-black uppercase tracking-wider text-zinc-500 font-mono block">Outstanding Lab Cases</span>
                    <div className="flex items-center justify-between text-xs bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                      <div>
                        <span className="font-bold text-zinc-200 block">Surgical Drill Guide #11 (Stereolithography)</span>
                        <span className="text-2xs text-zinc-500 font-mono">Lab Case ID: L-9201-B</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-2xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        MILLING COMPLETE / IN TRANSIT
                      </span>
                    </div>
                  </div>

                  {/* Recent Images */}
                  <div className="p-4 card-elevated space-y-2">
                    <span className="text-2xs font-black uppercase tracking-wider text-zinc-500 font-mono block">Recent Images</span>
                    <div className="flex gap-2">
                      <div className="w-12 h-12 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center relative overflow-hidden text-2xs font-bold text-zinc-500" title="CBCT Slice">CBCT</div>
                      <div className="w-12 h-12 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center relative overflow-hidden text-2xs font-bold text-zinc-500" title="Panoramic">PANO</div>
                      <div className="w-12 h-12 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center relative overflow-hidden text-2xs font-bold text-zinc-500" title="Intraoral Scan">STL</div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ==================================================
                4. MEDICAL HISTORY TAB
                ================================================== */}
            {activeTab === 'Medical History' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-4">
                    <div className="p-4 card-elevated space-y-2">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Systemic & Medical Conditions</h4>
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 flex justify-between">
                          <span className="font-bold text-zinc-300">Mitral Valve Prolapse</span>
                          <span className="text-amber-400 font-mono font-bold uppercase text-2xs">Moderate Precaution</span>
                        </div>
                        <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 flex justify-between">
                          <span className="font-bold text-zinc-300">Mild Bleeding Tendency</span>
                          <span className="text-rose-400 font-mono font-bold uppercase text-2xs">Bleeding Alert</span>
                        </div>
                        <div className="p-2.5 rounded bg-zinc-900 border border-zinc-850 text-zinc-500 italic">
                          No history of diabetes, asthma, hepatitis, or respiratory pathology.
                        </div>
                      </div>
                    </div>

                    <div className="p-4 card-elevated space-y-2">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Surgeries & Hospitalizations</h4>
                      <ul className="text-xs space-y-2 text-zinc-400">
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">&bull;</span>
                          <div>
                            <span className="text-zinc-200 font-bold">Appendectomy (2018)</span>
                            <span className="block text-2xs text-zinc-500">Hospitalized 3 days due to acute appendicitis. Completely resolved.</span>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">&bull;</span>
                          <div>
                            <span className="text-zinc-200 font-bold">Tonsillectomy (2012)</span>
                            <span className="block text-2xs text-zinc-500">Outpatient procedure. No complications.</span>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 card-elevated space-y-2">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Social & Family Medical Background</h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-850">
                          <span className="text-2xs text-zinc-500 uppercase block font-mono">Smoking Status</span>
                          <span className="text-emerald-400 font-bold font-mono">NON-SMOKER</span>
                        </div>
                        <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-850">
                          <span className="text-2xs text-zinc-500 uppercase block font-mono">Pregnancy Status</span>
                          <span className="text-zinc-400 font-bold font-mono">NOT PREGNANT</span>
                        </div>
                        <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-850 col-span-2">
                          <span className="text-2xs text-zinc-500 uppercase block font-mono">Family Genotypes / Risks</span>
                          <span className="text-zinc-300 block font-mono">Maternal: Type II Diabetes</span>
                          <span className="text-zinc-300 block font-mono">Paternal: Essential Hypertension</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 card-elevated space-y-2">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Clinical Risk Assessment</h4>
                      <div className="space-y-2.5 text-xs font-mono">
                        <div>
                          <div className="flex justify-between font-bold">
                            <span>Infection Risk</span>
                            <span className="text-emerald-400">Low (No systemic compromise)</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden mt-1">
                            <div className="bg-emerald-500 h-full" style={{ width: '20%' }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between font-bold">
                            <span>Bone Healing Capacity</span>
                            <span className="text-emerald-400">Excellent (Non-smoker)</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden mt-1">
                            <div className="bg-emerald-500 h-full" style={{ width: '90%' }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between font-bold">
                            <span>Bleeding Tendency Rate</span>
                            <span className="text-amber-400">Moderate (PT/INR levels normal, but historical epistaxis)</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden mt-1">
                            <div className="bg-amber-500 h-full" style={{ width: '45%' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ==================================================
                5. DENTAL HISTORY TAB
                ================================================== */}
            {activeTab === 'Dental History' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  
                  <div className="p-4 card-elevated space-y-3">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Surgical & Restorative History</h4>
                    <ul className="space-y-2 text-zinc-300">
                      <li className="flex justify-between items-center bg-zinc-900 p-2 rounded border border-zinc-850">
                        <span>#14 Implant Nobel Biocare Titanium (Restored 2024)</span>
                        <span className="text-2xs font-mono text-zinc-500 font-bold">SUCCESSFUL</span>
                      </li>
                      <li className="flex justify-between items-center bg-zinc-900 p-2 rounded border border-zinc-850">
                        <span>#19 Porcelain-Fused-to-Metal Crown (Restored 2021)</span>
                        <span className="text-2xs font-mono text-zinc-500">STABLE</span>
                      </li>
                      <li className="flex justify-between items-center bg-zinc-900 p-2 rounded border border-zinc-850">
                        <span>#3 and #4 Class II Composite Restorations (2020)</span>
                        <span className="text-2xs font-mono text-zinc-500">STABLE</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 card-elevated space-y-3">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Endodontic & Extraction History</h4>
                    <ul className="space-y-2 text-zinc-300">
                      <li className="flex justify-between items-center bg-zinc-900 p-2 rounded border border-zinc-850">
                        <span>#19 Root Canal Therapy (Completed 2021)</span>
                        <span className="text-2xs font-mono text-zinc-500 font-bold">STABLE</span>
                      </li>
                      <li className="flex justify-between items-center bg-zinc-900 p-2 rounded border border-zinc-850">
                        <span>#12 Root Canal Therapy (Completed 2019)</span>
                        <span className="text-2xs font-mono text-zinc-500">STABLE</span>
                      </li>
                      <li className="flex justify-between items-center bg-zinc-900 p-2 rounded border border-zinc-850">
                        <span>Surgical extraction of teeth #1, #16, #17, #32 (Wisdom teeth - 2010)</span>
                        <span className="text-2xs font-mono text-emerald-400 font-bold">HEALED</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 card-elevated space-y-3">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Orthodontic Profile</h4>
                    <div className="p-3 rounded bg-zinc-900 border border-zinc-850 space-y-1.5 text-zinc-300">
                      <p className="font-bold text-white">Invisalign Treatment (2015):</p>
                      <p>Completed 18-month minor crowding realignment. Retainers worn at night. Stable occlusion maintained since completion.</p>
                    </div>
                  </div>

                  <div className="p-4 card-elevated space-y-3">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Periodontal History</h4>
                    <div className="p-3 rounded bg-zinc-900 border border-zinc-850 space-y-1.5 text-zinc-300 font-mono">
                      <div className="flex justify-between"><span>Average Pocket Depths:</span> <span className="text-emerald-400">2 - 3 mm</span></div>
                      <div className="flex justify-between"><span>Bone Loss Index:</span> <span className="text-emerald-400">0% (Excellent Height)</span></div>
                      <div className="flex justify-between"><span>Gingival Bleeding Index:</span> <span className="text-amber-400">Localized 5%</span></div>
                      <p className="text-2xs text-zinc-500 font-sans mt-1">Undergoes prophylaxis regular recall intervals every 6 months.</p>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ==================================================
                6. SOAP NOTES TAB (Editable Mock Notes)
                ================================================== */}
            {activeTab === 'SOAP Notes' && (
              <div className="space-y-6">
                
                {/* SOAP Note Entry Form */}
                <form onSubmit={handleAddSoapNote} className="p-4 card-gradient space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-emerald-400" /> Compile New Clinical SOAP Entry
                    </span>
                    <span className="text-2xs text-zinc-500 font-mono">AUTO-SAVED IN HIPAA SYNC</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-zinc-500 font-bold block">Subjective (Symptoms, patient quotes)</label>
                      <textarea
                        value={newSubj}
                        onChange={(e) => setNewSubj(e.target.value)}
                        placeholder="Patient reports no discomfort. Happy with provisional..."
                        className="w-full h-20 p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 outline-none focus:border-emerald-500 font-sans resize-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-500 font-bold block">Objective (Measurements, scans, exams)</label>
                      <textarea
                        value={newObj}
                        onChange={(e) => setNewObj(e.target.value)}
                        placeholder="Clinical exam reveals stable provisional crown. Probing depths 2mm..."
                        className="w-full h-20 p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 outline-none focus:border-emerald-500 font-sans resize-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-500 font-bold block">Assessment (Diagnosis, medical logic)</label>
                      <textarea
                        value={newAssess}
                        onChange={(e) => setNewAssess(e.target.value)}
                        placeholder="Concomitant ridge healing complete. Ready for surgical guides..."
                        className="w-full h-20 p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 outline-none focus:border-emerald-500 font-sans resize-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-500 font-bold block">Plan (Action items, drugs, next visits)</label>
                      <textarea
                        value={newPlan}
                        onChange={(e) => setNewPlan(e.target.value)}
                        placeholder="Proceed with NobelActive osteotomy placement on July 20..."
                        className="w-full h-20 p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 outline-none focus:border-emerald-500 font-sans resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={!newSubj || !newObj || !newAssess || !newPlan}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg text-xs font-bold font-mono transition-all disabled:opacity-30 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> Commit Note to HIPAA Database
                    </button>
                  </div>
                </form>

                {/* Notes Chronology */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider font-mono">Historical Clinical SOAP Timeline</h4>
                  <div className="space-y-3">
                    {soapNotes.map((note) => (
                      <div key={note.id} className="p-4 card-elevated space-y-2.5 text-xs">
                        <div className="flex justify-between items-center border-b border-zinc-850/60 pb-1.5 font-mono">
                          <span className="font-bold text-zinc-300">{note.clinician}</span>
                          <span className="text-zinc-500 text-xs font-bold">{note.date} • {note.id}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-zinc-400">
                          <div>
                            <span className="text-2xs font-bold uppercase tracking-wider text-emerald-400 font-mono block">Subjective:</span>
                            <p className="leading-relaxed">{note.subjective}</p>
                          </div>
                          <div>
                            <span className="text-2xs font-bold uppercase tracking-wider text-emerald-400 font-mono block">Objective:</span>
                            <p className="leading-relaxed">{note.objective}</p>
                          </div>
                          <div>
                            <span className="text-2xs font-bold uppercase tracking-wider text-emerald-400 font-mono block">Assessment:</span>
                            <p className="leading-relaxed">{note.assessment}</p>
                          </div>
                          <div>
                            <span className="text-2xs font-bold uppercase tracking-wider text-emerald-400 font-mono block">Plan:</span>
                            <p className="leading-relaxed">{note.plan}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ==================================================
                7. DIAGNOSIS TAB
                ================================================== */}
            {activeTab === 'Diagnosis' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-zinc-400 uppercase tracking-wider font-mono">Active ICD-10 Diagnoses & Pathology</span>
                  <span className="text-2xs font-mono text-zinc-500">EPIC EHR SYNCHRONIZED</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-zinc-850">
                  <table className="w-full text-start border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-950/80 text-zinc-500 font-mono uppercase text-2xs border-b border-zinc-850">
                        <th className="p-3">ICD-10 Code</th>
                        <th className="p-3">Diagnostic Description</th>
                        <th className="p-3">Tooth Location</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Onset Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850/60 font-mono text-zinc-300">
                      {diagnoses.map((dx) => (
                        <tr key={dx.id} className="hover:bg-zinc-950/40">
                          <td className="p-3 font-bold text-emerald-400">{dx.code}</td>
                          <td className="p-3 font-sans text-zinc-200 font-semibold">{dx.description}</td>
                          <td className="p-3 text-center">{dx.toothNo || 'General'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-2xs font-bold ${
                              dx.status === 'Active' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {dx.status}
                            </span>
                          </td>
                          <td className="p-3 text-zinc-500">{dx.onset}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950/30 border border-zinc-850 text-xs text-zinc-500 space-y-1">
                  <p className="font-bold text-zinc-400">Clinical Coding Standards Note:</p>
                  <p>All diagnostic indicators are aligned with WHO International Statistical Classification of Diseases (ICD-10 Dental Specialty Guidelines).</p>
                </div>
              </div>
            )}

            {/* ==================================================
                8. TREATMENT PLAN TAB
                ================================================== */}
            {activeTab === 'Treatment Plan' && (
              <div className="space-y-6">
                
                {/* Global Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                  <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1">
                    <span className="text-zinc-500 font-bold block uppercase text-2xs">Plan Estimate Cost</span>
                    <span className="text-base font-black text-white">$8,450.00</span>
                  </div>
                  <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1">
                    <span className="text-emerald-400 font-bold block uppercase text-2xs">Covered by Delta Dental</span>
                    <span className="text-base font-black text-emerald-400">-$4,200.00</span>
                  </div>
                  <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1">
                    <span className="text-amber-400 font-bold block uppercase text-2xs">Patient Out-of-Pocket</span>
                    <span className="text-base font-black text-amber-400">$4,250.00</span>
                  </div>
                </div>

                {/* Multiphase treatment planning */}
                <div className="space-y-4">
                  
                  {/* Phase 1: Surgical */}
                  <div className="p-4 card-elevated space-y-3">
                    <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Phase I: Surgical Osteotomy & Abutment</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-2xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        PENDING SCHEDULING
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-zinc-300">
                      <div className="p-2.5 rounded bg-zinc-900 border border-zinc-850 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-zinc-200 block">Procedure: Implant placement surgery #11</span>
                          <span className="text-2xs text-zinc-500 font-mono">D6010 • Surgical placement of implant body: endosteal</span>
                        </div>
                        <span className="font-mono text-zinc-400 font-bold">$2,800.00</span>
                      </div>
                      
                      <div className="p-2.5 rounded bg-zinc-900 border border-zinc-850 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-zinc-200 block">Procedure: Custom Abutment Mill & Try-in</span>
                          <span className="text-2xs text-zinc-500 font-mono">D6056 • Prefabricated abutment - includes placement</span>
                        </div>
                        <span className="font-mono text-zinc-400 font-bold">$1,250.00</span>
                      </div>
                    </div>
                  </div>

                  {/* Phase 2: Restorative */}
                  <div className="p-4 card-elevated space-y-3">
                    <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Phase II: Restorative Crowns</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-2xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        AUTHORIZED
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-zinc-300">
                      <div className="p-2.5 rounded bg-zinc-900 border border-zinc-850 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-zinc-200 block">Procedure: Screw-retained Zirconia Crown Placement #11</span>
                          <span className="text-2xs text-zinc-500 font-mono">D6065 • Implant supported porcelain/ceramic crown</span>
                        </div>
                        <span className="font-mono text-zinc-400 font-bold">$4,400.00</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ==================================================
                9. INTERACTIVE DENTAL CHART TAB
                ================================================== */}
            {activeTab === 'Dental Chart' && (
              <div className="space-y-6">
                
                <div className="p-4 card-elevated space-y-3 text-xs">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Clinical Restoration Toggle Map</h4>
                  <p className="text-zinc-500">Click a tooth in the rows below to inspect its status and map a physical restoration condition.</p>
                  
                  {/* Selected Tooth inspector */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-950 p-3 rounded-xl border border-zinc-850">
                    <div className="font-mono">
                      <span className="text-2xs text-zinc-500 uppercase block">Selected Tooth</span>
                      <span className="text-sm font-black text-white">Tooth #{selectedToothNum} {currentSelectedTooth?.isPrimary ? '(Primary - Deciduous)' : '(Adult - Permanent)'}</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs text-zinc-400">Current Status:</span>
                        <span className={`px-2 py-0.5 rounded text-2xs font-bold uppercase ${getToothStatusColor(currentSelectedTooth?.status || 'Healthy')}`}>
                          {currentSelectedTooth?.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {([
                        'Healthy', 'Implant', 'Bridge', 'Crown', 'Missing', 'RCT', 'Caries', 'Existing Filling'
                      ] as ToothState['status'][]).map((st) => (
                        <button
                          key={st}
                          onClick={() => updateToothStatus(selectedToothNum, st)}
                          className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-2xs text-zinc-300 border border-zinc-800 transition-all font-mono font-bold cursor-pointer"
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Teeth Rows Container */}
                <div className="space-y-6 overflow-x-auto pb-4">
                  
                  {/* UPPER ARCH (1-16) */}
                  <div className="space-y-1.5 min-w-[640px]">
                    <span className="text-2xs font-bold text-zinc-500 uppercase tracking-widest font-mono">Maxillary (Upper) Arch - Adults</span>
                    <div className="grid gap-1 font-mono text-center" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
                      {teeth.filter(t => !t.isPrimary && Number(t.num) <= 16).map(t => (
                        <button
                          key={t.num}
                          type="button"
                          onClick={() => setSelectedToothNum(t.num)}
                          className={`p-2 rounded border text-xs font-black transition-all cursor-pointer ${getToothStatusColor(t.status)} ${
                            selectedToothNum === t.num ? 'ring-2 ring-emerald-400 scale-110' : 'hover:scale-105'
                          }`}
                        >
                          {t.num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* LOWER ARCH (17-32) */}
                  <div className="space-y-1.5 min-w-[640px]">
                    <span className="text-2xs font-bold text-zinc-500 uppercase tracking-widest font-mono">Mandibular (Lower) Arch - Adults</span>
                    <div className="grid gap-1 font-mono text-center" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
                      {teeth.filter(t => !t.isPrimary && Number(t.num) >= 17).map(t => (
                        <button
                          key={t.num}
                          type="button"
                          onClick={() => setSelectedToothNum(t.num)}
                          className={`p-2 rounded border text-xs font-black transition-all cursor-pointer ${getToothStatusColor(t.status)} ${
                            selectedToothNum === t.num ? 'ring-2 ring-emerald-400 scale-110' : 'hover:scale-105'
                          }`}
                        >
                          {t.num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PRIMARY TEETH ARCH (A-T) */}
                  <div className="space-y-1.5 min-w-[640px]">
                    <span className="text-2xs font-bold text-zinc-500 uppercase tracking-widest font-mono">Deciduous (Primary / Baby) Arch - A to T</span>
                    <div className="grid gap-1 font-mono text-center" style={{ gridTemplateColumns: 'repeat(20, minmax(0, 1fr))' }}>
                      {teeth.filter(t => t.isPrimary).map(t => (
                        <button
                          key={t.num}
                          type="button"
                          onClick={() => setSelectedToothNum(t.num)}
                          className={`p-1.5 rounded border text-xs font-black transition-all cursor-pointer ${getToothStatusColor(t.status)} ${
                            selectedToothNum === t.num ? 'ring-2 ring-emerald-400 scale-110' : 'hover:scale-105'
                          }`}
                        >
                          {t.num}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* ==================================================
                10. RADIOGRAPHS TAB (Panoramic, Periapical, Bitewing, Smile Photos)
                ================================================== */}
            {activeTab === 'Radiographs' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  
                  {/* Panoramic Scan */}
                  <div className="p-4 card-elevated space-y-3">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Panoramic Radiographic Image</h4>
                    <div className="relative h-44 bg-zinc-950 border border-zinc-800 rounded flex flex-col items-center justify-center text-center p-4">
                      {/* Panoramic SVG visualization representation */}
                      <svg className="w-full h-full opacity-40" viewBox="0 0 200 100" fill="none" stroke="#a1a1aa" strokeWidth="1">
                        <path d="M 20 60 Q 100 10 180 60 Q 100 80 20 60 Z" />
                        <line x1="100" y1="10" x2="100" y2="80" />
                        {/* Teeth representations inside panoramic */}
                        <circle cx="50" cy="40" r="3" />
                        <circle cx="70" cy="35" r="3" />
                        <circle cx="90" cy="32" r="3" />
                        <circle cx="110" cy="32" r="3" />
                        <circle cx="130" cy="35" r="3" />
                        <circle cx="150" cy="40" r="3" />
                      </svg>
                      <div className="absolute text-xs text-zinc-400 font-mono font-bold bg-zinc-950/90 px-2 py-1 rounded border border-zinc-800">
                        Panoramic Scan (OPG) • 2026-05-10
                      </div>
                    </div>
                  </div>

                  {/* Smile Aesthetics Photos */}
                  <div className="p-4 card-elevated space-y-3">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">High-Definition Smile / Aesthetic Photos</h4>
                    <div className="relative h-44 bg-zinc-950 border border-zinc-800 rounded flex flex-col items-center justify-center text-center p-4">
                      <svg className="w-20 h-20 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="absolute text-xs text-zinc-400 font-mono font-bold bg-zinc-950/90 px-2 py-1 rounded border border-zinc-800">
                        DSLR Smile Profile • Awaiting Crown Placement
                      </div>
                    </div>
                  </div>

                  {/* Periapical & Bitewing Scans */}
                  <div className="p-4 card-elevated space-y-3">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Periapical Zoom Scan (#11 Osteotomy Site)</h4>
                    <div className="h-32 bg-zinc-950 border border-zinc-800 rounded flex items-center justify-center text-xs text-zinc-500 font-mono">
                      [High-Contrast Bone Density PA Radiograph • 12.4mm Ridge Height]
                    </div>
                  </div>

                  <div className="p-4 card-elevated space-y-3">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Bitewing Decay Scan (Left & Right Posterior Quadrants)</h4>
                    <div className="h-32 bg-zinc-950 border border-zinc-800 rounded flex items-center justify-center text-xs text-zinc-500 font-mono">
                      [Posterior Molar BW Scans • Verified Class I Composite #14 Dentin caries]
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ==================================================
                11. CBCT VIEWER TAB
                ================================================== */}
            {activeTab === 'CBCT' && (
              <div className="space-y-5">
                <div className="flex justify-between items-center bg-zinc-950 p-3 rounded-xl border border-zinc-850 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-2xs uppercase font-mono font-bold text-zinc-500">Slice Plane:</span>
                    <div className="inline-flex rounded-lg bg-zinc-900 p-0.5 border border-zinc-800">
                      {(['Axial', 'Sagittal', 'Coronal'] as const).map(plane => (
                        <button
                          key={plane}
                          onClick={() => setCbctPlane(plane)}
                          className={`px-2.5 py-1 rounded text-2xs font-bold font-mono transition-all ${
                            cbctPlane === plane ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-500 hover:text-white'
                          }`}
                        >
                          {plane}
                        </button>
                      ))}
                    </div>
                  </div>
                  <span className="font-mono text-2xs text-emerald-400 font-bold">11.5mm Vertical Ridge Clearance</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  
                  {/* Viewport viewport */}
                  <div className="lg:col-span-8 p-4 card-elevated space-y-4">
                    <div className="relative h-64 bg-zinc-950 rounded flex items-center justify-center border border-zinc-900 overflow-hidden">
                      <div className="absolute inset-4 border border-emerald-500/10 rounded flex items-center justify-center">
                        {/* Interactive crosshair mockup representing axial scan section */}
                        <div className="absolute inset-0 border border-zinc-800/20" />
                        <div className="absolute top-1/2 start-0 end-0 h-0.5 border-t border-dashed border-emerald-500/30" />
                        <div className="absolute start-1/2 top-0 bottom-0 w-0.5 border-s border-dashed border-emerald-500/30" />
                        
                        <div className="text-center space-y-1.5 z-10 select-none">
                          <span className="px-2 py-0.5 rounded text-2xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 block w-max mx-auto uppercase">
                            CBCT active view: {cbctPlane}
                          </span>
                          <span className="text-xs text-zinc-400 block font-mono">Bone Density / Density: 1,420 Hounsfield Units (HU)</span>
                          <span className="text-2xs text-zinc-600 block font-mono">CROSS-SECTION SLICE INDEX: {cbctSlice} / 120</span>
                        </div>
                      </div>
                    </div>

                    {/* Slice Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono text-zinc-500">
                        <span>Depth Slice (AP Index)</span>
                        <span className="text-zinc-300 font-bold">{cbctSlice} mm</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="120"
                        value={cbctSlice}
                        onChange={(e) => setCbctSlice(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Bone stats */}
                  <div className="lg:col-span-4 p-4 card-elevated space-y-4 text-xs font-mono">
                    <h5 className="text-2xs font-black text-white uppercase tracking-wider">Site #11 Bone Density Metric</h5>
                    
                    <div className="space-y-3.5">
                      <div className="p-2.5 rounded bg-zinc-900 border border-zinc-850">
                        <span className="text-2xs text-zinc-500 block uppercase font-bold">Bone Height Clearance</span>
                        <span className="text-sm font-black text-white">12.42 mm</span>
                        <span className="text-2xs text-emerald-400 block font-bold">SAFE FOR 11.5mm SCREW</span>
                      </div>

                      <div className="p-2.5 rounded bg-zinc-900 border border-zinc-850">
                        <span className="text-2xs text-zinc-500 block uppercase font-bold">Alveolar Ridge Width</span>
                        <span className="text-sm font-black text-white">7.20 mm</span>
                        <span className="text-2xs text-emerald-400 block font-bold">SAFE FOR 4.3mm WIDTH</span>
                      </div>

                      <div className="p-2.5 rounded bg-zinc-900 border border-zinc-850">
                        <span className="text-2xs text-zinc-500 block uppercase font-bold">Trabecular Density Index</span>
                        <span className="text-sm font-black text-white">D2 Category (Robust)</span>
                        <span className="text-2xs text-zinc-500 block">Durable cortical bone plate</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ==================================================
                12. INTRAORAL SCANS TAB (3D representation)
                ================================================== */}
            {activeTab === 'Intraoral Scans' && (
              <div className="space-y-4">
                <div className="p-4 card-elevated space-y-3 text-xs">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">3Shape TRIOS Intraoral Scanning Telemetry</h4>
                  <p className="text-zinc-500">Live 3D telemetry of maxilla and mandible arches. High-fidelity optical capture has been mapped into physical STL models.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono">
                    <div className="p-2 bg-zinc-900 border border-zinc-850 rounded">
                      <span className="text-2xs text-zinc-500 uppercase block">Scan Resolution</span>
                      <span className="text-zinc-200">12 microns (Ultra-Fine)</span>
                    </div>
                    <div className="p-2 bg-zinc-900 border border-zinc-850 rounded">
                      <span className="text-2xs text-zinc-500 uppercase block">Optical Captures</span>
                      <span className="text-zinc-200">2,410 individual frames</span>
                    </div>
                    <div className="p-2 bg-zinc-900 border border-zinc-850 rounded">
                      <span className="text-2xs text-zinc-500 uppercase block">CAD File Match</span>
                      <span className="text-emerald-400 font-bold">OK - Exocad Mapped</span>
                    </div>
                  </div>
                </div>

                <div className="h-64 bg-zinc-950 border border-zinc-850 rounded-xl flex items-center justify-center font-mono text-zinc-500 text-xs">
                  [Interactive 3Shape WebGL Viewport Mock • Realtime optical alignment complete]
                </div>
              </div>
            )}

            {/* ==================================================
                13. STL FILES TAB (Rotate wireframes)
                ================================================== */}
            {activeTab === 'STL Files' && (
              <div className="space-y-5">
                <div className="flex justify-between items-center bg-zinc-950 p-3 rounded-xl border border-zinc-850 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-2xs uppercase font-mono font-bold text-zinc-500">Select Mesh:</span>
                    <div className="inline-flex rounded-lg bg-zinc-900 p-0.5 border border-zinc-800">
                      {(['Upper', 'Lower', 'Bite', 'Waxup'] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => setStlType(type)}
                          className={`px-2.5 py-1 rounded text-2xs font-bold font-mono transition-all ${
                            stlType === type ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-500 hover:text-white'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setStlRotate(prev => (prev + 90) % 360)}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center gap-1 font-mono font-bold transition-all cursor-pointer text-2xs"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> Rotate Mesh 90°
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  
                  {/* STL Mesh Viewport */}
                  <div className="lg:col-span-8 p-4 card-elevated space-y-4">
                    <div className="relative h-64 bg-zinc-950 rounded border border-zinc-900 overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-4 flex items-center justify-center">
                        
                        {/* Wireframe teeth arch mock representation using CSS rotate */}
                        <div 
                          className="w-32 h-32 border-2 border-dashed border-emerald-500/20 rounded-full flex items-center justify-center transition-transform duration-500 relative"
                          style={{ transform: `rotate(${stlRotate}deg)` }}
                        >
                          <div className="absolute inset-1 border border-zinc-800/40 rounded-full flex items-center justify-center">
                            <span className="text-2xs font-mono text-emerald-400/60 font-black">STL: {stlType.toUpperCase()} MESH</span>
                          </div>
                          {/* Sockets */}
                          <div className="absolute top-0 w-3.5 h-3.5 bg-emerald-500/25 border border-emerald-400 rounded-full" />
                          <div className="absolute bottom-0 w-3.5 h-3.5 bg-emerald-500/25 border border-emerald-400 rounded-full" />
                          <div className="absolute start-0 w-3.5 h-3.5 bg-emerald-500/25 border border-emerald-400 rounded-full" />
                          <div className="absolute end-0 w-3.5 h-3.5 bg-emerald-500/25 border border-emerald-400 rounded-full" />
                        </div>

                      </div>
                      <div className="absolute bottom-3 start-3 text-2xs font-mono text-zinc-600">
                        POLYGON COUNT: {stlType === 'Upper' ? '184,200' : stlType === 'Lower' ? '192,400' : '82,100'} facets
                      </div>
                    </div>
                  </div>

                  {/* Mesh metadata */}
                  <div className="lg:col-span-4 p-4 card-elevated space-y-4 text-xs font-mono">
                    <h5 className="text-2xs font-black text-white uppercase tracking-wider">CAD/CAM Mesh Properties</h5>
                    
                    <div className="space-y-3">
                      <div className="p-2.5 rounded bg-zinc-900 border border-zinc-850">
                        <span className="text-2xs text-zinc-500 block uppercase font-bold">Standard Tessellation Match</span>
                        <span className="text-zinc-200">Verifiably Watertight</span>
                      </div>
                      <div className="p-2.5 rounded bg-zinc-900 border border-zinc-850">
                        <span className="text-2xs text-zinc-500 block uppercase font-bold">STL Volume Size</span>
                        <span className="text-zinc-200">12.84 MB (Binary Format)</span>
                      </div>
                      <div className="p-2.5 rounded bg-zinc-900 border border-zinc-850">
                        <span className="text-2xs text-zinc-500 block uppercase font-bold">Wax-up alignment</span>
                        <span className="text-emerald-400 font-bold">Aesthetics approved #11</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ==================================================
                14. LAB CASES TAB
                ================================================== */}
            {activeTab === 'Lab Cases' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-zinc-400 uppercase tracking-wider font-mono font-bold">3D Printing & Zirconia Milling orders</span>
                  <span className="text-2xs font-mono text-zinc-500">EXOCAD / 3SHAPE LINKED</span>
                </div>

                <div className="space-y-3">
                  <div className="p-4 card-elevated space-y-3 text-xs">
                    <div className="flex justify-between border-b border-zinc-850 pb-2">
                      <div>
                        <span className="font-bold text-white block text-sm">#11 Zirconia Surgical Guide Guide</span>
                        <span className="text-2xs text-zinc-500 font-mono">Case ID: L-9201-B • Technician: Dr. Rostova</span>
                      </div>
                      <span className="px-2.5 py-1 rounded text-2xs font-mono font-bold bg-purple-500/15 text-purple-400 border border-purple-500/20 block h-max">
                        SHIPPED
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-zinc-400 font-mono">
                      <div><span className="text-2xs text-zinc-500 block uppercase font-bold">3D Printer loaded</span> <span>Formlabs 3B+</span></div>
                      <div><span className="text-2xs text-zinc-500 block uppercase font-bold">Material used</span> <span>SurgGuide Resin</span></div>
                      <div><span className="text-2xs text-zinc-500 block uppercase font-bold">CAD Software</span> <span>Exocad 2026</span></div>
                      <div><span className="text-2xs text-zinc-500 block uppercase font-bold">Delivery date</span> <span className="text-white font-bold">2026-07-18</span></div>
                    </div>
                  </div>

                  <div className="p-4 card-elevated space-y-3 text-xs">
                    <div className="flex justify-between border-b border-zinc-850 pb-2">
                      <div>
                        <span className="font-bold text-white block text-sm">#11 Layered Zirconia Screw-Retained Crown</span>
                        <span className="text-2xs text-zinc-500 font-mono">Case ID: L-9201-C • Technician: Vance Lab Director</span>
                      </div>
                      <span className="px-2.5 py-1 rounded text-2xs font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20 block h-max animate-pulse">
                        MILLING zirconia disc (82% complete)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-zinc-400 font-mono">
                      <div><span className="text-2xs text-zinc-500 block uppercase font-bold">CAD/CAM Mill</span> <span>VHF R5 5-Axis disc</span></div>
                      <div><span className="text-2xs text-zinc-500 block uppercase font-bold">Zirconia block shade</span> <span>Vita A1 Body</span></div>
                      <div><span className="text-2xs text-zinc-500 block uppercase font-bold">Thickness index</span> <span>0.8 mm minimum</span></div>
                      <div><span className="text-2xs text-zinc-500 block uppercase font-bold">Estimated completion</span> <span className="text-white font-bold">2026-07-22</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================
                15. DOCUMENTS TAB (Consent forms, Insurance, clinical photos)
                ================================================== */}
            {activeTab === 'Documents' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-xs font-black text-zinc-400 uppercase tracking-wider font-mono">Document Management Suite</span>
                  <span className="text-2xs font-mono text-zinc-500">HIPAA Compliant Cloud Storage</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-mono">
                  
                  {/* File List */}
                  <div className="p-4 card-elevated space-y-3">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Document Vault Archive</h4>
                    
                    <div className="space-y-2">
                      <div className="p-2 rounded bg-zinc-900 border border-zinc-850 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-400" />
                          <div>
                            <span className="text-zinc-200 font-bold block">Implant_Surgery_Consent_Vance.pdf</span>
                            <span className="text-2xs text-zinc-500">Signed 2026-05-10 • HIPAA Digital Signature</span>
                          </div>
                        </div>
                        <span className="text-2xs text-emerald-400 font-bold uppercase">SIGNED</span>
                      </div>

                      <div className="p-2 rounded bg-zinc-900 border border-zinc-850 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-400" />
                          <div>
                            <span className="text-zinc-200 font-bold block">Delta_Dental_PreAuth_11.pdf</span>
                            <span className="text-2xs text-zinc-500">Pre-determination authorized • $4,200 limit</span>
                          </div>
                        </div>
                        <span className="text-2xs text-emerald-400 font-bold uppercase">APPROVED</span>
                      </div>

                      <div className="p-2 rounded bg-zinc-900 border border-zinc-850 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-400" />
                          <div>
                            <span className="text-zinc-200 font-bold block">Periodontist_Referral_Letter.pdf</span>
                            <span className="text-2xs text-zinc-500">From Dr. Jenkins to Dr. Rostova</span>
                          </div>
                        </div>
                        <span className="text-2xs text-zinc-500 font-bold uppercase">ARCHIVED</span>
                      </div>
                    </div>
                  </div>

                  {/* Document preview mockup */}
                  <div className="p-4 card-elevated flex flex-col justify-between">
                    <div>
                      <span className="text-2xs font-black uppercase tracking-wider text-zinc-500 block">PDF Preview Viewport</span>
                      <p className="text-xs text-zinc-400 leading-normal mt-2">
                        **INFORMED CONSENT FOR ENDOSTEAL DENTAL IMPLANT SURGERY**\n\n
                        I, Amelia Vance, hereby authorize Dr. Elena Rostova to place an endosteal implant at site #11. 
                        Risks, including bleeding alert due to mild history of Mitral Valve Prolapse and bleeding tendency, have been explained...
                      </p>
                    </div>
                    <div className="p-2 bg-zinc-900 rounded border border-zinc-800 text-2xs text-emerald-400 font-bold text-center mt-4">
                      Digital Cryptographic Hash verified in blockchain.
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ==================================================
                16. PRESCRIPTIONS TAB
                ================================================== */}
            {activeTab === 'Prescriptions' && (
              <div className="space-y-6">
                
                {/* New Rx Form */}
                <form onSubmit={handleAddPrescription} className="p-4 card-gradient space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                    <span className="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-emerald-400" /> Write New Prescription (Rx)
                    </span>
                    <span className="text-2xs text-zinc-500 font-mono">FDA / DEA SECURE PORTAL</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="space-y-1">
                      <label className="text-zinc-500 block">Prescription Name / Strength</label>
                      <input
                        type="text"
                        value={newRxName}
                        onChange={(e) => setNewRxName(e.target.value)}
                        placeholder="Amoxicillin 500mg"
                        className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-500 block">Sig / Instructions for Patient</label>
                      <input
                        type="text"
                        value={newRxInst}
                        onChange={(e) => setNewRxInst(e.target.value)}
                        placeholder="Take 1 tablet twice daily for 7 days"
                        className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={!newRxName}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg text-xs font-bold font-mono transition-all disabled:opacity-30 cursor-pointer"
                    >
                      Authorize & Sign Digitally
                    </button>
                  </div>
                </form>

                {/* Prescription List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider font-mono">Authorized Medication Profile (Current & Historical)</h4>
                  <div className="space-y-2">
                    {prescriptions.map((rx) => (
                      <div key={rx.id} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-between text-xs font-mono">
                        <div>
                          <span className="font-bold text-white block">{rx.rxName}</span>
                          <span className="text-zinc-400 block mt-0.5">{rx.instructions}</span>
                          <span className="text-2xs text-zinc-600 block mt-1">Authorized via DEA #ER849202</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-2xs font-bold ${
                          rx.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 line-through'
                        }`}>
                          {rx.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ==================================================
                17. CONSENT FORMS TAB
                ================================================== */}
            {activeTab === 'Consent Forms' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-xs font-black text-zinc-400 uppercase tracking-wider font-mono font-bold">Patient Legal Informed Consents</span>
                  <span className="text-2xs font-mono text-zinc-500">DIGITAL SIGN-OFF SECURED</span>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div className="p-4 card-elevated flex items-center justify-between gap-4">
                    <div>
                      <span className="font-bold text-white block">Surgical Implant Placement Informed Consent</span>
                      <p className="text-xs text-zinc-400 mt-0.5">Comprehensive disclosure of localized nerve blocks, osteotomy drill risks, and prosthetic expectations.</p>
                      <span className="text-2xs text-zinc-500 block mt-1.5">Digitally signed via DocuSign with cryptographic SHA-256 seal.</span>
                    </div>
                    <span className="px-2.5 py-1 rounded text-2xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      SIGNED & VALID
                    </span>
                  </div>

                  <div className="p-4 card-elevated flex items-center justify-between gap-4">
                    <div>
                      <span className="font-bold text-white block">Nitrous Oxide & Local Anesthesia Authorization</span>
                      <p className="text-xs text-zinc-400 mt-0.5">Authorization for localized articulation epinephrine 1:100,000 block injection during drilling.</p>
                      <span className="text-2xs text-zinc-500 block mt-1.5">Signed 2026-05-10 with surgical supervisor witness.</span>
                    </div>
                    <span className="px-2.5 py-1 rounded text-2xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      SIGNED & VALID
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================
                18. BILLING SUMMARY TAB
                ================================================== */}
            {activeTab === 'Billing Summary' && (
              <div className="space-y-5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-xs font-black text-zinc-400 uppercase tracking-wider font-mono font-bold">Ledger Balance & Claim Codes</span>
                  <span className="text-2xs font-mono text-zinc-500">CLEARED WITH DELTA DENTAL</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-zinc-850 text-xs">
                  <table className="w-full text-start border-collapse">
                    <thead>
                      <tr className="bg-zinc-950 text-zinc-500 font-mono uppercase text-2xs border-b border-zinc-850">
                        <th className="p-3">ADA Code</th>
                        <th className="p-3">Surgical Restorative Procedure</th>
                        <th className="p-3 text-end">Fee</th>
                        <th className="p-3 text-end">Ins. Covered</th>
                        <th className="p-3 text-end">Pat. Balance</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850/60 font-mono text-zinc-300">
                      <tr className="hover:bg-zinc-950/40">
                        <td className="p-3 font-bold text-emerald-400">D6010</td>
                        <td className="p-3 font-sans text-zinc-200">Surgical implant placement #11</td>
                        <td className="p-3 text-end">$2,800.00</td>
                        <td className="p-3 text-end text-emerald-400">-$1,400.00</td>
                        <td className="p-3 text-end font-bold text-white">$1,400.00</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded text-2xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Awaiting Treatment</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-zinc-950/40">
                        <td className="p-3 font-bold text-emerald-400">D6056</td>
                        <td className="p-3 font-sans text-zinc-200">Custom milled titanium abutment #11</td>
                        <td className="p-3 text-end">$1,250.00</td>
                        <td className="p-3 text-end text-emerald-400">-$600.00</td>
                        <td className="p-3 text-end font-bold text-white">$650.00</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded text-2xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Milling Completed</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-zinc-950/40">
                        <td className="p-3 font-bold text-emerald-400">D6065</td>
                        <td className="p-3 font-sans text-zinc-200">Layered Zirconia Crown Supported #11</td>
                        <td className="p-3 text-end">$4,400.00</td>
                        <td className="p-3 text-end text-emerald-400">-$2,200.00</td>
                        <td className="p-3 text-end font-bold text-white">$2,200.00</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded text-2xs font-bold bg-zinc-800 text-zinc-400 border border-zinc-750">Authorized Plan</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ==================================================
                19. TIMELINE TAB
                ================================================== */}
            {activeTab === 'Timeline' && (
              <div className="space-y-4">
                <span className="text-xs font-black text-zinc-400 uppercase tracking-wider font-mono">Patient Clinical Journey (Chronological)</span>
                
                <div className="space-y-4 ps-4 border-s border-zinc-800 text-xs">
                  
                  {/* Event 1 */}
                  <div className="relative space-y-1">
                    <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-zinc-900" />
                    <div className="flex justify-between text-xs text-zinc-500 font-mono">
                      <span>2026-07-20 (Scheduled)</span>
                      <span>SURGERY</span>
                    </div>
                    <p className="font-bold text-white">Stage I Endosteal Implant Surgery Placement #11</p>
                    <p className="text-zinc-400">Dr. Elena Rostova will execute custom stereolithography guide surgical drilling.</p>
                  </div>

                  {/* Event 2 */}
                  <div className="relative space-y-1">
                    <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-zinc-900" />
                    <div className="flex justify-between text-xs text-zinc-500 font-mono">
                      <span>2026-06-12 (Completed)</span>
                      <span>CLINICAL NOTE / TRY-IN</span>
                    </div>
                    <p className="font-bold text-white">Surgical Drill Guide Try-In & Mock Alignment</p>
                    <p className="text-zinc-400">Verified guide seating on upper maxillary canine zone. Completely stable, zero articulation issues.</p>
                  </div>

                  {/* Event 3 */}
                  <div className="relative space-y-1">
                    <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-zinc-900" />
                    <div className="flex justify-between text-xs text-zinc-500 font-mono">
                      <span>2026-05-10 (Completed)</span>
                      <span>DIAGNOSTIC ARCHIVE</span>
                    </div>
                    <p className="font-bold text-white">CBCT 3D Bone Density scan obtained</p>
                    <p className="text-zinc-400">High-resolution axial slices confirmed bone depth 12.4mm, width 7.2mm.</p>
                  </div>

                </div>
              </div>
            )}

            {/* ==================================================
                20. AI COPILOT TAB
                ================================================== */}
            {activeTab === 'AI Copilot' && (
              <div className="space-y-5">
                
                {/* Copilot Clinical Workspace */}
                <div className="p-4 card-elevated space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                      <div>
                        <span className="text-xs font-black text-white uppercase tracking-wider font-mono">HealthOS AI Copilot Engine</span>
                        <p className="text-2xs text-zinc-500 font-mono">Interactive clinical model helper</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-2xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      GEMINI-3.5-FLASH-CONNECTED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    <button
                      onClick={() => triggerCopilotAction('summary')}
                      className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-mono font-bold flex flex-col items-center text-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Activity className="w-4 h-4 text-emerald-400" />
                      Generate Summary
                    </button>
                    
                    <button
                      onClick={() => triggerCopilotAction('soap')}
                      className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-mono font-bold flex flex-col items-center text-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-emerald-400" />
                      Generate SOAP Notes
                    </button>

                    <button
                      onClick={() => triggerCopilotAction('prescription')}
                      className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-mono font-bold flex flex-col items-center text-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-emerald-400" />
                      Lab Prescriptions
                    </button>

                    <button
                      onClick={() => triggerCopilotAction('patient_exp')}
                      className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-mono font-bold flex flex-col items-center text-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <User className="w-4 h-4 text-emerald-400" />
                      Patient Explainer
                    </button>
                  </div>
                </div>

                {/* Copilot Output Viewport */}
                <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-850 min-h-48 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-2xs font-mono font-black text-zinc-500 uppercase block">Clinical Copilot Diagnostic Terminal Output</span>
                    
                    {isAiLoading ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono py-8">
                        <Sparkles className="w-4 h-4 animate-spin" />
                        <span>Scanning bone graphs, patient metadata alerts, and Exocad mesh layers...</span>
                      </div>
                    ) : aiPromptResponse ? (
                      <div className="text-xs font-mono text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-950/60 p-3 rounded border border-zinc-900">
                        {aiPromptResponse}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-600 italic py-8">
                        Click any of the telemetry action boxes above to process Amelia Vance's clinical record data and generate high-fidelity healthcare diagnostics.
                      </p>
                    )}
                  </div>

                  <div className="text-2xs text-zinc-600 font-mono border-t border-zinc-900 pt-3 mt-4 flex items-center justify-between">
                    <span>*Note: Generated content is simulated and clinically aligned with modern prosthodontic guidelines.*</span>
                    <span className="text-emerald-400/60 font-bold">HealthOS AI Suite</span>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Footer clinical standards notice */}
          <div className="mt-8 pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-2xs font-mono text-zinc-500">
            <span>HIPAA SECURE AUDITING TRACKER • ACTIVE ENCRYPTED WORKSTATION</span>
            <span>LICENSED FOR {patient.primaryDentist.toUpperCase()}</span>
          </div>

        </div>

      </div>

    </div>
  );
}
