'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { createClient } from '@/utils/supabase/client';
import { clinicalService, Appointment, PatientCase } from '@/utils/services/clinicalService';
import { getActiveRole, UserRole, getAuditLogs, AuditRecord } from '@/utils/enterpriseState';
import {
  Users, Activity, Calendar, FlaskConical, Layers, Play, CheckCircle2,
  Clock, AlertCircle, FileText, Plus, Upload, User, Sparkles, Send,
  TrendingUp, ArrowRight, ShieldAlert, CheckSquare, Search, Lock, ChevronRight, X, Eye, Building2, CreditCard, ShieldCheck, Zap
} from 'lucide-react';

interface OperationalDashboardProps {
  demoMode: boolean;
}

const _queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 1000 * 60 * 5 } }
});

export default function OperationalDashboard({ demoMode }: OperationalDashboardProps) {
  return (
    <QueryClientProvider client={_queryClient}>
      <OperationalDashboardInner demoMode={demoMode} />
    </QueryClientProvider>
  );
}

function OperationalDashboardInner({ demoMode }: OperationalDashboardProps) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const t = useTranslations('DashboardV3');

  // Active Role state synchronized with header switcher
  const [activeRole, setActiveRoleState] = useState<UserRole>('Super Admin');
  const [activePatientId, setActivePatientId] = useState<string | null>("PTS-9412");
  
  // Custom states for interactive widgets
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientId, setNewPatientId] = useState('');
  const [soapSubjective, setSoapSubjective] = useState('');
  const [soapObjective, setSoapObjective] = useState('');

  useEffect(() => {
    setActiveRoleState(getActiveRole());
    const handleStateChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.type === 'role') {
        setActiveRoleState(customEvent.detail.value);
      }
    };
    window.addEventListener('healthos_state_change', handleStateChange);
    return () => window.removeEventListener('healthos_state_change', handleStateChange);
  }, []);

  // 1. Fetch Patients
  const { data: patients = [] } = useQuery({
    queryKey: ['dashboard-patients-v3'],
    queryFn: () => clinicalService.getPatients(supabase, demoMode)
  });

  // 2. Fetch Global Appointments
  const { data: appointments = [] } = useQuery({
    queryKey: ['dashboard-appointments-v3'],
    queryFn: () => clinicalService.getAllAppointments(supabase, demoMode)
  });

  const activePatient = useMemo(() => {
    if (!activePatientId) return null;
    return patients.find(p => p.id === activePatientId) || null;
  }, [patients, activePatientId]);

  const updateApptMutation = useMutation({
    mutationFn: async ({ apptId, status }: { apptId: string, status: Appointment['status'] }) => {
      const targetAppt = appointments.find(a => a.id === apptId);
      if (!targetAppt) return;
      await clinicalService.updateAppointmentStatus(supabase, targetAppt.patientId, apptId, status, demoMode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-appointments-v3'] });
    }
  });

  // Role based configs
  const renderStats = () => {
    switch (activeRole) {
      case 'Super Admin':
        return (
          <>
            <div className="bg-gold-gradient p-5 rounded-3xl flex flex-col justify-between min-h-[110px] card-hover card-luxury">
              <span className="text-2xs font-bold uppercase tracking-wider text-amber-950">{t('sa_stat1_label')}</span>
              <span className="text-2xl font-black text-zinc-950">18</span>
              <span className="text-2xs font-semibold text-amber-950">{t('sa_stat1_sub')}</span>
            </div>
            <div className="card-elevated p-5 flex flex-col justify-between min-h-[110px] card-hover">
              <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400">{t('sa_stat2_label')}</span>
              <span className="text-2xl font-bold text-white">450</span>
              <span className="text-2xs text-zinc-500 font-medium">{t('sa_stat2_sub')}</span>
            </div>
            <div className="card-elevated p-5 flex flex-col justify-between min-h-[110px] card-hover">
              <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400">{t('sa_stat3_label')}</span>
              <span className="text-2xl font-bold text-white">99.98%</span>
              <span className="text-2xs text-emerald-400 font-semibold">{t('sa_stat3_sub')}</span>
            </div>
            <div className="card-elevated p-5 flex flex-col justify-between min-h-[110px] card-hover">
              <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400">{t('sa_stat4_label')}</span>
              <span className="text-2xl font-bold text-amber-400">3</span>
              <span className="text-2xs text-zinc-500 font-medium">{t('sa_stat4_sub')}</span>
            </div>
          </>
        );
      case 'Clinic Owner':
        return (
          <>
            <div className="bg-gold-gradient p-5 rounded-3xl flex flex-col justify-between min-h-[110px] card-hover card-luxury">
              <span className="text-2xs font-bold uppercase tracking-wider text-amber-950">{t('m_stat1_label')}</span>
              <span className="text-2xl font-black text-zinc-950">48</span>
              <span className="text-2xs font-semibold text-amber-950">{t('m_stat1_sub')}</span>
            </div>
            <div className="card-elevated p-5 flex flex-col justify-between min-h-[110px] card-hover">
              <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400">{t('m_stat2_label')}</span>
              <span className="text-2xl font-bold text-white">2</span>
              <span className="text-2xs text-zinc-500 font-medium">{t('m_stat2_sub')}</span>
            </div>
            <div className="card-elevated p-5 flex flex-col justify-between min-h-[110px] card-hover">
              <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400">{t('m_stat3_label')}</span>
              <span className="text-2xl font-bold text-white">$12,850</span>
              <span className="text-2xs text-emerald-400 font-semibold">{t('m_stat3_sub')}</span>
            </div>
            <div className="card-elevated p-5 flex flex-col justify-between min-h-[110px] card-hover">
              <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400">{t('m_stat4_label')}</span>
              <span className="text-2xl font-bold text-amber-400">8</span>
              <span className="text-2xs text-zinc-500 font-medium">{t('m_stat4_sub')}</span>
            </div>
          </>
        );
      case 'Laboratory Technician':
        return (
          <>
            <div className="bg-gold-gradient p-5 rounded-3xl flex flex-col justify-between min-h-[110px] card-hover card-luxury">
              <span className="text-2xs font-bold uppercase tracking-wider text-amber-950">{t('l_stat1_label')}</span>
              <span className="text-2xl font-black text-zinc-950">9</span>
              <span className="text-2xs font-semibold text-amber-950">{t('l_stat1_sub')}</span>
            </div>
            <div className="card-elevated p-5 flex flex-col justify-between min-h-[110px] card-hover">
              <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400">{t('l_stat2_label')}</span>
              <span className="text-2xl font-bold text-white">0</span>
              <span className="text-2xs text-emerald-400 font-semibold">{t('l_stat2_sub')}</span>
            </div>
            <div className="card-elevated p-5 flex flex-col justify-between min-h-[110px] card-hover">
              <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400">{t('l_stat3_label')}</span>
              <span className="text-2xl font-bold text-white">14</span>
              <span className="text-2xs text-zinc-500 font-medium">{t('l_stat3_sub')}</span>
            </div>
            <div className="card-elevated p-5 flex flex-col justify-between min-h-[110px] card-hover">
              <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400">{t('l_stat4_label')}</span>
              <span className="text-2xl font-bold text-white">{t('l_stat4_sub')}</span>
              <span className="text-2xs text-zinc-500 font-medium">SprintRay / Roland</span>
            </div>
          </>
        );
      case 'Receptionist':
        return (
          <>
            <div className="bg-gold-gradient p-5 rounded-3xl flex flex-col justify-between min-h-[110px] card-hover card-luxury">
              <span className="text-2xs font-bold uppercase tracking-wider text-amber-950">{t('r_stat1_label')}</span>
              <span className="text-2xl font-black text-zinc-950">15</span>
              <span className="text-2xs font-semibold text-amber-950">{t('r_stat1_sub')}</span>
            </div>
            <div className="card-elevated p-5 flex flex-col justify-between min-h-[110px] card-hover">
              <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400">{t('r_stat2_label')}</span>
              <span className="text-2xl font-bold text-white">3</span>
              <span className="text-2xs text-zinc-500 font-medium">{t('r_stat2_sub')}</span>
            </div>
            <div className="card-elevated p-5 flex flex-col justify-between min-h-[110px] card-hover">
              <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400">{t('r_stat3_label')}</span>
              <span className="text-2xl font-bold text-white">2</span>
              <span className="text-2xs text-zinc-500 font-medium">{t('r_stat3_sub')}</span>
            </div>
            <div className="card-elevated p-5 flex flex-col justify-between min-h-[110px] card-hover">
              <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400">{t('r_stat4_label')}</span>
              <span className="text-2xl font-bold text-red-400">3</span>
              <span className="text-2xs text-zinc-500 font-medium">{t('r_stat4_sub')}</span>
            </div>
          </>
        );
      case 'Read-only Auditor':
        return (
          <>
            <div className="bg-gold-gradient p-5 rounded-3xl flex flex-col justify-between min-h-[110px] card-hover card-luxury">
              <span className="text-2xs font-bold uppercase tracking-wider text-amber-950">{t('a_stat1_label')}</span>
              <span className="text-2xl font-black text-zinc-950">4</span>
              <span className="text-2xs font-semibold text-amber-950">{t('a_stat1_sub')}</span>
            </div>
            <div className="card-elevated p-5 flex flex-col justify-between min-h-[110px] card-hover">
              <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400">{t('a_stat2_label')}</span>
              <span className="text-2xl font-bold text-white">0</span>
              <span className="text-2xs text-emerald-400 font-semibold">{t('a_stat2_sub')}</span>
            </div>
            <div className="card-elevated p-5 flex flex-col justify-between min-h-[110px] card-hover">
              <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400">{t('a_stat3_label')}</span>
              <span className="text-2xl font-bold text-white">1</span>
              <span className="text-2xs text-zinc-500 font-medium">{t('a_stat3_sub')}</span>
            </div>
            <div className="card-elevated p-5 flex flex-col justify-between min-h-[110px] card-hover">
              <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400">{t('a_stat4_label')}</span>
              <span className="text-2xl font-bold text-red-400">0</span>
              <span className="text-2xs text-zinc-500 font-medium">{t('a_stat4_sub')}</span>
            </div>
          </>
        );
      default: // Clinicians (Prosthodontist / General Dentist)
        return (
          <>
            <div className="bg-gold-gradient p-5 rounded-3xl flex flex-col justify-between min-h-[110px] card-hover card-luxury">
              <span className="text-2xs font-bold uppercase tracking-wider text-amber-950">{t('c_stat1_label')}</span>
              <span className="text-2xl font-black text-zinc-950">8</span>
              <span className="text-2xs font-semibold text-amber-950">{t('c_stat1_sub')}</span>
            </div>
            <div className="card-elevated p-5 flex flex-col justify-between min-h-[110px] card-hover">
              <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400">{t('c_stat2_label')}</span>
              <span className="text-2xl font-bold text-white">2</span>
              <span className="text-2xs text-red-400 font-semibold">{t('c_stat2_sub')}</span>
            </div>
            <div className="card-elevated p-5 flex flex-col justify-between min-h-[110px] card-hover">
              <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400">{t('c_stat3_label')}</span>
              <span className="text-2xl font-bold text-white">4</span>
              <span className="text-2xs text-zinc-500 font-medium">{t('c_stat3_sub')}</span>
            </div>
            <div className="card-elevated p-5 flex flex-col justify-between min-h-[110px] card-hover">
              <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400">{t('c_stat4_label')}</span>
              <span className="text-2xl font-bold text-amber-400">1</span>
              <span className="text-2xs text-zinc-500 font-medium">{t('c_stat4_sub')}</span>
            </div>
          </>
        );
    }
  };

  const renderPanels = () => {
    switch (activeRole) {
      case 'Super Admin':
        return (
          <>
            {/* Left Panel: Clinics and Orgs list */}
            <div className="lg:col-span-8 card-elevated p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gold-400" /> {t('sa_title1')}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-end border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 text-2xs text-zinc-500">
                      <th className="pb-3 text-end">{t('sa_th1')}</th>
                      <th className="pb-3 text-end">{t('sa_th2')}</th>
                      <th className="pb-3 text-end">{t('sa_th3')}</th>
                      <th className="pb-3 text-end">{t('sa_th4')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-zinc-900/40">
                      <td className="py-3 font-semibold text-white">{t('sa_clinic1')}</td>
                      <td className="py-3 text-zinc-300">14</td>
                      <td className="py-3 text-zinc-400 font-mono">Enterprise (12-08-2026)</td>
                      <td className="py-3"><span className="text-2xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">{t('sa_status_active')}</span></td>
                    </tr>
                    <tr className="border-b border-zinc-900/40">
                      <td className="py-3 font-semibold text-white">{t('sa_clinic2')}</td>
                      <td className="py-3 text-zinc-300">28</td>
                      <td className="py-3 text-zinc-400 font-mono">Standard (25-08-2026)</td>
                      <td className="py-3"><span className="text-2xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">{t('sa_status_active')}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Panel: Feature Flags */}
            <div className="lg:col-span-4 card-elevated p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-gold-400" /> {t('sa_title2')}
                </h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-white">{t('sa_flag1_title')}</h4>
                    <p className="text-2xs text-zinc-500 mt-0.5">{t('sa_flag1_sub')}</p>
                  </div>
                  <span className="text-2xs px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">{t('sa_flag1_status')}</span>
                </div>
                <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-white">{t('sa_flag2_title')}</h4>
                    <p className="text-2xs text-zinc-500 mt-0.5">{t('sa_flag2_sub')}</p>
                  </div>
                  <span className="text-2xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">{t('sa_flag2_status')}</span>
                </div>
              </div>
            </div>
          </>
        );
      case 'Clinic Owner':
        return (
          <>
            {/* Left Panel: Doctors shift list */}
            <div className="lg:col-span-8 card-elevated p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gold-400" /> {t('m_title1')}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-end border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 text-2xs text-zinc-500">
                      <th className="pb-3 text-end">{t('m_th1')}</th>
                      <th className="pb-3 text-end">{t('m_th2')}</th>
                      <th className="pb-3 text-end">{t('m_th3')}</th>
                      <th className="pb-3 text-end">{t('m_th4')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-zinc-900/40">
                      <td className="py-3 font-semibold text-white">{t('doc1_title')}</td>
                      <td className="py-3 text-zinc-300">كرسي A</td>
                      <td className="py-3 text-zinc-400 font-mono">09:00 - 17:00</td>
                      <td className="py-3"><span className="text-2xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">{t('m_status_active')}</span></td>
                    </tr>
                    <tr className="border-b border-zinc-900/40">
                      <td className="py-3 font-semibold text-white">{t('doc2_title')}</td>
                      <td className="py-3 text-zinc-300">كرسي B</td>
                      <td className="py-3 text-zinc-400 font-mono">10:00 - 18:00</td>
                      <td className="py-3"><span className="text-2xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">{t('m_status_active')}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Panel: Pending Approvals */}
            <div className="lg:col-span-4 card-elevated p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gold-400" /> {t('m_title2')}
                </h3>
              </div>
              <div className="space-y-3">
                <div className="p-3.5 bg-zinc-950/40 border border-zinc-900 rounded-xl">
                  <h4 className="text-xs font-bold text-white leading-normal">{t('m_req1')}</h4>
                  <p className="text-2xs text-zinc-500 font-mono mt-1">{t('m_req1_sub')}</p>
                </div>
                <div className="p-3.5 bg-zinc-950/40 border border-zinc-900 rounded-xl">
                  <h4 className="text-xs font-bold text-white leading-normal">{t('m_req2')}</h4>
                  <p className="text-2xs text-zinc-500 font-mono mt-1">{t('m_req2_sub')}</p>
                </div>
              </div>
            </div>
          </>
        );
      case 'Laboratory Technician':
        return (
          <>
            {/* Left Panel: Lab Kanban Board */}
            <div className="lg:col-span-8 card-elevated p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-gold-400" /> {t('l_title1')}
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-950/40 border border-zinc-900/60 rounded-xl p-3 flex flex-col gap-2.5">
                  <span className="text-2xs font-bold text-zinc-500 border-b border-zinc-900 pb-1">{t('l_milling')}</span>
                  <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 cursor-pointer">
                    <span className="text-xs font-bold text-white block">جسر زيركونيا #36</span>
                    <span className="text-2xs text-zinc-500 block mt-1">آرثر بندراغون</span>
                  </div>
                </div>
                <div className="bg-zinc-950/40 border border-zinc-900/60 rounded-xl p-3 flex flex-col gap-2.5">
                  <span className="text-2xs font-bold text-zinc-500 border-b border-zinc-900 pb-1">{t('l_sintering')}</span>
                  <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 cursor-pointer">
                    <span className="text-xs font-bold text-white block">تاج مفرد Zirconia</span>
                    <span className="text-2xs text-zinc-500 block mt-1">كلارا أوزوالد</span>
                  </div>
                </div>
                <div className="bg-zinc-950/40 border border-zinc-900/60 rounded-xl p-3 flex flex-col gap-2.5">
                  <span className="text-2xs font-bold text-zinc-500 border-b border-zinc-900 pb-1">{t('l_qc')}</span>
                  <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 cursor-pointer">
                    <span className="text-xs font-bold text-white block">دليل زراعة ثلاثي الأبعاد</span>
                    <span className="text-2xs text-zinc-500 block mt-1">بروس وين</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Machine Status */}
            <div className="lg:col-span-4 card-elevated p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gold-400" /> {t('l_title2')}
                </h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-white">Roland DGX-52D</h4>
                    <p className="text-2xs text-emerald-400 font-semibold mt-0.5">Active (75%)</p>
                  </div>
                  <span className="text-2xs font-mono text-zinc-500">ETA: 12m</span>
                </div>
                <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-white">SprintRay Pro 95</h4>
                    <p className="text-2xs text-zinc-500 mt-0.5">Ready</p>
                  </div>
                  <span className="text-2xs font-mono text-zinc-500">Idle</span>
                </div>
              </div>
            </div>
          </>
        );
      case 'Receptionist':
        return (
          <>
            {/* Left Panel: Today's check-ins */}
            <div className="lg:col-span-8 card-elevated p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gold-400" /> {t('r_title1')}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-end border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 text-2xs text-zinc-500">
                      <th className="pb-3 text-end">المريض</th>
                      <th className="pb-3 text-end">الطبيب</th>
                      <th className="pb-3 text-end">الوقت</th>
                      <th className="pb-3 text-end">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-zinc-900/40">
                      <td className="py-3 font-semibold text-white">آرثر بندراغون</td>
                      <td className="py-3 text-zinc-300">د. أحمد</td>
                      <td className="py-3 text-zinc-400 font-mono">09:00 ص</td>
                      <td className="py-3"><span className="text-2xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">حضر بالعيادة</span></td>
                    </tr>
                    <tr className="border-b border-zinc-900/40">
                      <td className="py-3 font-semibold text-white">كلارا أوزوالد</td>
                      <td className="py-3 text-zinc-300">د. أحمد</td>
                      <td className="py-3 text-zinc-400 font-mono">10:15 ص</td>
                      <td className="py-3"><span className="text-2xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">قيد الانتظار</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Panel: Patient Intake form */}
            <div className="lg:col-span-4 card-elevated p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <User className="w-4 h-4 text-gold-400" /> {t('r_title2')}
                </h3>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder={t('r_name')}
                  value={newPatientName}
                  onChange={e => setNewPatientName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  placeholder={t('r_phone')}
                  value={newPatientPhone}
                  onChange={e => setNewPatientPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  placeholder={t('r_national_id')}
                  value={newPatientId}
                  onChange={e => setNewPatientId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => {
                    alert(`Intake registered: ${newPatientName}`);
                    setNewPatientName('');
                    setNewPatientPhone('');
                    setNewPatientId('');
                  }}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold transition-all shadow-soft shadow-amber-500/10 flex items-center justify-center gap-1.5"
                >
                  {t('r_submit')}
                </button>
              </div>
            </div>
          </>
        );
      case 'Read-only Auditor':
        return (
          <>
            {/* Left Panel: Audit Logs */}
            <div className="lg:col-span-8 card-elevated p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gold-400" /> {t('a_title1')}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-end border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 text-2xs text-zinc-500">
                      <th className="pb-3 text-end">الإجراء والعملية الأمنية</th>
                      <th className="pb-3 text-end">المستهدف / البيانات</th>
                      <th className="pb-3 text-end">المستخدم المسؤول</th>
                      <th className="pb-3 text-end">الوقت والتدقيق</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-zinc-900/40">
                      <td className="py-3 font-semibold text-white">تصدير سجل المريض المالي</td>
                      <td className="py-3 text-zinc-300">ملف آرثر بندراغون</td>
                      <td className="py-3 text-zinc-400 font-mono">خالد الدوسري (المحاسب)</td>
                      <td className="py-3 text-zinc-500">10:14 ص</td>
                    </tr>
                    <tr className="border-b border-zinc-900/40">
                      <td className="py-3 font-semibold text-white">توقيع ملف SOAP الطبي وإغلاقه</td>
                      <td className="py-3 text-zinc-300">السن رقم #36</td>
                      <td className="py-3 text-zinc-400 font-mono">د. أحمد القحطاني</td>
                      <td className="py-3 text-zinc-500">09:48 ص</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Panel: Access Requests */}
            <div className="lg:col-span-4 card-elevated p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gold-400" /> {t('a_title2')}
                </h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-white">طلب فك تشفير السجل الطبي</h4>
                    <p className="text-2xs text-zinc-500 mt-0.5">المريض: آرثر بندراغون</p>
                  </div>
                  <button
                    onClick={() => alert('تم رفض طلب الوصول للسرية الطبية')}
                    className="text-2xs px-2.5 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-bold"
                  >
                    رفض
                  </button>
                </div>
              </div>
            </div>
          </>
        );
      default: // Clinician Dashboard (Default Doctor view)
        return (
          <>
            {/* Left Panel: Today's Clinical Queue */}
            <div className="lg:col-span-8 card-elevated p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gold-400" /> {t('c_title1')}
                </h3>
                <span className="text-2xs font-mono bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded text-zinc-500">
                  {appointments.length} active
                </span>
              </div>

              <div className="space-y-3">
                {appointments.length === 0 ? (
                  <div className="text-center py-8 text-xs text-zinc-600">No scheduled operations for today.</div>
                ) : (
                  appointments.map(appt => {
                    const isActive = appt.patientId === activePatientId;
                    return (
                      <div
                        key={appt.id}
                        onClick={() => setActivePatientId(appt.patientId)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-zinc-900/60 border-amber-500/30 shadow-soft shadow-amber-500/5'
                            : 'bg-zinc-950/20 border-zinc-900 hover:border-zinc-850'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-white">{appt.patientName}</h4>
                            <p className="text-2xs text-zinc-500 font-medium mt-0.5">{appt.procedure} • {appt.chair}</p>
                          </div>
                          <span className="text-2xs font-mono text-zinc-400 font-semibold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-850">
                            {appt.startTime}
                          </span>
                        </div>

                        <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-zinc-900/50">
                          <span className={`text-2xs px-2 py-0.5 rounded-full font-mono uppercase font-bold border ${
                            appt.status === 'In-Progress' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            appt.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            'bg-zinc-900 text-zinc-400 border-zinc-850'
                          }`}>
                            {appt.status}
                          </span>

                          <div className="flex gap-1.5">
                            {appt.status !== 'Completed' && appt.status !== 'In-Progress' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); updateApptMutation.mutate({ apptId: appt.id, status: 'In-Progress' }); }}
                                className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded text-2xs font-bold transition-all"
                              >
                                Start
                              </button>
                            )}
                            {appt.status === 'In-Progress' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); updateApptMutation.mutate({ apptId: appt.id, status: 'Completed' }); }}
                                className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded text-2xs font-bold transition-all"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Panel: Active Patient snapshot + SOAP note fields */}
            <div className="lg:col-span-4 card-elevated p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <User className="w-4 h-4 text-gold-400" /> {t('c_title2')}
                </h3>
              </div>

              {!activePatient ? (
                <div className="p-12 text-center text-zinc-500 text-xs font-medium space-y-2">
                  <User className="w-8 h-8 text-zinc-700 mx-auto" />
                  <p>No patient chart active.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={activePatient.photoUrl}
                      alt={activePatient.name}
                      className="w-11 h-11 rounded-lg object-cover border border-zinc-900 shrink-0"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{activePatient.name}</h4>
                      <span className="text-2xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                        {activePatient.id} • Age: {activePatient.age}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl border border-zinc-900/60 bg-zinc-950/20">
                      <span className="text-2xs uppercase tracking-wider font-mono text-zinc-500 font-bold block mb-1">{t('c_medical_alerts')}</span>
                      <span className="text-red-400 font-mono text-2xs font-bold block truncate" title={activePatient.medicalAlerts?.join(', ')}>
                        {activePatient.medicalAlerts?.filter((a: any) => a !== 'None').join(', ') || 'None'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl border border-zinc-900/60 bg-zinc-950/20">
                      <span className="text-2xs uppercase tracking-wider font-mono text-zinc-500 font-bold block mb-1">{t('c_allergies')}</span>
                      <span className="text-amber-400 font-mono text-2xs font-bold block truncate">
                        {activePatient.allergyStatus || 'None'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 space-y-1">
                    <span className="text-2xs uppercase tracking-wider font-mono text-zinc-500 font-bold block">{t('c_current_goal')}</span>
                    <p className="text-xs text-zinc-300 font-medium">{activePatient.currentTreatment || 'No active protocol'}</p>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      placeholder={t('soap_sub_placeholder')}
                      value={soapSubjective}
                      onChange={e => setSoapSubjective(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 h-16 resize-none"
                    />
                    <textarea
                      placeholder={t('soap_obj_placeholder')}
                      value={soapObjective}
                      onChange={e => setSoapObjective(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 h-16 resize-none"
                    />
                  </div>

                  <button
                    onClick={() => window.location.href = `/patients/${activePatient.id}`}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold transition-all shadow-soft shadow-amber-500/10 flex items-center justify-center gap-1.5"
                  >
                    {t('c_full_workspace')} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </>
        );
    }
  };

  const getHeaderInfo = () => {
    switch (activeRole) {
      case 'Super Admin':
        return {
          title: t('title_super_admin'),
          sub: t('sub_super_admin')
        };
      case 'Clinic Owner':
        return {
          title: t('title_manager'),
          sub: t('sub_manager')
        };
      case 'Laboratory Technician':
        return {
          title: t('title_technician'),
          sub: t('sub_technician')
        };
      case 'Receptionist':
        return {
          title: t('title_receptionist'),
          sub: t('sub_receptionist')
        };
      case 'Read-only Auditor':
        return {
          title: t('title_auditor'),
          sub: t('sub_auditor')
        };
      default:
        return {
          title: t('title_clinician'),
          sub: t('sub_clinician')
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-fade-in pb-12 text-zinc-100 flex relative">
      {/* Main Workspace Frame */}
      <div className="flex-1 space-y-6">
        
        {/* TOP OPERATIONS COMMAND BAR */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 card-gradient p-4 relative overflow-hidden">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 font-display text-gold-gradient">
              {headerInfo.title}
              <span className="text-2xs font-mono font-medium px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20 uppercase tracking-widest animate-pulse font-sans">
                {activeRole} {t('active')}
              </span>
            </h2>
            <p className="text-xs text-zinc-400 font-sans">
              {headerInfo.sub}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button className="px-3.5 py-1.5 rounded-xl bg-[#0d0d16] hover:bg-[#131320] border border-white/5 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-gold-glow">
              <Plus className="w-3.5 h-3.5 text-gold-400" /> {t('newConsultation')}
            </button>
            <button className="px-3.5 py-1.5 rounded-xl bg-[#0d0d16] hover:bg-[#131320] border border-white/5 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-gold-glow">
              <Upload className="w-3.5 h-3.5 text-gold-400" /> {t('importStl')}
            </button>
          </div>
        </div>

        {/* Dynamic Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {renderStats()}
        </div>

        {/* 2-COLUMN DESKTOP WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {renderPanels()}
        </div>

      </div>
    </div>
  );
}
