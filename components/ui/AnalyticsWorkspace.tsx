'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  User,
  Layers,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Filter,
  Sparkles,
  Download,
  Share2,
  FileText,
  CalendarDays,
  Plus,
  RefreshCw,
  Search,
  Check,
  Building,
  Heart,
  Settings,
  Flame,
  Gauge,
  BarChart3
} from 'lucide-react';
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
  Pie,
  LineChart,
  Line,
  Legend
} from 'recharts';

// --- MOCK ENTERPRISE BI DATASETS ---
const MOCK_DOCTORS = [
  { id: 'D-1', name: 'Dr. Elena Rostova', specialty: 'Prosthodontist', color: '#10b981', revenue: 45200, appointments: 84, completionRate: 98 },
  { id: 'D-2', name: 'Dr. Michael Chen', specialty: 'Implantologist', color: '#a855f7', revenue: 78900, appointments: 62, completionRate: 94 },
  { id: 'D-3', name: 'Dr. Sarah Jenkins', specialty: 'Cosmetic Dentist', color: '#3b82f6', revenue: 51000, appointments: 112, completionRate: 96 },
  { id: 'D-4', name: 'Dr. Marcus Vance', specialty: 'Prostho & Surgery', color: '#f97316', revenue: 32000, appointments: 41, completionRate: 100 }
];

const EXECUTIVE_INSIGHTS = [
  {
    category: 'Revenue Boost',
    title: 'High-Value Implant Conversion Up 14.2%',
    desc: 'Dr. Chen converted 88% of single-tooth consultations. Overall surgical revenue represents 52% of general clinical margins.',
    impact: 'Positive',
    urgency: 'Low'
  },
  {
    category: 'Capacity Constrained',
    title: 'Chair 4 (Surgery Suite A) is Critical at 92% Load',
    desc: 'Average restorative turnover has slowed by 11 mins due to lab workflow delays. Booking friction reported on Thursday afternoons.',
    impact: 'Action Needed',
    urgency: 'High'
  },
  {
    category: 'Material Waste Alert',
    title: 'N95 Respirators Consumption Spiked by 28%',
    desc: 'Supply chain audit logs show excess packaging breaches in Ward B closets. Reorder thresholds have been auto-tuned to 220 units.',
    impact: 'Neutral',
    urgency: 'Medium'
  }
];

const REVENUE_ANALYTICS_YTD = [
  { month: 'Jan', netRevenue: 125000, insuranceClaims: 85000, operatingExpenses: 45000, patientGrowth: 110, caseCompletion: 82 },
  { month: 'Feb', netRevenue: 138000, insuranceClaims: 91000, operatingExpenses: 48000, patientGrowth: 145, caseCompletion: 85 },
  { month: 'Mar', netRevenue: 154000, insuranceClaims: 102000, operatingExpenses: 52000, patientGrowth: 180, caseCompletion: 88 },
  { month: 'Apr', netRevenue: 149000, insuranceClaims: 98000, operatingExpenses: 51000, patientGrowth: 162, caseCompletion: 91 },
  { month: 'May', netRevenue: 172000, insuranceClaims: 115000, operatingExpenses: 58000, patientGrowth: 210, caseCompletion: 92 },
  { month: 'Jun', netRevenue: 194000, insuranceClaims: 129000, operatingExpenses: 62000, patientGrowth: 235, caseCompletion: 95 },
  { month: 'Jul', netRevenue: 218000, insuranceClaims: 142000, operatingExpenses: 65000, patientGrowth: 280, caseCompletion: 97 }
];

const DEPT_CONSUMPTION_PIE = [
  { name: 'Surgical Restorations', value: 58400, color: '#a855f7' },
  { name: 'General Dentistry', value: 34200, color: '#10b981' },
  { name: 'Orthodontics & Trays', value: 21100, color: '#3b82f6' },
  { name: 'Laboratory Diagnostics', value: 16500, color: '#f97316' }
];

const MATERIAL_CONSUMPTION = [
  { name: 'Amoxicillin Caps', count: 12400, category: 'Pharmaceuticals', trend: '+4%' },
  { name: 'N95 Respirator', count: 840, category: 'Protective Gear', trend: '-12%' },
  { name: 'Syringes 5ml', count: 45000, category: 'Medical Supplies', trend: '+18%' },
  { name: 'SARS PCR Reagents', count: 450, category: 'Lab Reagents', trend: '+22%' }
];

const SAVED_REPORTS_MOCK = [
  { id: 'REP-01', title: 'Monthly Executive Yield Matrix', createdBy: 'Dr. Jenkins', lastRun: '2026-07-16', frequency: 'Monthly', format: 'PDF' },
  { id: 'REP-02', title: 'ADA Procedure Code Revenue Drift', createdBy: 'Dr. Elena Rostova', lastRun: '2026-07-15', frequency: 'Weekly', format: 'Excel' },
  { id: 'REP-03', title: 'Insurance Denial Rate & Claims Aging', createdBy: 'Billing Dept', lastRun: '2026-07-10', frequency: 'Daily', format: 'CSV' },
  { id: 'REP-04', title: 'Clinical Sub-Zero Cold Vault Telemetry', createdBy: 'Lab Director Vance', lastRun: '2026-07-12', frequency: 'Weekly', format: 'PDF' }
];

export default function AnalyticsWorkspace() {
  const [subTab, setSubTab] = useState<'executive' | 'financial' | 'clinical' | 'materials' | 'builder'>('executive');
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [drilldownCategory, setDrilldownCategory] = useState<string>('All Categories');
  
  // Custom report builder state
  const [reportTitle, setReportTitle] = useState('New Custom SCM Performance Matrix');
  const [reportGroup, setReportGroup] = useState('Financial');
  const [reportInterval, setReportInterval] = useState('Weekly');
  const [reportFormat, setReportFormat] = useState('PDF');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(['Revenue', 'Patient Growth', 'Case Completion']);
  const [savedReports, setSavedReports] = useState(SAVED_REPORTS_MOCK);
  const [searchReportText, setSearchReportText] = useState('');
  
  // Dialog Notifications state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  // Handle Export Click
  const handleExport = (format: 'PDF' | 'Excel' | 'CSV') => {
    triggerToast(`Exporting operational dataset as high-fidelity ${format}. Check download tray!`);
  };

  // Add new Custom Report
  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim()) return alert('Please enter a valid report title');

    const newRep = {
      id: `REP-0${savedReports.length + 1}`,
      title: reportTitle,
      createdBy: 'Dr. Ahmed',
      lastRun: new Date().toISOString().substring(0, 10),
      frequency: reportInterval,
      format: reportFormat
    };

    setSavedReports([newRep, ...savedReports]);
    setReportTitle('');
    triggerToast(`Report "${newRep.title}" successfully compiled and appended to saved schemas.`);
  };

  // Filtered Saved Reports
  const filteredSavedReports = useMemo(() => {
    return savedReports.filter(rep => 
      rep.title.toLowerCase().includes(searchReportText.toLowerCase()) ||
      rep.frequency.toLowerCase().includes(searchReportText.toLowerCase())
    );
  }, [savedReports, searchReportText]);

  // Compute stats on-the-fly from actual state
  const stats = useMemo(() => {
    const totalRev = REVENUE_ANALYTICS_YTD.reduce((acc, curr) => acc + curr.netRevenue, 0);
    const avgClaims = REVENUE_ANALYTICS_YTD.reduce((acc, curr) => acc + curr.insuranceClaims, 0) / REVENUE_ANALYTICS_YTD.length;
    const avgCompletion = REVENUE_ANALYTICS_YTD.reduce((acc, curr) => acc + curr.caseCompletion, 0) / REVENUE_ANALYTICS_YTD.length;
    const totalGrowth = REVENUE_ANALYTICS_YTD.reduce((acc, curr) => acc + curr.patientGrowth, 0);

    return {
      totalRev,
      avgClaims,
      avgCompletion,
      totalGrowth
    };
  }, []);

  return (
    <div className="space-y-6 text-zinc-100 animate-fade-in relative">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-mono text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP FILTERS & ANALYTICAL WORKSPACE SELECTOR */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-zinc-900/50 p-4 rounded-3xl border border-zinc-900">
        
        {/* Custom Tab Selector */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-950 rounded-2xl border border-zinc-850">
          {[
            { id: 'executive', label: '1. Executive & Insights', icon: Gauge },
            { id: 'financial', label: '2. Financial Analytics', icon: DollarSign },
            { id: 'clinical', label: '3. Clinical & Operations', icon: Activity },
            { id: 'materials', label: '4. Materials & Lab', icon: Layers },
            { id: 'builder', label: '5. Custom Report Builder', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            const isSel = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
                  isSel ? 'bg-blue-600 text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Drill-Down Filters */}
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-xl bg-zinc-950 p-0.5 border border-zinc-850 text-xs font-mono">
            {['week', 'month', 'year'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t as any)}
                className={`px-3 py-1 rounded-lg text-[10px] font-black capitalize transition-all cursor-pointer ${
                  timeframe === t ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button 
            onClick={() => handleExport('PDF')}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-850 text-zinc-400 hover:text-white transition-all cursor-pointer"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI HIGHLIGHT CARDS (Global Values based on timeframe) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900 flex flex-col justify-between h-[105px]">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">YTD Capitalized Yield</span>
          <span className="text-xl font-black text-white font-mono">${stats.totalRev.toLocaleString()}</span>
          <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +14.8% vs last fiscal period
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900 flex flex-col justify-between h-[105px]">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Claims Realization Rate</span>
          <span className="text-xl font-black text-white font-mono">94.8%</span>
          <span className="text-[9px] text-zinc-400 font-mono">Avg Claim: ${(stats.avgClaims).toLocaleString(undefined, {maximumFractionDigits: 0})} / mo</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900 flex flex-col justify-between h-[105px]">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Case Completion Index</span>
          <span className="text-xl font-black text-white font-mono">{(stats.avgCompletion).toFixed(1)}%</span>
          <span className="text-[9px] text-blue-400 font-bold flex items-center gap-1">
            Optimal patient clinical retention
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900 flex flex-col justify-between h-[105px]">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Patient Intake Growth</span>
          <span className="text-xl font-black text-emerald-400 font-mono">+{stats.totalGrowth}</span>
          <span className="text-[9px] text-zinc-500 font-mono">Registered outpatient referrals</span>
        </div>
      </div>

      {/* TABS WORKSPACE RENDERER */}
      <div className="space-y-6">
        
        {/* ==================== 1. EXECUTIVE & INSIGHTS ==================== */}
        {subTab === 'executive' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Executive AI Insights */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">HealthOS Business Intelligence Insights</span>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500">Auto-generated 5m ago</span>
                </div>

                <div className="space-y-3">
                  {EXECUTIVE_INSIGHTS.map((ins, i) => (
                    <div key={i} className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl flex items-start gap-3">
                      <div className={`p-1 rounded-lg text-xs font-bold font-mono ${
                        ins.impact === 'Positive' ? 'bg-emerald-500/10 text-emerald-400' :
                        ins.impact === 'Action Needed' ? 'bg-red-500/10 text-red-400' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {ins.urgency}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline">
                          <h4 className="text-xs font-bold text-white">{ins.title}</h4>
                          <span className="text-[9px] text-zinc-500 font-mono">{ins.category}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5 font-sans leading-relaxed">{ins.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Business intelligence Line Chart */}
              <div className="p-5 rounded-2xl bg-zinc-900/20 border border-zinc-900 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">YTD Operational Cost vs Collection Efficiency</h4>
                    <p className="text-[10px] text-zinc-500 font-mono">Tracking clinical overhead relative to realized revenue collections.</p>
                  </div>
                </div>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={REVENUE_ANALYTICS_YTD} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#1c1c20" strokeDasharray="3 3" />
                      <XAxis dataKey="month" stroke="#52525b" style={{ fontSize: '10px' }} />
                      <YAxis stroke="#52525b" style={{ fontSize: '10px' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: '11px' }} />
                      <Line type="monotone" dataKey="netRevenue" stroke="#3b82f6" strokeWidth={2} name="Net Revenue" />
                      <Line type="monotone" dataKey="operatingExpenses" stroke="#ef4444" strokeWidth={1.5} name="Operating Expenses" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Side summary details */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-4">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Clinician Yield Rankings</span>
                <div className="space-y-3">
                  {MOCK_DOCTORS.map(doc => (
                    <div key={doc.id} className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-white">{doc.name}</p>
                          <p className="text-[9px] text-zinc-500 font-mono">{doc.specialty}</p>
                        </div>
                        <span className="font-mono text-xs text-emerald-400 font-black">${doc.revenue.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full" 
                          style={{ width: `${doc.completionRate}%`, backgroundColor: doc.color }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-zinc-500 font-mono">
                        <span>{doc.appointments} consultations</span>
                        <span>{doc.completionRate}% completions</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 2. FINANCIAL ANALYTICS ==================== */}
        {subTab === 'financial' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-5 rounded-2xl bg-zinc-900/20 border border-zinc-900 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Revenue Streaming & Claims Realization Flow</h4>
                <p className="text-[10px] text-zinc-500 font-mono">Comparison of submitted insurance claims versus actual patient collections.</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={REVENUE_ANALYTICS_YTD} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="claimsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1c1c20" strokeDasharray="3 3" />
                    <XAxis dataKey="month" stroke="#52525b" style={{ fontSize: '10px' }} />
                    <YAxis stroke="#52525b" style={{ fontSize: '10px' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: '11px' }} />
                    <Area type="monotone" dataKey="netRevenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#netGrad)" name="Net Cash Collections" />
                    <Area type="monotone" dataKey="insuranceClaims" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#claimsGrad)" name="Submitted Claims" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-900 space-y-4">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Collection Aging Bucket</span>
              <div className="space-y-4 text-xs font-mono">
                {[
                  { label: 'Current (0-30 Days)', value: '$148,200', percent: 74, color: 'bg-emerald-500' },
                  { label: 'Aging (31-60 Days)', value: '$31,400', percent: 15, color: 'bg-blue-500' },
                  { label: 'Warning (61-90 Days)', value: '$14,500', percent: 7, color: 'bg-amber-500' },
                  { label: 'Critical (90+ Days)', value: '$6,800', percent: 4, color: 'bg-red-500' }
                ].map((bucket, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-zinc-400 font-bold">{bucket.label}</span>
                      <span className="text-white font-extrabold">{bucket.value} ({bucket.percent}%)</span>
                    </div>
                    <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${bucket.color}`} style={{ width: `${bucket.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== 3. CLINICAL & OPERATIONS ==================== */}
        {subTab === 'clinical' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-5 rounded-2xl bg-zinc-900/20 border border-zinc-900 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Case Completion Indices & Outpatient Traffic</h4>
                <p className="text-[10px] text-zinc-500 font-mono">Comparing outpatient referral volume against final medical case clearances.</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={REVENUE_ANALYTICS_YTD} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#1c1c20" strokeDasharray="3 3" />
                    <XAxis dataKey="month" stroke="#52525b" style={{ fontSize: '10px' }} />
                    <YAxis stroke="#52525b" style={{ fontSize: '10px' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: '11px' }} />
                    <Bar dataKey="patientGrowth" fill="#3b82f6" name="New Patients Registered" />
                    <Bar dataKey="caseCompletion" fill="#a855f7" name="Cleared Cases" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-900 space-y-4">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Departmental Resource Weight</span>
              <div className="flex justify-center py-2">
                <div className="h-40 w-40 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={DEPT_CONSUMPTION_PIE}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {DEPT_CONSUMPTION_PIE.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute text-center">
                    <span className="text-base font-black text-white font-mono">$130K</span>
                    <span className="text-[8px] uppercase text-zinc-500 block">Total cost</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                {DEPT_CONSUMPTION_PIE.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-mono text-zinc-200 font-bold">${item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== 4. MATERIALS & LAB ==================== */}
        {subTab === 'materials' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-5 rounded-2xl bg-zinc-900/20 border border-zinc-900 space-y-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono block">Top Materials Consumed by Volume</span>
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-3">Material Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Units Drawn</th>
                    <th className="py-2.5 px-3 text-right">MVT Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {MATERIAL_CONSUMPTION.map((mat, i) => (
                    <tr key={i} className="hover:bg-zinc-900/30">
                      <td className="py-3 px-3 text-white font-semibold">{mat.name}</td>
                      <td className="py-3 px-3 text-zinc-400">{mat.category}</td>
                      <td className="py-3 px-3 text-right text-zinc-300 font-mono font-bold">{mat.count.toLocaleString()}</td>
                      <td className={`py-3 px-3 text-right font-black ${
                        mat.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {mat.trend}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-900 space-y-4">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Reagent Expiry Risk Summary</span>
              <div className="space-y-3 font-mono text-[11px]">
                <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-red-400 font-bold">
                    <span>Critical Expiry Risk</span>
                    <span>14 Days</span>
                  </div>
                  <p className="text-[10px] text-zinc-400">SARS-CoV-2 PCR Test Reagents value: $20,250.00. Suggest instant hub-transfer.</p>
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-zinc-300 font-bold">
                    <span>Safe Window</span>
                    <span>30+ Days</span>
                  </div>
                  <p className="text-[10px] text-zinc-400">No other biochemical or prosthetic materials display shelf-life warning indices.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 5. CUSTOM REPORT BUILDER ==================== */}
        {subTab === 'builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Configurator */}
            <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono block">Configure Report Schema</span>
              
              <form onSubmit={handleCreateReport} className="space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <label className="text-zinc-500 block">Report Title</label>
                  <input 
                    type="text" 
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    placeholder="e.g. Weekly Clinician Revenue Leakage"
                    className="w-full bg-zinc-950 border border-zinc-850 p-2 text-white outline-none focus:border-blue-500 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-zinc-500 block">Category Group</label>
                    <select 
                      value={reportGroup}
                      onChange={(e) => setReportGroup(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2 text-zinc-300 rounded-xl"
                    >
                      <option>Financial</option>
                      <option>Clinical</option>
                      <option>SCM / Inventory</option>
                      <option>Lab Diagnostic</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-500 block">Format</label>
                    <select 
                      value={reportFormat}
                      onChange={(e) => setReportFormat(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2 text-zinc-300 rounded-xl"
                    >
                      <option>PDF</option>
                      <option>Excel</option>
                      <option>CSV</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-500 block">Execution Interval</label>
                  <select 
                    value={reportInterval}
                    onChange={(e) => setReportInterval(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 p-2 text-zinc-300 rounded-xl"
                  >
                    <option>On-Demand Only</option>
                    <option>Daily at 06:00 UTC</option>
                    <option>Weekly (Mondays)</option>
                    <option>Monthly (1st day)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-zinc-500 block">Target Data Columns</label>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    {['Revenue', 'Patient Growth', 'Case Completion', 'Overhead Expenses', 'Lab Cost', 'Supplier Scores'].map(col => {
                      const has = selectedColumns.includes(col);
                      return (
                        <button
                          type="button"
                          key={col}
                          onClick={() => {
                            if (has) setSelectedColumns(selectedColumns.filter(c => c !== col));
                            else setSelectedColumns([...selectedColumns, col]);
                          }}
                          className={`p-1.5 border text-left rounded-lg transition-all ${
                            has ? 'bg-blue-950/60 text-blue-400 border-blue-800' : 'bg-transparent text-zinc-500 border-zinc-850'
                          }`}
                        >
                          {col}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-black py-2 rounded-xl text-center font-bold cursor-pointer transition-colors mt-2"
                >
                  Generate & Save Report Schema
                </button>
              </form>
            </div>

            {/* Saved and Scheduled Reports List */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-zinc-900/20 border border-zinc-900 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Active Saved Reports & Schedule</span>
                <div className="relative w-48">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input 
                    type="text" 
                    value={searchReportText}
                    onChange={(e) => setSearchReportText(e.target.value)}
                    placeholder="Search reports..."
                    className="w-full bg-zinc-950 border border-zinc-850 pl-7 pr-2 py-1 text-[11px] rounded-lg outline-none text-white"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                {filteredSavedReports.map(rep => (
                  <div key={rep.id} className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-xl flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-zinc-950 border border-zinc-850 text-blue-400 rounded-lg">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-white font-bold text-[13px]">{rep.title}</h5>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          Owner: <span className="text-zinc-300">{rep.createdBy}</span> • Frequency: <span className="text-blue-400 font-bold">{rep.frequency}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="bg-zinc-950 border border-zinc-850 text-zinc-400 text-[10px] px-2 py-1 rounded-md">
                        {rep.format}
                      </span>
                      <button 
                        onClick={() => handleExport(rep.format as any)}
                        className="p-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-black transition-all cursor-pointer"
                        title="Run now"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
