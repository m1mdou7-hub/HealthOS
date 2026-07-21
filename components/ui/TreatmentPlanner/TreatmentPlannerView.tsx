import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clipboard, Plus, Trash2, Edit, CheckCircle,
  Clock, AlertTriangle, Layers, Calendar, DollarSign
} from 'lucide-react';

interface Phase {
  name: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
  details: string;
}

interface Procedure {
  toothNumber: string;
  procedureCode: string;
  description: string;
  cost: number;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
}

export interface TreatmentPlan {
  id: string;
  title: string;
  description: string;
  estimatedCost: number;
  status: 'Draft' | 'Active' | 'Completed' | 'Suspended';
  progress: number;
  createdDate: string;
  phases?: Phase[];
  procedures?: Procedure[];
  priority?: 'High' | 'Medium' | 'Low';
  appointmentLinked?: boolean;
}

interface Props {
  activePatient: any;
  treatmentPlans: TreatmentPlan[];
  saveTreatmentPlansList: (plans: TreatmentPlan[]) => void;
}

export default function TreatmentPlannerView({ activePatient, treatmentPlans, saveTreatmentPlansList }: Props) {
  const [isTxPlanModalOpen, setIsTxPlanModalOpen] = useState(false);
  const [editingTxPlan, setEditingTxPlan] = useState<TreatmentPlan | null>(null);
  const [txPlanForm, setTxPlanForm] = useState<any>({
    title: '',
    description: '',
    estimatedCost: 0,
    status: 'Draft',
    progress: 0,
    priority: 'Medium',
    phasesText: '',
    proceduresText: ''
  });

  const handleOpenCreateModal = () => {
    setEditingTxPlan(null);
    setTxPlanForm({
      title: '',
      description: '',
      estimatedCost: 0,
      status: 'Draft',
      progress: 0,
      priority: 'Medium',
      phasesText: "Phase 1: Diagnostic Modeling\nPhase 2: Preparations & Temporization\nPhase 3: Laboratory Execution\nPhase 4: Sintering & Delivery",
      proceduresText: "11|D6010|Surgical placement of implant body|2800\n11|D6056|Prefabricated abutment|1250"
    });
    setIsTxPlanModalOpen(true);
  };

  const handleOpenEditModal = (plan: TreatmentPlan) => {
    setEditingTxPlan(plan);
    setTxPlanForm({
      title: plan.title,
      description: plan.description || '',
      estimatedCost: plan.estimatedCost,
      status: plan.status,
      progress: plan.progress,
      priority: plan.priority || 'Medium',
      phasesText: plan.phases?.map(p => p.name).join('\n') || '',
      proceduresText: plan.procedures?.map(p => `${p.toothNumber}|${p.procedureCode}|${p.description}|${p.cost}`).join('\n') || ''
    });
    setIsTxPlanModalOpen(true);
  };

  const handleSavePlan = () => {
    const phasesArray: Phase[] = (txPlanForm.phasesText || '')
      .split('\n')
      .filter((line: string) => line.trim())
      .map((line: string, idx: number) => ({
        name: line,
        status: idx === 0 ? "In Progress" : "Planned",
        details: "Milestone phase defined by prosthodontist."
      }));

    const proceduresArray: Procedure[] = (txPlanForm.proceduresText || '')
      .split('\n')
      .filter((line: string) => line.trim())
      .map((line: string) => {
        const parts = line.split('|');
        return {
          toothNumber: parts[0] || '',
          procedureCode: parts[1] || '',
          description: parts[2] || '',
          cost: parseFloat(parts[3]) || 0,
          status: 'Planned'
        };
      });

    if (editingTxPlan) {
      const updated = treatmentPlans.map(p => {
        if (p.id === editingTxPlan.id) {
          return {
            ...p,
            title: txPlanForm.title || "Prosthetic Course",
            description: txPlanForm.description,
            estimatedCost: txPlanForm.estimatedCost,
            status: txPlanForm.status,
            progress: txPlanForm.progress,
            priority: txPlanForm.priority,
            phases: phasesArray,
            procedures: proceduresArray
          };
        }
        return p;
      });
      saveTreatmentPlansList(updated);
    } else {
      const newPlan: TreatmentPlan = {
        id: `TX-${Math.floor(100 + Math.random() * 900)}`,
        title: txPlanForm.title || "Prosthetic Course",
        description: txPlanForm.description,
        estimatedCost: txPlanForm.estimatedCost,
        status: txPlanForm.status,
        progress: txPlanForm.progress,
        priority: txPlanForm.priority,
        createdDate: new Date().toISOString().split('T')[0],
        phases: phasesArray,
        procedures: proceduresArray
      };
      saveTreatmentPlansList([...treatmentPlans, newPlan]);
    }
    setIsTxPlanModalOpen(false);
  };

  const handleDeletePlan = (id: string) => {
    if (confirm("Are you sure you want to delete this treatment plan?")) {
      saveTreatmentPlansList(treatmentPlans.filter(p => p.id !== id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Active':
      case 'In Progress': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Draft':
      case 'Planned': return 'bg-zinc-800 text-zinc-400 border border-zinc-700';
      case 'Suspended':
      case 'Cancelled': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default: return 'bg-zinc-800 text-zinc-400 border border-zinc-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-400';
      case 'Medium': return 'text-amber-400';
      case 'Low': return 'text-blue-400';
      default: return 'text-zinc-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-900/25 p-4 rounded-xl border border-zinc-900 gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clipboard className="w-4 h-4 text-purple-400" /> Dynamic Treatment Planner
          </h3>
          <p className="text-xs text-zinc-400">Establish multi-phase clinical courses with estimated cost breakdowns, tooth-by-tooth procedures, and milestones.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1 self-stretch sm:self-auto justify-center"
        >
          <Plus className="w-3.5 h-3.5" /> Create Plan
        </button>
      </div>

      {/* Form Modal */}
      {isTxPlanModalOpen && (
        <div className="p-5 rounded-2xl border border-emerald-500/20 bg-zinc-950/90 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-zinc-900 pb-2">
            {editingTxPlan ? "Modify Treatment Plan parameters" : "Initialize New Treatment Plan Course"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-zinc-400 font-semibold">Plan Title</label>
              <input
                type="text"
                value={txPlanForm.title}
                onChange={(e) => setTxPlanForm({ ...txPlanForm, title: e.target.value })}
                placeholder="e.g. Anterior E.Max Laminate Veneers"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-zinc-400 font-semibold">Estimated Case Fee ($)</label>
              <input
                type="number"
                value={txPlanForm.estimatedCost}
                onChange={(e) => setTxPlanForm({ ...txPlanForm, estimatedCost: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-emerald-500/50 font-mono"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-zinc-400 font-semibold">Clinical Description</label>
              <textarea
                value={txPlanForm.description}
                onChange={(e) => setTxPlanForm({ ...txPlanForm, description: e.target.value })}
                placeholder="Describe the therapeutic objectives and parameters..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-emerald-500/50 min-h-[50px]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-zinc-400 font-semibold">Milestone Progress (%)</label>
              <input
                type="number"
                value={txPlanForm.progress}
                onChange={(e) => setTxPlanForm({ ...txPlanForm, progress: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-emerald-500/50 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-zinc-400 font-semibold">Status Indicator</label>
              <select
                value={txPlanForm.status}
                onChange={(e) => setTxPlanForm({ ...txPlanForm, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 focus:outline-none"
              >
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-zinc-400 font-semibold">Priority</label>
              <select
                value={txPlanForm.priority}
                onChange={(e) => setTxPlanForm({ ...txPlanForm, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 focus:outline-none"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-zinc-400 font-semibold">Treatment Phases (One per line)</label>
              <textarea
                value={txPlanForm.phasesText}
                onChange={(e) => setTxPlanForm({ ...txPlanForm, phasesText: e.target.value })}
                placeholder="Phase 1: Diagnostic Modeling&#10;Phase 2: Prep & Temporaries"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-emerald-500/50 min-h-[100px] font-mono"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-zinc-400 font-semibold">Tooth-by-Tooth Procedures (Format: Tooth|Code|Description|Cost)</label>
              <textarea
                value={txPlanForm.proceduresText}
                onChange={(e) => setTxPlanForm({ ...txPlanForm, proceduresText: e.target.value })}
                placeholder="11|D6010|Surgical placement of implant body|2800"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-emerald-500/50 min-h-[100px] font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsTxPlanModalOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs border border-zinc-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePlan}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold"
            >
              Save Parameters
            </button>
          </div>
        </div>
      )}

      {/* Plans List */}
      <div className="space-y-4">
        {treatmentPlans.length === 0 ? (
          <div className="p-8 text-center bg-zinc-950 border border-zinc-900 rounded-2xl">
            <p className="text-zinc-500 text-xs font-mono">No active treatment plans staged for {activePatient?.name || 'this patient'}.</p>
          </div>
        ) : (
          treatmentPlans.map(plan => (
            <div key={plan.id} className="p-5 rounded-2xl border border-zinc-900 bg-zinc-950/40 space-y-4 text-left group">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-white uppercase bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                      {plan.id}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest ${getStatusColor(plan.status)}`}>
                      {plan.status}
                    </span>
                    {plan.priority && (
                      <span className={`text-[10px] font-bold ml-2 ${getPriorityColor(plan.priority)}`}>
                        {plan.priority} Priority
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-black text-white">{plan.title}</h4>
                  <p className="text-[11px] text-zinc-500">{plan.description}</p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="text-lg font-mono font-bold text-emerald-400">
                    ${plan.estimatedCost?.toLocaleString() || '0.00'}
                  </span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEditModal(plan)}
                      className="text-xs text-zinc-400 hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-zinc-500">Overall Milestone Progress</span>
                  <span className="text-emerald-400 font-bold">{plan.progress}%</span>
                </div>
                <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-900">
                  <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${plan.progress}%` }} />
                </div>
              </div>

              {/* Phase Steps list */}
              {plan.phases && plan.phases.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-zinc-900">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Detailed Stages / Phases</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {plan.phases.map((step, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-900 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-[11px] font-bold text-white leading-normal">{step.name}</h4>
                            <span className={`text-[9px] font-mono shrink-0 px-1.5 py-0.5 rounded ${getStatusColor(step.status)}`}>
                              {step.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 leading-tight">{step.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tooth-by-Tooth Procedures */}
              {plan.procedures && plan.procedures.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-zinc-900">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Tooth-by-Tooth Procedures</span>
                  <div className="overflow-x-auto rounded-lg border border-zinc-900">
                    <table className="w-full text-left border-collapse text-xs font-mono">
                      <thead>
                        <tr className="bg-zinc-950 text-zinc-500 text-[9px] uppercase font-bold border-b border-zinc-900">
                          <th className="p-2">Tooth</th>
                          <th className="p-2">Code</th>
                          <th className="p-2">Description</th>
                          <th className="p-2 text-right">Cost</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
                        {plan.procedures.map((proc, idx) => (
                          <tr key={idx} className="hover:bg-zinc-900/40">
                            <td className="p-2 font-bold text-white">{proc.toothNumber}</td>
                            <td className="p-2">{proc.procedureCode}</td>
                            <td className="p-2 text-zinc-400 truncate max-w-[200px]">{proc.description}</td>
                            <td className="p-2 text-emerald-400 font-bold text-right">${proc.cost}</td>
                            <td className="p-2 text-right">
                              <span className={`text-[9px] font-mono shrink-0 px-1.5 py-0.5 rounded ${getStatusColor(proc.status)}`}>
                                {proc.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
