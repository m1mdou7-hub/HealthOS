'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { SupabaseClient } from '@supabase/supabase-js';
import { Clipboard, Plus, Eye, Edit3, Trash2, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { clinicalService, TreatmentPlan, TreatmentItem } from '../../../utils/services/clinicalService';
import { Patient } from '../PatientWorkspace';

interface TreatmentPlansPanelProps {
  supabase: SupabaseClient;
  activePatient: Patient;
  demoMode: boolean;
}

export default function TreatmentPlansPanel({ supabase, activePatient, demoMode }: TreatmentPlansPanelProps) {
  const queryClient = useQueryClient();
  const t = useTranslations('PatientWorkspace');

  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TreatmentPlan | null>(null);

  // Form state
  const [planForm, setPlanForm] = useState({
    title: '',
    description: '',
    estimatedCost: 15800,
    remainingBalance: 9800,
    priority: 'Standard' as TreatmentPlan['priority'],
    treatingDoctor: 'Dr. Ahmed',
    itemsText: '16 | Implant Placement D6010 | Completed | 2850 | Dr. Ahmed | 2026-07-15\n26 | Implant Placement D6010 | Completed | 2850 | Dr. Ahmed | 2026-07-15\n14 | Pre-prosthetic Abutment D6056 | In Progress | 1200 | Dr. Ahmed'
  });

  // Query
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['treatmentPlans', activePatient.id],
    queryFn: () => clinicalService.getTreatmentPlans(supabase, activePatient.id, demoMode),
    enabled: !!activePatient.id
  });

  // Mutation
  const savePlansMutation = useMutation({
    mutationFn: (newPlans: TreatmentPlan[]) =>
      clinicalService.saveTreatmentPlans(supabase, activePatient.id, newPlans, demoMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatmentPlans', activePatient.id] });
      setShowPlanModal(false);
      setEditingPlan(null);
    }
  });

  const toggleExpand = (planId: string) => {
    setExpandedPlans(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }));
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.title.trim()) return;

    // Parse items text
    const lines = planForm.itemsText.split('\n').filter(Boolean);
    const parsedItems: TreatmentItem[] = lines.map(line => {
      const parts = line.split('|').map(s => s.trim());
      const toothNumber = parts[0] || 'N/A';
      const procedure = parts[1] || 'Dental Procedure';
      const status = (parts[2] || 'Pending') as TreatmentItem['status'];
      const estimatedCost = Number(parts[3]) || 0;
      const assignedDoctor = parts[4] || 'Dr. Ahmed';
      const completionDate = parts[5] || undefined;
      return {
        toothNumber,
        procedure,
        status,
        estimatedCost,
        assignedDoctor,
        completionDate
      };
    });

    const calculatedProgress = parsedItems.length > 0 
      ? Math.round((parsedItems.filter(i => i.status === 'Completed').length / parsedItems.length) * 100)
      : 0;

    if (editingPlan) {
      const updated = plans.map(p => {
        if (p.id === editingPlan.id) {
          return {
            ...p,
            title: planForm.title,
            description: planForm.description,
            estimatedCost: Number(planForm.estimatedCost),
            remainingBalance: Number(planForm.remainingBalance),
            priority: planForm.priority,
            treatingDoctor: planForm.treatingDoctor,
            progress: calculatedProgress,
            items: parsedItems
          };
        }
        return p;
      });
      savePlansMutation.mutate(updated);
    } else {
      const newPlan: TreatmentPlan = {
        id: `TX-${Math.floor(100 + Math.random() * 900)}`,
        title: planForm.title,
        description: planForm.description,
        estimatedCost: Number(planForm.estimatedCost),
        remainingBalance: Number(planForm.remainingBalance),
        priority: planForm.priority,
        progress: calculatedProgress,
        treatingDoctor: planForm.treatingDoctor,
        createdDate: new Date().toISOString().split('T')[0],
        items: parsedItems
      };
      savePlansMutation.mutate([newPlan, ...plans]);
    }
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm("Are you sure you want to delete this treatment plan?")) {
      const updated = plans.filter(p => p.id !== planId);
      savePlansMutation.mutate(updated);
    }
  };

  const translateStatus = (s: string) => {
    switch (s) {
      case 'Completed':
        return t('status_completed');
      case 'In Progress':
        return t('status_in_progress');
      case 'Pending':
        return t('status_pending');
      case 'Cancelled':
        return t('status_cancelled');
      default:
        return s;
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header action panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-900/10 p-4 rounded-2xl border border-zinc-900 gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono">
            <Clipboard className="w-4 h-4 text-emerald-400" /> {t('tx_coordinator')}
          </h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">{t('tx_coordinator_desc')}</p>
        </div>
        <button
          onClick={() => {
            setEditingPlan(null);
            setPlanForm({
              title: '',
              description: '',
              estimatedCost: 12000,
              remainingBalance: 8000,
              priority: 'Standard',
              treatingDoctor: activePatient.primaryDoctor || 'Dr. Ahmed',
              itemsText: '11 | Crown Preparation D6058 | Pending | 1950 | Dr. Ahmed\n21 | Crown Preparation D6058 | Pending | 1950 | Dr. Ahmed'
            });
            setShowPlanModal(true);
          }}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1 self-stretch sm:self-auto justify-center"
        >
          <Plus className="w-3.5 h-3.5" /> {t('btn_add_plan')}
        </button>
      </div>

      {/* Plan courses */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-zinc-500 text-xs text-center py-6 animate-pulse">Loading treatment plans...</div>
        ) : plans.length === 0 ? (
          <div className="text-zinc-500 text-xs text-center py-8 border border-zinc-900 rounded-2xl bg-zinc-950/20">
            {t('no_plans_logged')}
          </div>
        ) : (
          plans.map((plan) => {
            const isExpanded = !!expandedPlans[plan.id];

            return (
              <div key={plan.id} className="p-5 rounded-2xl border border-zinc-900 bg-zinc-950/20 space-y-4">
                {/* Header card info */}
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="text-left flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">{plan.id} • Created {plan.createdDate}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-mono font-bold border ${
                        plan.priority === 'Urgent' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        plan.priority === 'High' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}>
                        {plan.priority} Priority
                      </span>
                      <span className="text-[9px] font-mono text-zinc-400">Dr. {plan.treatingDoctor}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1">{plan.title}</h3>
                    <p className="text-xs text-zinc-400 mt-1">{plan.description}</p>
                  </div>
                  <div className="text-right flex items-start gap-4 shrink-0 font-mono text-xs">
                    <div>
                      <span className="text-[9px] text-zinc-500 block uppercase">{t('est_total_cost')}</span>
                      <span className="text-white font-bold">${plan.estimatedCost.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 block uppercase">{t('remaining_balance')}</span>
                      <span className="text-amber-400 font-bold">${plan.remainingBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-1.5 self-center">
                      <button
                        onClick={() => {
                          setEditingPlan(plan);
                          setPlanForm({
                            title: plan.title,
                            description: plan.description,
                            estimatedCost: plan.estimatedCost,
                            remainingBalance: plan.remainingBalance,
                            priority: plan.priority,
                            treatingDoctor: plan.treatingDoctor,
                            itemsText: plan.items.map(i => `${i.toothNumber} | ${i.procedure} | ${i.status} | ${i.estimatedCost} | ${i.assignedDoctor}${i.completionDate ? ' | ' + i.completionDate : ''}`).join('\n')
                          });
                          setShowPlanModal(true);
                        }}
                        className="text-zinc-400 hover:text-white"
                      >
                        {t('btn_edit_plan')}
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        {t('btn_delete_plan')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>{t('milestones')}</span>
                    <span>{plan.progress}%</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-950">
                    <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${plan.progress}%` }} />
                  </div>
                </div>

                {/* Expand Toggle */}
                <button
                  onClick={() => toggleExpand(plan.id)}
                  className="w-full text-center py-1 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-900/60 rounded-xl text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors flex items-center justify-center gap-1 font-mono uppercase"
                >
                  {isExpanded ? (
                    <>{t('hide_proc')} <ChevronUp className="w-3.5 h-3.5" /></>
                  ) : (
                    <>{t('expand_proc')} <ChevronDown className="w-3.5 h-3.5" /></>
                  )}
                </button>

                {/* Procedures list details */}
                {isExpanded && (
                  <div className="space-y-2 border-t border-zinc-900/40 pt-3">
                    <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase block">{t('proc_tooth_map')}</span>
                    <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-950/40">
                      <table className="w-full text-left text-[11px] font-mono text-zinc-300">
                        <thead className="bg-zinc-900/20 text-[9px] uppercase tracking-wider text-zinc-500 border-b border-zinc-900">
                          <tr>
                            <th className="px-4 py-2">{t('th_tooth')}</th>
                            <th className="px-4 py-2">{t('th_proc')}</th>
                            <th className="px-4 py-2">{t('th_provider')}</th>
                            <th className="px-4 py-2">{t('th_cost')}</th>
                            <th className="px-4 py-2">{t('th_status')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/40">
                          {plan.items.map((item, index) => (
                            <tr key={index} className="hover:bg-zinc-900/10">
                              <td className="px-4 py-2 text-white font-bold">{item.toothNumber}</td>
                              <td className="px-4 py-2 font-sans text-zinc-200">{item.procedure}</td>
                              <td className="px-4 py-2">Dr. {item.assignedDoctor}</td>
                              <td className="px-4 py-2">${item.estimatedCost.toLocaleString()}</td>
                              <td className="px-4 py-2">
                                <span className={`px-1.5 py-0.2 rounded text-[9px] border font-bold uppercase ${
                                  item.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  item.status === 'In Progress' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                  'bg-zinc-900 text-zinc-500 border-zinc-800'
                                }`}>
                                  {translateStatus(item.status)}
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
            );
          })
        )}
      </div>

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSavePlan} className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl w-full max-w-lg space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white border-b border-zinc-900 pb-2">
              {editingPlan ? t('btn_edit_plan') : t('btn_add_plan')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-zinc-400 font-semibold">{t('label_plan_title')}</label>
                <input
                  type="text"
                  value={planForm.title}
                  onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                  placeholder="e.g. Posterior Lower Arch Dental Implants"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-zinc-400 font-semibold">{t('label_plan_desc')}</label>
                <textarea
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">{t('label_est_cost')}</label>
                <input
                  type="number"
                  value={planForm.estimatedCost}
                  onChange={(e) => setPlanForm({ ...planForm, estimatedCost: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">{t('label_plan_priority')}</label>
                <select
                  value={planForm.priority}
                  onChange={(e) => setPlanForm({ ...planForm, priority: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
                >
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Standard">Standard</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-zinc-400 font-semibold">{t('label_procedures_format')}</label>
                <textarea
                  value={planForm.itemsText}
                  onChange={(e) => setPlanForm({ ...planForm, itemsText: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-zinc-900 pt-3">
              <button
                type="button"
                onClick={() => setShowPlanModal(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savePlansMutation.isPending}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
              >
                {t('btn_save_plan')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
