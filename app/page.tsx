export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/ui/DashboardShell';
import {
  Users,
  Activity,
  Calendar as CalendarIcon,
  Sparkles,
  Search,
  Filter,
  TrendingUp,
  Clock,
  FlaskConical,
  Layers,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Bell,
  ArrowUpRight,
  ShieldAlert,
  Sliders,
  ChevronRight,
  Heart,
  Plus,
  BarChart3
} from 'lucide-react';

export default async function HomePage() {
  const supabase = createClient();
  const loggedInUser = await getUser(supabase);

  if (!loggedInUser) {
    return redirect('/signin');
  }

  return (
    <DashboardShell user={loggedInUser}>
      <div className="space-y-6 max-w-[1600px] mx-auto animate-fade-in pb-12 text-zinc-100">
        
        {/* Top Operational Command Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-zinc-900/30 p-4 rounded-2xl border border-zinc-900/80 backdrop-blur-sm">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Dental Prosthodontics Workspace
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest animate-pulse">
                Live
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              HealthOS Central Node • Digital Dentistry Control Console
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search patient charts, restorations, STL files..."
                className="pl-9 pr-4 py-1.5 w-64 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            
            <button className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white transition-colors hover:bg-zinc-900">
              <Sliders className="w-4 h-4" />
            </button>
            
            <button className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/10">
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> New Consultation
            </button>
          </div>
        </div>

        {/* AI Copilot Daily Briefing Banner (Moved to Top) */}
        <div className="p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/20 via-zinc-900/40 to-zinc-900/40 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-widest">
                AI Copilot Active
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-xs text-zinc-400 font-medium">Digital Prosthodontics Decision Support</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Good Morning Dr. Ahmed
            </h3>
            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-zinc-300">
              <span className="text-zinc-400 font-semibold">Today's Summary:</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-850 border border-zinc-800 font-medium text-purple-300 font-mono">
                8 appointments
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-850 border border-zinc-800 font-medium text-emerald-300 font-mono">
                2 laboratory deliveries
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-850 border border-zinc-800 font-medium text-blue-300 font-mono">
                1 implant follow-up
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-850 border border-zinc-800 font-medium text-amber-300 font-mono">
                3 AI recommendations
              </span>
            </div>
          </div>
          <button className="self-start md:self-center px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-zinc-950 font-bold text-xs transition-all shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 flex items-center gap-1.5 shrink-0">
            <Sparkles className="w-3.5 h-3.5" /> Open AI Copilot
          </button>
        </div>

        {/* Dashboard Cards (Dental KPIs) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {[
            {
              title: "Today's Patients",
              value: '18',
              change: '+2 from yesterday',
              trend: 'up',
              icon: Users,
              color: 'text-emerald-400',
              bgColor: 'bg-emerald-500/10'
            },
            {
              title: 'Scheduled Procedures',
              value: '12',
              change: '4 complex arches',
              trend: 'neutral',
              icon: CalendarIcon,
              color: 'text-blue-400',
              bgColor: 'bg-blue-500/10'
            },
            {
              title: 'Active Cases',
              value: '45',
              change: 'Digital designs active',
              trend: 'up',
              icon: Activity,
              color: 'text-purple-400',
              bgColor: 'bg-purple-500/10'
            },
            {
              title: 'Pending Lab Cases',
              value: '9',
              change: '3 milled zirconia',
              trend: 'up',
              icon: FlaskConical,
              color: 'text-amber-400',
              bgColor: 'bg-amber-500/10'
            },
            {
              title: 'Outstanding Tx Plans',
              value: '14 Plans',
              change: 'Awaiting consults',
              trend: 'neutral',
              icon: Layers,
              color: 'text-pink-400',
              bgColor: 'bg-pink-500/10'
            },
            {
              title: 'AI Clinical Insights',
              value: '3 Flags',
              change: '99.4% precision',
              trend: 'up',
              icon: Sparkles,
              color: 'text-cyan-400',
              bgColor: 'bg-cyan-500/10'
            }
          ].map((card, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800/80 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl ${card.bgColor} ${card.color}`}>
                  <card.icon className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-white tracking-tight font-mono">
                  {card.value}
                </h3>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className={card.trend === 'up' ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}>
                    {card.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bento Grid Command Board */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Operational Panel (Left - 8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Split row: Today's Appointments & Clinical Queues */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Today's Appointments */}
              <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-sm p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-emerald-400" /> Scheduled Procedures
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                    6 active
                  </span>
                </div>
                
                <div className="space-y-3">
                  {[
                    { patient: 'Arthur Pendragon', procedure: 'Crown Preparation', time: '09:00 AM', status: 'In-Clinic', statusColor: 'bg-emerald-500/10 text-emerald-400' },
                    { patient: 'Clara Oswald', procedure: 'Veneer Delivery', time: '10:15 AM', status: 'Ready', statusColor: 'bg-blue-500/10 text-blue-400' },
                    { patient: 'Bruce Wayne', procedure: 'Implant Consultation', time: '11:30 AM', status: 'CBCT Scanned', statusColor: 'bg-purple-500/10 text-purple-400' },
                    { patient: 'Diana Prince', procedure: 'Digital Smile Design', time: '01:00 PM', status: 'Exocad Open', statusColor: 'bg-pink-500/10 text-pink-400' },
                    { patient: 'Scott Summers', procedure: 'Complete Denture Try-in', time: '02:30 PM', status: 'PMMA Ready', statusColor: 'bg-amber-500/10 text-amber-400' },
                    { patient: 'Logan Howlett', procedure: 'Scaling & Maintenance', time: '04:00 PM', status: 'Pending', statusColor: 'bg-zinc-800 text-zinc-400' },
                  ].map((appt, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-900/60 hover:bg-zinc-900/30 transition-all flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-semibold text-white">{appt.patient}</h4>
                        <p className="text-[10px] text-zinc-500">{appt.procedure}</p>
                      </div>
                      <div className="text-right space-y-0.5">
                        <span className="text-[10px] font-mono text-zinc-300">{appt.time}</span>
                        <div className="flex justify-end">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${appt.statusColor}`}>
                            {appt.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Digital Dentistry CAD/CAM Laboratory Queue */}
              <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-sm p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-amber-400" /> Laboratory & Milling Queue
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                    CAD/CAM live
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    { test: 'Zirconia Multi-unit Bridge', patient: 'Arthur Pendragon', system: '3Shape Order', status: 'Milling Queue', statusColor: 'bg-amber-500/10 text-amber-400 animate-pulse' },
                    { test: 'PMMA Provisionals (Full Arch)', patient: 'Clara Oswald', system: 'Exocad Design', status: 'Printing Queue', statusColor: 'bg-blue-500/10 text-blue-400 animate-pulse' },
                    { test: 'Single-tooth Zirconia Crown', patient: 'Scott Summers', system: 'Exocad Design', status: 'Completed', statusColor: 'bg-emerald-500/10 text-emerald-400' },
                    { test: 'E.Max Press Veneers (6 units)', patient: 'Diana Prince', system: '3Shape Order', status: 'Sintering', statusColor: 'bg-purple-500/10 text-purple-400' },
                    { test: 'Custom Titanium Abutment', patient: 'Bruce Wayne', system: 'Exocad Design', status: 'Calibrating', statusColor: 'bg-zinc-800 text-zinc-400' },
                    { test: 'Complete Denture Base Printing', patient: 'Scott Summers', system: '3Shape Order', status: 'Washing/Curing', statusColor: 'bg-pink-500/10 text-pink-400' },
                  ].map((lab, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-900/60 hover:bg-zinc-900/30 transition-all flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-semibold text-white">{lab.test}</h4>
                        <p className="text-[10px] text-zinc-500">Patient: {lab.patient} • {lab.system}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-medium ${lab.statusColor}`}>
                          {lab.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Split row: Imaging Hub & Practice Activity Audit Log */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Imaging & STL Files Viewer */}
              <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-sm p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-pink-400" /> Digital Dental Imaging & STL Files
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                    PACS Stream
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    { scan: 'High-Res CBCT (Double Arch)', patient: 'Bruce Wayne', type: 'DICOM Imports', status: 'Rendered' },
                    { scan: 'Upper/Lower Intraoral Scan', patient: 'Diana Prince', type: 'STL Files', status: 'CAD Aligned' },
                    { scan: '12-Angle Smile Portrait Set', patient: 'Clara Oswald', type: 'Smile Photos', status: 'AI Analyzed' },
                    { scan: 'Bite Wing Dental X-Ray', patient: 'Logan Howlett', type: 'DICOM Imports', status: 'Archived' },
                    { scan: 'Guided Implant Surgical Template', patient: 'Arthur Pendragon', type: 'STL Files', status: 'Sinter Ready' },
                  ].map((img, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-900/60 hover:bg-zinc-900/30 transition-all flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-semibold text-white">{img.scan}</h4>
                        <p className="text-[10px] text-zinc-500">Patient: {img.patient} • {img.type}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-medium ${
                          img.status === 'Rendered' || img.status === 'CAD Aligned'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : img.status === 'AI Analyzed'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 animate-pulse'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}>
                          {img.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practice Audit Log & Recent Activity */}
              <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-sm p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" /> Practice Activity Audit Log
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                    HIPAA Secure
                  </span>
                </div>

                <div className="space-y-3.5">
                  {[
                    { action: 'Crown preparation approved', user: 'Dr. Ahmed', target: 'Patient Pendragon', time: '10:14 AM' },
                    { action: 'CBCT scan accessed', user: 'Dr. Sarah Jenkins', target: 'Patient Bruce Wayne', time: '10:02 AM' },
                    { action: 'Intraoral scan STL exported', user: 'Lab Tech Barton', target: 'Milling Node 4', time: '09:48 AM' },
                    { action: 'Digital Smile Design generated', user: 'AI Copilot Engine', target: 'Patient Clara Oswald', time: '09:30 AM' },
                    { action: 'Denture Base 3D-printing initiated', user: 'Hygienist Jenkins', target: 'SprintRay Pro 95', time: '09:12 AM' },
                  ].map((act, idx) => (
                    <div key={idx} className="flex items-start justify-between text-[11px] text-zinc-400 border-b border-zinc-900/50 pb-2.5 last:border-0 last:pb-0">
                      <div className="space-y-0.5">
                        <p className="font-medium text-white">{act.action}</p>
                        <p className="text-[10px] text-zinc-500">{act.user} • {act.target}</p>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">{act.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dental Workspace Clinical Performance & Practice KPIs */}
            <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" /> Clinical Performance & Practice KPIs
                </h3>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 font-mono">
                  +12.4% this week <TrendingUp className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { title: 'Treatment Acceptance', value: '78.4%', desc: 'Optimal range > 75%' },
                  { title: 'Case Completion Rate', value: '92.1%', desc: '48 digital deliveries' },
                  { title: 'Chair Utilization', value: '86.4%', desc: '3 active operatory chairs' },
                  { title: 'Lab Turnaround', value: '2.4 Days', desc: 'In-house milling active' },
                  { title: 'Patient Satisfaction', value: '99.1%', desc: 'NPS Score: 94' },
                ].map((rev, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-900 space-y-1">
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">{rev.title}</span>
                    <h4 className="text-lg font-bold text-white font-mono">{rev.value}</h4>
                    <p className="text-[10px] text-zinc-500 leading-tight">{rev.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar Panel (Right - 4 Columns) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Smart Calendar / Dispatch Widget */}
            <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-emerald-400" /> Shift & Calendar Dispatch
                </h3>
                <span className="text-[10px] font-mono text-zinc-400">JUL 2026</span>
              </div>

              {/* Minimal Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                  <span key={idx} className="text-zinc-600 font-semibold py-1">{day}</span>
                ))}
                {Array.from({ length: 31 }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const isToday = dayNum === 17; // Matches current timestamp July 17
                  return (
                    <div
                      key={idx}
                      className={`py-1.5 rounded-lg text-xs font-mono transition-colors ${
                        isToday
                          ? 'bg-emerald-500 text-zinc-950 font-bold'
                          : 'text-zinc-400 hover:bg-zinc-800/50'
                      }`}
                    >
                      {dayNum}
                    </div>
                  );
                })}
              </div>

              {/* Operational Shift Info */}
              <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-900 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-white">Clinical Shift Leader</p>
                  <p className="text-[10px] text-zinc-500">07:00 AM - 07:00 PM</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ON CALL
                </span>
              </div>
            </div>

            {/* Real-time AI Notifications */}
            <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-400" /> Real-time AI Notifications
                </h3>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
              </div>

              <div className="space-y-3.5">
                {[
                  {
                    title: 'Restorative Clearance Flagged',
                    desc: 'AI detected high risk profile for Arthur Pendragon between planned full crown prep and active periodontal indicators.',
                    time: '2 mins ago',
                    type: 'alert'
                  },
                  {
                    title: 'CAD Margin Fit Evaluation',
                    desc: 'Exocad prep margin analysis for Clara Oswald finished with 99.4% precision check. Ready for milling dispatch.',
                    time: '12 mins ago',
                    type: 'info'
                  },
                  {
                    title: 'STL Scan Import Alignment',
                    desc: 'Upper/Lower intraoral scan STL file successfully mapped and aligned to virtual articulation table.',
                    time: '24 mins ago',
                    type: 'info'
                  }
                ].map((notif, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-900 flex gap-3 text-xs leading-relaxed">
                    {notif.type === 'critical' || notif.type === 'alert' ? (
                      <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-white">{notif.title}</span>
                        <span className="text-[9px] text-zinc-500 whitespace-nowrap font-mono">{notif.time}</span>
                      </div>
                      <p className="text-zinc-400 text-[11px]">{notif.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
