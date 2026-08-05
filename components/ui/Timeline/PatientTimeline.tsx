import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Activity, Calendar, FileText, Camera, Clipboard, FlaskConical, Filter, Heart, FileDown, Layers, DollarSign, CreditCard, Send, Sparkles } from 'lucide-react';
import { Appointment, BillingInvoice, BillingPayment, TreatmentPlan, PatientDocument } from '../../../utils/services/clinicalService';

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

const CATEGORY_COLORS: Record<string, string> = {
  'Appointment': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  'Clinical Note': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'Treatment Plan': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'Invoice': 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  'Payment': 'text-green-400 bg-green-500/10 border-green-500/20',
  'Lab Case': 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  'Radiology': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'Photo': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  'Referral': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  'Prescription': 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  'AI Summary': 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20'
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
      className="space-y-6 text-left"
    >
      <div className="p-6 rounded-3xl border border-zinc-900 bg-gradient-to-b from-zinc-900/40 to-zinc-950/40 backdrop-blur-md shadow-2xl space-y-6">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-900 pb-4 gap-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 font-mono">
              <Activity className="w-5 h-5 text-emerald-400 animate-pulse" /> Longitudinal Patient Feed
            </h3>
            <p className="text-xs text-zinc-400 mt-1">Timeline virtualization showing all structured EHR files, invoices, and clinical logs.</p>
          </div>
          <span className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 px-3 py-1 rounded text-zinc-400 shrink-0">
            Total Records: {filteredEvents.length}
          </span>
        </div>

        {/* Interactive Clinical Pathway Roadmap */}
        <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/30 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Active Clinical Pathway Roadmap</span>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Phase 3: Surgical Loading</span>
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
              return (
                <button
                  type="button"
                  key={node.id}
                  onClick={() => {
                    setCategoryFilter(node.filter);
                    setSearchQuery('');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    node.status === 'completed'
                      ? 'border-emerald-500/20 bg-emerald-500/[0.02] text-zinc-300 hover:bg-emerald-500/[0.05]'
                      : node.status === 'active'
                        ? 'border-purple-500/40 bg-purple-500/[0.04] text-white shadow-md shadow-purple-500/5'
                        : node.status === 'pending'
                          ? 'border-amber-500/20 bg-amber-500/[0.01] text-zinc-450 hover:bg-amber-500/[0.03]'
                          : 'border-zinc-900 bg-zinc-950/20 text-zinc-500'
                  } ${isActive ? 'ring-1 ring-emerald-400 border-transparent bg-zinc-900/40' : ''}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-zinc-500 font-semibold">Step 0{node.step}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      node.status === 'completed' ? 'bg-emerald-500 shadow-sm shadow-emerald-500' :
                      node.status === 'active' ? 'bg-purple-500 animate-ping' :
                      node.status === 'pending' ? 'bg-amber-500' :
                      'bg-zinc-800'
                    }`} />
                  </div>
                  <h4 className="font-bold text-xs mt-1 text-white leading-tight">{node.title}</h4>
                  <p className="text-[9px] text-zinc-400 mt-1 leading-relaxed font-sans">{node.desc}</p>
                  <span className="text-[8px] font-mono text-zinc-500 block mt-2">{node.date}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter bar and search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chronological timeline..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-950/60 border border-zinc-850 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500/40"
            />
          </div>
          <div className="flex flex-wrap gap-1 bg-zinc-950/50 p-1.5 rounded-xl border border-zinc-900 w-full md:w-auto overflow-x-auto scrollbar-none">
            {uniqueCategories.slice(0, 7).map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  categoryFilter === cat ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {cat}s
              </button>
            ))}
          </div>
        </div>

        {/* Virtualized scroll feed */}
        <div className="relative pl-6 sm:pl-8 py-2 before:absolute before:left-[11px] sm:before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500/50 before:via-zinc-800 before:to-transparent">
          {paginatedEvents.length === 0 ? (
            <div className="text-zinc-500 text-xs text-center py-12">No timeline events found.</div>
          ) : (
            <div className="space-y-6">
              {paginatedEvents.map((item, idx) => {
                const Icon = CATEGORY_ICONS[item.category] || Activity;
                const colorClasses = CATEGORY_COLORS[item.category] || 'text-zinc-400 bg-zinc-900 border-zinc-800';

                return (
                  <motion.div
                    key={`${item.id}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative text-left group"
                  >
                    {/* Circle Node */}
                    <div className={`absolute -left-[30px] sm:-left-[38px] top-4 w-4 h-4 rounded-full border-2 border-zinc-950 flex items-center justify-center z-10 shadow-md ${colorClasses.split(' ')[1]} ring-2 ring-zinc-950`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${colorClasses.split(' ')[0].replace('text-', 'bg-')}`} />
                    </div>

                    {/* Timeline card */}
                    <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/20 hover:bg-zinc-900/30 transition-all flex flex-col sm:flex-row justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl border ${colorClasses} mt-0.5 shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.2 rounded text-[8px] font-mono border uppercase font-bold ${colorClasses}`}>
                              {item.category}
                            </span>
                            <span className="text-[9px] font-mono text-zinc-500">{item.date} @ {item.time}</span>
                            <span className="text-[9px] font-mono text-zinc-400 font-semibold">• Dr. {item.author}</span>
                          </div>
                          <p className="text-xs text-white mt-1.5 leading-normal">{item.description}</p>
                        </div>
                      </div>

                      {/* Timeline contextual action */}
                      {onActionExecute && (
                        <div className="self-end sm:self-center">
                          <button
                            onClick={() => onActionExecute(item.category, item.id)}
                            className="px-3 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-400 hover:text-white"
                          >
                            Track Action
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Sentinel element at the bottom to trigger next load window */}
          <div ref={observerTargetRef} className="h-4 w-full" />

          {visibleCount < filteredEvents.length && (
            <div className="text-zinc-500 text-xs text-center py-4 animate-pulse">Scanning and loading historical records...</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
