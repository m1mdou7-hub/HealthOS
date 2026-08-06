'use client';

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
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
        <div className="p-5 rounded-2xl card-elevated card-hover text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-sub)' }}>
              Today's Treatment Schedule
            </span>
            <div className="p-2 rounded-xl" style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)' }}>
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black font-mono" style={{ color: 'var(--text)' }}>
              {totalVisitsToday} Visits
            </h3>
            <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
              {completedVisits} completed • {totalVisitsToday - completedVisits} pending
            </p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-2xl card-elevated card-hover text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-sub)' }}>
              Chair Occupancy Rate
            </span>
            <div className="p-2 rounded-xl" style={{ background: 'color-mix(in srgb, var(--success) 12%, transparent)', color: 'var(--success)' }}>
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black font-mono" style={{ color: 'var(--text)' }}>
              {chairOccupancyPercent}%
            </h3>
            <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
              {chairs.filter(c => c.status === 'Occupied').length} of {chairs.length} seats engaged
            </p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-2xl card-elevated card-hover text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-sub)' }}>
              Patients In Triage Queue
            </span>
            <div className="p-2 rounded-xl" style={{ background: 'color-mix(in srgb, var(--warning) 12%, transparent)', color: 'var(--warning)' }}>
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black font-mono" style={{ color: 'var(--text)' }}>
              {queue.length} Checked In
            </h3>
            <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
              Avg. wait duration: {queue.length > 0 ? Math.round(queue.reduce((sum, q) => sum + q.waitTime, 0) / queue.length) : 0} mins
            </p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-2xl card-elevated card-hover text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-sub)' }}>
              Recall Backlog Status
            </span>
            <div className="p-2 rounded-xl" style={{ background: 'color-mix(in srgb, var(--info) 12%, transparent)', color: 'var(--info)' }}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black font-mono" style={{ color: 'var(--text)' }}>
              {overdueRecallsCount} Overdue
            </h3>
            <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
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
          <div className="p-5 rounded-2xl card-elevated text-left space-y-4">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider" style={{ color: 'var(--text-sub)' }}>
              Live Operatory Procedures
            </h4>
            <div className="space-y-3">
              {activeProcedures.map((proc, idx) => (
                <div key={idx} className="p-3.5 rounded-xl card-hover flex items-center justify-between" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <div className="space-y-0.5">
                    <p className="font-bold text-xs" style={{ color: 'var(--text)' }}>{proc.currentPatient}</p>
                    <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Chair: {proc.name} • Dr: {proc.currentDoctor}</p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 animate-pulse" style={{ color: 'var(--accent)' }} />
                    <span className="text-xs font-mono font-bold" style={{ color: 'var(--text-sub)' }}>
                      ~{proc.remainingTime} mins remaining
                    </span>
                  </div>
                </div>
              ))}
              {activeProcedures.length === 0 && (
                <div className="py-8 text-center italic text-xs" style={{ color: 'var(--text-muted)' }}>
                  All dental chairs currently vacant.
                </div>
              )}
            </div>
          </div>

          {/* Clinician On-Call Availability */}
          <div className="p-5 rounded-2xl card-elevated text-left space-y-4">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider" style={{ color: 'var(--text-sub)' }}>
              On-Call Clinicians
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {doctors.map((doc, idx) => (
                <div key={idx} className="p-3.5 rounded-xl card-hover flex items-center justify-between" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <div>
                    <p className="font-bold text-xs" style={{ color: 'var(--text)' }}>{doc.name}</p>
                    <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{doc.specialty}</p>
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
          <div className="p-5 rounded-2xl card-elevated text-left space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider" style={{ color: 'var(--text-sub)' }}>
                CAD/CAM Lab Workload
              </h4>
              <span className="badge badge-success text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                Active System Sync
              </span>
            </div>
            
            <div className="space-y-4">
              {[
                { task: 'Dental Crown Design (Exocad)', percent: 75, count: '3 cases', color: 'var(--info)' },
                { task: 'Zirconia Milling (Roland Mill #1)', percent: 84, count: '2 cases in queue', color: 'var(--success)' },
                { task: '3D Printed Wax-up Trial', percent: 45, count: '1 print batch', color: 'var(--accent)' },
                { task: 'Sintering Hold Cycle (1450°C)', percent: 95, count: 'Holding stage', color: 'var(--warning)' }
              ].map((lab, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono" style={{ color: 'var(--text-sub)' }}>
                    <span className="font-semibold" style={{ color: 'var(--text)' }}>{lab.task}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{lab.count} ({lab.percent}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <div className="h-full rounded-full" style={{ width: `${lab.percent}%`, background: lab.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delayed & High-Priority Lab Cases Tracker */}
          <div className="p-5 rounded-2xl card-elevated text-left space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider" style={{ color: 'var(--text-sub)' }}>
                Delayed / Delayed Risk Lab Cases
              </h4>
              <span className="badge badge-danger text-[10px] font-mono font-bold px-2 py-0.5 rounded-full animate-pulse">
                2 ALERTS
              </span>
            </div>

            <div className="space-y-3">
              {[
                { patient: 'Marcus Aurelius', id: 'CASE-2026-A2', reason: 'Awaiting digital file confirmation (Prep scan re-upload requested)', stage: 'Pending Files', priority: 'High' },
                { patient: 'Arthur Pendragon', id: 'CASE-2026-A4', reason: 'Material dispatch lag - Custom shade block B1 on backorder', stage: 'Materials Hub', priority: 'Urgent' }
              ].map((c, idx) => (
                <div key={idx} className="p-3 rounded-xl flex flex-col justify-between space-y-2 text-xs" style={{ background: 'var(--surface-2)', border: '1px solid color-mix(in srgb, var(--danger) 30%, transparent)' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold" style={{ color: 'var(--text)' }}>{c.patient} <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>({c.id})</span></p>
                      <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--danger)' }}>{c.reason}</p>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded" style={{ background: 'color-mix(in srgb, var(--danger) 15%, transparent)', color: 'var(--danger)', border: '1px solid color-mix(in srgb, var(--danger) 25%, transparent)' }}>
                      {c.priority}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono pt-1 border-t" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                    <span>Blockage Segment: {c.stage}</span>
                    <span style={{ color: 'var(--warning)' }}>Milling Hold</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Alerts and Contraindications */}
          <div className="p-5 rounded-2xl text-left space-y-4" style={{ background: 'color-mix(in srgb, var(--danger) 3%, transparent)', border: '1px solid color-mix(in srgb, var(--danger) 12%, transparent)' }}>
            <div className="flex items-center gap-1.5 border-b pb-2" style={{ borderColor: 'color-mix(in srgb, var(--danger) 18%, transparent)' }}>
              <ShieldAlert className="w-4 h-4" style={{ color: 'var(--danger)' }} />
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider" style={{ color: 'var(--danger)' }}>
                Critical Clinical Contraindications
              </h4>
            </div>

            <div className="space-y-3">
              {[
                { patient: 'Arthur Pendragon', alert: 'Severe allergy history: Penicillin Drugs.' },
                { patient: 'Bruce Wayne', alert: 'Severe Bruxism / nocturnal occlusion forces detected.' },
                { patient: 'Logan Howlett', alert: 'Extremely dense metal-adorned bone structure.' }
              ].map((al, idx) => (
                <div key={idx} className="p-3 rounded-xl flex gap-2 text-xs leading-relaxed" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--danger)' }} />
                  <div>
                    <p className="font-bold" style={{ color: 'var(--text)' }}>{al.patient}</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-sub)' }}>{al.alert}</p>
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
