'use client';

import React, { useState } from 'react';
import { LabCase } from './labTypes';
import { Sparkles, Camera, Plus, History, RefreshCw, Check, Clipboard } from 'lucide-react';

interface ShadeManagementViewProps {
  activeCase: LabCase;
  onUpdateCase: (updatedCase: LabCase) => void;
}

export default function ShadeManagementView({ activeCase, onUpdateCase }: ShadeManagementViewProps) {
  const [selectedShade, setSelectedShade] = useState(activeCase.shade.vitaShade);
  const [customShade, setCustomShade] = useState(activeCase.shade.customShade || '');
  const [shadeNotes, setShadeNotes] = useState(activeCase.shade.shadeNotes);
  const [isSaved, setIsSaved] = useState(false);

  const VITA_CLASSICAL_SHADES = ['A1', 'A2', 'A3', 'A3.5', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4', 'D2', 'D3', 'D4'];
  const VITA_3D_MASTER_SHADES = ['1M1', '1M2', '2M1', '2M2', '2M3', '3M1', '3M2', '3M3', '4M1', '4M2', 'BL1', 'BL2', 'BL3', 'BL4'];

  const handleSaveShade = () => {
    const newHistoryItem = {
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      shade: customShade ? `${selectedShade} (${customShade})` : selectedShade,
      updatedBy: 'EHR Lab Ceramist',
      note: 'Shade recipe calibrated for e.max block pressing.'
    };

    onUpdateCase({
      ...activeCase,
      shade: {
        ...activeCase.shade,
        vitaShade: selectedShade,
        customShade: customShade || undefined,
        shadeNotes,
        shadeHistory: [newHistoryItem, ...activeCase.shade.shadeHistory]
      }
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 text-zinc-100 text-left">
      <div className="border-b border-zinc-900 pb-3 flex justify-between items-center">
        <div>
          <h3 className="text-base font-black text-white uppercase tracking-tight">Esthetic Shade Management</h3>
          <p className="text-xs text-zinc-500 font-mono">Calibrate VITA classic standards, custom ceramic recipes, and photo alignments.</p>
        </div>
        <button
          onClick={handleSaveShade}
          id="save-shade-btn"
          className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs font-mono px-4 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{isSaved ? 'SAVED RECIPE!' : 'SAVE SHADE'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Shade Selector Panel */}
        <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block border-b border-zinc-900 pb-2">
            Shade Calibration Standard
          </span>

          <div className="space-y-4 text-xs font-mono">
            {/* VITA Classical standard */}
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-400 uppercase font-bold block">VITA Classical (A1-D4)</label>
              <div className="flex flex-wrap gap-1">
                {VITA_CLASSICAL_SHADES.map(s => (
                  <button
                    key={s}
                    id={`shade-classical-${s}`}
                    onClick={() => setSelectedShade(s)}
                    className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${
                      selectedShade === s 
                        ? 'bg-emerald-500 text-zinc-950 border-emerald-400' 
                        : 'bg-zinc-900 border-zinc-850 hover:border-zinc-750 text-zinc-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* VITA 3D-Master standard */}
            <div className="space-y-2 border-t border-zinc-900/60 pt-3">
              <label className="text-[10px] text-zinc-400 uppercase font-bold block">VITA 3D-Master & Bleach</label>
              <div className="flex flex-wrap gap-1">
                {VITA_3D_MASTER_SHADES.map(s => (
                  <button
                    key={s}
                    id={`shade-3d-${s}`}
                    onClick={() => setSelectedShade(s)}
                    className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${
                      selectedShade === s 
                        ? 'bg-emerald-500 text-zinc-950 border-emerald-400' 
                        : 'bg-zinc-900 border-zinc-850 hover:border-zinc-750 text-zinc-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom formula/recipe */}
            <div className="space-y-1.5 border-t border-zinc-900/60 pt-3">
              <label className="text-[10px] text-zinc-400 uppercase font-bold block">Custom Shade Recipe / Blending Formula</label>
              <input
                type="text"
                value={customShade}
                id="custom-shade-formula-input"
                onChange={(e) => setCustomShade(e.target.value)}
                placeholder="e.g., 70% e.max BL2 + 30% translucent opal glaze on cusp margins"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-zinc-200"
              />
            </div>

            {/* Shade Notes */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-400 uppercase font-bold block">Clinical Shade Notes</label>
              <textarea
                value={shadeNotes}
                id="shade-notes-textarea"
                onChange={(e) => setShadeNotes(e.target.value)}
                placeholder="Specific characteristics such as white spots, fluorosis lines, or halo depth guidelines..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 h-20 outline-none focus:border-emerald-500 text-zinc-200"
              />
            </div>
          </div>
        </div>

        {/* Photos & Shade History */}
        <div className="space-y-6">
          
          {/* Clinical Photos List */}
          <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block border-b border-zinc-900 pb-2">
              Clinical Shade Photos
            </span>

            <div className="grid grid-cols-2 gap-3">
              {activeCase.shade.photos.map((p, idx) => (
                <div key={idx} className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
                  <Camera className="w-6 h-6 text-emerald-400" />
                  <span className="text-[10px] font-mono font-bold text-zinc-300 truncate max-w-full">
                    {p}
                  </span>
                </div>
              ))}
              
              <button
                onClick={() => alert('Simulating DSLR clinical photo stream upload...')}
                id="upload-shade-photo-btn"
                className="border border-dashed border-zinc-800 hover:border-zinc-700 bg-transparent rounded-xl flex flex-col items-center justify-center p-3 text-zinc-500 hover:text-white transition-colors space-y-1"
              >
                <Plus className="w-5 h-5" />
                <span className="text-[10px] font-mono font-bold">Upload Photo</span>
              </button>
            </div>
          </div>

          {/* Shade Update History Log */}
          <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block border-b border-zinc-900 pb-2">
              Shade Verification History
            </span>

            <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-thin">
              {activeCase.shade.shadeHistory.map((hist, idx) => (
                <div key={idx} className="p-2.5 bg-zinc-900/30 border border-zinc-900 rounded-xl flex justify-between items-start text-xs font-mono">
                  <div className="space-y-0.5">
                    <p className="font-bold text-emerald-400">Shade Match: {hist.shade}</p>
                    <p className="text-[10px] text-zinc-400 italic">&ldquo;{hist.note}&rdquo;</p>
                  </div>
                  <div className="text-right text-[9px] text-zinc-500">
                    <p className="font-bold">{hist.date}</p>
                    <p>By {hist.updatedBy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
