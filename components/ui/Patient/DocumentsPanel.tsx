import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';
import { HardDrive, Plus, Eye, Download, Trash2, Edit3, Filter, FileText } from 'lucide-react';
import { clinicalService, PatientDocument } from '../../../utils/services/clinicalService';
import { Patient } from '../PatientWorkspace';

interface DocumentsPanelProps {
  supabase: SupabaseClient;
  activePatient: Patient;
  demoMode: boolean;
}

export default function DocumentsPanel({ supabase, activePatient, demoMode }: DocumentsPanelProps) {
  const queryClient = useQueryClient();
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<PatientDocument | null>(null);

  // Forms states
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: 'Consent Form' as PatientDocument['type'],
    url: '#'
  });

  const [renameForm, setRenameForm] = useState({
    name: ''
  });

  // Query
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents', activePatient.id],
    queryFn: () => clinicalService.getDocuments(supabase, activePatient.id, demoMode),
    enabled: !!activePatient.id
  });

  // Mutation
  const saveDocsMutation = useMutation({
    mutationFn: (newDocs: PatientDocument[]) =>
      clinicalService.saveDocuments(supabase, activePatient.id, newDocs, demoMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', activePatient.id] });
      setShowUploadModal(false);
      setShowRenameModal(false);
    }
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.name.trim()) return;

    const newDoc: PatientDocument = {
      id: `doc-${Date.now()}`,
      name: uploadForm.name.endsWith('.pdf') || uploadForm.name.endsWith('.stl') || uploadForm.name.endsWith('.png') 
        ? uploadForm.name 
        : `${uploadForm.name}.${uploadForm.type === 'STL File' ? 'stl' : uploadForm.type === 'Clinical Photo' ? 'png' : 'pdf'}`,
      type: uploadForm.type,
      url: uploadForm.url || '#',
      date: new Date().toISOString().split('T')[0]
    };

    saveDocsMutation.mutate([newDoc, ...documents]);
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc || !renameForm.name.trim()) return;

    const updated = documents.map(d => (d.id === editingDoc.id ? { ...d, name: renameForm.name } : d));
    saveDocsMutation.mutate(updated);
  };

  const handleDelete = (docId: string) => {
    if (confirm("Are you sure you want to archive / delete this document?")) {
      const updated = documents.filter(d => d.id !== docId);
      saveDocsMutation.mutate(updated);
    }
  };

  const categories = ["All", "Consent Form", "Lab Prescription", "Referral Letter", "Medical Report", "STL File", "Clinical Photo"];

  const filteredDocs = selectedFilter === 'All'
    ? documents
    : documents.filter(d => d.type === selectedFilter);

  return (
    <div className="space-y-6 text-start">
      {/* Header and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-900/10 p-4 rounded-3xl border border-zinc-900 gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono">
            <HardDrive className="w-4 h-4 text-emerald-400" /> Patient Document Center
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">Manage informed consents, STL files, referrals, and clinical photo archives.</p>
        </div>
        <button
          onClick={() => {
            setUploadForm({ name: '', type: 'Consent Form', url: '#' });
            setShowUploadModal(true);
          }}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1 self-stretch sm:self-auto justify-center"
        >
          <Plus className="w-3.5 h-3.5" /> Upload File
        </button>
      </div>

      {/* Filter and Content */}
      <div className="space-y-4">
        {/* Category selector */}
        <div className="flex flex-wrap gap-1 bg-zinc-950/50 p-1 rounded-xl border border-zinc-900">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-2xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedFilter === cat
                  ? "bg-zinc-800 text-white border border-zinc-700 shadow"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent"
              }`}
            >
              {cat}s
            </button>
          ))}
        </div>

        {/* List of files */}
        {isLoading ? (
          <div className="text-zinc-500 text-xs text-center py-6 animate-pulse">Loading documents...</div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-zinc-500 text-xs text-center py-8 border border-zinc-900 rounded-3xl bg-zinc-950/20">
            No files found under this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => (
              <div key={doc.id} className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900/20 hover:border-zinc-800 transition-all flex flex-col justify-between h-36">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-2xs font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 uppercase font-semibold">
                      {doc.type}
                    </span>
                    <span className="text-2xs font-mono text-zinc-500">{doc.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-2.5 break-all line-clamp-2">{doc.name}</h4>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-900/60 pt-2 mt-4 text-xs font-mono">
                  {doc.status ? (
                    <span className={`text-2xs px-1.5 py-0.5 rounded border uppercase ${
                      doc.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      doc.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-zinc-900 text-zinc-400 border-zinc-800'
                    }`}>
                      {doc.status}
                    </span>
                  ) : (
                    <span className="text-zinc-500">System Filed</span>
                  )}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => alert(`Opening preview window for ${doc.name}...`)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800"
                      title="Preview Document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingDoc(doc);
                        setRenameForm({ name: doc.name });
                        setShowRenameModal(true);
                      }}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800"
                      title="Rename Document"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-red-400 hover:text-red-300 border border-zinc-800"
                      title="Archive Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleUpload} className="bg-zinc-950 border border-zinc-900 p-6 rounded-3xl w-full max-w-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white border-b border-zinc-900 pb-2">Register Patient Document</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Document Name</label>
                <input
                  type="text"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                  placeholder="e.g. Patient Sign Consent form"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold">Classification Type</label>
                <select
                  value={uploadForm.type}
                  onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
                >
                  <option value="Consent Form">Consent Form</option>
                  <option value="Lab Prescription">Lab Prescription</option>
                  <option value="Referral Letter">Referral Letter</option>
                  <option value="Medical Report">Medical Report</option>
                  <option value="STL File">3D STL Scan File</option>
                  <option value="Clinical Photo">Clinical Intraoral Photo</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-zinc-900 pt-3">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveDocsMutation.isPending}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
              >
                Upload File
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rename Document Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleRename} className="bg-zinc-950 border border-zinc-900 p-6 rounded-3xl w-full max-w-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white border-b border-zinc-900 pb-2">Rename File Record</h3>
            <div className="space-y-1">
              <label className="text-zinc-400">File Name</label>
              <input
                type="text"
                value={renameForm.name}
                onChange={(e) => setRenameForm({ name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
                required
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-zinc-900 pt-3">
              <button
                type="button"
                onClick={() => setShowRenameModal(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveDocsMutation.isPending}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
              >
                Rename
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
