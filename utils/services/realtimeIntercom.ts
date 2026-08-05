/**
 * HealthOS Real-Time Cross-Device Intercom & Phone Signaling Engine
 * ─────────────────────────────────────────────────────────────────
 * Synchronizes phone calls, audio chimes, doctor pagers, and PTT voice alerts
 * across different staff computers in real time using Supabase Realtime + BroadcastChannel.
 */

import { createClient } from '@/utils/supabase/client';

export interface IntercomSignalPayload {
  type: 'call_initiate' | 'call_answer' | 'call_end' | 'sound_chime' | 'ptt_broadcast';
  callerExt?: string;
  callerName?: string;
  targetExt?: string;
  chimeType?: 'patient_present' | 'patient_absent' | 'new_patient' | 'doctor_pager';
  audioBlobUrl?: string;
  timestamp: number;
}

type SignalCallback = (payload: IntercomSignalPayload) => void;

let supabaseChannel: any = null;
let localBroadcastChannel: BroadcastChannel | null = null;
const listeners: Set<SignalCallback> = new Set();

/**
 * Initialize real-time cross-device listener
 */
export function initRealtimeIntercom(onSignalReceived: SignalCallback) {
  listeners.add(onSignalReceived);

  if (typeof window === 'undefined') return;

  // 1. Local Browser BroadcastChannel (Instant multi-tab sync)
  if (!localBroadcastChannel && 'BroadcastChannel' in window) {
    try {
      localBroadcastChannel = new BroadcastChannel('healthos_intercom_channel');
      localBroadcastChannel.onmessage = (event) => {
        if (event.data) {
          listeners.forEach(cb => cb(event.data));
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel fallback enabled');
    }
  }

  // 2. Supabase Realtime Channel (Cross-device WebSocket network sync)
  if (!supabaseChannel) {
    try {
      const supabase = createClient();
      supabaseChannel = supabase.channel('healthos_intercom_room', {
        config: { broadcast: { self: false } }
      });

      supabaseChannel
        .on('broadcast', { event: 'intercom_signal' }, ({ payload }: { payload: IntercomSignalPayload }) => {
          listeners.forEach(cb => cb(payload));
        })
        .subscribe();
    } catch (err) {
      console.warn('Supabase Realtime fallback:', err);
    }
  }

  return () => {
    listeners.delete(onSignalReceived);
  };
}

/**
 * Broadcast an intercom / phone signal across all staff computers in real-time
 */
export function broadcastIntercomSignal(payload: Omit<IntercomSignalPayload, 'timestamp'>) {
  const fullPayload: IntercomSignalPayload = {
    ...payload,
    timestamp: Date.now()
  };

  // Broadcast to local BroadcastChannel (same device / multi-tab)
  if (localBroadcastChannel) {
    try {
      localBroadcastChannel.postMessage(fullPayload);
    } catch (e) {}
  }

  // Broadcast to Supabase Realtime (cross-device network)
  if (supabaseChannel) {
    try {
      supabaseChannel.send({
        type: 'broadcast',
        event: 'intercom_signal',
        payload: fullPayload
      });
    } catch (e) {}
  }
}
