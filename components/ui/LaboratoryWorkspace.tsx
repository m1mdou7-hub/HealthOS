'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  Layers,
  Search,
  Grid,
  List,
  Clock,
  Sparkles,
  Plus,
  Settings,
  Shield,
  Download,
  Eye,
  Activity,
  Heart,
  ChevronRight,
  RotateCw,
  TrendingUp,
  Zap,
  Check,
  FileText,
  Ruler,
  Calendar,
  User,
  ExternalLink,
  ChevronDown,
  Flame,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Cpu,
  Boxes,
  FileArchive,
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
  Cell
} from 'recharts';

import {
  INITIAL_LAB_CASES,
  MOCK_TECHNICIANS,
  LabCase,
  CasePriority,
  ManufacturingStage
} from '../operations/labTypes';

// Import newly refactored views for Modules 1-7
import LabDashboardView from '../operations/LabDashboardView';
import CaseManagerView from '../operations/CaseManagerView';
import FileManagerView from '../operations/FileManagerView';
import ManufacturingWorkflowView from '../operations/ManufacturingWorkflowView';
import ShadeManagementView from '../operations/ShadeManagementView';
import LabCommunicationView from '../operations/LabCommunicationView';
import SmileDesignWorkspace from '../operations/SmileDesignWorkspace';

// --- ANALYTICS ORIGINAL MOCK DATA ---
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
  // Navigation State
  const [activeTab, setActiveTab] = useState<
    | 'Dashboard'
    | 'CaseList'
    | 'CaseWorkspace'
    | 'CadCam'
    | 'Manufacturing'
    | 'Shade'
    | 'Communication'
    | 'SmileDesign'
    | 'Materials'
    | 'AiAssistant'
    | 'Files'
    | 'Timeline'
    | 'Analytics'
  >('Dashboard');

  // Unified interactive core states
  const [cases, setCases] = useState<LabCase[]>(INITIAL_LAB_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('CASE-2026-A1');
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

  // State mutators for components
  const handleUpdateCase = (updatedCase: LabCase) => {
    setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
  };

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
            `• Case Context: ${activeCase.restorationType} restoration\n` +
            `• Recommended Material: ${
              activeCase.priority === 'Urgent' ? 'Lithium Disilicate Glass Ceramic (IPS e.max CAD)' : 'High-translucency Zirconia multi-layer (Katana HTML)'
            }\n` +
            `• Critical Force Analysis: Posterior zones require monolithic strength; anterior veneers benefit from handcrafted incisal cut-backs.`
          );
          break;
        case 'shade':
          setAiOutputLog(
            `**AI SHADE SELECTION TRANSITION MATRIX**\n` +
            `• Target Shade requested: ${activeCase.shade.vitaShade}\n` +
            `• Custom Shade Blend: ${activeCase.shade.customShade || 'Standard glaze'}\n` +
            `• Masking ratio calculation: Prep color values suggest high translucency block. Translucent glaze layer recommended to match halo effects.`
          );
          break;
        case 'manufacturing':
          setAiOutputLog(
            `**AI MANUFACTURING ROUTING**\n` +
            `• Recommended Method: 5-Axis Wet Diamond Milling\n` +
            `• Sintering parameters: Rapid short-cycle sintering program at 1450°C. Duration: 3.5 hours.\n` +
            `• alternative Routing: Formlabs castable sacrificial resin printing for ceramic pressing.`
          );
          break;
        case 'time':
          setAiOutputLog(
            `**AI OPTIMAL PRODUCTION TIME ESTIMATION**\n` +
            `• CAD Design: 35 minutes\n` +
            `• Wet milling / Carving: 18 minutes\n` +
            `• Sintering & Crystallization: 4 hours\n` +
            `• Hand-finishing & Glaze bake: 45 minutes\n` +
            `• Projected Delivery Window: Ready in approximately 5.5 hours.`
          );
          break;
        case 'files':
          const filesFound = activeCase.files.map(f => f.name.toLowerCase());
          const hasPrep = filesFound.some(name => name.includes('prep') || name.includes('maxillary'));
          const hasAntagonist = filesFound.some(name => name.includes('antagonist') || name.includes('mandibular'));
          const hasBite = filesFound.some(name => name.includes('bite') || name.includes('buccal'));

          let msg = `**AI INTEGRITY SCAN OF DIGITAL RAW FILES**\n`;
          let clean = true;
          if (!hasPrep) { msg += `❌ ALERT: Prep arch scan mesh not found.\n`; clean = false; }
          if (!hasAntagonist) { msg += `❌ ALERT: Antagonist scan mesh not found.\n`; clean = false; }
          if (!hasBite) { msg += `❌ ALERT: Buccal bite alignment scan not found.\n`; clean = false; }

          if (clean) {
            msg += `✓ All primary STL CAD/CAM files verified (Prep jaw, antagonist, and bite).\n` +
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
            `  <material>${activeCase.restorationType}</material>\n` +
            `  <instructions>${activeCase.internalNotes}</instructions>\n` +
            `  <cement_gap>15μm</cement_gap>\n` +
            `  <margin_offset>0.2mm</margin_offset>\n` +
            `</exocad_workorder>`
          );
          break;
      }
    }, 700);
  };

  // Filtered cases for the case registry
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchSearch =
        c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.restorationType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchPriority = priorityFilter === 'All' || c.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [cases, searchQuery, statusFilter, priorityFilter]);

  const dashboardStats = useMemo(() => {
    const today = cases.length;
    const inDesign = cases.filter(c => c.status === 'Design' || c.status === 'CAD').length;
    const milling = cases.filter(c => c.status === 'Milling' || c.status === 'CAM').length;
    const printing = cases.filter(c => c.status === 'Printing').length;
    const sintering = cases.filter(c => c.status === 'Sintering').length;
    const finished = cases.filter(c => c.status === 'Completion' || c.status === 'Delivery').length;
    const urgents = cases.filter(c => c.priority === 'Urgent').length;

    return { today, inDesign, milling, printing, sintering, finished, urgents };
  }, [cases]);

  return (
    <div id="laboratory-workspace-panel" className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden flex flex-col shadow-2xl h-[780px] font-sans antialiased text-zinc-100 relative">
      
      {/* CAD/CAM HEADER BRAND STRIP */}
      <div className="bg-zinc-900/85 border-b border-zinc-900 px-6 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-white">HealthOS DentalLab Pro</h2>
              <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-black px-2 py-0.5 rounded-full">
                S5 ENTERPRISE WORKFLOW
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono">
              Synchronized Dental Lab Operating System • Connected to Exocad & 3Shape Servers
            </p>
          </div>
        </div>

        {/* WORK ORDER STATE BANNER */}
        <div className="hidden lg:flex items-center gap-3 bg-zinc-950/80 border border-zinc-800 px-4 py-1.5 rounded-2xl">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Loaded Specimen:</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white font-mono">{activeCase.id}</span>
            <span className="text-xs text-emerald-400 font-semibold truncate max-w-[130px]">{activeCase.patientName}</span>
            <span className="bg-zinc-900 text-zinc-500 text-[10px] px-1.5 py-0.2 border border-zinc-850 rounded font-mono font-bold">
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
          <div className="p-4 border-b border-zinc-900 shrink-0 text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block mb-2">CAD/CAM Sections</span>
            <p className="text-[10px] text-zinc-400 font-mono">Select enterprise dental lab viewports:</p>
          </div>

          {/* LIST OF WORKSPACES */}
          <div id="sidebar-tabs-list" className="flex-1 overflow-y-auto p-2.5 space-y-1 scrollbar-thin">
            {[
              { id: 'Dashboard', label: '1. Lab Command Center', icon: BarChart3, badge: `${dashboardStats.today} Cases` },
              { id: 'CaseList', label: '2. Case Registry', icon: List, badge: 'Registry' },
              { id: 'CaseWorkspace', label: '3. Case Manager', icon: User, badge: activeCase.priority === 'Urgent' ? 'URGENT' : undefined, badgeColor: 'bg-rose-500/25 text-rose-300 border-rose-500/30' },
              { id: 'CadCam', label: '4. CAD/CAM Studio', icon: RotateCw, badge: 'Exocad' },
              { id: 'Manufacturing', label: '5. Workflow Staging', icon: Flame, badge: 'Stages' },
              { id: 'Shade', label: '6. Shade Management', icon: Eye, badge: activeCase.shade.vitaShade },
              { id: 'Communication', label: '7. Lab Secure Chat', icon: FileText, badge: 'Secure' },
              { id: 'SmileDesign', label: '8. Digital Smile Design', icon: Heart, badge: 'DSD' },
              { id: 'Materials', label: '9. Materials Inventory', icon: Boxes, badge: 'Stock' },
              { id: 'AiAssistant', label: '10. AI Assistant', icon: Cpu, badge: 'Exocad AI', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
              { id: 'Files', label: '11. STL & File Hub', icon: FileArchive, badge: `${activeCase.files.length} Scans` },
              { id: 'Timeline', label: '12. Milestone Timeline', icon: Clock, badge: 'Log' },
              { id: 'Analytics', label: '13. Performance Stats', icon: TrendingUp, badge: '98.5% OK' }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`tab-btn-${item.id.toLowerCase()}`}
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

          {/* ACTIVE CASE FOOTER CARD */}
          <div className="p-3 bg-zinc-950/80 border-t border-zinc-900 shrink-0 space-y-2 text-left">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">Loaded Specimen</span>
            <div className="flex items-center gap-2.5 p-2 bg-zinc-900 border border-zinc-850 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-black text-emerald-400 uppercase font-mono shadow-md shrink-0">
                {activeCase.patientName.split(' ').map(n=>n[0]).join('')}
              </div>
              <div className="min-w-0 flex-1">
                <h5 className="text-[11px] font-bold text-white truncate">{activeCase.patientName}</h5>
                <p className="text-[9px] text-zinc-500 font-mono truncate">{activeCase.restorationType}</p>
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
          
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            <AnimatePresence mode="wait">
              
              {/* Module 1: Dashboard View */}
              {activeTab === 'Dashboard' && (
                <motion.div
                  key="tab-dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <LabDashboardView
                    cases={cases}
                    technicians={MOCK_TECHNICIANS}
                    onSelectCase={(id, tab) => {
                      setSelectedCaseId(id);
                      setActiveTab(tab as any);
                    }}
                  />
                </motion.div>
              )}

              {/* original layout: Case Registry List view */}
              {activeTab === 'CaseList' && (
                <motion.div
                  key="tab-caselist"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Header Controls */}
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-2 text-left">
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
                        className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 text-xs rounded-xl outline-none focus:border-emerald-500 text-white font-mono placeholder:text-zinc-650"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold shrink-0">Status:</span>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-zinc-900 border border-zinc-850 rounded-xl text-xs font-mono text-zinc-350 p-1.5 outline-none focus:border-emerald-500 w-full"
                      >
                        <option value="All">All statuses</option>
                        <option value="CAD">CAD</option>
                        <option value="CAM">CAM</option>
                        <option value="Milling">Milling</option>
                        <option value="Printing">Printing</option>
                        <option value="Sintering">Sintering</option>
                        <option value="Completion">Completed</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold shrink-0">Priority:</span>
                      <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="bg-zinc-900 border border-zinc-850 rounded-xl text-xs font-mono text-zinc-350 p-1.5 outline-none focus:border-emerald-500 w-full"
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
                    <div id="cases-registry-grid" className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto max-h-[420px] pr-1">
                      {filteredCases.map((c) => (
                        <div
                          key={c.id}
                          id={`case-card-${c.id}`}
                          onClick={() => {
                            setSelectedCaseId(c.id);
                            setActiveTab('CaseWorkspace');
                          }}
                          className={`p-4 bg-zinc-900/40 border rounded-2xl flex flex-col justify-between h-[175px] cursor-pointer transition-all text-left ${
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
                            <p className="text-[10px] text-zinc-450 font-mono truncate">{c.restorationType}</p>
                            <p className="text-[9px] text-zinc-500 font-mono">Shade: {c.shade.vitaShade}</p>
                          </div>

                          <div className="border-t border-zinc-900/60 pt-2 flex justify-between items-center text-[10px] font-mono">
                            <span className="text-zinc-500">Progress:</span>
                            <span className="font-bold text-emerald-400">{c.progressPercent}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div id="cases-registry-list" className="overflow-x-auto rounded-xl border border-zinc-900 max-h-[420px] overflow-y-auto">
                      <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead>
                          <tr className="bg-zinc-950 text-zinc-500 text-[10px] uppercase font-bold border-b border-zinc-900">
                            <th className="p-3">ID</th>
                            <th className="p-3">Patient</th>
                            <th className="p-3">Doctor</th>
                            <th className="p-3">Restoration</th>
                            <th className="p-3">Source format</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Priority</th>
                            <th className="p-3">Launch</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/60 text-zinc-350">
                          {filteredCases.map((c) => (
                            <tr 
                              key={c.id} 
                              onClick={() => setSelectedCaseId(c.id)}
                              className={`hover:bg-zinc-900/10 cursor-pointer ${selectedCaseId === c.id ? 'bg-emerald-500/5' : ''}`}
                            >
                              <td className="p-3 text-emerald-400 font-bold">{c.id}</td>
                              <td className="p-3 font-semibold text-zinc-100">{c.patientName}</td>
                              <td className="p-3">Dr. {c.doctorName}</td>
                              <td className="p-3 truncate max-w-[150px]">{c.restorationType}</td>
                              <td className="p-3 text-zinc-500">{c.caseType}</td>
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

                  {/* FOOTER STATS */}
                  <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500 font-bold">REGISTRY COUNT: {filteredCases.length} OF {cases.length}</span>
                    <span className="text-zinc-500">EXOCAD SYNC STATUS: OK</span>
                    <span className="text-emerald-400 font-bold">READY FOR WORKFLOW COMPILATION</span>
                  </div>
                </motion.div>
              )}

              {/* Module 2: Case Manager View */}
              {activeTab === 'CaseWorkspace' && (
                <motion.div
                  key="tab-caseworkspace"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <CaseManagerView
                    activeCase={activeCase}
                    onUpdateCase={handleUpdateCase}
                  />
                </motion.div>
              )}

              {/* original layout: CAD/CAM Studio viewport */}
              {activeTab === 'CadCam' && (
                <motion.div
                  key="tab-cadcam"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col lg:flex-row gap-5"
                >
                  {/* Rotating solid crown simulator (Exocad viewport) */}
                  <div className="flex-1 bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden select-none min-h-[360px]">
                    <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono z-10">
                      <span className="font-bold text-white uppercase bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                        {activeCase.doctorName}&apos;s Case Workstation
                      </span>
                      <span>ROT: {cadRotation}° ELEV: {cadElevation}°</span>
                    </div>

                    {/* Viewport mesh simulator */}
                    <div className="flex-1 relative flex items-center justify-center m-4">
                      <div className="absolute inset-0 bg-grid-zinc opacity-20" />
                      
                      <div 
                        className="w-48 h-48 relative flex items-center justify-center transition-transform duration-300"
                        style={{
                          transform: `rotateX(${cadElevation}deg) rotateY(${cadRotation}deg) scale(${cadZoom / 100})`
                        }}
                      >
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
                              v3.2_Exocad
                            </span>
                            <span className="text-[9px] text-zinc-500 block">IPS e.max CAD</span>
                          </div>

                          {activeCadTool === 'MarginLine' && (
                            <div className="absolute -bottom-1.5 left-2 right-2 h-1 bg-rose-500 rounded animate-pulse" />
                          )}

                          {activeCadTool === 'Contacts' && (
                            <>
                              <div className="absolute -left-2 top-10 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[8px] font-black text-white">M</div>
                              <div className="absolute -right-2 top-12 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] font-black text-white">D</div>
                            </>
                          )}
                        </div>
                      </div>

                      {showMinimumThicknessCheck && (
                        <div className="absolute bottom-4 right-4 bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl space-y-1 font-mono text-[10px] shadow-xl z-10 text-left">
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
                        >
                          &larr;
                        </button>
                        <button
                          onClick={() => setCadRotation(prev => (prev + 15) % 360)}
                          className="p-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        >
                          &rarr;
                        </button>
                        <button
                          onClick={() => setCadElevation(prev => Math.min(60, prev + 10))}
                          className="p-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        >
                          &uarr;
                        </button>
                        <button
                          onClick={() => setCadElevation(prev => Math.max(-10, prev - 10))}
                          className="p-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        >
                          &darr;
                        </button>
                      </div>

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
                                : 'bg-zinc-950 border-zinc-880 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right side parameters */}
                  <div className="w-full lg:w-72 bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between space-y-4 text-left">
                    <div className="space-y-4">
                      <div className="border-b border-zinc-900 pb-3">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">Design values</span>
                        <h4 className="text-xs font-bold text-white uppercase">Exocad Rijeka Engine</h4>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Version: v3.2_final</p>
                      </div>

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
                    </div>

                    <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl font-mono text-[9px] text-zinc-500">
                      <span>GPU ACCELERATION: ACTIVE</span>
                      <p className="mt-1">Direct OpenGL wrapper active on localized node.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Module 4: Manufacturing Staging */}
              {activeTab === 'Manufacturing' && (
                <motion.div
                  key="tab-manufacturing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <ManufacturingWorkflowView
                    activeCase={activeCase}
                    onUpdateCase={handleUpdateCase}
                  />
                </motion.div>
              )}

              {/* Module 5: Shade Management */}
              {activeTab === 'Shade' && (
                <motion.div
                  key="tab-shade"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <ShadeManagementView
                    activeCase={activeCase}
                    onUpdateCase={handleUpdateCase}
                  />
                </motion.div>
              )}

              {/* Module 6: Lab Secure Chat */}
              {activeTab === 'Communication' && (
                <motion.div
                  key="tab-communication"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <LabCommunicationView
                    activeCase={activeCase}
                    onUpdateCase={handleUpdateCase}
                  />
                </motion.div>
              )}

              {/* Module 7: Smile Design */}
              {activeTab === 'SmileDesign' && (
                <motion.div
                  key="tab-smiledesign"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <SmileDesignWorkspace
                    activeCase={activeCase}
                    onUpdateCase={handleUpdateCase}
                  />
                </motion.div>
              )}

              {/* original layout: Materials Hub */}
              {activeTab === 'Materials' && (
                <motion.div
                  key="tab-materials"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 text-left"
                >
                  <div className="border-b border-zinc-900 pb-2 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-tight">Enterprise Materials Distribution</h3>
                      <p className="text-xs text-zinc-500 font-mono">Real-time inventory levels of multilayer zirconia discs, e.max blocks, and titanium implant pre-forms.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { title: 'Zirconia Discs (Multi-Layer)', count: 48, limit: '>= 20', desc: 'Katana HT / HTML ultra high translucency blanks', warn: false },
                      { title: 'IPS e.max CAD Blocks', count: 32, limit: '>= 15', desc: 'Lithium disilicate glass ceramic blocks', warn: false },
                      { title: 'PMMA Temp Discs', count: 12, limit: '>= 10', desc: 'Provisional restoration custom blocks', warn: false },
                      { title: 'Titanium Abutment Blanks', count: 4, limit: '>= 8', desc: 'Grade 5 customized raw blanks', warn: true }
                    ].map((mat, i) => (
                      <div key={i} className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col justify-between h-[150px]">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-black uppercase tracking-wider font-mono">{mat.title}</span>
                            {mat.warn && <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />}
                          </div>
                          <p className="text-[9px] opacity-65 font-mono mt-0.5">{mat.desc}</p>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-2xl font-mono font-black">{mat.count} <span className="text-xs font-normal text-zinc-500">discs</span></span>
                          <p className="text-[8px] font-mono opacity-80">Safety Limit: {mat.limit}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* original layout: AI Assistant */}
              {activeTab === 'AiAssistant' && (
                <motion.div
                  key="tab-aiassistant"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col justify-between text-left"
                >
                  <div className="space-y-4">
                    <div className="border-b border-zinc-900 pb-2 flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-black text-white uppercase tracking-tight">AI Diagnostic Laboratory Assistant</h3>
                        <p className="text-xs text-zinc-500 font-mono">Neural evaluation of tooth preparations, contact parameters, and custom guidelines.</p>
                      </div>
                      <span className="text-xs font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-xl animate-pulse">
                        Neural Core active
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 shrink-0">
                      {[
                        { id: 'material', label: 'Suggest Ideal Material', desc: 'Esthetic / stress check' },
                        { id: 'shade', label: 'Suggest Translucency / Shade', desc: 'Stump masking ratio' },
                        { id: 'manufacturing', label: 'Suggest Mfg Method', desc: 'Milling vs printing' },
                        { id: 'time', label: 'Estimate Production Time', desc: 'Full pipeline duration' },
                        { id: 'files', label: 'Scan for Missing Files', desc: 'Integrity scan' },
                        { id: 'notes', label: 'Generate Lab Prescript Notes', desc: 'Exocad ready text' }
                      ].map(act => (
                        <button
                          key={act.id}
                          id={`ai-btn-${act.id}`}
                          onClick={() => triggerAiLabAnalysis(act.id as any)}
                          className="p-3.5 bg-zinc-900/40 border border-zinc-855 hover:border-purple-500/40 hover:bg-zinc-950/80 rounded-2xl text-left cursor-pointer transition-all space-y-1 group"
                        >
                          <div className="flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold text-white font-mono">{act.label}</span>
                          </div>
                          <p className="text-[10px] text-zinc-500 font-mono">{act.desc}</p>
                        </button>
                      ))}
                    </div>

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
                            <p className="text-[11px] text-zinc-650 max-w-sm">Select any telemetry command above to run a clinical diagnostic evaluation of active case {activeCase.id}.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Module 3: Files View */}
              {activeTab === 'Files' && (
                <motion.div
                  key="tab-files"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <FileManagerView
                    activeCase={activeCase}
                    onUpdateCase={handleUpdateCase}
                  />
                </motion.div>
              )}

              {/* original layout: Milestone Timeline */}
              {activeTab === 'Timeline' && (
                <motion.div
                  key="tab-timeline"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col justify-between text-left"
                >
                  <div className="space-y-4">
                    <div className="border-b border-zinc-900 pb-2">
                      <h3 className="text-base font-black text-white uppercase tracking-tight">Specimen Milestone Timeline</h3>
                      <p className="text-xs text-zinc-500 font-mono">Chronological audit logs of restorations from prescription to physical clinical delivery.</p>
                    </div>

                    <div className="relative border-l-2 border-zinc-900 ml-4 pl-6 space-y-6 max-h-[420px] overflow-y-auto scrollbar-thin">
                      {activeCase.timeline.map((item, idx) => (
                        <div key={idx} className="relative">
                          <span className={`absolute -left-[31px] top-1.5 p-1 rounded-full bg-zinc-950 border-2 ${
                            item.completed ? 'border-emerald-400' : 'border-zinc-800'
                          }`}>
                            <Check className={`w-3.5 h-3.5 ${item.completed ? 'text-emerald-400' : 'text-zinc-600'}`} />
                          </span>

                          <div className="space-y-1">
                            <div className="flex justify-between items-baseline">
                              <h4 className={`text-xs font-black ${item.completed ? 'text-white' : 'text-zinc-500'}`}>{item.stage}</h4>
                              <span className="text-[9px] font-mono text-zinc-500 font-bold">{item.timestamp || 'Scheduled'}</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 font-mono leading-relaxed">
                              {item.note || 'Staged for sequential manufacturing completion.'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* original layout: Performance Analytics */}
              {activeTab === 'Analytics' && (
                <motion.div
                  key="tab-analytics"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col justify-between text-left"
                >
                  <div className="space-y-4">
                    <div className="border-b border-zinc-900 pb-2 flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-black text-white uppercase tracking-tight">Laboratory Analytics & Throughput</h3>
                        <p className="text-xs text-zinc-500 font-mono">Performance metrics, remake rate curves, and material consumption curves.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Production Output */}
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

                      {/* Material Consumption */}
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

                    <div className="overflow-x-auto rounded-xl border border-zinc-900">
                      <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead>
                          <tr className="bg-zinc-950 text-zinc-500 text-[9px] uppercase font-bold border-b border-zinc-900">
                            <th className="p-2">Ceramist / Engineer</th>
                            <th className="p-2">Cases Completed</th>
                            <th className="p-2">Avg Turnaround</th>
                            <th className="p-2">Remake Rate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
                          {TECHNICIAN_PERFORMANCE.map((tech, idx) => (
                            <tr key={idx} className="hover:bg-zinc-900/10">
                              <td className="p-2 font-bold text-white">{tech.name}</td>
                              <td className="p-2">{tech.cases} cases</td>
                              <td className="p-2 text-zinc-400">{tech.avgTime}</td>
                              <td className="p-2 text-emerald-400 font-bold">{tech.remakeRate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
