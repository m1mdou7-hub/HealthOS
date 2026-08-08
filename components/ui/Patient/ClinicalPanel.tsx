import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, ShieldAlert, Heart, RefreshCw } from 'lucide-react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Patient } from '../PatientWorkspace';
import { Drawer, Card, Badge, Button, Input } from '@/components/ui/design-system';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

interface ClinicalPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activePatient: Patient;
  supabase: SupabaseClient;
  outstandingBalance: number;
  upcomingAppointmentText: string;
  pendingProceduresCount: number;
  chiefComplaint: string;
  medicalConditions: string;
  medicalAllergies: string;
}

export default function ClinicalPanel({
  isOpen,
  onClose,
  activePatient,
  supabase,
  outstandingBalance,
  upcomingAppointmentText,
  pendingProceduresCount,
  chiefComplaint,
  medicalConditions,
  medicalAllergies
}: ClinicalPanelProps) {
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'chat'>('diagnostics');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: `Clinical Decision Support active for patient **${activePatient?.name || 'Unknown'}**. How can I assist you with prosthodontics parameters today?` }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // AI Diagnostic scan states
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiRisks, setAiRisks] = useState<string | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const autoScannedRef = useRef<string | null>(null);

  // Auto trigger scan on patient load
  useEffect(() => {
    if (isOpen && activePatient?.id && autoScannedRef.current !== activePatient.id) {
      autoScannedRef.current = activePatient.id;
      runClinicalDiagnosticScan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activePatient?.id]);

  const runClinicalDiagnosticScan = async () => {
    setScanLoading(true);
    setAiSummary(null);
    setAiRisks(null);
    try {
      const patientContext = {
        id: activePatient?.id,
        name: activePatient?.name,
        age: activePatient?.age,
        gender: activePatient?.gender,
        bloodGroup: activePatient?.bloodGroup,
        allergyStatus: activePatient?.allergyStatus,
        medicalAlerts: activePatient?.medicalAlerts,
        currentTreatment: activePatient?.currentTreatment,
        medicalHistory: medicalConditions,
        medications: activePatient?.medications?.join(', ') || 'None logged',
        chiefComplaint,
        prevDentalTreatment: 'Compromised dentition',
        prevProsthodonticTreatment: 'Crowns and bridges history',
        implantHistory: 'Ridge healing complete',
        oralHygieneAssessment: 'Moderate',
        cariesRisk: 'Low',
        periodontalStatus: 'Stable',
        occlusionNotes: 'Group function',
        clinicalNotesList: [],
        treatmentPlans: [],
        uploadedFiles: []
      };

      const [summaryRes, risksRes] = await Promise.all([
        fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "clinical_summary", patientContext })
        }),
        fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "risk_detection", patientContext })
        })
      ]);

      if (summaryRes.ok) {
        const sData = await summaryRes.json();
        setAiSummary(sData.text);
      }
      if (risksRes.ok) {
        const rData = await risksRes.json();
        setAiRisks(rData.text);
      }
    } catch (err) {
      console.error("AI diagnostics scan failed", err);
    } finally {
      setScanLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const patientContext = {
        id: activePatient?.id,
        name: activePatient?.name,
        age: activePatient?.age,
        gender: activePatient?.gender,
        medicalAlerts: activePatient?.medicalAlerts,
        currentTreatment: activePatient?.currentTreatment,
        medicalHistory: medicalConditions,
        chiefComplaint
      };

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "copilot", patientContext, prompt: userMsg })
      });

      if (!res.ok) throw new Error("Failed to consult copilot");
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.text }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', text: `⚠️ connection error: ${e.message || "Unknown error"}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => { if (!open) onClose(); }}
      title="Clinical AI Engine"
      description={activePatient?.name}
      size="md"
      direction="end"
      actions={
        activeTab === 'chat' ? (
          <div className="w-full">
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type clinical question..."
                leftIcon={<Sparkles className="w-4 h-4" />}
                rightIcon={
                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    disabled={chatLoading || !chatInput.trim()}
                    className="p-1.5 rounded-lg"
                    aria-label="Send message"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                }
                aria-label="Clinical chat input"
              />
            </form>
          </div>
        ) : undefined
      }
    >
      {/* Sidebar Tabs Selector */}
      <div className="flex gap-1 p-1 rounded-xl border mb-5" style={{ borderColor: 'var(--velvet-border)', background: 'var(--velvet-surface-1)' }}>
        <Button
          variant={activeTab === 'diagnostics' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('diagnostics')}
          className="flex-1 py-1.5 rounded-lg text-center font-mono font-bold uppercase"
        >
          Clinical Panel
        </Button>
        <Button
          variant={activeTab === 'chat' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('chat')}
          className="flex-1 py-1.5 rounded-lg text-center font-mono font-bold uppercase"
        >
          Decision Chat
        </Button>
      </div>

      {activeTab === 'diagnostics' ? (
        <div className="space-y-5">
          {/* Action manual refresh trigger */}
          <Card variant="elevated" hover={false} className="flex justify-between items-center p-2.5 rounded-2xl">
            <span className="text-2xs text-[var(--velvet-text-muted)] font-medium">Automatic clinical metrics active.</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={runClinicalDiagnosticScan}
              disabled={scanLoading}
            >
              <RefreshCw className={`w-3 h-3 ${scanLoading ? 'animate-spin' : ''}`} /> Refresh Scan
            </Button>
          </Card>

          {/* Core parameters metrics */}
          <div className="space-y-3.5">
            {/* Chief Complaint */}
            <Card variant="elevated" hover={false} className="p-3 rounded-2xl">
              <span className="text-2xs text-[var(--velvet-text-muted)] font-mono font-bold uppercase block mb-1">Chief Complaint</span>
              <p className="text-xs text-[var(--velvet-text)] font-medium">{chiefComplaint || "No complaint logged."}</p>
            </Card>

            {/* Medical Alerts & Allergies */}
            <div className="grid grid-cols-2 gap-3">
              <Card variant="elevated" hover={false} className="p-3 rounded-2xl">
                <span className="text-2xs text-[var(--velvet-text-muted)] font-mono font-bold uppercase block mb-1">Medical Alerts</span>
                <div className="flex items-center gap-1.5 text-xs text-[var(--velvet-error)] font-mono mt-0.5">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{activePatient?.medicalAlerts?.filter(a => a !== 'None').join(', ') || 'None'}</span>
                </div>
              </Card>
              <Card variant="elevated" hover={false} className="p-3 rounded-2xl">
                <span className="text-2xs text-[var(--velvet-text-muted)] font-mono font-bold uppercase block mb-1">Drug Allergies</span>
                <div className="flex items-center gap-1.5 text-xs text-[var(--velvet-warning)] font-mono mt-0.5">
                  <Heart className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{medicalAllergies || 'No allergies logged'}</span>
                </div>
              </Card>
            </div>

            {/* Balance, Procedures, Appointments */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <Card variant="elevated" hover={false} className="p-2 rounded-2xl">
                <span className="text-2xs text-[var(--velvet-text-muted)] font-mono uppercase block">Balance</span>
                <span className="font-bold text-[var(--velvet-warning)] font-mono mt-0.5 block">${outstandingBalance.toLocaleString()}</span>
              </Card>
              <Card variant="elevated" hover={false} className="p-2 rounded-2xl">
                <span className="text-2xs text-[var(--velvet-text-muted)] font-mono uppercase block">Pending</span>
                <span className="font-bold text-[var(--velvet-text-sub)] font-mono mt-0.5 block">{pendingProceduresCount} tx</span>
              </Card>
              <Card variant="elevated" hover={false} className="p-2 rounded-2xl">
                <span className="text-2xs text-[var(--velvet-text-muted)] font-mono uppercase block">Next Visit</span>
                <span className="font-bold text-[var(--velvet-accent)] font-mono mt-0.5 block truncate max-w-[80px]" title={upcomingAppointmentText}>
                  {upcomingAppointmentText.split(' ')[0] || 'None'}
                </span>
              </Card>
            </div>

            {/* AI recent summary generated output */}
            <Card variant="elevated" hover={false} className="p-3.5 rounded-xl space-y-2">
              <span className="text-2xs text-[var(--velvet-text-muted)] font-mono font-bold uppercase block border-b pb-1.5" style={{ borderColor: 'var(--velvet-border)' }}>AI Clinical Summary</span>
              {scanLoading ? (
                <div className="text-[var(--velvet-text-muted)] text-xs py-4 animate-pulse">Running diagnostic synthesis...</div>
              ) : aiSummary ? (
                <div className="text-xs text-[var(--velvet-text-sub)] leading-relaxed font-mono whitespace-pre-line prose-invert">
                  {aiSummary}
                </div>
              ) : (
                <span className="text-[var(--velvet-text-muted)] text-xs block py-2">No summary compiled. Click Refresh Scan to run analysis.</span>
              )}
            </Card>

            {/* AI Risk indicators generated output */}
            <Card variant="elevated" hover={false} className="p-3.5 rounded-xl space-y-2">
              <span className="text-2xs text-[var(--velvet-text-muted)] font-mono font-bold uppercase block border-b pb-1.5" style={{ borderColor: 'var(--velvet-border)' }}>Systemic Contraindications & Risks</span>
              {scanLoading ? (
                <div className="text-[var(--velvet-text-muted)] text-xs py-4 animate-pulse">Running drug/implant safety checks...</div>
              ) : aiRisks ? (
                <div className="text-xs text-[var(--velvet-text-sub)] leading-relaxed font-mono whitespace-pre-line prose-invert">
                  {aiRisks}
                </div>
              ) : (
                <span className="text-[var(--velvet-text-muted)] text-xs block py-2">No safety warnings compiled. Click Refresh Scan.</span>
              )}
            </Card>
          </div>
        </div>
      ) : (
        /* Chat view */
        <div className="space-y-4 flex flex-col justify-end min-h-[400px]">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <span className="text-2xs font-mono text-[var(--velvet-text-muted)] mb-0.5">{msg.role === 'user' ? 'Dentist' : 'Copilot'}</span>
              <div className={`p-3 rounded-3xl max-w-[90%] text-xs leading-relaxed whitespace-pre-line ${
                msg.role === 'user'
                  ? 'text-[var(--velvet-text)] rounded-te-none'
                  : 'border rounded-ts-none font-mono text-[var(--velvet-text-sub)]'
              }`}
                style={msg.role === 'user'
                  ? { background: 'var(--velvet-accent-glow2)', border: '1px solid var(--velvet-border-strong)' }
                  : { background: 'var(--velvet-surface-1)', borderColor: 'var(--velvet-border)' }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex flex-col items-start">
              <span className="text-2xs font-mono text-[var(--velvet-text-muted)] mb-0.5">Copilot</span>
              <div className="p-3 rounded-3xl border rounded-ts-none text-xs text-[var(--velvet-accent)] font-mono animate-pulse" style={{ background: 'var(--velvet-surface-1)', borderColor: 'var(--velvet-border)' }}>
                Scribing clinical correlations...
              </div>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
