'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, User, Calendar, FileText, Activity, ShieldAlert, Sparkles, Folder, ArrowRight } from 'lucide-react';
import { Patient, Appointment, TreatmentSession } from './types';

// Static mock document/image index to make the search extremely comprehensive as requested!
const MOCK_DOCUMENTS = [
  { title: 'Surgical Implant Consent Form', patient: 'Arthur Pendragon', type: 'PDF Document', date: '2026-07-15' },
  { title: 'Anterior Veneers Veneering Plan', patient: 'Clara Oswald', type: 'Exocad Project', date: '2026-07-18' },
  { title: 'Upper Jaw STL Digital Scan', patient: 'Diana Prince', type: 'STL Scan File', date: '2026-07-19' },
  { title: 'Pre-auth Dental Claim', patient: 'Bruce Wayne', type: 'Insurance PDF', date: '2026-07-14' }
];

const MOCK_AI_NOTES = [
  { title: 'Periodontal Risk Indicator Analysis', patient: 'Arthur Pendragon', score: '99.4% precision check passed' },
  { title: 'Tooth wear and clenching prediction', patient: 'Bruce Wayne', score: 'Severe load triggers active' }
];

interface SearchEngineProps {
  patients: Patient[];
  appointments: Appointment[];
  sessions: TreatmentSession[];
}

export default function SearchEngine({
  patients,
  appointments,
  sessions
}: SearchEngineProps) {
  const [query, setQuery] = useState('');

  // Instant multi-vector index lookup
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    const matchedPatients = patients.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.id.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q)
    );

    const matchedAppointments = appointments.filter(a => 
      a.patientName.toLowerCase().includes(q) ||
      a.procedure.toLowerCase().includes(q) ||
      a.chair.toLowerCase().includes(q) ||
      a.doctorName.toLowerCase().includes(q)
    );

    const matchedTreatments = sessions.filter(s => 
      s.patientName.toLowerCase().includes(q) ||
      s.procedure.toLowerCase().includes(q) ||
      s.clinicalNotes.toLowerCase().includes(q)
    );

    const matchedDocuments = MOCK_DOCUMENTS.filter(d => 
      d.title.toLowerCase().includes(q) ||
      d.patient.toLowerCase().includes(q)
    );

    const matchedAiNotes = MOCK_AI_NOTES.filter(a => 
      a.title.toLowerCase().includes(q) ||
      a.patient.toLowerCase().includes(q)
    );

    return {
      patients: matchedPatients,
      appointments: matchedAppointments,
      treatments: matchedTreatments,
      documents: matchedDocuments,
      aiNotes: matchedAiNotes
    };
  }, [query, patients, appointments, sessions]);

  return (
    <div id="operations-search" className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-2xl space-y-6 text-left">
      <div>
        <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
          <Search className="w-4 h-4 text-purple-400" /> Global Clinical Index Search Engine
        </h3>
        <p className="text-zinc-400 text-xs mt-1">
          Perform a unified index search across patients, active appointments, clinical treatments, lab documents, scan images, and AI records.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
        <input 
          type="text"
          placeholder="Type Arthur, implant, STL scan, or clinical note query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-900 rounded-xl text-zinc-200 placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      {searchResults ? (
        <div className="space-y-6">
          <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-900 pb-2">
            Search Index Results for "{query}"
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Col: Patients and Appointments */}
            <div className="space-y-6">
              
              {/* Patients Index matches */}
              {searchResults.patients.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-[11px] font-bold font-mono text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <User className="w-3.5 h-3.5" /> Matched Patient Records ({searchResults.patients.length})
                  </h4>
                  <div className="space-y-2">
                    {searchResults.patients.map(p => (
                      <div key={p.id} className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-900 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-white text-xs">{p.name}</p>
                          <p className="text-[10px] text-zinc-500">ID: {p.id} • Phone: {p.phone}</p>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-1 rounded border border-zinc-850">
                          {p.priorityType}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Appointments Index matches */}
              {searchResults.appointments.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-[11px] font-bold font-mono text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5" /> Matched Appointments ({searchResults.appointments.length})
                  </h4>
                  <div className="space-y-2">
                    {searchResults.appointments.map(a => (
                      <div key={a.id} className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-900 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-white">{a.patientName}</span>
                          <span className="text-zinc-500 font-mono">{a.startTime} • {a.date}</span>
                        </div>
                        <p className="text-[10px] text-purple-400 font-mono font-bold">{a.procedure} ({a.chair})</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Col: Treatments and Documents */}
            <div className="space-y-6">
              
              {/* Treatments index matches */}
              {searchResults.treatments.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-[11px] font-bold font-mono text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Activity className="w-3.5 h-3.5" /> Matched Treatments & notes ({searchResults.treatments.length})
                  </h4>
                  <div className="space-y-2">
                    {searchResults.treatments.map(t => (
                      <div key={t.id} className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-900 space-y-1">
                        <p className="font-bold text-white text-xs">{t.patientName}</p>
                        <p className="text-[10px] text-zinc-400 leading-relaxed font-mono italic">{t.clinicalNotes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents & Images index matches */}
              {searchResults.documents.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-[11px] font-bold font-mono text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Folder className="w-3.5 h-3.5" /> Matched Exocad & STL Scan Files ({searchResults.documents.length})
                  </h4>
                  <div className="space-y-2">
                    {searchResults.documents.map((d, i) => (
                      <div key={i} className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-900 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-white text-xs">{d.title}</p>
                          <p className="text-[10px] text-zinc-500">Patient: {d.patient} • {d.date}</p>
                        </div>
                        <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/25 px-2 py-0.5 rounded-full">
                          {d.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI notes index matches */}
              {searchResults.aiNotes.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-[11px] font-bold font-mono text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" /> Matched AI Copilot Notes ({searchResults.aiNotes.length})
                  </h4>
                  <div className="space-y-2">
                    {searchResults.aiNotes.map((an, i) => (
                      <div key={i} className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-900 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-white text-xs">{an.title}</p>
                          <p className="text-[10px] text-zinc-500">Patient: {an.patient}</p>
                        </div>
                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                          {an.score}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* No matches */}
          {searchResults.patients.length === 0 && 
           searchResults.appointments.length === 0 && 
           searchResults.treatments.length === 0 && 
           searchResults.documents.length === 0 &&
           searchResults.aiNotes.length === 0 && (
            <div className="p-12 text-center text-zinc-600 italic text-xs border border-dashed border-zinc-900 rounded-2xl">
              No matching records discovered in the clinical database. Try searching for "Arthur", "implant", or "suture".
            </div>
          )}
        </div>
      ) : (
        <div className="py-12 text-center text-zinc-600 italic text-xs border border-dashed border-zinc-900 rounded-2xl bg-zinc-950/10">
          Enter a search phrase above to instantly sweep the entire clinical data block tree.
        </div>
      )}
    </div>
  );
}
