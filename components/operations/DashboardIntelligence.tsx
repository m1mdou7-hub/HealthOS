'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Activity, Calendar, ShieldAlert, Sparkles, 
  Clock, FlaskConical, AlertCircle, CheckCircle2, TrendingUp 
} from 'lucide-react';
import { Appointment, ChairStatus, QueueItem, RecallItem, Doctor } from './types';

interface DashboardIntelligenceProps {
  appointments: Appointment[];
  chairs: ChairStatus[];
  queue: QueueItem[];
  recalls: RecallItem[];
  doctors: Doctor[];
}

export default function DashboardIntelligence({
  appointments,
  chairs,
  queue,
  recalls,
  doctors
}: DashboardIntelligenceProps) {
  
  // Computations
  const totalVisitsToday = useMemo(() => {
    return appointments.filter(a => a.date === '2026-07-20' && a.status !== 'Cancelled').length;
  }, [appointments]);

  const completedVisits = useMemo(() => {
    return appointments.filter(a => a.date === '2026-07-20' && a.status === 'Completed').length;
  }, [appointments]);

  const chairOccupancyPercent = useMemo(() => {
    const occupiedCount = chairs.filter(c => c.status === 'Occupied').length;
    return Math.round((occupiedCount / chairs.length) * 100);
  }, [chairs]);

  const doctorsOnlineCount = useMemo(() => {
    return doctors.filter(d => d.status === 'Active' || d.status === 'Break').length;
  }, [doctors]);

  const overdueRecallsCount = useMemo(() => {
    return recalls.filter(r => r.status === 'Overdue').length;
  }, [recalls]);

  const activeProcedures = useMemo(() => {
    return chairs.filter(c => c.status === 'Occupied');
  }, [chairs]);

  return (
    <div id="dashboard-intelligence" className="space-y-6">
      
      {/* KPI Command Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-900 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Today's Treatment Schedule
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white font-mono">
              {totalVisitsToday} Visits
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono">
              {completedVisits} completed • {totalVisitsToday - completedVisits} pending
            </p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-900 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Chair Occupancy Rate
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white font-mono">
              {chairOccupancyPercent}%
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono">
              {chairs.filter(c => c.status === 'Occupied').length} of {chairs.length} seats engaged
            </p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-900 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Patients In Triage Queue
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white font-mono">
              {queue.length} Checked In
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono">
              Avg. wait duration: {queue.length > 0 ? Math.round(queue.reduce((sum, q) => sum + q.waitTime, 0) / queue.length) : 0} mins
            </p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-900 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Recall Backlog Status
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white font-mono">
              {overdueRecallsCount} Overdue
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono">
              Re-engagement campaign launched
            </p>
          </div>
        </div>

      </div>

      {/* Grid structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Procedures & Online Staff (Left - 7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Operatory Procedures */}
          <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/20 text-left space-y-4">
            <h4 className="text-xs font-bold font-mono uppercase text-zinc-500 tracking-wider">
              Live Operatory Procedures
            </h4>
            <div className="space-y-3">
              {activeProcedures.map((proc, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-900 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-bold text-white text-xs">{proc.currentPatient}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">Chair: {proc.name} • Dr: {proc.currentDoctor}</p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-zinc-300">
                      ~{proc.remainingTime} mins remaining
                    </span>
                  </div>
                </div>
              ))}
              {activeProcedures.length === 0 && (
                <div className="py-8 text-center text-zinc-600 italic text-xs">
                  All dental chairs currently vacant.
                </div>
              )}
            </div>
          </div>

          {/* Clinician On-Call Availability */}
          <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/20 text-left space-y-4">
            <h4 className="text-xs font-bold font-mono uppercase text-zinc-500 tracking-wider">
              On-Call Clinicians
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {doctors.map((doc, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-900 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-xs">{doc.name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">{doc.specialty}</p>
                  </div>
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    doc.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`} />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Laboratory Telemetry & Clinical Warnings (Right - 5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Lab Workload */}
          <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/20 text-left space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold font-mono uppercase text-zinc-500 tracking-wider">
                CAD/CAM Lab Workload
              </h4>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Active System Sync
              </span>
            </div>
            
            <div className="space-y-4">
              {[
                { task: 'Dental Crown Design (Exocad)', percent: 75, count: '3 cases', color: 'bg-indigo-500' },
                { task: 'Zirconia Milling (Roland Mill #1)', percent: 84, count: '2 cases in queue', color: 'bg-emerald-500' },
                { task: '3D Printed Wax-up Trial', percent: 45, count: '1 print batch', color: 'bg-purple-500' },
                { task: 'Sintering Hold Cycle (1450°C)', percent: 95, count: 'Holding stage', color: 'bg-amber-500' }
              ].map((lab, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-zinc-300">
                    <span className="font-semibold text-white">{lab.task}</span>
                    <span className="text-zinc-400">{lab.count} ({lab.percent}%)</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
                    <div className={`h-full ${lab.color}`} style={{ width: `${lab.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delayed & High-Priority Lab Cases Tracker */}
          <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/20 text-left space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold font-mono uppercase text-zinc-500 tracking-wider">
                Delayed / Delayed Risk Lab Cases
              </h4>
              <span className="text-[10px] font-mono text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full animate-pulse">
                2 ALERTS
              </span>
            </div>

            <div className="space-y-3">
              {[
                { patient: 'Marcus Aurelius', id: 'CASE-2026-A2', reason: 'Awaiting digital file confirmation (Prep scan re-upload requested)', stage: 'Pending Files', priority: 'High' },
                { patient: 'Arthur Pendragon', id: 'CASE-2026-A4', reason: 'Material dispatch lag - Custom shade block B1 on backorder', stage: 'Materials Hub', priority: 'Urgent' }
              ].map((c, idx) => (
                <div key={idx} className="p-3 bg-zinc-950 rounded-xl border border-rose-950/20 flex flex-col justify-between space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-white">{c.patient} <span className="text-zinc-500 font-mono text-[10px]">({c.id})</span></p>
                      <p className="text-rose-400 text-[10px] font-mono mt-0.5">{c.reason}</p>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/25 px-1.5 py-0.5 rounded">
                      {c.priority}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-900/60">
                    <span>Blockage Segment: {c.stage}</span>
                    <span className="text-amber-500">Milling Hold</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Alerts and Contraindications */}
          <div className="p-5 rounded-2xl border border-rose-500/10 bg-rose-500/[0.02] text-left space-y-4">
            <div className="flex items-center gap-1.5 border-b border-rose-500/15 pb-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h4 className="text-xs font-bold font-mono uppercase text-rose-400 tracking-wider">
                Critical Clinical Contramaths
              </h4>
            </div>

            <div className="space-y-3">
              {[
                { patient: 'Arthur Pendragon', alert: 'Severe allergy history: Penicillin Drugs.' },
                { patient: 'Bruce Wayne', alert: 'Severe Bruxism / nocturnal occlusion forces detected.' },
                { patient: 'Logan Howlett', alert: 'Extremely dense metal-adorned bone structure.' }
              ].map((al, idx) => (
                <div key={idx} className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 flex gap-2 text-xs leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">{al.patient}</p>
                    <p className="text-zinc-400 text-[11px]">{al.alert}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
