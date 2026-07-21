import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export interface PatientTimelineProps {
  activePatient: any;
  treatmentPlans: any[];
  clinicalNotesList: any[];
  imagingGallery: any[];
  patientDocuments: any[];
}

export function PatientTimeline({
  activePatient,
  treatmentPlans,
  clinicalNotesList,
  imagingGallery,
  patientDocuments
}: PatientTimelineProps) {

  const sortedTimeline = useMemo(() => {
    const dynamicTimeline = [
      ...(activePatient?.timeline || []).map((item: any) => ({
        date: item.date,
        title: item.title,
        category: item.category,
        description: item.description
      })),
      ...treatmentPlans.map((plan: any) => ({
        date: plan.createdDate || '2026-07-15',
        title: `Plan Initialized: ${plan.title}`,
        category: 'Treatment Plan',
        description: plan.description || `Treatment plan established with estimated fee of $${plan.estimatedCost?.toLocaleString() || 0}.`
      })),
      ...clinicalNotesList.map((note: any) => ({
        date: note.timestamp?.split(' ')[0] || '2026-07-15',
        title: `SOAP Note: ${note.title}`,
        category: 'Clinical Note',
        description: note.soap?.assessment || note.soap?.subjective || 'Clinical session assessment logged.'
      })),
      ...imagingGallery.map((img: any) => ({
        date: img.date || '2026-07-15',
        title: `Imaging Added: ${img.name}`,
        category: 'Imaging',
        description: `Patient visual diagnostic asset added to category "${img.category}".`
      })),
      ...patientDocuments.map((doc: any) => ({
        date: doc.date || '2026-07-15',
        title: `Document Filed: ${doc.name}`,
        category: 'Document',
        description: `Administrative / clinical documentation of type "${doc.type}" uploaded.`
      }))
    ];

    return [...dynamicTimeline].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [activePatient, treatmentPlans, clinicalNotesList, imagingGallery, patientDocuments]);

  return (
    <motion.div
      key="tab-timeline"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="space-y-6"
    >
      <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/20 space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white">Longitudinal Clinical History & Event Log</h3>
            <p className="text-xs text-zinc-400">Chronological history of scans, designs, mockups, and surgical interventions.</p>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
            Real-time Sync
          </span>
        </div>

        <div className="space-y-6 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-850">
          {sortedTimeline.map((item, idx) => (
            <div key={idx} className="relative space-y-2 bg-zinc-950/30 p-4 rounded-xl border border-zinc-900/60 hover:border-zinc-800 transition-all">
              <span className="absolute -left-[23px] top-4 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-zinc-950" />
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{item.title}</span>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 uppercase tracking-wider">{item.category}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">{item.date}</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
