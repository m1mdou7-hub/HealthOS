import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';
import { Layers, Eye, Plus, FileText } from 'lucide-react';
import { clinicalService } from '../../../utils/services/clinicalService';
import { Patient } from '../PatientWorkspace';

interface RadiologyPanelProps {
  supabase: SupabaseClient;
  activePatient: Patient;
  demoMode: boolean;
}

export default function RadiologyPanel({ supabase, activePatient, demoMode }: RadiologyPanelProps) {
  const queryClient = useQueryClient();
  const [showAddStudyModal, setShowAddStudyModal] = useState(false);
  const [studyName, setStudyName] = useState('');
  const [studyCategory, setStudyCategory] = useState<'CBCT' | 'Radiograph'>('CBCT');

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

  // Filter for Radiology studies only
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

  return (
    <div className="space-y-6 text-left">
      {/* Header action panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-900/10 p-4 rounded-2xl border border-zinc-900 gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono">
            <Layers className="w-4 h-4 text-emerald-400" /> Patient Radiology Lab
          </h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">Access high-resolution CBCT dental scans and alveolar ridge radiographs.</p>
        </div>
        <button
          onClick={() => setShowAddStudyModal(true)}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1 self-stretch sm:self-auto justify-center"
        >
          <Plus className="w-3.5 h-3.5" /> File New Scan
        </button>
      </div>

      {/* Grid view of radiology scans */}
      {isLoading ? (
        <div className="text-zinc-500 text-xs text-center py-6 animate-pulse">Loading radiograph studies...</div>
      ) : radiologyStudies.length === 0 ? (
        <div className="text-zinc-500 text-xs text-center py-8 border border-zinc-900 rounded-2xl bg-zinc-950/20">
          No CBCT or radiograph scans filed. Use the toolbar to upload a study.
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
                  onClick={() => alert(`Launching multi-slice CBCT interactive viewer for study: ${study.name}`)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-white text-[10px] font-semibold flex items-center gap-1 border border-zinc-800 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Launch 3D Slice Viewer
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
            <h3 className="text-sm font-bold text-white border-b border-zinc-900 pb-2">Record Radiology Scan</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Scan Description</label>
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
                <label className="text-zinc-400 font-semibold">Study Category</label>
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
                Record Study
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
