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
    <div id="operations-search" className="p-6 card-elevated rounded-2xl space-y-6 text-start">
      <div>
        <h3 className="text-sm font-bold font-mono flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <Search className="w-4 h-4" style={{ color: 'var(--accent)' }} /> Global Clinical Index Search Engine
        </h3>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Perform a unified index search across patients, active appointments, clinical treatments, lab documents, scan images, and AI records.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
        <input 
          type="text"
          placeholder="Type Arthur, implant, STL scan, or clinical note query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full ps-12 pe-4 py-3 rounded-xl text-sm transition-colors"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }}
        />
      </div>

      {searchResults ? (
        <div className="space-y-6">
          <p className="text-2xs font-mono font-bold uppercase tracking-widest border-b pb-2" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
            Search Index Results for "{query}"
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Col: Patients and Appointments */}
            <div className="space-y-6">
              
              {/* Patients Index matches */}
              {searchResults.patients.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold font-mono flex items-center gap-1.5 uppercase tracking-wider" style={{ color: 'var(--text-sub)' }}>
                    <User className="w-3.5 h-3.5" /> Matched Patient Records ({searchResults.patients.length})
                  </h4>
                  <div className="space-y-2">
                    {searchResults.patients.map(p => (
                      <div key={p.id} className="p-3 card-hover rounded-xl border flex justify-between items-center" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                        <div>
                          <p className="font-bold text-xs" style={{ color: 'var(--text)' }}>{p.name}</p>
                          <p className="text-2xs" style={{ color: 'var(--text-muted)' }}>ID: {p.id} • Phone: {p.phone}</p>
                        </div>
                        <span className="text-2xs font-mono px-2 py-1 rounded border" style={{ color: 'var(--text-sub)', background: 'var(--surface-3)', borderColor: 'var(--border)' }}>
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
                  <h4 className="text-xs font-bold font-mono flex items-center gap-1.5 uppercase tracking-wider" style={{ color: 'var(--text-sub)' }}>
                    <Calendar className="w-3.5 h-3.5" /> Matched Appointments ({searchResults.appointments.length})
                  </h4>
                  <div className="space-y-2">
                    {searchResults.appointments.map(a => (
                      <div key={a.id} className="p-3 card-hover rounded-xl border space-y-1" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                        <div className="flex justify-between text-xs">
                          <span className="font-bold" style={{ color: 'var(--text)' }}>{a.patientName}</span>
                          <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{a.startTime} • {a.date}</span>
                        </div>
                        <p className="text-2xs font-mono font-bold" style={{ color: 'var(--accent)' }}>{a.procedure} ({a.chair})</p>
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
                  <h4 className="text-xs font-bold font-mono flex items-center gap-1.5 uppercase tracking-wider" style={{ color: 'var(--text-sub)' }}>
                    <Activity className="w-3.5 h-3.5" /> Matched Treatments & notes ({searchResults.treatments.length})
                  </h4>
                  <div className="space-y-2">
                    {searchResults.treatments.map(t => (
                      <div key={t.id} className="p-3 card-hover rounded-xl border space-y-1" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                        <p className="font-bold text-xs" style={{ color: 'var(--text)' }}>{t.patientName}</p>
                        <p className="text-2xs leading-relaxed font-mono italic" style={{ color: 'var(--text-sub)' }}>{t.clinicalNotes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents & Images index matches */}
              {searchResults.documents.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold font-mono flex items-center gap-1.5 uppercase tracking-wider" style={{ color: 'var(--text-sub)' }}>
                    <Folder className="w-3.5 h-3.5" /> Matched Exocad & STL Scan Files ({searchResults.documents.length})
                  </h4>
                  <div className="space-y-2">
                    {searchResults.documents.map((d, i) => (
                      <div key={i} className="p-3 card-hover rounded-xl border flex justify-between items-center" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                        <div>
                          <p className="font-semibold text-xs" style={{ color: 'var(--text)' }}>{d.title}</p>
                          <p className="text-2xs" style={{ color: 'var(--text-muted)' }}>Patient: {d.patient} • {d.date}</p>
                        </div>
                        <span className="text-2xs font-mono px-2 py-0.5 rounded-full" style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)' }}>
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
                  <h4 className="text-xs font-bold font-mono flex items-center gap-1.5 uppercase tracking-wider" style={{ color: 'var(--text-sub)' }}>
                    <Sparkles className="w-3.5 h-3.5" /> Matched AI Copilot Notes ({searchResults.aiNotes.length})
                  </h4>
                  <div className="space-y-2">
                    {searchResults.aiNotes.map((an, i) => (
                      <div key={i} className="p-3 card-hover rounded-xl border flex justify-between items-center" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                        <div>
                          <p className="font-semibold text-xs" style={{ color: 'var(--text)' }}>{an.title}</p>
                          <p className="text-2xs" style={{ color: 'var(--text-muted)' }}>Patient: {an.patient}</p>
                        </div>
                        <span className="text-2xs font-mono px-2 py-0.5 rounded-full" style={{ color: 'var(--success)', background: 'color-mix(in srgb, var(--success) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--success) 25%, transparent)' }}>
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
            <div className="p-12 text-center italic text-xs border border-dashed rounded-2xl" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
              No matching records discovered in the clinical database. Try searching for "Arthur", "implant", or "suture".
            </div>
          )}
        </div>
      ) : (
        <div className="py-12 text-center italic text-xs border border-dashed rounded-2xl" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
          Enter a search phrase above to instantly sweep the entire clinical data block tree.
        </div>
      )}
    </div>
  );
}
