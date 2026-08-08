'use client';

import React from 'react';
import { LabCase, TechnicianUtilization } from './labTypes';
import { AlertCircle, Clock, CheckCircle2, User, ChevronRight, Activity, TrendingUp } from 'lucide-react';

interface LabDashboardViewProps {
  cases: LabCase[];
  technicians: TechnicianUtilization[];
  onSelectCase: (caseId: string, tabName: string) => void;
}

export default function LabDashboardView({ cases, technicians, onSelectCase }: LabDashboardViewProps) {
  const activeCasesCount = cases.filter(c => c.status !== 'Completion').length;
  const delayedCases = cases.filter(c => c.isDelayed);
  const urgentCasesCount = cases.filter(c => c.priority === 'Urgent').length;
  const pendingApprovalsCount = cases.filter(c => 
    c.communication.some(m => m.type === 'Approval Request' && !m.isApproved)
  ).length;

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Delayed Alerts Banner */}
      {delayedCases.length > 0 && (
        <div id="delay-alerts-banner" className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div className="space-y-1 text-start">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-rose-200">
              Critical Lab Delay Alerts ({delayedCases.length} Cases)
            </h4>
            <p className="text-xs text-zinc-400 font-mono">
              The following restorations are currently flagged as delayed:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {delayedCases.map(c => (
                <button
                  key={c.id}
                  id={`delay-case-btn-${c.id}`}
                  onClick={() => onSelectCase(c.id, 'CaseWorkspace')}
                  className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-2xs font-mono border border-rose-500/30 flex items-center gap-1.5 transition-all"
                >
                  <span>{c.id} - {c.patientName}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div id="lab-kpi-grid" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl text-start space-y-2">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-2xs font-mono font-bold uppercase tracking-wider">Active restorations</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl font-black font-mono text-white">{activeCasesCount}</h3>
            <p className="text-2xs text-zinc-500 font-mono">In CAD/CAM workflow</p>
          </div>
        </div>

        <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl text-start space-y-2">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-2xs font-mono font-bold uppercase tracking-wider">Urgent Priority</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl font-black font-mono text-rose-400">{urgentCasesCount}</h3>
            <p className="text-2xs text-zinc-500 font-mono">Immediate manufacturing priority</p>
          </div>
        </div>

        <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl text-start space-y-2">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-2xs font-mono font-bold uppercase tracking-wider">Pending Approvals</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl font-black font-mono text-purple-300">{pendingApprovalsCount}</h3>
            <p className="text-2xs text-zinc-500 font-mono">Clinician signature required</p>
          </div>
        </div>

        <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl text-start space-y-2">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-2xs font-mono font-bold uppercase tracking-wider">Average Dispatch</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl font-black font-mono text-white">4.2 Days</h3>
            <p className="text-2xs text-zinc-500 font-mono">Cycle turnaround rate</p>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Cases list (8 columns) */}
        <div className="lg:col-span-8 space-y-4 text-start">
          <h4 className="text-xs font-black font-mono uppercase tracking-wider text-zinc-400">
            Active Lab Cases & Manufacturing Telemetry
          </h4>

          <div id="lab-cases-telemetry" className="divide-y divide-zinc-900 border border-zinc-900 rounded-2xl bg-zinc-950 overflow-hidden">
            {cases.map((c) => (
              <div
                key={c.id}
                id={`lab-case-row-${c.id}`}
                onClick={() => onSelectCase(c.id, 'CaseWorkspace')}
                className="p-4 hover:bg-zinc-900/40 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black uppercase text-zinc-950 font-mono ${
                    c.priority === 'Urgent' ? 'bg-rose-500' : c.priority === 'High' ? 'bg-amber-400' : 'bg-zinc-700 text-zinc-300'
                  }`}>
                    {c.restorationType[0]}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{c.patientName}</span>
                      <span className="text-2xs font-mono px-1.5 py-0.2 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded">
                        {c.id}
                      </span>
                      {c.isDelayed && (
                        <span className="text-2xs font-mono px-1.5 py-0.2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded font-bold uppercase animate-pulse">
                          Delayed
                        </span>
                      )}
                    </div>
                    <p className="text-2xs text-zinc-500 font-mono">
                      {c.restorationType} • Dr. {c.doctorName} • {c.caseType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-between md:justify-end">
                  <div className="space-y-1 text-end">
                    <span className="text-2xs font-mono text-zinc-500 uppercase block font-bold">Stage</span>
                    <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      {c.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-end">
                    <span className="text-2xs font-mono text-zinc-500 uppercase block font-bold">Progress</span>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400" style={{ width: `${c.progressPercent}%` }} />
                      </div>
                      <span className="text-2xs font-mono font-bold text-white">{c.progressPercent}%</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-end hidden sm:block">
                    <span className="text-2xs font-mono text-zinc-500 uppercase block font-bold">Technician</span>
                    <p className="text-xs text-zinc-300">{c.assignedTechnician}</p>
                  </div>

                  <div className="space-y-1 text-end">
                    <span className="text-2xs font-mono text-zinc-500 uppercase block font-bold">Due Date</span>
                    <p className="text-xs text-amber-400 font-mono font-semibold">{c.dueDate}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Technicians and workloads (4 columns) */}
        <div className="lg:col-span-4 space-y-4 text-start">
          <h4 className="text-xs font-black font-mono uppercase tracking-wider text-zinc-400">
            Technician Utilization & Load
          </h4>

          <div id="technician-capacity-list" className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-4">
            {technicians.map((tech, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-850 text-zinc-400">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-white">{tech.name}</p>
                      <p className="text-2xs text-zinc-500 font-mono">Active: {tech.activeCases} • Done Today: {tech.completedToday}</p>
                    </div>
                  </div>
                  <div className="text-end">
                    <p className="font-bold text-emerald-400 font-mono">{tech.utilizationRate}%</p>
                    <p className="text-2xs text-zinc-500 font-mono">Capacity</p>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${tech.utilizationRate > 90 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                    style={{ width: `${tech.utilizationRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
