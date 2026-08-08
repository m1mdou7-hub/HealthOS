import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';
import { HardDrive, Plus, Eye, Trash2, Edit3, FileText } from 'lucide-react';
import { clinicalService, PatientDocument } from '../../../utils/services/clinicalService';
import { Patient } from '../PatientWorkspace';
import { Button, Card, Badge, Input, Select, Modal, Skeleton, EmptyState } from '@/components/ui/design-system';

interface DocumentsPanelProps {
  supabase: SupabaseClient;
  activePatient: Patient;
  demoMode: boolean;
}

const DOC_TYPE_OPTIONS = [
  { value: 'Consent Form', label: 'Consent Form' },
  { value: 'Lab Prescription', label: 'Lab Prescription' },
  { value: 'Referral Letter', label: 'Referral Letter' },
  { value: 'Medical Report', label: 'Medical Report' },
  { value: 'STL File', label: '3D STL Scan File' },
  { value: 'Clinical Photo', label: 'Clinical Intraoral Photo' },
];

const docStatusTone = (status?: string) => {
  if (status === 'Accepted') return 'success' as const;
  if (status === 'Rejected') return 'error' as const;
  return 'default' as const;
};

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
      <Card variant="elevated" hover={false} className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-sm font-bold text-[var(--velvet-text)] flex items-center gap-1.5 font-mono">
              <HardDrive className="w-4 h-4 text-[var(--velvet-success)]" /> Patient Document Center
            </h3>
            <p className="text-xs text-[var(--velvet-text-muted)] mt-0.5">Manage informed consents, STL files, referrals, and clinical photo archives.</p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setUploadForm({ name: '', type: 'Consent Form', url: '#' });
              setShowUploadModal(true);
            }}
            className="self-stretch sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" /> Upload File
          </Button>
        </div>
      </Card>

      {/* Filter and Content */}
      <div className="space-y-4">
        {/* Category selector */}
        <div className="flex flex-wrap gap-1 bg-[var(--velvet-surface-1)] p-1 rounded-xl border border-[var(--velvet-border)]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-2xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedFilter === cat
                  ? "bg-[var(--velvet-surface-2)] text-[var(--velvet-text)] border border-[var(--velvet-border-strong)] shadow-[var(--velvet-shadow-pop)]"
                  : "text-[var(--velvet-text-muted)] hover:text-[var(--velvet-text)] hover:bg-[var(--velvet-surface-2)] border border-transparent"
              }`}
            >
              {cat}s
            </button>
          ))}
        </div>

        {/* List of files */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} variant="card" />
            ))}
          </div>
        ) : filteredDocs.length === 0 ? (
          <Card variant="elevated" hover={false} className="rounded-3xl">
            <EmptyState
              icon={<FileText className="w-6 h-6" />}
              title="No files found under this category."
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => (
              <Card key={doc.id} className="p-4 rounded-xl flex flex-col justify-between h-36">
                <div>
                  <div className="flex justify-between items-start">
                    <Badge tone="neutral" className="text-2xs font-mono uppercase font-semibold px-2 py-0.5 rounded">
                      {doc.type}
                    </Badge>
                    <span className="text-2xs font-mono text-[var(--velvet-text-muted)]">{doc.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-[var(--velvet-text)] mt-2.5 break-all line-clamp-2">{doc.name}</h4>
                </div>

                <div className="flex items-center justify-between border-t pt-2 mt-4 text-xs font-mono" style={{ borderColor: 'var(--velvet-border)' }}>
                  {doc.status ? (
                    <Badge tone={docStatusTone(doc.status)} className="text-2xs uppercase px-1.5 py-0.5 rounded">
                      {doc.status}
                    </Badge>
                  ) : (
                    <span className="text-[var(--velvet-text-muted)]">System Filed</span>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="p-1.5 rounded-lg"
                      title="Preview Document"
                      onClick={() => alert(`Opening preview window for ${doc.name}...`)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="p-1.5 rounded-lg"
                      title="Rename Document"
                      onClick={() => {
                        setEditingDoc(doc);
                        setRenameForm({ name: doc.name });
                        setShowRenameModal(true);
                      }}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="p-1.5 rounded-lg"
                      title="Archive Document"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      <Modal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        title="Register Patient Document"
        size="sm"
      >
        <form onSubmit={handleUpload} className="space-y-4 text-xs">
          <div className="space-y-3">
            <Input
              label="Document Name"
              type="text"
              value={uploadForm.name}
              onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
              placeholder="e.g. Patient Sign Consent form"
              required
            />
            <Select
              label="Classification Type"
              options={DOC_TYPE_OPTIONS}
              value={uploadForm.type}
              onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value as any })}
            />
          </div>
          <div className="flex justify-end gap-2 border-t pt-3" style={{ borderColor: 'var(--velvet-border)' }}>
            <Button variant="secondary" type="button" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saveDocsMutation.isPending}>
              Upload File
            </Button>
          </div>
        </form>
      </Modal>

      {/* Rename Document Modal */}
      <Modal
        open={showRenameModal}
        onOpenChange={setShowRenameModal}
        title="Rename File Record"
        size="sm"
      >
        <form onSubmit={handleRename} className="space-y-4 text-xs">
          <Input
            label="File Name"
            type="text"
            value={renameForm.name}
            onChange={(e) => setRenameForm({ name: e.target.value })}
            required
          />
          <div className="flex justify-end gap-2 border-t pt-3" style={{ borderColor: 'var(--velvet-border)' }}>
            <Button variant="secondary" type="button" onClick={() => setShowRenameModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saveDocsMutation.isPending}>
              Rename
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
