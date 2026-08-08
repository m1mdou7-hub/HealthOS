import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Search, Activity, Calendar, FileText, Camera, Clipboard, FlaskConical, Heart, FileDown, Layers, DollarSign, CreditCard, Send, Sparkles } from 'lucide-react';
import { Appointment, BillingInvoice, BillingPayment, TreatmentPlan, PatientDocument } from '../../../utils/services/clinicalService';
import { Card, Badge, Button, Input, EmptyState } from '@/components/ui/design-system';

export interface PatientTimelineProps {
  activePatient: any;
  appointments: Appointment[];
  treatmentPlans: TreatmentPlan[];
  clinicalNotesList: any[];
  imagingGallery: any[];
  patientDocuments: PatientDocument[];
  invoices: BillingInvoice[];
  payments: BillingPayment[];
  onActionExecute?: (actionType: string, targetId: string) => void;
}

type IconTone = 'info' | 'warning' | 'success' | 'accent' | 'error' | 'neutral';

const CATEGORY_TONES: Record<string, IconTone> = {
  'Appointment': 'info',
  'Clinical Note': 'success',
  'Treatment Plan': 'warning',
  'Invoice': 'success',
  'Payment': 'success',
  'Lab Case': 'error',
  'Radiology': 'info',
  'Photo': 'neutral',
  'Referral': 'info',
  'Prescription': 'error',
  'AI Summary': 'accent'
};

const iconToneClasses: Record<IconTone, string> = {
  info: 'text-[var(--velvet-info)] bg-[var(--velvet-info-bg)] border-[var(--velvet-info-border)]',
  warning: 'text-[var(--velvet-warning)] bg-[var(--velvet-warning-bg)] border-[var(--velvet-warning-border)]',
  success: 'text-[var(--velvet-success)] bg-[var(--velvet-success-bg)] border-[var(--velvet-success-border)]',
  accent: 'text-[var(--velvet-accent)] bg-[var(--velvet-accent-glow2)] border-[var(--velvet-border-strong)]',
  error: 'text-[var(--velvet-error)] bg-[var(--velvet-error-bg)] border-[var(--velvet-error-border)]',
  neutral: 'text-[var(--velvet-text-muted)] bg-[var(--velvet-surface-2)] border-[var(--velvet-border)]',
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Appointment': Calendar,
  'Clinical Note': Heart,
  'Treatment Plan': Clipboard,
  'Invoice': DollarSign,
  'Payment': CreditCard,
  'Lab Case': FlaskConical,
  'Radiology': Layers,
  'Photo': Camera,
  'Referral': Send,
  'Prescription': FileDown,
  'AI Summary': Sparkles
};

export function PatientTimeline({
  activePatient,
  appointments,
  treatmentPlans,
  clinicalNotesList,
  imagingGallery,
  patientDocuments,
  invoices,
  payments,
  onActionExecute
}: PatientTimelineProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [visibleCount, setVisibleCount] = useState(10);
  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  // Compile all 11 feeds chronologically
  const compiledTimeline = useMemo(() => {
    const events: any[] = [];

    // 1. Appointments
    appointments.forEach(appt => {
      events.push({
        id: appt.id,
        date: appt.date,
        time: appt.startTime,
        author: appt.doctorName,
        category: 'Appointment',
        status: appt.status,
        description: `Scheduled: ${appt.procedure} on ${appt.chair}.`,
        rawDate: new Date(`${appt.date}T${appt.startTime || '00:00'}`)
      });
    });

    // 2. Clinical Notes
    clinicalNotesList.forEach(note => {
      const parts = (note.timestamp || '2026-07-01 09:00 AM').split(' ');
      events.push({
        id: note.id,
        date: parts[0],
        time: parts[1] ? `${parts[1]} ${parts[2] || ''}` : '09:00 AM',
        author: note.author || 'Dr. Ahmed',
        category: 'Clinical Note',
        status: note.locked ? 'Locked' : 'Draft',
        description: `SOAP Assessment: ${note.soap?.assessment || 'Session metrics logged'}`,
        rawDate: new Date(parts[0])
      });
    });

    // 3. Treatment Plans
    treatmentPlans.forEach(plan => {
      events.push({
        id: plan.id,
        date: plan.createdDate || '2026-07-01',
        time: '08:00 AM',
        author: plan.treatingDoctor || 'Dr. Ahmed',
        category: 'Treatment Plan',
        status: plan.progress === 100 ? 'Completed' : 'Active',
        description: `Plan published: ${plan.title}. Total fees estimated at $${plan.estimatedCost}.`,
        rawDate: new Date(plan.createdDate || '2026-07-01')
      });
    });

    // 4. Invoices
    invoices.forEach(inv => {
      events.push({
        id: inv.id,
        date: inv.issueDate,
        time: '10:00 AM',
        author: inv.doctorName || 'Billing Dept',
        category: 'Invoice',
        status: inv.paymentStatus,
        description: `Invoice ${inv.invoiceNumber} published for $${inv.treatmentItems.reduce((acc, c) => acc + c.fee, 0)}.`,
        rawDate: new Date(inv.issueDate)
      });
    });

    // 5. Payments
    payments.forEach(pay => {
      const parts = (pay.recordedAt || '2026-07-01T10:00:00Z').split('T');
      events.push({
        id: pay.id,
        date: parts[0],
        time: parts[1] ? parts[1].slice(0, 5) : '10:00 AM',
        author: 'Practice Cashier',
        category: 'Payment',
        status: 'Cleared',
        description: `Recorded ${pay.paymentMethod} transaction of $${pay.amount} for receipt ${pay.receiptNumber}.`,
        rawDate: new Date(pay.recordedAt)
      });
    });

    // 6. Lab Cases (activePatient cases)
    if (activePatient?.cases) {
      activePatient.cases.forEach((c: any) => {
        events.push({
          id: c.id,
          date: c.createdDate || '2026-07-01',
          time: '08:30 AM',
          author: c.clinician || 'Dr. Ahmed',
          category: 'Lab Case',
          status: c.status,
          description: `CAD/CAM Order registered for ${c.name} in stage: ${c.stage}.`,
          rawDate: new Date(c.createdDate || '2026-07-01')
        });
      });
    }

    // 7 & 8. Radiology and Photos (from imagingGallery)
    imagingGallery.forEach(img => {
      const isRadiology = img.category === 'CBCT' || img.category === 'Radiograph';
      events.push({
        id: img.id,
        date: img.date || '2026-07-01',
        time: '11:00 AM',
        author: 'Imaging Lab Tech',
        category: isRadiology ? 'Radiology' : 'Photo',
        status: 'Archived',
        description: `Uploaded scan file: ${img.name} (${img.category}).`,
        rawDate: new Date(img.date || '2026-07-01')
      });
    });

    // 9 & 10. Referrals and Prescriptions (from documents)
    patientDocuments.forEach(doc => {
      const isReferral = doc.type === 'Referral Letter';
      const isRx = doc.type === 'Lab Prescription';
      if (isReferral || isRx) {
        events.push({
          id: doc.id,
          date: doc.date || '2026-07-01',
          time: '02:00 PM',
          author: activePatient?.primaryDoctor || 'Dr. Ahmed',
          category: isReferral ? 'Referral' : 'Prescription',
          status: doc.status || 'Active',
          description: `Document Filed: ${doc.name} (${doc.type}).`,
          rawDate: new Date(doc.date || '2026-07-01')
        });
      }
    });

    // 11. AI Summaries
    events.push({
      id: 'ai-init',
      date: new Date().toISOString().split('T')[0],
      time: '08:00 AM',
      author: 'Clinical AI',
      category: 'AI Summary',
      status: 'Synchronized',
      description: 'Auto-synchronized patient chart diagnostics, periodontal indexes, and implant stability profiles.',
      rawDate: new Date()
    });

    return events;
  }, [activePatient, appointments, treatmentPlans, clinicalNotesList, imagingGallery, patientDocuments, invoices, payments]);

  // Filter and Sort
  const filteredEvents = useMemo(() => {
    let result = compiledTimeline;

    if (categoryFilter !== 'All') {
      result = result.filter(e => e.category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.title?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.author?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q)
      );
    }

    // Sort chronologically (newest first)
    return result.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
  }, [compiledTimeline, categoryFilter, searchQuery]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting) {
        setVisibleCount(prev => Math.min(prev + 10, filteredEvents.length));
      }
    }, { threshold: 0.1 });

    const currentTarget = observerTargetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [filteredEvents]);

  // Reset pagination on filter change
  useEffect(() => {
    setVisibleCount(10);
  }, [categoryFilter, searchQuery]);

  const uniqueCategories = ['All', 'Appointment', 'Clinical Note', 'Treatment Plan', 'Invoice', 'Payment', 'Lab Case', 'Radiology', 'Photo', 'Referral', 'Prescription'];

  const paginatedEvents = filteredEvents.slice(0, visibleCount);

  return (
    <motion.div
      key="tab-timeline"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="space-y-6 text-start"
    >
      <Card variant="gradient" hover={false} className="p-6 rounded-3xl space-y-6">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4" style={{ borderColor: 'var(--velvet-border)' }}>
          <div>
            <h3 className="text-lg font-bold text-[var(--velvet-text)] tracking-tight flex items-center gap-2 font-mono">
              <Activity className="w-5 h-5 text-[var(--velvet-success)] animate-pulse" /> Longitudinal Patient Feed
            </h3>
            <p className="text-xs text-[var(--velvet-text-muted)] mt-1">Timeline virtualization showing all structured EHR files, invoices, and clinical logs.</p>
          </div>
          <Badge tone="default" className="font-mono shrink-0">
            Total Records: {filteredEvents.length}
          </Badge>
        </div>

        {/* Interactive Clinical Pathway Roadmap */}
        <div className="p-4 rounded-xl border space-y-4" style={{ borderColor: 'var(--velvet-border)', background: 'var(--velvet-surface-1)' }}>
          <div className="flex justify-between items-center">
            <span className="text-2xs font-mono text-[var(--velvet-text-muted)] uppercase tracking-widest font-bold">Active Clinical Pathway Roadmap</span>
            <Badge tone="success" className="font-mono text-2xs">Phase 3: Surgical Loading</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
            {[
              { id: 'intake', step: 1, title: 'Intake & Records', date: '2026-06-15', status: 'completed', desc: 'CBCT 3D Scan & intake documentation.', filter: 'Clinical Note' },
              { id: 'prep', step: 2, title: 'Preparatory Phase', date: '2026-07-15', status: 'completed', desc: '#14 Pre-prosthetic Abutment.', filter: 'Lab Case' },
              { id: 'surgery', step: 3, title: 'Surgical Phase', date: '2026-08-01', status: 'active', desc: '#16 & #26 Implant placement.', filter: 'Treatment Plan' },
              { id: 'loading', step: 4, title: 'Prosthetic Loading', date: '2026-08-15', status: 'pending', desc: 'Zirconia Bridge Rehabilitation.', filter: 'Invoice' },
              { id: 'recall', step: 5, title: 'Recall & Osseo', date: '2026-10-15', status: 'future', desc: 'Osseointegration check.', filter: 'Appointment' },
            ].map(node => {
              const isActive = categoryFilter === node.filter;
              const statusClasses =
                node.status === 'completed'
                  ? 'border-[var(--velvet-success-border)] bg-[var(--velvet-success-bg)] text-[var(--velvet-text-sub)]'
                  : node.status === 'active'
                    ? 'border-[var(--velvet-info-border)] bg-[var(--velvet-info-bg)] text-[var(--velvet-text)]'
                    : node.status === 'pending'
                      ? 'border-[var(--velvet-warning-border)] bg-[var(--velvet-warning-bg)] text-[var(--velvet-text-sub)]'
                      : 'border-[var(--velvet-border)] bg-[var(--velvet-surface-1)] text-[var(--velvet-text-muted)]';
              return (
                <button
                  type="button"
                  key={node.id}
                  onClick={() => {
                    setCategoryFilter(node.filter);
                    setSearchQuery('');
                  }}
                  className={`p-3 rounded-xl border text-start transition-all ${statusClasses} ${isActive ? 'ring-1 ring-[var(--velvet-accent)] border-transparent' : ''}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-2xs font-mono text-[var(--velvet-text-muted)] font-semibold">Step 0{node.step}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      node.status === 'completed' ? 'bg-[var(--velvet-success)]' :
                      node.status === 'active' ? 'bg-[var(--velvet-info)] animate-ping' :
                      node.status === 'pending' ? 'bg-[var(--velvet-warning)]' :
                      'bg-[var(--velvet-surface-2)]'
                    }`} />
                  </div>
                  <h4 className="font-bold text-xs mt-1 text-[var(--velvet-text)] leading-tight">{node.title}</h4>
                  <p className="text-2xs text-[var(--velvet-text-muted)] mt-1 leading-relaxed font-sans">{node.desc}</p>
                  <span className="text-2xs font-mono text-[var(--velvet-text-muted)] block mt-2">{node.date}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter bar and search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full max-w-sm">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chronological timeline..."
              leftIcon={<Search className="w-4 h-4" />}
              aria-label="Search timeline"
            />
          </div>
          <div className="flex flex-wrap gap-1 p-1.5 rounded-xl border w-full md:w-auto overflow-x-auto scrollbar-none" style={{ borderColor: 'var(--velvet-border)', background: 'var(--velvet-surface-1)' }}>
            {uniqueCategories.slice(0, 7).map(cat => (
              <Button
                key={cat}
                variant={categoryFilter === cat ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setCategoryFilter(cat)}
                className="px-3 py-1 text-2xs font-bold rounded-lg"
              >
                {cat}s
              </Button>
            ))}
          </div>
        </div>

        {/* Virtualized scroll feed */}
        <div className="relative ps-6 sm:ps-8 py-2 before:absolute before:left-[11px] sm:before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-[var(--velvet-success)] before:via-[var(--velvet-border-strong)] before:to-transparent">
          {paginatedEvents.length === 0 ? (
            <EmptyState
              icon={<Activity className="w-6 h-6" />}
              title="No timeline events found."
              description="Try a different category filter or search query."
            />
          ) : (
            <div className="space-y-6">
              {paginatedEvents.map((item, idx) => {
                const Icon = CATEGORY_ICONS[item.category] || Activity;
                const tone = CATEGORY_TONES[item.category] || 'neutral';
                const colorClasses = iconToneClasses[tone];

                return (
                  <motion.div
                    key={`${item.id}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative text-start group"
                  >
                    {/* Circle Node */}
                    <div className={`absolute -left-[30px] sm:-left-[38px] top-4 w-4 h-4 rounded-full border-2 border-[var(--velvet-border)] flex items-center justify-center z-10 shadow-soft ${colorClasses.split(' ')[1]} ring-2 ring-[var(--velvet-border)]`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${colorClasses.split(' ')[0].replace('text-', 'bg-')}`} />
                    </div>

                    {/* Timeline card */}
                    <Card variant="elevated" hover className="p-4 rounded-xl flex flex-col sm:flex-row justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl border ${colorClasses} mt-0.5 shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge tone={tone} className="text-2xs font-mono uppercase">
                              {item.category}
                            </Badge>
                            <span className="text-2xs font-mono text-[var(--velvet-text-muted)]">{item.date} @ {item.time}</span>
                            <span className="text-2xs font-mono text-[var(--velvet-text-sub)] font-semibold">• Dr. {item.author}</span>
                          </div>
                          <p className="text-xs text-[var(--velvet-text)] mt-1.5 leading-normal">{item.description}</p>
                        </div>
                      </div>

                      {/* Timeline contextual action */}
                      {onActionExecute && (
                        <div className="self-end sm:self-center">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onActionExecute(item.category, item.id)}
                          >
                            Track Action
                          </Button>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Sentinel element at the bottom to trigger next load window */}
          <div ref={observerTargetRef} className="h-4 w-full" />

          {visibleCount < filteredEvents.length && (
            <div className="text-[var(--velvet-text-muted)] text-xs text-center py-4 animate-pulse">Scanning and loading historical records...</div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
