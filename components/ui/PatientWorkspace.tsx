'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
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
  Zap
} from 'lucide-react';

// Interfaces
interface Patient {
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
    ]
  }
];

export default function PatientWorkspace() {
  const router = useRouter();
  const params = useParams();
  const selectedPatientId = (params?.id as string | undefined) || null;

  // Page states
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'New' | 'Under Treatment' | 'Completed'>('All');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [workspaceTab, setWorkspaceTab] = useState<'overview' | 'timeline' | 'appointments' | 'treatment' | 'dental-chart' | 'prosthodontics' | 'implants' | 'laboratory' | 'imaging' | 'notes' | 'files' | 'billing' | 'ai'>('overview');

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

  // AI assistant simulation state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');

  // Selected Patient Details helper
  const activePatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // Set initial dental chart states for the patient when they change
  useEffect(() => {
    if (activePatient) {
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
    }
  }, [selectedPatientId, activePatient]);

  // Filters logic
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          patient.currentTreatment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      setActiveClinicalNote(`S: Patient Arthur Pendragon presents for full crown preparations on teeth #11, #12, and #21. Medical clearance for Type II Diabetes received and verified.

O: Administered 1 carpule of 2% Lidocaine with 1:100k Epinephrine. Prep margins placed 0.5mm subgingivally with 1.2mm radial chamfer design. Cord #00 packed. High-definition intraoral scan with Trios 5 completed. Vita shade guide selection matched at OM1 bleach.

A: Teeth #11, #12, #21 prepared successfully, sound margins, excellent tissue management, zero bleeding post-cord.

P: Fabricated PMMA provisionals, cemented with TempBond. Sent 3Shape STL scans to milling queue for high-translucency Zirconia crown sintering. Patient scheduled for final delivery in 7 days.`);
    } else if (type === 'implant') {
      setNoteTitle("Implant Surgical Consultation (#36) - SOAP Note");
      setActiveClinicalNote(`S: Patient Bruce Wayne here for #36 implant planning. History of severe nocturnal bruxism discussed.

O: CBCT analyzed. Available bone height is 12.8mm, width 6.4mm. Density verified as D2. Guided surgical template planned using Exocad STL/CBCT merger.

A: Ideal site for Straumann BLActive 4.1x10mm implant. Low surgical risk, bone volume is optimal.

P: Surgical guide sent to SprintRay printing queue. Schedule implant placement with torque target 35 Ncm. Issue custom heavy-duty nocturnal occlusal guard post-restoration.`);
    } else if (type === 'veneer') {
      setNoteTitle("Veneer Smile Design Try-in - SOAP Note");
      setActiveClinicalNote(`S: Patient Clara Oswald here for evaluation of digital smile design mock-up for veneers 13-23.

O: PMMA physical aesthetic mock-up placed on un-prepped arches. Patient evaluated in mirror and under photostudio lighting. Verified phonetics and smile harmony.

A: Highly harmonious integration. Patient requests slight roundness of distal incisal angles on #11 and #21. High-precision modifications logged.

P: Adjusted Exocad modeling files to incorporate rounding. Exported final restoration specifications to 3Shape lab system for zirconia multi-unit milling.`);
    }
  };

  // AI Prompt Trigger
  const triggerAiCopilot = (promptText: string) => {
    setAiLoading(true);
    setAiPrompt(promptText);
    setAiOutput(null);

    setTimeout(() => {
      setAiLoading(false);
      if (promptText.includes("Summarize Patient")) {
        setAiOutput(`### AI Clinical Case Summary
**Patient:** ${activePatient.name} (${activePatient.id})
**Primary Diagnosis:** Advanced Prosthodontic Rehabilitation - ${activePatient.currentTreatment}
**Medical Risk Alerts:** ${activePatient.allergyStatus} • ${activePatient.medicalAlerts.join(", ")}

**Prosthodontic Evaluation:**
- Virtual articulation matches excellent posterior support but compromised anterior guidance.
- CBCT reveals localized horizontal bone loss in maxillary anterior zone.
- Active design utilizing Exocad with ${activePatient.id === "PTS-9412" ? "Vita OM1 Ultra-Bleach" : "A1 Classic Shade"} values.

**AI Recommendations:**
1. Maintain strict 0.5mm subgingival margin placement in anterior to avoid violation of biological width.
2. In-house milling queue: Monitor sintering density on high-translucency Zirconia blocks.
3. Diabetic metabolic status requires meticulous post-op hygiene; scheduling scaling and maintenance profile every 3 months instead of 6.`);
      } else if (promptText.includes("Risk Analysis")) {
        setAiOutput(`### AI Clinical Risk Profile
**Complexity Rating:** ${activePatient.aiRiskFlag === 'High' ? '🔴 HIGH RISK PROFILE' : activePatient.aiRiskFlag === 'Medium' ? '🟡 MEDIUM RISK PROFILE' : '🟢 LOW RISK PROFILE'}

**Identified Risk Vectors:**
1. **Systemic:** ${activePatient.medicalAlerts.join(" / ")}.
2. **Structural:** Biomechanical load warning due to potential nocturnal bruxism habits (${activePatient.name === "Bruce Wayne" ? "High Risk" : "Moderate Risk"}).
3. **Biological:** Potential delay in soft-tissue healing and mucosal response.

**Mitigation Protocol:**
- Proactively prescribe Chlorhexidine 0.12% oral rinse starting 3 days pre-op.
- Configure milling software to augment central groove and marginal ridge thickness by +0.15mm to absorb high nocturnal load.
- Ensure temporary PMMA provisional is kept in light occlusion during osseointegration period.`);
      } else if (promptText.includes("Treatment Suggestions")) {
        setAiOutput(`### AI Treatment Design Suggestions
**Current Strategy:** ${activePatient.currentTreatment}
**Recommended Prosthodontic Modifications:**
- **Material Selection:** Layered high-translucency Zirconia for optimum aesthetics paired with structural durability (1200 MPa core).
- **Abutment Parameter:** Custom Titanium or Zirconia-on-Titanium base abutment with an angle compensation of 15° for ideal screw-channel exit.
- **Occlussal Scheme:** Mutual protective occlusion with canine guidance. Avoid group function to spare implants from lateral stresses.`);
      } else if (promptText.includes("Generate Lab Prescription")) {
        setAiOutput(`### AI-Generated Digital Laboratory Prescription
**Laboratory:** HealthOS In-House Dental Milling Node 1
**Technician Workspace:** Exocad & 3Shape Integrated Orders
**Patient ID:** ${activePatient.id} • ${activePatient.name}

**Prescription Parameters:**
- **Restoration Type:** Fixed Full Arch Implant Bridge (Maxillary)
- **Framework Material:** Sintered Translucent Multilayer Zirconia (Zirconia Cases)
- **Substructure:** PMMA Provisional Test Drive completed and scanned
- **Shade Specification:** Vita System 3D-Master: 1M1 / OM1 Bleach, light incisal halo translucency.
- **Margin Configuration:** 360-degree radial chamfer, 1.2mm depth.
- **Milling Mode:** Ultra-Precision 5-Axis wet milling (Milling Queue Node B)
- **Attachments:** Exocad design STL model linked: \`upper_arch_refined_design_v3.stl\``);
      }
    }, 1200);
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
                <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-lg shadow-emerald-500/10">
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
                      <th className="py-3 px-4">Patient ID</th>
                      <th className="py-3 px-4">Full Name</th>
                      <th className="py-3 px-4">Age / Gender</th>
                      <th className="py-3 px-4">Primary Doctor</th>
                      <th className="py-3 px-4">Current Treatment</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Next Appointment</th>
                      <th className="py-3 px-4">AI Risk Flag</th>
                      <th className="py-3 px-4 text-right">Workspace</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/50">
                    {filteredPatients.map((pat) => (
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
                        {/* Next Appointment */}
                        <td className="py-3.5 px-4 text-xs text-zinc-300">
                          <span className="font-mono text-[11px] truncate block max-w-[180px]">{pat.nextAppointment}</span>
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
                        {/* Arrow */}
                        <td className="py-3.5 px-4 text-right">
                          <button className="p-1 rounded-lg text-zinc-500 group-hover:text-white transition-colors">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* --- CARD GRID VIEW --- */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPatients.map((pat) => (
                  <div
                    key={pat.id}
                    onClick={() => router.push(`/patients/${pat.id}`)}
                    className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800/80 transition-all hover:bg-zinc-900/50 cursor-pointer flex flex-col justify-between gap-4"
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
                            <h4 className="text-sm font-bold text-white leading-tight">{pat.name}</h4>
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
                      <span className={`inline-flex items-center gap-1 text-[9px] font-mono font-medium ${
                        pat.aiRiskFlag === 'High' ? 'text-red-400' : 'text-zinc-400'
                      }`}>
                        AI Risk Flag: <span className="font-semibold text-white">{pat.aiRiskFlag}</span>
                      </span>
                      <span className="text-xs text-emerald-400 flex items-center font-semibold">
                        Open Workspace <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </span>
                    </div>
                  </div>
                ))}
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

                    {/* TIMELINE TAB */}
                    {workspaceTab === 'timeline' && (
                      <motion.div
                        key="tab-timeline"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-6"
                      >
                        <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/20 space-y-4">
                          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                            <div>
                              <h3 className="text-sm font-bold text-white">Longitudinal Clinical History & Event Log</h3>
                              <p className="text-xs text-zinc-400">Chronological history of scans, designs, mockups, and surgical interventions.</p>
                            </div>
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                              Real-time Sync
                            </span>
                          </div>

                          <div className="space-y-6 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-850">
                            {activePatient.timeline.map((item, idx) => (
                              <div key={idx} className="relative space-y-2 bg-zinc-950/30 p-4 rounded-xl border border-zinc-900/60 hover:border-zinc-800 transition-all">
                                <span className="absolute -left-[23px] top-4 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-zinc-950" />
                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white">{item.title}</span>
                                    <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 uppercase tracking-wider">{item.category}</span>
                                  </div>
                                  <span className="text-[10px] font-mono text-zinc-500">{item.date}</span>
                                </div>
                                <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
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
                        <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/20 space-y-4">
                          <div className="flex justify-between items-start border-b border-zinc-900 pb-3">
                            <div>
                              <h3 className="text-sm font-bold text-white">Full-Arch Restorative Treatment Plan #TX-902</h3>
                              <p className="text-xs text-zinc-400">Targeting Maxillary Rehabilitation & Anterior Veneer Harmony.</p>
                            </div>
                            <span className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold">
                              Active Plan
                            </span>
                          </div>

                          {/* Phase Steps */}
                          <div className="space-y-4">
                            {[
                              { phase: "Phase 1: Diagnostic Modeling", status: "100% Completed", details: "3Shape intraoral impression scans, high-resolution maxillary CBCT, 12-angle facial portraits, and Digital Smile Design mockup approval.", active: false },
                              { phase: "Phase 2: Preparations & Temporization", status: "In Progress (Active)", details: "Full-crown preparations on teeth #11, #12, #21. Immediate fabrication of custom PMMA aesthetic temporaries.", active: true },
                              { phase: "Phase 3: Sintering & Laboratory Execution", status: "Awaiting Prep Dispatch", details: "Milling and hand-finishing of custom multilayer monolithic Zirconia bridges. Color stain adjustments matched to Vita OM1.", active: false },
                              { phase: "Phase 4: Final Bonding & Occlusal Balance", status: "Pending Delivery", details: "Adhesive cementation of final anterior restorations. T-Scan digital occlusal evaluation for stress balancing.", active: false }
                            ].map((step, idx) => (
                              <div key={idx} className={`p-4 rounded-xl border transition-colors ${
                                step.active 
                                  ? 'bg-zinc-900/50 border-emerald-500/40 shadow-lg shadow-emerald-500/5' 
                                  : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800'
                              }`}>
                                <div className="flex justify-between items-center mb-1.5">
                                  <h4 className="text-xs font-bold text-white">{step.phase}</h4>
                                  <span className={`text-[10px] font-mono font-semibold ${
                                    step.status.includes('Completed') 
                                      ? 'text-emerald-400' 
                                      : step.active 
                                        ? 'text-purple-400 animate-pulse' 
                                        : 'text-zinc-500'
                                  }`}>
                                    {step.status}
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-400 leading-normal">{step.details}</p>
                              </div>
                            ))}
                          </div>

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
                              <div className="flex justify-center gap-2 overflow-x-auto py-2">
                                {[18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28].map((t) => {
                                  const status = teethStatuses[t] || 'sound';
                                  return (
                                    <button
                                      key={t}
                                      onClick={() => toggleToothState(t)}
                                      className={`w-9 h-14 rounded-lg flex flex-col justify-between items-center p-1.5 border transition-all ${
                                        status === 'prep' 
                                          ? 'bg-amber-500/10 border-amber-500 text-amber-300' 
                                          : status === 'restored' 
                                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300' 
                                            : status === 'implant' 
                                              ? 'bg-blue-500/10 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10'
                                              : status === 'missing'
                                                ? 'bg-zinc-950 border-dashed border-zinc-800 text-zinc-600 opacity-40'
                                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                      }`}
                                    >
                                      <span className="text-[8px] font-mono block text-center font-bold">{t}</span>
                                      <div className="w-4.5 h-4.5 rounded-full bg-zinc-950/40 border border-zinc-800/40 flex items-center justify-center font-bold text-[9px]">
                                        {status === 'sound' && 'S'}
                                        {status === 'prep' && 'P'}
                                        {status === 'restored' && 'C'}
                                        {status === 'implant' && 'I'}
                                        {status === 'missing' && 'X'}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* LOWER ARCH (48 to 38) */}
                            <div className="space-y-2">
                              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Lower Mandibular Arch</h4>
                              <div className="flex justify-center gap-2 overflow-x-auto py-2">
                                {[48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38].map((t) => {
                                  const status = teethStatuses[t] || 'sound';
                                  return (
                                    <button
                                      key={t}
                                      onClick={() => toggleToothState(t)}
                                      className={`w-9 h-14 rounded-lg flex flex-col justify-between items-center p-1.5 border transition-all ${
                                        status === 'prep' 
                                          ? 'bg-amber-500/10 border-amber-500 text-amber-300' 
                                          : status === 'restored' 
                                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300' 
                                            : status === 'implant' 
                                              ? 'bg-blue-500/10 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10'
                                              : status === 'missing'
                                                ? 'bg-zinc-950 border-dashed border-zinc-800 text-zinc-600 opacity-40'
                                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                      }`}
                                    >
                                      <div className="w-4.5 h-4.5 rounded-full bg-zinc-950/40 border border-zinc-800/40 flex items-center justify-center font-bold text-[9px]">
                                        {status === 'sound' && 'S'}
                                        {status === 'prep' && 'P'}
                                        {status === 'restored' && 'C'}
                                        {status === 'implant' && 'I'}
                                        {status === 'missing' && 'X'}
                                      </div>
                                      <span className="text-[8px] font-mono block text-center font-bold">{t}</span>
                                    </button>
                                  );
                                })}
                              </div>
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
                        className="space-y-4"
                      >
                        <div className="bg-zinc-900/20 p-4 rounded-xl border border-zinc-900 flex justify-between items-center">
                          <div>
                            <h3 className="text-sm font-bold text-white">Digital Dental Imaging PACS Hub</h3>
                            <p className="text-xs text-zinc-400">Retrieve radiological scans, STL models, and aesthetic smile photographs.</p>
                          </div>
                          <button className="px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5" /> Upload Scan
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          
                          {/* CBCT */}
                          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 flex flex-col justify-between gap-4">
                            <div className="space-y-2">
                              <span className="text-[8px] font-mono uppercase text-pink-400 bg-pink-500/10 px-2 py-0.5 border border-pink-500/20 rounded-full">CBCT Radiograph</span>
                              <h4 className="text-xs font-bold text-white">Maxillary CBCT Double Arch (High-Res)</h4>
                              <p className="text-[10px] text-zinc-500 leading-normal">Slice evaluation: 12.8mm alveolar ridge width, bone density verified. Zero pathologies detected.</p>
                            </div>
                            <div className="h-28 bg-zinc-900 rounded-lg border border-zinc-850 flex items-center justify-center relative overflow-hidden group">
                              <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 opacity-80" />
                              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-500/30 animate-pulse" />
                              <span className="text-[10px] text-zinc-500 font-mono uppercase z-10">CBCT Cross Section slice</span>
                            </div>
                            <button className="w-full py-1.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[11px] font-semibold text-zinc-300">
                              Launch DICOM Viewer
                            </button>
                          </div>

                          {/* STL Files */}
                          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 flex flex-col justify-between gap-4">
                            <div className="space-y-2">
                              <span className="text-[8px] font-mono uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded-full">STL Model</span>
                              <h4 className="text-xs font-bold text-white">3Shape Maxillary Arch Scan STL</h4>
                              <p className="text-[10px] text-zinc-500 leading-normal">High precision mesh file. Standard STL format optimized for Exocad restoration parameters.</p>
                            </div>
                            <div className="h-28 bg-zinc-900 rounded-lg border border-zinc-850 flex items-center justify-center relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950/80" />
                              <Activity className="w-8 h-8 text-emerald-500/40 animate-pulse" />
                              <span className="absolute bottom-2 left-2 text-[9px] text-zinc-500 font-mono">Mesh points: 48,290</span>
                            </div>
                            <button className="w-full py-1.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[11px] font-semibold text-zinc-300">
                              Render 3D Mesh
                            </button>
                          </div>

                          {/* Smile Photos */}
                          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 flex flex-col justify-between gap-4">
                            <div className="space-y-2">
                              <span className="text-[8px] font-mono uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 border border-blue-500/20 rounded-full">Smile Portrait</span>
                              <h4 className="text-xs font-bold text-white">12-Angle Aesthetic Smile Portfolio</h4>
                              <p className="text-[10px] text-zinc-500 leading-normal">High-fidelity photos showing facial symmetry, smile lines, and lateral incisal harmony.</p>
                            </div>
                            <div className="h-28 bg-zinc-900 rounded-lg border border-zinc-850 overflow-hidden relative group">
                              <Image
                                src={activePatient.photoUrl}
                                alt="Smile photo"
                                fill
                                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent" />
                              <span className="absolute bottom-2 left-2 text-[9px] text-zinc-300 font-mono">12 Canon raw shots</span>
                            </div>
                            <button className="w-full py-1.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[11px] font-semibold text-zinc-300">
                              Open Photostudio Gallery
                            </button>
                          </div>

                          {/* Intraoral Photos */}
                          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 flex flex-col justify-between gap-4">
                            <div className="space-y-2">
                              <span className="text-[8px] font-mono uppercase text-purple-400 bg-purple-500/10 px-2 py-0.5 border border-purple-500/20 rounded-full">Intraoral Photos</span>
                              <h4 className="text-xs font-bold text-white">Pre-op Quadrant Macrophotography</h4>
                              <p className="text-[10px] text-zinc-500 leading-normal">High definition dental macro shots capturing occlusal topography, cracks, and pre-existing restorations.</p>
                            </div>
                            <div className="h-28 bg-zinc-900 rounded-lg border border-zinc-850 flex items-center justify-center relative overflow-hidden">
                              <ImageIcon className="w-8 h-8 text-purple-500/40" />
                              <span className="text-[10px] text-zinc-500 font-mono z-10">4 Macro JPGs</span>
                            </div>
                            <button className="w-full py-1.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[11px] font-semibold text-zinc-300">
                              View Macro Images
                            </button>
                          </div>

                          {/* DICOM Imports */}
                          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 flex flex-col justify-between gap-4">
                            <div className="space-y-2">
                              <span className="text-[8px] font-mono uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 border border-amber-500/20 rounded-full">PACS Imports</span>
                              <h4 className="text-xs font-bold text-white">DICOM Multi-slice CT Stream</h4>
                              <p className="text-[10px] text-zinc-500 leading-normal">Standardized medical imaging stream containing axial slices. Mapped directly to central PACS node.</p>
                            </div>
                            <div className="h-28 bg-zinc-900 rounded-lg border border-zinc-850 flex items-center justify-center relative overflow-hidden">
                              <HardDrive className="w-8 h-8 text-amber-500/40" />
                              <span className="text-[10px] text-zinc-500 font-mono z-10">Stream Code: PACS-9921</span>
                            </div>
                            <button className="w-full py-1.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[11px] font-semibold text-zinc-300">
                              Review Import Logs
                            </button>
                          </div>

                        </div>
                      </motion.div>
                    )}

                    {/* CLINICAL NOTES TAB */}
                    {workspaceTab === 'notes' && (
                      <motion.div
                        key="tab-notes"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                      >
                        <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/20 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
                            <div>
                              <h3 className="text-sm font-bold text-white">Add New SOAP Clinical Note</h3>
                              <p className="text-xs text-zinc-400">Utilize digital prosthodontic templates to pre-fill standard SOAP documentation.</p>
                            </div>
                            
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                onClick={() => applySoapTemplate('crown')}
                                className="px-2.5 py-1 rounded bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-[10px] font-semibold text-zinc-300"
                              >
                                + Crown Prep Template
                              </button>
                              <button
                                onClick={() => applySoapTemplate('implant')}
                                className="px-2.5 py-1 rounded bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-[10px] font-semibold text-zinc-300"
                              >
                                + Implant Consult Template
                              </button>
                              <button
                                onClick={() => applySoapTemplate('veneer')}
                                className="px-2.5 py-1 rounded bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-[10px] font-semibold text-zinc-300"
                              >
                                + Veneer Design Template
                              </button>
                            </div>
                          </div>

                          {/* Form inputs */}
                          <div className="space-y-3.5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-zinc-500">Note Title</label>
                                <input
                                  type="text"
                                  value={noteTitle}
                                  onChange={(e) => setNoteTitle(e.target.value)}
                                  placeholder="E.g., Crown preparation progress..."
                                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-zinc-500">Clinical Attending Operator</label>
                                <input
                                  type="text"
                                  readOnly
                                  value={activePatient.primaryDoctor}
                                  className="w-full px-3 py-2 bg-zinc-950/60 border border-zinc-900 rounded-xl text-xs text-zinc-500 focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-bold text-zinc-500">Clinical SOAP Text</label>
                              <textarea
                                rows={8}
                                value={activeClinicalNote}
                                onChange={(e) => setActiveClinicalNote(e.target.value)}
                                placeholder="Start writing clinical notes, or apply template above..."
                                className="w-full p-4 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50 font-mono leading-relaxed"
                              />
                            </div>

                            <div className="flex justify-end gap-2.5 pt-2">
                              <button
                                onClick={() => { setActiveClinicalNote(''); setNoteTitle(''); }}
                                className="px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-xs text-zinc-400 hover:text-white"
                              >
                                Reset Form
                              </button>
                              <button
                                onClick={handleAddClinicalNote}
                                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-lg shadow-emerald-500/10"
                              >
                                Save to Patient Timeline
                              </button>
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
                        
                        {/* Drag and drop uploader box */}
                        <div
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                          className={`p-8 rounded-2xl border-2 border-dashed text-center space-y-3 transition-all ${
                            dragActive 
                              ? 'border-emerald-500 bg-emerald-500/5' 
                              : 'border-zinc-800 bg-zinc-900/10 hover:border-zinc-700'
                          }`}
                        >
                          <div className="inline-flex items-center justify-center p-3 rounded-full bg-zinc-900 text-zinc-400">
                            <HardDrive className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-white">Drag & Drop Scan or Case Files</h4>
                            <p className="text-[10px] text-zinc-500">Supports STL mesh files, CBCT DICOM (.dcm), smile JPGs, or clinical PDFs up to 500MB.</p>
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
                                    const newFile = {
                                      name: file.name,
                                      size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
                                      type: "Uploaded File",
                                      date: "2026-07-17"
                                    };
                                    setUploadedFiles(prev => [newFile, ...prev]);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {/* Files table database */}
                        <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4">
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-zinc-900 pb-2">EHR Case Files Database</h3>
                          
                          <div className="space-y-2.5">
                            {uploadedFiles.map((file, idx) => (
                              <div key={idx} className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-900 flex items-center justify-between gap-3 hover:border-zinc-800 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded bg-zinc-900 text-zinc-400">
                                    <FileText className="w-4.5 h-4.5" />
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-white leading-tight">{file.name}</h4>
                                    <p className="text-[10px] text-zinc-500 font-mono">{file.type} • {file.size} • Uploaded {file.date}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button className="px-2.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[10px] font-semibold text-zinc-300">
                                    Download
                                  </button>
                                  <button
                                    onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                                    className="p-1.5 rounded text-zinc-600 hover:text-red-400 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                        </div>

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
                        
                        <div className="p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/20 via-zinc-900/40 to-zinc-900/40 space-y-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-widest">
                              AI Copilot Core Active
                            </span>
                            <span className="text-zinc-500">•</span>
                            <span className="text-xs text-zinc-400">Dental Prosthodontics Decision Support</span>
                          </div>

                          <h3 className="text-lg font-bold text-white tracking-tight">Generate Instant Dental Clinical Reports</h3>
                          <p className="text-xs text-zinc-400">Select an AI prompt query below. Our algorithms parse patient radiographs, medical histories, and active 3Shape restorations to output safe, high-aesthetic suggestions.</p>

                          {/* Quick action prompts */}
                          <div className="flex flex-wrap gap-2 pt-2">
                            <button
                              onClick={() => triggerAiCopilot("Summarize Patient Clinical Baseline")}
                              className="px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-xs font-semibold text-purple-300 flex items-center gap-1.5 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" /> Summarize Patient Profile
                            </button>
                            <button
                              onClick={() => triggerAiCopilot("Risk Analysis and Mitigation Strategy")}
                              className="px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-xs font-semibold text-purple-300 flex items-center gap-1.5 transition-colors"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" /> Risk Analysis & Bruising
                            </button>
                            <button
                              onClick={() => triggerAiCopilot("Suggest Treatment Modifications & Materials")}
                              className="px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-xs font-semibold text-purple-300 flex items-center gap-1.5 transition-colors"
                            >
                              <Stethoscope className="w-3.5 h-3.5" /> Suggest Materials & Shade
                            </button>
                            <button
                              onClick={() => triggerAiCopilot("Generate Lab Sintering Prescription")}
                              className="px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-xs font-semibold text-purple-300 flex items-center gap-1.5 transition-colors"
                            >
                              <FlaskConical className="w-3.5 h-3.5" /> Generate Lab Prescription
                            </button>
                          </div>
                        </div>

                        {/* AI Output Terminal panel */}
                        <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-950/80 space-y-4">
                          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Copilot Processing Terminal</span>
                            {aiLoading && (
                              <span className="text-[10px] text-purple-400 font-mono animate-pulse flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 animate-spin" /> SIFTING METADATA...
                              </span>
                            )}
                          </div>

                          {aiLoading ? (
                            <div className="py-12 flex flex-col items-center justify-center space-y-3">
                              <div className="w-8 h-8 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                              <p className="text-xs text-zinc-500 font-mono">AI Copilot checking Exocad margin mesh and clinical diabetic markers...</p>
                            </div>
                          ) : aiOutput ? (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-xs text-zinc-300 space-y-4 font-mono leading-relaxed bg-zinc-900/30 p-5 rounded-xl border border-zinc-900/60"
                            >
                              {/* Markdown Simulation Render */}
                              <div className="space-y-3 whitespace-pre-line text-zinc-300">
                                {aiOutput}
                              </div>
                            </motion.div>
                          ) : (
                            <div className="py-16 text-center space-y-3">
                              <Sparkles className="w-7 h-7 text-zinc-700 mx-auto" />
                              <div className="space-y-1">
                                <h4 className="text-xs font-bold text-zinc-400">Ready to Assist</h4>
                                <p className="text-[10px] text-zinc-600 max-w-xs mx-auto">Click any of the pre-set prompts above to generate interactive high-end digital dentistry analysis.</p>
                              </div>
                            </div>
                          )}
                        </div>

                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
