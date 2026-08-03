'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Heart, FileText, Lock, Plus, Sparkles, Unlock } from 'lucide-react';
import { clinicalService, ClinicalNote } from '../../../utils/services/clinicalService';
import { Patient } from '../PatientWorkspace';

interface SoapNoteEditorProps {
  supabase: any;
  activePatient: Patient;
  demoMode: boolean;
  activeTooth?: number | null;
  activeToothStatus?: string | null;
}

export default function SoapNoteEditor({
  supabase,
  activePatient,
  demoMode,
  activeTooth = null,
  activeToothStatus = null
}: SoapNoteEditorProps) {
  const queryClient = useQueryClient();
  const t = useTranslations('PatientWorkspace');

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // SOAP Draft state
  const [soapTitle, setSoapTitle] = useState('SOAP Clinical Note Draft');
  const [soapSubjective, setSoapSubjective] = useState('');
  const [soapObjective, setSoapObjective] = useState('');
  const [soapAssessment, setSoapAssessment] = useState('');
  const [soapPlan, setSoapPlan] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Query
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['clinicalNotes', activePatient.id],
    queryFn: () => clinicalService.getClinicalNotes(supabase, activePatient.id, demoMode),
    enabled: !!activePatient.id
  });

  // Mutation
  const saveNotesMutation = useMutation({
    mutationFn: (newNotes: ClinicalNote[]) =>
      clinicalService.saveClinicalNotes(supabase, activePatient.id, newNotes, demoMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinicalNotes', activePatient.id] });
      setIsCreating(false);
      setSelectedNoteId(null);
    }
  });

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    const newNote: ClinicalNote = {
      id: `NOTE-${Date.now()}`,
      title: soapTitle,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      author: activePatient.primaryDoctor || 'Dr. Ahmed',
      locked: false,
      soap: {
        subjective: soapSubjective,
        objective: soapObjective,
        assessment: soapAssessment,
        plan: soapPlan
      },
      attachments: []
    };
    saveNotesMutation.mutate([newNote, ...notes]);
  };

  const handleLockNote = (noteId: string) => {
    if (confirm(t('lock_confirm'))) {
      const updated = notes.map(n => n.id === noteId ? { ...n, locked: true } : n);
      saveNotesMutation.mutate(updated);
    }
  };

  const handleAiScribe = async () => {
    setAiLoading(true);
    try {
      const patientContext = {
        name: activePatient.name,
        age: activePatient.age,
        gender: activePatient.gender,
        medicalHistory: activePatient.medicalHistory?.join(', ') || 'None',
        currentTreatment: activePatient.currentTreatment
      };

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "soap",
          patientContext,
          prompt: activeTooth 
            ? `Create a clean diagnostic clinical SOAP note for tooth #${activeTooth} which currently presents with status: ${activeToothStatus || 'decayed'}.`
            : `Create a clean diagnostic crown preparation SOAP note for tooth #11.`
        })
      });

      if (!res.ok) throw new Error("AI scribe connection failed");
      const data = await res.json();
      const text = data.text as string;

      // Extract SOAP sections from markdown
      const subjectiveMatch = text.match(/SUBJECTIVE([\s\S]*?)(?=OBJECTIVE|ASSESSMENT|PLAN|$)/i);
      const objectiveMatch = text.match(/OBJECTIVE([\s\S]*?)(?=SUBJECTIVE|ASSESSMENT|PLAN|$)/i);
      const assessmentMatch = text.match(/ASSESSMENT([\s\S]*?)(?=SUBJECTIVE|OBJECTIVE|PLAN|$)/i);
      const planMatch = text.match(/PLAN([\s\S]*?)(?=SUBJECTIVE|OBJECTIVE|ASSESSMENT|$)/i);

      if (subjectiveMatch) setSoapSubjective(subjectiveMatch[1].replace(/^[#\s:-]+/, '').trim());
      if (objectiveMatch) setSoapObjective(objectiveMatch[1].replace(/^[#\s:-]+/, '').trim());
      if (assessmentMatch) setSoapAssessment(assessmentMatch[1].replace(/^[#\s:-]+/, '').trim());
      if (planMatch) setSoapPlan(planMatch[1].replace(/^[#\s:-]+/, '').trim());

    } catch (err) {
      console.error(err);
      alert("AI Scribing failed to connect to Gemini endpoints.");
    } finally {
      setAiLoading(false);
    }
  };

  const activeNote = notes.find(n => n.id === selectedNoteId) || notes[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Left panel notes logs (Col span 4) */}
      <div className="md:col-span-4 space-y-4">
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">{t('soap_records_log')}</span>
            <button
              onClick={() => {
                setSoapTitle(`SOAP note - ${new Date().toLocaleDateString()}`);
                setSoapSubjective('');
                setSoapObjective('');
                setSoapAssessment('');
                setSoapPlan('');
                setIsCreating(true);
              }}
              className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-emerald-400 hover:text-emerald-300 transition-colors"
              title="Add New Note Draft"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          {isLoading ? (
            <div className="text-zinc-500 text-xs py-4 animate-pulse">Loading notes...</div>
          ) : notes.length === 0 ? (
            <p className="text-zinc-500 text-[11px] py-4">{t('no_soap_records')}</p>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin pr-1">
              {notes.map(n => (
                <button
                  key={n.id}
                  onClick={() => {
                    setIsCreating(false);
                    setSelectedNoteId(n.id);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex justify-between items-center ${
                    (!isCreating && (selectedNoteId === n.id || (!selectedNoteId && notes[0].id === n.id)))
                      ? 'bg-zinc-900 border-zinc-850 text-white'
                      : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="text-[9px] font-mono text-zinc-500 block">{n.timestamp}</span>
                    <h4 className="font-bold truncate mt-0.5">{n.title}</h4>
                  </div>
                  {n.locked ? (
                    <Lock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right panel SOAP drafting & displays (Col span 8) */}
      <div className="md:col-span-8">
        {isCreating ? (
          /* Creating Form */
          <form onSubmit={handleCreateNote} className="p-5 rounded-2xl border border-zinc-900 bg-zinc-950/20 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">{t('draft_soap_title')}</h3>
              <button
                type="button"
                onClick={handleAiScribe}
                disabled={aiLoading}
                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/10"
              >
                <Sparkles className="w-3 h-3" /> {aiLoading ? t('ai_scribe_scribing') : t('ai_scribe_draft')}
              </button>
            </div>
            <div className="space-y-3 text-xs">
              {activeTooth && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex justify-between items-center text-xs">
                  <span className="text-zinc-300">
                    {t('selected_tooth_indicator', { defaultValue: 'Linked Charting Point' })}: 
                    <strong className="text-emerald-400 ml-1">Tooth #{activeTooth} ({activeToothStatus})</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSoapTitle(`SOAP note - Tooth #${activeTooth}`);
                    }}
                    className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-[10px] text-emerald-400 rounded hover:bg-zinc-800 transition-colors"
                  >
                    {t('btn_use_title', { defaultValue: 'Use as Title' })}
                  </button>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-zinc-400">{t('note_title')}</label>
                <input
                  type="text"
                  value={soapTitle}
                  onChange={(e) => setSoapTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400">{t('label_subjective')}</label>
                <textarea
                  value={soapSubjective}
                  onChange={(e) => setSoapSubjective(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400">{t('label_objective')}</label>
                <textarea
                  value={soapObjective}
                  onChange={(e) => setSoapObjective(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400">{t('label_assessment')}</label>
                <textarea
                  value={soapAssessment}
                  onChange={(e) => setSoapAssessment(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400">{t('label_plan')}</label>
                <textarea
                  value={soapPlan}
                  onChange={(e) => setSoapPlan(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-zinc-900 pt-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveNotesMutation.isPending}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs"
              >
                {t('btn_save_soap')}
              </button>
            </div>
          </form>
        ) : !activeNote ? (
          <div className="p-8 rounded-2xl border border-zinc-900 bg-zinc-950/20 text-center text-zinc-500 text-xs">
            No SOAP records selected. Create one using the left panel.
          </div>
        ) : (
          /* View Note Details */
          <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-950/20 space-y-4">
            <div className="flex justify-between items-start border-b border-zinc-900/60 pb-3">
              <div>
                <span className="text-[9px] font-mono text-zinc-500">{t('record_id')}: {activeNote.id} • Dr. {activeNote.author}</span>
                <h3 className="text-sm font-bold text-white mt-0.5">{activeNote.title}</h3>
                <p className="text-[10px] text-zinc-400 mt-0.5">{activeNote.timestamp}</p>
              </div>
              {!activeNote.locked && (
                <button
                  onClick={() => handleLockNote(activeNote.id)}
                  className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-rose-400 hover:text-rose-300 text-[10px] font-bold flex items-center gap-1 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" /> {t('lock_note')}
                </button>
              )}
            </div>

            {/* SOAP Sections */}
            <div className="space-y-4 text-xs font-sans text-left">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-1">Subjective</span>
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 text-zinc-300 leading-relaxed font-sans">
                  {activeNote.soap?.subjective || t('placeholder_subjective')}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-1">Objective</span>
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 text-zinc-300 leading-relaxed font-sans">
                  {activeNote.soap?.objective || t('placeholder_objective')}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-1">Assessment</span>
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 text-zinc-300 leading-relaxed font-sans">
                  {activeNote.soap?.assessment || t('placeholder_assessment')}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-1">Plan</span>
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 text-zinc-300 leading-relaxed font-sans">
                  {activeNote.soap?.plan || t('placeholder_plan')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
