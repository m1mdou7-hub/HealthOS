'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { SupabaseClient } from '@supabase/supabase-js';
import { Layers, Eye, Plus, FileText, X, Sun, Contrast, RefreshCw, Scissors, ShieldAlert } from 'lucide-react';
import { clinicalService } from '../../../utils/services/clinicalService';
import { Patient } from '../PatientWorkspace';

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
    <div className="space-y-6 text-left">
      {/* Header action panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-900/10 p-4 rounded-2xl border border-zinc-900 gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono">
            <Layers className="w-4 h-4 text-emerald-400 animate-pulse" /> {t('radio_lab_title')}
          </h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">{t('radio_lab_desc')}</p>
        </div>
        <button
          onClick={() => setShowAddStudyModal(true)}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1 self-stretch sm:self-auto justify-center"
        >
          <Plus className="w-3.5 h-3.5" /> {t('btn_file_scan')}
        </button>
      </div>

      {/* Grid view of radiology scans */}
      {isLoading ? (
        <div className="text-zinc-500 text-xs text-center py-6 animate-pulse">Loading radiograph studies...</div>
      ) : radiologyStudies.length === 0 ? (
        <div className="text-zinc-500 text-xs text-center py-8 border border-zinc-900 rounded-2xl bg-zinc-950/20">
          {t('no_scans_logged')}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {radiologyStudies.map((study: any) => (
            <div key={study.id} className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900/20 hover:border-zinc-800 transition-all flex flex-col justify-between h-40">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-blue-400 uppercase font-semibold">
                    {study.category} Study
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500">{study.date}</span>
                </div>
                <h4 className="text-xs font-bold text-white mt-3 font-sans line-clamp-2">{study.name}</h4>
                <p className="text-[10px] text-zinc-500 mt-1 font-mono">Status: DICOM Synced</p>
              </div>

              <div className="flex justify-end gap-2 border-t border-zinc-900/60 pt-2 mt-4">
                <button
                  onClick={() => {
                    setSelectedStudy(study);
                    resetFilters();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-white text-[10px] font-semibold flex items-center gap-1 border border-zinc-800 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> {t('btn_launch_viewer')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Study Modal */}
      {showAddStudyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddStudy} className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl w-full max-w-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white border-b border-zinc-900 pb-2">{t('btn_file_scan')}</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">{t('th_scan_desc')}</label>
                <input
                  type="text"
                  value={studyName}
                  onChange={(e) => setStudyName(e.target.value)}
                  placeholder="e.g. Mandibular Ridge Segment Scan #36"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">{t('th_study_cat')}</label>
                <select
                  value={studyCategory}
                  onChange={(e) => setStudyCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
                >
                  <option value="CBCT">CBCT Double Arch Scan</option>
                  <option value="Radiograph">Ridge Periapical Radiograph</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-zinc-900 pt-3">
              <button
                type="button"
                onClick={() => setShowAddStudyModal(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveGalleryMutation.isPending}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
              >
                {t('btn_record_study')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PACS Interactive Workstation Modal */}
      {selectedStudy && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col md:flex-row overflow-hidden shadow-2xl">
            {/* Left Viewer (Col span 8) */}
            <div className="flex-1 bg-black flex flex-col items-center justify-center relative p-6 border-b md:border-b-0 md:border-r border-zinc-900 select-none">
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <span className="text-[9px] font-mono bg-zinc-950/80 border border-zinc-900 px-2.5 py-1 rounded text-blue-400 uppercase font-bold tracking-wider">
                  PACS Workstation • {selectedStudy.category} Mode
                </span>
                {measuredDistance !== null && (
                  <span className="text-[9px] font-mono bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded text-emerald-400 font-bold">
                    {t('pacs_measured_dist')} {measuredDistance} mm
                  </span>
                )}
              </div>

              {/* Interactive Radiograph Canvas Simulator */}
              <div
                ref={imageContainerRef}
                onClick={handleImageClick}
                className="w-full max-w-2xl aspect-[4/3] rounded-xl border border-zinc-900 bg-zinc-950 relative overflow-hidden cursor-crosshair"
              >
                {/* Visual stylized radiographic jaw background */}
                <div
                  className="w-full h-full flex flex-col items-center justify-center transition-all duration-200"
                  style={{
                    filter: `brightness(${brightness}%) contrast(${contrast}%) ${invertColors ? 'invert(100%)' : 'none'}`
                  }}
                >
                  <svg viewBox="0 0 400 300" className="w-full h-full text-zinc-800">
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
                        stroke="#ef4444"
                        strokeWidth="3.5"
                        strokeDasharray="4 2"
                        className="animate-pulse"
                      />
                    )}

                    {/* Caries highlight overlay */}
                    {cariesOverlay && (
                      <g>
                        <circle cx="150" cy="162" r="9" fill="none" stroke="#f97316" strokeWidth="2" className="animate-ping" />
                        <circle cx="150" cy="162" r="6" fill="#f97316" opacity="0.3" />
                        <circle cx="270" cy="172" r="9" fill="none" stroke="#f97316" strokeWidth="2" className="animate-ping" />
                        <circle cx="270" cy="172" r="6" fill="#f97316" opacity="0.3" />
                      </g>
                    )}
                  </svg>
                </div>

                {/* Interactive measurement dots and dashed ruler line */}
                {measurePoints.map((pt, i) => (
                  <div
                    key={i}
                    className="absolute w-2.5 h-2.5 bg-emerald-400 rounded-full border border-black -translate-x-1/2 -translate-y-1/2 shadow shadow-black"
                    style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                  />
                ))}
                {measurePoints.length === 2 && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <line
                      x1={`${measurePoints[0].x}%`}
                      y1={`${measurePoints[0].y}%`}
                      x2={`${measurePoints[1].x}%`}
                      y2={`${measurePoints[1].y}%`}
                      stroke="#34d399"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                  </svg>
                )}
              </div>
            </div>

            {/* Right Controls Panel (Col span 4) */}
            <div className="w-full md:w-80 bg-zinc-950 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-6 text-xs text-left">
                <div className="flex justify-between items-start border-b border-zinc-900 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{t('pacs_viewer_title')}</h3>
                    <p className="text-[10px] text-zinc-500 mt-1">{t('pacs_viewer_desc')}</p>
                  </div>
                  <button
                    onClick={() => setSelectedStudy(null)}
                    className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Filter sliders */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-zinc-400">
                      <span className="flex items-center gap-1"><Sun className="w-3.5 h-3.5" /> {t('pacs_brightness')}</span>
                      <span className="font-mono">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-emerald-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-zinc-400">
                      <span className="flex items-center gap-1"><Contrast className="w-3.5 h-3.5" /> {t('pacs_contrast')}</span>
                      <span className="font-mono">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-emerald-400"
                    />
                  </div>

                  {/* Toggle controls */}
                  <div className="space-y-2 pt-2 border-t border-zinc-900/60">
                    <label className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-white select-none">
                      <input
                        type="checkbox"
                        checked={invertColors}
                        onChange={(e) => setInvertColors(e.target.checked)}
                        className="rounded border-zinc-800 bg-zinc-900 accent-emerald-400"
                      />
                      <span>{t('pacs_invert')}</span>
                    </label>
                  </div>
                </div>

                {/* Clinical overlays */}
                <div className="space-y-2 pt-3 border-t border-zinc-900/60">
                  <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider block mb-1">Anatomical Overlays</span>
                  
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={canalOverlay}
                      onChange={(e) => setCanalOverlay(e.target.checked)}
                      className="rounded border-zinc-800 bg-zinc-900 accent-rose-500"
                    />
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" /> {t('pacs_canal_overlay')}
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={cariesOverlay}
                      onChange={(e) => setCariesOverlay(e.target.checked)}
                      className="rounded border-zinc-800 bg-zinc-900 accent-orange-500"
                    />
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" /> {t('pacs_caries_overlay')}
                    </span>
                  </label>
                </div>

                {/* Calibration warning info */}
                <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl space-y-1">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold block">Calibration parameters</span>
                  <p className="text-[10px] text-zinc-400 leading-normal font-mono">Pixel Scale: 1px = 0.28mm</p>
                  <p className="text-[10px] text-zinc-500 leading-normal">{t('pacs_measure')}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white text-xs border border-zinc-800 flex items-center justify-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset
                </button>
                <button
                  onClick={() => setSelectedStudy(null)}
                  className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs"
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
