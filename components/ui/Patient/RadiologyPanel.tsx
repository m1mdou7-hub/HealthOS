'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { SupabaseClient } from '@supabase/supabase-js';
import { Layers, Eye, Plus, Sun, Contrast, RefreshCw } from 'lucide-react';
import { clinicalService } from '../../../utils/services/clinicalService';
import { Patient } from '../PatientWorkspace';
import { Button, Card, Modal, Select, Input, Badge, Skeleton, Alert } from '@/components/ui/design-system';

interface RadiologyPanelProps {
  supabase: SupabaseClient;
  activePatient: Patient;
  demoMode: boolean;
}

export default function RadiologyPanel({ supabase, activePatient, demoMode }: RadiologyPanelProps) {
  const queryClient = useQueryClient();
  const t = useTranslations('PatientWorkspace');

  const [showAddStudyModal, setShowAddStudyModal] = useState(false);
  const [studyName, setStudyName] = useState('');
  const [studyCategory, setStudyCategory] = useState<'CBCT' | 'Radiograph'>('CBCT');

  // PACS Viewer Simulator states
  const [selectedStudy, setSelectedStudy] = useState<any | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [invertColors, setInvertColors] = useState(false);
  const [canalOverlay, setCanalOverlay] = useState(false);
  const [cariesOverlay, setCariesOverlay] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<{ x: number; y: number }[]>([]);
  const [measuredDistance, setMeasuredDistance] = useState<number | null>(null);

  const imageContainerRef = useRef<HTMLDivElement | null>(null);

  // Query
  const { data: gallery = [], isLoading } = useQuery({
    queryKey: ['imagingGallery', activePatient.id],
    queryFn: () => clinicalService.getImagingGallery(supabase, activePatient.id, demoMode),
    enabled: !!activePatient.id
  });

  // Mutation
  const saveGalleryMutation = useMutation({
    mutationFn: (newGallery: any[]) =>
      clinicalService.saveImagingGallery(supabase, activePatient.id, newGallery, demoMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imagingGallery', activePatient.id] });
      setShowAddStudyModal(false);
      setStudyName('');
    }
  });

  const radiologyStudies = gallery.filter((img: any) => img.category === 'CBCT' || img.category === 'Radiograph');

  const handleAddStudy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studyName.trim()) return;

    const newStudy = {
      id: `img-${Date.now()}`,
      name: studyName,
      category: studyCategory,
      url: '/placeholder-imaging.jpg',
      date: new Date().toISOString().split('T')[0]
    };

    saveGalleryMutation.mutate([newStudy, ...gallery]);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    if (measurePoints.length >= 2) {
      // Clear points on 3rd click
      setMeasurePoints([{ x, y }]);
      setMeasuredDistance(null);
    } else {
      const newPoints = [...measurePoints, { x, y }];
      setMeasurePoints(newPoints);

      if (newPoints.length === 2) {
        // Calculate dynamic millimeter distance: distance_px * calibration_factor (e.g. 0.15mm per pixel/percentage)
        const dx = newPoints[1].x - newPoints[0].x;
        const dy = newPoints[1].y - newPoints[0].y;
        const distance = Math.round(Math.sqrt(dx * dx + dy * dy) * 0.28 * 10) / 10;
        setMeasuredDistance(distance);
      }
    }
  };

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setInvertColors(false);
    setCanalOverlay(false);
    setCariesOverlay(false);
    setMeasurePoints([]);
    setMeasuredDistance(null);
  };

  return (
    <div className="space-y-6 text-start">
      {/* Header action panel */}
      <Card variant="elevated" hover={false} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-3xl gap-3">
        <div>
          <h3 className="text-sm font-bold text-[var(--velvet-text)] flex items-center gap-1.5 font-mono">
            <Layers className="w-4 h-4 text-[var(--velvet-success)] animate-pulse" /> {t('radio_lab_title')}
          </h3>
          <p className="text-xs text-[var(--velvet-text-muted)] mt-0.5">{t('radio_lab_desc')}</p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowAddStudyModal(true)}
          className="self-stretch sm:self-auto justify-center"
        >
          <Plus className="w-3.5 h-3.5" /> {t('btn_file_scan')}
        </Button>
      </Card>

      {/* Grid view of radiology scans */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} variant="card" />
          ))}
        </div>
      ) : radiologyStudies.length === 0 ? (
        <Card variant="elevated" hover={false} className="p-8 rounded-3xl text-center">
          <p className="text-xs text-[var(--velvet-text-muted)]">{t('no_scans_logged')}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {radiologyStudies.map((study: any) => (
            <Card key={study.id} variant="elevated" hover className="p-4 rounded-xl flex flex-col justify-between h-40">
              <div>
                <div className="flex justify-between items-center">
                  <Badge tone="info" className="text-2xs font-mono uppercase font-semibold">
                    {study.category} Study
                  </Badge>
                  <span className="text-2xs font-mono text-[var(--velvet-text-muted)]">{study.date}</span>
                </div>
                <h4 className="text-xs font-bold text-[var(--velvet-text)] mt-3 font-sans line-clamp-2">{study.name}</h4>
                <p className="text-2xs text-[var(--velvet-text-muted)] mt-1 font-mono">Status: DICOM Synced</p>
              </div>

              <div className="flex justify-end gap-2 border-t pt-2 mt-4" style={{ borderColor: 'var(--velvet-border)' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedStudy(study);
                    resetFilters();
                  }}
                >
                  <Eye className="w-3.5 h-3.5" /> {t('btn_launch_viewer')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Study Modal */}
      <Modal
        open={showAddStudyModal}
        onOpenChange={setShowAddStudyModal}
        title={t('btn_file_scan')}
        size="sm"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => setShowAddStudyModal(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              type="submit"
              form="add-study-form"
              loading={saveGalleryMutation.isPending}
            >
              {t('btn_record_study')}
            </Button>
          </>
        }
      >
        <form id="add-study-form" onSubmit={handleAddStudy} className="space-y-4 text-xs">
          <Input
            label={t('th_scan_desc')}
            value={studyName}
            onChange={(e) => setStudyName(e.target.value)}
            placeholder="e.g. Mandibular Ridge Segment Scan #36"
            required
          />
          <Select
            label={t('th_study_cat')}
            value={studyCategory}
            onChange={(e) => setStudyCategory(e.target.value as any)}
            options={[
              { value: 'CBCT', label: 'CBCT Double Arch Scan' },
              { value: 'Radiograph', label: 'Ridge Periapical Radiograph' }
            ]}
          />
        </form>
      </Modal>

      {/* PACS Interactive Workstation Modal */}
      <Modal
        open={!!selectedStudy}
        onOpenChange={(open) => { if (!open) setSelectedStudy(null); }}
        title={t('pacs_viewer_title')}
        description={t('pacs_viewer_desc')}
        size="full"
      >
        <div className="flex flex-col md:flex-row overflow-hidden gap-0">
          {/* Left Viewer (Col span 8) */}
          <div className="flex-1 bg-black flex flex-col items-center justify-center relative p-6 border-b md:border-b-0 md:border-e select-none" style={{ borderColor: 'var(--velvet-border)' }}>
            <div className="absolute top-4 start-4 z-10 flex gap-2">
              <Badge tone="info" className="text-2xs font-mono uppercase font-bold tracking-wider">
                PACS Workstation • {selectedStudy?.category} Mode
              </Badge>
              {measuredDistance !== null && (
                <Badge tone="success" className="text-2xs font-mono font-bold">
                  {t('pacs_measured_dist')} {measuredDistance} mm
                </Badge>
              )}
            </div>

            {/* Interactive Radiograph Canvas Simulator */}
            <div
              ref={imageContainerRef}
              onClick={handleImageClick}
              className="w-full max-w-2xl aspect-[4/3] rounded-xl border bg-[var(--velvet-surface)] relative overflow-hidden cursor-crosshair"
              style={{ borderColor: 'var(--velvet-border)' }}
            >
              {/* Visual stylized radiographic jaw background */}
              <div
                className="w-full h-full flex flex-col items-center justify-center transition-all duration-200"
                style={{
                  filter: `brightness(${brightness}%) contrast(${contrast}%) ${invertColors ? 'invert(100%)' : 'none'}`
                }}
              >
                <svg viewBox="0 0 400 300" className="w-full h-full">
                  <rect width="400" height="300" fill="#09090b" />
                  {/* Alveolar jaw bone curve */}
                  <path
                    d="M 50,220 Q 200,320 350,220"
                    fill="none"
                    stroke="#27272a"
                    strokeWidth="24"
                    strokeLinecap="round"
                    opacity="0.3"
                  />
                  <path
                    d="M 50,220 Q 200,320 350,220"
                    fill="none"
                    stroke="#3f3f46"
                    strokeWidth="12"
                    strokeLinecap="round"
                    opacity="0.2"
                  />

                  {/* Stylized teeth roots and caps */}
                  {Array.from({ length: 14 }).map((_, idx) => {
                    const x = 70 + idx * 20;
                    const y = 160 + Math.sin(idx * 0.5) * 15;
                    return (
                      <g key={idx} className="opacity-40">
                        {/* Crown */}
                        <rect x={x - 6} y={y - 12} width="12" height="12" rx="3" fill="#52525b" />
                        {/* Root */}
                        <line x1={x} y1={y} x2={x} y2={y + 18} stroke="#52525b" strokeWidth="2.5" />
                      </g>
                    );
                  })}

                  {/* Mandibular Canal tracing overlay */}
                  {canalOverlay && (
                    <path
                      d="M 55,232 Q 200,326 345,232"
                      fill="none"
                      stroke="var(--velvet-error)"
                      strokeWidth="3.5"
                      strokeDasharray="4 2"
                      className="animate-pulse"
                    />
                  )}

                  {/* Caries highlight overlay */}
                  {cariesOverlay && (
                    <g>
                      <circle cx="150" cy="162" r="9" fill="none" stroke="var(--velvet-warning)" strokeWidth="2" className="animate-ping" />
                      <circle cx="150" cy="162" r="6" fill="var(--velvet-warning)" opacity="0.3" />
                      <circle cx="270" cy="172" r="9" fill="none" stroke="var(--velvet-warning)" strokeWidth="2" className="animate-ping" />
                      <circle cx="270" cy="172" r="6" fill="var(--velvet-warning)" opacity="0.3" />
                    </g>
                  )}
                </svg>
              </div>

              {/* Interactive measurement dots and dashed ruler line */}
              {measurePoints.map((pt, i) => (
                <div
                  key={i}
                  className="absolute w-2.5 h-2.5 bg-[var(--velvet-success)] rounded-full border border-black -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${pt.x}%`, top: `${pt.y}%`, boxShadow: '0 0 0 1px rgba(0,0,0,0.8)' }}
                />
              ))}
              {measurePoints.length === 2 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line
                    x1={`${measurePoints[0].x}%`}
                    y1={`${measurePoints[0].y}%`}
                    x2={`${measurePoints[1].x}%`}
                    y2={`${measurePoints[1].y}%`}
                    stroke="var(--velvet-success)"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                </svg>
              )}
            </div>
          </div>

          {/* Right Controls Panel (Col span 4) */}
          <div className="w-full md:w-80 p-6 flex flex-col justify-between space-y-6" style={{ background: 'var(--velvet-surface-1)' }}>
            <div className="space-y-6 text-xs text-start">
              {/* Filter sliders */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-[var(--velvet-text-muted)]">
                    <span className="flex items-center gap-1"><Sun className="w-3.5 h-3.5" /> {t('pacs_brightness')}</span>
                    <span className="font-mono">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-[var(--velvet-success)]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[var(--velvet-text-muted)]">
                    <span className="flex items-center gap-1"><Contrast className="w-3.5 h-3.5" /> {t('pacs_contrast')}</span>
                    <span className="font-mono">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-[var(--velvet-success)]"
                  />
                </div>

                {/* Toggle controls */}
                <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--velvet-border)' }}>
                  <label className="flex items-center gap-2 cursor-pointer text-[var(--velvet-text-muted)] hover:text-[var(--velvet-text)] select-none">
                    <input
                      type="checkbox"
                      checked={invertColors}
                      onChange={(e) => setInvertColors(e.target.checked)}
                      className="rounded border-[var(--velvet-border)] bg-[var(--velvet-surface-2)] accent-[var(--velvet-success)]"
                    />
                    <span>{t('pacs_invert')}</span>
                  </label>
                </div>
              </div>

              {/* Clinical overlays */}
              <div className="space-y-2 pt-3 border-t" style={{ borderColor: 'var(--velvet-border)' }}>
                <span className="text-2xs font-mono text-[var(--velvet-text-muted)] font-bold uppercase tracking-wider block mb-1">Anatomical Overlays</span>

                <label className="flex items-center gap-2 cursor-pointer text-[var(--velvet-text-muted)] hover:text-[var(--velvet-text)] select-none">
                  <input
                    type="checkbox"
                    checked={canalOverlay}
                    onChange={(e) => setCanalOverlay(e.target.checked)}
                    className="rounded border-[var(--velvet-border)] bg-[var(--velvet-surface-2)] accent-[var(--velvet-error)]"
                  />
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[var(--velvet-error)] rounded-full" /> {t('pacs_canal_overlay')}
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[var(--velvet-text-muted)] hover:text-[var(--velvet-text)] select-none">
                  <input
                    type="checkbox"
                    checked={cariesOverlay}
                    onChange={(e) => setCariesOverlay(e.target.checked)}
                    className="rounded border-[var(--velvet-border)] bg-[var(--velvet-surface-2)] accent-[var(--velvet-warning)]"
                  />
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[var(--velvet-warning)] rounded-full" /> {t('pacs_caries_overlay')}
                  </span>
                </label>
              </div>

              {/* Calibration warning info */}
              <Alert
                tone="info"
                title="Calibration parameters"
                description={`Pixel Scale: 1px = 0.28mm · ${t('pacs_measure')}`}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 justify-center"
                onClick={resetFilters}
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </Button>
              <Button
                size="sm"
                className="flex-1 justify-center"
                onClick={() => setSelectedStudy(null)}
              >
                Close Viewer
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
