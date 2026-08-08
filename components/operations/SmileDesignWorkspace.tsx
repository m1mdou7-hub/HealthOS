'use client';

import React, { useState } from 'react';
import { LabCase, SmileAnalysis } from './labTypes';
import { Sparkles, Camera, Check, ShieldCheck, Ruler, Grid, Image as ImageIcon, Heart } from 'lucide-react';

interface SmileDesignWorkspaceProps {
  activeCase: LabCase;
  onUpdateCase: (updatedCase: LabCase) => void;
}

export default function SmileDesignWorkspace({ activeCase, onUpdateCase }: SmileDesignWorkspaceProps) {
  const defaultSmile: SmileAnalysis = activeCase.smileDesign || {
    interpupillaryLine: 'Parallel',
    smileLine: 'High',
    dentalMidline: 'Aligned',
    goldenProportionCheck: 'Passed',
    facialPhotos: [
      { angle: 'Full Face Smile', url: 'facial_smile.jpg', status: 'Verified' },
      { angle: 'Retracted Facial', url: 'retracted.jpg', status: 'Verified' }
    ],
    waxUpPlanning: {
      step: 'Diagnostic wax-up setup',
      status: 'Completed',
      notes: 'Initial alignment of central incisors configured.'
    },
    mockUpTracking: {
      date: '2026-07-21',
      feedback: 'Aesthetics approved, phonetics check passed',
      status: 'Approved'
    },
    caseNotes: '3D printed trial mock-up successful.'
  };

  const [smileLine, setSmileLine] = useState(defaultSmile.smileLine);
  const [interpupillary, setInterpupillary] = useState(defaultSmile.interpupillaryLine);
  const [midline, setMidline] = useState(defaultSmile.dentalMidline);
  const [goldenProportion, setGoldenProportion] = useState(defaultSmile.goldenProportionCheck);
  const [waxNotes, setWaxNotes] = useState(defaultSmile.waxUpPlanning.notes);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveSmile = () => {
    const updatedSmile: SmileAnalysis = {
      ...defaultSmile,
      smileLine,
      interpupillaryLine: interpupillary,
      dentalMidline: midline,
      goldenProportionCheck: goldenProportion,
      waxUpPlanning: {
        ...defaultSmile.waxUpPlanning,
        notes: waxNotes
      }
    };

    onUpdateCase({
      ...activeCase,
      smileDesign: updatedSmile
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 text-zinc-100 text-start">
      <div className="border-b border-zinc-900 pb-3 flex justify-between items-center">
        <div>
          <h3 className="text-base font-black text-white uppercase tracking-tight">Digital Smile Design (DSD) Workspace</h3>
          <p className="text-xs text-zinc-500 font-mono">Calibrate geometric aesthetic proportions, facial reference lines, and trial wax-ups.</p>
        </div>
        <button
          onClick={handleSaveSmile}
          id="save-smile-design-btn"
          className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs font-mono px-4 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{isSaved ? 'SAVED GEOMETRIES!' : 'SAVE GEOMETRIES'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Aesthetic Metrics Calibration (7 columns) */}
        <div className="md:col-span-7 p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-4">
          <span className="text-2xs font-bold uppercase tracking-widest text-zinc-500 font-mono block border-b border-zinc-900 pb-2">
            Geometric Analysis & Reference Lines
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-1.5">
              <label className="text-2xs text-zinc-400 uppercase font-bold flex items-center gap-1">
                <Ruler className="w-3 h-3 text-emerald-400" /> Interpupillary Line
              </label>
              <select
                value={interpupillary}
                id="interpupillary-line-select"
                onChange={(e) => setInterpupillary(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 outline-none focus:border-emerald-500 text-zinc-200"
              >
                <option value="Parallel">Parallel (Optimal Symmetry)</option>
                <option value="Canted">Canted (Asymmetrical Angle)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-2xs text-zinc-400 uppercase font-bold flex items-center gap-1">
                <Grid className="w-3 h-3 text-emerald-400" /> Smile Line Curvature
              </label>
              <select
                value={smileLine}
                id="smile-line-select"
                onChange={(e) => setSmileLine(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 outline-none focus:border-emerald-500 text-zinc-200"
              >
                <option value="High">High (Full Gingival Display)</option>
                <option value="Average">Average (Incisal & Cuspids)</option>
                <option value="Low">Low (Restricted Incisal Display)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-2xs text-zinc-400 uppercase font-bold flex items-center gap-1">
                <Ruler className="w-3 h-3 text-emerald-400" /> Dental Midline Alignment
              </label>
              <select
                value={midline}
                id="dental-midline-select"
                onChange={(e) => setMidline(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 outline-none focus:border-emerald-500 text-zinc-200"
              >
                <option value="Aligned">Aligned with Facial Midline</option>
                <option value="Deviated Left">Deviated Left 1.5mm</option>
                <option value="Deviated Right">Deviated Right 2.0mm</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-2xs text-zinc-400 uppercase font-bold flex items-center gap-1">
                <Grid className="w-3 h-3 text-emerald-400" /> Golden Proportion (1.618 : 1)
              </label>
              <select
                value={goldenProportion}
                id="golden-proportion-select"
                onChange={(e) => setGoldenProportion(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 outline-none focus:border-emerald-500 text-zinc-200"
              >
                <option value="Passed">Passed (Validated)</option>
                <option value="Needs Adjustment">Needs Calibration</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 border-t border-zinc-900/60 pt-4">
            <span className="text-2xs font-bold uppercase tracking-widest text-zinc-500 font-mono block">
              Virtual Wax-Up Planning Notes
            </span>
            <textarea
              value={waxNotes}
              id="smile-design-waxup-notes-textarea"
              onChange={(e) => setWaxNotes(e.target.value)}
              placeholder="Detail crown length extensions, incisal embrasure curvature, or customized contouring criteria..."
              className="w-full bg-zinc-900/50 border border-zinc-850 text-xs rounded-xl p-3 h-20 focus:border-emerald-500 text-zinc-300 outline-none font-mono placeholder:text-zinc-700"
            />
          </div>
        </div>

        {/* Diagnostic Photo Simulation and Try-in tracking (5 columns) */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Reference Photos */}
          <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-3">
            <span className="text-2xs font-bold uppercase tracking-widest text-zinc-500 font-mono block border-b border-zinc-900 pb-2">
              DSD Calibration Images
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl text-center space-y-2">
                <ImageIcon className="w-6 h-6 mx-auto text-emerald-400" />
                <span className="text-2xs font-mono text-zinc-400 block font-bold">facial_smile.jpg</span>
              </div>
              <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl text-center space-y-2">
                <ImageIcon className="w-6 h-6 mx-auto text-emerald-400" />
                <span className="text-2xs font-mono text-zinc-400 block font-bold">retracted.jpg</span>
              </div>
            </div>
          </div>

          {/* Trial Try-In Tracking */}
          <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-3 font-mono text-xs text-start">
            <span className="text-2xs font-bold uppercase tracking-widest text-zinc-500 block border-b border-zinc-900 pb-2">
              Clinical Trial Try-In Checkup
            </span>

            <div className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-zinc-300">Phase: 3D Printed Mock-Up</span>
                <span className="text-emerald-400">{defaultSmile.mockUpTracking.status}</span>
              </div>
              <p className="text-2xs text-zinc-400 italic">
                &ldquo;{defaultSmile.mockUpTracking.feedback}&rdquo;
              </p>
              <p className="text-2xs text-zinc-500 font-bold mt-1">Verified on: {defaultSmile.mockUpTracking.date}</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
