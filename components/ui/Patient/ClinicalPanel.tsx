import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Send, ShieldAlert, Heart, Activity, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Patient } from '../PatientWorkspace';

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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Right Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-[#0d0d16] border-l border-zinc-900 z-50 shadow-2xl flex flex-col text-left backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-zinc-900 bg-zinc-900/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-mono">Clinical AI Engine</h4>
                  <p className="text-[9px] text-zinc-500 font-semibold uppercase font-mono tracking-wider">{activePatient?.name}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sidebar Tabs Selector */}
            <div className="flex border-b border-zinc-900 bg-zinc-950 p-1.5 gap-1 text-[11px] font-mono font-bold uppercase shrink-0">
              <button
                onClick={() => setActiveTab('diagnostics')}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                  activeTab === 'diagnostics' ? 'bg-zinc-900 text-purple-400' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Clinical Panel
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                  activeTab === 'chat' ? 'bg-zinc-900 text-purple-400' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Decision Chat
              </button>
            </div>

            {/* Content Drawer */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
              {activeTab === 'diagnostics' ? (
                <>
                  {/* Action manual refresh trigger */}
                  <div className="flex justify-between items-center p-2.5 card-elevated rounded-2xl">
                    <span className="text-[10px] text-zinc-400 font-medium">Automatic clinical metrics active.</span>
                    <button
                      onClick={runClinicalDiagnosticScan}
                      disabled={scanLoading}
                      className="btn-secondary px-2.5 py-1 rounded-lg text-[10px] disabled:opacity-40"
                    >
                      <RefreshCw className={`w-3 h-3 ${scanLoading ? 'animate-spin' : ''}`} /> Refresh Scan
                    </button>
                  </div>

                  {/* Core parameters metrics */}
                  <div className="space-y-3.5">
                    {/* Chief Complaint */}
                    <div className="p-3 card-elevated rounded-2xl">
                      <span className="text-[9px] text-zinc-500 font-mono font-bold uppercase block mb-1">Chief Complaint</span>
                      <p className="text-xs text-white font-medium">{chiefComplaint || "No complaint logged."}</p>
                    </div>

                    {/* Medical Alerts & Allergies */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 card-elevated rounded-2xl">
                        <span className="text-[9px] text-zinc-500 font-mono font-bold uppercase block mb-1">Medical Alerts</span>
                        <div className="flex items-center gap-1.5 text-xs text-red-400 font-mono mt-0.5">
                          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{activePatient?.medicalAlerts?.filter(a => a !== 'None').join(', ') || 'None'}</span>
                        </div>
                      </div>
                      <div className="p-3 card-elevated rounded-2xl">
                        <span className="text-[9px] text-zinc-500 font-mono font-bold uppercase block mb-1">Drug Allergies</span>
                        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono mt-0.5">
                          <Heart className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{medicalAllergies || 'No allergies logged'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Balance, Procedures, Appointments */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 card-elevated rounded-2xl">
                        <span className="text-[8px] text-zinc-500 font-mono uppercase block">Balance</span>
                        <span className="font-bold text-amber-400 font-mono mt-0.5 block">${outstandingBalance.toLocaleString()}</span>
                      </div>
                      <div className="p-2 card-elevated rounded-2xl">
                        <span className="text-[8px] text-zinc-500 font-mono uppercase block">Pending</span>
                        <span className="font-bold text-zinc-300 font-mono mt-0.5 block">{pendingProceduresCount} tx</span>
                      </div>
                      <div className="p-2 card-elevated rounded-2xl">
                        <span className="text-[8px] text-zinc-500 font-mono uppercase block">Next Visit</span>
                        <span className="font-bold text-purple-400 font-mono mt-0.5 block truncate max-w-[80px]" title={upcomingAppointmentText}>
                          {upcomingAppointmentText.split(' ')[0] || 'None'}
                        </span>
                      </div>
                    </div>

                    {/* AI recent summary generated output */}
                    <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-900 space-y-2">
                      <span className="text-[9px] text-zinc-500 font-mono font-bold uppercase block border-b border-zinc-900 pb-1.5">AI Clinical Summary</span>
                      {scanLoading ? (
                        <div className="text-zinc-500 text-xs py-4 animate-pulse">Running diagnostic synthesis...</div>
                      ) : aiSummary ? (
                        <div className="text-xs text-zinc-300 leading-relaxed font-mono whitespace-pre-line prose-invert">
                          {aiSummary}
                        </div>
                      ) : (
                        <span className="text-zinc-500 text-[11px] block py-2">No summary compiled. Click Refresh Scan to run analysis.</span>
                      )}
                    </div>

                    {/* AI Risk indicators generated output */}
                    <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-900 space-y-2">
                      <span className="text-[9px] text-zinc-500 font-mono font-bold uppercase block border-b border-zinc-900 pb-1.5">Systemic Contraindications & Risks</span>
                      {scanLoading ? (
                        <div className="text-zinc-500 text-xs py-4 animate-pulse">Running drug/implant safety checks...</div>
                      ) : aiRisks ? (
                        <div className="text-xs text-zinc-300 leading-relaxed font-mono whitespace-pre-line prose-invert">
                          {aiRisks}
                        </div>
                      ) : (
                        <span className="text-zinc-500 text-[11px] block py-2">No safety warnings compiled. Click Refresh Scan.</span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* Chat view */
                <div className="space-y-4 flex flex-col justify-end min-h-[400px]">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[9px] font-mono text-zinc-500 mb-0.5">{msg.role === 'user' ? 'Dentist' : 'Copilot'}</span>
                      <div className={`p-3 rounded-3xl max-w-[90%] text-xs leading-relaxed whitespace-pre-line ${
                        msg.role === 'user'
                          ? 'bg-purple-600 text-white rounded-tr-none'
                          : 'bg-zinc-900 text-zinc-300 border border-zinc-850 rounded-tl-none font-mono'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex flex-col items-start">
                      <span className="text-[9px] font-mono text-zinc-500 mb-0.5">Copilot</span>
                      <div className="p-3 rounded-3xl bg-zinc-900 border border-zinc-850 rounded-tl-none text-xs text-purple-400 font-mono animate-pulse">
                        Scribing clinical correlations...
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Chat Input footer in Chat Tab */}
            {activeTab === 'chat' && (
              <div className="p-4 border-t border-zinc-900 bg-zinc-950 shrink-0">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type clinical question..."
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-purple-500/50"
                  />
                  <button
                    disabled={chatLoading || !chatInput.trim()}
                    onClick={handleSendMessage}
                    className="absolute right-2 p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white transition-all active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
