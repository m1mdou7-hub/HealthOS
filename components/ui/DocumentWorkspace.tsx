'use client';

import { WorkspaceToast } from './Workspace/WorkspaceToast';
import { useWorkspaceToast } from './Workspace/useWorkspaceToast';
import React, { useState, useMemo } from 'react';
import {
  Folder,
  FileText,
  Image as ImageIcon,
  Search,
  Plus,
  Trash2,
  Archive,
  Star,
  History,
  Tag,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  Sliders,
  CheckCircle2,
  FileCode,
  Download,
  AlertCircle
} from 'lucide-react';

// --- MOCK DOCUMENTS DATA ---
const INITIAL_DOCUMENTS = [
  {
    id: 'doc-1',
    name: 'Arthur_Pendragon_Implant_Consent_Form.pdf',
    category: 'Consent Forms',
    folder: 'Consent Forms',
    size: '1.4 MB',
    tags: ['EHR-Signed', 'Required'],
    date: '2026-07-16',
    favorite: true,
    archived: false,
    version: 'v2',
    versions: [
      { ver: 'v2', date: '2026-07-16', author: 'Dr. Ahmed', desc: 'Patient digitally signed via HIPAA secure portal.' },
      { ver: 'v1', date: '2026-07-12', author: 'Dr. Sarah Jenkins', desc: 'Initial template draft generated.' }
    ]
  },
  {
    id: 'doc-2',
    name: 'Clara_Oswald_Intraoral_Scan_SLA.stl',
    category: 'Lab Documents',
    folder: 'Laboratory',
    size: '18.5 MB',
    tags: ['STL Scan', 'Milled-Done'],
    date: '2026-07-15',
    favorite: true,
    archived: false,
    version: 'v1',
    versions: [
      { ver: 'v1', date: '2026-07-15', author: 'Lab Tech Barton', desc: 'Intraoral scan direct digital acquisition.' }
    ]
  },
  {
    id: 'doc-3',
    name: 'Bruce_Wayne_Aetna_Insurance_PreAuth.pdf',
    category: 'Insurance Documents',
    folder: 'Insurance',
    size: '2.8 MB',
    tags: ['Billing-Approved'],
    date: '2026-07-14',
    favorite: false,
    archived: false,
    version: 'v1',
    versions: [
      { ver: 'v1', date: '2026-07-14', author: 'Billing Admin Jenkins', desc: 'Carrier clearance issued with 90% coverage.' }
    ]
  },
  {
    id: 'doc-4',
    name: 'Diana_Prince_Zirconia_Crown_DSD.png',
    category: 'Clinical Photos',
    folder: 'Clinical Photos',
    size: '4.2 MB',
    tags: ['Smile-Design', 'AI-Analyzed'],
    date: '2026-07-12',
    favorite: false,
    archived: false,
    version: 'v3',
    versions: [
      { ver: 'v3', date: '2026-07-12', author: 'AI Copilot Engine', desc: 'Restorative line matched to digital articulator.' },
      { ver: 'v2', date: '2026-07-10', author: 'Dr. Ahmed', desc: 'High-res lighting portrait sets aligned.' },
      { ver: 'v1', date: '2026-07-08', author: 'Hygienist Jenkins', desc: 'Initial intraoral portrait set captured.' }
    ]
  },
  {
    id: 'doc-5',
    name: 'Clinical_Guidelines_Maxillofacial_Prosthodontics.pdf',
    category: 'Administrative Documents',
    folder: 'Administrative',
    size: '8.4 MB',
    tags: ['Operations'],
    date: '2026-07-01',
    favorite: false,
    archived: false,
    version: 'v4',
    versions: [
      { ver: 'v4', date: '2026-07-01', author: 'Dr. Sarah Jenkins', desc: 'Updated with latest infection controls.' }
    ]
  },
  {
    id: 'doc-6',
    name: 'Logan_Howlett_Archived_Chart_2022.pdf',
    category: 'Medical Documents',
    folder: 'Medical Records',
    size: '14.2 MB',
    tags: ['Legacy', 'EHR-Signed'],
    date: '2026-06-15',
    favorite: false,
    archived: true,
    version: 'v1',
    versions: [
      { ver: 'v1', date: '2022-04-12', author: 'Medical Operator', desc: 'Initial legacy PDF chart digitized.' }
    ]
  }
];

const FOLDERS = [
  { name: 'Consent Forms', count: 4, size: '5.6 MB' },
  { name: 'Laboratory', count: 9, size: '184.2 MB' },
  { name: 'Insurance', count: 12, size: '24.1 MB' },
  { name: 'Clinical Photos', count: 32, size: '142.0 MB' },
  { name: 'Administrative', count: 18, size: '48.9 MB' },
  { name: 'Medical Records', count: 45, size: '612.0 MB' }
];

export default function DocumentWorkspace() {
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [activeDocId, setActiveDocId] = useState('doc-1');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

  // Upload simulation state
  const [newDocName, setNewDocName] = useState('');
  const [newDocCategory, setNewDocCategory] = useState('Consent Forms');
  const [newDocTags, setNewDocTags] = useState('EHR-Signed');

  // Success notifications toast
  const { toastMsg, showToast, triggerToast } = useWorkspaceToast();

  const activeDoc = useMemo(() => {
    return documents.find(d => d.id === activeDocId) || documents[0];
  }, [documents, activeDocId]);

  // Unified filtered document inventory list
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFolder = !selectedFolder || doc.folder === selectedFolder;
      const matchArchive = showArchived ? doc.archived : !doc.archived;
      const matchTag = !selectedTagFilter || doc.tags.includes(selectedTagFilter);
      return matchSearch && matchFolder && matchArchive && matchTag;
    });
  }, [documents, searchQuery, selectedFolder, showArchived, selectedTagFilter]);

  // Aggregate tags for filtering
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    documents.forEach(d => d.tags.forEach(t => tagsSet.add(t)));
    return Array.from(tagsSet);
  }, [documents]);

  // Handle uploading simulation
  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return alert('Please enter a document name.');

    const nameWithExt = newDocName.endsWith('.pdf') || newDocName.endsWith('.stl') || newDocName.endsWith('.png')
      ? newDocName
      : `${newDocName}.pdf`;

    const newDoc = {
      id: `doc-${Date.now()}`,
      name: nameWithExt,
      category: newDocCategory,
      folder: newDocCategory === 'Clinical Photos' ? 'Clinical Photos' : 
              newDocCategory === 'Lab Documents' ? 'Laboratory' : 
              newDocCategory === 'Insurance Documents' ? 'Insurance' : 
              newDocCategory === 'Consent Forms' ? 'Consent Forms' : 'Administrative',
      size: '2.4 MB',
      tags: newDocTags.split(',').map(t => t.trim()),
      date: new Date().toISOString().substring(0, 10),
      favorite: false,
      archived: false,
      version: 'v1',
      versions: [
        { ver: 'v1', date: new Date().toISOString().substring(0, 10), author: 'Dr. Ahmed', desc: 'Document uploaded to workspace node.' }
      ]
    };

    setDocuments([newDoc, ...documents]);
    setActiveDocId(newDoc.id);
    setNewDocName('');
    triggerToast(`Document "${newDoc.name}" uploaded and encrypted securely.`);
  };

  // Toggle favorite status
  const toggleFavorite = (id: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === id) {
        const nextFav = !doc.favorite;
        triggerToast(`Document "${doc.name}" ${nextFav ? 'marked as favorite' : 'removed from favorites'}.`);
        return { ...doc, favorite: nextFav };
      }
      return doc;
    }));
  };

  // Toggle archive status
  const toggleArchive = (id: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === id) {
        const nextArch = !doc.archived;
        triggerToast(`Document "${doc.name}" ${nextArch ? 'sent to archive' : 'restored from archive'}.`);
        return { ...doc, archived: nextArch };
      }
      return doc;
    }));
  };

  return (
    <div className="space-y-6 text-zinc-100 animate-fade-in relative max-w-[1600px] mx-auto">
      
      {/* Toast Warning */}
      {showToast && <WorkspaceToast message={toastMsg} />}

      {/* FILTER CONTROL PANEL */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-3xl border border-zinc-900">
        <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-950 rounded-3xl border border-zinc-850">
          <button
            onClick={() => { setSelectedFolder(null); setSelectedTagFilter(null); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
              !selectedFolder && !selectedTagFilter ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
            }`}
          >
            All Repositories
          </button>
          
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
              showArchived ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{showArchived ? 'Viewing Archived Records' : 'Show Archives'}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter files, folders, categories..."
              className="pl-9 pr-4 py-1.5 w-64 rounded-xl bg-zinc-950 border border-zinc-850 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
            />
          </div>
          <span className="text-[10px] font-mono uppercase bg-zinc-950 px-2 py-1.5 rounded-xl border border-zinc-850 text-zinc-400">
            Secure Cryptography Node
          </span>
        </div>
      </div>

      {/* DIRECTORY BENTO CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Folders List - 3 Columns */}
        <div className="lg:col-span-3 bg-zinc-900/30 border border-zinc-900 rounded-3xl p-5 space-y-4 flex flex-col justify-start">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Cabinet Folders</h3>
            <span className="text-[10px] font-mono text-zinc-500">6 folders</span>
          </div>

          <div className="space-y-1.5">
            {FOLDERS.map(fold => {
              const isSelected = selectedFolder === fold.name;
              return (
                <div
                  key={fold.name}
                  onClick={() => setSelectedFolder(isSelected ? null : fold.name)}
                  className={`p-3 rounded-3xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-white' 
                      : 'bg-zinc-950/20 border-transparent hover:bg-zinc-900/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Folder className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-zinc-400'}`} />
                    <div>
                      <h4 className="text-xs font-bold leading-none">{fold.name}</h4>
                      <span className="text-[9px] font-mono text-zinc-500">{fold.size} total</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950/40 px-1.5 py-0.5 rounded-md">
                    {fold.count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Tag filters list */}
          <div className="pt-4 border-t border-zinc-900 space-y-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase font-mono block">EHR Verification Tags</span>
            <div className="flex flex-wrap gap-1">
              {allTags.map(tag => {
                const isFiltered = selectedTagFilter === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTagFilter(isFiltered ? null : tag)}
                    className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border transition-all ${
                      isFiltered 
                        ? 'bg-blue-600 border-blue-500 text-black font-black' 
                        : 'bg-zinc-950 text-zinc-400 border-zinc-850 hover:border-zinc-800 hover:text-white'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Files Inventory List - 5 Columns */}
        <div className="lg:col-span-5 bg-zinc-900/30 border border-zinc-900 rounded-3xl p-5 space-y-4 flex flex-col justify-start">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Encrypted Records</h3>
            <span className="text-[10px] font-mono text-zinc-500">{filteredDocuments.length} resources matched</span>
          </div>

          <div className="space-y-1.5 overflow-y-auto max-h-[500px] pr-1">
            {filteredDocuments.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 font-mono text-xs">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 stroke-1" />
                <p>No document structures matched in cabinet node.</p>
              </div>
            ) : (
              filteredDocuments.map(doc => {
                const isSelected = doc.id === activeDocId;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setActiveDocId(doc.id)}
                    className={`p-3 rounded-3xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                      isSelected 
                        ? 'bg-zinc-900 border-zinc-800' 
                        : 'bg-zinc-950/20 border-transparent hover:bg-zinc-900/30'
                    }`}
                  >
                    <div className="flex gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-400 shrink-0">
                        {doc.name.endsWith('.png') ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <h4 className="text-xs font-bold text-white truncate" title={doc.name}>
                          {doc.name}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {doc.tags.map(t => (
                            <span key={t} className="text-[8px] font-mono bg-zinc-950 text-zinc-500 px-1 py-0.5 rounded">
                              #{t}
                            </span>
                          ))}
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono">{doc.category} • {doc.size}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(doc.id); }}
                        className={`p-1 hover:bg-zinc-800 rounded ${doc.favorite ? 'text-amber-400' : 'text-zinc-500'}`}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleArchive(doc.id); }}
                        className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded"
                        title={doc.archived ? 'Restore' : 'Archive'}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Viewport Viewer & Version History - 4 Columns */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Live Document Preview Panel */}
          <div className="p-5 rounded-3xl bg-zinc-900/20 border border-zinc-900 space-y-4">
            <div className="flex justify-between items-start border-b border-zinc-900 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded block w-max">
                  Live Viewport Preview
                </span>
                <h4 className="text-xs font-bold text-zinc-300 mt-1 truncate max-w-[240px]">{activeDoc.name}</h4>
              </div>
              <button 
                onClick={() => triggerToast(`Downloading copy of ${activeDoc.name}`)}
                className="p-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
                title="Download encrypted file"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* Document PDF sandbox preview */}
            <div className="h-44 rounded-xl bg-zinc-950 border border-zinc-850 flex flex-col items-center justify-center text-center p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
              
              <FileCode className="w-10 h-10 text-zinc-600 mb-2" />
              <p className="text-[10px] text-zinc-400 font-mono font-bold leading-relaxed">
                PDF SECURE STORAGE VIEWER (MOCK)
              </p>
              <p className="text-[9px] text-zinc-600 font-mono mt-1 leading-snug">
                Verified SHA-256 Checksum: {activeDoc.id}-{activeDoc.version}f84
              </p>
            </div>
          </div>

          {/* Audit Trail & Version Log */}
          <div className="p-5 rounded-3xl bg-zinc-900/30 border border-zinc-900 space-y-4 font-mono text-xs">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">Revision History & Audit</span>
            
            <div className="relative border-l border-zinc-850 pl-4 py-1 space-y-4">
              {activeDoc.versions.map((ver, idx) => (
                <div key={ver.ver || idx} className="relative space-y-1">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-zinc-900 border-2 border-emerald-500" />
                  <div className="flex justify-between text-[10px]">
                    <span className="font-bold text-white uppercase">{ver.ver} Log</span>
                    <span className="text-zinc-500">{ver.date}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">{ver.desc}</p>
                  <p className="text-[9px] text-zinc-500 font-black">Authorized by: {ver.author}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Document Upload Portal wizard */}
          <div className="p-5 rounded-3xl bg-zinc-900/30 border border-zinc-900 space-y-4 font-mono text-xs">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">Upload Secure Cabinet Record</span>
            
            <form onSubmit={handleUploadDocument} className="space-y-3">
              <div className="space-y-1">
                <label className="text-zinc-500">Resource Record Name</label>
                <input 
                  type="text"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="e.g. Tooth_Crown_DICOM_081"
                  className="w-full bg-zinc-950 border border-zinc-850 p-2 text-white outline-none focus:border-emerald-500 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500">Target Cabinet Category</label>
                <select 
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-white outline-none"
                >
                  <option>Consent Forms</option>
                  <option>Lab Documents</option>
                  <option>Insurance Documents</option>
                  <option>Clinical Photos</option>
                  <option>Administrative Documents</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500">Metadata Verification Tags (comma separated)</label>
                <input 
                  type="text"
                  value={newDocTags}
                  onChange={(e) => setNewDocTags(e.target.value)}
                  placeholder="EHR-Signed, Required"
                  className="w-full bg-zinc-950 border border-zinc-850 p-2 text-white outline-none focus:border-emerald-500 rounded-xl"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 py-2 rounded-xl text-center font-bold transition-all cursor-pointer mt-2"
              >
                Ingest & Encrypt Resource
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
}
