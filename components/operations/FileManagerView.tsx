'use client';

import React, { useState, useMemo } from 'react';
import { LabCase, FileAttachment } from './labTypes';
import { Search, Folder, Tag, Download, Play, Eye, RotateCw, Edit3, Plus, Trash, Check, Clock, Sparkles } from 'lucide-react';

interface FileManagerViewProps {
  activeCase: LabCase;
  onUpdateCase: (updatedCase: LabCase) => void;
}

export default function FileManagerView({ activeCase, onUpdateCase }: FileManagerViewProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeFileId, setActiveFileId] = useState<string>(activeCase.files[0]?.id || '');
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTag, setNewTag] = useState('');

  // 3D Preview simulator controls
  const [isWireframe, setIsWireframe] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [previewRot, setPreviewRot] = useState(0);

  const selectedFile = useMemo(() => {
    return activeCase.files.find(f => f.id === activeFileId);
  }, [activeCase.files, activeFileId]);

  const categories = useMemo(() => {
    const list = new Set<string>();
    activeCase.files.forEach(f => list.add(f.category));
    return ['All', ...Array.from(list)];
  }, [activeCase.files]);

  const filteredFiles = useMemo(() => {
    return activeCase.files.filter(f => {
      const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) || 
                          f.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchCategory = selectedCategory === 'All' || f.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [activeCase.files, search, selectedCategory]);

  const handleRename = () => {
    if (!newName.trim() || !selectedFile) return;
    const updatedFiles = activeCase.files.map(f => {
      if (f.id === selectedFile.id) {
        return {
          ...f,
          name: newName.trim(),
          version: f.version + 1,
          versionHistory: [
            ...f.versionHistory,
            {
              version: f.version + 1,
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              note: `Renamed from "${f.name}"`,
              author: 'EHR Dental Lab'
            }
          ]
        };
      }
      return f;
    });

    onUpdateCase({
      ...activeCase,
      files: updatedFiles
    });
    setIsRenaming(false);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim() || !selectedFile) return;
    if (selectedFile.tags.includes(newTag.trim())) {
      setNewTag('');
      return;
    }

    const updatedFiles = activeCase.files.map(f => {
      if (f.id === selectedFile.id) {
        return {
          ...f,
          tags: [...f.tags, newTag.trim()]
        };
      }
      return f;
    });

    onUpdateCase({
      ...activeCase,
      files: updatedFiles
    });
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!selectedFile) return;
    const updatedFiles = activeCase.files.map(f => {
      if (f.id === selectedFile.id) {
        return {
          ...f,
          tags: f.tags.filter(t => t !== tagToRemove)
        };
      }
      return f;
    });

    onUpdateCase({
      ...activeCase,
      files: updatedFiles
    });
  };

  const triggerDownload = (file: FileAttachment) => {
    alert(`Initiating secure, HIPAA-compliant downstream PACS download of "${file.name}" (${file.size}).\nTarget: CNC Milling Machine Node.`);
  };

  return (
    <div className="space-y-6 text-zinc-100 text-start">
      <div className="border-b border-zinc-900 pb-3">
        <h3 className="text-base font-black text-white uppercase tracking-tight">Digital Dentistry PACS File Hub</h3>
        <p className="text-xs text-zinc-500 font-mono">Manage intraoral raw scans, CBCT segmentations, DSLR shades, and clinical CAD/CAM files.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Directory & List (5 columns) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={search}
                id="file-manager-search"
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search scans, photos, tags..."
                className="w-full ps-8 pe-3 py-1.5 bg-zinc-900 border border-zinc-800 text-xs rounded-xl outline-none focus:border-emerald-500 text-white font-mono placeholder:text-zinc-650"
              />
            </div>
            
            <select
              value={selectedCategory}
              id="file-category-select"
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono p-1.5 text-zinc-300 outline-none focus:border-emerald-500 max-w-[120px]"
            >
              {categories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div id="file-attachments-list" className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden divide-y divide-zinc-900 max-h-[380px] overflow-y-auto">
            {filteredFiles.map(file => {
              const isActive = file.id === activeFileId;
              return (
                <div
                  key={file.id}
                  id={`file-item-${file.id}`}
                  onClick={() => {
                    setActiveFileId(file.id);
                    setIsRenaming(false);
                    setNewName(file.name);
                  }}
                  className={`p-3 cursor-pointer transition-colors text-start flex items-center justify-between gap-2 ${
                    isActive ? 'bg-emerald-500/5' : 'hover:bg-zinc-900/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-2 rounded-lg border ${
                      isActive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-zinc-900 border-zinc-850 text-zinc-500'
                    }`}>
                      <Folder className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${isActive ? 'text-emerald-400' : 'text-zinc-200'}`}>
                        {file.name}
                      </p>
                      <p className="text-2xs text-zinc-500 font-mono">
                        {file.type} • {file.size} • v{file.version}
                      </p>
                    </div>
                  </div>

                  <span className="text-2xs font-mono text-zinc-600 bg-zinc-900 border border-zinc-850 px-1.5 py-0.2 rounded shrink-0">
                    {file.category}
                  </span>
                </div>
              );
            })}

            {filteredFiles.length === 0 && (
              <div className="py-12 text-center text-zinc-650 italic text-xs font-mono">
                No matching dental scans found.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active File Preview & Actions (7 columns) */}
        <div className="lg:col-span-7">
          {selectedFile ? (
            <div id="active-file-preview-card" className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-4">
              
              {/* Filename and Renamer */}
              <div className="flex justify-between items-start border-b border-zinc-900 pb-3">
                <div className="space-y-1">
                  {isRenaming ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newName}
                        id="rename-file-input"
                        onChange={(e) => setNewName(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 text-xs rounded-lg px-2 py-0.5 font-mono text-white outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={handleRename}
                        id="confirm-rename-btn"
                        className="p-1 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950"
                        title="Save rename"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-black text-white font-mono">{selectedFile.name}</h4>
                      <button
                        onClick={() => {
                          setNewName(selectedFile.name);
                          setIsRenaming(true);
                        }}
                        id="edit-rename-btn"
                        className="p-1 text-zinc-500 hover:text-white transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <p className="text-2xs text-zinc-500 font-mono">
                    Format: {selectedFile.type} • Uploaded by {selectedFile.uploadedBy} on {selectedFile.uploadedAt}
                  </p>
                </div>

                <button
                  onClick={() => triggerDownload(selectedFile)}
                  id="pacs-download-btn"
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white flex items-center gap-1.5 text-xs font-mono font-bold"
                >
                  <Download className="w-3.5 h-3.5" /> DOWNLOAD
                </button>
              </div>

              {/* 3D Model / Image Preview Simulator */}
              <div className="h-[210px] bg-zinc-950 border border-zinc-900 rounded-xl relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-grid-zinc opacity-20" />
                
                {/* Simulated 3D Scan View */}
                {['STL', 'PLY', 'OBJ', 'Intraoral Scan'].includes(selectedFile.type) ? (
                  <div className="relative flex flex-col items-center justify-center w-full h-full">
                    <div 
                      className={`w-32 h-32 border-2 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        isWireframe ? 'border-dashed border-emerald-400 bg-transparent' : 'border-emerald-500/80 bg-emerald-500/5'
                      }`}
                      style={{
                        transform: `rotate(${previewRot}deg) scale(${previewZoom / 100})`
                      }}
                    >
                      <span className="text-2xs font-mono font-bold text-zinc-400 uppercase tracking-widest text-center">
                        {selectedFile.type} MESH
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 end-2.5 bg-zinc-900/90 border border-zinc-850 rounded-lg p-2 flex items-center gap-3 text-2xs font-mono text-zinc-400">
                      <button 
                        onClick={() => setIsWireframe(!isWireframe)}
                        className={`px-1.5 py-0.5 rounded ${isWireframe ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-950'}`}
                      >
                        Wireframe
                      </button>
                      <button onClick={() => setPreviewRot(prev => (prev + 45) % 360)} className="flex items-center gap-1 hover:text-white">
                        <RotateCw className="w-3 h-3" /> Rotate
                      </button>
                    </div>
                  </div>
                ) : selectedFile.type === 'Clinical Photo' ? (
                  <div className="relative flex items-center justify-center w-full h-full">
                    <div className="w-44 h-28 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center relative">
                      <Eye className="w-6 h-6 text-emerald-400" />
                      <span className="absolute bottom-1.5 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 rtl:translate-x-1/2 text-2xs font-mono text-zinc-500">Shade photo loaded</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-600 font-mono text-xs space-y-1.5">
                    <Folder className="w-8 h-8 text-zinc-700" />
                    <p className="font-bold">Clinical {selectedFile.type} Document</p>
                    <p className="text-2xs text-zinc-600">Double click to stream raw file</p>
                  </div>
                )}
              </div>

              {/* Tags Section */}
              <div className="space-y-2">
                <span className="text-2xs font-bold uppercase tracking-widest text-zinc-500 font-mono block">Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedFile.tags.map((t, idx) => (
                    <span key={idx} className="flex items-center gap-1 text-2xs font-mono bg-zinc-900 border border-zinc-800 text-emerald-400 px-2 py-0.5 rounded-full">
                      <span>{t}</span>
                      <button onClick={() => handleRemoveTag(t)} className="text-zinc-600 hover:text-rose-400">
                        &times;
                      </button>
                    </span>
                  ))}
                  
                  <form onSubmit={handleAddTag} className="flex gap-1.5 items-center">
                    <input
                      type="text"
                      value={newTag}
                      id="new-tag-input"
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="+ Add tag"
                      className="bg-transparent border border-dashed border-zinc-800 hover:border-zinc-700 rounded-full text-2xs font-mono px-2 py-0.5 text-zinc-400 focus:text-white outline-none"
                    />
                  </form>
                </div>
              </div>

              {/* Version History */}
              <div className="space-y-2 border-t border-zinc-900/60 pt-3">
                <span className="text-2xs font-bold uppercase tracking-widest text-zinc-500 font-mono block">Version History Audit Log</span>
                <div className="space-y-1.5">
                  {selectedFile.versionHistory.map((hist, idx) => (
                    <div key={idx} className="p-2 bg-zinc-900/30 border border-zinc-900 rounded-lg flex items-start justify-between text-xs font-mono">
                      <div>
                        <p className="text-zinc-200 font-bold">Version {hist.version}</p>
                        <p className="text-2xs text-zinc-400 italic">&ldquo;{hist.note}&rdquo;</p>
                      </div>
                      <div className="text-end">
                        <span className="text-2xs text-zinc-500 font-bold block">{hist.date}</span>
                        <span className="text-2xs text-zinc-500 block">By {hist.author}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-zinc-600 font-mono text-xs border border-zinc-900 rounded-2xl bg-zinc-950">
              <Folder className="w-8 h-8 text-zinc-700" />
              <p className="font-bold mt-2">No Active File Loaded</p>
              <p className="text-2xs text-zinc-650 mt-1">Select a scan or clinical photo from the catalog list to preview.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
