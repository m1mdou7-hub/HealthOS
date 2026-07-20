'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Layers,
  Search,
  Grid,
  List,
  Clock,
  Sparkles,
  Bookmark,
  Plus,
  Trash2,
  Sliders,
  Settings,
  Shield,
  Download,
  Eye,
  Activity,
  Heart,
  Maximize2,
  ChevronRight,
  SlidersHorizontal,
  RotateCw,
  TrendingUp,
  FileCheck,
  Zap,
  Info,
  Check,
  FileText,
  MousePointerClick,
  Ruler,
  Maximize,
  CheckSquare,
  Sparkle,
  Calendar,
  User,
  ExternalLink,
  ChevronDown,
  Lock,
  Compass,
  Database,
  Flame,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Cpu,
  Boxes,
  FileSpreadsheet,
  FileArchive,
  Wrench,
  Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';

// --- ENTERPRISE LAB CASE INTERFACE ---
interface LabComment {
  id: string;
  author: string;
  role: string;
  text: string;
  date: string;
}

interface LabFile {
  id: string;
  name: string;
  size: string;
  type: string;
  version: string;
  status: 'Verified' | 'Pending Checksum' | 'Corrupt';
}

interface CadMeasurement {
  id: string;
  name: string;
  value: string;
  status: 'Ideal' | 'Warning' | 'Pass';
  nominal: string;
}

interface LabCase {
  id: string;
  patientName: string;
  doctorName: string;
  technicianName: string;
  procedure: string;
  shade: string;
  material: string;
  priority: 'Urgent' | 'High' | 'Standard' | 'Low';
  status: 'In Design' | 'Milling' | 'Printing' | 'Sintering' | 'Finished' | 'Delivered' | 'Pending Files';
  dueDate: string;
  createdDate: string;
  instructions: string;
  prepType: string;
  shadeSystem: string;
  avatarColor: string;
  progressPercent: number;
  files: LabFile[];
  comments: LabComment[];
  measurements: CadMeasurement[];
  software: 'Exocad Rijeka' | '3Shape Dental System 2024';
  designVersion: string;
  stumpShade: string;
  implantHex: string;
}

// --- REALISTIC ENTERPRISE MOCK LAB CASES ---
const INITIAL_LAB_CASES: LabCase[] = [
  {
    id: 'CAD-1049',
    patientName: 'Amelia Vance',
    doctorName: 'Dr. Robert Carter',
    technicianName: 'Marcus Sterling',
    procedure: 'Tooth #11 Anterior Single Crown',
    shade: 'A2 Body, OM3 Incisal Halo',
    material: 'IPS e.max CAD Lithium Disilicate',
    priority: 'Urgent',
    status: 'In Design',
    dueDate: '2026-07-17 18:00',
    createdDate: '2026-07-16 08:30',
    prepType: '1.2mm Shoulder Shoulderless Prep',
    shadeSystem: 'VITA Classical',
    stumpShade: 'ND4',
    implantHex: 'N/A (Natural tooth abutment)',
    avatarColor: 'from-rose-500 to-amber-500',
    progressPercent: 35,
    software: 'Exocad Rijeka',
    designVersion: 'v3.2_final_margin',
    instructions: 'Patient has extremely translucent incisal edges. Replicate high-translucency halo on the incisal third of #11 to match tooth #21 exactly. Avoid grayness. Crown margins must stay subgingival by 0.2mm on facial.',
    files: [
      { id: 'f-1', name: 'upper_arch_prep_11.stl', size: '42.5 MB', type: 'STL Scan', version: 'v1.2', status: 'Verified' },
      { id: 'f-2', name: 'lower_arch_antagonist.stl', size: '38.1 MB', type: 'STL Scan', version: 'v1.1', status: 'Verified' },
      { id: 'f-3', name: 'buccal_bite_registration.stl', size: '12.4 MB', type: 'STL Scan', version: 'v1.0', status: 'Verified' },
      { id: 'f-4', name: 'anterior_preop_waxup.stl', size: '22.0 MB', type: 'STL Scan', version: 'v2.1', status: 'Verified' },
      { id: 'f-5', name: 'patient_facial_smile.jpg', size: '4.8 MB', type: 'JPEG Image', version: 'v1.0', status: 'Verified' },
      { id: 'f-6', name: 'cbct_segmented_maxilla.dcm', size: '112.5 MB', type: 'DICOM File', version: 'v1.0', status: 'Verified' },
      { id: 'f-7', name: 'laboratory_prescription_signed.pdf', size: '1.2 MB', type: 'PDF Document', version: 'v1.0', status: 'Verified' }
    ],
    comments: [
      { id: 'c-1', author: 'Dr. Robert Carter', role: 'Clinician', text: 'This patient is a high-demand cosmetic case. Please use IPS e.max CAD with manual stain and glaze for best aesthetics. Patient was highly concerned about matches to #21.', date: '2026-07-16 08:35' },
      { id: 'c-2', author: 'Marcus Sterling', role: 'Senior Ceramist', text: 'Scans loaded. Preparation margin line verified, sharp and clear. Creating virtual design with a 15-micron cement space spacer starting 1.0mm from prep margin.', date: '2026-07-16 11:10' }
    ],
    measurements: [
      { id: 'm-1', name: 'Minimum Material Thickness', value: '0.85 mm', status: 'Pass', nominal: '>= 0.80 mm' },
      { id: 'm-2', name: 'Marginal Gap Clearance', value: '11.2 μm', status: 'Ideal', nominal: '<= 25 μm' },
      { id: 'm-3', name: 'Interproximal Contact strength (Mesial)', value: '85 N', status: 'Pass', nominal: '50N - 100N' },
      { id: 'm-4', name: 'Ocusal Dynamic Clearance', value: '1.45 mm', status: 'Pass', nominal: '>= 1.20 mm' }
    ]
  },
  {
    id: 'CAD-1050',
    patientName: 'Richard Hendricks',
    doctorName: 'Dr. Elena Rostova',
    technicianName: 'Yuri Gagarin',
    procedure: 'Tooth #30 Monolithic Full Molar Crown',
    shade: 'A3 Body',
    material: 'Zirconia Multi-Layer High Translucency',
    priority: 'High',
    status: 'Milling',
    dueDate: '2026-07-18 12:00',
    createdDate: '2026-07-15 10:15',
    prepType: '0.8mm Chamfer Prep',
    shadeSystem: 'VITA Classical',
    stumpShade: 'ND3',
    implantHex: 'N/A',
    avatarColor: 'from-emerald-500 to-cyan-500',
    progressPercent: 65,
    software: '3Shape Dental System 2024',
    designVersion: 'v2.1_milling_nest',
    instructions: 'Severe bruxer. Ensure minimal occlusal clearance does not drop below 1.2mm. Make occlusal fissures deep but smooth for easy self-cleansing. Monolithic Katana zirconia block recommendation.',
    files: [
      { id: 'f-8', name: 'lower_mandibular_prep_30.stl', size: '44.8 MB', type: 'STL Scan', version: 'v1.1', status: 'Verified' },
      { id: 'f-9', name: 'upper_antagonist.stl', size: '39.0 MB', type: 'STL Scan', version: 'v1.0', status: 'Verified' },
      { id: 'f-10', name: 'bite_buccal_lock.stl', size: '11.5 MB', type: 'STL Scan', version: 'v1.0', status: 'Verified' }
    ],
    comments: [
      { id: 'c-3', author: 'Dr. Elena Rostova', role: 'Clinician', text: 'This patient has previously fractured standard e.max on #30. High-strength monolithic zirconia required. Do not compromise thickness.', date: '2026-07-15 10:20' },
      { id: 'c-4', author: 'Yuri Gagarin', role: 'CAD Specialist', text: 'Design approved, nested on Katana Multi-layer 14mm Zirconia disk. Toolpaths computed for 5-axis Roland mill.', date: '2026-07-16 16:30' }
    ],
    measurements: [
      { id: 'm-5', name: 'Minimum Material Thickness', value: '1.35 mm', status: 'Ideal', nominal: '>= 1.00 mm' },
      { id: 'm-6', name: 'Marginal Gap Clearance', value: '14.0 μm', status: 'Ideal', nominal: '<= 25 μm' },
      { id: 'm-7', name: 'Occlusal Contact Force', value: '120 N', status: 'Warning', nominal: '50N - 100N' }
    ]
  },
  {
    id: 'CAD-1051',
    patientName: 'Selina Kyle',
    doctorName: 'Dr. Victor Fries',
    technicianName: 'Anya Chalotra',
    procedure: 'Teeth #8, #9 Aesthetic Veneers',
    shade: 'BL1 bleach shade',
    material: 'IPS e.max Press Ceramic',
    priority: 'Standard',
    status: 'Printing',
    dueDate: '2026-07-20 15:00',
    createdDate: '2026-07-14 14:22',
    prepType: '0.3mm Ultra-thin Veneer Prep',
    shadeSystem: 'VITA 3D-Master',
    stumpShade: 'ND2',
    implantHex: 'N/A',
    avatarColor: 'from-indigo-500 to-purple-500',
    progressPercent: 80,
    software: 'Exocad Rijeka',
    designVersion: 'v4.1_printed_wax',
    instructions: 'Aesthetic smile upgrade. Patient wants BL1 high value bleach result. Minimally invasive preparation. Create extremely thin wax-up for 3D printing and hot pressing.',
    files: [
      { id: 'f-11', name: 'prep_arch_veneers.stl', size: '51.2 MB', type: 'STL Scan', version: 'v2.0', status: 'Verified' },
      { id: 'f-12', name: 'antagonist_jaw.stl', size: '48.9 MB', type: 'STL Scan', version: 'v1.0', status: 'Verified' },
      { id: 'f-13', name: 'preop_clinical_photos.zip', size: '18.4 MB', type: 'ZIP Archive', version: 'v1.0', status: 'Verified' }
    ],
    comments: [
      { id: 'c-5', author: 'Anya Chalotra', role: 'Lab Ceramist', text: 'Printed the trial wax-up on Formlabs Form 3B. Beautiful contours. Fitment verified on solid resin model. Ready for investment casting and e.max pressing.', date: '2026-07-16 14:00' }
    ],
    measurements: [
      { id: 'm-8', name: 'Thickness over facial', value: '0.32 mm', status: 'Ideal', nominal: '>= 0.30 mm' },
      { id: 'm-9', name: 'Marginal Precision', value: '9.5 μm', status: 'Ideal', nominal: '<= 20 μm' }
    ]
  },
  {
    id: 'CAD-1052',
    patientName: 'Bruce Wayne',
    doctorName: 'Dr. Harley Quinn',
    technicianName: 'Lucius Fox',
    procedure: '#19 Custom Abutment + Screw Crown',
    shade: 'A3.5 matched cervical transition',
    material: 'Titanium Grade 5 + Monolithic Zirconia',
    priority: 'Standard',
    status: 'Pending Files',
    dueDate: '2026-07-22 17:00',
    createdDate: '2026-07-17 05:00',
    prepType: 'Implant-level Custom Abutment interface',
    shadeSystem: 'VITA Classical',
    stumpShade: 'Titanium grey core',
    implantHex: 'Nobel Biocare CC NP 3.5mm',
    avatarColor: 'from-slate-700 to-zinc-900',
    progressPercent: 10,
    software: 'Exocad Rijeka',
    designVersion: 'v1.0_preliminary',
    instructions: 'Custom screw-retained implant abutment. Ensure titanium interface fits hex perfectly. Crown will be cemented to abutment in lab (hybrid abutment crown). Access channel on occlusal surface.',
    files: [
      { id: 'f-14', name: 'implant_scanbody_upper.stl', size: '56.1 MB', type: 'STL Scan', version: 'v1.0', status: 'Verified' },
      { id: 'f-15', name: 'laboratory_pdf_instructions.pdf', size: '2.4 MB', type: 'PDF Document', version: 'v1.0', status: 'Verified' }
    ],
    comments: [
      { id: 'c-6', author: 'Lucius Fox', role: 'CAD Engineer', text: 'Awaiting lower antagonist scan and buccal bite registration from Dr. Quinn. Sent automated file request to dental office.', date: '2026-07-17 05:30' }
    ],
    measurements: []
  }
];

// --- ANALYTICS MOCK DATA ---
const PRODUCTION_CHART_DATA = [
  { name: 'Mon', completed: 18, designed: 24, remakes: 1 },
  { name: 'Tue', completed: 22, designed: 28, remakes: 0 },
  { name: 'Wed', completed: 25, designed: 31, remakes: 2 },
  { name: 'Thu', completed: 20, designed: 25, remakes: 1 },
  { name: 'Fri', completed: 29, designed: 34, remakes: 0 },
  { name: 'Sat', completed: 12, designed: 15, remakes: 0 },
  { name: 'Sun', completed: 4, designed: 6, remakes: 0 }
];

const MATERIAL_CONSUMPTION_DATA = [
  { name: 'Zirconia Disks', value: 45, color: '#10b981' },
  { name: 'e.max Blocks', value: 30, color: '#3b82f6' },
  { name: 'PMMA Disks', value: 15, color: '#f59e0b' },
  { name: 'Titanium Blanks', value: 8, color: '#64748b' },
  { name: 'PEEK/Composite', value: 12, color: '#8b5cf6' }
];

const TECHNICIAN_PERFORMANCE = [
  { name: 'M. Sterling', cases: 38, avgTime: '4.2h', remakeRate: '0.8%' },
  { name: 'Y. Gagarin', cases: 32, avgTime: '5.1h', remakeRate: '1.2%' },
  { name: 'A. Chalotra', cases: 29, avgTime: '6.0h', remakeRate: '1.5%' },
  { name: 'L. Fox', cases: 14, avgTime: '3.8h', remakeRate: '0.0%' }
];

export default function LaboratoryWorkspace() {
  // Navigation State (10 areas listed in sidebar)
  const [activeTab, setActiveTab] = useState<
    'Dashboard' | 'CaseList' | 'CaseWorkspace' | 'CadCam' | 'Manufacturing' | 'Materials' | 'AiAssistant' | 'Files' | 'Timeline' | 'Analytics'
  >('Dashboard');

  // Interactive core states
  const [cases, setCases] = useState<LabCase[]>(INITIAL_LAB_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('CAD-1049');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'Grid' | 'List'>('Grid');

  // CAD/CAM Simulator interactive states
  const [activeViewerSoftware, setActiveViewerSoftware] = useState<'Exocad' | '3Shape'>('Exocad');
  const [cadRotation, setCadRotation] = useState<number>(45);
  const [cadElevation, setCadElevation] = useState<number>(20);
  const [activeCadTool, setActiveCadTool] = useState<'Solid' | 'Wireframe' | 'MarginLine' | 'Contacts'>('Solid');
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  const [cadZoom, setCadZoom] = useState<number>(100);
  const [showMinimumThicknessCheck, setShowMinimumThicknessCheck] = useState<boolean>(true);
  const [measuredThickness, setMeasuredThickness] = useState<string>('0.85 mm');

  // AI Assistant states
  const [aiOutputLog, setAiOutputLog] = useState<string>('');
  const [aiAnalyzing, setAiAnalyzing] = useState<boolean>(false);

  // New Comment form
  const [newCommentText, setNewCommentText] = useState<string>('');

  // Sidebar drag width mockup
  const [sidebarWidth, setSidebarWidth] = useState<number>(260);
  const isResizing = useRef(false);

  // Computed state for active case
  const activeCase = useMemo(() => {
    return cases.find(c => c.id === selectedCaseId) || cases[0];
  }, [cases, selectedCaseId]);

  // Sidebar resize handler
  const handleMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = Math.max(180, Math.min(380, e.clientX - 60));
    setSidebarWidth(newWidth);
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Add Comment handler
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: LabComment = {
      id: `comment-${Date.now()}`,
      author: 'EHR Lab Manager (You)',
      role: 'Chief CAD Technician',
      text: newCommentText.trim(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setCases(prevCases =>
      prevCases.map(c => {
        if (c.id === selectedCaseId) {
          return {
            ...c,
            comments: [...c.comments, newComment]
          };
        }
        return c;
      })
    );
    setNewCommentText('');
  };

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchSearch =
        c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.procedure.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchPriority = priorityFilter === 'All' || c.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [cases, searchQuery, statusFilter, priorityFilter]);

  // AI Assistant triggers
  const triggerAiLabAnalysis = (type: 'material' | 'shade' | 'manufacturing' | 'time' | 'files' | 'notes') => {
    setAiAnalyzing(true);
    setAiOutputLog('');

    setTimeout(() => {
      setAiAnalyzing(false);
      switch (type) {
        case 'material':
          setAiOutputLog(
            `**AI STRENGTH & ESTHETIC DIAGNOSIS**\n` +
            `• Case Context: ${activeCase.procedure}\n` +
            `• Recommended Material: ${
              activeCase.priority === 'Urgent' ? 'Lithium Disilicate Glass Ceramic (IPS e.max CAD)' : 'High-translucency Zirconia multi-layer (Katana HTML)'
            }\n` +
            `• Critical Force Analysis: Posterior forces require monolithic structure. Anterior zones benefit from cut-back and ceramic hand-layering.`
          );
          break;
        case 'shade':
          setAiOutputLog(
            `**AI SHADE SELECTION TRANSITION MATRIX**\n` +
            `• Target Shade requested: ${activeCase.shade}\n` +
            `• Stump Shade recorded: ${activeCase.stumpShade || 'ND3/ND4'}\n` +
            `• Shade Masking calculation: Thin prep depth restricts light refraction. Recommended high-opacity ingot or zirconia block to fully mask stump grey core.`
          );
          break;
        case 'manufacturing':
          setAiOutputLog(
            `**AI MANUFACTURING ROUTING**\n` +
            `• Recommended Method: 5-Axis Wet Diamond Milling (Zirconia / e.max block)\n` +
            `• Sintering parameters: High-speed short-cycle sintering program at 1450°C. Total time: 3.5 hours.\n` +
            `• Alternative Routing: 3D printed sacrificial castable resin for press-ceramic furnaces.`
          );
          break;
        case 'time':
          setAiOutputLog(
            `**AI OPTIMAL PRODUCTION TIME ESTIMATION**\n` +
            `• CAD Design: 35 minutes\n` +
            `• Wet milling / Carving time: 18 minutes\n` +
            `• Sintering & Hold time: 4 hours (Zirconia curve)\n" +` +
            `• Hand-finishing & Glaze bake: 45 minutes\n` +
            `• Projected Delivery Window: Ready in approximately 5.5 hours.`
          );
          break;
        case 'files':
          const filesFound = activeCase.files.map(f => f.name);
          const hasUpper = filesFound.some(name => name.includes('upper') || name.includes('prep'));
          const hasLower = filesFound.some(name => name.includes('lower') || name.includes('antagonist'));
          const hasBite = filesFound.some(name => name.includes('bite') || name.includes('buccal'));

          let msg = `**AI INTEGRITY SCAN OF DIGITAL RAW FILES**\n`;
          let clean = true;
          if (!hasUpper) { msg += `❌ ALERT: Upper jaw preparation scan not found.\n`; clean = false; }
          if (!hasLower) { msg += `❌ ALERT: Lower antagonist jaw scan not found.\n`; clean = false; }
          if (!hasBite) { msg += `❌ ALERT: Buccal bite alignment scan not found.\n`; clean = false; }

          if (clean) {
            msg += `✓ All primary STL CAD/CAM files verified (Upper jaw, Lower antagonist, and Buccal bite).\n` +
                   `✓ DICOM skull volume aligned with 3D dental arches.\n` +
                   `✓ Checksums verified. MD5 matches original clinical upload. No anomalies.`;
          } else {
            msg += `• Awaiting digital delivery from clinic before milling toolpath computation can commence.`;
          }
          setAiOutputLog(msg);
          break;
        case 'notes':
          setAiOutputLog(
            `<exocad_workorder>\n` +
            `  <patient>${activeCase.patientName}</patient>\n` +
            `  <clinician>${activeCase.doctorName}</clinician>\n` +
            `  <material>${activeCase.material}</material>\n` +
            `  <instructions>${activeCase.instructions}</instructions>\n` +
            `  <cement_gap>15μm</cement_gap>\n` +
            `  <margin_offset>0.2mm</margin_offset>\n` +
            `</exocad_workorder>`
          );
          break;
      }
    }, 700);
  };

  // Quick state dashboard stats
  const dashboardStats = useMemo(() => {
    const today = cases.length;
    const inDesign = cases.filter(c => c.status === 'In Design').length;
    const milling = cases.filter(c => c.status === 'Milling').length;
    const printing = cases.filter(c => c.status === 'Printing').length;
    const sintering = cases.filter(c => c.status === 'Sintering').length;
    const finished = cases.filter(c => c.status === 'Finished').length;
    const delivered = cases.filter(c => c.status === 'Delivered').length;
    const urgents = cases.filter(c => c.priority === 'Urgent').length;

    return { today, inDesign, milling, printing, sintering, finished, delivered, urgents };
  }, [cases]);

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden flex flex-col shadow-2xl h-[780px] font-sans antialiased text-zinc-100 relative">
      
      {/* CAD/CAM HEADER BRAND STRIP */}
      <div className="bg-zinc-900/85 border-b border-zinc-900 px-6 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-white">HealthOS DentalLab Pro</h2>
              <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-black px-2 py-0.5 rounded-full">
                ENTERPRISE WORKFLOW
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono">
              Synchronized Dental Lab System • Connected to Exocad & 3Shape Servers
            </p>
          </div>
        </div>

        {/* WORK ORDER STATE BANNER */}
        <div className="hidden lg:flex items-center gap-3 bg-zinc-950/80 border border-zinc-800 px-4 py-1.5 rounded-2xl">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Active Order:</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white font-mono">{activeCase.id}</span>
            <span className="text-xs text-emerald-400 font-semibold truncate max-w-[130px]">{activeCase.patientName}</span>
            <span className="bg-zinc-905 text-zinc-500 text-[10px] px-1.5 py-0.2 border border-zinc-850 rounded font-mono font-bold">
              {activeCase.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-mono font-bold">
            <Shield className="w-3.5 h-3.5" /> HIPAA DIGITAL TRUST
          </div>
        </div>
      </div>

      {/* DUAL WORKSPACE LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* RESIZABLE WORKSPACE SELECTOR MENU */}
        <div 
          style={{ width: `${sidebarWidth}px` }}
          className="bg-zinc-900 border-r border-zinc-900 flex flex-col shrink-0 overflow-hidden select-none"
        >
          {/* HEADER SECTOR */}
          <div className="p-4 border-b border-zinc-900 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block mb-2">CAD/CAM Sections</span>
            <p className="text-[10px] text-zinc-400 font-mono">Select enterprise dental lab viewports:</p>
          </div>

          {/* LIST OF 10 WORKSPACES */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1 scrollbar-thin">
            {[
              { id: 'Dashboard', label: '1. Lab Dashboard', icon: BarChart3, badge: `${dashboardStats.today} Cases` },
              { id: 'CaseList', label: '2. Lab Case List', icon: List, badge: 'Filterable' },
              { id: 'CaseWorkspace', label: '3. Case Workspace', icon: User, badge: activeCase.priority === 'Urgent' ? 'URGENT' : undefined, badgeColor: 'bg-rose-500/25 text-rose-300 border-rose-500/30' },
              { id: 'CadCam', label: '4. CAD/CAM Studio', icon: RotateCw, badge: activeCase.software.split(' ')[0] },
              { id: 'Manufacturing', label: '5. Manufacturing', icon: Flame, badge: 'Milling' },
              { id: 'Materials', label: '6. Materials Hub', icon: Boxes, badge: 'Inventory' },
              { id: 'AiAssistant', label: '7. AI Lab Assistant', icon: Cpu, badge: 'Smart suggest', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
              { id: 'Files', label: '8. STL & File Hub', icon: FileArchive, badge: `${activeCase.files.length} Files` },
              { id: 'Timeline', label: '9. Milestone Timeline', icon: Clock, badge: 'Stage check' },
              { id: 'Analytics', label: '10. Performance Analytics', icon: TrendingUp, badge: '98.5% OK' }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-between border cursor-pointer ${
                    isActive 
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md shadow-emerald-500/10' 
                      : 'bg-transparent text-zinc-400 border-transparent hover:bg-zinc-950/40 hover:text-white hover:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded-md border ${
                      item.badgeColor || (isActive ? 'bg-zinc-950 text-emerald-400 border-emerald-500/30' : 'bg-zinc-950 text-zinc-500 border-zinc-850')
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ACTIVE CASE DIRECT CARD ON FOOTER OF SIDEBAR */}
          <div className="p-3 bg-zinc-950/80 border-t border-zinc-900 shrink-0 space-y-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">Loaded Specimen</span>
            <div className="flex items-center gap-2.5 p-2 bg-zinc-900 border border-zinc-850 rounded-xl">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${activeCase.avatarColor} flex items-center justify-center text-xs font-black text-white uppercase shadow-md`}>
                {activeCase.patientName.split(' ').map(n=>n[0]).join('')}
              </div>
              <div className="min-w-0 flex-1">
                <h5 className="text-[11px] font-bold text-white truncate">{activeCase.patientName}</h5>
                <p className="text-[9px] text-zinc-500 font-mono truncate">{activeCase.procedure}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RESIZABLE BAR */}
        <div 
          onMouseDown={handleMouseDown}
          className="w-1 bg-zinc-900 hover:bg-emerald-500/40 cursor-col-resize flex items-center justify-center shrink-0 transition-colors"
        >
          <div className="w-0.5 h-10 bg-zinc-800 rounded" />
        </div>

        {/* WORKSPACE DETAIL PANEL */}
        <div className="flex-1 bg-zinc-950 flex flex-col overflow-hidden relative">
          
          <div className="flex-1 overflow-hidden p-6">
            <AnimatePresence mode="wait">
              
              {/* ==================================================
                  1. LABORATORY DASHBOARD
                  ================================================== */}
              {activeTab === 'Dashboard' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Heading */}
                    <div className="border-b border-zinc-900 pb-2 flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-black text-white uppercase tracking-tight">Today&apos;s Laboratory Dashboard</h3>
                        <p className="text-xs text-zinc-500 font-mono">Real-time telemetry and status of CAD/CAM dental restorations in processing queues.</p>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
                        Active Queue Synchronized
                      </span>
                    </div>

                    {/* Bento Box Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                      <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex flex-col justify-between h-[90px]">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Today&apos;s cases</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-white font-mono">{dashboardStats.today}</span>
                          <span className="text-[9px] text-emerald-400 font-mono font-bold">100% load</span>
                        </div>
                        <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded-full w-full" />
                        </div>
                      </div>

                      <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex flex-col justify-between h-[90px]">
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest font-mono flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Urgent Orders
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-rose-400 font-mono">{dashboardStats.urgents}</span>
                          <span className="text-[9px] text-rose-300 font-mono font-bold">Priority Red</span>
                        </div>
                        <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full w-1/3 animate-pulse" />
                        </div>
                      </div>

                      <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex flex-col justify-between h-[90px]">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Avg Turnaround</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-white font-mono">4.8 Hrs</span>
                          <span className="text-[9px] text-emerald-400 font-mono font-bold">-1.2h today</span>
                        </div>
                        <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded-full w-4/5" />
                        </div>
                      </div>

                      <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex flex-col justify-between h-[90px]">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Milling / Print load</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-white font-mono">84%</span>
                          <span className="text-[9px] text-zinc-400 font-mono font-bold">2/3 spindles</span>
                        </div>
                        <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-400 rounded-full w-[84%]" />
                        </div>
                      </div>
                    </div>

                    {/* Detailed Stage Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {[
                        { label: 'In Design', count: dashboardStats.inDesign, color: 'text-amber-400 bg-amber-400/5 border-amber-400/10' },
                        { label: 'Milling Queue', count: dashboardStats.milling, color: 'text-emerald-400 bg-emerald-400/5 border-emerald-400/10' },
                        { label: '3D Printing', count: dashboardStats.printing, color: 'text-cyan-400 bg-cyan-400/5 border-cyan-400/10' },
                        { label: 'Sintering', count: dashboardStats.sintering, color: 'text-purple-400 bg-purple-400/5 border-purple-400/10' },
                        { label: 'Completed', count: dashboardStats.finished + dashboardStats.delivered, color: 'text-zinc-200 bg-zinc-200/5 border-zinc-200/10' }
                      ].map((stage, idx) => (
                        <div key={idx} className={`p-3.5 border rounded-2xl text-center space-y-1 ${stage.color}`}>
                          <span className="text-[9px] font-mono uppercase tracking-wider block font-bold">{stage.label}</span>
                          <p className="text-2xl font-black font-mono">{stage.count}</p>
                          <span className="text-[8px] opacity-60 font-mono">Case batch active</span>
                        </div>
                      ))}
                    </div>

                    {/* Active Jobs Quick Preview */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">Milling Spindle & Furnace Telemetry</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center justify-between font-mono text-xs">
                          <div className="flex items-center gap-2">
                            <Gauge className="w-4 h-4 text-emerald-400 animate-spin-slow" />
                            <div>
                              <p className="font-bold text-white">Roland Mill #1</p>
                              <p className="text-[10px] text-zinc-500">Zirconia monolithic #30</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-black text-emerald-400">MILLING (65%)</span>
                            <p className="text-[9px] text-zinc-500">14m remaining</p>
                          </div>
                        </div>

                        <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center justify-between font-mono text-xs">
                          <div className="flex items-center gap-2">
                            <Flame className="w-4 h-4 text-purple-400 animate-pulse" />
                            <div>
                              <p className="font-bold text-white">Sinter Furnace #2</p>
                              <p className="text-[10px] text-zinc-500">IPS e.max Pressing</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-black text-purple-400">HOLD (1450°C)</span>
                            <p className="text-[9px] text-zinc-500">Hold time: 42m</p>
                          </div>
                        </div>

                        <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center justify-between font-mono text-xs">
                          <div className="flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-cyan-400" />
                            <div>
                              <p className="font-bold text-white">Formlabs Print #3B</p>
                              <p className="text-[10px] text-zinc-500">Trial wax-up model</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-black text-cyan-400">PRINTING (80%)</span>
                            <p className="text-[9px] text-zinc-500">Model: Vance_Amelia</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM RECENT CASES SUMMARY ROW */}
                  <div className="p-3.5 bg-zinc-900/20 border border-zinc-900 rounded-2xl flex justify-between items-center text-xs font-mono">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider">Enterprise PACS Server State:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Online • Latency 4ms
                    </span>
                    <span className="text-zinc-400">Total processed cases: 1,482</span>
                    <button
                      onClick={() => setActiveTab('CaseList')}
                      className="text-emerald-400 hover:underline font-bold"
                    >
                      Browse Cases &rarr;
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ==================================================
                  2. LABORATORY CASE LIST
                  ================================================== */}
              {activeTab === 'CaseList' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header Controls */}
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                      <div>
                        <h3 className="text-base font-black text-white uppercase tracking-tight">Enterprise Lab Case Registry</h3>
                        <p className="text-xs text-zinc-500 font-mono">Review, sort, and launch active clinician work orders.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewMode('Grid')}
                          className={`p-1.5 rounded-lg border ${viewMode === 'Grid' ? 'bg-zinc-800 border-zinc-700 text-emerald-400' : 'bg-transparent border-zinc-900 text-zinc-500'}`}
                        >
                          <Grid className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewMode('List')}
                          className={`p-1.5 rounded-lg border ${viewMode === 'List' ? 'bg-zinc-800 border-zinc-700 text-emerald-400' : 'bg-transparent border-zinc-900 text-zinc-500'}`}
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Search & Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 shrink-0">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search cases by name, doctor, ID..."
                          className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 text-xs rounded-xl outline-none focus:border-emerald-500 text-white font-mono placeholder:text-zinc-600"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold shrink-0">Status:</span>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="bg-zinc-905 border border-zinc-850 rounded-xl text-xs font-mono text-zinc-300 p-1.5 outline-none focus:border-emerald-500 w-full"
                        >
                          <option value="All">All statuses</option>
                          <option value="In Design">In Design</option>
                          <option value="Milling">Milling</option>
                          <option value="Printing">Printing</option>
                          <option value="Sintering">Sintering</option>
                          <option value="Finished">Finished</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Pending Files">Pending Files</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold shrink-0">Priority:</span>
                        <select
                          value={priorityFilter}
                          onChange={(e) => setPriorityFilter(e.target.value)}
                          className="bg-zinc-905 border border-zinc-850 rounded-xl text-xs font-mono text-zinc-300 p-1.5 outline-none focus:border-emerald-500 w-full"
                        >
                          <option value="All">All priorities</option>
                          <option value="Urgent">Urgent</option>
                          <option value="High">High</option>
                          <option value="Standard">Standard</option>
                        </select>
                      </div>
                    </div>

                    {/* Rendering results */}
                    {viewMode === 'Grid' ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto max-h-[420px] pr-1">
                        {filteredCases.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => {
                              setSelectedCaseId(c.id);
                              setActiveTab('CaseWorkspace');
                            }}
                            className={`p-4 bg-zinc-900/40 border rounded-2xl flex flex-col justify-between h-[175px] cursor-pointer transition-all ${
                              selectedCaseId === c.id ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-zinc-850 hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-[9px] font-bold font-mono bg-zinc-950 border border-zinc-800 text-emerald-400 px-1.5 py-0.5 rounded-md">
                                {c.id}
                              </span>
                              <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded-md ${
                                c.priority === 'Urgent' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                c.priority === 'High' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-zinc-800 text-zinc-400 border border-zinc-700'
                              }`}>
                                {c.priority}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <h4 className="text-xs font-black text-white">{c.patientName}</h4>
                              <p className="text-[10px] text-zinc-400 font-mono truncate">{c.procedure}</p>
                              <p className="text-[9px] text-zinc-500 font-mono">Shade: {c.shade}</p>
                            </div>

                            <div className="border-t border-zinc-900/60 pt-2 flex justify-between items-center text-[10px] font-mono">
                              <span className="text-zinc-500">Progress:</span>
                              <span className="font-bold text-emerald-400">{c.progressPercent}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-zinc-900 max-h-[420px] overflow-y-auto">
                        <table className="w-full text-left border-collapse text-xs font-mono">
                          <thead>
                            <tr className="bg-zinc-950 text-zinc-500 text-[10px] uppercase font-bold border-b border-zinc-900">
                              <th className="p-3">ID</th>
                              <th className="p-3">Patient</th>
                              <th className="p-3">Doctor</th>
                              <th className="p-3">Procedure</th>
                              <th className="p-3">Material</th>
                              <th className="p-3">Status</th>
                              <th className="p-3">Priority</th>
                              <th className="p-3">Launch</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
                            {filteredCases.map((c) => (
                              <tr 
                                key={c.id} 
                                onClick={() => setSelectedCaseId(c.id)}
                                className={`hover:bg-zinc-900/10 cursor-pointer ${selectedCaseId === c.id ? 'bg-emerald-500/5' : ''}`}
                              >
                                <td className="p-3 text-emerald-400 font-bold">{c.id}</td>
                                <td className="p-3 font-semibold text-zinc-100">{c.patientName}</td>
                                <td className="p-3">{c.doctorName}</td>
                                <td className="p-3 truncate max-w-[150px]">{c.procedure}</td>
                                <td className="p-3 text-zinc-400">{c.material}</td>
                                <td className="p-3">
                                  <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px]">
                                    {c.status}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className={c.priority === 'Urgent' ? 'text-rose-400 font-bold' : ''}>{c.priority}</span>
                                </td>
                                <td className="p-3">
                                  <button
                                    onClick={() => {
                                      setSelectedCaseId(c.id);
                                      setActiveTab('CaseWorkspace');
                                    }}
                                    className="text-emerald-400 hover:underline font-bold"
                                  >
                                    LOAD
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* FOOTER STATS */}
                  <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500 font-bold">REGISTRY COUNT: {filteredCases.length} OF {cases.length}</span>
                    <span className="text-zinc-500">EXOCAD SYNC STATUS: OK</span>
                    <span className="text-emerald-400 font-bold">READY FOR CAM ROUTING</span>
                  </div>
                </motion.div>
              )}

              {/* ==================================================
                  3. CASE WORKSPACE
                  ================================================== */}
              {activeTab === 'CaseWorkspace' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="border-b border-zinc-900 pb-2 flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-white uppercase tracking-tight">Active Work Order Terminal</h3>
                          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-mono font-black px-2 py-0.5 rounded uppercase">
                            {activeCase.priority} priority
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 font-mono">Full case prescription, clinician instructions, and file attachments.</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono text-zinc-400">Order Ref:</span>
                        <p className="text-xs font-mono font-bold text-emerald-400">{activeCase.id}</p>
                      </div>
                    </div>

                    {/* Detailed Specimen Attributes Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">Patient name</span>
                        <span className="text-sm font-black text-white">{activeCase.patientName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">Prescribing Dentist</span>
                        <span className="text-sm text-zinc-200">{activeCase.doctorName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">Material request</span>
                        <span className="text-sm text-emerald-400 font-bold">{activeCase.material}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">Due Date / Delivery</span>
                        <span className="text-sm text-amber-400 font-mono font-bold">{activeCase.dueDate}</span>
                      </div>
                    </div>

                    {/* Instructions & Comments Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Clinical Instructions */}
                      <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block border-b border-zinc-900 pb-1">
                          Clinical Instructions
                        </span>
                        <p className="text-xs text-zinc-300 leading-relaxed italic bg-zinc-900/40 p-3 rounded-xl border border-zinc-850">
                          &ldquo;{activeCase.instructions}&rdquo;
                        </p>

                        <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-1">
                          <div>
                            <span className="text-zinc-500">Prep Style:</span>
                            <p className="text-zinc-300">{activeCase.prepType}</p>
                          </div>
                          <div>
                            <span className="text-zinc-500">Shade Matrix:</span>
                            <p className="text-emerald-400 font-bold">{activeCase.shade}</p>
                          </div>
                          <div>
                            <span className="text-zinc-500">Stump Shade:</span>
                            <p className="text-zinc-300">{activeCase.stumpShade}</p>
                          </div>
                          <div>
                            <span className="text-zinc-500">Implant Spec:</span>
                            <p className="text-zinc-300">{activeCase.implantHex}</p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Technical Comments List */}
                      <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col justify-between h-[230px]">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block border-b border-zinc-900 pb-1 mb-2">
                            Design Discussion
                          </span>
                          <div className="space-y-2 overflow-y-auto max-h-[120px] scrollbar-thin pr-1">
                            {activeCase.comments.map(c => (
                              <div key={c.id} className="text-[11px] font-mono leading-normal">
                                <div className="flex justify-between font-bold text-zinc-400 text-[10px]">
                                  <span>{c.author} ({c.role})</span>
                                  <span>{c.date}</span>
                                </div>
                                <p className="text-zinc-300 bg-zinc-900/60 p-1.5 rounded border border-zinc-850/60 mt-0.5">{c.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Comment Form */}
                        <form onSubmit={handleAddComment} className="flex gap-2 border-t border-zinc-900 pt-2">
                          <input
                            type="text"
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            placeholder="Add revision note to Exocad server..."
                            className="flex-1 bg-zinc-900 border border-zinc-800 text-xs rounded-xl px-3 outline-none focus:border-emerald-500 text-white font-mono placeholder:text-zinc-600"
                          />
                          <button
                            type="submit"
                            className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs font-mono px-3 py-1.5 rounded-xl cursor-pointer"
                          >
                            ADD
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE CASE PROGRESS BAR */}
                  <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl space-y-2 font-mono text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-bold uppercase">Manufacturing stage pipeline</span>
                      <span className="text-emerald-400 font-bold">{activeCase.status} ({activeCase.progressPercent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${activeCase.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ==================================================
                  4. CAD/CAM WORKSPACE (HIGH-RES SIMULATOR)
                  ================================================== */}
              {activeTab === 'CadCam' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col lg:flex-row gap-5"
                >
                  {/* Rotating solid crown simulator (Exocad viewport) */}
                  <div className="flex-1 bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden select-none">
                    <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono z-10">
                      <span className="font-bold text-white uppercase bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                        {activeCase.software} Workstation
                      </span>
                      <span>ANGULATION ROT: {cadRotation}° ELEV: {cadElevation}°</span>
                    </div>

                    {/* Viewport mesh simulator */}
                    <div className="flex-1 relative flex items-center justify-center m-4">
                      {/* Grid overlay background to feel like 3D software */}
                      <div className="absolute inset-0 bg-grid-zinc opacity-20" />
                      
                      <div 
                        className="w-48 h-48 relative flex items-center justify-center transition-transform duration-300"
                        style={{
                          transform: `rotateX(${cadElevation}deg) rotateY(${cadRotation}deg) scale(${cadZoom / 100})`
                        }}
                      >
                        {/* Interactive wireframe crown */}
                        <div className={`absolute w-36 h-36 border-4 rounded-b-3xl flex items-center justify-center transition-all ${
                          activeCadTool === 'Wireframe' 
                            ? 'border-dashed border-emerald-400/40 bg-transparent' 
                            : activeCadTool === 'MarginLine'
                            ? 'border-rose-500 bg-zinc-900/60'
                            : activeCadTool === 'Contacts'
                            ? 'border-yellow-500 bg-gradient-to-b from-blue-500 via-yellow-400 to-rose-500'
                            : 'border-emerald-500/80 bg-zinc-900/80 shadow-2xl shadow-emerald-500/15'
                        }`}>
                          <div className="text-center font-mono space-y-1">
                            <span className="text-[10px] font-black text-white block uppercase tracking-wider">
                              {activeCase.designVersion}
                            </span>
                            <span className="text-[9px] text-zinc-500 block">IPS Ceramic</span>
                          </div>

                          {/* Render margin line indicator */}
                          {activeCadTool === 'MarginLine' && (
                            <div className="absolute -bottom-1.5 left-2 right-2 h-1 bg-rose-500 rounded animate-pulse" title="Exocad auto-detected margin" />
                          )}

                          {/* Render Contact Points pressure maps */}
                          {activeCadTool === 'Contacts' && (
                            <>
                              <div className="absolute -left-2 top-10 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[8px] font-black text-white" title="High tension contact (Mesial) 95N">M</div>
                              <div className="absolute -right-2 top-12 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] font-black text-white" title="Optimal tension contact (Distal) 60N">D</div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* On-screen measurements floating card */}
                      {showMinimumThicknessCheck && (
                        <div className="absolute bottom-4 right-4 bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl space-y-1 font-mono text-[10px] shadow-xl z-10">
                          <p className="font-bold text-zinc-400 uppercase">Caliper Telemetry:</p>
                          <p className="text-white">Margin Width: <span className="text-emerald-400 font-bold">11.2 μm</span></p>
                          <p className="text-white">Prep shoulder: <span className="text-emerald-400 font-bold">1.25 mm</span></p>
                          <p className="text-white">Restoration: <span className="text-emerald-400 font-bold">{measuredThickness}</span></p>
                        </div>
                      )}
                    </div>

                    {/* Rotation CAD/CAM controls */}
                    <div className="flex justify-between items-center z-10 bg-zinc-900 p-2.5 rounded-xl border border-zinc-850">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setCadRotation(prev => (prev - 15) % 360)}
                          className="p-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                          title="Rotate Left"
                        >
                          &larr;
                        </button>
                        <button
                          onClick={() => setCadRotation(prev => (prev + 15) % 360)}
                          className="p-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                          title="Rotate Right"
                        >
                          &rarr;
                        </button>
                        <button
                          onClick={() => setCadElevation(prev => Math.min(60, prev + 10))}
                          className="p-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                          title="Elevate"
                        >
                          &uarr;
                        </button>
                        <button
                          onClick={() => setCadElevation(prev => Math.max(-10, prev - 10))}
                          className="p-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                          title="Depress"
                        >
                          &darr;
                        </button>
                      </div>

                      {/* Mode switches */}
                      <div className="flex gap-1.5">
                        {[
                          { id: 'Solid', label: 'Solid' },
                          { id: 'Wireframe', label: 'Wire' },
                          { id: 'MarginLine', label: 'Margin' },
                          { id: 'Contacts', label: 'Contacts' }
                        ].map(m => (
                          <button
                            key={m.id}
                            onClick={() => setActiveCadTool(m.id as any)}
                            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all border ${
                              activeCadTool === m.id 
                                ? 'bg-emerald-500 text-zinc-950 border-emerald-400' 
                                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right side parameters */}
                  <div className="w-full lg:w-72 bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                    <div className="space-y-4">
                      
                      {/* Active design values */}
                      <div className="border-b border-zinc-900 pb-3">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">Design values</span>
                        <h4 className="text-xs font-bold text-white uppercase">{activeCase.software} Active File</h4>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Version: {activeCase.designVersion}</p>
                      </div>

                      {/* Telemetry settings */}
                      <div className="space-y-3 font-mono text-xs text-zinc-400">
                        <div className="flex justify-between">
                          <span>Zoom:</span>
                          <span className="text-white font-bold">{cadZoom}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="200"
                          value={cadZoom}
                          onChange={(e) => setCadZoom(Number(e.target.value))}
                          className="w-full accent-emerald-500 cursor-pointer"
                        />

                        <div className="flex items-center justify-between border-t border-zinc-900 pt-2.5">
                          <span>Show thickness limits</span>
                          <input
                            type="checkbox"
                            checked={showMinimumThicknessCheck}
                            onChange={(e) => setShowMinimumThicknessCheck(e.target.checked)}
                            className="accent-emerald-500 cursor-pointer w-4 h-4"
                          />
                        </div>
                      </div>

                      {/* CAD measurements list */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">Measurements</span>
                        <div className="space-y-1.5">
                          {activeCase.measurements.map((m, idx) => (
                            <div key={idx} className="p-2 bg-zinc-950 rounded-lg border border-zinc-900 flex justify-between items-center text-[11px] font-mono">
                              <div>
                                <p className="text-zinc-400 font-bold">{m.name}</p>
                                <p className="text-[9px] text-zinc-600">Nominal: {m.nominal}</p>
                              </div>
                              <span className={`font-black ${
                                m.status === 'Ideal' ? 'text-emerald-400' :
                                m.status === 'Warning' ? 'text-amber-400' : 'text-zinc-200'
                              }`}>{m.value}</span>
                            </div>
                          ))}

                          {activeCase.measurements.length === 0 && (
                            <p className="text-xs text-zinc-600 italic font-mono text-center py-4">No measurements generated.</p>
                          )}
                        </div>
                      </div>

                    </div>

                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 text-[10px] text-zinc-500 font-mono">
                      <span className="text-zinc-400 font-bold block uppercase tracking-wider">REVISION NOTES:</span>
                      <p className="mt-1">Marginal fit check passed automatically via exocad server calibration.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ==================================================
                  5. MANUFACTURING CENTER (MILLING/PRINT QUEUE)
                  ================================================== */}
              {activeTab === 'Manufacturing' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="border-b border-zinc-900 pb-2 flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-black text-white uppercase tracking-tight">Enterprise CAD/CAM Manufacturing Center</h3>
                        <p className="text-xs text-zinc-500 font-mono">Monitor dental milling spindles, sintering temperature profiles, and Formlabs 3D printers.</p>
                      </div>
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-xl">
                        3 Machines Online
                      </span>
                    </div>

                    {/* Three Queues Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Milling Spindle card */}
                      <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl space-y-3 flex flex-col justify-between h-[280px]">
                        <div>
                          <div className="flex justify-between items-start border-b border-zinc-900 pb-2">
                            <div>
                              <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Milling Queue (Zirconia)</h4>
                              <p className="text-[10px] text-zinc-500">Roland DWX-52D 5-Axis</p>
                            </div>
                            <span className="text-[9px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded uppercase">
                              Active
                            </span>
                          </div>

                          <div className="space-y-2 pt-2.5 font-mono text-xs text-zinc-400">
                            <div className="flex justify-between">
                              <span>Spindle speed:</span>
                              <span className="text-white">28,500 RPM</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Coolant flow:</span>
                              <span className="text-emerald-400">Optimal (1.2 L/min)</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tool wear rating:</span>
                              <span className="text-amber-400">84% life (0.6mm burr)</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Disc template:</span>
                              <span className="text-white truncate max-w-[120px]">Katana Multi A3 14mm</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5 font-mono text-xs">
                          <div className="flex justify-between text-zinc-500">
                            <span>Milling progress:</span>
                            <span className="text-emerald-400 font-bold">65%</span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 w-[65%]" />
                          </div>
                          <p className="text-[9px] text-zinc-500 italic text-center">Remaining milling carving duration: 14 mins</p>
                        </div>
                      </div>

                      {/* 3D Printer card */}
                      <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl space-y-3 flex flex-col justify-between h-[280px]">
                        <div>
                          <div className="flex justify-between items-start border-b border-zinc-900 pb-2">
                            <div>
                              <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">3D Printing Queue</h4>
                              <p className="text-[10px] text-zinc-500">Formlabs Form 3B Biocompatible</p>
                            </div>
                            <span className="text-[9px] font-mono bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded uppercase">
                              Active
                            </span>
                          </div>

                          <div className="space-y-2 pt-2.5 font-mono text-xs text-zinc-400">
                            <div className="flex justify-between">
                              <span>Resin tank type:</span>
                              <span className="text-white">Dental Model V3</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Layer resolution:</span>
                              <span className="text-white">50 microns</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Resin volume left:</span>
                              <span className="text-emerald-400">0.82 Liters</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Internal temp:</span>
                              <span className="text-white">34.5 °C</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5 font-mono text-xs">
                          <div className="flex justify-between text-zinc-500">
                            <span>Layer build:</span>
                            <span className="text-cyan-400 font-bold">80%</span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-400 w-[80%]" />
                          </div>
                          <p className="text-[9px] text-zinc-500 italic text-center">Printing diagnostic crown model: Vance_Amelia</p>
                        </div>
                      </div>

                      {/* Sintering furnace card */}
                      <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl space-y-3 flex flex-col justify-between h-[280px]">
                        <div>
                          <div className="flex justify-between items-start border-b border-zinc-900 pb-2">
                            <div>
                              <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Sintering Furnace</h4>
                              <p className="text-[10px] text-zinc-500">Dekema Austromat High-Temp</p>
                            </div>
                            <span className="text-[9px] font-mono bg-purple-500/15 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded uppercase">
                              Hold Cycle
                            </span>
                          </div>

                          <div className="space-y-2 pt-2.5 font-mono text-xs text-zinc-400">
                            <div className="flex justify-between">
                              <span>Chamber temperature:</span>
                              <span className="text-rose-400 font-bold">1450 °C</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Program profile:</span>
                              <span className="text-white">Zirconia Solid Ultra</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Target ramp rate:</span>
                              <span className="text-white">10 °C/min</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Holding duration:</span>
                              <span className="text-emerald-400">42 mins remaining</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5 font-mono text-xs">
                          <div className="flex justify-between text-zinc-500">
                            <span>Furnace curve:</span>
                            <span className="text-purple-400 font-bold">92% completed</span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-400 w-[92%]" />
                          </div>
                          <p className="text-[9px] text-zinc-500 italic text-center">Do not open chamber until cooled below 300°C</p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* QC and Packaging footer status */}
                  <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs font-mono text-zinc-400">
                    <p className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block animate-ping" />
                      <span>QC CHECKPOINT STATUS: All milled margins validated via Fit Checker &mu;-precision scanners. No distortions.</span>
                    </p>
                    <div className="flex gap-2">
                      <span className="bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded text-[10px]">Polishing station: Active</span>
                      <span className="bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded text-[10px]">Sterilization check: Pass</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ==================================================
                  6. MATERIAL MANAGEMENT
                  ================================================== */}
              {activeTab === 'Materials' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="border-b border-zinc-900 pb-2 flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-black text-white uppercase tracking-tight">Material Inventory & Disc Stocks</h3>
                        <p className="text-xs text-zinc-500 font-mono">High-density multi-layered CAD/CAM disks, lithium disilicate blocks, and titanium blanks.</p>
                      </div>
                      <button
                        onClick={() => {
                          // Quick simulated inventory refill
                          alert('Triggered direct lab order refill with Ivoclar Vivadent and Katana servers.');
                        }}
                        className="text-xs font-mono bg-emerald-500 text-zinc-950 px-3 py-1.5 rounded-xl font-bold cursor-pointer"
                      >
                        REFILL LOW STOCK
                      </button>
                    </div>

                    {/* Stock listing */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      {[
                        { title: 'Zirconia', desc: 'Katana Multi-layered 98mm', count: 18, limit: 5, color: 'text-emerald-400 border-emerald-500/10' },
                        { title: 'PMMA Disks', desc: 'Temp restorations 98mm', count: 12, limit: 3, color: 'text-emerald-400 border-emerald-500/10' },
                        { title: 'e.max Blocks', desc: 'Lithium Disilicate C14', count: 2, limit: 8, color: 'text-rose-400 border-rose-500/25 bg-rose-500/5 animate-pulse', warn: true },
                        { title: 'Titanium Blanks', desc: 'Medentika Premilled', count: 14, limit: 4, color: 'text-emerald-400 border-emerald-500/10' },
                        { title: 'PEEK Blanks', desc: 'Biocompatible polymer', count: 8, limit: 2, color: 'text-emerald-400 border-emerald-500/10' },
                        { title: 'Composite Blocks', desc: 'Cerasmart Hybrid', count: 4, limit: 5, color: 'text-rose-400 border-rose-500/25 bg-rose-500/5', warn: true }
                      ].map((mat, idx) => (
                        <div key={idx} className={`p-3.5 border rounded-2xl flex flex-col justify-between h-[155px] ${mat.color}`}>
                          <div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-black uppercase tracking-wider font-mono">{mat.title}</span>
                              {mat.warn && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                            </div>
                            <p className="text-[9px] opacity-60 font-mono mt-0.5">{mat.desc}</p>
                          </div>

                          <div className="space-y-1">
                            <span className="text-2xl font-mono font-black">{mat.count} <span className="text-xs font-normal text-zinc-500">discs</span></span>
                            <p className="text-[8px] font-mono opacity-80">Safety Limit: {mat.limit}</p>
                          </div>

                          <span className={`text-[8px] font-mono uppercase font-black px-1.5 py-0.5 rounded text-center border ${
                            mat.warn ? 'bg-rose-500/20 text-rose-300 border-rose-500/20' : 'bg-zinc-950 text-zinc-400 border-zinc-850'
                          }`}>
                            {mat.warn ? 'Low Stock' : 'Stock Stable'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Material shade breakdown matrix */}
                    <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl space-y-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">Shade Distribution Matrix (Active Inventory)</span>
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-xs font-mono">
                        {['A1 (14 discs)', 'A2 (22 discs)', 'A3 (18 discs)', 'B1 (8 discs)', 'BL1 Bleach (4 discs)', 'OM3 (6 discs)'].map((shade, i) => (
                          <div key={i} className="p-2.5 bg-zinc-950 border border-zinc-900 rounded-xl">
                            <p className="text-white font-bold">{shade.split(' ')[0]}</p>
                            <span className="text-[9px] text-zinc-500">{shade.split(' ')[1]} available</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-zinc-900/20 border border-zinc-900 rounded-2xl flex justify-between items-center text-xs font-mono text-zinc-500">
                    <span>IVOCLAR DIRECT INTERFACE: CALIBRATED</span>
                    <span>AUTOMATIC STOCK DISPATCH: CONNECTED</span>
                    <span className="text-emerald-400">No expired composites detected</span>
                  </div>
                </motion.div>
              )}

              {/* ==================================================
                  7. AI LABORATORY ASSISTANT
                  ================================================== */}
              {activeTab === 'AiAssistant' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="border-b border-zinc-900 pb-2 flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-black text-white uppercase tracking-tight">AI Diagnostic Laboratory Assistant</h3>
                        <p className="text-xs text-zinc-500 font-mono">Deep neural parsing of tooth preparations, contact strength calculations, and material selections.</p>
                      </div>
                      <span className="text-xs font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-xl animate-pulse">
                        Neural Core active
                      </span>
                    </div>

                    {/* Assistant Trigger Matrix */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 shrink-0">
                      {[
                        { id: 'material', label: 'Suggest Ideal Material', desc: 'Esthetic / stress check' },
                        { id: 'shade', label: 'Suggest Translucency / Shade', desc: 'Stump masking ratio' },
                        { id: 'manufacturing', label: 'Suggest Mfg Method', desc: 'Milling vs printing vs press' },
                        { id: 'time', label: 'Estimate Production Time', desc: 'Full pipeline duration' },
                        { id: 'files', label: 'Scan for Missing Files', desc: 'Integrity scan' },
                        { id: 'notes', label: 'Generate Lab Prescript Notes', desc: 'Exocad ready text' }
                      ].map(act => (
                        <button
                          key={act.id}
                          onClick={() => triggerAiLabAnalysis(act.id as any)}
                          className="p-3.5 bg-zinc-900/40 border border-zinc-850 hover:border-purple-500/40 hover:bg-zinc-950/80 rounded-2xl text-left cursor-pointer transition-all space-y-1 group"
                        >
                          <div className="flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold text-white font-mono">{act.label}</span>
                          </div>
                          <p className="text-[10px] text-zinc-500 font-mono">{act.desc}</p>
                        </button>
                      ))}
                    </div>

                    {/* Animated Output terminal */}
                    <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col justify-between h-[230px]">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block border-b border-zinc-900 pb-1.5 mb-2">
                          Neural Log Console Output
                        </span>
                        
                        {aiAnalyzing ? (
                          <div className="flex flex-col items-center justify-center h-[140px] text-zinc-500 font-mono text-xs gap-2">
                            <Cpu className="w-8 h-8 text-purple-400 animate-spin" />
                            <p>Querying local Exocad STL model data and computing margins...</p>
                          </div>
                        ) : aiOutputLog ? (
                          <pre className="text-xs font-mono text-purple-300 leading-relaxed bg-zinc-900/20 p-3.5 rounded-xl border border-zinc-850 overflow-y-auto max-h-[140px] scrollbar-thin">
                            {aiOutputLog}
                          </pre>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-[140px] text-zinc-600 font-mono text-xs text-center p-6 space-y-1">
                            <Sparkles className="w-6 h-6 text-zinc-700" />
                            <p className="font-bold">Awaiting AI Assistant Query</p>
                            <p className="text-[11px] text-zinc-600 max-w-sm">Select any telemetry command above to run a clinical diagnostic evaluation of active case {activeCase.id}.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-900/20 border border-zinc-900 rounded-2xl text-[10px] text-zinc-500 font-mono text-center">
                    AI recommendation is a clinical helper tool. Final dentist sign-off is mandatory before milling.
                  </div>
                </motion.div>
              )}

              {/* ==================================================
                  8. STL & FILE HUB
                  ================================================== */}
              {activeTab === 'Files' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="border-b border-zinc-900 pb-2 flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-black text-white uppercase tracking-tight">STL & CAD/CAM RAW FILE HUB</h3>
                        <p className="text-xs text-zinc-500 font-mono">Review digital impressions, antagonist scan loops, and radiographic volumes.</p>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
                        Checksum MD5 verified
                      </span>
                    </div>

                    {/* Files list table */}
                    <div className="overflow-x-auto rounded-xl border border-zinc-900 max-h-[420px] overflow-y-auto">
                      <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead>
                          <tr className="bg-zinc-950 text-zinc-500 text-[10px] uppercase font-bold border-b border-zinc-900">
                            <th className="p-3">File Name</th>
                            <th className="p-3">Format Type</th>
                            <th className="p-3">File Size</th>
                            <th className="p-3">CAD Version</th>
                            <th className="p-3">Integrity</th>
                            <th className="p-3">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
                          {activeCase.files.map((file) => (
                            <tr key={file.id} className="hover:bg-zinc-900/10">
                              <td className="p-3 text-emerald-400 font-bold">{file.name}</td>
                              <td className="p-3">{file.type}</td>
                              <td className="p-3 text-zinc-500">{file.size}</td>
                              <td className="p-3 text-white font-bold">{file.version}</td>
                              <td className="p-3">
                                <span className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold w-fit">
                                  <Check className="w-3 h-3" /> VERIFIED
                                </span>
                              </td>
                              <td className="p-3">
                                <button
                                  onClick={() => {
                                    alert(`Initiating physical download of ${file.name} (${file.size}) to local CAD directory...`);
                                  }}
                                  className="text-zinc-400 hover:text-white underline font-bold"
                                >
                                  DOWNLOAD
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500 font-bold">ACTIVE SCAN BATCH: Verified (AES-256 encrypted)</span>
                    <span className="text-zinc-500">EXOCAD REVISION COMPLIANCE: PASS</span>
                    <span className="text-emerald-400 font-bold">TOTAL RAW STORAGE: 289.4 MB</span>
                  </div>
                </motion.div>
              )}

              {/* ==================================================
                  9. MILESTONE TIMELINE
                  ================================================== */}
              {activeTab === 'Timeline' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="border-b border-zinc-900 pb-2">
                      <h3 className="text-base font-black text-white uppercase tracking-tight">Specimen Milestone Timeline</h3>
                      <p className="text-xs text-zinc-500 font-mono">Tracking case creation through CAD, milling, sintering, polishing, QC, and clinical delivery.</p>
                    </div>

                    {/* Fully chronological timeline chain */}
                    <div className="relative border-l-2 border-zinc-900 ml-4 pl-6 space-y-6 max-h-[420px] overflow-y-auto scrollbar-thin">
                      {[
                        { title: 'Case Created', desc: `Digital intraoral scan uploaded by ${activeCase.doctorName}. Prescription signed.`, date: activeCase.createdDate, completed: true, icon: CheckCircle2, color: 'text-emerald-400' },
                        { title: 'Design Started', desc: `Marcus Sterling initiated Exocad reconstruction of tooth #11 contour.`, date: '2026-07-16 11:00', completed: true, icon: CheckCircle2, color: 'text-emerald-400' },
                        { title: 'Design Approved', desc: 'Margin line fit verified. Ready for nesting on physical ceramic block.', date: 'Awaiting Clinician approval', completed: activeCase.status !== 'In Design', icon: AlertTriangle, color: activeCase.status === 'In Design' ? 'text-amber-400 animate-pulse' : 'text-emerald-400' },
                        { title: 'Manufacturing Queue', desc: '5-Axis wet diamond carving of IPS e.max CAD block.', date: 'Scheduled', completed: activeCase.status !== 'In Design' && activeCase.status !== 'Pending Files', icon: Clock, color: 'text-zinc-600' },
                        { title: 'Quality Control', desc: 'Micron-level margin fit scanning and structural density test.', date: 'Scheduled', completed: false, icon: Clock, color: 'text-zinc-600' },
                        { title: 'Clinical Delivery', desc: 'Sterilized packaging and dispatch via laboratory courier.', date: 'Scheduled', completed: false, icon: Clock, color: 'text-zinc-600' }
                      ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <div key={idx} className="relative">
                            {/* Bullet locator */}
                            <span className={`absolute -left-[31px] top-1.5 p-1 rounded-full bg-zinc-950 border-2 ${
                              item.completed ? 'border-emerald-400' : 'border-zinc-800'
                            }`}>
                              <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                            </span>

                            <div className="space-y-1">
                              <div className="flex justify-between items-baseline">
                                <h4 className={`text-xs font-black ${item.completed ? 'text-white' : 'text-zinc-500'}`}>{item.title}</h4>
                                <span className="text-[9px] font-mono text-zinc-500 font-bold">{item.date}</span>
                              </div>
                              <p className="text-[11px] text-zinc-400 font-mono leading-relaxed">{item.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl flex items-center justify-between text-xs font-mono text-zinc-500">
                    <span>ESTIMATED DELIVERY TIME: 2026-07-17 18:00</span>
                    <span>COURIER: DHL MEDICAL EXPRESS</span>
                    <span className="text-emerald-400">On Track</span>
                  </div>
                </motion.div>
              )}

              {/* ==================================================
                  10. ANALYTICS & PERFORMANCE
                  ================================================== */}
              {activeTab === 'Analytics' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="border-b border-zinc-900 pb-2 flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-black text-white uppercase tracking-tight">Laboratory Analytics & Throughput</h3>
                        <p className="text-xs text-zinc-500 font-mono">Performance metrics, remake rate curves, and material consumption curves.</p>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
                        98.5% CAD Success Rate
                      </span>
                    </div>

                    {/* Chart Container */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Production Output (Line/Area Chart) */}
                      <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl h-[220px] flex flex-col justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block border-b border-zinc-900 pb-1.5">
                          Daily CAD Case Production Output
                        </span>
                        <div className="flex-1 mt-2.5">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={PRODUCTION_CHART_DATA}>
                              <defs>
                                <linearGradient id="colComp" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                              <XAxis dataKey="name" stroke="#71717a" fontSize={9} />
                              <YAxis stroke="#71717a" fontSize={9} />
                              <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', fontSize: '10px' }} />
                              <Area type="monotone" dataKey="completed" stroke="#10b981" fillOpacity={1} fill="url(#colComp)" strokeWidth={2} name="Milled / Finished" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Material Consumption (Bar Chart) */}
                      <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl h-[220px] flex flex-col justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block border-b border-zinc-900 pb-1.5">
                          Material Consumption Ratio
                        </span>
                        <div className="flex-1 mt-2.5">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={MATERIAL_CONSUMPTION_DATA}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                              <XAxis dataKey="name" stroke="#71717a" fontSize={9} />
                              <YAxis stroke="#71717a" fontSize={9} />
                              <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', fontSize: '10px' }} />
                              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Count Used">
                                {MATERIAL_CONSUMPTION_DATA.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* Technician throughput comparison table */}
                    <div className="overflow-x-auto rounded-xl border border-zinc-900">
                      <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead>
                          <tr className="bg-zinc-950 text-zinc-500 text-[9px] uppercase font-bold border-b border-zinc-900">
                            <th className="p-2">Ceramist / Engineer</th>
                            <th className="p-2">Cases Completed</th>
                            <th className="p-2">Avg Turnaround Time</th>
                            <th className="p-2">Remake Rate</th>
                            <th className="p-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
                          {TECHNICIAN_PERFORMANCE.map((tech, idx) => (
                            <tr key={idx} className="hover:bg-zinc-900/10">
                              <td className="p-2 font-bold text-white">{tech.name}</td>
                              <td className="p-2">{tech.cases} cases</td>
                              <td className="p-2 text-zinc-400">{tech.avgTime}</td>
                              <td className="p-2 text-emerald-400 font-bold">{tech.remakeRate}</td>
                              <td className="p-2 text-emerald-400 font-bold">Optimal</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="p-3.5 bg-zinc-900/20 border border-zinc-900 rounded-2xl flex justify-between items-center text-xs font-mono text-zinc-500">
                    <span>REMAKE COST VARIANCE: -14%</span>
                    <span>TOTAL SHIPPED THIS WEEK: 114 restorations</span>
                    <span className="text-emerald-400">Excellent Output</span>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
