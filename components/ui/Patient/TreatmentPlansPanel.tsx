'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { SupabaseClient } from '@supabase/supabase-js';
import { Clipboard, Plus, Edit3, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { clinicalService, TreatmentPlan, TreatmentItem } from '../../../utils/services/clinicalService';
import { Patient } from '../PatientWorkspace';
import { Button, Card, Badge, Input, Textarea, Select, Modal, Progress, Skeleton, EmptyState } from '@/components/ui/design-system';

interface TreatmentPlansPanelProps {
  supabase: SupabaseClient;
  activePatient: Patient;
  demoMode: boolean;
}

const PRIORITY_OPTIONS = [
  { value: 'Urgent', label: 'Urgent' },
  { value: 'High', label: 'High' },
  { value: 'Standard', label: 'Standard' },
  { value: 'Low', label: 'Low' },
];

const priorityTone = (p: TreatmentPlan['priority']) => {
  if (p === 'Urgent') return 'error' as const;
  if (p === 'High') return 'warning' as const;
  return 'default' as const;
};

const itemStatusTone = (s: TreatmentItem['status']) => {
  if (s === 'Completed') return 'success' as const;
  if (s === 'In Progress') return 'accent' as const;
  return 'default' as const;
};

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
    <div className="space-y-6 text-start">
      {/* Header action panel */}
      <Card variant="elevated" hover={false} className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-sm font-bold text-[var(--velvet-text)] flex items-center gap-1.5 font-mono">
              <Clipboard className="w-4 h-4 text-[var(--velvet-success)]" /> {t('tx_coordinator')}
            </h3>
            <p className="text-xs text-[var(--velvet-text-muted)] mt-0.5">{t('tx_coordinator_desc')}</p>
          </div>
          <Button
            size="sm"
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
            className="self-stretch sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" /> {t('btn_add_plan')}
          </Button>
        </div>
      </Card>

      {/* Plan courses */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, idx) => (
              <Skeleton key={idx} variant="card" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <Card variant="elevated" hover={false} className="rounded-3xl">
            <EmptyState
              icon={<Clipboard className="w-6 h-6" />}
              title={t('no_plans_logged')}
            />
          </Card>
        ) : (
          plans.map((plan) => {
            const isExpanded = !!expandedPlans[plan.id];

            return (
              <Card key={plan.id} variant="elevated" hover={false} className="p-5 space-y-4">
                {/* Header card info */}
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="text-start flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-2xs font-mono text-[var(--velvet-text-muted)] uppercase">{plan.id} • Created {plan.createdDate}</span>
                      <Badge tone={priorityTone(plan.priority)} className="text-2xs uppercase font-mono font-bold px-2 py-0.5 rounded">
                        {plan.priority} Priority
                      </Badge>
                      <span className="text-2xs font-mono text-[var(--velvet-text-muted)]">Dr. {plan.treatingDoctor}</span>
                    </div>
                    <h3 className="text-sm font-bold text-[var(--velvet-text)] mt-1">{plan.title}</h3>
                    <p className="text-xs text-[var(--velvet-text-muted)] mt-1">{plan.description}</p>
                  </div>
                  <div className="text-end flex items-start gap-4 shrink-0 font-mono text-xs">
                    <div>
                      <span className="text-2xs text-[var(--velvet-text-muted)] block uppercase">{t('est_total_cost')}</span>
                      <span className="text-[var(--velvet-text)] font-bold">${plan.estimatedCost.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-2xs text-[var(--velvet-text-muted)] block uppercase">{t('remaining_balance')}</span>
                      <span className="text-[var(--velvet-warning)] font-bold">${plan.remainingBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-1.5 self-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2"
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
                      >
                        {t('btn_edit_plan')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2 text-[var(--velvet-error)] hover:text-[var(--velvet-error)]"
                        onClick={() => handleDeletePlan(plan.id)}
                      >
                        {t('btn_delete_plan')}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-2xs font-mono text-[var(--velvet-text-muted)]">
                    <span>{t('milestones')}</span>
                    <span>{plan.progress}%</span>
                  </div>
                  <Progress value={plan.progress} size="sm" tone="success" />
                </div>

                {/* Expand Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => toggleExpand(plan.id)}
                  className="py-1 rounded-xl text-2xs text-[var(--velvet-text-muted)] hover:text-[var(--velvet-text)] font-mono uppercase"
                >
                  {isExpanded ? (
                    <>{t('hide_proc')} <ChevronUp className="w-3.5 h-3.5" /></>
                  ) : (
                    <>{t('expand_proc')} <ChevronDown className="w-3.5 h-3.5" /></>
                  )}
                </Button>

                {/* Procedures list details */}
                {isExpanded && (
                  <div className="space-y-2 border-t pt-3" style={{ borderColor: 'var(--velvet-border)' }}>
                    <span className="text-2xs font-mono text-[var(--velvet-text-muted)] font-bold uppercase block">{t('proc_tooth_map')}</span>
                    <div className="overflow-x-auto rounded-xl border border-[var(--velvet-border)] bg-[var(--velvet-surface-1)]">
                      <table className="w-full text-start text-xs font-mono text-[var(--velvet-text-sub)]">
                        <thead className="bg-[var(--velvet-surface-2)] text-2xs uppercase tracking-wider text-[var(--velvet-text-muted)] border-b border-[var(--velvet-border)]">
                          <tr>
                            <th className="px-4 py-2">{t('th_tooth')}</th>
                            <th className="px-4 py-2">{t('th_proc')}</th>
                            <th className="px-4 py-2">{t('th_provider')}</th>
                            <th className="px-4 py-2">{t('th_cost')}</th>
                            <th className="px-4 py-2">{t('th_status')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--velvet-border)]">
                          {plan.items.map((item, index) => (
                            <tr key={index} className="hover:bg-[var(--velvet-surface-2)]">
                              <td className="px-4 py-2 text-[var(--velvet-text)] font-bold">{item.toothNumber}</td>
                              <td className="px-4 py-2 font-sans text-[var(--velvet-text)]">{item.procedure}</td>
                              <td className="px-4 py-2">Dr. {item.assignedDoctor}</td>
                              <td className="px-4 py-2">${item.estimatedCost.toLocaleString()}</td>
                              <td className="px-4 py-2">
                                <Badge tone={itemStatusTone(item.status)} className="text-2xs uppercase font-bold px-1.5 py-0.5 rounded">
                                  {translateStatus(item.status)}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Plan Modal */}
      <Modal
        open={showPlanModal}
        onOpenChange={setShowPlanModal}
        title={editingPlan ? t('btn_edit_plan') : t('btn_add_plan')}
        size="lg"
      >
        <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Input
                label={t('label_plan_title')}
                type="text"
                value={planForm.title}
                onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                placeholder="e.g. Posterior Lower Arch Dental Implants"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Textarea
                label={t('label_plan_desc')}
                value={planForm.description}
                onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <Input
                label={t('label_est_cost')}
                type="number"
                value={planForm.estimatedCost}
                onChange={(e) => setPlanForm({ ...planForm, estimatedCost: Number(e.target.value) })}
                className="font-mono"
              />
            </div>
            <div>
              <Select
                label={t('label_plan_priority')}
                options={PRIORITY_OPTIONS}
                value={planForm.priority}
                onChange={(e) => setPlanForm({ ...planForm, priority: e.target.value as any })}
              />
            </div>
            <div className="sm:col-span-2">
              <Textarea
                label={t('label_procedures_format')}
                value={planForm.itemsText}
                onChange={(e) => setPlanForm({ ...planForm, itemsText: e.target.value })}
                rows={4}
                className="font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t pt-3" style={{ borderColor: 'var(--velvet-border)' }}>
            <Button variant="secondary" type="button" onClick={() => setShowPlanModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={savePlansMutation.isPending}>
              {t('btn_save_plan')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
