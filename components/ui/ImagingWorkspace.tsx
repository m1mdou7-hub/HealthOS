'use client';

import { WorkspaceSidebarNav } from './Workspace/WorkspaceSidebarNav';
import { WorkspaceTabPanel } from './Workspace/WorkspaceTabPanel';
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
  Dribbble,
  Calendar,
  User,
  ExternalLink,
  ChevronDown,
  Lock,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK INTERACTIVE IMAGING STUDIES ---
interface ImageStudy {
  id: string;
  type: 'CBCT' | 'Panoramic' | 'Bitewing' | 'Periapical' | 'Cephalometric' | 'Intraoral Photos' | 'Smile Photos' | 'Extraoral Photos';
  title: string;
  date: string;
  doctor: string;
  device: string;
  thumbnail: string;
  fav: boolean;
  comments: string;
  fileSize: string;
}

const MOCK_STUDIES: ImageStudy[] = [
  {
    id: 'ST-9021',
    type: 'CBCT',
    title: 'Maxillary 3D Segmented Osteotomy Plan',
    date: '2026-06-12',
    doctor: 'Dr. Elena Rostova',
    device: 'Planmeca ProMax 3D Max',
    thumbnail: 'CBCT',
    fav: true,
    comments: 'Bone height in site #11 is 11.5mm, width 7.2mm. No sinus encroachment.',
    fileSize: '142 MB'
  },
  {
    id: 'ST-7182',
    type: 'Panoramic',
    title: 'Panoramic OPG (Orthopantomogram)',
    date: '2026-06-12',
    doctor: 'Dr. Elena Rostova',
    device: 'Carestream CS 8100 3D',
    thumbnail: 'PANO',
    fav: true,
    comments: 'Dentition stable. Congenitally missing #11. Localized bone resorption noted.',
    fileSize: '12 MB'
  },
  {
    id: 'ST-3024',
    type: 'Bitewing',
    title: 'Posterior Bite-wing Check',
    date: '2026-05-10',
    doctor: 'Dr. Elena Rostova',
    device: 'Dexis Titanium Sensor',
    thumbnail: 'BW',
    fav: false,
    comments: 'Incipient enamel caries detected on distal surface of #14. High monitoring priority.',
    fileSize: '4.2 MB'
  },
  {
    id: 'ST-4081',
    type: 'Periapical',
    title: 'Root-X Check #19 Endodontic Control',
    date: '2026-05-10',
    doctor: 'Dr. Elena Rostova',
    device: 'Dexis Titanium Sensor',
    thumbnail: 'PA',
    fav: false,
    comments: 'Obturated root canals of tooth #19 showing complete apical seal with no periapical lesion.',
    fileSize: '4.0 MB'
  },
  {
    id: 'ST-5099',
    type: 'Intraoral Photos',
    title: 'Upper Prep IOS Scanning High-Res',
    date: '2026-06-12',
    doctor: 'Dr. Elena Rostova',
    device: '3Shape TRIOS 5 Wireless',
    thumbnail: 'IOS',
    fav: true,
    comments: 'Accurate model generation for Exocad design of tooth #11 custom abutment.',
    fileSize: '89 MB'
  },
  {
    id: 'ST-1011',
    type: 'Smile Photos',
    title: 'DSD Diagnostic Portrait (Before)',
    date: '2026-05-08',
    doctor: 'Dr. Elena Rostova',
    device: 'Nikon D7500 - Ring Flash',
    thumbnail: 'SMILE_B',
    fav: true,
    comments: 'Initial portrait showing high smile line with asymmetrical gingival contour at #11 zone.',
    fileSize: '18 MB'
  },
  {
    id: 'ST-1012',
    type: 'Smile Photos',
    title: 'DSD Simulated Aesthetic Frame (After)',
    date: '2026-05-10',
    doctor: 'Dr. Elena Rostova',
    device: 'DSD CAD Generator Tool',
    thumbnail: 'SMILE_A',
    fav: true,
    comments: 'Aesthetic simulation following NobelActive implant and custom crown placement.',
    fileSize: '19 MB'
  },
  {
    id: 'ST-8812',
    type: 'Cephalometric',
    title: 'Lateral Cephalometric Profile Analysis',
    date: '2026-03-15',
    doctor: 'Dr. Elena Rostova',
    device: 'Orthophos SL 3D',
    thumbnail: 'CEPH',
    fav: false,
    comments: 'Skeletal Class I jaw relation. Balanced profile with optimal incisal inclination.',
    fileSize: '8.5 MB'
  }
];

// --- ANNOTATIONS / BOOKMARKS (CBCT) ---
interface CBCTAnnotation {
  id: string;
  sliceNum: number;
  label: string;
  type: 'Distance' | 'Angle' | 'Density';
  value: string;
}

const INITIAL_ANNOTATIONS: CBCTAnnotation[] = [
  { id: 'ANN-1', sliceNum: 45, label: 'Bone thickness at #11 extraction socket', type: 'Distance', value: '7.2 mm' },
  { id: 'ANN-2', sliceNum: 45, label: 'Interdental distance (#12 to #21)', type: 'Distance', value: '8.1 mm' },
  { id: 'ANN-3', sliceNum: 60, label: 'Cortical bone density profile', type: 'Density', value: '950 HU' },
  { id: 'ANN-4', sliceNum: 30, label: 'Nasal floor proximity angle', type: 'Angle', value: '14.2°' }
];

// --- VERSION LISTING FOR STL ---
interface StlVersion {
  version: string;
  date: string;
  author: string;
  fileSize: string;
  notes: string;
}

const STL_VERSION_HISTORY: StlVersion[] = [
  { version: 'v3_final_restoration', date: '2026-06-15', author: 'Dr. Elena Rostova', fileSize: '48.2 MB', notes: 'Exocad final design of zirconia custom abutment.' },
  { version: 'v2_digital_waxup', date: '2026-05-12', author: 'Dental Lab Tech', fileSize: '34.1 MB', notes: 'Virtual mock-up for patient approval.' },
  { version: 'v1_initial_ios_scan', date: '2026-05-10', author: 'Dr. Elena Rostova', fileSize: '28.9 MB', notes: 'Pre-operative upper and lower dental arch scans.' }
];

export default function ImagingWorkspace() {
  // General UI States
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'Library' | 'CBCT' | 'STL' | 'SmileDesign' | 'AI' | 'Timeline'>('Library');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'Grid' | 'List'>('Grid');
  const [studies, setStudies] = useState<ImageStudy[]>(MOCK_STUDIES);
  
  // Resizable sidebar logic mockup
  const [sidebarWidth, setSidebarWidth] = useState<number>(310);
  const isResizing = useRef(false);

  // PACS Control adjustments (Mock Brightness, Contrast, Zoom)
  const [pacsContrast, setPacsContrast] = useState<number>(50);
  const [pacsBrightness, setPacsBrightness] = useState<number>(50);
  const [pacsZoom, setPacsZoom] = useState<number>(100);

  // CBCT Interactive States
  const [activeSlice, setActiveSlice] = useState<number>(45);
  const [cbctAnnotations, setCbctAnnotations] = useState<CBCTAnnotation[]>(INITIAL_ANNOTATIONS);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string>('ANN-1');
  const [measurementTool, setMeasurementTool] = useState<'None' | 'Distance' | 'Angle' | 'Density'>('None');
  const [placedClicks, setPlacedClicks] = useState<{ x: number; y: number }[]>([]);

  // STL Mesh interactive states
  const [activeStlLayer, setActiveStlLayer] = useState<'Upper' | 'Lower' | 'Bite' | 'Waxup' | 'Prep' | 'Final'>('Upper');
  const [meshRotateX, setMeshRotateX] = useState<number>(30);
  const [meshRotateY, setMeshRotateY] = useState<number>(45);
  const [stlComments, setStlComments] = useState<string[]>([
    'Preparation margins for #11 are extremely sharp and clean.',
    'Bite scan aligned with 3-point digital buccal lock.'
  ]);
  const [newStlComment, setNewStlComment] = useState('');

  // Smile Design States
  const [smileAfterActive, setSmileAfterActive] = useState<boolean>(true);
  const [showMidline, setShowMidline] = useState<boolean>(true);
  const [showSmileLine, setShowSmileLine] = useState<boolean>(true);
  const [showOcclusal, setShowOcclusal] = useState<boolean>(true);
  const [showProportions, setShowProportions] = useState<boolean>(true);
  const [showGoldenRatio, setShowGoldenRatio] = useState<boolean>(false);
  const [midlineX, setMidlineX] = useState<number>(50); // percentage slider
  const [proportionY, setProportionY] = useState<number>(40);

  // AI Imaging Module States
  const [aiAnalysisLog, setAiAnalysisLog] = useState<string>('');
  const [aiHighlighterOn, setAiHighlighterOn] = useState<boolean>(false);
  const [aiReportModalOpen, setAiReportModalOpen] = useState<boolean>(false);
  const [aiReportLoading, setAiReportLoading] = useState<boolean>(false);

  // Export States
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'PDF' | 'ZIP' | 'DICOM' | 'STL' | 'JPEG'>('DICOM');

  // Sidebar drag handle
  const handleMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = Math.max(200, Math.min(500, e.clientX - 100)); // bound constraints
    setSidebarWidth(newWidth);
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Toggle Favorite
  const toggleFavoriteStudy = (id: string) => {
    setStudies(prev => prev.map(s => s.id === id ? { ...s, fav: !s.fav } : s));
  };

  // Filter Studies
  const filteredStudies = useMemo(() => {
    return studies.filter(s => {
      const matchSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = filterType === 'All' || s.type === filterType;
      return matchSearch && matchType;
    });
  }, [studies, searchQuery, filterType]);

  // CBCT Interactive clicking simulation
  const handleCbctCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (measurementTool === 'None') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    
    const newClicks = [...placedClicks, { x, y }];
    setPlacedClicks(newClicks);

    if (measurementTool === 'Distance' && newClicks.length === 2) {
      // Calculate mock distance based on pixel delta
      const dx = newClicks[0].x - newClicks[1].x;
      const dy = newClicks[0].y - newClicks[1].y;
      const dist = (Math.sqrt(dx * dx + dy * dy) * 0.05).toFixed(1); // simulated 1px = 0.05mm
      
      const newAnn: CBCTAnnotation = {
        id: `ANN-${Date.now()}`,
        sliceNum: activeSlice,
        label: `User Distance Measurement Slice #${activeSlice}`,
        type: 'Distance',
        value: `${dist} mm`
      };
      setCbctAnnotations([newAnn, ...cbctAnnotations]);
      setSelectedAnnotationId(newAnn.id);
      setPlacedClicks([]);
      setMeasurementTool('None');
    } else if (measurementTool === 'Density') {
      // Direct sample density
      const randomHU = Math.floor(Math.random() * 400) + 800; // Bone range
      const newAnn: CBCTAnnotation = {
        id: `ANN-${Date.now()}`,
        sliceNum: activeSlice,
        label: `User sampled Bone Density Slice #${activeSlice}`,
        type: 'Density',
        value: `${randomHU} HU (Bone density)`
      };
      setCbctAnnotations([newAnn, ...cbctAnnotations]);
      setSelectedAnnotationId(newAnn.id);
      setPlacedClicks([]);
      setMeasurementTool('None');
    } else if (measurementTool === 'Angle' && newClicks.length === 3) {
      const angleVal = (Math.floor(Math.random() * 30) + 10).toFixed(1);
      const newAnn: CBCTAnnotation = {
        id: `ANN-${Date.now()}`,
        sliceNum: activeSlice,
        label: `User Angle Measurement Slice #${activeSlice}`,
        type: 'Angle',
        value: `${angleVal}°`
      };
      setCbctAnnotations([newAnn, ...cbctAnnotations]);
      setSelectedAnnotationId(newAnn.id);
      setPlacedClicks([]);
      setMeasurementTool('None');
    }
  };

  // Add Comment to STL history
  const addStlCommentHandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStlComment.trim()) return;
    setStlComments([newStlComment, ...stlComments]);
    setNewStlComment('');
  };

  // Trigger simulated AI Analysis
  const triggerAiAnalysis = (type: 'findings' | 'implant' | 'density' | 'smile' | 'margins') => {
    setAiAnalysisLog('');
    if (type === 'findings') {
      setAiAnalysisLog(
        `**AI RADIOGRAPHIC FINDINGS Study ST-9021**\n` +
        `• Maxillary Right Lateral Incisor Site (#11): Alveolar bone height of 11.5mm, cortical width 7.2mm.\n` +
        `• Apical pathology analysis: Zero periapical radiolucency around teeth #12 and #21.\n` +
        `• Pathology alert: Incipient enamel-dentin lesion verified on Distal #14. Recommended Class I composite.`
      );
    } else if (type === 'implant') {
      setAiAnalysisLog(
        `**AI IMPLANT PLANNING FEASIBILITY SUMMARY (#11 Zone)**\n` +
        `• Primary Recommendation: NobelActive 4.3mm diameter x 11.5mm length titanium implant fixture.\n` +
        `• Prosthetic outcome: Optimal 3.2mm screw access channel alignment with maximum bone anchorage.\n` +
        `• Sinus Clearance: 6.4mm clear path to adjacent Maxillary Sinus floor.`
      );
    } else if (type === 'density') {
      setAiAnalysisLog(
        `**AI BONE DENSITY ANALYSIS (Hounsfield Profile)**\n` +
        `• Average density in osteotomy zone #11: 890 HU (Type D2 bone - Excellent primary stability profile).\n` +
        `• Cortical shell thickness: 1.8mm at crest, 2.1mm buccal aspect.`
      );
    } else if (type === 'smile') {
      setAiAnalysisLog(
        `**AI DIGITAL SMILE PROPORTION REPORT**\n` +
        `• Maxillary Central Incisor Proportion: 81% width-to-length ratio (Ideal standard: 80%).\n` +
        `• Golden Ratio match score: 94.2% structural compliance.\n` +
        `• Incisal curvature alignment: Follows lower lip margin with less than 0.5mm asymmetrical variance.`
      );
    } else if (type === 'margins') {
      setAiAnalysisLog(
        `**AI MARGIN STABILITY & PREPARATION RUNS**\n` +
        `• Preparation boundary scan tooth #11: Sharpness index 98.2%.\n` +
        `• No undercut zones or digital overlap anomalies detected. Seamless custom abutment mating verified.`
      );
    }
  };

  // Simulated Report compilation
  const compileAndGenerateReport = () => {
    setAiReportLoading(true);
    setTimeout(() => {
      setAiReportLoading(false);
      setAiReportModalOpen(true);
    }, 1200);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden flex flex-col shadow-2xl h-[780px] font-sans antialiased text-zinc-100 relative">
      
      {/* PACS TITLE / META STRIP */}
      <div className="bg-zinc-900/80 border-b border-zinc-900 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20">
            <Compass className="w-5 h-5 text-emerald-400 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-white">HealthOS Imaging Studio Pro</h2>
              <span className="bg-zinc-800 text-[9px] font-mono font-bold text-zinc-400 px-1.5 py-0.5 rounded">V2.4.9-PACS</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono">Amelia Vance • EHR-2026-9482 • HIPAA-Encrypted Client Session</p>
          </div>
        </div>

        {/* WORKSPACE SELECTOR TAB GROUP */}
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          {(['Library', 'CBCT', 'STL', 'SmileDesign', 'AI', 'Timeline'] as const).map(tab => {
            const isActive = activeWorkspaceTab === tab;
            let displayLabel: string = tab;
            if (tab === 'SmileDesign') displayLabel = 'Smile Design';
            if (tab === 'AI') displayLabel = 'AI Imaging';

            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveWorkspaceTab(tab);
                  setPlacedClicks([]);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all uppercase tracking-wider cursor-pointer ${
                  isActive 
                    ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/10' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {displayLabel}
              </button>
            );
          })}
        </div>

        {/* METADATA EXPORT / SYSTEM STATUS */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-[10px] bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-mono font-bold">
            <Shield className="w-3.5 h-3.5" /> DICOM STREAM COMPLIANT
          </div>
          <button
            onClick={() => setExportModalOpen(true)}
            className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> EXPORT
          </button>
        </div>
      </div>

      {/* PACS INTERACTION AREA */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* RESIZABLE SIDEBAR STUDY SELECTOR / SCAN PARAMETERS */}
        <div 
          style={{ width: `${sidebarWidth}px` }}
          className="bg-zinc-900 border-r border-zinc-900 flex flex-col shrink-0 overflow-hidden select-none"
        >
          {/* SEARCH & FILTER FOR CURRENT TAB */}
          <div className="p-4 border-b border-zinc-900 space-y-3 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">PACS Study Explorer</span>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scans, dates, or devices..."
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 text-xs rounded-xl outline-none focus:border-emerald-500 text-white font-mono placeholder:text-zinc-600"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1">
              {['All', 'CBCT', 'Panoramic', 'Bitewing', 'Periapical', 'Intraoral Photos', 'Smile Photos'].map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    filterType === t 
                      ? 'bg-zinc-800 text-white border border-zinc-700' 
                      : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* CHRONOLOGICAL STUDY LIST */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
            {filteredStudies.map((study) => (
              <div
                key={study.id}
                onClick={() => {
                  // Route view change depending on study clicked
                  if (study.type === 'CBCT') setActiveWorkspaceTab('CBCT');
                  else if (study.type === 'Intraoral Photos') setActiveWorkspaceTab('STL');
                  else if (study.type === 'Smile Photos') setActiveWorkspaceTab('SmileDesign');
                  else setActiveWorkspaceTab('Library');
                }}
                className="p-3 bg-zinc-950/60 hover:bg-zinc-950 rounded-xl border border-zinc-850 hover:border-emerald-500/40 cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex justify-between items-start">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-zinc-900 border border-zinc-800 text-emerald-400">
                    {study.type}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500 font-mono font-bold">{study.date}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteStudy(study.id);
                      }}
                      className={`text-xs ${study.fav ? 'text-amber-400' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                      ★
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors leading-tight">
                    {study.title}
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    Device: {study.device} • {study.fileSize}
                  </p>
                </div>

                <p className="text-[10px] text-zinc-400 italic leading-snug border-t border-zinc-900/60 pt-1.5">
                  &ldquo;{study.comments}&rdquo;
                </p>
              </div>
            ))}

            {filteredStudies.length === 0 && (
              <p className="text-center text-xs text-zinc-600 italic py-10 font-mono">No matching PACS studies found.</p>
            )}
          </div>

          {/* IMAGE WORKSTATION REBUILD DIALOGS */}
          <div className="p-4 bg-zinc-950/80 border-t border-zinc-900 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono">Workstation Calibration</span>
              <button 
                onClick={() => {
                  setPacsContrast(50);
                  setPacsBrightness(50);
                  setPacsZoom(100);
                }} 
                className="text-[9px] font-mono text-emerald-400 hover:underline uppercase"
              >
                Reset
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-[10px] text-zinc-400">
                <span>Contrast: {pacsContrast}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={pacsContrast}
                  onChange={(e) => setPacsContrast(Number(e.target.value))}
                  className="w-24 accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-400">
                <span>Brightness: {pacsBrightness}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={pacsBrightness}
                  onChange={(e) => setPacsBrightness(Number(e.target.value))}
                  className="w-24 accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-400">
                <span>Zoom Level: {pacsZoom}%</span>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={pacsZoom}
                  onChange={(e) => setPacsZoom(Number(e.target.value))}
                  className="w-24 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* DRAG HANDLE FOR RESIZER */}
        <div 
          onMouseDown={handleMouseDown}
          className="w-1.5 bg-zinc-900 hover:bg-emerald-500/40 cursor-col-resize flex items-center justify-center shrink-0 transition-colors"
        >
          <div className="w-0.5 h-10 bg-zinc-800 rounded" />
        </div>

        {/* WORKSPACE DETAIL CANVAS AREA */}
        <div className="flex-1 bg-zinc-950 flex flex-col overflow-hidden relative">
          
          <div className="flex-1 overflow-hidden p-6">
            <AnimatePresence mode="wait">
              
              {/* ==================================================
                  1. LIBRARY TAB
                  ================================================== */}
              {activeWorkspaceTab === 'Library' && (
                <WorkspaceTabPanel
                  className="h-full flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                      <div>
                        <h3 className="text-base font-black text-white uppercase tracking-tight">PACS Multi-Study Library</h3>
                        <p className="text-xs text-zinc-500 font-mono">Overview of high-density radiological scans stored in Amelia&apos;s chart.</p>
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

                    {viewMode === 'Grid' ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[460px] pr-1">
                        {filteredStudies.map((study) => (
                          <div
                            key={study.id}
                            className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex flex-col justify-between h-[155px]"
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-[9px] font-bold font-mono bg-zinc-900 border border-zinc-850 text-zinc-400 px-1.5 py-0.5 rounded">
                                {study.type}
                              </span>
                              <span className="text-[9px] font-mono text-zinc-500 font-bold">{study.date}</span>
                            </div>

                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-zinc-200 line-clamp-1">{study.title}</h4>
                              <p className="text-[10px] text-zinc-500 font-mono line-clamp-2 leading-snug">
                                {study.comments}
                              </p>
                            </div>

                            <div className="flex justify-between items-center border-t border-zinc-900/60 pt-2 text-[9px] font-mono text-zinc-500">
                              <span>{study.id}</span>
                              <button
                                onClick={() => {
                                  if (study.type === 'CBCT') setActiveWorkspaceTab('CBCT');
                                  else if (study.type === 'Intraoral Photos') setActiveWorkspaceTab('STL');
                                  else if (study.type === 'Smile Photos') setActiveWorkspaceTab('SmileDesign');
                                }}
                                className="text-emerald-400 hover:underline font-bold"
                              >
                                LAUNCH &rarr;
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-zinc-900 max-h-[460px] overflow-y-auto">
                        <table className="w-full text-left border-collapse text-xs font-mono">
                          <thead>
                            <tr className="bg-zinc-950 text-zinc-500 text-[10px] uppercase font-bold border-b border-zinc-900">
                              <th className="p-3">ID</th>
                              <th className="p-3">Study Type</th>
                              <th className="p-3">Title</th>
                              <th className="p-3">Physician</th>
                              <th className="p-3">File Size</th>
                              <th className="p-3">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
                            {filteredStudies.map((study) => (
                              <tr key={study.id} className="hover:bg-zinc-900/20">
                                <td className="p-3 text-emerald-400 font-bold">{study.id}</td>
                                <td className="p-3"><span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-850 text-zinc-400">{study.type}</span></td>
                                <td className="p-3 font-semibold text-zinc-100">{study.title}</td>
                                <td className="p-3">{study.doctor}</td>
                                <td className="p-3 text-zinc-500">{study.fileSize}</td>
                                <td className="p-3">
                                  <button
                                    onClick={() => {
                                      if (study.type === 'CBCT') setActiveWorkspaceTab('CBCT');
                                      else if (study.type === 'Intraoral Photos') setActiveWorkspaceTab('STL');
                                      else if (study.type === 'Smile Photos') setActiveWorkspaceTab('SmileDesign');
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

                  {/* QUICK STATS FOR EXCELSIOR PACS */}
                  <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-500 font-bold">PACS ARCHIVE SIZE:</span>
                      <span className="text-zinc-300">308.9 MB</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-500 font-bold">TOTAL SCANS:</span>
                      <span className="text-emerald-400 font-bold">8</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-500 font-bold">PACS LATENCY:</span>
                      <span className="text-emerald-400 font-bold">&lt; 14ms</span>
                    </div>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  2. CBCT WORKSPACE (PACS 4-PLANE WORKSTATION)
                  ================================================== */}
              {activeWorkspaceTab === 'CBCT' && (
                <WorkspaceTabPanel
                  className="h-full flex flex-col lg:flex-row gap-5"
                >
                  {/* Grid of planes (Viewer Panel) */}
                  <div className="flex-1 grid grid-cols-2 gap-3 h-full">
                    
                    {/* PLANE 1: AXIAL SLICE */}
                    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden group">
                      <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono z-10">
                        <span className="font-bold text-white uppercase bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">AXIAL VIEW</span>
                        <span>Slice {activeSlice}/120</span>
                      </div>
                      
                      {/* Interactive Canvas */}
                      <div 
                        onClick={handleCbctCanvasClick}
                        className="flex-1 relative flex items-center justify-center cursor-crosshair m-2 select-none"
                        style={{
                          filter: `contrast(${pacsContrast}%) brightness(${pacsBrightness}%)`,
                          transform: `scale(${pacsZoom / 100})`
                        }}
                      >
                        {/* Background Mock CBCT axial scan representation */}
                        <div className="absolute inset-0 bg-radial-gradient-axial rounded-full opacity-65 border-4 border-dashed border-zinc-850" />
                        <div className="w-24 h-24 rounded-full border border-zinc-700/40 relative flex items-center justify-center">
                          <span className="text-[10px] font-bold font-mono text-zinc-600 uppercase">Maxilla #11 Ortho</span>
                          {/* Dental Arch trace line */}
                          <div className="absolute inset-2 border-2 border-dashed border-emerald-500/20 rounded-full" />
                          {/* Implant fixture outline */}
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-8 bg-emerald-500/10 border border-emerald-400/40 rounded flex flex-col justify-between items-center" title="Preplanned NobelActive site">
                            <span className="text-[7px] text-emerald-400 font-black scale-90">11</span>
                            <div className="w-full h-0.5 bg-emerald-500/40" />
                            <div className="w-full h-0.5 bg-emerald-500/40" />
                          </div>
                        </div>

                        {/* Renders clicked clicks for measurement */}
                        {placedClicks.map((click, i) => (
                          <div 
                            key={i} 
                            style={{ left: `${click.x}px`, top: `${click.y}px` }} 
                            className="absolute w-2 h-2 rounded-full bg-rose-500 border border-white -translate-x-1/2 -translate-y-1/2"
                          />
                        ))}
                      </div>

                      <div className="text-[9px] text-zinc-500 font-mono flex justify-between z-10">
                        <span>FOV: 80 x 80 mm</span>
                        <span>Res: 0.15 mm</span>
                      </div>
                    </div>

                    {/* PLANE 2: CORONAL SLICE */}
                    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden">
                      <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono z-10">
                        <span className="font-bold text-white uppercase bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">CORONAL VIEW</span>
                        <span>Slice {activeSlice}/120</span>
                      </div>

                      <div 
                        className="flex-1 relative flex items-center justify-center m-2 select-none"
                        style={{
                          filter: `contrast(${pacsContrast}%) brightness(${pacsBrightness}%)`,
                          transform: `scale(${pacsZoom / 100})`
                        }}
                      >
                        {/* Simulates cross-sectional sinuses and tooth root */}
                        <div className="space-y-4 text-center">
                          <div className="w-40 h-20 rounded-t-full border border-dashed border-zinc-850/60 relative flex items-center justify-center">
                            <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest absolute top-2">Sinus Cavity</span>
                          </div>
                          <div className="w-16 h-12 bg-zinc-900/40 border border-zinc-800 rounded-b-xl relative flex items-center justify-center mx-auto">
                            <div className="w-1.5 h-10 bg-amber-500/30 rounded" title="Root canal obturation control" />
                          </div>
                        </div>
                      </div>

                      <div className="text-[9px] text-zinc-500 font-mono flex justify-between z-10">
                        <span>L/R Orientation</span>
                        <span>90 kVp • 10.0 mA</span>
                      </div>
                    </div>

                    {/* PLANE 3: SAGITTAL SLICE */}
                    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden">
                      <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono z-10">
                        <span className="font-bold text-white uppercase bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">SAGITTAL VIEW</span>
                        <span>Slice {activeSlice}/120</span>
                      </div>

                      <div 
                        className="flex-1 relative flex items-center justify-center m-2 select-none"
                        style={{
                          filter: `contrast(${pacsContrast}%) brightness(${pacsBrightness}%)`,
                          transform: `scale(${pacsZoom / 100})`
                        }}
                      >
                        {/* Alveolar bone profile simulation */}
                        <div className="w-24 h-40 bg-zinc-900/60 border border-zinc-800 rounded-r-3xl relative flex flex-col justify-around p-3">
                          <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-wider">Crestal Alveolar Bone</span>
                          <div className="w-full h-1 bg-emerald-500/30 rounded" />
                          <div className="w-2/3 h-1 bg-emerald-500/30 rounded" />
                        </div>
                      </div>

                      <div className="text-[9px] text-zinc-500 font-mono flex justify-between z-10">
                        <span>A/P Orientation</span>
                        <span>Exp time: 14.8 s</span>
                      </div>
                    </div>

                    {/* PLANE 4: 3D RECONSTRUCTION */}
                    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden">
                      <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono z-10">
                        <span className="font-bold text-white uppercase bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">3D RECONSTRUCTION</span>
                        <span>VOLUMETRIC RENDER</span>
                      </div>

                      {/* Volumetric skull mock render */}
                      <div className="flex-1 relative flex items-center justify-center m-2 select-none">
                        <div className="w-32 h-32 rounded-full bg-zinc-900/30 border-2 border-emerald-500/10 flex items-center justify-center relative animate-pulse">
                          <Layers className="w-12 h-12 text-emerald-400 opacity-20" />
                          <div className="absolute inset-0 border border-emerald-400/15 rounded-full rotate-45" />
                          <div className="absolute inset-2 border border-emerald-400/10 rounded-full -rotate-12" />
                          <span className="absolute text-[9px] text-emerald-400 uppercase tracking-widest font-bold">Volumetric Mesh</span>
                        </div>
                      </div>

                      <div className="text-[9px] text-zinc-500 font-mono flex justify-between z-10">
                        <span>Model: Amelia_Maxilla_Recon</span>
                        <span>Verts: 2,408,122</span>
                      </div>
                    </div>

                  </div>

                  {/* CBCT Panel controls, bookmarks & measurements (Right col) */}
                  <div className="w-full lg:w-72 bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                    <div className="space-y-4">
                      
                      {/* Active Study info */}
                      <div className="border-b border-zinc-900 pb-3">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">Study Context</span>
                        <h4 className="text-xs font-bold text-white">Planmeca CBCT 3D Maxillary Scan</h4>
                        <span className="text-[10px] text-zinc-400 font-mono font-bold">Slice Height control</span>
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="range"
                            min="1"
                            max="120"
                            value={activeSlice}
                            onChange={(e) => {
                              setActiveSlice(Number(e.target.value));
                              setPlacedClicks([]);
                            }}
                            className="flex-1 accent-emerald-500 cursor-pointer"
                          />
                          <span className="text-[11px] font-mono text-zinc-300 bg-zinc-950 border border-zinc-850 px-2 py-0.5 rounded font-bold">
                            {activeSlice}
                          </span>
                        </div>
                      </div>

                      {/* Measurement Tool Selector */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">PACS Calipers</span>
                        <div className="grid grid-cols-3 gap-1">
                          {(['Distance', 'Angle', 'Density'] as const).map(tool => (
                            <button
                              key={tool}
                              onClick={() => {
                                setMeasurementTool(measurementTool === tool ? 'None' : tool);
                                setPlacedClicks([]);
                              }}
                              className={`py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                                measurementTool === tool 
                                  ? 'bg-rose-500 border-rose-400 text-white' 
                                  : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-white'
                              }`}
                            >
                              {tool}
                            </button>
                          ))}
                        </div>
                        {measurementTool !== 'None' && (
                          <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[9px] text-rose-300 font-mono text-center animate-pulse">
                            CALIPER ACTIVE: Click on the AXIAL VIEW to place points.
                          </div>
                        )}
                      </div>

                      {/* Radiographic annotations */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center border-b border-zinc-900 pb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono">Bookmarks</span>
                          <span className="text-[9px] font-mono text-zinc-600 font-bold">4 REGISTERED</span>
                        </div>
                        <div className="space-y-1.5 max-h-[160px] overflow-y-auto scrollbar-none">
                          {cbctAnnotations.map((ann) => {
                            const isSel = selectedAnnotationId === ann.id;
                            return (
                              <div
                                key={ann.id}
                                onClick={() => {
                                  setSelectedAnnotationId(ann.id);
                                  setActiveSlice(ann.sliceNum);
                                }}
                                className={`p-2 rounded-xl text-xs font-mono cursor-pointer transition-all border ${
                                  isSel 
                                    ? 'bg-zinc-950 border-emerald-500/40' 
                                    : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800'
                                }`}
                              >
                                <div className="flex justify-between font-bold text-[10px] mb-0.5">
                                  <span className="text-zinc-400 truncate w-[130px]">{ann.label}</span>
                                  <span className="text-emerald-400 font-black">{ann.value}</span>
                                </div>
                                <div className="flex justify-between text-[9px] text-zinc-600">
                                  <span>Type: {ann.type}</span>
                                  <span>Slice #{ann.sliceNum}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 text-[10px] text-zinc-500 font-mono space-y-1">
                      <span className="text-zinc-400 font-bold uppercase tracking-wider block">Diagnostics metadata:</span>
                      <p>Dose Index: 145 &mu;Gy</p>
                      <p>Matrix: 512 x 512 x 512 px</p>
                      <p>Scan duration: 14.8 seconds</p>
                    </div>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  3. STL WORKSPACE (MESH VIEWER & STL LOGS)
                  ================================================== */}
              {activeWorkspaceTab === 'STL' && (
                <WorkspaceTabPanel
                  className="h-full flex flex-col lg:flex-row gap-5"
                >
                  
                  {/* Rotating point cloud canvas simulation (Workstation viewport) */}
                  <div className="flex-1 bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden select-none">
                    <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono z-10">
                      <span className="font-bold text-white uppercase bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                        EXOCAD CAD/CAM VIEWPORT
                      </span>
                      <span>MESH ORIENTATION X: {meshRotateX}° Y: {meshRotateY}°</span>
                    </div>

                    {/* Layer selection tabs */}
                    <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-850 z-10 self-center">
                      {(['Upper', 'Lower', 'Bite', 'Waxup', 'Prep', 'Final'] as const).map(lay => (
                        <button
                          key={lay}
                          onClick={() => {
                            setActiveStlLayer(lay);
                            setMeshRotateX(Math.floor(Math.random() * 60) + 10);
                            setMeshRotateY(Math.floor(Math.random() * 60) + 10);
                          }}
                          className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all uppercase cursor-pointer ${
                            activeStlLayer === lay 
                              ? 'bg-emerald-500 text-zinc-950 font-black' 
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {lay}
                        </button>
                      ))}
                    </div>

                    {/* Interactive Rotating Graphic Area */}
                    <div 
                      onMouseMove={(e) => {
                        // Drag rotation effect simulation
                        if (e.buttons === 1) {
                          setMeshRotateY(prev => (prev + e.movementX) % 360);
                          setMeshRotateX(prev => (prev + e.movementY) % 360);
                        }
                      }}
                      className="flex-1 relative flex items-center justify-center cursor-grab active:cursor-grabbing"
                    >
                      {/* Simulates teeth mesh rotation using CSS 3D Transforms or custom path projection */}
                      <div 
                        style={{
                          transform: `rotateX(${meshRotateX}deg) rotateY(${meshRotateY}deg)`,
                          transformStyle: 'preserve-3d',
                          transition: 'transform 0.05s ease-out'
                        }}
                        className="w-48 h-48 relative flex items-center justify-center"
                      >
                        {/* Wireframe simulated teeth outline */}
                        <div className="absolute inset-0 border-2 border-dashed border-emerald-500/20 rounded-full" />
                        <div className="absolute inset-6 border-2 border-emerald-400/10 rounded-full" />
                        
                        {/* Dental Arch mesh wire elements */}
                        {Array.from({ length: 8 }).map((_, idx) => (
                          <div
                            key={idx}
                            style={{
                              transform: `rotate(${idx * 45}deg) translateZ(${idx * 10}px)`,
                              transformStyle: 'preserve-3d'
                            }}
                            className="absolute w-24 h-12 border border-emerald-500/15 rounded-b-full bg-emerald-500/[0.02]"
                          >
                            {/* Glowing tooth coordinates */}
                            <div className="absolute top-0 left-0 w-2 h-2 bg-emerald-400/40 rounded-full animate-ping" />
                            <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-400/40 rounded-full" />
                          </div>
                        ))}
                      </div>

                      <div className="absolute bottom-4 left-4 p-3 bg-zinc-900/60 border border-zinc-850 rounded-xl text-[9px] font-mono text-zinc-400 space-y-1">
                        <span className="text-white font-bold block uppercase">Analysis Findings</span>
                        <p>Mesh Triangle Count: 89,450</p>
                        <p>Mesh Margin Proximity: 99.1% (Ideal)</p>
                        <p>Bite Pressure Score: 94% (Stable occlusion)</p>
                      </div>
                    </div>

                    <div className="text-[9px] text-zinc-500 font-mono flex justify-between z-10">
                      <span>Drag with primary mouse button to rotate STL mesh.</span>
                      <span>Format: .STL ASCII</span>
                    </div>

                  </div>

                  {/* Comments, version history & specifications (Right col) */}
                  <div className="w-full lg:w-72 bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                    <div className="space-y-4">
                      
                      {/* Scan Metadata */}
                      <div className="border-b border-zinc-900 pb-3 space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">Active STL Context</span>
                        <h4 className="text-xs font-bold text-white">Tooth #11 Prosthetic Wax-up Scan</h4>
                        <span className="text-[10px] text-zinc-400 font-mono font-bold block">Author: Dr. Elena Rostova</span>
                      </div>

                      {/* STL Comment Thread */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">Exocad Comments</span>
                        <div className="space-y-1.5 max-h-[140px] overflow-y-auto scrollbar-none">
                          {stlComments.map((com, idx) => (
                            <div key={idx} className="p-2 bg-zinc-950 rounded-xl border border-zinc-900 text-[10px] font-mono text-zinc-300">
                              {com}
                            </div>
                          ))}
                        </div>
                        <form onSubmit={addStlCommentHandler} className="flex gap-1 pt-1">
                          <input
                            type="text"
                            value={newStlComment}
                            onChange={(e) => setNewStlComment(e.target.value)}
                            placeholder="Add CAD note..."
                            className="flex-1 px-2 py-1 bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-300 rounded outline-none focus:border-emerald-500"
                          />
                          <button
                            type="submit"
                            className="px-2 py-1 bg-emerald-500 text-zinc-950 text-[10px] font-mono font-bold rounded hover:bg-emerald-400 transition-colors cursor-pointer"
                          >
                            SEND
                          </button>
                        </form>
                      </div>

                      {/* STL Version History */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center border-b border-zinc-900 pb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono">Version History</span>
                          <span className="text-[9px] font-mono text-zinc-600 font-bold">3 DIGITAL SAVES</span>
                        </div>
                        <div className="space-y-1.5 max-h-[140px] overflow-y-auto scrollbar-none text-[10px] font-mono">
                          {STL_VERSION_HISTORY.map((hist, idx) => (
                            <div key={idx} className="p-2 bg-zinc-950/40 border border-zinc-900 rounded-xl space-y-1">
                              <div className="flex justify-between font-bold text-[9px] text-zinc-300">
                                <span className="text-emerald-400">{hist.version}</span>
                                <span>{hist.date}</span>
                              </div>
                              <p className="text-[9px] text-zinc-500 leading-tight">{hist.notes}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 text-[10px] text-zinc-500 font-mono space-y-1">
                      <span className="text-zinc-400 font-bold uppercase tracking-wider block">STL Volume info:</span>
                      <p>Watertight Solid: YES</p>
                      <p>Slicing profile: 0.02mm</p>
                      <p>Milling calibration: OK</p>
                    </div>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  4. SMILE DESIGN (AESTHETIC PORTRAIT SLIDERS)
                  ================================================== */}
              {activeWorkspaceTab === 'SmileDesign' && (
                <WorkspaceTabPanel
                  className="h-full flex flex-col lg:flex-row gap-5"
                >
                  
                  {/* Active Aesthetic Canvas Area with SVG overlay guide lines */}
                  <div className="flex-1 bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden select-none">
                    <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono z-10">
                      <span className="font-bold text-white uppercase bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                        DIGITAL SMILE DESIGN (DSD) FRAME
                      </span>
                      <span>ACTIVE RENDER: {smileAfterActive ? 'SIMULATED AFTER' : 'DIAGNOSTIC BEFORE'}</span>
                    </div>

                    {/* Interactive DSD photo area */}
                    <div className="flex-1 relative flex items-center justify-center m-4">
                      
                      {/* Simulates high-res patient smile rendering */}
                      <div className="w-80 h-80 rounded-full border-4 border-zinc-900 relative overflow-hidden bg-zinc-900/40 shadow-inner flex items-center justify-center">
                        {smileAfterActive ? (
                          <div className="text-center space-y-2">
                            {/* Interactive smile curve drawing */}
                            <Sparkle className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
                            <h3 className="text-base font-black text-white">Aesthetic Restoration #11</h3>
                            <p className="text-xs text-emerald-400 font-mono font-bold">PROPOSED SMILE FRAME ARCHED</p>
                            <span className="text-[10px] text-zinc-500 font-mono">1.618 Golden Ratio Active</span>
                          </div>
                        ) : (
                          <div className="text-center space-y-2">
                            <Layers className="w-12 h-12 text-amber-500 mx-auto" />
                            <h3 className="text-base font-black text-white">Pre-Op Congenital Absence</h3>
                            <p className="text-xs text-amber-500 font-mono font-bold">HIGH LIPLINE ASYMMETRICAL</p>
                            <span className="text-[10px] text-zinc-500 font-mono">Initial Scan ST-1011</span>
                          </div>
                        )}

                        {/* Interactive DSD Reference Guide Overlays via SVG */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                          {/* Facial Midline */}
                          {showMidline && (
                            <line 
                              x1={`${midlineX}%`} y1="0" x2={`${midlineX}%`} y2="100%" 
                              stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" 
                            />
                          )}
                          {/* Smile Line curve */}
                          {showSmileLine && (
                            <path 
                              d="M 40 240 Q 160 290 280 240" 
                              fill="none" stroke="#f43f5e" strokeWidth="2" 
                            />
                          )}
                          {/* Occlusal Plane line */}
                          {showOcclusal && (
                            <line 
                              x1="20" y1="210" x2="300" y2="210" 
                              stroke="#3b82f6" strokeWidth="1.5" 
                            />
                          )}
                          {/* Tooth Proportions bounding boxes */}
                          {showProportions && (
                            <g stroke="#f59e0b" strokeWidth="1" fill="none">
                              {/* Central Incisors bounding box */}
                              <rect x="130" y="160" width="30" height="40" rx="2" />
                              <rect x="160" y="160" width="30" height="40" rx="2" />
                              {/* Lateral incisors */}
                              <rect x="105" y="165" width="25" height="35" rx="2" strokeDasharray="2 2" />
                              <rect x="190" y="165" width="25" height="35" rx="2" />
                            </g>
                          )}
                        </svg>

                      </div>

                    </div>

                    <div className="text-[9px] text-zinc-500 font-mono flex justify-between z-10">
                      <span>DSD Reference overlays loaded in clinical sync.</span>
                      <span>Format: RGB High-Res</span>
                    </div>

                  </div>

                  {/* Smile design control panel & guide toggles (Right col) */}
                  <div className="w-full lg:w-72 bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                    <div className="space-y-4">
                      
                      {/* Frame Select */}
                      <div className="border-b border-zinc-900 pb-3">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">DSD Frame Switch</span>
                        <div className="grid grid-cols-2 gap-1.5 mt-2">
                          <button
                            onClick={() => setSmileAfterActive(false)}
                            className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                              !smileAfterActive 
                                ? 'bg-amber-500/25 border border-amber-500 text-amber-400' 
                                : 'bg-zinc-950 border border-zinc-850 text-zinc-400'
                            }`}
                          >
                            BEFORE
                          </button>
                          <button
                            onClick={() => setSmileAfterActive(true)}
                            className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                              smileAfterActive 
                                ? 'bg-emerald-500/25 border border-emerald-500 text-emerald-400' 
                                : 'bg-zinc-950 border border-zinc-850 text-zinc-400'
                            }`}
                          >
                            AFTER
                          </button>
                        </div>
                      </div>

                      {/* Guideline Toggles */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">Guideline Overlays</span>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Facial Midline
                            </span>
                            <input
                              type="checkbox"
                              checked={showMidline}
                              onChange={(e) => setShowMidline(e.target.checked)}
                              className="rounded bg-zinc-950 accent-emerald-500 cursor-pointer"
                            />
                          </div>

                          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Smile Line Curve
                            </span>
                            <input
                              type="checkbox"
                              checked={showSmileLine}
                              onChange={(e) => setShowSmileLine(e.target.checked)}
                              className="rounded bg-zinc-950 accent-emerald-500 cursor-pointer"
                            />
                          </div>

                          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Occlusal Plane
                            </span>
                            <input
                              type="checkbox"
                              checked={showOcclusal}
                              onChange={(e) => setShowOcclusal(e.target.checked)}
                              className="rounded bg-zinc-950 accent-emerald-500 cursor-pointer"
                            />
                          </div>

                          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Tooth Proportion
                            </span>
                            <input
                              type="checkbox"
                              checked={showProportions}
                              onChange={(e) => setShowProportions(e.target.checked)}
                              className="rounded bg-zinc-950 accent-emerald-500 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Interactive Slider controls */}
                      <div className="space-y-2 border-t border-zinc-900 pt-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">Overlay Calibrator</span>
                        <div className="space-y-2 text-[10px] font-mono text-zinc-400">
                          <div className="space-y-1">
                            <div className="flex justify-between"><span>Midline Shift:</span> <span>{midlineX}%</span></div>
                            <input
                              type="range"
                              min="20"
                              max="80"
                              value={midlineX}
                              onChange={(e) => setMidlineX(Number(e.target.value))}
                              className="w-full accent-emerald-500 cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between"><span>Incisor Height:</span> <span>{proportionY}%</span></div>
                            <input
                              type="range"
                              min="10"
                              max="90"
                              value={proportionY}
                              onChange={(e) => setProportionY(Number(e.target.value))}
                              className="w-full accent-emerald-500 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                    </div>

                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 text-[10px] text-zinc-500 font-mono space-y-1">
                      <span className="text-zinc-400 font-bold uppercase tracking-wider block">Proposed Ratios:</span>
                      <p>Width:Height Ratio: 1 : 1.25</p>
                      <p>Golden Proportion score: 94%</p>
                    </div>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  5. AI IMAGING TAB (GENERATED TELEMETRY)
                  ================================================== */}
              {activeWorkspaceTab === 'AI' && (
                <WorkspaceTabPanel
                  className="h-full flex flex-col lg:flex-row gap-5"
                >
                  
                  {/* AI Scanner / Highlighting view */}
                  <div className="flex-1 bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden select-none">
                    <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono z-10">
                      <span className="font-bold text-white uppercase bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> AI Computer Vision telemetry
                      </span>
                      <span>ACTIVE SCAN: PANORAMIC Study ST-7182</span>
                    </div>

                    {/* Volumetric / Highlighting mock render */}
                    <div className="flex-1 relative flex items-center justify-center m-4">
                      
                      <div className="w-80 h-48 bg-zinc-900/40 rounded-2xl border border-zinc-900 flex items-center justify-center relative overflow-hidden">
                        
                        {/* Mock Panoramic trace */}
                        <div className="w-72 h-1 bg-zinc-800 rounded-full" />
                        <div className="absolute inset-10 border border-dashed border-emerald-500/10 rounded-full" />
                        
                        {/* Bounding boxes that render when "aiHighlighterOn" is checked */}
                        {aiHighlighterOn && (
                          <>
                            {/* Tooth 14 caries highlight */}
                            <div className="absolute top-16 right-16 border-2 border-rose-500 bg-rose-500/10 rounded p-1 text-[8px] font-mono text-rose-300 font-black" title="Caries suspicion score: 98.2%">
                              <span className="block">#14 CARIES SUSPICION</span>
                              <span>Score: 98%</span>
                            </div>

                            {/* Tooth 11 missing area highlight */}
                            <div className="absolute top-12 left-16 border-2 border-emerald-500 bg-emerald-500/10 rounded p-1 text-[8px] font-mono text-emerald-300 font-black" title="Missing canine space planmeca">
                              <span className="block">#11 ANODONTIA</span>
                              <span>Feasible Implant Site</span>
                            </div>
                          </>
                        )}

                        <div className="absolute inset-x-0 bottom-3 flex justify-center z-10">
                          <button
                            onClick={() => setAiHighlighterOn(!aiHighlighterOn)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              aiHighlighterOn 
                                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/10' 
                                : 'bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white'
                            }`}
                          >
                            <Zap className="w-3.5 h-3.5" /> {aiHighlighterOn ? 'DISABLE PATHOLOGY HIGHLIGHT' : 'ENABLE PATHOLOGY HIGHLIGHT'}
                          </button>
                        </div>
                      </div>

                    </div>

                    <div className="text-[9px] text-zinc-500 font-mono flex justify-between z-10">
                      <span>Neural engine checks for caries, periodontal defects, and apical pathology.</span>
                      <span>Confidence score: &gt;97.4%</span>
                    </div>

                  </div>

                  {/* AI command dashboard (Right col) */}
                  <div className="w-full lg:w-72 bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                    <div className="space-y-4 flex-1 flex flex-col">
                      
                      <div className="border-b border-zinc-900 pb-3">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">AI Restorations suite</span>
                        <h4 className="text-xs font-bold text-white">Generate Neural Diagnostics</h4>
                      </div>

                      {/* AI Command list */}
                      <div className="grid grid-cols-1 gap-2 shrink-0">
                        <button
                          onClick={() => triggerAiAnalysis('findings')}
                          className="w-full py-1.5 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-left text-[11px] font-mono font-bold text-zinc-200 hover:text-emerald-400 transition-colors cursor-pointer"
                        >
                          &bull; Generate Findings Report
                        </button>

                        <button
                          onClick={() => triggerAiAnalysis('implant')}
                          className="w-full py-1.5 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-left text-[11px] font-mono font-bold text-zinc-200 hover:text-emerald-400 transition-colors cursor-pointer"
                        >
                          &bull; Implant Planning Suggestions
                        </button>

                        <button
                          onClick={() => triggerAiAnalysis('density')}
                          className="w-full py-1.5 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-left text-[11px] font-mono font-bold text-zinc-200 hover:text-emerald-400 transition-colors cursor-pointer"
                        >
                          &bull; Alveolar Bone Density Profile
                        </button>

                        <button
                          onClick={() => triggerAiAnalysis('smile')}
                          className="w-full py-1.5 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-left text-[11px] font-mono font-bold text-zinc-200 hover:text-emerald-400 transition-colors cursor-pointer"
                        >
                          &bull; Digital Smile Aesthetics analysis
                        </button>

                        <button
                          onClick={() => triggerAiAnalysis('margins')}
                          className="w-full py-1.5 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-left text-[11px] font-mono font-bold text-zinc-200 hover:text-emerald-400 transition-colors cursor-pointer"
                        >
                          &bull; Margin Line analysis
                        </button>
                      </div>

                      {/* Dynamic Output Logs panel */}
                      <div className="flex-1 bg-zinc-950 border border-zinc-900 p-3 rounded-xl overflow-y-auto max-h-[160px] scrollbar-none space-y-2">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 font-mono block border-b border-zinc-900 pb-1">AI Output Log</span>
                        {aiAnalysisLog ? (
                          <div className="text-[10px] font-mono text-zinc-300 leading-relaxed whitespace-pre-wrap">
                            {aiAnalysisLog}
                          </div>
                        ) : (
                          <p className="text-[9px] text-zinc-600 italic font-mono text-center pt-8">Select a neural operation above to begin compilation.</p>
                        )}
                      </div>

                    </div>

                    <button
                      onClick={compileAndGenerateReport}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FileCheck className="w-4 h-4" /> COMPILATE REPORT
                    </button>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  6. TIMELINE TAB (CHRONOLOGICAL STUDIES)
                  ================================================== */}
              {activeWorkspaceTab === 'Timeline' && (
                <WorkspaceTabPanel
                  className="h-full flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="border-b border-zinc-900 pb-2">
                      <h3 className="text-base font-black text-white uppercase tracking-tight">PACS Study Chronology</h3>
                      <p className="text-xs text-zinc-500 font-mono">Sequential imaging events recorded chronologically.</p>
                    </div>

                    <div className="relative pl-6 border-l border-zinc-900 space-y-6 max-h-[440px] overflow-y-auto scrollbar-thin pr-2">
                      {studies.map((study, idx) => (
                        <div key={study.id} className="relative group">
                          
                          {/* Chronology bullet point */}
                          <div className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-zinc-950 border-2 border-emerald-500 group-hover:bg-emerald-500 transition-colors flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
                          </div>

                          <div className="p-4 bg-zinc-900/30 hover:bg-zinc-900/60 rounded-2xl border border-zinc-900 transition-all space-y-2">
                            <div className="flex justify-between items-start text-xs font-mono">
                              <div>
                                <span className="font-bold text-white text-[13px] tracking-tight block">
                                  {study.title}
                                </span>
                                <span className="text-emerald-400 font-bold text-[10px] uppercase">
                                  {study.type}
                                </span>
                              </div>
                              <span className="text-zinc-500 font-bold">{study.date} • {study.id}</span>
                            </div>

                            <p className="text-xs text-zinc-400 font-mono italic">
                              &ldquo;{study.comments}&rdquo;
                            </p>

                            <div className="flex justify-between items-center border-t border-zinc-900/60 pt-2 text-[10px] font-mono text-zinc-500">
                              <span>Device: {study.device}</span>
                              <span>Clinician: {study.doctor}</span>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl text-[10px] font-mono text-zinc-500 text-center">
                    All radiographic imaging entries comply with the federal HHS DICOM Part 15 standards.
                  </div>
                </WorkspaceTabPanel>
              )}

            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* ==================================================
          7. EXPORT DIAGNOSTICS CONTROL DIALOG
          ================================================== */}
      <AnimatePresence>
        {exportModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-zinc-950 border border-zinc-900 p-6 rounded-3xl space-y-6 shadow-2xl relative"
            >
              <div className="space-y-1.5 border-b border-zinc-900 pb-3">
                <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Download className="w-5 h-5 text-emerald-400" /> Secure Diagnostic Export
                </h3>
                <p className="text-xs text-zinc-500 font-mono">Configure outbound patient package formats complying with HIPAA rules.</p>
              </div>

              {/* Format selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono block">Export Package Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'DICOM Raw Study', val: 'DICOM', desc: 'Full-density volumetric slice packets.' },
                    { label: 'Exocad/3Shape STL', val: 'STL', desc: 'Direct watertight dental arch models.' },
                    { label: 'Consolidated ZIP', val: 'ZIP', desc: 'Comprehensive raw visual scans bundle.' },
                    { label: 'Radiographic PDF', val: 'PDF', desc: 'Clinically legible diagnosis report sheets.' },
                    { label: 'High-Res JPEGs', val: 'JPEG', desc: 'Lossless flat images for external viewers.' }
                  ].map((form) => (
                    <button
                      key={form.val}
                      onClick={() => setExportFormat(form.val as any)}
                      className={`p-3 rounded-xl border text-left space-y-1 transition-all cursor-pointer ${
                        exportFormat === form.val 
                          ? 'bg-emerald-500/10 border-emerald-500 text-white' 
                          : 'bg-zinc-900/40 border-zinc-900 hover:border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <span className="text-xs font-bold font-mono block text-white">{form.label}</span>
                      <span className="text-[10px] text-zinc-500 font-mono block leading-tight">{form.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Export warnings */}
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2.5 text-[10px] text-amber-400 font-mono">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Exporting raw patient telemetry triggers an automated audit trail log under federal HIPAA requirements.</p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2.5">
                <button
                  onClick={() => setExportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-mono font-bold text-zinc-300 transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => {
                    alert(`PACS Export package successfully prepared! Transferred Amelia_Vance_${exportFormat}.pkg to clinician downloads directory.`);
                    setExportModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-mono font-bold transition-colors cursor-pointer"
                >
                  BEGIN DOWNLOAD
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================
          8. AI CONSOLIDATED REPORT MODAL
          ================================================== */}
      <AnimatePresence>
        {aiReportModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-zinc-950 border border-zinc-900 p-6 rounded-3xl space-y-6 shadow-2xl relative"
            >
              <div className="space-y-1.5 border-b border-zinc-900 pb-3 flex justify-between items-start">
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" /> AI Radiographic Diagnostic Synthesis
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono">Generated summary of the machine-vision scans of Amelia Vance.</p>
                </div>
                <button 
                  onClick={() => setAiReportModalOpen(false)}
                  className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-mono cursor-pointer"
                >
                  CLOSE
                </button>
              </div>

              {/* Report content */}
              <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-900 space-y-4 text-xs font-mono max-h-[350px] overflow-y-auto scrollbar-thin text-zinc-300 leading-relaxed">
                <div className="border-b border-zinc-800 pb-2 flex justify-between">
                  <span className="font-bold text-white">HEALTHOS MACHINE VISION VERDICT</span>
                  <span className="text-emerald-400">CONFIDENCE: 98.4%</span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">&gt; Maxillary Arch Osteotomy Study</h4>
                  <p>Congenitally absent tooth #11: Measured distance to anterior nasal spine 8.2mm, clear floor depth 11.5mm. Adequate ridge bone profile supports titanium NobelActive fixture without sinus elevation.</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">&gt; Active Cariogenic Risk Area</h4>
                  <p>Incipient enamel carious pathology verified on Distal tooth #14. Recommended Class I restoration intervention before surgical loading.</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">&gt; Aesthetic Analysis summary</h4>
                  <p>Incisal margin tracking asymmetry in Zone #11 is 14%. Restoring tooth #11 following DSD-Waxup v2 parameters resolves vertical aesthetics to 100% golden compliance.</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-t border-zinc-800 pt-2">&gt; Mitral Valve Prolapse advisory</h4>
                  <p className="text-amber-400 font-bold">Lidocaine epinephrine levels must be titrated. Max dose suggested: 3.5mg/kg during pre-op local infiltration.</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2.5">
                <button
                  onClick={() => setAiReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-mono font-bold text-zinc-300 transition-colors cursor-pointer"
                >
                  DISMISS
                </button>
                <button
                  onClick={() => {
                    alert(`Aesthetic Report successfully saved to Amelia&apos;s active clinical PDF files.`);
                    setAiReportModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-mono font-bold transition-colors cursor-pointer"
                >
                  SAVE STUDY TO EHR
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
