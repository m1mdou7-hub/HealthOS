'use client';

import React from 'react';
import { LabCase, ManufacturingStage } from './labTypes';
import { Check, Clock, Play, ArrowRight, Sparkles, Server } from 'lucide-react';

interface ManufacturingWorkflowViewProps {
  activeCase: LabCase;
  onUpdateCase: (updatedCase: LabCase) => void;
}

export default function ManufacturingWorkflowView({ activeCase, onUpdateCase }: ManufacturingWorkflowViewProps) {
  const STAGES: ManufacturingStage[] = [
    'Prescription received',
    'Design',
    'CAD',
    'CAM',
    'Milling',
    'Printing',
    'Sintering',
    'Staining',
    'Glazing',
    'Try-in',
    'Delivery',
    'Completion'
  ];

  const handleToggleStage = (stageName: ManufacturingStage) => {
    // Find index of clicked stage
    const stageIndex = STAGES.indexOf(stageName);
    if (stageIndex === -1) return;

    // We can mark all stages up to stageIndex as completed, and others as false
    const updatedTimeline = activeCase.timeline.map(item => {
      const idx = STAGES.indexOf(item.stage);
      if (idx <= stageIndex) {
        return {
          ...item,
          completed: true,
          timestamp: item.timestamp || new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      } else {
        return {
          ...item,
          completed: false,
          timestamp: ''
        };
      }
    });

    // Calculate percentage based on completed stages
    const completedCount = updatedTimeline.filter(t => t.completed).length;
    const progressPercent = Math.round((completedCount / STAGES.length) * 100);

    onUpdateCase({
      ...activeCase,
      status: STAGES[stageIndex], // Update active status to the latest completed stage
      progressPercent,
      timeline: updatedTimeline
    });
  };

  return (
    <div className="space-y-6 text-zinc-100 text-start">
      <div className="border-b border-zinc-900 pb-3 flex justify-between items-center">
        <div>
          <h3 className="text-base font-black text-white uppercase tracking-tight">Prosthesis Manufacturing Workflow</h3>
          <p className="text-xs text-zinc-500 font-mono">Track active CNC spindles, press furnaces, and 3D dental printers in sequential staging.</p>
        </div>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
          Progress: {activeCase.progressPercent}%
        </span>
      </div>

      {/* Visual Pipeline Bar */}
      <div id="manufacturing-pipeline-bar" className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-4">
        <span className="text-2xs font-bold uppercase tracking-widest text-zinc-500 font-mono block">
          Sequential Restoration Pipeline (Click any stage to advance case)
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {STAGES.map((stage, idx) => {
            const timelineItem = activeCase.timeline.find(t => t.stage === stage);
            const isCompleted = timelineItem?.completed;
            const isActive = activeCase.status === stage;

            return (
              <button
                key={idx}
                id={`stage-btn-${stage.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => handleToggleStage(stage)}
                className={`p-3 rounded-xl border text-start flex flex-col justify-between h-[85px] cursor-pointer transition-all ${
                  isActive 
                    ? 'border-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-400/20 shadow-soft' 
                    : isCompleted
                    ? 'border-emerald-500/30 bg-emerald-500/[0.02]'
                    : 'border-zinc-900 bg-transparent hover:border-zinc-800'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-2xs font-mono font-bold text-zinc-500">
                    STAGE {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isActive ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  ) : null}
                </div>

                <div>
                  <h5 className={`text-xs font-bold truncate ${isCompleted || isActive ? 'text-white' : 'text-zinc-500'}`}>
                    {stage}
                  </h5>
                  <p className="text-2xs font-mono text-zinc-500 truncate mt-0.5">
                    {isCompleted ? 'Finished' : isActive ? 'Active' : 'Scheduled'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time Stage telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CNC Milling parameters */}
        <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-3">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
            <span className="text-2xs font-bold uppercase tracking-widest text-zinc-500 font-mono">
              CNC Mill & Spindle Telemetry
            </span>
            <span className="text-2xs font-mono text-emerald-400">ONLINE</span>
          </div>

          <div className="space-y-2 text-xs font-mono text-zinc-400">
            <div className="flex justify-between">
              <span>Milling spindle:</span>
              <span className="text-white">Roland DWX-52D 5-Axis CNC</span>
            </div>
            <div className="flex justify-between">
              <span>Spindle load:</span>
              <span className="text-emerald-400">28,500 RPM (Optimal)</span>
            </div>
            <div className="flex justify-between">
              <span>Disc block:</span>
              <span className="text-white">Katana Zirconia HTML A2</span>
            </div>
          </div>
        </div>

        {/* Oven/Sintering parameters */}
        <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-3">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
            <span className="text-2xs font-bold uppercase tracking-widest text-zinc-500 font-mono">
              Furnace & Pressing Telemetry
            </span>
            <span className="text-2xs font-mono text-purple-400">HOLD CYCLE</span>
          </div>

          <div className="space-y-2 text-xs font-mono text-zinc-400">
            <div className="flex justify-between">
              <span>Chamber temp:</span>
              <span className="text-rose-400 font-bold">1,450 °C</span>
            </div>
            <div className="flex justify-between">
              <span>Furnace profile:</span>
              <span className="text-white">e.max press/sinter ultra</span>
            </div>
            <div className="flex justify-between">
              <span>Atmospheric pressure:</span>
              <span className="text-emerald-400">1.2 Bar (Constant)</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
