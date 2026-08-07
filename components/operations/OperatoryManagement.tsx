'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Shield, Sparkles, Wrench, PlayCircle, Clock, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { ChairStatus, Doctor } from './types';

interface OperatoryManagementProps {
  chairs: ChairStatus[];
  setChairs: React.Dispatch<React.SetStateAction<ChairStatus[]>>;
  doctors: Doctor[];
}

export default function OperatoryManagement({
  chairs,
  setChairs,
  doctors
}: OperatoryManagementProps) {

  // Toggle status helper
  const handleToggleStatus = (chairId: string, nextStatus: ChairStatus['status']) => {
    setChairs(prev => prev.map(c => {
      if (c.id === chairId) {
        // Reset patient/doctor details if switching to non-occupied
        const resets = nextStatus !== 'Occupied' ? {
          currentPatient: undefined,
          currentDoctor: undefined,
          remainingTime: undefined,
          estimatedCompletion: undefined
        } : {
          currentPatient: c.currentPatient || 'Arthur Pendragon',
          currentDoctor: c.currentDoctor || doctors[0].name,
          remainingTime: c.remainingTime || 30,
          estimatedCompletion: c.estimatedCompletion || '12:00 PM'
        };

        return {
          ...c,
          status: nextStatus,
          ...resets
        };
      }
      return c;
    }));
  };

  // Adjust remaining time
  const handleAdjustTime = (chairId: string, delta: number) => {
    setChairs(prev => prev.map(c => {
      if (c.id === chairId && c.remainingTime !== undefined) {
        const nextTime = Math.max(0, c.remainingTime + delta);
        
        // Calculate next completion string
        const compDate = new Date();
        compDate.setMinutes(compDate.getMinutes() + nextTime);
        const compString = compDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });

        return {
          ...c,
          remainingTime: nextTime,
          estimatedCompletion: compString
        };
      }
      return c;
    }));
  };

  const getStatusStyle = (status: ChairStatus['status']) => {
    switch (status) {
      case 'Available':
        return {
          border: 'color-mix(in srgb, var(--velvet-success) 20%, transparent)',
          bg: 'color-mix(in srgb, var(--velvet-success) 12%, transparent)',
          text: 'var(--velvet-success)',
          dot: 'var(--velvet-success)',
          banner: 'color-mix(in srgb, var(--velvet-success) 5%, transparent)'
        };
      case 'Occupied':
        return {
          border: 'color-mix(in srgb, var(--velvet-accent) 20%, transparent)',
          bg: 'color-mix(in srgb, var(--velvet-accent) 12%, transparent)',
          text: 'var(--velvet-accent)',
          dot: 'var(--velvet-accent)',
          banner: 'color-mix(in srgb, var(--velvet-accent) 5%, transparent)'
        };
      case 'Cleaning':
        return {
          border: 'color-mix(in srgb, var(--velvet-info) 20%, transparent)',
          bg: 'color-mix(in srgb, var(--velvet-info) 12%, transparent)',
          text: 'var(--velvet-info)',
          dot: 'var(--velvet-info)',
          banner: 'color-mix(in srgb, var(--velvet-info) 5%, transparent)'
        };
      case 'Maintenance':
      default:
        return {
          border: 'color-mix(in srgb, var(--velvet-warning) 20%, transparent)',
          bg: 'color-mix(in srgb, var(--velvet-warning) 12%, transparent)',
          text: 'var(--velvet-warning)',
          dot: 'var(--velvet-warning)',
          banner: 'color-mix(in srgb, var(--velvet-warning) 5%, transparent)'
        };
    }
  };

  return (
    <div id="operatory-management" className="p-6 card-elevated rounded-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold font-mono flex items-center gap-2" style={{ color: 'var(--velvet-text)' }}>
            <Shield className="w-4 h-4" style={{ color: 'var(--velvet-success)' }} /> Real-time Operatory & Chair Grid
          </h3>
          <p className="text-xs mt-1" style={{ color: 'var(--velvet-text-muted)' }}>
            Live telemetry of active patient chairs, cleaning turnarounds, and engineering maintenance routines.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--velvet-text-muted)' }}>
          <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: 'var(--velvet-success)' }} /> Live Telemetry Linked
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chairs.map((chair) => {
          const style = getStatusStyle(chair.status);
          return (
            <motion.div
              key={chair.id}
              layoutId={`chair-${chair.id}`}
              className="rounded-2xl border p-5 space-y-4 flex flex-col justify-between text-start card-hover"
              style={{ borderColor: style.border, background: `linear-gradient(to bottom, ${style.banner}, var(--velvet-surface-solid) 40%, var(--velvet-surface-solid))` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm" style={{ color: 'var(--velvet-text)' }}>{chair.name}</h4>
                  <span className="text-2xs font-mono" style={{ color: 'var(--velvet-text-muted)' }}>ID: {chair.id}</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-mono font-bold uppercase tracking-wide" style={{ background: style.bg, color: style.text }}>
                  <span className={`w-1.5 h-1.5 rounded-full ${chair.status === 'Occupied' ? 'animate-pulse' : ''}`} style={{ background: style.dot }} />
                  {chair.status}
                </span>
              </div>

              {/* Status Details */}
              <div className="flex-1">
                {chair.status === 'Occupied' ? (
                  <div className="space-y-3 p-3 rounded-xl border" style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)' }}>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--velvet-text-muted)' }}>Active Patient:</span>
                      <span className="font-bold" style={{ color: 'var(--velvet-text)' }}>{chair.currentPatient}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--velvet-text-muted)' }}>Operator Dentist:</span>
                      <span className="font-semibold" style={{ color: 'var(--velvet-accent)' }}>{chair.currentDoctor}</span>
                    </div>
                    <div className="pt-2 border-t flex items-center justify-between text-xs font-mono" style={{ borderColor: 'var(--velvet-border)' }}>
                      <span className="flex items-center gap-1" style={{ color: 'var(--velvet-text-muted)' }}>
                        <Clock className="w-3.5 h-3.5" style={{ color: 'var(--velvet-text-muted)' }} /> Remaining:
                      </span>
                      <span className="font-black text-xs" style={{ color: 'var(--velvet-text)' }}>{chair.remainingTime} mins</span>
                    </div>
                    <div className="flex justify-between text-2xs font-mono" style={{ color: 'var(--velvet-text-muted)' }}>
                      <span>Est. Completion:</span>
                      <span>{chair.estimatedCompletion}</span>
                    </div>

                    {/* Time Adjustment controls */}
                    <div className="flex items-center gap-1.5 pt-1.5">
                      <button
                        onClick={() => handleAdjustTime(chair.id, -5)}
                        className="btn-ghost px-2 py-1 rounded text-2xs font-mono font-bold"
                      >
                        -5m
                      </button>
                      <button
                        onClick={() => handleAdjustTime(chair.id, 5)}
                        className="btn-ghost px-2 py-1 rounded text-2xs font-mono font-bold"
                      >
                        +5m
                      </button>
                      <span className="text-2xs font-mono italic" style={{ color: 'var(--velvet-text-muted)' }}>Modify timer</span>
                    </div>
                  </div>
                ) : chair.status === 'Cleaning' ? (
                  <div className="py-4 text-center space-y-2">
                    <Sparkles className="w-7 h-7 mx-auto animate-spin" style={{ color: 'var(--velvet-info)', animationDuration: '4s' }} />
                    <p className="text-xs font-medium" style={{ color: 'var(--velvet-text-sub)' }}>Sterilization protocol initiated</p>
                    <p className="text-2xs font-mono" style={{ color: 'var(--velvet-text-muted)' }}>Average completion: 10 mins</p>
                  </div>
                ) : chair.status === 'Maintenance' ? (
                  <div className="py-4 text-center space-y-2">
                    <Wrench className="w-7 h-7 mx-auto animate-pulse" style={{ color: 'var(--velvet-warning)' }} />
                    <p className="text-xs font-medium" style={{ color: 'var(--velvet-text-sub)' }}>CAD/CAM & Milling Calibration</p>
                    <p className="text-2xs font-mono" style={{ color: 'var(--velvet-text-muted)' }}>Engineering block active until 1:30 PM</p>
                  </div>
                ) : (
                  <div className="py-5 text-center text-xs italic flex flex-col items-center justify-center gap-1.5" style={{ color: 'var(--velvet-text-muted)' }}>
                    <CheckCircle className="w-6 h-6" style={{ color: 'color-mix(in srgb, var(--velvet-success) 40%, transparent)' }} />
                    <span>Operatory clean & ready for triage</span>
                  </div>
                )}
              </div>

              {/* Quick Status Changers */}
              <div className="pt-3 border-t flex items-center justify-between gap-1" style={{ borderColor: 'var(--velvet-border)' }}>
                <span className="text-2xs font-mono uppercase font-bold" style={{ color: 'var(--velvet-text-muted)' }}>Set Status:</span>
                <div className="flex gap-1.5">
                  {(['Available', 'Occupied', 'Cleaning', 'Maintenance'] as const).map(stat => (
                    <button
                      key={stat}
                      onClick={() => handleToggleStatus(chair.id, stat)}
                      className={`px-2 py-1 rounded text-2xs font-mono font-bold transition-all ${
                        chair.status === stat 
                          ? 'btn-primary' 
                          : 'btn-ghost'
                      }`}
                    >
                      {stat[0]}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
