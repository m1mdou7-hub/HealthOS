import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Activity, FileText, Camera, Clipboard, FlaskConical, Filter, Heart, FileDown, Layers, ChevronDown } from 'lucide-react';

export interface PatientTimelineProps {
  activePatient: any;
  treatmentPlans: any[];
  clinicalNotesList: any[];
  imagingGallery: any[];
  patientDocuments: any[];
}

const CATEGORY_COLORS: Record<string, string> = {
  'Clinical Note': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'Clinical SOAP Note': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'Treatment Plan': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  'Treatment Progress': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  'Imaging': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'Radiology / CBCT': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'Document': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'Laboratory / Document': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'Laboratory': 'text-pink-400 bg-pink-500/10 border-pink-500/20'
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Clinical Note': Heart,
  'Clinical SOAP Note': Heart,
  'Treatment Plan': Clipboard,
  'Treatment Progress': Clipboard,
  'Imaging': Camera,
  'Radiology / CBCT': Layers,
  'Document': FileText,
  'Laboratory / Document': FileDown,
  'Laboratory': FlaskConical,
  'All': Activity
};

const getCategoryColor = (category: string) => CATEGORY_COLORS[category] || 'text-zinc-400 bg-zinc-900 border-zinc-800';
const getCategoryIcon = (category: string) => CATEGORY_ICONS[category] || Activity;

export function PatientTimeline({
  activePatient,
  treatmentPlans,
  clinicalNotesList,
  imagingGallery,
  patientDocuments
}: PatientTimelineProps) {

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const rawTimeline = useMemo(() => {
    const dynamicTimeline = [
      ...(activePatient?.timeline || []).map((item: any) => ({
        date: item.date,
        title: item.title,
        category: item.category,
        description: item.description,
        rawDate: new Date(item.date)
      })),
      ...treatmentPlans.map((plan: any) => ({
        date: plan.createdDate || '2026-07-15',
        title: `Plan Initialized: ${plan.title}`,
        category: 'Treatment Plan',
        description: plan.description || `Treatment plan established with estimated fee of $${plan.estimatedCost?.toLocaleString() || 0}.`,
        rawDate: new Date(plan.createdDate || '2026-07-15')
      })),
      ...clinicalNotesList.map((note: any) => ({
        date: note.timestamp?.split(' ')[0] || '2026-07-15',
        title: `SOAP Note: ${note.title}`,
        category: 'Clinical Note',
        description: note.soap?.assessment || note.soap?.subjective || 'Clinical session assessment logged.',
        rawDate: new Date(note.timestamp?.split(' ')[0] || '2026-07-15')
      })),
      ...imagingGallery.map((img: any) => ({
        date: img.date || '2026-07-15',
        title: `Imaging Added: ${img.name}`,
        category: 'Imaging',
        description: `Patient visual diagnostic asset added to category "${img.category}".`,
        rawDate: new Date(img.date || '2026-07-15')
      })),
      ...patientDocuments.map((doc: any) => ({
        date: doc.date || '2026-07-15',
        title: `Document Filed: ${doc.name}`,
        category: 'Document',
        description: `Administrative / clinical documentation of type "${doc.type}" uploaded.`,
        rawDate: new Date(doc.date || '2026-07-15')
      }))
    ];

    return dynamicTimeline;
  }, [activePatient, treatmentPlans, clinicalNotesList, imagingGallery, patientDocuments]);

  const uniqueCategories = useMemo(() => {
    const categories = new Set(rawTimeline.map(item => item.category));
    return ['All', ...Array.from(categories)];
  }, [rawTimeline]);

  const sortedTimeline = useMemo(() => {
    let filtered = rawTimeline;

    if (categoryFilter !== 'All') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery)
      );
    }

    return filtered.sort((a, b) => {
      const dateA = isNaN(a.rawDate.getTime()) ? new Date(0) : a.rawDate;
      const dateB = isNaN(b.rawDate.getTime()) ? new Date(0) : b.rawDate;
      return dateB.getTime() - dateA.getTime();
    });
  }, [rawTimeline, categoryFilter, searchQuery]);


  return (
    <motion.div
      key="tab-timeline"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="space-y-6"
    >
      <div className="p-6 rounded-2xl border border-zinc-900 bg-gradient-to-b from-zinc-900/40 to-zinc-950/40 backdrop-blur-md shadow-2xl shadow-black/50 space-y-6">

        {/* Header & Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-zinc-900 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Longitudinal Clinical Timeline
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Comprehensive history of clinical events, imaging studies, and treatment progress.
              </p>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Real-time Sync
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, notes, or documents..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-zinc-200 placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-inner"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 bg-zinc-950/50 p-1.5 rounded-xl border border-zinc-800/50 w-full md:w-auto">
              <div className="flex items-center gap-1.5 px-2">
                  <Filter className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hidden sm:inline-block">Filter:</span>
              </div>

               <div className="flex flex-wrap gap-1">
                {uniqueCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all flex items-center gap-1.5 ${
                      categoryFilter === cat
                        ? "bg-zinc-800 text-white shadow-sm border border-zinc-700"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Events */}
        <div className="relative pl-6 sm:pl-8 py-2 before:absolute before:left-[11px] sm:before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500/50 before:via-zinc-800 before:to-zinc-900/10">
          <AnimatePresence mode="popLayout">
            {sortedTimeline.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-12 text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 mb-3">
                  <Search className="w-5 h-5 text-zinc-500" />
                </div>
                <h4 className="text-sm font-bold text-zinc-300">No timeline events found</h4>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  We couldn't find any clinical records matching your current search or category filters.
                </p>
              </motion.div>
            ) : (
              sortedTimeline.map((item, idx) => {
                const Icon = getCategoryIcon(item.category);
                const colorClasses = getCategoryColor(item.category);

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    key={`${item.date}-${item.title}-${idx}`}
                    className="relative mb-6 last:mb-0 group"
                  >
                    {/* Timeline Node Connector */}
                    <div className={`absolute -left-[30px] sm:-left-[38px] top-4 w-4 h-4 rounded-full border-2 border-zinc-950 flex items-center justify-center z-10 shadow-md ${colorClasses.split(' ')[1]} ring-2 ring-zinc-950 transition-all group-hover:scale-110`}>
                       <div className={`w-1.5 h-1.5 rounded-full ${colorClasses.split(' ')[0].replace('text-', 'bg-')}`} />
                    </div>

                    {/* Event Card */}
                    <div className="bg-zinc-950/40 p-4 sm:p-5 rounded-2xl border border-zinc-800/60 hover:border-zinc-700/80 transition-all shadow-sm hover:shadow-lg hover:shadow-black/20 backdrop-blur-sm group-hover:bg-zinc-900/50">

                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-xl border ${colorClasses} shrink-0 mt-0.5`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                               <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${colorClasses}`}>
                                {item.category}
                              </span>
                               <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                                {item.date}
                               </span>
                            </div>
                            <h4 className="text-sm font-bold text-white leading-tight group-hover:text-emerald-300 transition-colors">
                              {item.title}
                            </h4>
                          </div>
                        </div>
                      </div>

                      <div className="pl-12 sm:pl-14">
                        <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
                          {item.description}
                        </p>
                      </div>

                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {sortedTimeline.length > 0 && (
          <div className="pt-4 flex justify-center border-t border-zinc-900">
             <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                End of chronological record <ChevronDown className="w-3 h-3" />
             </span>
          </div>
        )}

      </div>
    </motion.div>
  );
}
