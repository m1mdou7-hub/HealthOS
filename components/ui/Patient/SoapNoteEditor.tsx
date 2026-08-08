'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Heart, FileText, Lock, Plus, Sparkles, Unlock } from 'lucide-react';
import { clinicalService, ClinicalNote } from '../../../utils/services/clinicalService';
import { Patient } from '../PatientWorkspace';
import { Button, Card, Input, Skeleton, Textarea } from '@/components/ui/design-system';

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
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-start">
      {/* Left panel notes logs (Col span 4) */}
      <div className="md:col-span-4 space-y-4">
        <Card variant="elevated" hover={false} className="p-4 rounded-2xl flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-2xs font-mono text-[var(--velvet-text-muted)] uppercase tracking-widest font-bold">{t('soap_records_log')}</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSoapTitle(`SOAP note - ${new Date().toLocaleDateString()}`);
                setSoapSubjective('');
                setSoapObjective('');
                setSoapAssessment('');
                setSoapPlan('');
                setIsCreating(true);
              }}
              className="p-1 rounded-lg text-[var(--velvet-success)]"
              title="Add New Note Draft"
              aria-label="Add New Note Draft"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : notes.length === 0 ? (
            <p className="text-[var(--velvet-text-muted)] text-xs py-4">{t('no_soap_records')}</p>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin pe-1">
              {notes.map(n => (
                <button
                  key={n.id}
                  onClick={() => {
                    setIsCreating(false);
                    setSelectedNoteId(n.id);
                  }}
                  className={`w-full text-start p-3 rounded-xl border transition-all text-xs flex justify-between items-center ${
                    (!isCreating && (selectedNoteId === n.id || (!selectedNoteId && notes[0].id === n.id)))
                      ? 'bg-[var(--velvet-surface-2)] border-[var(--velvet-border-strong)] text-[var(--velvet-text)]'
                      : 'bg-[var(--velvet-surface-1)] border-[var(--velvet-border)] text-[var(--velvet-text-muted)] hover:bg-[var(--velvet-surface-2)]'
                  }`}
                >
                  <div className="truncate pe-2">
                    <span className="text-2xs font-mono text-[var(--velvet-text-muted)] block">{n.timestamp}</span>
                    <h4 className="font-bold truncate mt-0.5">{n.title}</h4>
                  </div>
                  {n.locked ? (
                    <Lock className="w-3.5 h-3.5 text-[var(--velvet-text-muted)] shrink-0" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5 text-[var(--velvet-success)] shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Right panel SOAP drafting & displays (Col span 8) */}
      <div className="md:col-span-8">
        {isCreating ? (
          /* Creating Form */
          <Card variant="elevated" hover={false} className="p-5 rounded-3xl space-y-4">
            <form onSubmit={handleCreateNote} className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: 'var(--velvet-border)' }}>
                <h3 className="text-xs font-bold text-[var(--velvet-text)] uppercase font-mono tracking-wider">{t('draft_soap_title')}</h3>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleAiScribe}
                  disabled={aiLoading}
                  className="text-2xs"
                >
                  <Sparkles className="w-3 h-3" /> {aiLoading ? t('ai_scribe_scribing') : t('ai_scribe_draft')}
                </Button>
              </div>
              <div className="space-y-3 text-xs">
                {activeTooth && (
                  <div className="p-3 bg-[var(--velvet-success-bg)] border border-[var(--velvet-success-border)] rounded-xl flex justify-between items-center text-xs">
                    <span className="text-[var(--velvet-text-sub)]">
                      {t('selected_tooth_indicator', { defaultValue: 'Linked Charting Point' })}: 
                      <strong className="text-[var(--velvet-success)] ms-1">Tooth #{activeTooth} ({activeToothStatus})</strong>
                    </span>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSoapTitle(`SOAP note - Tooth #${activeTooth}`);
                      }}
                      className="px-2 py-0.5 text-2xs text-[var(--velvet-success)]"
                    >
                      {t('btn_use_title', { defaultValue: 'Use as Title' })}
                    </Button>
                  </div>
                )}
                <div className="space-y-3">
                  <Input
                    label={t('note_title')}
                    value={soapTitle}
                    onChange={(e) => setSoapTitle(e.target.value)}
                    required
                  />
                  <Textarea
                    label={t('label_subjective')}
                    value={soapSubjective}
                    onChange={(e) => setSoapSubjective(e.target.value)}
                    rows={2}
                  />
                  <Textarea
                    label={t('label_objective')}
                    value={soapObjective}
                    onChange={(e) => setSoapObjective(e.target.value)}
                    rows={2}
                  />
                  <Textarea
                    label={t('label_assessment')}
                    value={soapAssessment}
                    onChange={(e) => setSoapAssessment(e.target.value)}
                    rows={2}
                  />
                  <Textarea
                    label={t('label_plan')}
                    value={soapPlan}
                    onChange={(e) => setSoapPlan(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t pt-3" style={{ borderColor: 'var(--velvet-border)' }}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={saveNotesMutation.isPending}
                  className="text-xs font-bold"
                  style={{ background: 'var(--velvet-success)', color: 'var(--velvet-text-inverse)', borderColor: 'var(--velvet-success-border)' }}
                >
                  {t('btn_save_soap')}
                </Button>
              </div>
            </form>
          </Card>
        ) : !activeNote ? (
          <Card variant="elevated" hover={false} className="p-8 rounded-3xl text-center text-xs text-[var(--velvet-text-muted)]">
            No SOAP records selected. Create one using the left panel.
          </Card>
        ) : (
          /* View Note Details */
          <Card variant="elevated" hover={false} className="p-5 rounded-3xl space-y-4">
            <div className="flex justify-between items-start border-b pb-3" style={{ borderColor: 'var(--velvet-border)' }}>
              <div>
                <span className="text-2xs font-mono text-[var(--velvet-text-muted)]">{t('record_id')}: {activeNote.id} • Dr. {activeNote.author}</span>
                <h3 className="text-sm font-bold text-[var(--velvet-text)] mt-0.5">{activeNote.title}</h3>
                <p className="text-2xs text-[var(--velvet-text-muted)] mt-0.5">{activeNote.timestamp}</p>
              </div>
              {!activeNote.locked && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleLockNote(activeNote.id)}
                  className="text-2xs"
                >
                  <Lock className="w-3.5 h-3.5" /> {t('lock_note')}
                </Button>
              )}
            </div>

            {/* SOAP Sections */}
            <div className="space-y-4 text-xs font-sans text-start">
              <div>
                <span className="text-2xs font-mono font-bold text-[var(--velvet-success)] uppercase tracking-wider block mb-1">Subjective</span>
                <div className="p-3 bg-[var(--velvet-surface-1)] rounded-xl border border-[var(--velvet-border)] text-[var(--velvet-text-sub)] leading-relaxed font-sans">
                  {activeNote.soap?.subjective || t('placeholder_subjective')}
                </div>
              </div>
              <div>
                <span className="text-2xs font-mono font-bold text-[var(--velvet-success)] uppercase tracking-wider block mb-1">Objective</span>
                <div className="p-3 bg-[var(--velvet-surface-1)] rounded-xl border border-[var(--velvet-border)] text-[var(--velvet-text-sub)] leading-relaxed font-sans">
                  {activeNote.soap?.objective || t('placeholder_objective')}
                </div>
              </div>
              <div>
                <span className="text-2xs font-mono font-bold text-[var(--velvet-success)] uppercase tracking-wider block mb-1">Assessment</span>
                <div className="p-3 bg-[var(--velvet-surface-1)] rounded-xl border border-[var(--velvet-border)] text-[var(--velvet-text-sub)] leading-relaxed font-sans">
                  {activeNote.soap?.assessment || t('placeholder_assessment')}
                </div>
              </div>
              <div>
                <span className="text-2xs font-mono font-bold text-[var(--velvet-success)] uppercase tracking-wider block mb-1">Plan</span>
                <div className="p-3 bg-[var(--velvet-surface-1)] rounded-xl border border-[var(--velvet-border)] text-[var(--velvet-text-sub)] leading-relaxed font-sans">
                  {activeNote.soap?.plan || t('placeholder_plan')}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
