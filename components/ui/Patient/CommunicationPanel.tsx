import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';
import { Send, CheckCircle2, XCircle, Info } from 'lucide-react';
import { clinicalService, PatientDocument } from '../../../utils/services/clinicalService';
import { Patient } from '../PatientWorkspace';
import { Card, Badge, Button, Input, Skeleton, EmptyState } from '@/components/ui/design-system';

interface CommunicationPanelProps {
  supabase: SupabaseClient;
  activePatient: Patient;
  demoMode: boolean;
}

const statusBadgeTone = (status?: string) => {
  if (status === 'Accepted') return 'success' as const;
  if (status === 'Rejected') return 'error' as const;
  if (status === 'Info Requested') return 'info' as const;
  return 'default' as const;
};

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
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-start">
      {/* Left Column: Referrals Inbox List (Col span 4) */}
      <div className="md:col-span-4 space-y-4">
        <Card variant="elevated" hover={false} className="p-4 rounded-2xl">
          <h3 className="text-xs font-bold text-[var(--velvet-text)] font-mono uppercase tracking-wider mb-3">Referrals Inbox</h3>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : referrals.length === 0 ? (
            <EmptyState
              icon={<Send className="w-6 h-6" />}
              title="No referrals yet"
              description="No surgical referrals or physician letters on file."
            />
          ) : (
            <div className="space-y-2">
              {referrals.map((ref) => (
                <button
                  key={ref.id}
                  onClick={() => setSelectedRefId(ref.id)}
                  className={`w-full text-start p-3 rounded-xl border transition-all text-xs font-sans ${
                    (selectedRefId === ref.id || (!selectedRefId && referrals[0].id === ref.id))
                      ? 'bg-[var(--velvet-surface-2)] border-[var(--velvet-border-strong)] text-[var(--velvet-text)]'
                      : 'bg-[var(--velvet-surface-1)] border-[var(--velvet-border)] text-[var(--velvet-text-muted)] hover:bg-[var(--velvet-surface-2)]'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-2xs font-mono font-semibold text-[var(--velvet-text-muted)]">{ref.date}</span>
                    <Badge tone={statusBadgeTone(ref.status)} className="text-2xs uppercase">
                      {ref.status || 'Pending'}
                    </Badge>
                  </div>
                  <h4 className="font-bold truncate">{ref.name}</h4>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Right Column: Workflow Controls and Status Timeline (Col span 8) */}
      <div className="md:col-span-8">
        {!activeReferral ? (
          <Card variant="elevated" hover={false} className="p-8 rounded-3xl text-center text-xs text-[var(--velvet-text-muted)]">
            Select a referral letter from the inbox to process.
          </Card>
        ) : (
          <Card variant="elevated" hover={false} className="p-5 rounded-3xl space-y-6">
            {/* Header info */}
            <div className="flex justify-between items-start border-b pb-3" style={{ borderColor: 'var(--velvet-border)' }}>
              <div>
                <span className="text-2xs font-mono text-[var(--velvet-text-muted)]">File ID: {activeReferral.id}</span>
                <h3 className="text-sm font-bold text-[var(--velvet-text)] mt-0.5">{activeReferral.name}</h3>
                <p className="text-xs text-[var(--velvet-text-muted)] mt-1">Classification: Specialist Referral Clearance</p>
              </div>
              <Badge tone={statusBadgeTone(activeReferral.status)}>
                {activeReferral.status || 'Pending Review'}
              </Badge>
            </div>

            {/* Referral description mock copy */}
            <Card variant="elevated" hover={false} className="p-4 rounded-2xl text-xs leading-relaxed font-sans text-[var(--velvet-text-sub)]">
              <p className="font-bold text-[var(--velvet-text)] mb-2">CLINICAL DIRECTIVE & DIAGNOSIS OVERVIEW</p>
              <p>Referred for evaluation of localized bone volume deficiencies in the posterior maxilla. Recommend sinus floor elevation (osteotome prep) and bone graft augmentation before scheduling full arch zirconia bridge delivery.</p>
              <p className="mt-2 font-mono text-2xs text-[var(--velvet-text-muted)]">Referring Physician: Specialist Diagnostics Unit | Authenticator: REFERRAL_OK_AUTH_9918</p>
            </Card>

            {/* Workflow Action Buttons */}
            {activeReferral.status !== 'Accepted' && activeReferral.status !== 'Rejected' && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleUpdateReferral(activeReferral.id, 'Accepted', 'Referral review completed. Patient cleared for clinical course.')}
                    className="flex-1 py-2 rounded-xl text-xs min-w-[160px]"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Accept Referral
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleUpdateReferral(activeReferral.id, 'Rejected', 'Referral rejected due to systemic clinical contraindications.')}
                    className="flex-1 py-2 rounded-xl text-xs min-w-[160px]"
                  >
                    <XCircle className="w-4 h-4" /> Reject Referral
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowRequestBox(!showRequestBox)}
                    className="px-4 py-2 rounded-xl text-xs"
                  >
                    <Info className="w-4 h-4" /> Request Info
                  </Button>
                </div>

                {showRequestBox && (
                  <Card variant="elevated" hover={false} className="p-3 rounded-2xl space-y-2">
                    <label className="text-2xs text-[var(--velvet-text-muted)] block font-bold">Specify Information Request Details</label>
                    <div className="flex gap-2">
                      <Input
                        value={infoRequestText}
                        onChange={(e) => setInfoRequestText(e.target.value)}
                        placeholder="e.g. Please send the latest panoramic radiograph..."
                        aria-label="Information request details"
                      />
                      <Button
                        variant="secondary"
                        onClick={() => handleUpdateReferral(activeReferral.id, 'Info Requested', `Information Request dispatched: "${infoRequestText}"`)}
                        disabled={!infoRequestText.trim()}
                        className="px-3 py-2 rounded-lg text-xs shrink-0"
                      >
                        Send
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Referral Status Timeline (Audit trail) */}
            <div className="space-y-3 pt-2">
              <h4 className="text-2xs font-bold text-[var(--velvet-text-muted)] uppercase tracking-wider font-mono">Referral Status Timeline & Audit Log</h4>
              <div className="space-y-3 relative ps-3.5 before:absolute before:start-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--velvet-border-strong)]">
                {(activeReferral.referralTimeline || [
                  { date: activeReferral.date, action: "Received", note: "Referral submitted to inbox.", actor: "Referring Physician" }
                ]).map((item, idx) => (
                  <div key={idx} className="relative text-xs">
                    <span className="absolute -left-[19px] top-1.5 w-2 h-2 rounded-full border-2" style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)' }} />
                    <div className="flex items-center justify-between text-2xs font-mono text-[var(--velvet-text-muted)]">
                      <span>{item.date} • Action by {item.actor}</span>
                      <Badge tone="default" className="text-2xs uppercase">{item.action}</Badge>
                    </div>
                    <p className="text-[var(--velvet-text-sub)] font-medium mt-1 leading-normal">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
