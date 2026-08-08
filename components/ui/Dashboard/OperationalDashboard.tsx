'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { createClient } from '@/utils/supabase/client';
import { clinicalService, Appointment, PatientCase } from '@/utils/services/clinicalService';
import { getActiveRole, UserRole, getAuditLogs, AuditRecord } from '@/utils/enterpriseState';
import {
  Users, Activity, Calendar, FlaskConical, Clock, Plus, Upload, User,
  ArrowRight, Lock, Building2, ShieldCheck, Zap
} from 'lucide-react';
import { Button, Card, Input, Textarea, Badge, Avatar, Table, EmptyState } from '@/components/ui/design-system';
import type { Column } from '@/components/ui/design-system/primitives';

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
    const heroStat = (label: string, value: string | number, sub: string) => (
      <Card
        className="p-5 rounded-3xl flex flex-col justify-between min-h-[110px]"
        style={{ background: 'var(--velvet-gradient-primary)', color: 'var(--velvet-text-inverse)', borderColor: 'transparent' }}
      >
        <span className="text-2xs font-bold uppercase tracking-wider text-[var(--velvet-text-inverse)] opacity-80">{label}</span>
        <span className="text-2xl font-black text-[var(--velvet-text-inverse)]">{value}</span>
        <span className="text-2xs font-semibold text-[var(--velvet-text-inverse)] opacity-80">{sub}</span>
      </Card>
    );
    const stat = (label: string, value: string | number, sub: string, subTone: 'default' | 'success' | 'warning' | 'error' = 'default') => {
      const subColor = subTone === 'success' ? 'text-[var(--velvet-success)]' : subTone === 'warning' ? 'text-[var(--velvet-warning)]' : subTone === 'error' ? 'text-[var(--velvet-error)]' : 'text-[var(--velvet-text-muted)]';
      return (
        <Card className="p-5 flex flex-col justify-between min-h-[110px]">
          <span className="text-2xs font-bold uppercase tracking-wider text-[var(--velvet-text-muted)]">{label}</span>
          <span className="text-2xl font-bold text-[var(--velvet-text)]">{value}</span>
          <span className={`text-2xs ${subTone === 'default' ? 'font-medium' : 'font-semibold'} ${subColor}`}>{sub}</span>
        </Card>
      );
    };

    switch (activeRole) {
      case 'Super Admin':
        return (
          <>
            {heroStat(t('sa_stat1_label'), 18, t('sa_stat1_sub'))}
            {stat(t('sa_stat2_label'), 450, t('sa_stat2_sub'))}
            {stat(t('sa_stat3_label'), '99.98%', t('sa_stat3_sub'), 'success')}
            {stat(t('sa_stat4_label'), 3, t('sa_stat4_sub'), 'warning')}
          </>
        );
      case 'Clinic Owner':
        return (
          <>
            {heroStat(t('m_stat1_label'), 48, t('m_stat1_sub'))}
            {stat(t('m_stat2_label'), 2, t('m_stat2_sub'))}
            {stat(t('m_stat3_label'), '$12,850', t('m_stat3_sub'), 'success')}
            {stat(t('m_stat4_label'), 8, t('m_stat4_sub'), 'warning')}
          </>
        );
      case 'Laboratory Technician':
        return (
          <>
            {heroStat(t('l_stat1_label'), 9, t('l_stat1_sub'))}
            {stat(t('l_stat2_label'), 0, t('l_stat2_sub'), 'success')}
            {stat(t('l_stat3_label'), 14, t('l_stat3_sub'))}
            {stat(t('l_stat4_label'), t('l_stat4_sub'), 'SprintRay / Roland')}
          </>
        );
      case 'Receptionist':
        return (
          <>
            {heroStat(t('r_stat1_label'), 15, t('r_stat1_sub'))}
            {stat(t('r_stat2_label'), 3, t('r_stat2_sub'))}
            {stat(t('r_stat3_label'), 2, t('r_stat3_sub'))}
            {stat(t('r_stat4_label'), 3, t('r_stat4_sub'), 'error')}
          </>
        );
      case 'Read-only Auditor':
        return (
          <>
            {heroStat(t('a_stat1_label'), 4, t('a_stat1_sub'))}
            {stat(t('a_stat2_label'), 0, t('a_stat2_sub'), 'success')}
            {stat(t('a_stat3_label'), 1, t('a_stat3_sub'))}
            {stat(t('a_stat4_label'), 0, t('a_stat4_sub'), 'error')}
          </>
        );
      default: // Clinicians (Prosthodontist / General Dentist)
        return (
          <>
            {heroStat(t('c_stat1_label'), 8, t('c_stat1_sub'))}
            {stat(t('c_stat2_label'), 2, t('c_stat2_sub'), 'error')}
            {stat(t('c_stat3_label'), 4, t('c_stat3_sub'))}
            {stat(t('c_stat4_label'), 1, t('c_stat4_sub'), 'warning')}
          </>
        );
    }
  };

  const renderPanels = () => {
    switch (activeRole) {
      case 'Super Admin': {
        const columns: Column<{ clinic: string; users: string; plan: string }>[] = [
          { key: 'clinic', header: t('sa_th1'), render: (r) => <span className="font-semibold text-[var(--velvet-text)]">{r.clinic}</span> },
          { key: 'users', header: t('sa_th2'), render: (r) => <span className="text-[var(--velvet-text-sub)]">{r.users}</span> },
          { key: 'plan', header: t('sa_th3'), render: (r) => <span className="text-[var(--velvet-text-muted)] font-mono">{r.plan}</span> },
          { key: 'status', header: t('sa_th4'), render: () => <Badge tone="success">{t('sa_status_active')}</Badge> },
        ];
        const rows = [
          { clinic: t('sa_clinic1'), users: '14', plan: 'Enterprise (12-08-2026)' },
          { clinic: t('sa_clinic2'), users: '28', plan: 'Standard (25-08-2026)' },
        ];
        return (
          <>
            {/* Left Panel: Clinics and Orgs list */}
            <Card hover={false} className="lg:col-span-8 p-5 space-y-4">
              <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--velvet-border)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--velvet-text-muted)] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[var(--velvet-accent)]" /> {t('sa_title1')}
                </h3>
              </div>
              <Table columns={columns} data={rows} keyExtractor={(r) => r.clinic} />
            </Card>

            {/* Right Panel: Feature Flags */}
            <Card hover={false} className="lg:col-span-4 p-5 space-y-4">
              <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--velvet-border)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--velvet-text-muted)] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[var(--velvet-accent)]" /> {t('sa_title2')}
                </h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-xl flex justify-between items-center" style={{ background: 'var(--velvet-glass-fill)', border: '1px solid var(--velvet-border)' }}>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--velvet-text)]">{t('sa_flag1_title')}</h4>
                    <p className="text-2xs text-[var(--velvet-text-muted)] mt-0.5">{t('sa_flag1_sub')}</p>
                  </div>
                  <Badge tone="success">{t('sa_flag1_status')}</Badge>
                </div>
                <div className="p-3 rounded-xl flex justify-between items-center" style={{ background: 'var(--velvet-glass-fill)', border: '1px solid var(--velvet-border)' }}>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--velvet-text)]">{t('sa_flag2_title')}</h4>
                    <p className="text-2xs text-[var(--velvet-text-muted)] mt-0.5">{t('sa_flag2_sub')}</p>
                  </div>
                  <Badge tone="warning">{t('sa_flag2_status')}</Badge>
                </div>
              </div>
            </Card>
          </>
        );
      }
      case 'Clinic Owner': {
        const columns: Column<{ doc: string; chair: string; shift: string }>[] = [
          { key: 'doc', header: t('m_th1'), render: (r) => <span className="font-semibold text-[var(--velvet-text)]">{r.doc}</span> },
          { key: 'chair', header: t('m_th2'), render: (r) => <span className="text-[var(--velvet-text-sub)]">{r.chair}</span> },
          { key: 'shift', header: t('m_th3'), render: (r) => <span className="text-[var(--velvet-text-muted)] font-mono">{r.shift}</span> },
          { key: 'status', header: t('m_th4'), render: () => <Badge tone="success">{t('m_status_active')}</Badge> },
        ];
        const rows = [
          { doc: t('doc1_title'), chair: 'كرسي A', shift: '09:00 - 17:00' },
          { doc: t('doc2_title'), chair: 'كرسي B', shift: '10:00 - 18:00' },
        ];
        return (
          <>
            {/* Left Panel: Doctors shift list */}
            <Card hover={false} className="lg:col-span-8 p-5 space-y-4">
              <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--velvet-border)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--velvet-text-muted)] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[var(--velvet-accent)]" /> {t('m_title1')}
                </h3>
              </div>
              <Table columns={columns} data={rows} keyExtractor={(r) => r.doc} />
            </Card>

            {/* Right Panel: Pending Approvals */}
            <Card hover={false} className="lg:col-span-4 p-5 space-y-4">
              <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--velvet-border)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--velvet-text-muted)] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[var(--velvet-accent)]" /> {t('m_title2')}
                </h3>
              </div>
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border" style={{ background: 'var(--velvet-glass-fill)', borderColor: 'var(--velvet-border)' }}>
                  <h4 className="text-xs font-bold text-[var(--velvet-text)] leading-normal">{t('m_req1')}</h4>
                  <p className="text-2xs text-[var(--velvet-text-muted)] font-mono mt-1">{t('m_req1_sub')}</p>
                </div>
                <div className="p-3.5 rounded-xl border" style={{ background: 'var(--velvet-glass-fill)', borderColor: 'var(--velvet-border)' }}>
                  <h4 className="text-xs font-bold text-[var(--velvet-text)] leading-normal">{t('m_req2')}</h4>
                  <p className="text-2xs text-[var(--velvet-text-muted)] font-mono mt-1">{t('m_req2_sub')}</p>
                </div>
              </div>
            </Card>
          </>
        );
      }
      case 'Laboratory Technician':
        return (
          <>
            {/* Left Panel: Lab Kanban Board */}
            <Card hover={false} className="lg:col-span-8 p-5 space-y-4">
              <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--velvet-border)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--velvet-text-muted)] flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-[var(--velvet-accent)]" /> {t('l_title1')}
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl p-3 flex flex-col gap-2.5" style={{ background: 'var(--velvet-glass-fill)', border: '1px solid var(--velvet-border)' }}>
                  <span className="text-2xs font-bold text-[var(--velvet-text-muted)] border-b border-[var(--velvet-border)] pb-1">{t('l_milling')}</span>
                  <div className="p-2.5 rounded-lg border cursor-pointer" style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)' }}>
                    <span className="text-xs font-bold text-[var(--velvet-text)] block">جسر زيركونيا #36</span>
                    <span className="text-2xs text-[var(--velvet-text-muted)] block mt-1">آرثر بندراغون</span>
                  </div>
                </div>
                <div className="rounded-xl p-3 flex flex-col gap-2.5" style={{ background: 'var(--velvet-glass-fill)', border: '1px solid var(--velvet-border)' }}>
                  <span className="text-2xs font-bold text-[var(--velvet-text-muted)] border-b border-[var(--velvet-border)] pb-1">{t('l_sintering')}</span>
                  <div className="p-2.5 rounded-lg border cursor-pointer" style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)' }}>
                    <span className="text-xs font-bold text-[var(--velvet-text)] block">تاج مفرد Zirconia</span>
                    <span className="text-2xs text-[var(--velvet-text-muted)] block mt-1">كلارا أوزوالد</span>
                  </div>
                </div>
                <div className="rounded-xl p-3 flex flex-col gap-2.5" style={{ background: 'var(--velvet-glass-fill)', border: '1px solid var(--velvet-border)' }}>
                  <span className="text-2xs font-bold text-[var(--velvet-text-muted)] border-b border-[var(--velvet-border)] pb-1">{t('l_qc')}</span>
                  <div className="p-2.5 rounded-lg border cursor-pointer" style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)' }}>
                    <span className="text-xs font-bold text-[var(--velvet-text)] block">دليل زراعة ثلاثي الأبعاد</span>
                    <span className="text-2xs text-[var(--velvet-text-muted)] block mt-1">بروس وين</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Right Panel: Machine Status */}
            <Card hover={false} className="lg:col-span-4 p-5 space-y-4">
              <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--velvet-border)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--velvet-text-muted)] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[var(--velvet-accent)]" /> {t('l_title2')}
                </h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-xl flex justify-between items-center" style={{ background: 'var(--velvet-glass-fill)', border: '1px solid var(--velvet-border)' }}>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--velvet-text)]">Roland DGX-52D</h4>
                    <p className="text-2xs text-[var(--velvet-success)] font-semibold mt-0.5">Active (75%)</p>
                  </div>
                  <span className="text-2xs font-mono text-[var(--velvet-text-muted)]">ETA: 12m</span>
                </div>
                <div className="p-3 rounded-xl flex justify-between items-center" style={{ background: 'var(--velvet-glass-fill)', border: '1px solid var(--velvet-border)' }}>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--velvet-text)]">SprintRay Pro 95</h4>
                    <p className="text-2xs text-[var(--velvet-text-muted)] mt-0.5">Ready</p>
                  </div>
                  <span className="text-2xs font-mono text-[var(--velvet-text-muted)]">Idle</span>
                </div>
              </div>
            </Card>
          </>
        );
      case 'Receptionist': {
        const columns: Column<{ patient: string; doctor: string; time: string; status: React.ReactNode }>[] = [
          { key: 'patient', header: 'المريض', render: (r) => <span className="font-semibold text-[var(--velvet-text)]">{r.patient}</span> },
          { key: 'doctor', header: 'الطبيب', render: (r) => <span className="text-[var(--velvet-text-sub)]">{r.doctor}</span> },
          { key: 'time', header: 'الوقت', render: (r) => <span className="text-[var(--velvet-text-muted)] font-mono">{r.time}</span> },
          { key: 'status', header: 'الحالة', render: (r) => r.status },
        ];
        const rows = [
          { patient: 'آرثر بندراغون', doctor: 'د. أحمد', time: '09:00 ص', status: <Badge tone="success">حضر بالعيادة</Badge> },
          { patient: 'كلارا أوزوالد', doctor: 'د. أحمد', time: '10:15 ص', status: <Badge tone="warning">قيد الانتظار</Badge> },
        ];
        return (
          <>
            {/* Left Panel: Today's check-ins */}
            <Card hover={false} className="lg:col-span-8 p-5 space-y-4">
              <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--velvet-border)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--velvet-text-muted)] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--velvet-accent)]" /> {t('r_title1')}
                </h3>
              </div>
              <Table columns={columns} data={rows} keyExtractor={(r) => r.patient} />
            </Card>

            {/* Right Panel: Patient Intake form */}
            <Card hover={false} className="lg:col-span-4 p-5 space-y-4">
              <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--velvet-border)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--velvet-text-muted)] flex items-center gap-2">
                  <User className="w-4 h-4 text-[var(--velvet-accent)]" /> {t('r_title2')}
                </h3>
              </div>
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder={t('r_name')}
                  value={newPatientName}
                  onChange={e => setNewPatientName(e.target.value)}
                  className="text-xs"
                />
                <Input
                  type="text"
                  placeholder={t('r_phone')}
                  value={newPatientPhone}
                  onChange={e => setNewPatientPhone(e.target.value)}
                  className="text-xs"
                />
                <Input
                  type="text"
                  placeholder={t('r_national_id')}
                  value={newPatientId}
                  onChange={e => setNewPatientId(e.target.value)}
                  className="text-xs"
                />
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    alert(`Intake registered: ${newPatientName}`);
                    setNewPatientName('');
                    setNewPatientPhone('');
                    setNewPatientId('');
                  }}
                  className="py-2.5"
                >
                  {t('r_submit')}
                </Button>
              </div>
            </Card>
          </>
        );
      }
      case 'Read-only Auditor': {
        const columns: Column<{ action: string; target: string; user: string; time: string }>[] = [
          { key: 'action', header: 'الإجراء والعملية الأمنية', render: (r) => <span className="font-semibold text-[var(--velvet-text)]">{r.action}</span> },
          { key: 'target', header: 'المستهدف / البيانات', render: (r) => <span className="text-[var(--velvet-text-sub)]">{r.target}</span> },
          { key: 'user', header: 'المستخدم المسؤول', render: (r) => <span className="text-[var(--velvet-text-muted)] font-mono">{r.user}</span> },
          { key: 'time', header: 'الوقت والتدقيق', render: (r) => <span className="text-[var(--velvet-text-muted)]">{r.time}</span> },
        ];
        const rows = [
          { action: 'تصدير سجل المريض المالي', target: 'ملف آرثر بندراغون', user: 'خالد الدوسري (المحاسب)', time: '10:14 ص' },
          { action: 'توقيع ملف SOAP الطبي وإغلاقه', target: 'السن رقم #36', user: 'د. أحمد القحطاني', time: '09:48 ص' },
        ];
        return (
          <>
            {/* Left Panel: Audit Logs */}
            <Card hover={false} className="lg:col-span-8 p-5 space-y-4">
              <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--velvet-border)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--velvet-text-muted)] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--velvet-accent)]" /> {t('a_title1')}
                </h3>
              </div>
              <Table columns={columns} data={rows} keyExtractor={(r) => r.action} />
            </Card>

            {/* Right Panel: Access Requests */}
            <Card hover={false} className="lg:col-span-4 p-5 space-y-4">
              <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--velvet-border)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--velvet-text-muted)] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[var(--velvet-accent)]" /> {t('a_title2')}
                </h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-xl flex justify-between items-center" style={{ background: 'var(--velvet-glass-fill)', border: '1px solid var(--velvet-border)' }}>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--velvet-text)]">طلب فك تشفير السجل الطبي</h4>
                    <p className="text-2xs text-[var(--velvet-text-muted)] mt-0.5">المريض: آرثر بندراغون</p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => alert('تم رفض طلب الوصول للسرية الطبية')}
                  >
                    رفض
                  </Button>
                </div>
              </div>
            </Card>
          </>
        );
      }
      default: // Clinician Dashboard (Default Doctor view)
        return (
          <>
            {/* Left Panel: Today's Clinical Queue */}
            <Card hover={false} className="lg:col-span-8 p-5 space-y-4">
              <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--velvet-border)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--velvet-text-muted)] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--velvet-accent)]" /> {t('c_title1')}
                </h3>
                <Badge tone="default" className="font-mono uppercase">
                  {appointments.length} active
                </Badge>
              </div>

              <div className="space-y-3">
                {appointments.length === 0 ? (
                  <EmptyState icon={<Clock className="w-6 h-6" />} title="No scheduled operations for today." />
                ) : (
                  appointments.map(appt => {
                    const isActive = appt.patientId === activePatientId;
                    return (
                      <div
                        key={appt.id}
                        onClick={() => setActivePatientId(appt.patientId)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isActive ? '' : 'hover:border-[var(--velvet-border-strong)]'
                        }`}
                        style={{
                          borderColor: isActive ? 'var(--velvet-warning-border)' : 'var(--velvet-border)',
                          background: isActive ? 'var(--velvet-surface-2)' : 'var(--velvet-glass-fill)',
                          boxShadow: isActive ? 'var(--velvet-shadow-card)' : undefined,
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-[var(--velvet-text)]">{appt.patientName}</h4>
                            <p className="text-2xs text-[var(--velvet-text-muted)] font-medium mt-0.5">{appt.procedure} • {appt.chair}</p>
                          </div>
                          <span className="text-2xs font-mono text-[var(--velvet-text-muted)] font-semibold bg-[var(--velvet-surface-2)] px-2 py-0.5 rounded border border-[var(--velvet-border)]">
                            {appt.startTime}
                          </span>
                        </div>

                        <div className="flex justify-between items-center mt-3 pt-2.5 border-t" style={{ borderColor: 'var(--velvet-border)' }}>
                          <Badge
                            tone={appt.status === 'In-Progress' ? 'warning' : appt.status === 'Completed' ? 'success' : 'default'}
                            className="font-mono uppercase"
                          >
                            {appt.status}
                          </Badge>

                          <div className="flex gap-1.5">
                            {appt.status !== 'Completed' && appt.status !== 'In-Progress' && (
                              <Button
                                variant="primary"
                                size="sm"
                                className="text-2xs px-2 py-1"
                                onClick={(e) => { e.stopPropagation(); updateApptMutation.mutate({ apptId: appt.id, status: 'In-Progress' }); }}
                              >
                                Start
                              </Button>
                            )}
                            {appt.status === 'In-Progress' && (
                              <Button
                                variant="secondary"
                                size="sm"
                                className="text-2xs px-2 py-1"
                                style={{ background: 'var(--velvet-success)', color: 'var(--velvet-text-inverse)', borderColor: 'var(--velvet-success-border)' }}
                                onClick={(e) => { e.stopPropagation(); updateApptMutation.mutate({ apptId: appt.id, status: 'Completed' }); }}
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>

            {/* Right Panel: Active Patient snapshot + SOAP note fields */}
            <Card hover={false} className="lg:col-span-4 p-5 space-y-4">
              <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--velvet-border)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--velvet-text-muted)] flex items-center gap-2">
                  <User className="w-4 h-4 text-[var(--velvet-accent)]" /> {t('c_title2')}
                </h3>
              </div>

              {!activePatient ? (
                <EmptyState icon={<User className="w-8 h-8" />} title="No patient chart active." />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={activePatient.name} src={activePatient.photoUrl} size="lg" className="!rounded-xl border border-[var(--velvet-border)]" />
                    <div>
                      <h4 className="text-xs font-bold text-[var(--velvet-text)]">{activePatient.name}</h4>
                      <span className="text-2xs font-mono text-[var(--velvet-text-muted)] bg-[var(--velvet-surface-2)] border border-[var(--velvet-border)] px-1.5 py-0.5 rounded">
                        {activePatient.id} • Age: {activePatient.age}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl border" style={{ borderColor: 'var(--velvet-border)', background: 'var(--velvet-glass-fill)' }}>
                      <span className="text-2xs uppercase tracking-wider font-mono text-[var(--velvet-text-muted)] font-bold block mb-1">{t('c_medical_alerts')}</span>
                      <span className="text-[var(--velvet-error)] font-mono text-2xs font-bold block truncate" title={activePatient.medicalAlerts?.join(', ')}>
                        {activePatient.medicalAlerts?.filter((a: any) => a !== 'None').join(', ') || 'None'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl border" style={{ borderColor: 'var(--velvet-border)', background: 'var(--velvet-glass-fill)' }}>
                      <span className="text-2xs uppercase tracking-wider font-mono text-[var(--velvet-text-muted)] font-bold block mb-1">{t('c_allergies')}</span>
                      <span className="text-[var(--velvet-warning)] font-mono text-2xs font-bold block truncate">
                        {activePatient.allergyStatus || 'None'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border space-y-1" style={{ background: 'var(--velvet-glass-fill)', borderColor: 'var(--velvet-border)' }}>
                    <span className="text-2xs uppercase tracking-wider font-mono text-[var(--velvet-text-muted)] font-bold block">{t('c_current_goal')}</span>
                    <p className="text-xs text-[var(--velvet-text-sub)] font-medium">{activePatient.currentTreatment || 'No active protocol'}</p>
                  </div>

                  <div className="space-y-2">
                    <Textarea
                      placeholder={t('soap_sub_placeholder')}
                      value={soapSubjective}
                      onChange={e => setSoapSubjective(e.target.value)}
                      className="h-16 !min-h-0 resize-none text-xs"
                    />
                    <Textarea
                      placeholder={t('soap_obj_placeholder')}
                      value={soapObjective}
                      onChange={e => setSoapObjective(e.target.value)}
                      className="h-16 !min-h-0 resize-none text-xs"
                    />
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => window.location.href = `/patients/${activePatient.id}`}
                    className="py-2.5"
                  >
                    {t('c_full_workspace')} <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </Card>
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
    <div className="space-y-6 max-w-[1600px] mx-auto animate-fade-in pb-12 text-[var(--velvet-text)] flex relative">
      {/* Main Workspace Frame */}
      <div className="flex-1 space-y-6">
        
        {/* TOP OPERATIONS COMMAND BAR */}
        <Card variant="gradient" hover={false} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 relative overflow-hidden">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 font-display text-gold-gradient">
              {headerInfo.title}
              <Badge tone="accent" className="uppercase tracking-widest animate-pulse font-mono">
                {activeRole} {t('active')}
              </Badge>
            </h2>
            <p className="text-xs text-[var(--velvet-text-muted)] font-sans">
              {headerInfo.sub}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="secondary" size="sm">
              <Plus className="w-3.5 h-3.5 text-[var(--velvet-accent)]" /> {t('newConsultation')}
            </Button>
            <Button variant="secondary" size="sm">
              <Upload className="w-3.5 h-3.5 text-[var(--velvet-accent)]" /> {t('importStl')}
            </Button>
          </div>
        </Card>

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
