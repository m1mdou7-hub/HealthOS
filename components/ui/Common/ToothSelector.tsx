'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Smile, Shield, Flame, Hammer, Eye, Compass, Anchor, Ban } from 'lucide-react';

export type ToothStatus = 'sound' | 'decayed' | 'filled' | 'crown' | 'implant' | 'missing';

interface ToothSelectorProps {
  activeTooth: number | null;
  setActiveTooth: (num: number | null) => void;
  teethStatuses: Record<number, ToothStatus>;
  setTeethStatuses: React.Dispatch<React.SetStateAction<Record<number, ToothStatus>>>;
}

export function ToothSelector({
  activeTooth,
  setActiveTooth,
  teethStatuses,
  setTeethStatuses
}: ToothSelectorProps) {
  const t = useTranslations('PatientWorkspace');
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  // Upper arch teeth: 1 to 16
  const upperArch = Array.from({ length: 16 }, (_, i) => i + 1);
  // Lower arch teeth: 32 to 17 (dentistry standard order is clockwise, so lower is 17 to 32)
  const lowerArch = Array.from({ length: 16 }, (_, i) => 32 - i);

  const handleToothClick = (toothNum: number) => {
    setActiveTooth(toothNum);
    setShowStatusMenu(true);
  };

  const updateStatus = (status: ToothStatus) => {
    if (activeTooth !== null) {
      setTeethStatuses(prev => ({
        ...prev,
        [activeTooth]: status
      }));
      setShowStatusMenu(false);
    }
  };

  const getToothColor = (status: ToothStatus, isActive: boolean) => {
    if (isActive) return 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-soft shadow-emerald-500/20';
    switch (status) {
      case 'decayed':
        return 'border-rose-500/60 bg-rose-500/10 text-rose-400 shadow-soft shadow-rose-500/10';
      case 'filled':
        return 'border-purple-500/60 bg-purple-500/10 text-purple-400 shadow-soft shadow-purple-500/10';
      case 'crown':
        return 'border-amber-500/60 bg-amber-500/10 text-amber-300 shadow-soft shadow-amber-500/10';
      case 'implant':
        return 'border-cyan-500/60 bg-cyan-500/10 text-cyan-400 shadow-soft shadow-cyan-500/15';
      case 'missing':
        return 'border-dashed border-zinc-800 bg-zinc-950/40 text-zinc-600 opacity-40';
      default:
        return 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900';
    }
  };

  const getToothLabel = (status: ToothStatus) => {
    switch (status) {
      case 'decayed': return 'Caries';
      case 'filled': return 'Filling';
      case 'crown': return 'Crown';
      case 'implant': return 'Implant';
      case 'missing': return 'Missing';
      default: return 'Sound';
    }
  };

  // Simplified SVG Tooth Drawing path
  const renderToothSVG = (status: ToothStatus, isUpper: boolean) => {
    // A tooth-like shape with root pointing up for upper, root pointing down for lower
    return (
      <svg viewBox="0 0 100 100" className="w-5 h-7 transition-all duration-300">
        {isUpper ? (
          // Upper tooth SVG (roots pointing UP)
          <path
            d="M 30,90 C 25,60 15,30 25,10 C 35,10 40,25 50,35 C 60,25 65,10 75,10 C 85,30 75,60 70,90 Z"
            fill="currentColor"
            className="transition-colors duration-300"
          />
        ) : (
          // Lower tooth SVG (roots pointing DOWN)
          <path
            d="M 30,10 C 25,40 15,70 25,90 C 35,90 40,75 50,65 C 60,75 65,90 75,90 C 85,70 75,40 70,10 Z"
            fill="currentColor"
            className="transition-colors duration-300"
          />
        )}
      </svg>
    );
  };

  return (
    <div className="p-5 rounded-3xl border border-zinc-900 bg-zinc-950/40 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-900/60 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
            <Smile className="w-4 h-4 text-emerald-400 animate-pulse" /> 
            {t('clinical_chart_title', { defaultValue: 'Interactive Restorative Dental Chart' })}
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            {t('clinical_chart_desc', { defaultValue: 'Select any tooth to update status, link procedures, or view medical conditions.' })}
          </p>
        </div>
      </div>

      {/* Chart Layout */}
      <div className="space-y-6 py-4 overflow-x-auto scrollbar-none">
        {/* Upper Arch (1 - 16) */}
        <div className="flex flex-col items-center space-y-1 min-w-[640px]">
          <span className="text-2xs font-mono text-zinc-600 uppercase tracking-widest font-semibold">Upper Arch (Maxillary)</span>
          <div className="flex gap-2">
            {upperArch.map(num => {
              const status = teethStatuses[num] || 'sound';
              const isActive = activeTooth === num;
              return (
                <button
                  key={num}
                  onClick={() => handleToothClick(num)}
                  className={`w-9 h-16 rounded-xl border flex flex-col justify-between items-center p-1 transition-all ${getToothColor(status, isActive)}`}
                >
                  <span className="text-2xs font-mono font-bold block">{num}</span>
                  {renderToothSVG(status, true)}
                  <span className="text-2xs font-mono scale-[0.9] block text-zinc-500 truncate max-w-[32px]">
                    {getToothLabel(status)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lower Arch (17 - 32) */}
        <div className="flex flex-col items-center space-y-1 min-w-[640px]">
          <div className="flex gap-2">
            {lowerArch.map(num => {
              const status = teethStatuses[num] || 'sound';
              const isActive = activeTooth === num;
              return (
                <button
                  key={num}
                  onClick={() => handleToothClick(num)}
                  className={`w-9 h-16 rounded-xl border flex flex-col justify-between items-center p-1 transition-all ${getToothColor(status, isActive)}`}
                >
                  <span className="text-2xs font-mono scale-[0.9] block text-zinc-500 truncate max-w-[32px]">
                    {getToothLabel(status)}
                  </span>
                  {renderToothSVG(status, false)}
                  <span className="text-2xs font-mono font-bold block">{num}</span>
                </button>
              );
            })}
          </div>
          <span className="text-2xs font-mono text-zinc-600 uppercase tracking-widest font-semibold mt-1">Lower Arch (Mandibular)</span>
        </div>
      </div>

      {/* Floating Interactive Controller Panel */}
      {showStatusMenu && activeTooth !== null && (
        <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/60 backdrop-blur-md grid grid-cols-1 md:grid-cols-2 gap-4 items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="text-start">
            <span className="text-2xs font-mono text-zinc-500 block uppercase">Selected Anatomical Location</span>
            <h4 className="text-xs font-bold text-white mt-0.5">
              Tooth #{activeTooth} • {activeTooth <= 16 ? 'Upper Maxillary Arch' : 'Lower Mandibular Arch'}
            </h4>
            <div className="flex gap-2 items-center mt-1.5">
              <span className="text-2xs text-zinc-400">Current Status:</span>
              <span className="text-2xs font-bold text-emerald-400 font-mono capitalize">
                {getToothLabel(teethStatuses[activeTooth] || 'sound')}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-end">
            <button
              onClick={() => updateStatus('sound')}
              className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-2xs text-zinc-300 flex items-center gap-1 border border-zinc-800"
            >
              <Shield className="w-3 h-3 text-emerald-400" /> Sound
            </button>
            <button
              onClick={() => updateStatus('decayed')}
              className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-2xs text-zinc-300 flex items-center gap-1 border border-zinc-800"
            >
              <Flame className="w-3 h-3 text-rose-400" /> Caries
            </button>
            <button
              onClick={() => updateStatus('filled')}
              className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-2xs text-zinc-300 flex items-center gap-1 border border-zinc-800"
            >
              <Hammer className="w-3 h-3 text-purple-400" /> Restored
            </button>
            <button
              onClick={() => updateStatus('crown')}
              className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-2xs text-zinc-300 flex items-center gap-1 border border-zinc-800"
            >
              <Compass className="w-3 h-3 text-amber-400" /> Crown
            </button>
            <button
              onClick={() => updateStatus('implant')}
              className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-2xs text-zinc-300 flex items-center gap-1 border border-zinc-800"
            >
              <Anchor className="w-3 h-3 text-cyan-400" /> Implant
            </button>
            <button
              onClick={() => updateStatus('missing')}
              className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-2xs text-zinc-300 flex items-center gap-1 border border-zinc-800"
            >
              <Ban className="w-3 h-3 text-zinc-500" /> Missing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
