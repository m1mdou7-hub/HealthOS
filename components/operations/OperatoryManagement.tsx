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
          border: 'border-emerald-500/20',
          bg: 'bg-emerald-950/20 text-emerald-400',
          iconBg: 'bg-emerald-500/10',
          dot: 'bg-emerald-500',
          banner: 'from-emerald-500/5 to-transparent'
        };
      case 'Occupied':
        return {
          border: 'border-purple-500/20',
          bg: 'bg-purple-950/20 text-purple-400',
          iconBg: 'bg-purple-500/10',
          dot: 'bg-purple-500',
          banner: 'from-purple-500/5 to-transparent'
        };
      case 'Cleaning':
        return {
          border: 'border-sky-500/20',
          bg: 'bg-sky-950/20 text-sky-400',
          iconBg: 'bg-sky-500/10',
          dot: 'bg-sky-500',
          banner: 'from-sky-500/5 to-transparent'
        };
      case 'Maintenance':
      default:
        return {
          border: 'border-amber-500/20',
          bg: 'bg-amber-950/20 text-amber-400',
          iconBg: 'bg-amber-500/10',
          dot: 'bg-amber-500',
          banner: 'from-amber-500/5 to-transparent'
        };
    }
  };

  return (
    <div id="operatory-management" className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" /> Real-time Operatory & Chair Grid
          </h3>
          <p className="text-zinc-400 text-xs mt-1">
            Live telemetry of active patient chairs, cleaning turnarounds, and engineering maintenance routines.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry Linked
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chairs.map((chair) => {
          const style = getStatusStyle(chair.status);
          return (
            <motion.div
              key={chair.id}
              layoutId={`chair-${chair.id}`}
              className={`rounded-2xl border ${style.border} bg-gradient-to-b ${style.banner} via-zinc-950 to-zinc-950 p-5 space-y-4 flex flex-col justify-between text-left`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-white text-sm">{chair.name}</h4>
                  <span className="text-[10px] font-mono text-zinc-500">ID: {chair.id}</span>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wide ${style.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${chair.status === 'Occupied' ? 'animate-pulse' : ''}`} />
                  {chair.status}
                </span>
              </div>

              {/* Status Details */}
              <div className="flex-1">
                {chair.status === 'Occupied' ? (
                  <div className="space-y-3 bg-zinc-900/40 p-3 rounded-xl border border-zinc-900/80">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Active Patient:</span>
                      <span className="font-bold text-white">{chair.currentPatient}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Operator Dentist:</span>
                      <span className="font-semibold text-purple-400">{chair.currentDoctor}</span>
                    </div>
                    <div className="pt-2 border-t border-zinc-800/40 flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" /> Remaining:
                      </span>
                      <span className="font-black text-white text-xs">{chair.remainingTime} mins</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                      <span>Est. Completion:</span>
                      <span>{chair.estimatedCompletion}</span>
                    </div>

                    {/* Time Adjustment controls */}
                    <div className="flex items-center gap-1.5 pt-1.5">
                      <button
                        onClick={() => handleAdjustTime(chair.id, -5)}
                        className="px-2 py-1 rounded bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-[10px] font-mono font-bold text-zinc-400 hover:text-white"
                      >
                        -5m
                      </button>
                      <button
                        onClick={() => handleAdjustTime(chair.id, 5)}
                        className="px-2 py-1 rounded bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-[10px] font-mono font-bold text-zinc-400 hover:text-white"
                      >
                        +5m
                      </button>
                      <span className="text-[9px] text-zinc-500 font-mono italic">Modify timer</span>
                    </div>
                  </div>
                ) : chair.status === 'Cleaning' ? (
                  <div className="py-4 text-center space-y-2">
                    <Sparkles className="w-7 h-7 text-sky-400 mx-auto animate-spin" style={{ animationDuration: '4s' }} />
                    <p className="text-xs text-zinc-400 font-medium">Sterilization protocol initiated</p>
                    <p className="text-[10px] text-zinc-500 font-mono">Average completion: 10 mins</p>
                  </div>
                ) : chair.status === 'Maintenance' ? (
                  <div className="py-4 text-center space-y-2">
                    <Wrench className="w-7 h-7 text-amber-500 mx-auto animate-pulse" />
                    <p className="text-xs text-zinc-400 font-medium">CAD/CAM & Milling Calibration</p>
                    <p className="text-[10px] text-zinc-500 font-mono">Engineering block active until 1:30 PM</p>
                  </div>
                ) : (
                  <div className="py-5 text-center text-zinc-600 text-xs italic flex flex-col items-center justify-center gap-1.5">
                    <CheckCircle className="w-6 h-6 text-emerald-500/30" />
                    <span>Operatory clean & ready for triage</span>
                  </div>
                )}
              </div>

              {/* Quick Status Changers */}
              <div className="pt-3 border-t border-zinc-900 flex items-center justify-between gap-1">
                <span className="text-[9px] font-mono uppercase text-zinc-500 font-bold">Set Status:</span>
                <div className="flex gap-1.5">
                  {(['Available', 'Occupied', 'Cleaning', 'Maintenance'] as const).map(stat => (
                    <button
                      key={stat}
                      onClick={() => handleToggleStatus(chair.id, stat)}
                      className={`px-2 py-1 rounded text-[9px] font-mono font-bold transition-all ${
                        chair.status === stat 
                          ? 'bg-zinc-800 text-white border border-zinc-700' 
                          : 'bg-zinc-950 text-zinc-500 hover:text-zinc-300 border border-transparent'
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
