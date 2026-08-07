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
    <div className="space-y-6 animate-fade-in relative" style={{ color: 'var(--text)' }}>
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 end-6 z-50 text-white font-mono text-xs px-4 py-3 rounded-3xl shadow-pop flex items-center gap-3 animate-slide-in"
          style={{ background: 'var(--gradient)', boxShadow: 'var(--shadow-pop)', border: '1px solid var(--border-strong)' }}>
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP FILTERS & ANALYTICAL WORKSPACE SELECTOR */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 card-gradient p-4">
        
        {/* Custom Tab Selector */}
        <div className="flex flex-wrap gap-1.5 p-1 card-elevated rounded-3xl">
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
                className={`nav-item px-3 py-2 text-xs font-bold font-mono ${isSel ? 'active' : ''}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Drill-Down Filters */}
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-xl card-elevated p-0.5 text-xs font-mono">
            {['week', 'month', 'year'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t as any)}
                className={`px-3 py-1 rounded-lg text-2xs font-black capitalize transition-all cursor-pointer ${
                  timeframe === t ? 'btn-primary' : 'text-zinc-500 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button 
            onClick={() => handleExport('PDF')}
            className="btn-secondary p-2"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI HIGHLIGHT CARDS (Global Values based on timeframe) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 card-elevated card-hover flex flex-col justify-between h-[105px]">
          <span className="text-2xs font-bold uppercase tracking-widest font-mono" style={{ color: 'var(--text-muted)' }}>YTD Capitalized Yield</span>
          <span className="text-xl font-black font-mono" style={{ color: 'var(--text)' }}>${stats.totalRev.toLocaleString()}</span>
          <span className="text-2xs font-bold flex items-center gap-1" style={{ color: 'var(--success)' }}>
            <TrendingUp className="w-3 h-3" /> +14.8% vs last fiscal period
          </span>
        </div>

        <div className="p-4 card-elevated card-hover flex flex-col justify-between h-[105px]">
          <span className="text-2xs font-bold uppercase tracking-widest font-mono" style={{ color: 'var(--text-muted)' }}>Claims Realization Rate</span>
          <span className="text-xl font-black font-mono" style={{ color: 'var(--text)' }}>94.8%</span>
          <span className="text-2xs font-mono" style={{ color: 'var(--text-muted)' }}>Avg Claim: ${(stats.avgClaims).toLocaleString(undefined, {maximumFractionDigits: 0})} / mo</span>
        </div>

        <div className="p-4 card-elevated card-hover flex flex-col justify-between h-[105px]">
          <span className="text-2xs font-bold uppercase tracking-widest font-mono" style={{ color: 'var(--text-muted)' }}>Case Completion Index</span>
          <span className="text-xl font-black font-mono" style={{ color: 'var(--text)' }}>{(stats.avgCompletion).toFixed(1)}%</span>
          <span className="text-2xs font-bold flex items-center gap-1" style={{ color: 'var(--info)' }}>
            Optimal patient clinical retention
          </span>
        </div>

        <div className="p-4 card-elevated card-hover flex flex-col justify-between h-[105px]">
          <span className="text-2xs font-bold uppercase tracking-widest font-mono" style={{ color: 'var(--text-muted)' }}>Patient Intake Growth</span>
          <span className="text-xl font-black font-mono" style={{ color: 'var(--success)' }}>+{stats.totalGrowth}</span>
          <span className="text-2xs font-mono" style={{ color: 'var(--text-muted)' }}>Registered outpatient referrals</span>
        </div>
      </div>

      {/* TABS WORKSPACE RENDERER */}
      <div className="space-y-6">
        
        {/* ==================== 1. EXECUTIVE & INSIGHTS ==================== */}
        {subTab === 'executive' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Executive AI Insights */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 card-gradient rounded-3xl space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg" style={{ background: 'var(--accent-glow2)', color: 'var(--accent)' }}>
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest font-mono" style={{ color: 'var(--text-sub)' }}>HealthOS Business Intelligence Insights</span>
                  </div>
                  <span className="text-2xs font-mono" style={{ color: 'var(--text-muted)' }}>Auto-generated 5m ago</span>
                </div>

                <div className="space-y-3">
                  {EXECUTIVE_INSIGHTS.map((ins, i) => (
                    <div key={i} className="p-3 card-elevated rounded-2xl flex items-start gap-3 card-hover">
                      <div className={`badge text-xs font-bold font-mono ${
                        ins.impact === 'Positive' ? 'badge-success' :
                        ins.impact === 'Action Needed' ? 'badge-danger' : ''
                      }`}>
                        {ins.urgency}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline">
                          <h4 className="text-xs font-bold" style={{ color: 'var(--text)' }}>{ins.title}</h4>
                          <span className="text-2xs font-mono" style={{ color: 'var(--text-muted)' }}>{ins.category}</span>
                        </div>
                        <p className="text-xs mt-0.5 font-sans leading-relaxed" style={{ color: 'var(--text-muted)' }}>{ins.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Business intelligence Line Chart */}
              <div className="p-5 card-elevated rounded-3xl space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider font-mono" style={{ color: 'var(--text)' }}>YTD Operational Cost vs Collection Efficiency</h4>
                    <p className="text-2xs font-mono" style={{ color: 'var(--text-muted)' }}>Tracking clinical overhead relative to realized revenue collections.</p>
                  </div>
                </div>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={REVENUE_ANALYTICS_YTD} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                      <XAxis dataKey="month" stroke="var(--text-muted)" style={{ fontSize: '10px' }} />
                      <YAxis stroke="var(--text-muted)" style={{ fontSize: '10px' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--surface-solid)', borderColor: 'var(--border-strong)', fontSize: '11px', color: 'var(--text)', borderRadius: 12 }} />
                      <Line type="monotone" dataKey="netRevenue" stroke="var(--info)" strokeWidth={2} name="Net Revenue" />
                      <Line type="monotone" dataKey="operatingExpenses" stroke="var(--danger)" strokeWidth={1.5} name="Operating Expenses" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Side summary details */}
            <div className="space-y-4">
              <div className="p-5 card-gradient rounded-3xl space-y-4">
                <span className="text-2xs font-bold uppercase tracking-widest font-mono" style={{ color: 'var(--text-muted)' }}>Clinician Yield Rankings</span>
                <div className="space-y-3">
                  {MOCK_DOCTORS.map(doc => (
                    <div key={doc.id} className="p-3 card-elevated rounded-2xl space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>{doc.name}</p>
                          <p className="text-2xs font-mono" style={{ color: 'var(--text-muted)' }}>{doc.specialty}</p>
                        </div>
                        <span className="font-mono text-xs font-black" style={{ color: 'var(--success)' }}>${doc.revenue.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                        <div 
                          className="h-full rounded-full" 
                          style={{ width: `${doc.completionRate}%`, backgroundColor: doc.color, boxShadow: `0 0 8px ${doc.color}` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-2xs font-mono" style={{ color: 'var(--text-muted)' }}>
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
            <div className="lg:col-span-2 p-5 card-elevated rounded-3xl space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono" style={{ color: 'var(--text)' }}>Revenue Streaming & Claims Realization Flow</h4>
                <p className="text-2xs font-mono" style={{ color: 'var(--text-muted)' }}>Comparison of submitted insurance claims versus actual patient collections.</p>
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
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                    <XAxis dataKey="month" stroke="var(--text-muted)" style={{ fontSize: '10px' }} />
                    <YAxis stroke="var(--text-muted)" style={{ fontSize: '10px' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--surface-solid)', borderColor: 'var(--border-strong)', fontSize: '11px', color: 'var(--text)', borderRadius: 12 }} />
                    <Area type="monotone" dataKey="netRevenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#netGrad)" name="Net Cash Collections" />
                    <Area type="monotone" dataKey="insuranceClaims" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#claimsGrad)" name="Submitted Claims" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-5 card-gradient rounded-3xl space-y-4">
              <span className="text-2xs font-bold uppercase tracking-widest font-mono" style={{ color: 'var(--text-muted)' }}>Collection Aging Bucket</span>
              <div className="space-y-4 text-xs font-mono">
                {[
                  { label: 'Current (0-30 Days)', value: '$148,200', percent: 74, color: 'var(--success)' },
                  { label: 'Aging (31-60 Days)', value: '$31,400', percent: 15, color: 'var(--info)' },
                  { label: 'Warning (61-90 Days)', value: '$14,500', percent: 7, color: 'var(--warning)' },
                  { label: 'Critical (90+ Days)', value: '$6,800', percent: 4, color: 'var(--danger)' }
                ].map((bucket, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold" style={{ color: 'var(--text-sub)' }}>{bucket.label}</span>
                      <span className="font-extrabold" style={{ color: 'var(--text)' }}>{bucket.value} ({bucket.percent}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                      <div className="h-full rounded-full" style={{ width: `${bucket.percent}%`, background: bucket.color }} />
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
            <div className="lg:col-span-2 p-5 card-elevated rounded-3xl space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono" style={{ color: 'var(--text)' }}>Case Completion Indices & Outpatient Traffic</h4>
                <p className="text-2xs font-mono" style={{ color: 'var(--text-muted)' }}>Comparing outpatient referral volume against final medical case clearances.</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={REVENUE_ANALYTICS_YTD} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                    <XAxis dataKey="month" stroke="var(--text-muted)" style={{ fontSize: '10px' }} />
                    <YAxis stroke="var(--text-muted)" style={{ fontSize: '10px' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--surface-solid)', borderColor: 'var(--border-strong)', fontSize: '11px', color: 'var(--text)', borderRadius: 12 }} />
                    <Bar dataKey="patientGrowth" fill="var(--info)" name="New Patients Registered" radius={[6,6,0,0]} />
                    <Bar dataKey="caseCompletion" fill="var(--accent)" name="Cleared Cases" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-5 card-gradient rounded-3xl space-y-4">
              <span className="text-2xs font-bold uppercase tracking-widest font-mono" style={{ color: 'var(--text-muted)' }}>Departmental Resource Weight</span>
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
                    <span className="text-base font-black font-mono" style={{ color: 'var(--text)' }}>$130K</span>
                    <span className="text-2xs uppercase block" style={{ color: 'var(--text-muted)' }}>Total cost</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                {DEPT_CONSUMPTION_PIE.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5" style={{ color: 'var(--text-sub)' }}>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-mono font-bold" style={{ color: 'var(--text)' }}>${item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== 4. MATERIALS & LAB ==================== */}
        {subTab === 'materials' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-5 card-elevated rounded-3xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider font-mono block" style={{ color: 'var(--text)' }}>Top Materials Consumed by Volume</span>
              <table className="w-full text-start text-xs font-mono">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th className="py-2.5 px-3">Material Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-end">Units Drawn</th>
                    <th className="py-2.5 px-3 text-end">MVT Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {MATERIAL_CONSUMPTION.map((mat, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-3 px-3 font-semibold" style={{ color: 'var(--text)' }}>{mat.name}</td>
                      <td className="py-3 px-3" style={{ color: 'var(--text-sub)' }}>{mat.category}</td>
                      <td className="py-3 px-3 text-end font-mono font-bold" style={{ color: 'var(--text-sub)' }}>{mat.count.toLocaleString()}</td>
                      <td className={`py-3 px-3 text-end font-black ${
                        mat.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {mat.trend}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-5 card-gradient rounded-3xl space-y-4">
              <span className="text-2xs font-bold uppercase tracking-widest font-mono" style={{ color: 'var(--text-muted)' }}>Reagent Expiry Risk Summary</span>
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 card-elevated rounded-2xl space-y-1" style={{ borderColor: 'color-mix(in srgb, var(--danger) 35%, transparent)' }}>
                  <div className="flex justify-between items-center font-bold" style={{ color: 'var(--danger)' }}>
                    <span>Critical Expiry Risk</span>
                    <span>14 Days</span>
                  </div>
                  <p className="text-2xs" style={{ color: 'var(--text-muted)' }}>SARS-CoV-2 PCR Test Reagents value: $20,250.00. Suggest instant hub-transfer.</p>
                </div>
                <div className="p-3 card-elevated rounded-2xl space-y-1">
                  <div className="flex justify-between items-center font-bold" style={{ color: 'var(--text-sub)' }}>
                    <span>Safe Window</span>
                    <span>30+ Days</span>
                  </div>
                  <p className="text-2xs" style={{ color: 'var(--text-muted)' }}>No other biochemical or prosthetic materials display shelf-life warning indices.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 5. CUSTOM REPORT BUILDER ==================== */}
        {subTab === 'builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Configurator */}
            <div className="p-5 card-gradient rounded-3xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider font-mono block" style={{ color: 'var(--text)' }}>Configure Report Schema</span>
              
              <form onSubmit={handleCreateReport} className="space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <label className="block" style={{ color: 'var(--text-muted)' }}>Report Title</label>
                  <input 
                    type="text" 
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    placeholder="e.g. Weekly Clinician Revenue Leakage"
                    className="w-full p-2 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block" style={{ color: 'var(--text-muted)' }}>Category Group</label>
                    <select 
                      value={reportGroup}
                      onChange={(e) => setReportGroup(e.target.value)}
                      className="w-full p-2 rounded-xl"
                    >
                      <option>Financial</option>
                      <option>Clinical</option>
                      <option>SCM / Inventory</option>
                      <option>Lab Diagnostic</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block" style={{ color: 'var(--text-muted)' }}>Format</label>
                    <select 
                      value={reportFormat}
                      onChange={(e) => setReportFormat(e.target.value)}
                      className="w-full p-2 rounded-xl"
                    >
                      <option>PDF</option>
                      <option>Excel</option>
                      <option>CSV</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block" style={{ color: 'var(--text-muted)' }}>Execution Interval</label>
                  <select 
                    value={reportInterval}
                    onChange={(e) => setReportInterval(e.target.value)}
                    className="w-full p-2 rounded-xl"
                  >
                    <option>On-Demand Only</option>
                    <option>Daily at 06:00 UTC</option>
                    <option>Weekly (Mondays)</option>
                    <option>Monthly (1st day)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block" style={{ color: 'var(--text-muted)' }}>Target Data Columns</label>
                  <div className="grid grid-cols-2 gap-1.5 text-2xs">
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
                          className={`p-1.5 border text-start rounded-lg transition-all ${
                            has ? 'btn-primary' : 'btn-ghost'
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
                  className="btn-primary w-full py-2 text-center font-bold mt-2"
                >
                  Generate & Save Report Schema
                </button>
              </form>
            </div>

            {/* Saved and Scheduled Reports List */}
            <div className="lg:col-span-2 p-5 card-elevated rounded-3xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider font-mono" style={{ color: 'var(--text)' }}>Active Saved Reports & Schedule</span>
                <div className="relative w-48">
                  <Search className="absolute start-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    value={searchReportText}
                    onChange={(e) => setSearchReportText(e.target.value)}
                    placeholder="Search reports..."
                    className="w-full ps-7 pe-2 py-1 text-xs rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                {filteredSavedReports.map(rep => (
                  <div key={rep.id} className="p-3 card-gradient rounded-2xl flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2 card-elevated rounded-lg" style={{ color: 'var(--accent)' }}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm" style={{ color: 'var(--text)' }}>{rep.title}</h5>
                        <p className="text-2xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          Owner: <span style={{ color: 'var(--text-sub)' }}>{rep.createdBy}</span> • Frequency: <span className="font-bold" style={{ color: 'var(--accent)' }}>{rep.frequency}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="badge" style={{ color: 'var(--text-sub)' }}>
                        {rep.format}
                      </span>
                      <button 
                        onClick={() => handleExport(rep.format as any)}
                        className="btn-secondary p-1.5"
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
