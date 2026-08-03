import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';
import { Send, CheckCircle2, XCircle, Info, MessageSquare, Clock } from 'lucide-react';
import { clinicalService, PatientDocument } from '../../../utils/services/clinicalService';
import { Patient } from '../PatientWorkspace';

interface CommunicationPanelProps {
  supabase: SupabaseClient;
  activePatient: Patient;
  demoMode: boolean;
}

export default function CommunicationPanel({ supabase, activePatient, demoMode }: CommunicationPanelProps) {
  const queryClient = useQueryClient();
  const [selectedRefId, setSelectedRefId] = useState<string | null>(null);
  const [infoRequestText, setInfoRequestText] = useState('');
  const [showRequestBox, setShowRequestBox] = useState(false);

  // Fetch documents, filter for referrals
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents', activePatient.id],
    queryFn: () => clinicalService.getDocuments(supabase, activePatient.id, demoMode),
    enabled: !!activePatient.id
  });

  const referrals = documents.filter(d => d.type === 'Referral Letter');

  // Mutation to save document modifications
  const updateDocsMutation = useMutation({
    mutationFn: (newDocs: PatientDocument[]) =>
      clinicalService.saveDocuments(supabase, activePatient.id, newDocs, demoMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', activePatient.id] });
      setInfoRequestText('');
      setShowRequestBox(false);
    }
  });

  // Action Handlers
  const handleUpdateReferral = (refId: string, status: PatientDocument['status'], noteText: string) => {
    const updatedDocs = documents.map(doc => {
      if (doc.id === refId) {
        const timeline = doc.referralTimeline || [];
        const newEvent = {
          date: new Date().toISOString().split('T')[0],
          action: status === 'Accepted' ? 'Accepted' : status === 'Rejected' ? 'Rejected' : 'Info Requested',
          note: noteText,
          actor: activePatient.primaryDoctor || 'Dr. Ahmed'
        };
        return {
          ...doc,
          status,
          referralTimeline: [...timeline, newEvent]
        };
      }
      return doc;
    });
    updateDocsMutation.mutate(updatedDocs);
  };

  const activeReferral = referrals.find(r => r.id === selectedRefId) || referrals[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Left Column: Referrals Inbox List (Col span 4) */}
      <div className="md:col-span-4 space-y-4">
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900">
          <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider mb-3">Referrals Inbox</h3>
          {isLoading ? (
            <div className="text-zinc-500 text-xs py-4 animate-pulse">Loading inbox...</div>
          ) : referrals.length === 0 ? (
            <p className="text-zinc-500 text-[11px] py-4">No surgical referrals or physician letters on file.</p>
          ) : (
            <div className="space-y-2">
              {referrals.map((ref) => (
                <button
                  key={ref.id}
                  onClick={() => setSelectedRefId(ref.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs font-sans ${
                    (selectedRefId === ref.id || (!selectedRefId && referrals[0].id === ref.id))
                      ? 'bg-zinc-900 border-zinc-800 text-white'
                      : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[9px] font-mono font-semibold text-zinc-500">{ref.date}</span>
                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border uppercase ${
                      ref.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      ref.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      ref.status === 'Info Requested' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-zinc-900 text-zinc-400 border-zinc-800'
                    }`}>
                      {ref.status || 'Pending'}
                    </span>
                  </div>
                  <h4 className="font-bold truncate">{ref.name}</h4>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Workflow Controls and Status Timeline (Col span 8) */}
      <div className="md:col-span-8">
        {!activeReferral ? (
          <div className="p-8 rounded-2xl border border-zinc-900 bg-zinc-950/20 text-center text-zinc-500 text-xs">
            Select a referral letter from the inbox to process.
          </div>
        ) : (
          <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-950/20 space-y-6">
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-zinc-900/60 pb-3">
              <div>
                <span className="text-[9px] font-mono text-zinc-500">File ID: {activeReferral.id}</span>
                <h3 className="text-sm font-bold text-white mt-0.5">{activeReferral.name}</h3>
                <p className="text-xs text-zinc-400 mt-1">Classification: Specialist Referral Clearance</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded border font-mono font-bold uppercase ${
                activeReferral.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                activeReferral.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                activeReferral.status === 'Info Requested' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                'bg-zinc-900 text-zinc-400 border-zinc-800'
              }`}>
                {activeReferral.status || 'Pending Review'}
              </span>
            </div>

            {/* Referral description mock copy */}
            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-900 text-xs text-zinc-300 leading-relaxed font-sans">
              <p className="font-bold text-white mb-2">CLINICAL DIRECTIVE & DIAGNOSIS OVERVIEW</p>
              <p>Referred for evaluation of localized bone volume deficiencies in the posterior maxilla. Recommend sinus floor elevation (osteotome prep) and bone graft augmentation before scheduling full arch zirconia bridge delivery.</p>
              <p className="mt-2 font-mono text-[10px] text-zinc-500">Referring Physician: Specialist Diagnostics Unit | Authenticator: REFERRAL_OK_AUTH_9918</p>
            </div>

            {/* Workflow Action Buttons */}
            {activeReferral.status !== 'Accepted' && activeReferral.status !== 'Rejected' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateReferral(activeReferral.id, 'Accepted', 'Referral review completed. Patient cleared for clinical course.')}
                    className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/5 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Accept Referral
                  </button>
                  <button
                    onClick={() => handleUpdateReferral(activeReferral.id, 'Rejected', 'Referral rejected due to systemic clinical contraindications.')}
                    className="flex-1 py-2 rounded-xl bg-red-950/20 hover:bg-red-900/10 border border-red-500/20 text-red-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Reject Referral
                  </button>
                  <button
                    onClick={() => setShowRequestBox(!showRequestBox)}
                    className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Info className="w-4 h-4" /> Request Info
                  </button>
                </div>

                {showRequestBox && (
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 space-y-2">
                    <label className="text-[10px] text-zinc-400 block font-bold">Specify Information Request Details</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={infoRequestText}
                        onChange={(e) => setInfoRequestText(e.target.value)}
                        placeholder="e.g. Please send the latest panoramic radiograph..."
                        className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-blue-500/40 text-xs"
                      />
                      <button
                        onClick={() => handleUpdateReferral(activeReferral.id, 'Info Requested', `Information Request dispatched: "${infoRequestText}"`)}
                        disabled={!infoRequestText.trim()}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white rounded-lg font-bold text-xs"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Referral Status Timeline (Audit trail) */}
            <div className="space-y-3 pt-2">
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Referral Status Timeline & Audit Log</h4>
              <div className="space-y-3 relative pl-3.5 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-900">
                {(activeReferral.referralTimeline || [
                  { date: activeReferral.date, action: "Received", note: "Referral submitted to inbox.", actor: "Referring Physician" }
                ]).map((item, idx) => (
                  <div key={idx} className="relative text-xs">
                    <span className="absolute -left-[19px] top-1.5 w-2 h-2 rounded-full bg-zinc-800 border-2 border-zinc-950" />
                    <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500">
                      <span>{item.date} • Action by {item.actor}</span>
                      <span className="text-[8px] px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold uppercase">{item.action}</span>
                    </div>
                    <p className="text-zinc-300 font-medium mt-1 leading-normal">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
