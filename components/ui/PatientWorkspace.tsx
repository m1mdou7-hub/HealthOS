'use client';
import { CopilotSidebar } from './Copilot/CopilotSidebar';

import { WorkspaceSidebarNav } from './Workspace/WorkspaceSidebarNav';
import { ToothSelector } from './Common/ToothSelector';
import { PatientTimeline } from './Timeline/PatientTimeline';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Users,
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  Grid,
  List,
  User,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Clipboard,
  Clock,
  Sparkles,
  Activity,
  Layers,
  FlaskConical,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  Heart,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit3,
  Image as ImageIcon,
  HardDrive,
  Percent,
  RotateCcw,
  Stethoscope,
  Scissors,
  Send,
  Zap,
  Briefcase,
  Archive,
  X
} from 'lucide-react';

// Interfaces
export interface PatientCase {
  id: string;
  name: string;
  status: 'In Design' | 'Milling' | 'Sintering' | 'Finished' | 'Delivered' | 'On Hold';
  priority: 'Urgent' | 'High' | 'Standard' | 'Low';
  clinician: string;
  stage: string;
  progress: number;
  createdDate: string;
  dueDate: string;
  notes: string;
}

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

// Mock patients dataset representing high-end digital prosthodontics and implants
const INITIAL_PATIENTS: Patient[] = [
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
    riskDescription: "Elevated periodontal inflammation score; diabetic clearance advised before deep subgingival margins.",
    summary: "Patient presents with generalized tooth mobility in the maxillary arch. Seeking a fixed, high-aesthetic solution. Treatment plan involves a premium full-arch implant-supported Zirconia bridge.",
    medicalHistory: ["Type II Diabetes diagnosed in 2018 (controlled)", "Hypertension under Lisinopril therapy"],
    medications: ["Metformin 500mg BID", "Lisinopril 10mg QD"],
    allergies: ["Penicillin (severe hives)", "Latex (mild contact dermatitis)"],
    timeline: [
      { date: "Jul 10, 2026", title: "CBCT Double Arch Scan Completed", category: "Imaging", description: "CBCT reveals 7.5mm alveolar bone depth in anterior segments. Virtual implant placements planned." },
      { date: "Jul 03, 2026", title: "Intraoral Scan and Diagnostic STL Alignment", category: "Laboratory", description: "3Shape digital impression registered. Pre-op model aligned to virtual articulators." },
      { date: "Jun 28, 2026", title: "Prosthodontic Consultation", category: "Clinical Note", description: "Discussion of treatment alternatives. Patient accepted maxillary fixed Zirconia bridge." }
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
        notes: "Milling thickness verification required. Keep minimum facial connector area at 12mm^2. Match shades closely with canine preps."
      }
    ]
  },
  {
    id: "PTS-8831",
    name: "Clara Oswald",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80",
    age: 28,
    gender: "Female",
    bloodGroup: "A-",
    allergyStatus: "No Known Drug Allergies",
    medicalAlerts: ["None"],
    phone: "+1 (555) 732-4819",
    email: "clara.oswald@tardis.net",
    primaryDoctor: "Dr. Sarah Jenkins",
    currentTreatment: "Maxillary E.Max Veneers (6 units)",
    status: "Active",
    lastVisit: "2026-07-12",
    nextAppointment: "2026-07-19 10:15 AM (Veneer Delivery)",
    aiRiskFlag: "Low",
    riskDescription: "Excellent oral hygiene. No active systemic risks identified.",
    summary: "Seeking aesthetic enhancement of anterior maxillary teeth (13 to 23). Desires bleach shades (OM1/OM3 combo) with organic translucency.",
    medicalHistory: ["Seasonal Asthma (mild)"],
    medications: ["Albuterol inhaler (PRN)"],
    allergies: ["Pollen", "Dust Mites"],
    timeline: [
      { date: "Jul 12, 2026", title: "Mock-Up Try-In & Photo Set", category: "Clinical Note", description: "Digital Smile Design physical mock-up approved. Smile photos registered at 12 angles." },
      { date: "Jul 05, 2026", title: "Veneer Preparations & PMMA Provisional", category: "Clinical Note", description: "Minimal preparation of teeth 13-23. Exocad design finalized, PMMA provisionals milled and bonded." }
    ],
    cases: [
      {
        id: "CASE-8831",
        name: "Maxillary E.Max Veneers (6 units)",
        status: "Finished",
        priority: "Standard",
        clinician: "Dr. Sarah Jenkins",
        stage: "Hand Glazing & Polishing",
        progress: 95,
        createdDate: "2026-07-05",
        dueDate: "2026-07-19",
        notes: "Glaze carefully for ideal translucency. High aesthetic demand. OM1 shade target."
      }
    ]
  },
  {
    id: "PTS-1092",
    name: "Bruce Wayne",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80",
    age: 41,
    gender: "Male",
    bloodGroup: "O-",
    allergyStatus: "NSAIDs Hypersensitivity",
    medicalAlerts: ["Previous Jaw Trauma", "Nocturnal Bruxism (Severe)"],
    phone: "+1 (555) 911-1939",
    email: "bruce@waynecorp.com",
    primaryDoctor: "Dr. Ahmed",
    currentTreatment: "Straumann Implant #36 & Custom Abutment",
    status: "Under Treatment",
    lastVisit: "2026-07-15",
    nextAppointment: "2026-07-22 11:30 AM (Implant Consultation)",
    aiRiskFlag: "Medium",
    riskDescription: "Heavy parafunctional bruxism. High load risk on provisional prosthetics; nightguard essential.",
    summary: "Missing tooth #36 due to historical localized fracture. Bone grafting healed. Ready for Straumann SLActive 4.1x10mm implant placement and subsequent custom zirconia abutment + crown.",
    medicalHistory: ["Multiple orthopaedic surgeries", "Bruxism (severe)"],
    medications: ["None"],
    allergies: ["Ibuprofen / Aspirin (gastric distress)"],
    timeline: [
      { date: "Jul 15, 2026", title: "Surgical Guide 3D-Printed", category: "Laboratory", description: "SprintRay Pro 95 completed printing of guided template based on CBCT STL merger." },
      { date: "Jun 30, 2026", title: "Site Assessment & Implant Pre-planning", category: "Clinical Note", description: "#36 ridge evaluated. Bone density verified as D2. Custom torque parameters preset to 35 Ncm." }
    ],
    cases: [
      {
        id: "CASE-1092",
        name: "Straumann Implant #36 & Custom Abutment",
        status: "Milling",
        priority: "Urgent",
        clinician: "Dr. Ahmed",
        stage: "Surgical Guide Printing & Milling",
        progress: 65,
        createdDate: "2026-07-15",
        dueDate: "2026-07-22",
        notes: "Print surgical guide on SprintRay with BioMed Surgical Guide resin. Double check rotational orientation of hex."
      }
    ]
  },
  {
    id: "PTS-4712",
    name: "Diana Prince",
    photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&h=256&q=80",
    age: 35,
    gender: "Female",
    bloodGroup: "AB+",
    allergyStatus: "No Known Allergies",
    medicalAlerts: ["Pregnancy (1st Trimester)"],
    phone: "+1 (555) 777-1941",
    email: "diana@themiscira.org",
    primaryDoctor: "Dr. Elena Rostova",
    currentTreatment: "Digital Smile Design Consultation",
    status: "New",
    lastVisit: "2026-07-14",
    nextAppointment: "2026-07-25 01:00 PM (Digital Smile Design)",
    aiRiskFlag: "Medium",
    riskDescription: "1st Trimester Pregnancy. Avoid unnecessary radiation; minimize CBCT, utilize intraoral scanners.",
    summary: "Patient requested aesthetic smile analysis. Expresses concerns about slight crowding of lower anteriors and minor central incisor chipping.",
    medicalHistory: ["Currently pregnant (11 weeks)"],
    medications: ["Prenatal Vitamins"],
    allergies: ["None"],
    timeline: [
      { date: "Jul 14, 2026", title: "Intraoral Scan (Trios 5)", category: "Imaging", description: "Full digital impression taken with Trios 5. STL uploaded to 3Shape Cloud Workspace." }
    ],
    cases: [
      {
        id: "CASE-4712",
        name: "Digital Smile Design & Wax-up",
        status: "In Design",
        priority: "Standard",
        clinician: "Dr. Elena Rostova",
        stage: "Smile Design Calibration",
        progress: 20,
        createdDate: "2026-07-14",
        dueDate: "2026-07-25",
        notes: "Focus on golden proportion parameters. Create additive model for mock-up try-in."
      }
    ]
  },
  {
    id: "PTS-3301",
    name: "Scott Summers",
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&h=256&q=80",
    age: 48,
    gender: "Male",
    bloodGroup: "A+",
    allergyStatus: "Sulfa Allergy",
    medicalAlerts: ["Photosensitivity (Severe)"],
    phone: "+1 (555) 298-3829",
    email: "cyclops@xavier.edu",
    primaryDoctor: "Dr. Michael Chen",
    currentTreatment: "Maxillary Complete Denture (Digital Exocad)",
    status: "Under Treatment",
    lastVisit: "2026-07-08",
    nextAppointment: "2026-07-20 02:30 PM (Complete Denture Try-in)",
    aiRiskFlag: "Low",
    riskDescription: "Photosensitivity flagged for in-office curing lamps; ensure high-protection eye shielding.",
    summary: "Fully edentulous maxilla. Requesting state-of-the-art digital complete denture. Border molding registered using digital scan bodies.",
    medicalHistory: ["Extreme ocular photosensitivity"],
    medications: ["Daily anti-glare filters"],
    allergies: ["Sulfa Drugs (skin rash)"],
    timeline: [
      { date: "Jul 08, 2026", title: "Denture Base & Teeth 3D-Printed", category: "Laboratory", description: "Lucitone Digital Try-In denture printed on Carbon M2 printer. Fit verified on digital cast." },
      { date: "Jun 25, 2026", title: "Maxillary Gothic Arch Registration", category: "Clinical Note", description: "Central bearing point recording taken. Vertical dimension of occlusion mapped at 71mm." }
    ],
    cases: [
      {
        id: "CASE-3301",
        name: "Maxillary Digital Complete Denture",
        status: "Milling",
        priority: "Standard",
        clinician: "Dr. Michael Chen",
        stage: "Milling Base & 3D Printing Teeth",
        progress: 80,
        createdDate: "2026-07-08",
        dueDate: "2026-07-20",
        notes: "Ensure Lucitone digital material is fully cured according to high-temperature protocols."
      }
    ]
  },
  {
    id: "PTS-0022",
    name: "Logan Howlett",
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80",
    age: 63,
    gender: "Male",
    bloodGroup: "Unknown",
    allergyStatus: "No Known Allergies",
    medicalAlerts: ["Hyper-accelerated healing profile", "Metallic Orthopaedic Implants"],
    phone: "+1 (555) 197-1974",
    email: "wolverine@weaponx.ca",
    primaryDoctor: "Dr. Ahmed",
    currentTreatment: "Full Mouth Debridement & Scaling",
    status: "Completed",
    lastVisit: "2026-07-16",
    nextAppointment: "2026-08-16 04:00 PM (Scaling & Maintenance)",
    aiRiskFlag: "Low",
    riskDescription: "Atypical metal interference on CBCT. High density artifacts noted; software filters activated.",
    summary: "Extremely dense skeletal structure. Presents for routine prophylaxis and digital screening. Alveolar bone levels are pristine.",
    medicalHistory: ["Extensive metallic implants (total skeletal coverage)"],
    medications: ["None"],
    allergies: ["None"],
    timeline: [
      { date: "Jul 16, 2026", title: "Full Mouth Debridement Completed", category: "Clinical Note", description: "Ultrasonic scaling completed. Zero bleeding indices post-treatment." },
      { date: "Jul 16, 2026", title: "Intraoral Scan Archiving", category: "Imaging", description: "STL scan logged for longitudinal bone and wear analysis." }
    ],
    cases: []
  }
];

export default function PatientWorkspace() {
  const router = useRouter();
  const params = useParams();
  const selectedPatientId = (params?.id as string | undefined) || null;

  // Page states
  const [patients, setPatients] = useState<Patient[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('healthos_patients');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse patients from localStorage", e);
        }
      }
    }
    return INITIAL_PATIENTS;
  });

  useEffect(() => {
    localStorage.setItem('healthos_patients', JSON.stringify(patients));
  }, [patients]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'New' | 'Under Treatment' | 'Completed'>('All');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [workspaceTab, setWorkspaceTab] = useState<'overview' | 'history' | 'cases' | 'timeline' | 'appointments' | 'treatment' | 'dental-chart' | 'prosthodontics' | 'implants' | 'laboratory' | 'imaging' | 'notes' | 'files' | 'billing' | 'ai'>('overview');

  // Sorting and Pagination states
  const [sortField, setSortField] = useState<'id' | 'name' | 'age' | 'lastVisit'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Patient Modal CRUD states
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [patientForm, setPatientForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: 35,
    gender: 'Male',
    bloodGroup: 'O+',
    allergyStatus: 'No Known Allergies',
    medicalAlerts: '',
    primaryDoctor: 'Dr. Ahmed',
    currentTreatment: '',
    status: 'Active' as Patient['status'],
    aiRiskFlag: 'Low' as Patient['aiRiskFlag'],
    riskDescription: 'Excellent oral hygiene.',
    summary: '',
    medicalHistory: '',
    medications: '',
    allergies: ''
  });

  // Case Modal CRUD states
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

  // Case filter states
  const [caseSearchQuery, setCaseSearchQuery] = useState('');
  const [caseStatusFilter, setCaseStatusFilter] = useState<string>('All');
  const [casePriorityFilter, setCasePriorityFilter] = useState<string>('All');

  // Sorting logic helper
  const handleSort = (field: 'id' | 'name' | 'age' | 'lastVisit') => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Patient Actions
  const handleSavePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientForm.name.trim()) return;

    if (editingPatient) {
      setPatients(prev => prev.map(p => {
        if (p.id === editingPatient.id) {
          return {
            ...p,
            name: patientForm.name,
            email: patientForm.email,
            phone: patientForm.phone,
            age: Number(patientForm.age),
            gender: patientForm.gender,
            bloodGroup: patientForm.bloodGroup,
            allergyStatus: patientForm.allergyStatus,
            medicalAlerts: patientForm.medicalAlerts.split(',').map(s => s.trim()).filter(Boolean),
            primaryDoctor: patientForm.primaryDoctor,
            currentTreatment: patientForm.currentTreatment,
            status: patientForm.status,
            aiRiskFlag: patientForm.aiRiskFlag,
            riskDescription: patientForm.riskDescription,
            summary: patientForm.summary,
            medicalHistory: patientForm.medicalHistory.split(',').map(s => s.trim()).filter(Boolean),
            medications: patientForm.medications.split(',').map(s => s.trim()).filter(Boolean),
            allergies: patientForm.allergies.split(',').map(s => s.trim()).filter(Boolean)
          };
        }
        return p;
      }));
    } else {
      const newId = `PTS-${Math.floor(1000 + Math.random() * 9000)}`;
      const newPatient: Patient = {
        id: newId,
        name: patientForm.name,
        photoUrl: `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80`,
        age: Number(patientForm.age),
        gender: patientForm.gender,
        bloodGroup: patientForm.bloodGroup,
        allergyStatus: patientForm.allergyStatus,
        medicalAlerts: patientForm.medicalAlerts.split(',').map(s => s.trim()).filter(Boolean),
        phone: patientForm.phone || "+1 (555) 000-0000",
        email: patientForm.email || `${patientForm.name.toLowerCase().replace(/\s+/g, '')}@healthos.org`,
        primaryDoctor: patientForm.primaryDoctor,
        currentTreatment: patientForm.currentTreatment || "Consultation",
        status: patientForm.status,
        lastVisit: new Date().toISOString().split('T')[0],
        nextAppointment: "Not scheduled",
        aiRiskFlag: patientForm.aiRiskFlag,
        riskDescription: patientForm.riskDescription,
        summary: patientForm.summary || "Newly registered dental patient.",
        medicalHistory: patientForm.medicalHistory ? patientForm.medicalHistory.split(',').map(s => s.trim()).filter(Boolean) : [],
        medications: patientForm.medications ? patientForm.medications.split(',').map(s => s.trim()).filter(Boolean) : [],
        allergies: patientForm.allergies ? patientForm.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
        timeline: [
          { date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }), title: "Patient Registered", category: "Clinical Note", description: "Clinical profile successfully registered in EHR database." }
        ],
        cases: []
      };
      setPatients(prev => [newPatient, ...prev]);
    }

    setIsPatientModalOpen(false);
    setEditingPatient(null);
  };

  const handleEditPatientClick = (pat: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPatient(pat);
    setPatientForm({
      name: pat.name,
      email: pat.email,
      phone: pat.phone,
      age: pat.age,
      gender: pat.gender,
      bloodGroup: pat.bloodGroup,
      allergyStatus: pat.allergyStatus,
      medicalAlerts: pat.medicalAlerts.join(', '),
      primaryDoctor: pat.primaryDoctor,
      currentTreatment: pat.currentTreatment,
      status: pat.status,
      aiRiskFlag: pat.aiRiskFlag,
      riskDescription: pat.riskDescription,
      summary: pat.summary,
      medicalHistory: (pat.medicalHistory || []).join(', '),
      medications: (pat.medications || []).join(', '),
      allergies: (pat.allergies || []).join(', ')
    });
    setIsPatientModalOpen(true);
  };

  const handleDeletePatient = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this patient profile? All associated clinical cases and records will be purged.")) {
      setPatients(prev => prev.filter(p => p.id !== id));
      if (selectedPatientId === id) {
        router.push('/patients');
      }
    }
  };

  const handleArchivePatient = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPatients(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: p.status === 'Completed' ? 'Active' : 'Completed'
        };
      }
      return p;
    }));
  };

  // Case Actions
  const handleSaveCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseForm.name.trim()) return;

    if (editingCase) {
      setPatients(prev => prev.map(p => {
        if (p.id === activePatient.id) {
          const updatedCases = (p.cases || []).map(c => {
            if (c.id === editingCase.id) {
              return {
                ...c,
                name: caseForm.name,
                status: caseForm.status,
                priority: caseForm.priority,
                clinician: caseForm.clinician,
                stage: caseForm.stage,
                progress: Number(caseForm.progress),
                notes: caseForm.notes,
                dueDate: caseForm.dueDate
              };
            }
            return c;
          });
          return { ...p, cases: updatedCases };
        }
        return p;
      }));
    } else {
      const newCaseId = `CASE-${Math.floor(1000 + Math.random() * 9000)}`;
      const newCase: PatientCase = {
        id: newCaseId,
        name: caseForm.name,
        status: caseForm.status,
        priority: caseForm.priority,
        clinician: caseForm.clinician,
        stage: caseForm.stage,
        progress: Number(caseForm.progress),
        createdDate: new Date().toISOString().split('T')[0],
        dueDate: caseForm.dueDate || new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
        notes: caseForm.notes
      };

      setPatients(prev => prev.map(p => {
        if (p.id === activePatient.id) {
          return {
            ...p,
            cases: [newCase, ...(p.cases || [])]
          };
        }
        return p;
      }));
    }

    setIsCaseModalOpen(false);
    setEditingCase(null);
  };

  const handleEditCaseClick = (item: PatientCase) => {
    setEditingCase(item);
    setCaseForm({
      name: item.name,
      status: item.status,
      priority: item.priority,
      clinician: item.clinician,
      stage: item.stage,
      progress: item.progress,
      notes: item.notes,
      dueDate: item.dueDate
    });
    setIsCaseModalOpen(true);
  };

  const handleDeleteCase = (caseId: string) => {
    if (confirm("Are you sure you want to delete this case?")) {
      setPatients(prev => prev.map(p => {
        if (p.id === activePatient.id) {
          return {
            ...p,
            cases: (p.cases || []).filter(c => c.id !== caseId)
          };
        }
        return p;
      }));
    }
  };

  // Interactive dynamic mock states
  const [clinicalNotes, setClinicalNotes] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; type: string; date: string }[]>([
    { name: "maxillary_cbct_3d_scan.dcm", size: "182.4 MB", type: "DICOM Imports", date: "2026-07-10" },
    { name: "3shape_upper_jaw_arch.stl", size: "41.2 MB", type: "STL Files", date: "2026-07-03" },
    { name: "digital_smile_design_v2.png", size: "8.1 MB", type: "Smile Photos", date: "2026-07-12" },
    { name: "post_op_articulation_parameters.pdf", size: "1.4 MB", type: "Report", date: "2026-07-12" }
  ]);
  const [dragActive, setDragActive] = useState(false);
  const [teethStatuses, setTeethStatuses] = useState<Record<number, 'sound' | 'prep' | 'restored' | 'implant' | 'missing'>>({});
  const [activeClinicalNote, setActiveClinicalNote] = useState<string>('');
  const [noteTitle, setNoteTitle] = useState<string>('Crown Prep SOAP Draft');

  // AI assistant states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');

  // Persistent Sidebar AI Copilot State
  const [isCopilotSidebarOpen, setIsCopilotSidebarOpen] = useState(false);
  const [copilotSidebarMessages, setCopilotSidebarMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([
    { role: 'assistant', text: "Hello! I am your AI Clinical Copilot. Ask me anything about this patient's medical/dental history, radiographs, treatment options, or active restorative CAD/CAM queue." }
  ]);
  const [copilotSidebarInput, setCopilotSidebarInput] = useState('');
  const [copilotSidebarLoading, setCopilotSidebarLoading] = useState(false);

  // SOAP AI Assistant states
  const [soapAiLoading, setSoapAiLoading] = useState(false);
  const [soapAiBriefText, setSoapAiBriefText] = useState('');

  // AI Treatment Planner states
  const [treatmentAiLoading, setTreatmentAiLoading] = useState(false);
  const [treatmentAiOutput, setTreatmentAiOutput] = useState<string | null>(null);
  const [treatmentAiPrompt, setTreatmentAiPrompt] = useState('');

  // AI Patient Education states
  const [patientEdLoading, setPatientEdLoading] = useState(false);
  const [patientEdOutput, setPatientEdOutput] = useState<string | null>(null);
  const [patientEdPrompt, setPatientEdPrompt] = useState('');

  // AI Clinical Summary states
  const [summaryAiLoading, setSummaryAiLoading] = useState(false);
  const [summaryAiOutput, setSummaryAiOutput] = useState<string | null>(null);

  // AI Risk Detection states
  const [riskScanLoading, setRiskScanLoading] = useState(false);
  const [riskScanOutput, setRiskScanOutput] = useState<string | null>(null);

  // Active Sub-tab inside AI Hub: 'copilot' | 'soap' | 'planner' | 'summary' | 'education' | 'risks'
  const [aiHubTab, setAiHubTab] = useState<'copilot' | 'soap' | 'planner' | 'summary' | 'education' | 'risks'>('copilot');

  // Selected Patient Details helper
  const activePatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // Extended Modules states
  const [medicalConditions, setMedicalConditions] = useState('');
  const [medHistoryMedications, setMedHistoryMedications] = useState('');
  const [medicalAllergies, setMedicalAllergies] = useState('');
  const [smokingStatus, setSmokingStatus] = useState('Non-smoker');
  const [pregnancy, setPregnancy] = useState('Not pregnant');
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [diabetes, setDiabetes] = useState('Negative');
  const [cardiacHistory, setCardiacHistory] = useState('None');
  const [medicalHistoryNotes, setMedicalHistoryNotes] = useState('');

  const [chiefComplaint, setChiefComplaint] = useState('');
  const [prevDentalTreatment, setPrevDentalTreatment] = useState('');
  const [prevProsthodonticTreatment, setPrevProsthodonticTreatment] = useState('');
  const [implantHistory, setImplantHistory] = useState('');
  const [oralHygieneAssessment, setOralHygieneAssessment] = useState('Good');
  const [cariesRisk, setCariesRisk] = useState('Low');
  const [periodontalStatus, setPeriodontalStatus] = useState('Healthy');
  const [occlusionNotes, setOcclusionNotes] = useState('');

  const [isEditingHistory, setIsEditingHistory] = useState(false);
  const [supabaseLoading, setSupabaseLoading] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Dynamic Treatment Plans
  const [treatmentPlans, setTreatmentPlans] = useState<any[]>([]);
  const [isTxPlanModalOpen, setIsTxPlanModalOpen] = useState(false);
  const [editingTxPlan, setEditingTxPlan] = useState<any | null>(null);
  const [txPlanForm, setTxPlanForm] = useState({
    title: '',
    description: '',
    estimatedCost: 0,
    status: 'Draft',
    progress: 0,
    phasesText: ''
  });

  // Dynamic SOAP Clinical Notes with edit history & attachments
  const [clinicalNotesList, setClinicalNotesList] = useState<any[]>([]);
  const [soapSubjective, setSoapSubjective] = useState('');
  const [soapObjective, setSoapObjective] = useState('');
  const [soapAssessment, setSoapAssessment] = useState('');
  const [soapPlan, setSoapPlan] = useState('');
  const [noteAttachments, setNoteAttachments] = useState<string[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Gallery
  const [imagingGallery, setImagingGallery] = useState<any[]>([]);
  const [selectedImageCategory, setSelectedImageCategory] = useState<string>('All');
  const [previewImage, setPreviewImage] = useState<any | null>(null);
  const [isAddingStudy, setIsAddingStudy] = useState(false);
  const [newStudyName, setNewStudyName] = useState('');
  const [newStudyCategory, setNewStudyCategory] = useState('CBCT');

  // Documents
  const [patientDocuments, setPatientDocuments] = useState<any[]>([]);
  const [selectedDocTypeFilter, setSelectedDocTypeFilter] = useState<string>('All');
  const [previewDocument, setPreviewDocument] = useState<any | null>(null);
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState('Consent Form');

  // Recall Configuration
  const [recallInterval, setRecallInterval] = useState('6 Months');
  const [recallNextVisit, setRecallNextVisit] = useState('');
  const [recallFollowupStatus, setRecallFollowupStatus] = useState('Scheduled');
  const [isEditingRecall, setIsEditingRecall] = useState(false);

  // Load and sync states per-patient
  useEffect(() => {
    if (!activePatient) return;
    
    // Generate some interesting mock teeth states based on the patient
    const mockTeeth: Record<number, 'sound' | 'prep' | 'restored' | 'implant' | 'missing'> = {};
    if (activePatient.id === "PTS-9412") { // Arthur Pendragon
      [11, 12, 13, 21, 22].forEach(n => mockTeeth[n] = 'prep');
      [14, 15, 24, 25].forEach(n => mockTeeth[n] = 'restored');
      [16, 26].forEach(n => mockTeeth[n] = 'missing');
    } else if (activePatient.id === "PTS-1092") { // Bruce Wayne
      mockTeeth[36] = 'implant';
      [37, 38, 46].forEach(n => mockTeeth[n] = 'restored');
    } else if (activePatient.id === "PTS-8831") { // Clara Oswald
      [11, 12, 13, 21, 22, 23].forEach(n => mockTeeth[n] = 'restored'); // E.Max Veneers
    } else if (activePatient.id === "PTS-3301") { // Scott Summers
      // Fully edentulous maxillary arch
      for (let i = 11; i <= 28; i++) {
        mockTeeth[i] = 'missing';
      }
    }
    setTeethStatuses(mockTeeth);
    setAiOutput(null);
    setClinicalNotes('');

    const defaultConditions = activePatient.medicalHistory?.join(', ') || '';
    const defaultMeds = activePatient.medications?.join(', ') || '';
    const defaultAllergiesList = activePatient.allergies?.join(', ') || '';
    
    // 1. Load clinical history from Supabase or localStorage fallback
    const loadClinicalHistory = async () => {
      setSupabaseLoading(true);
      try {
        const { createClient } = await import('@/utils/supabase/client');
        const supabase = createClient();
        const { data, error } = await (supabase as any)
          .from('clinical_histories')
          .select('*')
          .eq('patient_id', activePatient.id)
          .maybeSingle();
        
        const historyData = data as any;
        if (historyData) {
          setMedicalConditions(historyData.medical_conditions || '');
          setMedHistoryMedications(historyData.medications || '');
          setMedicalAllergies(historyData.allergies || '');
          setSmokingStatus(historyData.smoking_status || 'Non-smoker');
          setPregnancy(historyData.pregnancy || 'Not pregnant');
          setBloodPressure(historyData.blood_pressure || '120/80');
          setDiabetes(historyData.diabetes || 'Negative');
          setCardiacHistory(historyData.cardiac_history || 'None');
          setMedicalHistoryNotes(historyData.medical_notes || '');
          
          setChiefComplaint(historyData.chief_complaint || '');
          setPrevDentalTreatment(historyData.prev_dental_treatment || '');
          setPrevProsthodonticTreatment(historyData.prev_prosthodontic_treatment || '');
          setImplantHistory(historyData.implant_history || '');
          setOralHygieneAssessment(historyData.oral_hygiene_assessment || 'Good');
          setCariesRisk(historyData.caries_risk || 'Low');
          setPeriodontalStatus(historyData.periodontal_status || 'Healthy');
          setOcclusionNotes(historyData.occlusion_notes || '');
          
          setSupabaseStatus('success');
          setSupabaseLoading(false);
          return;
        }
      } catch (e) {
        console.warn("Supabase fetch failed. Loading from local storage instead.", e);
      }
      
      // Local Storage Fallback
      const localHistoryKey = `healthos_history_${activePatient.id}`;
      const savedLocal = localStorage.getItem(localHistoryKey);
      if (savedLocal) {
        try {
          const parsed = JSON.parse(savedLocal);
          setMedicalConditions(parsed.medicalConditions || '');
          setMedHistoryMedications(parsed.medHistoryMedications || '');
          setMedicalAllergies(parsed.medicalAllergies || '');
          setSmokingStatus(parsed.smokingStatus || 'Non-smoker');
          setPregnancy(parsed.pregnancy || 'Not pregnant');
          setBloodPressure(parsed.bloodPressure || '120/80');
          setDiabetes(parsed.diabetes || 'Negative');
          setCardiacHistory(parsed.cardiacHistory || 'None');
          setMedicalHistoryNotes(parsed.medicalHistoryNotes || '');
          
          setChiefComplaint(parsed.chiefComplaint || '');
          setPrevDentalTreatment(parsed.prevDentalTreatment || '');
          setPrevProsthodonticTreatment(parsed.prevProsthodonticTreatment || '');
          setImplantHistory(parsed.implantHistory || '');
          setOralHygieneAssessment(parsed.oralHygieneAssessment || 'Good');
          setCariesRisk(parsed.cariesRisk || 'Low');
          setPeriodontalStatus(parsed.periodontalStatus || 'Healthy');
          setOcclusionNotes(parsed.occlusionNotes || '');
          setSupabaseStatus('idle');
          setSupabaseLoading(false);
          return;
        } catch (e) {
          console.error("Failed to parse local history", e);
        }
      }
      
      // Default initial states if neither are present
      setMedicalConditions(defaultConditions);
      setMedHistoryMedications(defaultMeds);
      setMedicalAllergies(defaultAllergiesList);
      setSmokingStatus('Non-smoker');
      setPregnancy(activePatient.medicalAlerts?.includes('Pregnancy (1st Trimester)') ? 'Pregnant (1st Trimester)' : 'Not pregnant');
      setBloodPressure('120/80');
      setDiabetes('Negative');
      setCardiacHistory(activePatient.medicalAlerts?.includes('Heart Condition') ? 'Yes (Congestive)' : 'None');
      setMedicalHistoryNotes('Baseline clinical intake logged.');
      
      setChiefComplaint('Aesthetic rehabilitation and restoration of masticatory function.');
      setPrevDentalTreatment('Amalgam restorations, scaling.');
      setPrevProsthodonticTreatment('None');
      setImplantHistory(activePatient.id === 'PTS-1092' ? 'Bone grafting healed' : 'None');
      setOralHygieneAssessment('Fair');
      setCariesRisk('Moderate');
      setPeriodontalStatus('Gingivitis (generalized)');
      setOcclusionNotes('Class I occlusion with minor anterior crowding.');
      setSupabaseStatus('idle');
      setSupabaseLoading(false);
    };

    loadClinicalHistory();

    // 2. Load Treatment Plans
    const txPlansKey = `healthos_txplans_${activePatient.id}`;
    const savedTxPlans = localStorage.getItem(txPlansKey);
    if (savedTxPlans) {
      setTreatmentPlans(JSON.parse(savedTxPlans));
    } else {
      setTreatmentPlans([
        {
          id: `TX-${activePatient.id === 'PTS-1092' ? '1092' : '902'}`,
          title: activePatient.currentTreatment || "Full-Arch Maxillary Restorations",
          description: `Full prosthodontic restoration plan for ${activePatient.name}.`,
          estimatedCost: 18450,
          status: 'Active',
          progress: 45,
          createdDate: '2026-07-05',
          phases: [
            { name: "Phase 1: Diagnostic Modeling", status: "Completed", details: "3Shape scans, CBCT, portraits, mock-up approval." },
            { name: "Phase 2: Preparations & Temporization", status: "In Progress", details: "Minimal prep on teeth. PMMA temporary crowns." },
            { name: "Phase 3: Laboratory Sintering", status: "Pending", details: "Milling custom monolithic multilayer zirconia." },
            { name: "Phase 4: Sintering & Delivery", status: "Pending", details: "Bonding final restorations and occlusal balance." }
          ]
        }
      ]);
    }

    // 3. Load Clinical SOAP Notes
    const notesKey = `healthos_soapnotes_${activePatient.id}`;
    const savedNotes = localStorage.getItem(notesKey);
    if (savedNotes) {
      setClinicalNotesList(JSON.parse(savedNotes));
    } else {
      setClinicalNotesList([
        {
          id: `NOTE-1`,
          title: "Initial Clinical Assessment & Consultation",
          soap: {
            subjective: `Patient ${activePatient.name} reports satisfaction with overall oral health but desires correction of anterior spacing and color correction. No acute dental pain.`,
            objective: "Intraoral evaluation reveals sound periodontal structures, generalized moderate plaque. Incisal chipping on #11 and #21.",
            assessment: "Mild anterior maxillary crowding and localized aesthetic dissatisfaction.",
            plan: "Finalize Digital Smile Design parameters, coordinate trial diagnostic mockup appointment. Book 3Shape Trios scan."
          },
          attachments: [{ name: "diagnostic_trios_scan.stl", url: "#" }],
          timestamp: "2026-07-10 10:15 AM",
          author: activePatient.primaryDoctor || "Dr. Ahmed",
          edits: []
        }
      ]);
    }

    // 4. Load Imaging Gallery
    const galleryKey = `healthos_gallery_${activePatient.id}`;
    const savedGallery = localStorage.getItem(galleryKey);
    if (savedGallery) {
      setImagingGallery(JSON.parse(savedGallery));
    } else {
      setImagingGallery([
        { id: "img-1", name: "Maxillary CBCT Double Arch (High-Res)", category: "CBCT", url: "/placeholder-imaging.jpg", date: "2026-07-10" },
        { id: "img-2", name: "3Shape Upper Jaw Arch Scan STL", category: "Intraoral Scan", url: "/placeholder-imaging.jpg", date: "2026-07-03" },
        { id: "img-3", name: "12-Angle Facial Portrait DSD-v2", category: "Clinical Photo", url: activePatient.photoUrl, date: "2026-07-12" },
        { id: "img-4", name: "Pre-op Alveolar Ridge Radiograph #36", category: "Radiograph", url: "/placeholder-imaging.jpg", date: "2026-07-02" }
      ]);
    }

    // 5. Load Documents
    const docsKey = `healthos_docs_${activePatient.id}`;
    const savedDocs = localStorage.getItem(docsKey);
    if (savedDocs) {
      setPatientDocuments(JSON.parse(savedDocs));
    } else {
      setPatientDocuments([
        { id: "doc-1", name: "Informed Consent for Full-Arch Prosthetics.pdf", type: "Consent Form", url: "#", date: "2026-07-01" },
        { id: "doc-2", name: "CAD_CAM Lab Sintering Prescription Form.pdf", type: "Lab Prescription", url: "#", date: "2026-07-10" },
        { id: "doc-3", name: "Maxillofacial Surgeon Referral Letter.pdf", type: "Referral Letter", url: "#", date: "2026-06-28" }
      ]);
    }

    // 6. Load Recall Settings
    const recallKey = `healthos_recall_${activePatient.id}`;
    const savedRecall = localStorage.getItem(recallKey);
    if (savedRecall) {
      try {
        const parsed = JSON.parse(savedRecall);
        setRecallInterval(parsed.recallInterval || '6 Months');
        setRecallNextVisit(parsed.recallNextVisit || '');
        setRecallFollowupStatus(parsed.recallFollowupStatus || 'Scheduled');
      } catch (e) {
        console.error(e);
      }
    } else {
      setRecallInterval('6 Months');
      setRecallNextVisit('2026-10-15');
      setRecallFollowupStatus('Scheduled');
    }

    setIsEditingHistory(false);
    setIsEditingRecall(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPatientId]);

  // Unified save functions
  const handleSaveHistory = async () => {
    setSupabaseLoading(true);
    const historyObj = {
      medicalConditions,
      medHistoryMedications,
      medicalAllergies,
      smokingStatus,
      pregnancy,
      bloodPressure,
      diabetes,
      cardiacHistory,
      medicalHistoryNotes,
      chiefComplaint,
      prevDentalTreatment,
      prevProsthodonticTreatment,
      implantHistory,
      oralHygieneAssessment,
      cariesRisk,
      periodontalStatus,
      occlusionNotes
    };

    // 1. Save locally
    localStorage.setItem(`healthos_history_${activePatient.id}`, JSON.stringify(historyObj));

    // 2. Save to Supabase
    try {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      const { data, error } = await (supabase as any)
        .from('clinical_histories')
        .upsert({
          patient_id: activePatient.id,
          medical_conditions: medicalConditions,
          medications: medHistoryMedications,
          allergies: medicalAllergies,
          smoking_status: smokingStatus,
          pregnancy,
          blood_pressure: bloodPressure,
          diabetes,
          cardiac_history: cardiacHistory,
          medical_notes: medicalHistoryNotes,
          chief_complaint: chiefComplaint,
          prev_dental_treatment: prevDentalTreatment,
          prev_prosthodontic_treatment: prevProsthodonticTreatment,
          implant_history: implantHistory,
          oral_hygiene_assessment: oralHygieneAssessment,
          caries_risk: cariesRisk,
          periodontal_status: periodontalStatus,
          occlusion_notes: occlusionNotes,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error("Supabase upsert error:", error);
        setSupabaseStatus('error');
      } else {
        setSupabaseStatus('success');
      }
    } catch (e) {
      console.warn("Supabase integration offline. Fallback to localStorage success.", e);
      setSupabaseStatus('error');
    }
    setSupabaseLoading(false);
    setIsEditingHistory(false);
  };

  const handleSaveRecall = () => {
    const recallKey = `healthos_recall_${activePatient.id}`;
    localStorage.setItem(recallKey, JSON.stringify({
      recallInterval,
      recallNextVisit,
      recallFollowupStatus
    }));

    // Synchronize master patients state nextAppointment parameters
    setPatients(prev => prev.map(p => {
      if (p.id === activePatient.id) {
        return {
          ...p,
          nextAppointment: recallNextVisit ? `${recallNextVisit} 10:00 AM` : p.nextAppointment
        };
      }
      return p;
    }));

    setIsEditingRecall(false);
  };

  const saveTreatmentPlansList = (newList: any[]) => {
    setTreatmentPlans(newList);
    localStorage.setItem(`healthos_txplans_${activePatient.id}`, JSON.stringify(newList));
  };

  const saveClinicalNotesList = (newList: any[]) => {
    setClinicalNotesList(newList);
    localStorage.setItem(`healthos_soapnotes_${activePatient.id}`, JSON.stringify(newList));
  };

  const saveImagingGallery = (newList: any[]) => {
    setImagingGallery(newList);
    localStorage.setItem(`healthos_gallery_${activePatient.id}`, JSON.stringify(newList));
  };

  const savePatientDocuments = (newList: any[]) => {
    setPatientDocuments(newList);
    localStorage.setItem(`healthos_docs_${activePatient.id}`, JSON.stringify(newList));
  };

  const saveRecallSettings = (interval: string, nextVisit: string, status: string) => {
    setRecallInterval(interval);
    setRecallNextVisit(nextVisit);
    setRecallFollowupStatus(status);
    localStorage.setItem(`healthos_recall_${activePatient.id}`, JSON.stringify({
      recallInterval: interval,
      recallNextVisit: nextVisit,
      recallFollowupStatus: status
    }));
  };

  // Automated Timeline Aggregator
  const getMergedTimeline = () => {
    if (!activePatient) return [];
    
    const events: { date: string; title: string; category: string; description: string; rawDate: Date }[] = [];
    
    // Static baseline events
    if (activePatient.timeline) {
      activePatient.timeline.forEach(item => {
        const parsedDate = new Date(item.date);
        events.push({
          date: item.date,
          title: item.title,
          category: item.category,
          description: item.description,
          rawDate: isNaN(parsedDate.getTime()) ? new Date(0) : parsedDate
        });
      });
    }

    // Dynamic SOAP Notes
    clinicalNotesList.forEach(note => {
      const parsedDate = new Date(note.timestamp);
      events.push({
        date: note.timestamp,
        title: note.title,
        category: "Clinical SOAP Note",
        description: `Subjective: ${note.soap.subjective.substring(0, 80)}...\nObjective: ${note.soap.objective.substring(0, 80)}...`,
        rawDate: isNaN(parsedDate.getTime()) ? new Date() : parsedDate
      });
    });

    // Dynamic Treatment Plans
    treatmentPlans.forEach(plan => {
      const parsedDate = new Date(plan.createdDate);
      events.push({
        date: plan.createdDate,
        title: `Treatment Plan Generated: ${plan.title}`,
        category: "Treatment Progress",
        description: `${plan.description} • Estimated Cost: $${plan.estimatedCost.toLocaleString()} • Status is currently ${plan.status}.`,
        rawDate: isNaN(parsedDate.getTime()) ? new Date() : parsedDate
      });
    });

    // Dynamic Documents / Case Files
    patientDocuments.forEach(doc => {
      const parsedDate = new Date(doc.date);
      events.push({
        date: doc.date,
        title: `EHR File Registered: ${doc.name}`,
        category: "Laboratory / Document",
        description: `Type: ${doc.type}. File archived safely inside secure EHR storage container.`,
        rawDate: isNaN(parsedDate.getTime()) ? new Date() : parsedDate
      });
    });

    // Dynamic Imaging / Radiology
    imagingGallery.forEach(img => {
      const parsedDate = new Date(img.date);
      events.push({
        date: img.date,
        title: `Imaging Study Registered: ${img.name}`,
        category: "Radiology / CBCT",
        description: `Category: ${img.category}. Sintering parameters verified.`,
        rawDate: isNaN(parsedDate.getTime()) ? new Date() : parsedDate
      });
    });

    // Sort chronologically descending (newest first)
    return events.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
  };

  // SOAP Clinical note actions
  const handleSaveSOAPNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!soapSubjective.trim() && !soapObjective.trim() && !soapAssessment.trim() && !soapPlan.trim()) return;

    const timestamp = new Date().toLocaleDateString('en-US', {
      month: 'short', day: '2-digit', year: 'numeric'
    }) + " " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (editingNoteId) {
      const oldNote = clinicalNotesList.find(n => n.id === editingNoteId);
      const changes: string[] = [];
      if (oldNote.soap.subjective !== soapSubjective) changes.push("Subjective");
      if (oldNote.soap.objective !== soapObjective) changes.push("Objective");
      if (oldNote.soap.assessment !== soapAssessment) changes.push("Assessment");
      if (oldNote.soap.plan !== soapPlan) changes.push("Plan");

      const editRecord = {
        timestamp,
        author: activePatient.primaryDoctor || "Dr. Ahmed",
        fieldsChanged: changes.length > 0 ? changes.join(', ') : "Minor adjustments"
      };

      const updatedList = clinicalNotesList.map(n => {
        if (n.id === editingNoteId) {
          return {
            ...n,
            soap: {
              subjective: soapSubjective,
              objective: soapObjective,
              assessment: soapAssessment,
              plan: soapPlan
            },
            edits: [editRecord, ...(n.edits || [])]
          };
        }
        return n;
      });
      saveClinicalNotesList(updatedList);
      setEditingNoteId(null);
    } else {
      const newNote = {
        id: `NOTE-${Math.floor(1000 + Math.random() * 9000)}`,
        title: noteTitle || "Prosthodontic Treatment Log",
        soap: {
          subjective: soapSubjective,
          objective: soapObjective,
          assessment: soapAssessment,
          plan: soapPlan
        },
        attachments: noteAttachments.map(name => ({ name, url: "#" })),
        timestamp,
        author: activePatient.primaryDoctor || "Dr. Ahmed",
        edits: []
      };
      saveClinicalNotesList([newNote, ...clinicalNotesList]);
    }

    setSoapSubjective('');
    setSoapObjective('');
    setSoapAssessment('');
    setSoapPlan('');
    setNoteAttachments([]);
    setNoteTitle('Crown Prep SOAP Draft');
  };

  const handleEditNoteClick = (note: any) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setSoapSubjective(note.soap.subjective);
    setSoapObjective(note.soap.objective);
    setSoapAssessment(note.soap.assessment);
    setSoapPlan(note.soap.plan);
    setNoteAttachments(note.attachments?.map((a: any) => a.name) || []);
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm("Are you sure you want to delete this clinical note?")) {
      const updated = clinicalNotesList.filter(n => n.id !== noteId);
      saveClinicalNotesList(updated);
    }
  };


  // Filters logic
  const filteredPatients = React.useMemo(() => patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          patient.currentTreatment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [patients, searchQuery, statusFilter]);

  // Sort and Paginate logic
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue as string) 
        : (bValue as string).localeCompare(aValue);
    } else {
      return sortOrder === 'asc' 
        ? (aValue as number || 0) - (bValue as number || 0) 
        : (bValue as number || 0) - (aValue as number || 0);
    }
  });

  const totalPages = Math.ceil(sortedPatients.length / itemsPerPage);
  const paginatedPatients = sortedPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Action: Add note
  const handleAddClinicalNote = () => {
    if (!activeClinicalNote.trim()) return;
    const newNote = {
      date: "Jul 17, 2026",
      title: noteTitle || "Clinical Procedure Log",
      category: "Clinical Note",
      description: activeClinicalNote
    };
    
    // Update local state for this patient
    setPatients(prev => prev.map(p => {
      if (p.id === activePatient.id) {
        return {
          ...p,
          timeline: [newNote, ...p.timeline]
        };
      }
      return p;
    }));
    
    setActiveClinicalNote('');
    setNoteTitle('');
    setWorkspaceTab('overview'); // redirect to overview to see timeline
  };

  // SOAP templates
  const applySoapTemplate = (type: 'crown' | 'implant' | 'veneer') => {
    if (type === 'crown') {
      setNoteTitle("Crown Prep (#11, #12, #21) - SOAP Note");
      setSoapSubjective(`Patient Arthur Pendragon presents for full crown preparations on teeth #11, #12, and #21. Medical clearance for Type II Diabetes received and verified.`);
      setSoapObjective(`Administered 1 carpule of 2% Lidocaine with 1:100k Epinephrine. Prep margins placed 0.5mm subgingivally with 1.2mm radial chamfer design. Cord #00 packed. High-definition intraoral scan with Trios 5 completed. Vita shade guide selection matched at OM1 bleach.`);
      setSoapAssessment(`Teeth #11, #12, #21 prepared successfully, sound margins, excellent tissue management, zero bleeding post-cord.`);
      setSoapPlan(`Fabricated PMMA provisionals, cemented with TempBond. Sent 3Shape STL scans to milling queue for high-translucency Zirconia crown sintering. Patient scheduled for final delivery in 7 days.`);
    } else if (type === 'implant') {
      setNoteTitle("Implant Surgical Consultation (#36) - SOAP Note");
      setSoapSubjective(`Patient Bruce Wayne here for #36 implant planning. History of severe nocturnal bruxism discussed.`);
      setSoapObjective(`CBCT analyzed. Available bone height is 12.8mm, width 6.4mm. Density verified as D2. Guided surgical template planned using Exocad STL/CBCT merger.`);
      setSoapAssessment(`Ideal site for Straumann BLActive 4.1x10mm implant. Low surgical risk, bone volume is optimal.`);
      setSoapPlan(`Surgical guide sent to SprintRay printing queue. Schedule implant placement with torque target 35 Ncm. Issue custom heavy-duty nocturnal occlusal guard post-restoration.`);
    } else if (type === 'veneer') {
      setNoteTitle("Veneer Smile Design Try-in - SOAP Note");
      setSoapSubjective(`Patient Clara Oswald here for evaluation of digital smile design mock-up for veneers 13-23.`);
      setSoapObjective(`PMMA physical aesthetic mock-up placed on un-prepped arches. Patient evaluated in mirror and under photostudio lighting. Verified phonetics and smile harmony.`);
      setSoapAssessment(`Highly harmonious integration. Patient requests slight roundness of distal incisal angles on #11 and #21. High-precision modifications logged.`);
      setSoapPlan(`Adjusted Exocad modeling files to incorporate rounding. Exported final restoration specifications to 3Shape lab system for zirconia multi-unit milling.`);
    }
  };

  // Live AI Clinical Platform API Wrapper
  const callGeminiClinicalAPI = async (action: string, promptText: string, additionalData?: any) => {
    const patientContext = {
      id: activePatient.id,
      name: activePatient.name,
      age: activePatient.age,
      gender: activePatient.gender,
      bloodGroup: activePatient.bloodGroup,
      allergyStatus: activePatient.allergyStatus,
      medicalAlerts: activePatient.medicalAlerts,
      primaryDoctor: activePatient.primaryDoctor,
      currentTreatment: activePatient.currentTreatment,
      medicalHistory: medicalConditions,
      medications: medHistoryMedications,
      chiefComplaint,
      prevDentalTreatment,
      prevProsthodonticTreatment,
      implantHistory,
      oralHygieneAssessment,
      cariesRisk,
      periodontalStatus,
      occlusionNotes,
      clinicalNotesList,
      treatmentPlans,
      uploadedFiles,
    };

    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
        patientContext,
        prompt: promptText,
        additionalData,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Server failed to process clinical request.");
    }

    const data = await res.json();
    return data.text;
  };

  // AI Prompt Trigger for general copilot queries
  const triggerAiCopilot = async (promptText: string) => {
    setAiLoading(true);
    setAiPrompt(promptText);
    setAiOutput(null);

    try {
      const text = await callGeminiClinicalAPI("copilot", promptText);
      setAiOutput(text);
    } catch (e: any) {
      console.error(e);
      setAiOutput(`### ⚠️ AI Clinical Platform Connection Error\n\nCould not fetch response from server: **${e.message || "Unknown error"}**\n\n*Please ensure your GEMINI_API_KEY is properly configured in the developer workspace secrets dashboard.*`);
    } finally {
      setAiLoading(false);
    }
  };

  // SOAP Assistant Generator & Modifiers
  const triggerSoapAi = async (mode: string, instruction: string) => {
    setSoapAiLoading(true);
    try {
      const text = await callGeminiClinicalAPI("soap", instruction, {
        mode,
        subjective: soapSubjective,
        objective: soapObjective,
        assessment: soapAssessment,
        plan: soapPlan,
      });

      // Parse structured output using smart regular expressions
      const sub = text.match(/### SUBJECTIVE\s*([\s\S]*?)(?=### OBJECTIVE|### ASSESSMENT|### PLAN|$)/i)?.[1]?.trim();
      const obj = text.match(/### OBJECTIVE\s*([\s\S]*?)(?=### SUBJECTIVE|### ASSESSMENT|### PLAN|$)/i)?.[1]?.trim();
      const ass = text.match(/### ASSESSMENT\s*([\s\S]*?)(?=### SUBJECTIVE|### OBJECTIVE|### PLAN|$)/i)?.[1]?.trim();
      const pln = text.match(/### PLAN\s*([\s\S]*?)(?=### SUBJECTIVE|### OBJECTIVE|### ASSESSMENT|$)/i)?.[1]?.trim();

      if (sub || obj || ass || pln) {
        if (sub) setSoapSubjective(sub);
        if (obj) setSoapObjective(obj);
        if (ass) setSoapAssessment(ass);
        if (pln) setSoapPlan(pln);
      } else {
        // Fallback: put the full text in assessment and plan if structure wasn't strictly found
        setSoapAssessment(prev => prev + "\n\n" + text);
      }
    } catch (e: any) {
      console.error(e);
      alert("AI SOAP Note Generation failed: " + e.message);
    } finally {
      setSoapAiLoading(false);
    }
  };

  // Treatment Planner Generator
  const triggerTreatmentAi = async (focusArea: string) => {
    setTreatmentAiLoading(true);
    setTreatmentAiPrompt(focusArea);
    setTreatmentAiOutput(null);
    try {
      const text = await callGeminiClinicalAPI("treatment_plan", focusArea);
      setTreatmentAiOutput(text);
    } catch (e: any) {
      console.error(e);
      setTreatmentAiOutput(`### ⚠️ Treatment Planner Error\n\nFailed to design plan: ${e.message}`);
    } finally {
      setTreatmentAiLoading(false);
    }
  };

  // Patient Education Explainer
  const triggerPatientEdAi = async (topic: string) => {
    setPatientEdLoading(true);
    setPatientEdPrompt(topic);
    setPatientEdOutput(null);
    try {
      const text = await callGeminiClinicalAPI("patient_education", topic);
      setPatientEdOutput(text);
    } catch (e: any) {
      console.error(e);
      setPatientEdOutput(`### ⚠️ Patient Education Error\n\nFailed to generate patient guide: ${e.message}`);
    } finally {
      setPatientEdLoading(false);
    }
  };

  // Clinical Summary Synthesizer
  const triggerClinicalSummaryAi = async () => {
    setSummaryAiLoading(true);
    setSummaryAiOutput(null);
    try {
      const text = await callGeminiClinicalAPI("clinical_summary", "Generate Patient Summary Sheet");
      setSummaryAiOutput(text);
    } catch (e: any) {
      console.error(e);
      setSummaryAiOutput(`### ⚠️ Clinical Summary Error\n\nFailed to synthesize clinical baseline: ${e.message}`);
    } finally {
      setSummaryAiLoading(false);
    }
  };

  // Risk Detection Scanner
  const triggerRiskDetectionAi = async () => {
    setRiskScanLoading(true);
    setRiskScanOutput(null);
    try {
      const text = await callGeminiClinicalAPI("risk_detection", "Scan for Clinical Risks");
      setRiskScanOutput(text);
    } catch (e: any) {
      console.error(e);
      setRiskScanOutput(`### ⚠️ Risk Scanning Error\n\nFailed to analyze medical and prosthetic risk profiles: ${e.message}`);
    } finally {
      setRiskScanLoading(false);
    }
  };

  // Send message from persistent right sidebar
  const handleSendCopilotSidebarMessage = async () => {
    if (!copilotSidebarInput.trim() || copilotSidebarLoading) return;

    const userMsg = { role: 'user' as const, text: copilotSidebarInput };
    setCopilotSidebarMessages(prev => [...prev, userMsg]);
    const promptToSend = copilotSidebarInput;
    setCopilotSidebarInput('');
    setCopilotSidebarLoading(true);

    try {
      // Create chat thread format from sidebar messages
      const conversationHistory = copilotSidebarMessages.map(m => `${m.role === 'user' ? 'Dentist' : 'Copilot'}: ${m.text}`).join("\n");
      const fullPrompt = `${conversationHistory}\nDentist: ${promptToSend}\n\nPlease respond directly to the dentist.`;
      
      const responseText = await callGeminiClinicalAPI("copilot", fullPrompt);
      setCopilotSidebarMessages(prev => [...prev, { role: 'assistant', text: responseText }]);
    } catch (e: any) {
      console.error(e);
      setCopilotSidebarMessages(prev => [...prev, { role: 'assistant', text: `⚠️ **Clinical Copilot Error**: Could not connect to decision-support servers. Please check if your GEMINI_API_KEY secret is active.` }]);
    } finally {
      setCopilotSidebarLoading(false);
    }
  };

  // Drag and Drop simulation
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const newFile = {
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
        type: file.name.endsWith('.stl') ? 'STL Files' : file.name.endsWith('.dcm') ? 'DICOM Imports' : 'Image Scan',
        date: "2026-07-17"
      };
      setUploadedFiles(prev => [newFile, ...prev]);
    }
  };

  // Toggle single tooth state (interactive dental chart)
  const toggleToothState = (num: number) => {
    const states: ('sound' | 'prep' | 'restored' | 'implant' | 'missing')[] = ['sound', 'prep', 'restored', 'implant', 'missing'];
    const current = teethStatuses[num] || 'sound';
    const nextIdx = (states.indexOf(current) + 1) % states.length;
    setTeethStatuses(prev => ({
      ...prev,
      [num]: states[nextIdx]
    }));
  };

  return (
    <div className="space-y-6">
      
      <AnimatePresence mode="wait">
        {!selectedPatientId ? (
          /* ======================================================
             PATIENT LIST VIEW
             ====================================================== */
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Header toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-zinc-900/25 p-4 rounded-2xl border border-zinc-900/80 backdrop-blur-sm">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight sm:text-2xl flex items-center gap-2">
                  Patients Workspace
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                    6 Registered
                  </span>
                </h2>
                <p className="text-zinc-400 text-xs">
                  Prosthodontics & Digital Dentistry Centralized EHR Database Node.
                </p>
              </div>
              <div>
                <button
                  onClick={() => {
                    setEditingPatient(null);
                    setPatientForm({
                      name: '',
                      email: '',
                      phone: '',
                      age: 35,
                      gender: 'Male',
                      bloodGroup: 'O+',
                      allergyStatus: 'No Known Allergies',
                      medicalAlerts: '',
                      primaryDoctor: 'Dr. Ahmed',
                      currentTreatment: '',
                      status: 'Active',
                      aiRiskFlag: 'Low',
                      riskDescription: 'Excellent oral hygiene.',
                      summary: '',
                      medicalHistory: '',
                      medications: '',
                      allergies: ''
                    });
                    setIsPatientModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-lg shadow-emerald-500/10"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" /> Register New Patient
                </button>
              </div>
            </div>

            {/* Filter controls and Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Search input */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clinical charts, treatment plans, national ID..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900/60 border border-zinc-900 text-zinc-200 placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex flex-wrap gap-1.5 bg-zinc-900/40 p-1 rounded-xl border border-zinc-900/80 w-full md:w-auto">
                {(['All', 'Active', 'New', 'Under Treatment', 'Completed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === status
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* View toggle */}
              <div className="flex gap-2 items-center shrink-0 w-full md:w-auto justify-end border-t border-zinc-900 pt-3 md:pt-0 md:border-0">
                <div className="flex bg-zinc-900/40 p-1 rounded-xl border border-zinc-900">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    title="Table View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('card')}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'card' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    title="Card View"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Patients Display Area */}
            {filteredPatients.length === 0 ? (
              <div className="p-16 rounded-2xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-sm text-center space-y-4">
                <div className="inline-flex items-center justify-center p-4 rounded-full bg-zinc-900 text-zinc-400">
                  <Users className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-white">No patient records found</h3>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Try adjusting your filters or search keywords, or register a new prosthodontics clinical profile.
                  </p>
                </div>
              </div>
            ) : viewMode === 'table' ? (
              /* --- TABLE VIEW --- */
              <div className="overflow-x-auto rounded-2xl border border-zinc-900 bg-zinc-900/10 backdrop-blur-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 bg-zinc-900/40 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                      <th className="py-3 px-4 cursor-pointer hover:text-emerald-400 select-none transition-colors" onClick={() => handleSort('id')}>
                        <span className="flex items-center gap-1">Patient ID <ArrowUpDown className="w-3 h-3" /></span>
                      </th>
                      <th className="py-3 px-4 cursor-pointer hover:text-emerald-400 select-none transition-colors" onClick={() => handleSort('name')}>
                        <span className="flex items-center gap-1">Full Name <ArrowUpDown className="w-3 h-3" /></span>
                      </th>
                      <th className="py-3 px-4 cursor-pointer hover:text-emerald-400 select-none transition-colors" onClick={() => handleSort('age')}>
                        <span className="flex items-center gap-1">Age / Gender <ArrowUpDown className="w-3 h-3" /></span>
                      </th>
                      <th className="py-3 px-4">Primary Doctor</th>
                      <th className="py-3 px-4">Current Treatment</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 cursor-pointer hover:text-emerald-400 select-none transition-colors" onClick={() => handleSort('lastVisit')}>
                        <span className="flex items-center gap-1">Last Visit <ArrowUpDown className="w-3 h-3" /></span>
                      </th>
                      <th className="py-3 px-4">AI Risk</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/50">
                    {paginatedPatients.map((pat) => (
                      <tr
                        key={pat.id}
                        onClick={() => router.push(`/patients/${pat.id}`)}
                        className="hover:bg-zinc-900/30 transition-colors cursor-pointer group"
                      >
                        {/* ID */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400 group-hover:text-emerald-400 transition-colors">
                          {pat.id}
                        </td>
                        {/* Photo & Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <Image
                              src={pat.photoUrl}
                              alt={pat.name}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full border border-zinc-800 object-cover shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">{pat.name}</p>
                              <p className="text-[10px] text-zinc-500">{pat.email}</p>
                            </div>
                          </div>
                        </td>
                        {/* Age & Gender */}
                        <td className="py-3.5 px-4 text-xs text-zinc-300">
                          {pat.age} yrs • {pat.gender}
                        </td>
                        {/* Doctor */}
                        <td className="py-3.5 px-4 text-xs text-zinc-400">
                          {pat.primaryDoctor}
                        </td>
                        {/* Treatment */}
                        <td className="py-3.5 px-4 text-xs font-medium text-emerald-400">
                          {pat.currentTreatment}
                        </td>
                        {/* Status badge */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[9px] uppercase font-mono font-medium border ${
                            pat.status === 'Completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : pat.status === 'Under Treatment'
                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                : pat.status === 'New'
                                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}>
                            {pat.status}
                          </span>
                        </td>
                        {/* Last Visit */}
                        <td className="py-3.5 px-4 text-xs text-zinc-300">
                          <span className="font-mono text-[11px] truncate block max-w-[180px]">{pat.lastVisit}</span>
                        </td>
                        {/* AI Risk Flag */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold font-mono ${
                            pat.aiRiskFlag === 'High' ? 'text-red-400' : pat.aiRiskFlag === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              pat.aiRiskFlag === 'High' ? 'bg-red-400 animate-pulse' : pat.aiRiskFlag === 'Medium' ? 'bg-amber-400' : 'bg-emerald-400'
                            }`} />
                            {pat.aiRiskFlag}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleEditPatientClick(pat, e)}
                              className="p-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-zinc-400 hover:text-white transition-colors"
                              title="Edit Patient"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleArchivePatient(pat.id, e)}
                              className="p-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-zinc-400 hover:text-white transition-colors"
                              title="Archive Profile"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeletePatient(pat.id, e)}
                              className="p-1 rounded bg-zinc-900 border border-zinc-800 hover:border-red-900/50 hover:bg-red-950/20 text-zinc-500 hover:text-red-400 transition-colors"
                              title="Delete Patient"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* --- CARD GRID VIEW --- */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedPatients.map((pat) => (
                  <div
                    key={pat.id}
                    onClick={() => router.push(`/patients/${pat.id}`)}
                    className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800/80 transition-all hover:bg-zinc-900/50 cursor-pointer flex flex-col justify-between gap-4 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Image
                            src={pat.photoUrl}
                            alt={pat.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full border border-zinc-800 object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h4 className="text-sm font-bold text-white leading-tight group-hover:text-emerald-300 transition-colors">{pat.name}</h4>
                            <span className="text-[9px] font-mono text-zinc-500">{pat.id}</span>
                          </div>
                        </div>
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] uppercase font-mono font-medium border ${
                          pat.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : pat.status === 'Under Treatment'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          {pat.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-zinc-400 border-t border-zinc-900/60 pt-3">
                        <div className="flex justify-between">
                          <span>Age/Gender:</span>
                          <span className="text-zinc-200">{pat.age} yrs • {pat.gender}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Primary Doctor:</span>
                          <span className="text-zinc-300 font-medium">{pat.primaryDoctor}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Current treatment:</span>
                          <span className="text-emerald-400 font-semibold truncate block max-w-[150px]">{pat.currentTreatment}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] bg-zinc-950/40 p-2 rounded-lg border border-zinc-900/40 mt-2">
                          <span className="text-zinc-500">Next Appt:</span>
                          <span className="text-zinc-300 font-mono text-right">{pat.nextAppointment.split(" ")[0]}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-900/50 pt-3">
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleEditPatientClick(pat, e)}
                          className="p-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-zinc-400 hover:text-white transition-colors"
                          title="Edit Patient"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleArchivePatient(pat.id, e)}
                          className="p-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-zinc-400 hover:text-white transition-colors"
                          title="Archive"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeletePatient(pat.id, e)}
                          className="p-1 rounded bg-zinc-900 border border-zinc-800 hover:border-red-900/50 hover:bg-red-950/20 text-zinc-500 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-xs text-emerald-400 flex items-center font-semibold">
                        Open Workspace <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-zinc-900/25 p-4 rounded-2xl border border-zinc-900/80 backdrop-blur-sm mt-4">
                <span className="text-xs text-zinc-400">
                  Showing <span className="font-semibold text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-white">{Math.min(currentPage * itemsPerPage, sortedPatients.length)}</span> of <span className="font-semibold text-white">{sortedPatients.length}</span> patients
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-xl bg-zinc-900/60 border border-zinc-850 hover:bg-zinc-850 disabled:opacity-40 text-zinc-300 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono text-zinc-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-xl bg-zinc-900/60 border border-zinc-850 hover:bg-zinc-850 disabled:opacity-40 text-zinc-300 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* ======================================================
             PATIENT WORKSPACE VIEW (FULL DETAIL SCREEN)
             ====================================================== */
          <motion.div
            key="workspace"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Navigation back and header bar info */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => router.push('/patients')}
                className="self-start inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800/80 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Patient List
              </button>

              {/* Master Patient Header */}
              <div className="p-6 rounded-2xl border border-zinc-900 bg-gradient-to-br from-zinc-900/40 via-zinc-950/80 to-zinc-900/20 backdrop-blur-md space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  
                  {/* Left profile info */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    <Image
                      src={activePatient.photoUrl}
                      alt={activePatient.name}
                      width={80}
                      height={80}
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl border-2 border-zinc-800 object-cover shadow-xl shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1.5 text-center sm:text-left">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{activePatient.name}</h2>
                        <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {activePatient.id}
                        </span>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] uppercase font-mono font-medium border ${
                          activePatient.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        }`}>
                          {activePatient.status}
                        </span>
                      </div>
                      
                      {/* Sub row info parameters */}
                      <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-zinc-400">
                        <span>Age: <strong className="text-zinc-200">{activePatient.age}</strong></span>
                        <span className="text-zinc-800">•</span>
                        <span>Gender: <strong className="text-zinc-200">{activePatient.gender}</strong></span>
                        <span className="text-zinc-800">•</span>
                        <span>Blood Group: <strong className="text-zinc-200">{activePatient.bloodGroup}</strong></span>
                        <span className="text-zinc-800">•</span>
                        <span>Operator: <strong className="text-emerald-400 font-mono">{activePatient.primaryDoctor}</strong></span>
                      </div>

                      {/* Phone & email parameters */}
                      <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-zinc-500">
                        <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {activePatient.phone}</span>
                        <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {activePatient.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right health risk warnings */}
                  <div className="flex flex-col gap-2.5 max-w-sm w-full lg:w-auto shrink-0 self-stretch justify-center p-4 bg-zinc-950/80 rounded-xl border border-zinc-900">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Medical Clearance Logs</span>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        activePatient.aiRiskFlag === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        AI Risk: {activePatient.aiRiskFlag}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <p className="text-pink-400 font-semibold">{activePatient.allergyStatus}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {activePatient.medicalAlerts.map((alert, idx) => (
                          <span key={idx} className="text-[9px] font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                            {alert}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Quick actions panel */}
                <div className="border-t border-zinc-900/60 pt-4 flex flex-wrap gap-2.5 items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Workspace Quick Actions:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setWorkspaceTab('appointments')}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <CalendarIcon className="w-3.5 h-3.5 text-emerald-400" /> New Appointment
                    </button>
                    <button
                      onClick={() => setWorkspaceTab('treatment')}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Clipboard className="w-3.5 h-3.5 text-purple-400" /> New Treatment Plan
                    </button>
                    <button
                      onClick={() => { setWorkspaceTab('notes'); applySoapTemplate('crown'); }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-400" /> Add Clinical Note
                    </button>
                    <button
                      onClick={() => { setWorkspaceTab('ai'); triggerAiCopilot("Summarize Patient Profile"); }}
                      className="px-3.5 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-purple-500/10"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Open AI Copilot
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Split layout: Left static metadata, Right operational tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT SIDEBAR PANEL (Col span 4) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Patient Summary & History */}
                <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/10 backdrop-blur-sm space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400" /> Clinical Baseline Profile
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-zinc-500 text-[10px] uppercase font-bold">Patient Summary</span>
                      <p className="text-zinc-300 leading-relaxed font-sans bg-zinc-950/40 p-3 rounded-xl border border-zinc-900">
                        {activePatient.summary}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-zinc-500 text-[10px] uppercase font-bold block">Medical Anamnesis</span>
                      <ul className="space-y-1 text-zinc-300 list-disc list-inside">
                        {activePatient.medicalHistory.map((hist, idx) => (
                          <li key={idx}>{hist}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-zinc-500 text-[10px] uppercase font-bold block">Active Pharmacotherapy</span>
                      <ul className="space-y-1 text-zinc-300">
                        {activePatient.medications.map((med, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 bg-zinc-950/30 p-1.5 rounded border border-zinc-900">
                            <Stethoscope className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span>{med}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-zinc-500 text-[10px] uppercase font-bold block">Critical Risk Factors</span>
                      <div className="p-3 bg-red-950/10 border border-red-500/15 rounded-xl flex items-start gap-2.5">
                        <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="text-red-400 font-semibold text-[11px]">Periodontal Biotype Alert</p>
                          <p className="text-[10px] text-zinc-400">{activePatient.riskDescription}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient Historical Timeline */}
                <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/10 backdrop-blur-sm space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-pink-400" /> Longitudinal Timeline
                  </h3>

                  <div className="space-y-4 relative pl-3.5 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
                    {activePatient.timeline.map((item, idx) => (
                      <div key={idx} className="relative space-y-1">
                        <span className="absolute -left-[19px] top-1.5 w-2 h-2 rounded-full bg-zinc-700 border-2 border-zinc-950" />
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                          <span>{item.date}</span>
                          <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium">{item.category}</span>
                        </div>
                        <h4 className="text-xs font-semibold text-white leading-tight">{item.title}</h4>
                        <p className="text-[10px] text-zinc-400 leading-normal">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* RIGHT TABS WORKSPACE PANEL (Col span 8) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Horizontal tabs navigation scroller */}
                <div className="overflow-x-auto pb-1 flex border-b border-zinc-900 scrollbar-none gap-1.5">
                  {[
                    { id: 'overview', label: 'Overview', icon: Grid },
                    { id: 'history', label: 'Clinical History', icon: Heart },
                    { id: 'cases', label: 'Clinical Cases', icon: Briefcase },
                    { id: 'timeline', label: 'Timeline', icon: Activity },
                    { id: 'appointments', label: 'Appointments', icon: CalendarIcon },
                    { id: 'treatment', label: 'Treatment Plans', icon: Clipboard },
                    { id: 'dental-chart', label: 'Dental Chart', icon: Activity },
                    { id: 'prosthodontics', label: 'Prosthodontics', icon: Stethoscope },
                    { id: 'implants', label: 'Implants', icon: Heart },
                    { id: 'laboratory', label: 'Laboratory', icon: FlaskConical },
                    { id: 'imaging', label: 'Imaging', icon: Layers },
                    { id: 'notes', label: 'Clinical Notes', icon: FileText },
                    { id: 'files', label: 'Files', icon: HardDrive },
                    { id: 'billing', label: 'Billing & Ledger', icon: DollarSign },
                    { id: 'ai', label: 'AI Copilot', icon: Sparkles },
                  ].map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setWorkspaceTab(tab.id as any)}
                        className={`px-3.5 py-2.5 rounded-t-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 border-b-2 ${
                          workspaceTab === tab.id
                            ? 'bg-zinc-900/60 text-emerald-400 border-emerald-500'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/20 border-transparent'
                        }`}
                      >
                        <IconComponent className="w-4 h-4 shrink-0" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab content body with framer-motion container */}
                <div className="min-h-[480px]">
                  <AnimatePresence mode="wait">
                    
                    {/* OVERVIEW TAB */}
                    {workspaceTab === 'overview' && (
                      <motion.div
                        key="tab-overview"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                      >
                        
                        {/* RECALL & CLINICAL FOLLOW-UP ENGINE */}
                        <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/25 sm:col-span-2 space-y-4 text-left">
                          <div className="flex justify-between items-center border-b border-zinc-900/60 pb-3">
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Clinical Maintenance Hub</span>
                              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Clock className="w-4 h-4 text-emerald-400" /> Patient Recall & Follow-up Scheduler
                              </h3>
                            </div>
                            
                            {!isEditingRecall ? (
                              <button
                                onClick={() => setIsEditingRecall(true)}
                                className="px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 border border-zinc-800 transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-emerald-400" /> Adjust Maintenance Plan
                              </button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setIsEditingRecall(false)}
                                  className="px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-900 text-zinc-400 text-xs font-semibold border border-zinc-900 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleSaveRecall}
                                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-500/10"
                                >
                                  Apply Schedule
                                </button>
                              </div>
                            )}
                          </div>

                          {!isEditingRecall ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {/* Recall Interval Display */}
                              <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-900/60 flex flex-col justify-between">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Recall Interval</span>
                                <div className="space-y-1">
                                  <span className="text-sm font-bold text-white block">{recallInterval}</span>
                                  <p className="text-[10px] text-zinc-400 leading-normal">
                                    {recallInterval.includes('3') && "High frequency active implant integration & tissue monitoring."}
                                    {recallInterval.includes('4') && "Post-prosthetic function tuning & periodontal hygiene."}
                                    {recallInterval.includes('6') && "Standard preventive dental checkup & occlusal balancing."}
                                    {recallInterval.includes('12') && "Long-term restorative wear & aesthetic profile check."}
                                  </p>
                                </div>
                              </div>

                              {/* Next Visit Date */}
                              <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-900/60 flex flex-col justify-between">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Target Next Visit</span>
                                <div className="space-y-1">
                                  <span className="text-sm font-bold text-emerald-400 font-mono block">
                                    {recallNextVisit || 'Not scheduled'}
                                  </span>
                                  <p className="text-[10px] text-zinc-400 leading-normal">
                                    Coordinated automatically with local in-house laboratory schedules.
                                  </p>
                                </div>
                              </div>

                              {/* Follow-up Status */}
                              <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-900/60 flex flex-col justify-between">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Follow-up Status</span>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${
                                      recallFollowupStatus === 'Scheduled' ? 'bg-blue-400 animate-pulse' :
                                      recallFollowupStatus === 'Completed' ? 'bg-emerald-400' :
                                      recallFollowupStatus === 'Overdue' ? 'bg-red-400' :
                                      'bg-amber-400'
                                    }`} />
                                    <span className="text-sm font-bold text-white">{recallFollowupStatus}</span>
                                  </div>
                                  <p className="text-[10px] text-zinc-400 leading-normal">
                                    {recallFollowupStatus === 'Scheduled' && "Active appointment booked in central clinical schedule."}
                                    {recallFollowupStatus === 'Completed' && "Maintenance procedure logged and clinical goals fulfilled."}
                                    {recallFollowupStatus === 'Overdue' && "Immediate outreach suggested; patient is past maintenance window."}
                                    {recallFollowupStatus === 'Pending Coordination' && "Requires coordination for active 3D prosthetic updates."}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-left">
                              {/* Interval Edit */}
                              <div className="space-y-1">
                                <label className="text-zinc-400 font-semibold block">Select Recall Interval</label>
                                <select
                                  value={recallInterval}
                                  onChange={(e) => setRecallInterval(e.target.value)}
                                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-300 focus:outline-none focus:border-emerald-500/50"
                                >
                                  <option value="3 Months">3 Months (Active Implant Monitoring)</option>
                                  <option value="4 Months">4 Months (Periodontal Support)</option>
                                  <option value="6 Months">6 Months (Standard Prosthetic Check)</option>
                                  <option value="12 Months">12 Months (Long-term Monitoring)</option>
                                </select>
                              </div>

                              {/* Date Edit */}
                              <div className="space-y-1">
                                <label className="text-zinc-400 font-semibold block">Select Target Date</label>
                                <input
                                  type="date"
                                  value={recallNextVisit}
                                  onChange={(e) => setRecallNextVisit(e.target.value)}
                                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-300 focus:outline-none focus:border-emerald-500/50 font-mono"
                                />
                              </div>

                              {/* Status Edit */}
                              <div className="space-y-1">
                                <label className="text-zinc-400 font-semibold block">Follow-up Status</label>
                                <select
                                  value={recallFollowupStatus}
                                  onChange={(e) => setRecallFollowupStatus(e.target.value)}
                                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-300 focus:outline-none focus:border-emerald-500/50"
                                >
                                  <option value="Scheduled">Scheduled</option>
                                  <option value="Pending Coordination">Pending Coordination</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Overdue">Overdue</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Clinical Demographics & Baseline Profile */}
                        <div id="demographics-diagnostics-card" className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/25 sm:col-span-2 space-y-4 text-left">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Demographics & Vital Diagnostics</span>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Column 1: Core Demographics */}
                            <div className="space-y-3.5 border-r border-zinc-900/60 pr-4">
                              <div>
                                <span className="text-[10px] text-zinc-500 block">Full Name</span>
                                <h4 className="text-sm font-bold text-white">{activePatient.name}</h4>
                              </div>
                              <div>
                                <span className="text-[10px] text-zinc-500 block">Patient ID</span>
                                <span className="text-xs font-mono text-zinc-300">{activePatient.id}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="text-[10px] text-zinc-500 block">Age</span>
                                  <span className="text-xs text-zinc-300 font-medium">{activePatient.age} Yrs</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-zinc-500 block">Gender</span>
                                  <span className="text-xs text-zinc-300 font-medium">{activePatient.gender}</span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] text-zinc-500 block">Contact Info</span>
                                <div className="space-y-1">
                                  <p className="text-xs text-zinc-300 flex items-center gap-1.5 font-mono">
                                    <Phone className="w-3.5 h-3.5 text-zinc-500" /> {activePatient.phone}
                                  </p>
                                  <p className="text-xs text-zinc-300 flex items-center gap-1.5 font-mono truncate">
                                    <Mail className="w-3.5 h-3.5 text-zinc-500" /> {activePatient.email}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Column 2: Clinical Parameters & Schedule */}
                            <div className="space-y-3.5 border-r border-zinc-900/60 pr-4">
                              <div>
                                <span className="text-[10px] text-zinc-500 block">Overall Patient Status</span>
                                <span className={`inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded border mt-1 ${
                                  activePatient.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  activePatient.status === 'Under Treatment' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' :
                                  'bg-zinc-950 text-zinc-400 border-zinc-800'
                                }`}>
                                  {activePatient.status}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-zinc-500 block">Active Treatment Course</span>
                                <p className="text-xs text-emerald-400 font-bold mt-1">{activePatient.currentTreatment}</p>
                              </div>
                              <div>
                                <span className="text-[10px] text-zinc-500 block">Last Visit Date</span>
                                <span className="text-xs text-zinc-300 font-mono font-semibold">{activePatient.lastVisit || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-zinc-500 block">Next Appointment Schedule</span>
                                <span className="text-xs text-zinc-300 font-mono font-semibold">{activePatient.nextAppointment || 'None'}</span>
                              </div>
                            </div>

                            {/* Column 3: Medical Alerts & Risks */}
                            <div className="space-y-3.5">
                              <div>
                                <span className="text-[10px] text-zinc-500 block mb-1">Critical Medical Alerts</span>
                                <div className="flex flex-wrap gap-1">
                                  {activePatient.medicalAlerts && activePatient.medicalAlerts.length > 0 ? (
                                    activePatient.medicalAlerts.map((alert, idx) => (
                                      <span key={idx} className="text-[9px] font-mono px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded">
                                        ⚠️ {alert}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[10px] text-emerald-400 italic font-mono">No contraindications reported</span>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <span className="text-[10px] text-zinc-500 block mb-1">Clinical Risk Indicator</span>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${
                                      activePatient.aiRiskFlag === 'High' ? 'bg-red-500' :
                                      activePatient.aiRiskFlag === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`} />
                                    <span className="text-xs font-mono font-bold text-white uppercase">{activePatient.aiRiskFlag} Risk</span>
                                  </div>
                                  <p className="text-[10px] text-zinc-400 leading-normal italic">
                                    "{activePatient.riskDescription}"
                                  </p>
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>

                        {/* Upcoming appointment */}
                        <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/20 space-y-3">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Next Dental Procedure</span>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1.5">
                              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                                <CalendarIcon className="w-4 h-4 text-emerald-400" /> Crown Preparation
                              </h4>
                              <p className="text-xs text-zinc-400">Teeth #11, #12, #21 (Vita OM1 shade selection)</p>
                              <span className="text-[11px] font-mono text-zinc-300 block">{activePatient.nextAppointment}</span>
                            </div>
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                              Scheduled
                            </span>
                          </div>
                        </div>

                        {/* Active treatment */}
                        <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/20 space-y-3">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Primary Active Case</span>
                          <div className="space-y-1.5">
                            <h4 className="text-sm font-bold text-emerald-400">{activePatient.currentTreatment}</h4>
                            <p className="text-xs text-zinc-400">Stage 2 of 4: Preparations & Temporary Restorations.</p>
                            <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-900/80">
                              <div className="bg-emerald-500 h-full w-[45%]" />
                            </div>
                            <span className="text-[10px] text-zinc-500 font-mono block text-right">45% Course Complete</span>
                          </div>
                        </div>

                        {/* Lab work summary */}
                        <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/20 space-y-3">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">CAD/CAM In-House Milling & Printing</span>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center bg-zinc-950/40 p-2 rounded-lg border border-zinc-900">
                              <span className="text-zinc-400 font-medium">3Shape Case Order:</span>
                              <span className="font-mono text-[10px] text-amber-400">Milling Queue (Zirconia)</span>
                            </div>
                            <div className="flex justify-between items-center bg-zinc-950/40 p-2 rounded-lg border border-zinc-900">
                              <span className="text-zinc-400 font-medium">SprintRay Temp Template:</span>
                              <span className="font-mono text-[10px] text-emerald-400">Completed (Printing Queue)</span>
                            </div>
                          </div>
                        </div>

                        {/* Imaging summary */}
                        <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/20 space-y-3">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Active Radiographs & Digital Articulations</span>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center bg-zinc-950/40 p-2 rounded-lg border border-zinc-900">
                              <span className="text-zinc-400">Maxillary/Mandibular CBCT:</span>
                              <span className="text-emerald-400 font-mono text-[10px]">DICOM Rendered</span>
                            </div>
                            <div className="flex justify-between items-center bg-zinc-950/40 p-2 rounded-lg border border-zinc-900">
                              <span className="text-zinc-400">Digital Impression Scans:</span>
                              <span className="text-emerald-400 font-mono text-[10px]">2 STL Files Merged</span>
                            </div>
                          </div>
                        </div>

                        {/* Financial Ledger balance */}
                        <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/20 sm:col-span-2 space-y-3">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Financial Status & Insurance Coverage</span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-900">
                              <p className="text-[10px] text-zinc-500">Case Total Estimate</p>
                              <p className="text-base font-bold text-white font-mono">$18,450.00</p>
                            </div>
                            <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-900">
                              <p className="text-[10px] text-zinc-500">Insurance Approvals (Cigna)</p>
                              <p className="text-base font-bold text-purple-400 font-mono">$11,200.00</p>
                            </div>
                            <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-900">
                              <p className="text-[10px] text-zinc-500">Outstanding Balance</p>
                              <p className="text-base font-bold text-amber-400 font-mono">$7,250.00</p>
                            </div>
                          </div>
                        </div>

                        {/* Clinical notes brief preview */}
                        <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/20 sm:col-span-2 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Latest Clinical SOAP Note Log</span>
                            <button
                              onClick={() => setWorkspaceTab('notes')}
                              className="text-[11px] text-emerald-400 font-semibold"
                            >
                              Add New SOAP Note
                            </button>
                          </div>
                          <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-900 space-y-1.5">
                            <div className="flex justify-between text-[11px] text-zinc-500">
                              <span className="font-bold text-zinc-300">Dr. Ahmed</span>
                              <span>Jul 10, 2026</span>
                            </div>
                            <p className="text-xs text-zinc-400 italic">
                              "Subgingival margin parameters finalized at 0.5mm depth to preserve local soft tissue and minimize marginal retraction. Sintered translucent zirconia specified for maximum bridge longevity..."
                            </p>
                          </div>
                        </div>

                      </motion.div>
                    )}

                    {/* CLINICAL HISTORY TAB */}
                    {workspaceTab === 'history' && (
                      <motion.div
                        key="tab-clinical-history"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-6"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-900/25 p-4 rounded-xl border border-zinc-900 gap-3">
                          <div>
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                              <Heart className="w-4 h-4 text-pink-400" /> Complete Clinical Anamnesis
                            </h3>
                            <p className="text-xs text-zinc-400">Structured Medical and Dental historical record synced securely with the patient's electronic health record.</p>
                          </div>
                          <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end">
                            {supabaseLoading && (
                              <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                                Synchronizing...
                              </div>
                            )}
                            {!supabaseLoading && supabaseStatus === 'success' && (
                              <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/10">
                                DB Synced
                              </div>
                            )}
                            {!isEditingHistory ? (
                              <button
                                onClick={() => setIsEditingHistory(true)}
                                className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 border border-zinc-800"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-emerald-400" /> Edit Record
                              </button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setIsEditingHistory(false)}
                                  className="px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-900 text-zinc-400 text-xs font-semibold border border-zinc-900"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleSaveHistory}
                                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1"
                                >
                                  Save changes
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* MEDICAL HISTORY SECTION */}
                          <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/10 backdrop-blur-sm space-y-4">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center gap-2">
                              <Activity className="w-4 h-4 text-emerald-400" /> Medical History & Systems Review
                            </h3>

                            {isEditingHistory ? (
                              <div className="space-y-4 text-xs">
                                <div className="space-y-1">
                                  <label className="text-zinc-400 font-semibold">Medical Conditions</label>
                                  <textarea
                                    value={medicalConditions}
                                    onChange={(e) => setMedicalConditions(e.target.value)}
                                    placeholder="e.g. Type II Diabetes, Hypertension, Asthma"
                                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-300 focus:outline-none focus:border-emerald-500/50 min-h-[60px]"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-zinc-400 font-semibold">Current Medications</label>
                                  <textarea
                                    value={medHistoryMedications}
                                    onChange={(e) => setMedHistoryMedications(e.target.value)}
                                    placeholder="e.g. Metformin 500mg BID, Lisinopril 10mg QD"
                                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-300 focus:outline-none focus:border-emerald-500/50 min-h-[60px]"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-zinc-400 font-semibold">Allergies & Sensitivities</label>
                                  <textarea
                                    value={medicalAllergies}
                                    onChange={(e) => setMedicalAllergies(e.target.value)}
                                    placeholder="e.g. Penicillin, Latex, NSAIDs"
                                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-300 focus:outline-none focus:border-emerald-500/50 min-h-[60px]"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-zinc-400 font-semibold">Blood Pressure</label>
                                    <input
                                      type="text"
                                      value={bloodPressure}
                                      onChange={(e) => setBloodPressure(e.target.value)}
                                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-300 focus:outline-none focus:border-emerald-500/50"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-zinc-400 font-semibold">Diabetes Status</label>
                                    <input
                                      type="text"
                                      value={diabetes}
                                      onChange={(e) => setDiabetes(e.target.value)}
                                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-300 focus:outline-none focus:border-emerald-500/50"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-zinc-400 font-semibold">Cardiac History</label>
                                    <input
                                      type="text"
                                      value={cardiacHistory}
                                      onChange={(e) => setCardiacHistory(e.target.value)}
                                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-300 focus:outline-none focus:border-emerald-500/50"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-zinc-400 font-semibold">Pregnancy</label>
                                    <select
                                      value={pregnancy}
                                      onChange={(e) => setPregnancy(e.target.value)}
                                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-300 focus:outline-none"
                                    >
                                      <option value="Not pregnant">Not pregnant</option>
                                      <option value="Pregnant (1st Trimester)">Pregnant (1st Trimester)</option>
                                      <option value="Pregnant (2nd Trimester)">Pregnant (2nd Trimester)</option>
                                      <option value="Pregnant (3rd Trimester)">Pregnant (3rd Trimester)</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-zinc-400 font-semibold">Smoking Status</label>
                                  <select
                                    value={smokingStatus}
                                    onChange={(e) => setSmokingStatus(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-300 focus:outline-none"
                                  >
                                    <option value="Non-smoker">Non-smoker</option>
                                    <option value="Former smoker">Former smoker</option>
                                    <option value="Light smoker (<10/day)">Light smoker (&lt;10/day)</option>
                                    <option value="Heavy smoker (>10/day)">Heavy smoker (&gt;10/day)</option>
                                    <option value="Vapes/E-Cigarettes">Vapes/E-Cigarettes</option>
                                  </select>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-zinc-400 font-semibold">Anamnesis Narrative Notes</label>
                                  <textarea
                                    value={medicalHistoryNotes}
                                    onChange={(e) => setMedicalHistoryNotes(e.target.value)}
                                    placeholder="Enter additional system reviews, clinical notes, etc."
                                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-300 focus:outline-none focus:border-emerald-500/50 min-h-[60px]"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4 text-xs">
                                <div className="grid grid-cols-1 gap-3.5">
                                  <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-900/60">
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Diagnosed Systemic Pathologies</span>
                                    <p className="text-white font-medium">{medicalConditions || 'No systemic conditions declared.'}</p>
                                  </div>

                                  <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-900/60">
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Active Pharmacotherapy</span>
                                    <p className="text-white font-medium">{medHistoryMedications || 'No current therapeutic drugs.'}</p>
                                  </div>

                                  <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-900/60">
                                    <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider block mb-1">Allergies & Sensitivities</span>
                                    <p className="text-pink-300 font-semibold">{medicalAllergies || 'No known allergies (NKDA).'}</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-900/60">
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">Blood Pressure</span>
                                    <span className="text-white font-mono font-bold text-sm">{bloodPressure}</span>
                                  </div>
                                  <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-900/60">
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">Diabetes Status</span>
                                    <span className="text-emerald-400 font-medium">{diabetes}</span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2.5">
                                  <div className="bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900/60 text-center">
                                    <span className="text-[9px] text-zinc-500 uppercase font-bold block mb-0.5">Cardiac</span>
                                    <span className="text-white font-semibold text-[11px]">{cardiacHistory}</span>
                                  </div>
                                  <div className="bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900/60 text-center">
                                    <span className="text-[9px] text-zinc-500 uppercase font-bold block mb-0.5">Pregnancy</span>
                                    <span className="text-white font-semibold text-[11px]">{pregnancy}</span>
                                  </div>
                                  <div className="bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900/60 text-center">
                                    <span className="text-[9px] text-zinc-500 uppercase font-bold block mb-0.5">Tobacco</span>
                                    <span className="text-white font-semibold text-[11px]">{smokingStatus}</span>
                                  </div>
                                </div>

                                <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-900/60">
                                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Clinical Intake Annotations</span>
                                  <p className="text-zinc-400 leading-relaxed italic">"{medicalHistoryNotes || 'None'}"</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* DENTAL HISTORY SECTION */}
                          <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/10 backdrop-blur-sm space-y-4">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center gap-2">
                              <Stethoscope className="w-4 h-4 text-purple-400" /> Comprehensive Dental History
                            </h3>

                            {isEditingHistory ? (
                              <div className="space-y-4 text-xs">
                                <div className="space-y-1">
                                  <label className="text-zinc-400 font-semibold">Chief Complaint</label>
                                  <textarea
                                    value={chiefComplaint}
                                    onChange={(e) => setChiefComplaint(e.target.value)}
                                    placeholder="Patient's primary request or symptom..."
                                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-300 focus:outline-none focus:border-emerald-500/50 min-h-[50px]"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-zinc-400 font-semibold">Previous Dental Treatments</label>
                                  <textarea
                                    value={prevDentalTreatment}
                                    onChange={(e) => setPrevDentalTreatment(e.target.value)}
                                    placeholder="e.g. Routine fillings, orthodontic bands..."
                                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-300 focus:outline-none focus:border-emerald-500/50 min-h-[50px]"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-zinc-400 font-semibold">Previous Prosthodontics</label>
                                  <textarea
                                    value={prevProsthodonticTreatment}
                                    onChange={(e) => setPrevProsthodonticTreatment(e.target.value)}
                                    placeholder="e.g. Fixed partial dentures, acrylic plates..."
                                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-300 focus:outline-none focus:border-emerald-500/50 min-h-[50px]"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-zinc-400 font-semibold">Implant & Surgical History</label>
                                  <textarea
                                    value={implantHistory}
                                    onChange={(e) => setImplantHistory(e.target.value)}
                                    placeholder="e.g. Bone graft #36, post-extraction healing..."
                                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-300 focus:outline-none focus:border-emerald-500/50 min-h-[50px]"
                                  />
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-zinc-400 font-semibold block">Oral Hygiene</label>
                                    <select
                                      value={oralHygieneAssessment}
                                      onChange={(e) => setOralHygieneAssessment(e.target.value)}
                                      className="w-full p-2 rounded bg-zinc-950 border border-zinc-900 text-zinc-300 text-xs"
                                    >
                                      <option value="Excellent">Excellent</option>
                                      <option value="Good">Good</option>
                                      <option value="Fair">Fair</option>
                                      <option value="Poor">Poor</option>
                                    </select>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-zinc-400 font-semibold block">Caries Risk</label>
                                    <select
                                      value={cariesRisk}
                                      onChange={(e) => setCariesRisk(e.target.value)}
                                      className="w-full p-2 rounded bg-zinc-950 border border-zinc-900 text-zinc-300 text-xs"
                                    >
                                      <option value="Low">Low</option>
                                      <option value="Moderate">Moderate</option>
                                      <option value="High">High</option>
                                    </select>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-zinc-400 font-semibold block">Periodontal</label>
                                    <select
                                      value={periodontalStatus}
                                      onChange={(e) => setPeriodontalStatus(e.target.value)}
                                      className="w-full p-2 rounded bg-zinc-950 border border-zinc-900 text-zinc-300 text-xs"
                                    >
                                      <option value="Healthy">Healthy</option>
                                      <option value="Gingivitis">Gingivitis</option>
                                      <option value="Periodontitis Stage I">Stage I</option>
                                      <option value="Periodontitis Stage II">Stage II</option>
                                      <option value="Periodontitis Stage III">Stage III</option>
                                      <option value="Periodontitis Stage IV">Stage IV</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-zinc-400 font-semibold">Occlusion / Articulation Notes</label>
                                  <textarea
                                    value={occlusionNotes}
                                    onChange={(e) => setOcclusionNotes(e.target.value)}
                                    placeholder="e.g. Class I occlusion, canine guidance, wear facets..."
                                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-300 focus:outline-none focus:border-emerald-500/50 min-h-[50px]"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4 text-xs">
                                <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-900/60">
                                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Chief Complaint (C/O)</span>
                                  <p className="text-white leading-relaxed font-sans">"{chiefComplaint || 'No active complaints registered.'}"</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3.5">
                                  <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-900/60">
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Prev Dental Treatment</span>
                                    <p className="text-zinc-300 leading-normal">{prevDentalTreatment || 'None reported'}</p>
                                  </div>
                                  <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-900/60">
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Prev Prosthodontics</span>
                                    <p className="text-zinc-300 leading-normal">{prevProsthodonticTreatment || 'None reported'}</p>
                                  </div>
                                </div>

                                <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-900/60">
                                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Osteotomy & Implant History</span>
                                  <p className="text-zinc-300 leading-normal">{implantHistory || 'No implant interventions.'}</p>
                                </div>

                                <div className="grid grid-cols-3 gap-2.5">
                                  <div className="bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900/60 text-center">
                                    <span className="text-[9px] text-zinc-500 uppercase font-bold block mb-0.5">Oral Hygiene</span>
                                    <span className="text-emerald-400 font-semibold text-[11px]">{oralHygieneAssessment}</span>
                                  </div>
                                  <div className="bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900/60 text-center">
                                    <span className="text-[9px] text-zinc-500 uppercase font-bold block mb-0.5">Caries Risk</span>
                                    <span className={`font-semibold text-[11px] ${
                                      cariesRisk === 'High' ? 'text-red-400' : cariesRisk === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'
                                    }`}>{cariesRisk}</span>
                                  </div>
                                  <div className="bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900/60 text-center">
                                    <span className="text-[9px] text-zinc-500 uppercase font-bold block mb-0.5">Periodontal</span>
                                    <span className="text-purple-300 font-semibold text-[11px]">{periodontalStatus}</span>
                                  </div>
                                </div>

                                <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-900/60">
                                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Functional Articulation & Occlusion</span>
                                  <p className="text-zinc-400 leading-relaxed italic">"{occlusionNotes || 'No wear facets or articulative defects reported.'}"</p>
                                </div>
                              </div>
                            )}
                          </div>

                        </div>
                      </motion.div>
                    )}

                    {/* CLINICAL CASES TAB */}
                    {workspaceTab === 'cases' && (
                      <motion.div
                        key="tab-cases"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-6"
                      >
                        {/* Header controls with Search & Filter inside the active patient's workspace */}
                        <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/15 backdrop-blur-md space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900/80 pb-3">
                            <div>
                              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                                <Briefcase className="w-4.5 h-4.5 text-emerald-400" /> Active Clinical & Prosthodontic Cases
                              </h3>
                              <p className="text-xs text-zinc-400">Track 3D digital impressions, Exocad alignments, in-house laboratory sintering, and patient trial restoration stages.</p>
                            </div>
                            <button
                              onClick={() => {
                                setEditingCase(null);
                                setCaseForm({
                                  name: '',
                                  status: 'In Design',
                                  priority: 'Standard',
                                  clinician: 'Dr. Ahmed',
                                  stage: 'STL Alignment',
                                  progress: 10,
                                  notes: '',
                                  dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]
                                });
                                setIsCaseModalOpen(true);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/10"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Launch Clinical Case
                            </button>
                          </div>

                          {/* Searching and filtering cases */}
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                            <div className="relative sm:col-span-6">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                              <input
                                type="text"
                                value={caseSearchQuery}
                                onChange={(e) => setCaseSearchQuery(e.target.value)}
                                placeholder="Search active prosthesis, implant cases, notes..."
                                className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <select
                                value={caseStatusFilter}
                                onChange={(e) => setCaseStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-400 focus:outline-none focus:text-white"
                              >
                                <option value="All">All Statuses</option>
                                <option value="In Design">In Design</option>
                                <option value="Milling">Milling</option>
                                <option value="Sintering">Sintering</option>
                                <option value="Finished">Finished</option>
                                <option value="Delivered">Delivered</option>
                                <option value="On Hold">On Hold</option>
                              </select>
                            </div>
                            <div className="sm:col-span-3">
                              <select
                                value={casePriorityFilter}
                                onChange={(e) => setCasePriorityFilter(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-400 focus:outline-none focus:text-white"
                              >
                                <option value="All">All Priorities</option>
                                <option value="Standard">Standard</option>
                                <option value="Urgent">Urgent</option>
                                <option value="Low">Low</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Cases list */}
                        <div className="space-y-4">
                          {!activePatient.cases || activePatient.cases.length === 0 ? (
                            <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-850 bg-zinc-900/5 space-y-3">
                              <Briefcase className="w-8 h-8 text-zinc-600 mx-auto" />
                              <div className="space-y-1">
                                <h4 className="text-xs font-bold text-zinc-400">No Active Clinical Cases</h4>
                                <p className="text-[10px] text-zinc-500 max-w-xs mx-auto">Click "Launch Clinical Case" to construct high-fidelity digital files, orders, or restoration plans.</p>
                              </div>
                            </div>
                          ) : (
                            (activePatient.cases || [])
                              .filter(c => {
                                const matchesSearch = c.name.toLowerCase().includes(caseSearchQuery.toLowerCase()) || 
                                                     (c.notes || '').toLowerCase().includes(caseSearchQuery.toLowerCase());
                                const matchesStatus = caseStatusFilter === 'All' || c.status === caseStatusFilter;
                                const matchesPriority = casePriorityFilter === 'All' || c.priority === casePriorityFilter;
                                return matchesSearch && matchesStatus && matchesPriority;
                              })
                              .map((item) => (
                                <div key={item.id} className="p-5 rounded-2xl border border-zinc-900 bg-zinc-950/60 hover:border-zinc-800 transition-all space-y-4 text-left">
                                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-sm font-bold text-white leading-tight">{item.name}</h4>
                                        <span className="text-[9px] font-mono text-zinc-500">{item.id}</span>
                                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] uppercase font-mono font-medium border ${
                                          item.priority === 'Urgent'
                                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                            : item.priority === 'Low'
                                              ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                          {item.priority}
                                        </span>
                                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] uppercase font-mono font-medium border ${
                                          item.status === 'Finished' || item.status === 'Delivered'
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : item.status === 'Milling' || item.status === 'Sintering'
                                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                              : item.status === 'On Hold'
                                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                          {item.status}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-zinc-500 font-mono">
                                        Created: {item.createdDate} • Target Completion: {item.dueDate}
                                      </p>
                                    </div>

                                    {/* Action items */}
                                    <div className="flex items-center gap-1.5 self-end sm:self-start">
                                      <button
                                        onClick={() => handleEditCaseClick(item)}
                                        className="p-1.5 rounded bg-zinc-900 border border-zinc-855 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-300 transition-colors"
                                        title="Edit Case Details"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteCase(item.id)}
                                        className="p-1.5 rounded bg-zinc-900 border border-zinc-855 hover:border-red-950 hover:bg-red-950/20 text-zinc-400 hover:text-red-400 transition-colors"
                                        title="Delete Case"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Case Progress and stage indicator */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border-t border-zinc-900/60 pt-3 text-xs">
                                    <div className="space-y-1.5">
                                      <div className="flex justify-between items-center text-[11px] text-zinc-400 font-mono">
                                        <span>Restoration Stage: <strong className="text-white font-sans">{item.stage}</strong></span>
                                        <span>{item.progress}%</span>
                                      </div>
                                      <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-850">
                                        <div
                                          className={`h-full transition-all duration-550 ${
                                            item.progress >= 100 
                                              ? 'bg-emerald-500' 
                                              : item.progress > 40 
                                                ? 'bg-purple-500' 
                                                : 'bg-amber-500'
                                          }`}
                                          style={{ width: `${item.progress}%` }}
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-1 font-mono text-[11px] text-zinc-400 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900/60">
                                      <span className="text-zinc-500 uppercase tracking-wider text-[9px] font-bold block">Assigned Clinician:</span>
                                      <span className="text-zinc-200">{item.clinician}</span>
                                    </div>
                                  </div>

                                  {item.notes && (
                                    <div className="text-xs text-zinc-400 leading-relaxed font-sans bg-zinc-900/20 p-3 rounded-xl border border-zinc-900/40">
                                      <strong className="text-zinc-300 block mb-0.5 text-[11px]">SOAP Clinical / Design Notes:</strong>
                                      {item.notes}
                                    </div>
                                  )}
                                </div>
                              ))
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* TIMELINE TAB */}
                    {workspaceTab === 'timeline' && (
                      <PatientTimeline
                        activePatient={activePatient}
                        treatmentPlans={treatmentPlans}
                        clinicalNotesList={clinicalNotesList}
                        imagingGallery={imagingGallery}
                        patientDocuments={patientDocuments}
                      />
                    )}

                    {/* APPOINTMENTS TAB */}
                    {workspaceTab === 'appointments' && (
                      <motion.div
                        key="tab-appointments"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                      >
                        <div className="flex justify-between items-center bg-zinc-900/25 p-3.5 rounded-xl border border-zinc-900">
                          <p className="text-xs text-zinc-400">Interactive scheduling and logs of clinical prosthodontic visits.</p>
                          <button className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-bold flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5" /> Book Appointment
                          </button>
                        </div>

                        <div className="space-y-3">
                          {[
                            { date: "Jul 18, 2026 • 09:00 AM", procedure: "Crown Preparation", status: "Upcoming", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", desc: "Preparations on teeth 11, 12, 21. Temporization with Luxatemp." },
                            { date: "Jul 25, 2026 • 10:15 AM", procedure: "Veneer Delivery", status: "Scheduled", color: "bg-zinc-800 text-zinc-400 border-zinc-700", desc: "Delivery and bonding of 6 units premium E.Max laminates." },
                            { date: "Aug 02, 2026 • 11:30 AM", procedure: "Implant Consultation", status: "Scheduled", color: "bg-zinc-800 text-zinc-400 border-zinc-700", desc: "Planning session for osteotomy sites using surgical guided template." },
                            { date: "Aug 10, 2026 • 01:00 PM", procedure: "Digital Smile Design", status: "Awaiting Intake", color: "bg-zinc-800 text-zinc-400 border-zinc-700", desc: "Full portrait evaluation and mock-up parameter mapping." },
                            { date: "Aug 18, 2026 • 02:30 PM", procedure: "Complete Denture Try-in", status: "Awaiting Lab", color: "bg-purple-500/10 text-purple-300 border-purple-500/20", desc: "Aesthetic wax try-in and registration of occlusion." },
                            { date: "Sep 01, 2026 • 04:00 PM", procedure: "Scaling & Maintenance", status: "Recall", color: "bg-zinc-800 text-zinc-400 border-zinc-700", desc: "Three-month periodontal hygiene recall and occlusion adjustment check." }
                          ].map((appt, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-zinc-900/20 border border-zinc-900 flex flex-col sm:flex-row justify-between gap-3 hover:border-zinc-800 transition-colors">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono font-bold text-zinc-500">{appt.date}</span>
                                  <span className={`text-[8px] px-2 py-0.5 rounded uppercase font-mono border ${appt.color}`}>
                                    {appt.status}
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-white">{appt.procedure}</h4>
                                <p className="text-xs text-zinc-400 leading-normal">{appt.desc}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                <button className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-white">
                                  Edit Reschedule
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* TREATMENT PLANS TAB */}
                    {workspaceTab === 'treatment' && (
                      <motion.div
                        key="tab-treatment"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-6"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-900/25 p-4 rounded-xl border border-zinc-900 gap-3">
                          <div>
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                              <Clipboard className="w-4 h-4 text-purple-400" /> Dynamic Treatment Planner
                            </h3>
                            <p className="text-xs text-zinc-400">Establish multi-phase clinical courses with estimated cost breakdowns and milestones.</p>
                          </div>
                          <button
                            onClick={() => {
                              setEditingTxPlan(null);
                              setTxPlanForm({
                                title: '',
                                description: '',
                                estimatedCost: 0,
                                status: 'Draft',
                                progress: 0,
                                phasesText: "Phase 1: Diagnostic Modeling\nPhase 2: Preparations & Temporization\nPhase 3: Laboratory Execution\nPhase 4: Sintering & Delivery"
                              });
                              setIsTxPlanModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1 self-stretch sm:self-auto justify-center"
                          >
                            <Plus className="w-3.5 h-3.5" /> Create Plan
                          </button>
                        </div>

                        {/* PLAN CREATION / EDITING FORM CONDITIONAL */}
                        {isTxPlanModalOpen && (
                          <div className="p-5 rounded-2xl border border-emerald-500/20 bg-zinc-950/90 space-y-4">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-zinc-900 pb-2">
                              {editingTxPlan ? "Modify Treatment Plan parameters" : "Initialize New Treatment Plan Course"}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                              <div className="space-y-1">
                                <label className="text-zinc-400 font-semibold">Plan Title</label>
                                <input
                                  type="text"
                                  value={txPlanForm.title}
                                  onChange={(e) => setTxPlanForm({ ...txPlanForm, title: e.target.value })}
                                  placeholder="e.g. Anterior E.Max Laminate Veneers"
                                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-emerald-500/50"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-zinc-400 font-semibold">Estimated Case Fee ($)</label>
                                <input
                                  type="number"
                                  value={txPlanForm.estimatedCost}
                                  onChange={(e) => setTxPlanForm({ ...txPlanForm, estimatedCost: parseInt(e.target.value) || 0 })}
                                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-emerald-500/50 font-mono"
                                />
                              </div>
                              <div className="space-y-1 sm:col-span-2">
                                <label className="text-zinc-400 font-semibold">Clinical Description</label>
                                <textarea
                                  value={txPlanForm.description}
                                  onChange={(e) => setTxPlanForm({ ...txPlanForm, description: e.target.value })}
                                  placeholder="Describe the therapeutic objectives and parameters..."
                                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-emerald-500/50 min-h-[50px]"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-zinc-400 font-semibold">Milestone Progress (%)</label>
                                <input
                                  type="number"
                                  value={txPlanForm.progress}
                                  onChange={(e) => setTxPlanForm({ ...txPlanForm, progress: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-emerald-500/50 font-mono"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-zinc-400 font-semibold">Status Indicator</label>
                                <select
                                  value={txPlanForm.status}
                                  onChange={(e) => setTxPlanForm({ ...txPlanForm, status: e.target.value })}
                                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 focus:outline-none"
                                >
                                  <option value="Draft">Draft</option>
                                  <option value="Active">Active</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Suspended">Suspended</option>
                                </select>
                              </div>
                              <div className="space-y-1 sm:col-span-2">
                                <label className="text-zinc-400 font-semibold">Treatment Phases (One per line)</label>
                                <textarea
                                  value={txPlanForm.phasesText}
                                  onChange={(e) => setTxPlanForm({ ...txPlanForm, phasesText: e.target.value })}
                                  placeholder="Phase 1: Diagnostic Modeling&#10;Phase 2: Prep & Temporaries"
                                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-emerald-500/50 min-h-[100px] font-mono"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                              <button
                                onClick={() => setIsTxPlanModalOpen(false)}
                                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs border border-zinc-800"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  const phasesArray = txPlanForm.phasesText
                                    .split('\n')
                                    .filter(line => line.trim())
                                    .map((line, idx) => ({
                                      name: line,
                                      status: idx === 0 ? "In Progress" : "Pending",
                                      details: "Milestone phase defined by prosthodontist."
                                    }));

                                  if (editingTxPlan) {
                                    const updated = treatmentPlans.map(p => {
                                      if (p.id === editingTxPlan.id) {
                                        return {
                                          ...p,
                                          title: txPlanForm.title || "Prosthetic Course",
                                          description: txPlanForm.description,
                                          estimatedCost: txPlanForm.estimatedCost,
                                          status: txPlanForm.status,
                                          progress: txPlanForm.progress,
                                          phases: phasesArray
                                        };
                                      }
                                      return p;
                                    });
                                    saveTreatmentPlansList(updated);
                                  } else {
                                    const newPlan = {
                                      id: `TX-${Math.floor(100 + Math.random() * 900)}`,
                                      title: txPlanForm.title || "Prosthetic Course",
                                      description: txPlanForm.description,
                                      estimatedCost: txPlanForm.estimatedCost,
                                      status: txPlanForm.status,
                                      progress: txPlanForm.progress,
                                      createdDate: new Date().toISOString().split('T')[0],
                                      phases: phasesArray
                                    };
                                    saveTreatmentPlansList([newPlan, ...treatmentPlans]);
                                  }
                                  setIsTxPlanModalOpen(false);
                                }}
                                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold"
                              >
                                {editingTxPlan ? "Save Plan Parameters" : "Publish Treatment Course"}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* TREATMENT PLANS LIST */}
                        <div className="space-y-6">
                          {treatmentPlans.map((plan) => (
                            <div key={plan.id} className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/10 backdrop-blur-sm space-y-4">
                              <div className="flex justify-between items-start border-b border-zinc-900/60 pb-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-mono text-zinc-500">Course {plan.id}</span>
                                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                                      plan.status === 'Active' 
                                        ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' 
                                        : plan.status === 'Completed'
                                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                          : 'bg-zinc-950 text-zinc-500 border-zinc-800'
                                    }`}>
                                      {plan.status}
                                    </span>
                                  </div>
                                  <h3 className="text-sm font-bold text-white">{plan.title}</h3>
                                  <p className="text-xs text-zinc-400 mt-1">{plan.description}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] text-zinc-500 uppercase font-mono font-semibold">Est. Fee</p>
                                  <p className="text-sm font-bold text-white font-mono">${plan.estimatedCost.toLocaleString()}</p>
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      onClick={() => {
                                        setEditingTxPlan(plan);
                                        setTxPlanForm({
                                          title: plan.title,
                                          description: plan.description || '',
                                          estimatedCost: plan.estimatedCost,
                                          status: plan.status,
                                          progress: plan.progress,
                                          phasesText: plan.phases?.map((p: any) => p.name).join('\n') || ''
                                        });
                                        setIsTxPlanModalOpen(true);
                                      }}
                                      className="text-xs text-zinc-400 hover:text-white"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm("Are you sure you want to delete this treatment plan?")) {
                                          saveTreatmentPlansList(treatmentPlans.filter(p => p.id !== plan.id));
                                        }
                                      }}
                                      className="text-xs text-red-400 hover:text-red-300"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Progress bar */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-mono">
                                  <span className="text-zinc-500">Overall Milestone Progress</span>
                                  <span className="text-emerald-400 font-bold">{plan.progress}%</span>
                                </div>
                                <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-900">
                                  <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${plan.progress}%` }} />
                                </div>
                              </div>

                              {/* Phase Steps list */}
                              <div className="space-y-2.5 pt-2">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Detailed Stages</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {plan.phases?.map((step: any, idx: number) => {
                                    const isDone = step.status === 'Completed' || step.status === '100% Completed';
                                    return (
                                      <div key={idx} className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-900 flex flex-col justify-between">
                                        <div>
                                          <div className="flex justify-between items-start mb-1">
                                            <h4 className="text-[11px] font-bold text-white leading-normal">{step.name}</h4>
                                            <span className={`text-[9px] font-mono shrink-0 px-1.5 py-0.5 rounded ${
                                              isDone ? 'bg-emerald-950/20 text-emerald-400' : 'bg-zinc-900 text-zinc-500'
                                            }`}>
                                              {isDone ? 'Done' : 'Pending'}
                                            </span>
                                          </div>
                                          <p className="text-[10px] text-zinc-400 leading-normal">{step.details}</p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* DENTAL CHART TAB */}
                    {workspaceTab === 'dental-chart' && (
                      <motion.div
                        key="tab-dental"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-6"
                      >
                        <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/20 space-y-4">
                          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                            <div>
                              <h3 className="text-sm font-bold text-white">Interactive Prosthodontic Dental Chart</h3>
                              <p className="text-xs text-zinc-400">Click any tooth to cycle restorative statuses in real time.</p>
                            </div>
                            <div className="flex flex-wrap gap-2 text-[9px] font-mono uppercase font-bold">
                              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-zinc-900 border border-zinc-700 block" /> Sound</span>
                              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-500 block" /> Prep</span>
                              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500 block" /> Crowned</span>
                              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-500/20 border border-blue-500 block" /> Implant</span>
                              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-zinc-950 border border-dashed border-zinc-800 block" /> Missing</span>
                            </div>
                          </div>

                          {/* Beautiful Interactive Teeth Layout */}
                          <div className="space-y-8 py-6">
                            
                            {/* UPPER ARCH (18 to 28) */}
                            <div className="space-y-2">
                              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Upper Maxillary Arch</h4>
                              <ToothSelector teeth={[18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]} teethStatuses={teethStatuses} onToggleState={toggleToothState} />
                            </div>

                            {/* LOWER ARCH (48 to 38) */}
                            <div className="space-y-2">
                              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Lower Mandibular Arch</h4>
                              <ToothSelector teeth={[48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]} teethStatuses={teethStatuses} onToggleState={toggleToothState} />
                            </div>

                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* PROSTHODONTICS TAB */}
                    {workspaceTab === 'prosthodontics' && (
                      <motion.div
                        key="tab-prostho"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/20 space-y-4"
                      >
                        <h3 className="text-sm font-bold text-white border-b border-zinc-900 pb-2">Digital Prosthodontics Parameter Controls</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          
                          <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-900 space-y-3">
                            <h4 className="font-semibold text-emerald-400 uppercase tracking-wider text-[10px]">Preparation Margin Parameters</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between border-b border-zinc-900/50 pb-1.5">
                                <span className="text-zinc-500">Margin Design:</span>
                                <span className="text-zinc-200">Radial Chamfer (1.2mm depth)</span>
                              </div>
                              <div className="flex justify-between border-b border-zinc-900/50 pb-1.5">
                                <span className="text-zinc-500">Subgingival Extension:</span>
                                <span className="text-zinc-200">0.5mm max safety limit</span>
                              </div>
                              <div className="flex justify-between pb-1.5">
                                <span className="text-zinc-500">Taper parameters:</span>
                                <span className="text-zinc-200">6 degrees axial convergence</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-900 space-y-3">
                            <h4 className="font-semibold text-emerald-400 uppercase tracking-wider text-[10px]">Aesthetic Shade & Lustre Guides</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between border-b border-zinc-900/50 pb-1.5">
                                <span className="text-zinc-500">Primary Shade Selection:</span>
                                <span className="text-zinc-200 font-bold font-mono">VITA Classic OM1 Bleach</span>
                              </div>
                              <div className="flex justify-between border-b border-zinc-900/50 pb-1.5">
                                <span className="text-zinc-500">Secondary Cervical Hue:</span>
                                <span className="text-zinc-200">OM3 Graduated transition</span>
                              </div>
                              <div className="flex justify-between pb-1.5">
                                <span className="text-zinc-500">Translucency value:</span>
                                <span className="text-zinc-200">High Translucency (HT) 49% index</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-900 sm:col-span-2 space-y-3">
                            <h4 className="font-semibold text-emerald-400 uppercase tracking-wider text-[10px]">Restorative Material Specifications</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="p-3 rounded bg-zinc-900 border border-zinc-800 text-center space-y-1">
                                <p className="text-[10px] text-zinc-500">Active Stage 1-2 Material</p>
                                <p className="font-bold text-white">Milled PMMA provisional</p>
                                <span className="text-[9px] font-mono text-emerald-400">Status: Bonded</span>
                              </div>
                              <div className="p-3 rounded bg-zinc-900 border border-zinc-800 text-center space-y-1">
                                <p className="text-[10px] text-zinc-500">Active Stage 3-4 Material</p>
                                <p className="font-bold text-white">Monolithic Zirconia (Multi)</p>
                                <span className="text-[9px] font-mono text-purple-400">Status: Milling Queue</span>
                              </div>
                              <div className="p-3 rounded bg-zinc-900 border border-zinc-800 text-center space-y-1">
                                <p className="text-[10px] text-zinc-500">Alternative Options</p>
                                <p className="font-bold text-white">IPS E.Max Disilicate</p>
                                <span className="text-[9px] font-mono text-zinc-500">Status: Available</span>
                              </div>
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}

                    {/* IMPLANTS TAB */}
                    {workspaceTab === 'implants' && (
                      <motion.div
                        key="tab-implants"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/20 space-y-4"
                      >
                        <h3 className="text-sm font-bold text-white border-b border-zinc-900 pb-2">Digital Implant System Mapping</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          
                          <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-900 space-y-3">
                            <h4 className="font-semibold text-blue-400 uppercase tracking-wider text-[10px]">Osteotomy parameters (#36 site)</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between border-b border-zinc-900/50 pb-1.5">
                                <span className="text-zinc-500">Implant Brand Selection:</span>
                                <span className="text-zinc-200">Straumann SLActive Premium</span>
                              </div>
                              <div className="flex justify-between border-b border-zinc-900/50 pb-1.5">
                                <span className="text-zinc-500">Implant Size Parameters:</span>
                                <span className="text-zinc-200 font-mono">4.1mm Diameter x 10mm Length</span>
                              </div>
                              <div className="flex justify-between pb-1.5">
                                <span className="text-zinc-500">Pre-set Insertion Torque:</span>
                                <span className="text-zinc-200 font-bold font-mono">35 Ncm Target</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-900 space-y-3">
                            <h4 className="font-semibold text-blue-400 uppercase tracking-wider text-[10px]">Osseointegration Stability Tracking</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between border-b border-zinc-900/50 pb-1.5">
                                <span className="text-zinc-500">Stability Index (ISQ):</span>
                                <span className="text-emerald-400 font-bold font-mono">74 (Ideal primary retention)</span>
                              </div>
                              <div className="flex justify-between border-b border-zinc-900/50 pb-1.5">
                                <span className="text-zinc-500">Abutment Interface:</span>
                                <span className="text-zinc-200">Straumann Bone Level Tapered (BLT) CrossFit</span>
                              </div>
                              <div className="flex justify-between pb-1.5">
                                <span className="text-zinc-500">Healing Phase Period:</span>
                                <span className="text-zinc-200">8-week post-surgical evaluation</span>
                              </div>
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}

                    {/* LABORATORY TAB */}
                    {workspaceTab === 'laboratory' && (
                      <motion.div
                        key="tab-laboratory"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                      >
                        <div className="bg-zinc-900/20 p-4 rounded-xl border border-zinc-900 flex justify-between items-center">
                          <div>
                            <h3 className="text-sm font-bold text-white">CAD/CAM Production Workspace</h3>
                            <p className="text-xs text-zinc-400">Monitoring digital dental workflows, milling outputs, and SLA printing queues.</p>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                            Milling Active
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {[
                            { name: "Zirconia Cases", val: "3 Active Milling", desc: "Monolithic multilayer zirconia blocks loaded in VHF R5 wet mill.", status: "Sintering", color: "text-amber-400 border-amber-500/20 bg-amber-500/5" },
                            { name: "PMMA Provisionals", val: "1 In-progress Printing", desc: "Temporary crowns & arches generated on SprintRay Pro 95.", status: "Curing Phase", color: "text-blue-400 border-blue-500/20 bg-blue-500/5" },
                            { name: "Exocad Designs", val: "2 Completed STL Models", desc: "Design workspace parameters verified for crown prep margins.", status: "Design Finalized", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" },
                            { name: "3Shape Orders", val: "4 Linked Orders", desc: "Trios 5 scans imported directly to laboratory processing node.", status: "Sync Complete", color: "text-purple-400 border-purple-500/20 bg-purple-500/5" },
                            { name: "Milling Queue", val: "Node B • VHF R5", desc: "Scheduled job for Arthur Pendragon full arch crown sintering.", status: "In Milling", color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5" },
                            { name: "Printing Queue", val: "SprintRay Pro • SLA", desc: "Lucitone denture bases queued for printing dispatch.", status: "Pending Wash", color: "text-pink-400 border-pink-500/20 bg-pink-500/5" },
                          ].map((lab, idx) => (
                            <div key={idx} className={`p-4 rounded-xl border ${lab.color} space-y-2`}>
                              <div className="flex justify-between items-center border-b border-zinc-900 pb-1.5">
                                <span className="font-bold text-xs text-white">{lab.name}</span>
                                <span className="text-[9px] font-mono uppercase font-bold">{lab.status}</span>
                              </div>
                              <p className="text-xs font-semibold text-zinc-300 font-mono leading-tight">{lab.val}</p>
                              <p className="text-[10px] text-zinc-500 leading-normal">{lab.desc}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* IMAGING TAB */}
                    {workspaceTab === 'imaging' && (
                      <motion.div
                        key="tab-imaging"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-6"
                      >
                        <div className="bg-zinc-900/15 p-5 rounded-2xl border border-zinc-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <h3 className="text-sm font-bold text-white">Digital Dental Imaging PACS Hub</h3>
                            <p className="text-[11px] text-zinc-400">Retrieve 3D CBCT scans, STL models, and intraoral clinical portfolios.</p>
                          </div>
                          <button
                            onClick={() => setIsAddingStudy(!isAddingStudy)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10"
                          >
                            <Plus className="w-4 h-4" />
                            {isAddingStudy ? "Close Register Form" : "Register Imaging Study"}
                          </button>
                        </div>

                        {/* Inline form to register a new study */}
                        {isAddingStudy && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950/60 space-y-4"
                          >
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Register New PACS Scan Study</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                              <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-zinc-500">Scan / Study Name</label>
                                <input
                                  type="text"
                                  value={newStudyName}
                                  onChange={(e) => setNewStudyName(e.target.value)}
                                  placeholder="E.g., Post-op crown margin scan #11"
                                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-zinc-500">Modality Category</label>
                                <select
                                  value={newStudyCategory}
                                  onChange={(e) => setNewStudyCategory(e.target.value)}
                                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                                >
                                  <option value="CBCT">CBCT Radiograph</option>
                                  <option value="Intraoral Scan">Intraoral Scan (STL)</option>
                                  <option value="Clinical Photo">Clinical Photo</option>
                                  <option value="Radiograph">Skeletal Radiograph</option>
                                </select>
                              </div>
                              <div className="space-y-1.5 flex items-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!newStudyName.trim()) return;
                                    const timestamp = new Date().toLocaleDateString('en-US', {
                                      month: 'short', day: '2-digit', year: 'numeric'
                                    });
                                    const newStudy = {
                                      id: `img-${Date.now()}`,
                                      name: newStudyName,
                                      category: newStudyCategory,
                                      url: "/placeholder-imaging.jpg",
                                      date: timestamp
                                    };
                                    saveImagingGallery([newStudy, ...imagingGallery]);
                                    setNewStudyName('');
                                    setIsAddingStudy(false);
                                  }}
                                  className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all"
                                >
                                  Confirm PACS Registration
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Category filter pills */}
                        <div className="flex flex-wrap gap-1.5 border-b border-zinc-900 pb-3">
                          {["All", "CBCT", "Intraoral Scan", "Clinical Photo", "Radiograph"].map(cat => (
                            <button
                              key={cat}
                              onClick={() => setSelectedImageCategory(cat)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                                selectedImageCategory === cat
                                  ? "bg-zinc-100 text-black"
                                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-850"
                              }`}
                            >
                              {cat === "All" ? "All Modalities" : cat}
                            </button>
                          ))}
                        </div>

                        {/* Scans Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {imagingGallery
                            .filter(img => selectedImageCategory === "All" || img.category === selectedImageCategory)
                            .map((img) => (
                              <div key={img.id} className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-900 flex flex-col justify-between gap-4 hover:border-zinc-800 transition-all">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className={`text-[8px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                                      img.category === "CBCT" ? "text-pink-400 bg-pink-500/10 border-pink-500/20" :
                                      img.category === "Intraoral Scan" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                                      img.category === "Clinical Photo" ? "text-blue-400 bg-blue-500/10 border-blue-500/20" :
                                      "text-purple-400 bg-purple-500/10 border-purple-500/20"
                                    }`}>
                                      {img.category}
                                    </span>
                                    <span className="text-[9px] font-mono text-zinc-500">{img.date}</span>
                                  </div>
                                  <h4 className="text-xs font-bold text-white line-clamp-1">{img.name}</h4>
                                  <p className="text-[10px] text-zinc-500 leading-normal">
                                    {img.category === "CBCT" ? "3D structural cross section. Bone level evaluation & nerve path localization." :
                                     img.category === "Intraoral Scan" ? "Precision digital CAD/CAM mesh model. Standard high-fidelity triangulation." :
                                     img.category === "Clinical Photo" ? "Aesthetic smile analysis. Photostudio profile mapping & light evaluation." :
                                     "Pre-operative alveolar bone height study, density tracking."}
                                  </p>
                                </div>

                                {/* Custom Graphical Placeholder based on category */}
                                <div className="h-28 rounded-xl bg-zinc-950 border border-zinc-900 flex flex-col items-center justify-center relative overflow-hidden group">
                                  {img.category === "CBCT" && (
                                    <>
                                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-900" />
                                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-500/25 animate-spin z-10" style={{ animationDuration: '20s' }} />
                                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-500/35 z-10" />
                                      <span className="text-[9px] font-mono text-zinc-500 uppercase z-10 mt-1">AXIAL SLICE STACK</span>
                                    </>
                                  )}

                                  {img.category === "Intraoral Scan" && (
                                    <>
                                      <div className="absolute inset-0 bg-zinc-950" />
                                      <Activity className="w-8 h-8 text-emerald-500/35 animate-pulse z-10" />
                                      <span className="text-[9px] font-mono text-zinc-500 uppercase z-10 mt-2">48,290 Mesh Vertices</span>
                                    </>
                                  )}

                                  {img.category === "Clinical Photo" && (
                                    <>
                                      <Image
                                        src={activePatient.photoUrl}
                                        alt="Clinical smile portrait"
                                        fill
                                        className="object-cover opacity-45 group-hover:opacity-65 transition-opacity duration-300"
                                        referrerPolicy="no-referrer"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent" />
                                      <span className="absolute bottom-1.5 left-2 text-[9px] font-mono text-zinc-400">12 Angle Camera Set</span>
                                    </>
                                  )}

                                  {img.category === "Radiograph" && (
                                    <>
                                      <div className="absolute inset-0 bg-zinc-950" />
                                      <ImageIcon className="w-7 h-7 text-purple-500/30 z-10" />
                                      <span className="text-[9px] font-mono text-zinc-500 uppercase z-10 mt-2">Contrast Filter Mapped</span>
                                    </>
                                  )}
                                </div>

                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => setPreviewImage(img)}
                                    className="flex-1 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[11px] font-semibold text-zinc-200 transition-colors"
                                  >
                                    {img.category === "CBCT" ? "Launch DICOM Viewer" :
                                     img.category === "Intraoral Scan" ? "Render 3D Mesh" :
                                     img.category === "Clinical Photo" ? "Inspect Portraits" :
                                     "View Radiograph"}
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm("Are you sure you want to delete this imaging study?")) {
                                        saveImagingGallery(imagingGallery.filter(item => item.id !== img.id));
                                      }
                                    }}
                                    className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-500 hover:text-red-400"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>

                        {/* Interactive Viewer Simulation Overlay Modal */}
                        {previewImage && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
                            <motion.div
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto"
                            >
                              
                              {/* Modal Header */}
                              <div className="flex justify-between items-start border-b border-zinc-800 pb-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                      {previewImage.category}
                                    </span>
                                    <span className="text-[10px] font-mono text-zinc-500">PACS STUDY ID: {previewImage.id}</span>
                                  </div>
                                  <h3 className="text-sm font-bold text-white">{previewImage.name}</h3>
                                  <p className="text-[11px] text-zinc-400">Captured: {previewImage.date} • Operator: {activePatient.primaryDoctor || "Dr. Ahmed"}</p>
                                </div>
                                <button
                                  onClick={() => setPreviewImage(null)}
                                  className="text-zinc-500 hover:text-white font-mono text-xs p-1"
                                >
                                  ✕ Close
                                </button>
                              </div>

                              {/* Interactive Simulation Panel */}
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                
                                {/* Left Side: Viewport */}
                                <div className="md:col-span-7 bg-zinc-950 rounded-xl border border-zinc-850 p-4 flex flex-col items-center justify-center min-h-[260px] relative">
                                  {previewImage.category === "CBCT" && (
                                    <div className="w-full space-y-4 text-center">
                                      <div className="relative w-40 h-40 mx-auto rounded-full border-2 border-emerald-500/30 flex items-center justify-center overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-950" />
                                        <div className="w-28 h-28 rounded-full border border-dashed border-emerald-500/40 animate-pulse" />
                                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-400/50" />
                                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-[9px] font-mono text-emerald-400">
                                          Slice #28
                                        </div>
                                      </div>
                                      <div className="text-[10px] text-zinc-400 font-mono">
                                        Maxillary bone density rating: <span className="text-emerald-400 font-bold">D2 (740 HU)</span>
                                      </div>
                                    </div>
                                  )}

                                  {previewImage.category === "Intraoral Scan" && (
                                    <div className="w-full space-y-4 text-center">
                                      <div className="w-full h-32 flex items-center justify-center gap-1.5">
                                        <div className="w-1.5 h-12 bg-emerald-500/20 rounded animate-pulse" />
                                        <div className="w-1.5 h-16 bg-emerald-500/40 rounded animate-pulse" style={{ animationDelay: '0.2s' }} />
                                        <div className="w-1.5 h-20 bg-emerald-500/60 rounded animate-pulse" style={{ animationDelay: '0.4s' }} />
                                        <div className="w-1.5 h-16 bg-emerald-500/40 rounded animate-pulse" style={{ animationDelay: '0.6s' }} />
                                        <div className="w-1.5 h-12 bg-emerald-500/20 rounded animate-pulse" style={{ animationDelay: '0.8s' }} />
                                      </div>
                                      <div className="text-[10px] text-zinc-400 font-mono">
                                        Milling validation: <span className="text-emerald-400 font-bold">PASS (Margin closure &lt; 15μm)</span>
                                      </div>
                                    </div>
                                  )}

                                  {previewImage.category === "Clinical Photo" && (
                                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                                      <Image
                                        src={activePatient.photoUrl}
                                        alt="Clinical Closeup"
                                        fill
                                        className="object-cover"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                  )}

                                  {previewImage.category === "Radiograph" && (
                                    <div className="w-full space-y-4 text-center">
                                      <div className="w-48 h-24 mx-auto rounded border border-zinc-800 bg-zinc-900/50 flex flex-col justify-around p-3 relative">
                                        <div className="h-0.5 bg-purple-500/40 w-full absolute top-1/2 left-0" />
                                        <div className="text-[9px] font-mono text-zinc-500 uppercase">Pre-op Alveolar Stack</div>
                                        <div className="text-xs font-bold font-mono text-white">#36 Bone height: 12.8mm</div>
                                      </div>
                                      <div className="text-[10px] text-zinc-400 font-mono">
                                        Apical pathology check: <span className="text-emerald-400 font-bold">Clear</span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Right Side: Controls and Diagnostics */}
                                <div className="md:col-span-5 space-y-4 text-xs">
                                  <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-900 space-y-2">
                                    <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Viewport Control</h4>
                                    
                                    {previewImage.category === "CBCT" ? (
                                      <div className="space-y-3">
                                        <div className="space-y-1">
                                          <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                                            <span>Coronal Slice Depth:</span>
                                            <span className="text-emerald-400 font-bold">12.8 mm</span>
                                          </div>
                                          <input type="range" min="1" max="50" defaultValue="25" className="w-full accent-emerald-500" />
                                        </div>
                                        <div className="space-y-1">
                                          <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                                            <span>Nerve Distance Safety:</span>
                                            <span className="text-emerald-400 font-bold">3.4 mm</span>
                                          </div>
                                          <input type="range" min="1" max="50" defaultValue="34" className="w-full accent-emerald-500" />
                                        </div>
                                      </div>
                                    ) : previewImage.category === "Intraoral Scan" ? (
                                      <div className="space-y-3">
                                        <div className="space-y-1">
                                          <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                                            <span>Triangle Mesh Density:</span>
                                            <span className="text-emerald-400 font-bold">48,290 Pts</span>
                                          </div>
                                          <input type="range" min="1" max="50" defaultValue="45" className="w-full accent-emerald-500" />
                                        </div>
                                        <div className="space-y-1">
                                          <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                                            <span>Margin Resolution:</span>
                                            <span className="text-emerald-400 font-bold">High (0.01mm)</span>
                                          </div>
                                          <input type="range" min="1" max="50" defaultValue="48" className="w-full accent-emerald-500" />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-3">
                                        <div className="space-y-1">
                                          <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                                            <span>Contrast Boost:</span>
                                            <span className="text-emerald-400 font-bold">1.4x</span>
                                          </div>
                                          <input type="range" min="1" max="50" defaultValue="30" className="w-full accent-emerald-500" />
                                        </div>
                                        <div className="space-y-1">
                                          <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                                            <span>Zoom Level:</span>
                                            <span className="text-emerald-400 font-bold">150%</span>
                                          </div>
                                          <input type="range" min="1" max="50" defaultValue="15" className="w-full accent-emerald-500" />
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-900 space-y-2">
                                    <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Clinical PACS Meta Tagging</h4>
                                    <div className="space-y-1.5 font-mono text-[10px] text-zinc-400">
                                      <p>• Device Node: <span className="text-zinc-200">TRIOS-V5-CHAMBER-A</span></p>
                                      <p>• Color Calibration: <span className="text-zinc-200">SRGB s99</span></p>
                                      <p>• Triangulation Error Index: <span className="text-emerald-400 font-bold">0.002% (Excellent)</span></p>
                                      <p>• Approved for Mill Queue: <span className="text-emerald-400 font-bold">YES</span></p>
                                    </div>
                                  </div>
                                </div>

                              </div>

                              {/* Modal Footer */}
                              <div className="flex justify-between border-t border-zinc-800 pt-4 text-xs">
                                <span className="text-zinc-500 font-mono flex items-center gap-1.5">
                                  🔐 DICOM EHR Audited Standard
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => alert("Image diagnostic report generated. Sent to lab orders queue.")}
                                    className="px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold"
                                  >
                                    Export Study Report
                                  </button>
                                  <button
                                    onClick={() => setPreviewImage(null)}
                                    className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
                                  >
                                    Close Viewport
                                  </button>
                                </div>
                              </div>

                            </motion.div>
                          </div>
                        )}

                      </motion.div>
                    )}

                    {/* CLINICAL NOTES TAB */}
                    {workspaceTab === 'notes' && (
                      <motion.div
                        key="tab-notes"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          
                          {/* Left Panel: Note Editor (Col span 5) */}
                          <div className="lg:col-span-5 p-5 rounded-2xl border border-zinc-900 bg-zinc-900/15 space-y-4 h-fit">
                            <div className="border-b border-zinc-900 pb-3 flex justify-between items-center">
                              <div>
                                <h3 className="text-sm font-bold text-white">
                                  {editingNoteId ? "Modify SOAP Record" : "New SOAP Entry"}
                                </h3>
                                <p className="text-[11px] text-zinc-400">Structured longitudinal record-keeping.</p>
                              </div>
                              {editingNoteId && (
                                <button
                                  onClick={() => {
                                    setEditingNoteId(null);
                                    setNoteTitle('Crown Prep SOAP Draft');
                                    setSoapSubjective('');
                                    setSoapObjective('');
                                    setSoapAssessment('');
                                    setSoapPlan('');
                                  }}
                                  className="text-[10px] text-emerald-400 font-bold hover:underline"
                                >
                                  Write New Note Instead
                                </button>
                              )}
                            </div>

                            {/* Template pre-fills */}
                            <div className="space-y-1.5">
                              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Prosthodontic Templates</span>
                              <div className="flex flex-wrap gap-1.5">
                                <button
                                  onClick={() => applySoapTemplate('crown')}
                                  className="px-2 py-1 rounded bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-[9px] font-mono font-semibold text-zinc-400 hover:text-white"
                                >
                                  + Crown Prep
                                </button>
                                <button
                                  onClick={() => applySoapTemplate('implant')}
                                  className="px-2 py-1 rounded bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-[9px] font-mono font-semibold text-zinc-400 hover:text-white"
                                >
                                  + Implant Consult
                                </button>
                                <button
                                  onClick={() => applySoapTemplate('veneer')}
                                  className="px-2 py-1 rounded bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-[9px] font-mono font-semibold text-zinc-400 hover:text-white"
                                >
                                  + Veneer Smile Design
                                </button>
                              </div>
                            </div>

                            <form onSubmit={handleSaveSOAPNote} className="space-y-4 text-xs">
                              <div className="space-y-1">
                                <label className="text-zinc-400 font-semibold block">Record Title</label>
                                <input
                                  type="text"
                                  value={noteTitle}
                                  onChange={(e) => setNoteTitle(e.target.value)}
                                  placeholder="E.g., Crown prep progress..."
                                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                                  required
                                />
                              </div>

                              {/* S Field */}
                              <div className="space-y-1">
                                <label className="text-emerald-400 font-mono font-bold block flex items-center gap-1.5">
                                  <span className="px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">S</span> Subjective (Complaints / Feedback)
                                </label>
                                <textarea
                                  rows={3}
                                  value={soapSubjective}
                                  onChange={(e) => setSoapSubjective(e.target.value)}
                                  placeholder="Patient report of symptoms, objectives, or aesthetic feedback..."
                                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-zinc-200 focus:outline-none focus:border-emerald-500/50 leading-relaxed font-sans"
                                />
                              </div>

                              {/* O Field */}
                              <div className="space-y-1">
                                <label className="text-emerald-400 font-mono font-bold block flex items-center gap-1.5">
                                  <span className="px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">O</span> Objective (Clinical measurements, CBCT, scans)
                                </label>
                                <textarea
                                  rows={3}
                                  value={soapObjective}
                                  onChange={(e) => setSoapObjective(e.target.value)}
                                  placeholder="Intraoral scan findings, bone depth width, margins prepped, shades selected..."
                                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-zinc-200 focus:outline-none focus:border-emerald-500/50 leading-relaxed font-sans"
                                />
                              </div>

                              {/* A Field */}
                              <div className="space-y-1">
                                <label className="text-emerald-400 font-mono font-bold block flex items-center gap-1.5">
                                  <span className="px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">A</span> Assessment (Clinical evaluation / Diagnosis)
                                </label>
                                <textarea
                                  rows={2}
                                  value={soapAssessment}
                                  onChange={(e) => setSoapAssessment(e.target.value)}
                                  placeholder="Status of preps, tissue management, biological width verification, risk score..."
                                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-zinc-200 focus:outline-none focus:border-emerald-500/50 leading-relaxed font-sans"
                                />
                              </div>

                              {/* P Field */}
                              <div className="space-y-1">
                                <label className="text-emerald-400 font-mono font-bold block flex items-center gap-1.5">
                                  <span className="px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">P</span> Plan (Lab steps, Milling, Sintering, Next visits)
                                </label>
                                <textarea
                                  rows={2}
                                  value={soapPlan}
                                  onChange={(e) => setSoapPlan(e.target.value)}
                                  placeholder="Provisional cementation, lab files sent, delivery dates, recall profile scheduled..."
                                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-zinc-200 focus:outline-none focus:border-emerald-500/50 leading-relaxed font-sans"
                                />
                              </div>

                              {/* Quick attachments checklist */}
                              <div className="space-y-1.5">
                                <label className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider block">Reference Attachments</label>
                                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-zinc-950 border border-zinc-900">
                                  {["trios_scan.stl", "maxillary_cbct.dcm", "dsd_smile_v2.jpg", "patient_consent.pdf"].map(file => {
                                    const isAttached = noteAttachments.includes(file);
                                    return (
                                      <label key={file} className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-white select-none text-[10px] font-mono truncate">
                                        <input
                                          type="checkbox"
                                          checked={isAttached}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setNoteAttachments([...noteAttachments, file]);
                                            } else {
                                              setNoteAttachments(noteAttachments.filter(item => item !== file));
                                            }
                                          }}
                                          className="rounded border-zinc-800 bg-zinc-900 text-emerald-500 focus:ring-0 w-3 h-3"
                                        />
                                        {file}
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="flex gap-2 justify-end pt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSoapSubjective('');
                                    setSoapObjective('');
                                    setSoapAssessment('');
                                    setSoapPlan('');
                                    setNoteAttachments([]);
                                    setNoteTitle('Crown Prep SOAP Draft');
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-zinc-400"
                                >
                                  Reset
                                </button>
                                <button
                                  type="submit"
                                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  {editingNoteId ? "Update SOAP Note" : "Log SOAP Entry"}
                                </button>
                              </div>
                            </form>
                          </div>

                          {/* Right Panel: Notes History list (Col span 7) */}
                          <div className="lg:col-span-7 space-y-4">
                            <div className="p-4 rounded-xl bg-zinc-900/25 border border-zinc-900 flex justify-between items-center">
                              <div>
                                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Patient Notes Database</h3>
                                <p className="text-[10px] text-zinc-400">Archived and current dental electronic health records.</p>
                              </div>
                              <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-850 text-xs text-zinc-300 font-mono">
                                {clinicalNotesList.length} Entries
                              </span>
                            </div>

                            <div className="space-y-4 max-h-[720px] overflow-y-auto pr-1">
                              {clinicalNotesList.length === 0 ? (
                                <div className="p-8 rounded-xl border border-dashed border-zinc-800 text-center text-zinc-500">
                                  No clinical notes recorded. Use templates on the left to start.
                                </div>
                              ) : (
                                clinicalNotesList.map((note) => (
                                  <div key={note.id} className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-900/60 hover:border-zinc-800/80 transition-all space-y-3">
                                    
                                    {/* Note Header */}
                                    <div className="flex justify-between items-start border-b border-zinc-900 pb-2">
                                      <div>
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                          <span className="text-[9px] font-mono text-zinc-500">{note.id}</span>
                                          <span className="text-[9px] font-mono text-zinc-400">• Attending: {note.author}</span>
                                        </div>
                                        <h4 className="text-xs font-bold text-white">{note.title}</h4>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => handleEditNoteClick(note)}
                                          className="text-[10px] text-zinc-400 hover:text-white"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => handleDeleteNote(note.id)}
                                          className="text-[10px] text-red-400 hover:text-red-300"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>

                                    {/* SOAP Content Grid */}
                                    <div className="grid grid-cols-1 gap-2.5 text-[11px] leading-relaxed">
                                      {note.soap.subjective && (
                                        <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-900/50">
                                          <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-0.5">S • Subjective</span>
                                          <p className="text-zinc-300 font-sans">{note.soap.subjective}</p>
                                        </div>
                                      )}
                                      {note.soap.objective && (
                                        <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-900/50">
                                          <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-0.5">O • Objective</span>
                                          <p className="text-zinc-300 font-sans">{note.soap.objective}</p>
                                        </div>
                                      )}
                                      {note.soap.assessment && (
                                        <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-900/50">
                                          <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-0.5">A • Assessment</span>
                                          <p className="text-zinc-300 font-sans">{note.soap.assessment}</p>
                                        </div>
                                      )}
                                      {note.soap.plan && (
                                        <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-900/50">
                                          <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-0.5">P • Plan</span>
                                          <p className="text-zinc-300 font-sans">{note.soap.plan}</p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Attachments & Meta info footer */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] pt-1">
                                      <div className="flex flex-wrap gap-1.5 items-center">
                                        <span className="text-zinc-500 font-mono">Attachments:</span>
                                        {note.attachments && note.attachments.length > 0 ? (
                                          note.attachments.map((att: any, aIdx: number) => (
                                            <span key={aIdx} className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[9px]">
                                              📎 {att.name}
                                            </span>
                                          ))
                                        ) : (
                                          <span className="text-zinc-600 italic">None</span>
                                        )}
                                      </div>
                                      <span className="text-zinc-500 font-mono text-[9px] shrink-0">{note.timestamp}</span>
                                    </div>

                                    {/* Edit History Logs */}
                                    {note.edits && note.edits.length > 0 && (
                                      <div className="p-2 bg-zinc-950/90 rounded-xl border border-dashed border-zinc-900 space-y-1">
                                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Auditable Modification Log:</span>
                                        {note.edits.map((ed: any, edIdx: number) => (
                                          <p key={edIdx} className="text-[9px] text-zinc-400 font-mono leading-normal">
                                            • Revised on <span className="text-zinc-300">{ed.timestamp}</span> by <span className="text-emerald-400">{ed.author}</span> (Fields: <span className="text-zinc-300">{ed.fieldsChanged}</span>)
                                          </p>
                                        ))}
                                      </div>
                                    )}

                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}

                    {/* FILES TAB */}
                    {workspaceTab === 'files' && (
                      <motion.div
                        key="tab-files"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-6"
                      >
                        <div className="bg-zinc-900/15 p-5 rounded-2xl border border-zinc-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <h3 className="text-sm font-bold text-white">EHR Case Documents & Consent Vault</h3>
                            <p className="text-[11px] text-zinc-400">Manage patient informed consents, lab prescriptions, and referral clearings.</p>
                          </div>
                          <button
                            onClick={() => setIsAddingDoc(!isAddingDoc)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10"
                          >
                            <Plus className="w-4 h-4" />
                            {isAddingDoc ? "Close Register Form" : "Register Document"}
                          </button>
                        </div>

                        {/* Register Document Form */}
                        {isAddingDoc && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950/60 space-y-4"
                          >
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Register Patient Document / Referral</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                              <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-zinc-500">Document Name</label>
                                <input
                                  type="text"
                                  value={newDocName}
                                  onChange={(e) => setNewDocName(e.target.value)}
                                  placeholder="E.g., Informed Consent for implant surgery"
                                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-zinc-500">Document Type</label>
                                <select
                                  value={newDocType}
                                  onChange={(e) => setNewDocType(e.target.value)}
                                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                                >
                                  <option value="Consent Form">Consent Form</option>
                                  <option value="Lab Prescription">Lab Prescription</option>
                                  <option value="Referral Letter">Referral Letter</option>
                                  <option value="Medical Report">Medical Report</option>
                                </select>
                              </div>
                              <div className="space-y-1.5 flex items-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!newDocName.trim()) return;
                                    const timestamp = new Date().toLocaleDateString('en-US', {
                                      month: 'short', day: '2-digit', year: 'numeric'
                                    });
                                    const newDoc = {
                                      id: `doc-${Date.now()}`,
                                      name: newDocName,
                                      type: newDocType,
                                      url: "#",
                                      date: timestamp
                                    };
                                    savePatientDocuments([newDoc, ...patientDocuments]);
                                    setNewDocName('');
                                    setIsAddingDoc(false);
                                  }}
                                  className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all"
                                >
                                  Confirm Document Filing
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Drag and drop uploader box */}
                        <div
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                          className={`p-8 rounded-2xl border-2 border-dashed text-center space-y-3 transition-all ${
                            dragActive 
                              ? 'border-emerald-500 bg-emerald-500/5' 
                              : 'border-zinc-850 bg-zinc-950/20 hover:border-zinc-800'
                          }`}
                        >
                          <div className="inline-flex items-center justify-center p-3 rounded-full bg-zinc-900 text-zinc-400">
                            <HardDrive className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-white">Drag & Drop Signed Consents or PDFs</h4>
                            <p className="text-[10px] text-zinc-500">Supports patient sign sheets, specialist referrals, or laboratory reports up to 50MB.</p>
                          </div>
                          <div>
                            <label className="inline-flex px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-semibold text-zinc-300 cursor-pointer transition-colors">
                              Browse Local Files
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];
                                    const timestamp = new Date().toLocaleDateString('en-US', {
                                      month: 'short', day: '2-digit', year: 'numeric'
                                    });
                                    const newDoc = {
                                      id: `doc-${Date.now()}`,
                                      name: file.name,
                                      type: file.name.toLowerCase().includes("consent") ? "Consent Form" : "Medical Report",
                                      url: "#",
                                      date: timestamp
                                    };
                                    savePatientDocuments([newDoc, ...patientDocuments]);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {/* Filter and Documents List */}
                        <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-900 pb-3">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">EHR Case Files Database</h3>
                            <div className="flex flex-wrap gap-1">
                              {["All", "Consent Form", "Lab Prescription", "Referral Letter", "Medical Report"].map(type => (
                                <button
                                  key={type}
                                  onClick={() => setSelectedDocTypeFilter(type)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                                    selectedDocTypeFilter === type
                                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                                      : "bg-zinc-950 text-zinc-500 border border-zinc-900 hover:text-zinc-300"
                                  }`}
                                >
                                  {type}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-2.5">
                            {patientDocuments
                              .filter(doc => selectedDocTypeFilter === "All" || doc.type === selectedDocTypeFilter)
                              .map((doc) => (
                                <div key={doc.id} className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-900 flex items-center justify-between gap-3 hover:border-zinc-800 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 rounded bg-zinc-900 text-zinc-400">
                                      <FileText className="w-4.5 h-4.5" />
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-bold text-white leading-tight">{doc.name}</h4>
                                      <p className="text-[10px] text-zinc-500 font-mono">{doc.type} • Mapped to PACS • Filed {doc.date}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => setPreviewDocument(doc)}
                                      className="px-2.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[10px] font-semibold text-zinc-300"
                                    >
                                      Open Document
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm("Are you sure you want to archive this clinical document?")) {
                                          savePatientDocuments(patientDocuments.filter(d => d.id !== doc.id));
                                        }
                                      }}
                                      className="p-1.5 rounded text-zinc-600 hover:text-red-400 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            
                            {patientDocuments.filter(doc => selectedDocTypeFilter === "All" || doc.type === selectedDocTypeFilter).length === 0 && (
                              <p className="text-xs text-zinc-500 italic text-center py-4">No documents found matching the filter.</p>
                            )}
                          </div>
                        </div>

                        {/* Interactive Document Preview Overlay Modal */}
                        {previewDocument && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
                            <motion.div
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto"
                            >
                              
                              {/* Modal Header */}
                              <div className="flex justify-between items-start border-b border-zinc-800 pb-3">
                                <div>
                                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20 uppercase">
                                    {previewDocument.type}
                                  </span>
                                  <h3 className="text-sm font-bold text-white mt-1">{previewDocument.name}</h3>
                                  <p className="text-[10px] text-zinc-500">EHR Reference ID: {previewDocument.id} • Date Mapped: {previewDocument.date}</p>
                                </div>
                                <button
                                  onClick={() => setPreviewDocument(null)}
                                  className="text-zinc-500 hover:text-white font-mono text-xs p-1"
                                >
                                  ✕ Close
                                </button>
                              </div>

                              {/* Document Body View */}
                              <div className="bg-zinc-950/80 p-6 rounded-xl border border-zinc-850 space-y-4 font-sans text-xs text-zinc-300 leading-relaxed max-h-[350px] overflow-y-auto select-none">
                                <div className="text-center border-b border-zinc-900 pb-3 space-y-1">
                                  <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">HEALTHOS EHR CLINICAL SYSTEM</span>
                                  <h4 className="text-xs font-bold text-white uppercase">HealthOS Clinical Specialist Alliance</h4>
                                  <p className="text-[9px] text-zinc-500 font-mono">Operator ID: CLINIC-A-0992 | Patient ID: {activePatient.id}</p>
                                </div>

                                {previewDocument.type === "Consent Form" ? (
                                  <div className="space-y-3">
                                    <p className="font-bold text-white">INFORMED CONSENT FOR IMPLANT AND PROSTHODONTIC THERAPY</p>
                                    <p>I hereby authorize Dr. Ahmed, Prosthodontist, to perform the surgical placement of dental implants and corresponding PMMA provisionals. The diagnosis, surgical parameters, and prosthetic materials (monolithic multilayer zirconia) have been explained to me in detail.</p>
                                    <p>I acknowledge that there are biological risks associated with implant placement, including but not limited to postoperative swelling, sensory nerve paresthesia, and rare implant integration failure. I verify that I have disclosed my complete medical history, including cardiac conditions and diabetes status.</p>
                                    <div className="pt-4 flex justify-between text-[10px] border-t border-zinc-900 font-mono">
                                      <div>
                                        <p className="text-zinc-500">Patient Electronic Stamp:</p>
                                        <p className="text-emerald-400 font-bold">✓ SIGNED SECURELY via PatientPortal</p>
                                      </div>
                                      <div>
                                        <p className="text-zinc-500">Physician Authenticator:</p>
                                        <p className="text-zinc-300">Dr. Ahmed, Prosthodontist</p>
                                      </div>
                                    </div>
                                  </div>
                                ) : previewDocument.type === "Lab Prescription" ? (
                                  <div className="space-y-3 font-mono text-[11px]">
                                    <p className="font-bold text-white font-sans text-xs">CAD/CAM LABORATORY PRODUCTION PRESCRIPTION</p>
                                    <p>• LAB CENTER: DentalArt CAD/CAM Center, Region B</p>
                                    <p>• PREPARATION SITE: #36 Milled PMMA with graded cervical margins</p>
                                    <p>• PRIMARY SHADE: VITA Classic OM1 Bleach Selection</p>
                                    <p>• TRANSLUCENCY TARGET: High Translucency (HT) 49% index</p>
                                    <p>• MILLING TOOLING: VHF R5 wet mill with custom multi-layered Zirconia blocks</p>
                                    <p>• SPECIAL DIRECTIVES: Sintering to be executed at standard 1530°C cycle. Pre-set margin gap strictly calibrated to 12 micrometers.</p>
                                    <div className="pt-4 border-t border-zinc-900 text-[10px] text-zinc-500">
                                      <p>Authorized Signature Seal: SECURED_PIN_CADCAM_99182</p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    <p className="font-bold text-white">CLINICAL REFERRAL & SURGICAL COORDINATION CLEARANCE</p>
                                    <p>To: Oral & Maxillofacial Surgery Unit</p>
                                    <p>Re: Alveolar Ridge Augmentation and Sinus Floor Elevation</p>
                                    <p>Please evaluate the patient for bilateral sinus floor elevation (osteotome technique) and guided bone regeneration in the posterior maxillary quadrants. The patient is scheduled for subsequent full-arch fixed implant-supported prosthesis design in our facility.</p>
                                    <p>All diagnostic high-resolution CBCT slice records and STL arch models are available directly via the synced PACS Hub.</p>
                                    <div className="pt-4 border-t border-zinc-900 text-[10px] font-mono">
                                      <p className="text-zinc-500">Referring Physician Pin: REFERRAL_OK_AUTH_9918</p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Form controls inside Modal */}
                              <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-900 flex justify-between items-center text-xs">
                                <span className="text-zinc-400 font-mono">Document State Code:</span>
                                <span className="text-emerald-400 font-bold uppercase font-mono tracking-wider">✓ Approved & Auditable</span>
                              </div>

                              {/* Footer Buttons */}
                              <div className="flex justify-between border-t border-zinc-800 pt-4">
                                <button
                                  onClick={() => alert("Printing request dispatched. Printed on Clinic Printer A.")}
                                  className="px-3.5 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300"
                                >
                                  Print Physical Copy
                                </button>
                                <button
                                  onClick={() => setPreviewDocument(null)}
                                  className="px-5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs"
                                >
                                  Close Document
                                </button>
                              </div>

                            </motion.div>
                          </div>
                        )}

                      </motion.div>
                    )}

                    {/* BILLING TAB */}
                    {workspaceTab === 'billing' && (
                      <motion.div
                        key="tab-billing"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-6"
                      >
                        <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/20 space-y-4">
                          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                            <div>
                              <h3 className="text-sm font-bold text-white font-mono">Prosthodontics Ledger & Claims Status</h3>
                              <p className="text-xs text-zinc-400">Review itemized pricing, insurance pre-authorizations, and outstanding copays.</p>
                            </div>
                            <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
                              HIPAA Compliant
                            </span>
                          </div>

                          {/* Itemized ledger */}
                          <div className="space-y-2.5 text-xs">
                            <div className="grid grid-cols-12 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900 font-bold text-zinc-400 uppercase text-[9px] tracking-wider">
                              <span className="col-span-6">Procedure / Code</span>
                              <span className="col-span-2 text-right">Fee</span>
                              <span className="col-span-2 text-right">Insurance</span>
                              <span className="col-span-2 text-right">Copay</span>
                            </div>

                            {[
                              { code: "D6010 - Surgical Implant Placement (#36)", fee: "$2,850.00", ins: "$1,800.00", copay: "$1,050.00" },
                              { code: "D6056 - Custom Abutment Fabrication", fee: "$1,200.00", ins: "$800.00", copay: "$400.00" },
                              { code: "D6058 - Abutment-Supported Porcelain/Zirconia Crown", fee: "$1,950.00", ins: "$1,200.00", copay: "$750.00" },
                              { code: "D6114 - Maxillary Complete Denture (Digital)", fee: "$4,500.00", ins: "$3,000.00", copay: "$1,500.00" },
                              { code: "D2962 - Porcelain Laminate Veneers (6 Units x $1300)", fee: "$7,800.00", ins: "$4,400.00", copay: "$3,400.00" },
                              { code: "D1110 - Prophylaxis / Scaling & Debridement", fee: "$150.00", ins: "$150.00", copay: "$0.00" }
                            ].map((item, idx) => (
                              <div key={idx} className="grid grid-cols-12 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-900/60 font-mono text-[11px] text-zinc-300">
                                <span className="col-span-6 font-sans text-xs text-white">{item.code}</span>
                                <span className="col-span-2 text-right">{item.fee}</span>
                                <span className="col-span-2 text-right text-purple-400">{item.ins}</span>
                                <span className="col-span-2 text-right text-amber-400">{item.copay}</span>
                              </div>
                            ))}
                          </div>

                        </div>
                      </motion.div>
                    )}

                    {/* AI ASSISTANT TAB */}
                    {workspaceTab === 'ai' && (
                      <motion.div
                        key="tab-ai"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-6"
                      >
                        {/* AI Platform Hub Tabs Navigation */}
                        <div className="flex flex-wrap gap-1.5 bg-zinc-950 p-1.5 rounded-xl border border-zinc-900/90 overflow-x-auto">
                          <button
                            onClick={() => setAiHubTab('copilot')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all flex items-center gap-1.5 ${
                              aiHubTab === 'copilot'
                                ? 'bg-purple-600/15 text-purple-300 border border-purple-500/30'
                                : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Clinical Copilot
                          </button>
                          <button
                            onClick={() => setAiHubTab('soap')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all flex items-center gap-1.5 ${
                              aiHubTab === 'soap'
                                ? 'bg-purple-600/15 text-purple-300 border border-purple-500/30'
                                : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            <Clipboard className="w-3.5 h-3.5" />
                            AI SOAP Scribe
                          </button>
                          <button
                            onClick={() => setAiHubTab('planner')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all flex items-center gap-1.5 ${
                              aiHubTab === 'planner'
                                ? 'bg-purple-600/15 text-purple-300 border border-purple-500/30'
                                : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            <Layers className="w-3.5 h-3.5" />
                            AI Treatment Planner
                          </button>
                          <button
                            onClick={() => setAiHubTab('summary')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all flex items-center gap-1.5 ${
                              aiHubTab === 'summary'
                                ? 'bg-purple-600/15 text-purple-300 border border-purple-500/30'
                                : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Clinical Summary
                          </button>
                          <button
                            onClick={() => setAiHubTab('education')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all flex items-center gap-1.5 ${
                              aiHubTab === 'education'
                                ? 'bg-purple-600/15 text-purple-300 border border-purple-500/30'
                                : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            <Users className="w-3.5 h-3.5" />
                            Patient Education
                          </button>
                          <button
                            onClick={() => setAiHubTab('risks')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all flex items-center gap-1.5 ${
                              aiHubTab === 'risks'
                                ? 'bg-purple-600/15 text-purple-300 border border-purple-500/30'
                                : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Risk Scanning
                          </button>
                        </div>

                        {/* SUB-TAB PANELS */}
                        {/* 1. CLINICAL COPILOT CHAT PANEL */}
                        {aiHubTab === 'copilot' && (
                          <div className="space-y-6">
                            <div className="p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/20 via-zinc-900/40 to-zinc-900/40 space-y-4 text-left">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-widest">
                                  Clinical Copilot Active
                                </span>
                                <span className="text-zinc-500">•</span>
                                <span className="text-xs text-zinc-400">Deep Clinical Decision-Support Engine</span>
                              </div>

                              <h3 className="text-base font-bold text-white tracking-tight font-mono">Expert Prosthodontics & Implant Consultation</h3>
                              <p className="text-xs text-zinc-400">Our engine parses raw CBCT radiology bone values, lisinopril/metformin pharmacological indexes, teeth preparation margins, and digital smile values to output high-fidelity clinical suggestions.</p>

                              {/* Quick action prompts */}
                              <div className="flex flex-wrap gap-2 pt-2">
                                <button
                                  onClick={() => triggerAiCopilot("Review surgical guides and outline an ideal placement timeline for Straumann BLActive implants in osseous region #36.")}
                                  className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-xs font-semibold text-purple-300 flex items-center gap-1.5 transition-colors"
                                >
                                  <FlaskConical className="w-3.5 h-3.5" /> Implant Surgical Guide
                                </button>
                                <button
                                  onClick={() => triggerAiCopilot("Suggest ideal prosthetic material and aesthetics mapping guidelines (Zirconia, Lithium Disilicate, Vita shade configurations) based on this patient's bruxism load.")}
                                  className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-xs font-semibold text-purple-300 flex items-center gap-1.5 transition-colors"
                                >
                                  <Stethoscope className="w-3.5 h-3.5" /> Material Selection
                                </button>
                                <button
                                  onClick={() => triggerAiCopilot("List critical clinical pre-op and postoperative prophylaxis protocols for diabetes management during ridge osteotomy.")}
                                  className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-xs font-semibold text-purple-300 flex items-center gap-1.5 transition-colors"
                                >
                                  <ShieldAlert className="w-3.5 h-3.5" /> Diabetes Care Protocols
                                </button>
                              </div>
                            </div>

                            {/* Prompt and Output Window */}
                            <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-950/80 space-y-4 text-left">
                              <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Decision-Support Terminal</span>
                                {aiLoading && (
                                  <span className="text-[10px] text-purple-400 font-mono animate-pulse flex items-center gap-1.5">
                                    <Zap className="w-3.5 h-3.5 animate-spin" /> ALIGNING RADIOGRAPHIC METADATA...
                                  </span>
                                )}
                              </div>

                              {/* Text Input Search */}
                              <div className="relative">
                                <input
                                  type="text"
                                  value={aiPrompt}
                                  onChange={(e) => setAiPrompt(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && aiPrompt.trim()) {
                                      triggerAiCopilot(aiPrompt);
                                    }
                                  }}
                                  placeholder="Type custom clinical query (e.g. Check local anesthetic interactions with Metformin)..."
                                  className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-purple-500/50"
                                />
                                <button
                                  disabled={aiLoading || !aiPrompt.trim()}
                                  onClick={() => triggerAiCopilot(aiPrompt)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {aiLoading ? (
                                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                                  <div className="w-8 h-8 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                                  <p className="text-xs text-zinc-500 font-mono">Querying deep dental pharmacology catalogs and biological bone density markers...</p>
                                </div>
                              ) : aiOutput ? (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-xs text-zinc-300 space-y-4 font-mono leading-relaxed bg-zinc-900/30 p-5 rounded-xl border border-zinc-900/60"
                                >
                                  <div className="space-y-3 whitespace-pre-line text-zinc-300 text-left">
                                    {aiOutput}
                                  </div>
                                </motion.div>
                              ) : (
                                <div className="py-16 text-center space-y-3">
                                  <Sparkles className="w-7 h-7 text-zinc-800 mx-auto" />
                                  <div className="space-y-1">
                                    <h4 className="text-xs font-bold text-zinc-400 font-mono">Ready to Support</h4>
                                    <p className="text-[10px] text-zinc-600 max-w-xs mx-auto">Ask any question or click a preset shortcut above to fetch real-time decisions grounded in current clinical records.</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 2. AI SOAP ASSISTANT */}
                        {aiHubTab === 'soap' && (
                          <div className="space-y-6 text-left">
                            <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-800 space-y-3">
                              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">AI Clinical Note Scribe</h4>
                              <p className="text-xs text-zinc-400">Provide a brief outline of the completed dental treatment or diagnostic prep below. The AI SOAP assistant will expand it into standard Subjective, Objective, Assessment, and Plan fields with pristine clinical accuracy.</p>
                              <textarea
                                value={soapAiBriefText}
                                onChange={(e) => setSoapAiBriefText(e.target.value)}
                                placeholder="e.g. prepared teeth #11 and #12 for zirconia crowns. Administered 1 carpule of Lidocaine 2% with epi. Completed high-definition intraoral scan with 3Shape. Placed provisional crowns."
                                rows={3}
                                className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 font-sans"
                              />
                              <div className="flex flex-wrap gap-2">
                                <button
                                  disabled={soapAiLoading || !soapAiBriefText.trim()}
                                  onClick={() => triggerSoapAi("create", soapAiBriefText)}
                                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-900 disabled:text-zinc-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                >
                                  <Zap className="w-3.5 h-3.5" />
                                  {soapAiLoading ? "Transcribing Note..." : "Generate Full SOAP"}
                                </button>
                                <button
                                  disabled={soapAiLoading}
                                  onClick={() => triggerSoapAi("correct_formatting", "Analyze the current draft inputs, correct formatting errors, and ensure appropriate ADA dental terminology is used.")}
                                  className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 transition-colors"
                                >
                                  <Clipboard className="w-3.5 h-3.5" /> Correct Formatting
                                </button>
                                <button
                                  disabled={soapAiLoading}
                                  onClick={() => triggerSoapAi("expand", "Expand the existing subjective/objective draft fields to be richer, adding realistic prosthodontic guidelines.")}
                                  className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 transition-colors"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Expand Draft Detail
                                </button>
                              </div>
                            </div>

                            {/* Linked Inputs Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Subjective Draft (S)</label>
                                <textarea
                                  value={soapSubjective}
                                  onChange={(e) => setSoapSubjective(e.target.value)}
                                  rows={5}
                                  className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/30 font-mono"
                                  placeholder="Patient subjective records..."
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Objective Draft (O)</label>
                                <textarea
                                  value={soapObjective}
                                  onChange={(e) => setSoapObjective(e.target.value)}
                                  rows={5}
                                  className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/30 font-mono"
                                  placeholder="Anesthesia, prep depth, torque, materials..."
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Assessment Draft (A)</label>
                                <textarea
                                  value={soapAssessment}
                                  onChange={(e) => setSoapAssessment(e.target.value)}
                                  rows={5}
                                  className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/30 font-mono"
                                  placeholder="Diagnostic assessment, healing stability..."
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Plan Draft (P)</label>
                                <textarea
                                  value={soapPlan}
                                  onChange={(e) => setSoapPlan(e.target.value)}
                                  rows={5}
                                  className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/30 font-mono"
                                  placeholder="Next clinic sequence, milling lab codes..."
                                />
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                              <span className="text-[10px] text-zinc-500 italic">Outputs sync immediately. Feel free to refine draft before committing.</span>
                              <button
                                onClick={(e) => {
                                  handleSaveSOAPNote(e);
                                  alert("SOAP Clinical note successfully committed and archived to timeline records!");
                                }}
                                disabled={!soapSubjective && !soapObjective}
                                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-900 disabled:text-zinc-600 text-black text-xs font-bold transition-all shadow-lg shadow-emerald-500/10"
                              >
                                Commit SOAP to Clinical Timeline
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 3. AI TREATMENT PLANNER */}
                        {aiHubTab === 'planner' && (
                          <div className="space-y-6 text-left">
                            <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-800 space-y-3">
                              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">AI Prosthodontic Option Planner</h4>
                              <p className="text-xs text-zinc-400 font-sans">Input a custom restorative target or chief complaint. The AI treatment designer will output fully structured alternatives (Premium monolithic vs Conservative alternatives), detailing biological risks, mechanical considerations, and timeline predictions.</p>
                              
                              <div className="relative flex items-center">
                                <input
                                  type="text"
                                  value={treatmentAiPrompt}
                                  onChange={(e) => setTreatmentAiPrompt(e.target.value)}
                                  placeholder="e.g. Full-arch maxillary implant-supported bridge, opposing sound mandibular dentition."
                                  className="w-full pl-3 pr-28 py-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-xs text-white focus:outline-none focus:border-purple-500/50"
                                />
                                <button
                                  disabled={treatmentAiLoading || !treatmentAiPrompt.trim()}
                                  onClick={() => triggerTreatmentAi(treatmentAiPrompt)}
                                  className="absolute right-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-[10px] font-bold transition-all"
                                >
                                  {treatmentAiLoading ? "Designing..." : "Design Plans"}
                                </button>
                              </div>
                            </div>

                            {treatmentAiLoading ? (
                              <div className="py-12 flex flex-col items-center justify-center space-y-3 bg-zinc-950/40 rounded-xl border border-zinc-900">
                                <div className="w-8 h-8 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                                <p className="text-xs text-zinc-500 font-mono">Synthesizing multi-alternative restorations, evaluating shear stress risks, and structural load constraints...</p>
                              </div>
                            ) : treatmentAiOutput ? (
                              <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-4 font-mono text-xs text-zinc-300 leading-relaxed max-h-[450px] overflow-y-auto">
                                <div className="whitespace-pre-line">{treatmentAiOutput}</div>
                                <div className="pt-4 border-t border-zinc-900 flex justify-end">
                                  <button
                                    onClick={() => {
                                      const newPlan = {
                                        id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
                                        title: `CAD/CAM Restorations: ${treatmentAiPrompt.substring(0, 30)}...`,
                                        description: `AI Designed options with risks and biocompatible material strategies. Focus: ${treatmentAiPrompt}`,
                                        estimatedCost: 19800,
                                        status: 'Active',
                                        progress: 10,
                                        createdDate: new Date().toISOString().split('T')[0],
                                        phases: [
                                          { name: "Phase 1: CBCT & Diagnostic Scan", status: "Completed", details: "3Shape scans aligned." },
                                          { name: "Phase 2: Custom Trial Mockup Try-in", status: "Pending", details: "Milling PMMA trials." },
                                          { name: "Phase 3: Final Zirconia Restoration Delivery", status: "Pending", details: "Canine protection occlusal calibration." }
                                        ]
                                      };
                                      saveTreatmentPlansList([newPlan, ...treatmentPlans]);
                                      alert("Interactive treatment plan option added to Active Patient file!");
                                    }}
                                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all"
                                  >
                                    Add generated option to Patient Treatments list
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="py-12 text-center border border-zinc-900 rounded-xl bg-zinc-950/20 space-y-2">
                                <Clipboard className="w-6 h-6 text-zinc-800 mx-auto" />
                                <p className="text-xs text-zinc-500">No active treatment plans generated yet. Input clinical target and click 'Design Plans'.</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 4. AI CLINICAL SUMMARY */}
                        {aiHubTab === 'summary' && (
                          <div className="space-y-6 text-left">
                            <div className="p-5 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/20 to-zinc-900/40 flex items-center justify-between">
                              <div>
                                <h3 className="text-sm font-bold text-white font-mono">Patient Comprehensive Summary Sheet</h3>
                                <p className="text-xs text-zinc-400">Generates a synthesized handover checklist reviewing all histories, active treatments, dental charts, scans, and risk thresholds.</p>
                              </div>
                              <button
                                disabled={summaryAiLoading}
                                onClick={triggerClinicalSummaryAi}
                                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-900 text-white text-xs font-bold transition-all"
                              >
                                {summaryAiLoading ? "Synthesizing..." : "Synthesize Profile"}
                              </button>
                            </div>

                            {summaryAiLoading ? (
                              <div className="py-12 flex flex-col items-center justify-center space-y-3 bg-zinc-950/40 rounded-xl border border-zinc-900">
                                <div className="w-8 h-8 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                                <p className="text-xs text-zinc-500 font-mono">Assembling electronic medical charts, radiological CBCT studies, active CAD/CAM orders...</p>
                              </div>
                            ) : summaryAiOutput ? (
                              <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-4 font-mono text-xs text-zinc-300 leading-relaxed max-h-[450px] overflow-y-auto">
                                <div className="whitespace-pre-line">{summaryAiOutput}</div>
                              </div>
                            ) : (
                              <div className="py-12 text-center border border-zinc-900 rounded-xl bg-zinc-950/20 space-y-2">
                                <FileText className="w-6 h-6 text-zinc-800 mx-auto" />
                                <p className="text-xs text-zinc-500">No summary synthesized yet. Click 'Synthesize Profile' to aggregate this EHR profile.</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 5. AI PATIENT EDUCATION */}
                        {aiHubTab === 'education' && (
                          <div className="space-y-6 text-left">
                            <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-800 space-y-3">
                              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Compassionate Patient Explainer</h4>
                              <p className="text-xs text-zinc-400">Translate complex dental jargon, surgical terms, and dental materials parameters into warm, patient-friendly concepts with helpful analogies.</p>
                              
                              <div className="relative flex items-center">
                                <input
                                  type="text"
                                  value={patientEdPrompt}
                                  onChange={(e) => setPatientEdPrompt(e.target.value)}
                                  placeholder="e.g. Explain why a monolithic zirconia crown over a dental implant is needed."
                                  className="w-full pl-3 pr-28 py-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-xs text-white focus:outline-none focus:border-purple-500/50"
                                />
                                <button
                                  disabled={patientEdLoading || !patientEdPrompt.trim()}
                                  onClick={() => triggerPatientEdAi(patientEdPrompt)}
                                  className="absolute right-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-[10px] font-bold transition-all"
                                >
                                  {patientEdLoading ? "Translating..." : "Explain"}
                                </button>
                              </div>
                            </div>

                            {patientEdLoading ? (
                              <div className="py-12 flex flex-col items-center justify-center space-y-3 bg-zinc-950/40 rounded-xl border border-zinc-900">
                                <div className="w-8 h-8 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                                <p className="text-xs text-zinc-500 font-mono">Converting clinical terminology to patient advocacy language with relatable structural analogies...</p>
                              </div>
                            ) : patientEdOutput ? (
                              <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-4 font-sans text-xs text-zinc-300 leading-relaxed max-h-[450px] overflow-y-auto">
                                <div className="whitespace-pre-line">{patientEdOutput}</div>
                                <div className="pt-4 border-t border-zinc-900 flex justify-end">
                                  <button
                                    onClick={() => {
                                      alert("Patient education sheet copied to clinic printer queue!");
                                    }}
                                    className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold transition-all hover:bg-zinc-850"
                                  >
                                    Print Education Guide
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="py-12 text-center border border-zinc-900 rounded-xl bg-zinc-950/20 space-y-2">
                                <Users className="w-6 h-6 text-zinc-800 mx-auto" />
                                <p className="text-xs text-zinc-500">No patient explainer compiled yet. Enter a topic above and click 'Explain'.</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 6. AI RISK DETECTION SCANNER */}
                        {aiHubTab === 'risks' && (
                          <div className="space-y-6 text-left">
                            <div className="p-5 rounded-2xl border border-red-500/10 bg-gradient-to-r from-red-950/20 to-zinc-900/40 flex items-center justify-between">
                              <div>
                                <h3 className="text-sm font-bold text-red-400 font-mono flex items-center gap-1.5">
                                  <ShieldAlert className="w-4 h-4 text-red-500" />
                                  Prosthodontics & Implant Contraindication Scanner
                                </h3>
                                <p className="text-xs text-zinc-400">Deep scanning of pharmacokinetics, HbA1c diabetic bone restrictions, nocturnal overload (bruxism), and restorative stress risks.</p>
                              </div>
                              <button
                                disabled={riskScanLoading}
                                onClick={triggerRiskDetectionAi}
                                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-zinc-900 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/10"
                              >
                                {riskScanLoading ? "Scanning Records..." : "Run Risk Scan"}
                              </button>
                            </div>

                            {riskScanLoading ? (
                              <div className="py-12 flex flex-col items-center justify-center space-y-3 bg-zinc-950/40 rounded-xl border border-zinc-900">
                                <div className="w-8 h-8 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" />
                                <p className="text-xs text-zinc-500 font-mono">Running pharmacological overlap analysis, biological alveolar healing scans, and structural bruxism vector tests...</p>
                              </div>
                            ) : riskScanOutput ? (
                              <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-4 font-mono text-xs text-zinc-300 leading-relaxed max-h-[450px] overflow-y-auto">
                                <div className="whitespace-pre-line">{riskScanOutput}</div>
                              </div>
                            ) : (
                              <div className="py-12 text-center border border-zinc-900 rounded-xl bg-zinc-950/20 space-y-2">
                                <ShieldAlert className="w-6 h-6 text-zinc-800 mx-auto" />
                                <p className="text-xs text-zinc-500">No active risk scans generated yet. Click 'Run Risk Scan' to initiate deep-level drug-implant scans.</p>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}


                  </AnimatePresence>
                </div>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==============================================
         REGISTER / EDIT PATIENT MODAL OVERLAY
         ============================================== */}
      {isPatientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-zinc-900/80 flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-base font-bold text-white font-mono">
                  {editingPatient ? 'Modify Clinical Patient Chart' : 'Register New Prosthodontics Profile'}
                </h3>
                <p className="text-xs text-zinc-400">Initialize electronic health recording parameters compliant with HIPAA standard specifications.</p>
              </div>
              <button
                onClick={() => setIsPatientModalOpen(false)}
                className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePatient} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-zinc-500 font-bold block">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    value={patientForm.name}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. John Doe"
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-zinc-500 font-bold block">Email Address</label>
                  <input
                    type="email"
                    value={patientForm.email}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="e.g. john@healthos.org"
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-500 font-bold block">Phone Number</label>
                  <input
                    type="text"
                    value={patientForm.phone}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="e.g. +1 (555) 000-0000"
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-500 font-bold block">Age / Gender</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={patientForm.age}
                      onChange={(e) => setPatientForm(prev => ({ ...prev, age: Number(e.target.value) }))}
                      className="w-1/2 p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-white focus:outline-none focus:border-emerald-500/50"
                    />
                    <select
                      value={patientForm.gender}
                      onChange={(e) => setPatientForm(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-1/2 p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-300 focus:outline-none focus:text-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-500 font-bold block">Blood Group</label>
                  <input
                    type="text"
                    value={patientForm.bloodGroup}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, bloodGroup: e.target.value }))}
                    placeholder="e.g. O+, AB-"
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-500 font-bold block">Allergy Status Summary</label>
                  <input
                    type="text"
                    value={patientForm.allergyStatus}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, allergyStatus: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-zinc-500 font-bold block">Medical History (comma separated)</label>
                  <input
                    type="text"
                    value={patientForm.medicalHistory}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, medicalHistory: e.target.value }))}
                    placeholder="Type-2 Diabetes, Hypertension, Skeletal density"
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-zinc-500 font-bold block">Current Medications (comma separated)</label>
                  <input
                    type="text"
                    value={patientForm.medications}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, medications: e.target.value }))}
                    placeholder="Metformin 500mg, Lisinopril 10mg"
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-zinc-500 font-bold block">Medical Alerts & High-Risk Indicators (comma separated)</label>
                  <input
                    type="text"
                    value={patientForm.medicalAlerts}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, medicalAlerts: e.target.value }))}
                    placeholder="Severe Latex Allergy, Diabetic Microangiopathy"
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-500 font-bold block">Primary Treating Clinician</label>
                  <select
                    value={patientForm.primaryDoctor}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, primaryDoctor: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-300 focus:outline-none focus:text-white"
                  >
                    <option value="Dr. Ahmed">Dr. Ahmed</option>
                    <option value="Dr. Elena Rostova">Dr. Elena Rostova</option>
                    <option value="Dr. Michael Chen">Dr. Michael Chen</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-500 font-bold block">Current Active Treatment Designation</label>
                  <input
                    type="text"
                    value={patientForm.currentTreatment}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, currentTreatment: e.target.value }))}
                    placeholder="e.g. Crown Prep, Digital Veneers"
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-500 font-bold block">AI Risk Level Rating</label>
                  <select
                    value={patientForm.aiRiskFlag}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, aiRiskFlag: e.target.value as any }))}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-300 focus:outline-none focus:text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-zinc-500 font-bold block">Clinical Periodontal / Risk Description</label>
                  <textarea
                    value={patientForm.riskDescription}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, riskDescription: e.target.value }))}
                    rows={2}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-white focus:outline-none focus:border-emerald-500/50 font-sans"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-zinc-500 font-bold block">Profile Executive Summary</label>
                  <textarea
                    value={patientForm.summary}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, summary: e.target.value }))}
                    rows={3}
                    placeholder="Enter comprehensive baseline prosthodontics/periodontal summary..."
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-white focus:outline-none focus:border-emerald-500/50 font-sans"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900/60">
                <button
                  type="button"
                  onClick={() => setIsPatientModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all"
                >
                  {editingPatient ? 'Apply Changes' : 'Register Patient'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ==============================================
         LAUNCH / EDIT CASE MODAL OVERLAY
         ============================================== */}
      {isCaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-zinc-900/80 flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-base font-bold text-white font-mono">
                  {editingCase ? 'Modify Clinical Case Parameters' : 'Launch New Clinical Case Orders'}
                </h3>
                <p className="text-xs text-zinc-400">Configure CAD/CAM models, design queues, and prosthodontics trial parameters.</p>
              </div>
              <button
                onClick={() => setIsCaseModalOpen(false)}
                className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCase} className="p-6 space-y-4 text-xs text-left">
              <div className="space-y-1.5">
                <label className="text-zinc-500 font-bold block">Case Name / Restorative Goal *</label>
                <input
                  type="text"
                  required
                  value={caseForm.name}
                  onChange={(e) => setCaseForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Subgingival Zirconia Bridge #14-16"
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-zinc-500 font-bold block">Case Status Stage</label>
                  <select
                    value={caseForm.status}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-300 focus:outline-none focus:text-white"
                  >
                    <option value="In Design">In Design</option>
                    <option value="Milling">Milling</option>
                    <option value="Sintering">Sintering</option>
                    <option value="Finished">Finished</option>
                    <option value="Delivered">Delivered</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-500 font-bold block">Priority Rating</label>
                  <select
                    value={caseForm.priority}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-300 focus:outline-none focus:text-white"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-500 font-bold block">Assigned Clinician</label>
                  <input
                    type="text"
                    value={caseForm.clinician}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, clinician: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-500 font-bold block">Active Design Substage</label>
                  <input
                    type="text"
                    value={caseForm.stage}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, stage: e.target.value }))}
                    placeholder="e.g. Sintering Calibration"
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-500 font-bold block">Progress Course %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={caseForm.progress}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, progress: Number(e.target.value) }))}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-500 font-bold block">Due Date Deadline</label>
                  <input
                    type="date"
                    value={caseForm.dueDate}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-500 font-bold block">Technical & SOAP Notes</label>
                <textarea
                  value={caseForm.notes}
                  onChange={(e) => setCaseForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="Describe scan file statuses, marginal parameters, or custom implant torque values..."
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-white focus:outline-none focus:border-emerald-500/50 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900/60">
                <button
                  type="button"
                  onClick={() => setIsCaseModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all"
                >
                  {editingCase ? 'Apply Changes' : 'Launch Case'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ======================================================
         PERSISTENT FLOATING AI COPILOT TRIGGER & SIDEBAR
         ====================================================== */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          id="floating-ai-button"
          onClick={() => setIsCopilotSidebarOpen(!isCopilotSidebarOpen)}
          className="flex h-12 items-center gap-2 px-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-xl shadow-purple-600/30 active:scale-95 animate-pulse"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Clinical Copilot</span>
        </button>
      </div>

      <CopilotSidebar
        isOpen={isCopilotSidebarOpen}
        onClose={() => setIsCopilotSidebarOpen(false)}
        activePatientName={activePatient.name}
        messages={copilotSidebarMessages}
        loading={copilotSidebarLoading}
        onSendMessage={(msg: string) => {
          setCopilotSidebarInput(msg);
          // Small delay to allow state update before sending
          setTimeout(() => handleSendCopilotSidebarMessage(), 0);
        }}
        input={copilotSidebarInput}
        onInputChange={setCopilotSidebarInput}
      />
    </div>
  );
}
