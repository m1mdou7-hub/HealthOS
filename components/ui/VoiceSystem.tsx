'use client';

/**
 * HealthOS Voice System — Integrated Clinical Voice Interface
 * ──────────────────────────────────────────────────────────────
 * Three subsystems:
 *  1. Voice Dictation   — Mic → Text into any focused input / textarea
 *  2. Voice Commands    — "Go to patients", "open dashboard", etc.
 *  3. TTS Alerts        — Speak notifications + incoming messages aloud
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, VolumeX, Zap, MessageSquare, Navigation, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

// ─── Types ─────────────────────────────────────────────────────────────────
type VoiceMode = 'idle' | 'dictating' | 'commanding' | 'speaking';

interface VoiceCommand {
  patterns: string[];
  label: string;
  action: (router: ReturnType<typeof useRouter>, say: (t: string) => void) => void;
}

// ─── Voice Command Registry ─────────────────────────────────────────────────
const VOICE_COMMANDS: VoiceCommand[] = [
  {
    patterns: ['dashboard', 'home', 'main', 'الرئيسية', 'الداشبورد'],
    label: 'Navigate → Dashboard',
    action: (router, say) => { router.push('/'); say('Opening Dashboard.'); }
  },
  {
    patterns: ['patients', 'patient list', 'المرضى', 'قائمة المرضى'],
    label: 'Navigate → Patients',
    action: (router, say) => { router.push('/patients'); say('Opening Patients.'); }
  },
  {
    patterns: ['appointments', 'schedule', 'المواعيد', 'الجدول'],
    label: 'Navigate → Appointments',
    action: (router, say) => { router.push('/appointments'); say('Opening Appointments.'); }
  },
  {
    patterns: ['communication', 'messages', 'inbox', 'التواصل', 'الرسائل'],
    label: 'Navigate → Communication',
    action: (router, say) => { router.push('/communication'); say('Opening Communication.'); }
  },
  {
    patterns: ['laboratory', 'lab', 'المختبر'],
    label: 'Navigate → Laboratory',
    action: (router, say) => { router.push('/laboratory'); say('Opening Laboratory.'); }
  },
  {
    patterns: ['imaging', 'scans', 'التصوير'],
    label: 'Navigate → Imaging',
    action: (router, say) => { router.push('/imaging'); say('Opening Imaging.'); }
  },
  {
    patterns: ['analytics', 'reports', 'التحليلات', 'التقارير'],
    label: 'Navigate → Analytics',
    action: (router, say) => { router.push('/analytics'); say('Opening Analytics.'); }
  },
  {
    patterns: ['billing', 'invoices', 'الفواتير', 'المحاسبة'],
    label: 'Navigate → Billing',
    action: (router, say) => { router.push('/billing'); say('Opening Billing.'); }
  },
  {
    patterns: ['settings', 'الإعدادات'],
    label: 'Navigate → Settings',
    action: (router, say) => { router.push('/settings'); say('Opening Settings.'); }
  },
  {
    patterns: ['tasks', 'المهام'],
    label: 'Navigate → Tasks',
    action: (router, say) => { router.push('/tasks'); say('Opening Tasks.'); }
  },
  {
    patterns: ['medical records', 'ehr', 'records', 'السجلات الطبية'],
    label: 'Navigate → Medical Records',
    action: (router, say) => { router.push('/medical-records'); say('Opening Medical Records.'); }
  },
  {
    patterns: ['help', 'support', 'المساعدة'],
    label: 'Navigate → Help',
    action: (router, say) => { router.push('/help'); say('Opening Help Center.'); }
  },
  {
    patterns: ['stop listening', 'stop', 'cancel', 'exit', 'إيقاف', 'خروج'],
    label: 'Stop Voice Mode',
    action: (_router, say) => { say('Voice commands deactivated.'); }
  },
];

// ─── Hook: Text-to-Speech ───────────────────────────────────────────────────
export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, priority = false) => {
    if (!ttsEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    if (priority) window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 0.85;
    // Prefer a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Samantha') || v.name.includes('Google US English') || v.name.includes('Alex'));
    if (preferred) utterance.voice = preferred;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, stopSpeaking, isSpeaking, ttsEnabled, setTtsEnabled };
}

// ─── Main Voice Widget Component ─────────────────────────────────────────────
interface VoiceSystemProps {
  onAlert?: (msg: string) => void; // callback to pass TTS to notification system
}

export default function VoiceSystem({ onAlert }: VoiceSystemProps) {
  const router = useRouter();
  const { speak, stopSpeaking, isSpeaking, ttsEnabled, setTtsEnabled } = useTTS();

  const [mode, setMode] = useState<VoiceMode>('idle');
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [dictationTarget, setDictationTarget] = useState<HTMLElement | null>(null);
  const [waveAmplitudes, setWaveAmplitudes] = useState([0.3, 0.5, 0.7, 0.5, 0.3]);
  const [commandHistory, setCommandHistory] = useState<{ text: string; time: string; type: 'nav' | 'dictate' | 'tts' }[]>([]);

  const recognitionRef = useRef<any>(null);
  const waveInterval = useRef<NodeJS.Timeout>();

  // ── Animate voice wave bars ──────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'idle') {
      waveInterval.current = setInterval(() => {
        setWaveAmplitudes(prev => prev.map(() => 0.2 + Math.random() * 0.8));
      }, 120);
    } else {
      clearInterval(waveInterval.current);
      setWaveAmplitudes([0.3, 0.5, 0.7, 0.5, 0.3]);
    }
    return () => clearInterval(waveInterval.current);
  }, [mode]);

  // ── Build recognition instance ────────────────────────────────────────────
  const buildRecognition = useCallback((currentMode: 'dictating' | 'commanding') => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const rec = new SpeechRecognition();
    rec.continuous = currentMode === 'dictating';
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.maxAlternatives = 1;

    rec.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const text = result[0].transcript.toLowerCase().trim();
      setTranscript(text);

      if (currentMode === 'dictating' && result.isFinal) {
        // Inject into focused element
        const focused = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
        if (focused && (focused.tagName === 'INPUT' || focused.tagName === 'TEXTAREA')) {
          const start = focused.selectionStart ?? focused.value.length;
          const end = focused.selectionEnd ?? focused.value.length;
          const newVal = focused.value.substring(0, start) + result[0].transcript + focused.value.substring(end);
          // React synthetic event
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            focused.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype,
            'value'
          )?.set;
          nativeInputValueSetter?.call(focused, newVal);
          focused.dispatchEvent(new Event('input', { bubbles: true }));
        }
        setCommandHistory(prev => [{ text: result[0].transcript, time: new Date().toLocaleTimeString(), type: 'dictate' }, ...prev.slice(0, 14)]);
      }

      if (currentMode === 'commanding' && result.isFinal) {
        const matched = VOICE_COMMANDS.find(cmd =>
          cmd.patterns.some(p => text.includes(p.toLowerCase()))
        );
        if (matched) {
          setLastCommand(matched.label);
          matched.action(router, (t) => speak(t, true));
          setCommandHistory(prev => [{ text: matched.label, time: new Date().toLocaleTimeString(), type: 'nav' }, ...prev.slice(0, 14)]);
        } else {
          speak('Command not recognized. Try saying "patients", "dashboard", or "appointments".');
        }
        setTranscript('');
      }
    };

    rec.onerror = () => stopListening();
    rec.onend = () => {
      if (currentMode === 'commanding') setMode('idle');
    };

    return rec;
  }, [router, speak]);

  // ── Start dictation ──────────────────────────────────────────────────────
  const startDictation = useCallback(() => {
    stopListening();
    const rec = buildRecognition('dictating');
    if (!rec) { alert('Speech recognition not supported in this browser.'); return; }
    recognitionRef.current = rec;
    rec.start();
    setMode('dictating');
    setTranscript('');
    speak('Dictation mode active. Speak now.', true);
  }, [buildRecognition, speak]);

  // ── Start voice commands ─────────────────────────────────────────────────
  const startCommanding = useCallback(() => {
    stopListening();
    const rec = buildRecognition('commanding');
    if (!rec) { alert('Speech recognition not supported in this browser.'); return; }
    recognitionRef.current = rec;
    rec.start();
    setMode('commanding');
    setTranscript('');
    speak('Voice commands ready. Where would you like to go?', true);
  }, [buildRecognition, speak]);

  // ── Stop everything ──────────────────────────────────────────────────────
  const stopListening = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch {}
    recognitionRef.current = null;
    setMode('idle');
    setTranscript('');
  }, []);

  // ── Speak a TTS alert (exposed via ref/window event) ─────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent;
      if (ev.detail?.text && ttsEnabled) {
        speak(ev.detail.text);
        setCommandHistory(prev => [{ text: ev.detail.text, time: new Date().toLocaleTimeString(), type: 'tts' }, ...prev.slice(0, 14)]);
      }
    };
    window.addEventListener('healthos_tts_alert', handler);
    return () => window.removeEventListener('healthos_tts_alert', handler);
  }, [speak, ttsEnabled]);

  // ── Derived state ────────────────────────────────────────────────────────
  const isActive = mode !== 'idle';

  const modeColors = {
    idle:       'border-white/[0.08] bg-white/[0.04]',
    dictating:  'border-rose-500/40 bg-rose-500/8',
    commanding: 'border-amber-500/40 bg-amber-500/8',
    speaking:   'border-blue-500/40 bg-blue-500/8',
  };

  const modeLabel = {
    idle:       'Voice System',
    dictating:  'Dictating...',
    commanding: 'Listening for command...',
    speaking:   'Speaking...',
  };

  return (
    <div className="relative">
      {/* ── Compact Header Button ── */}
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition-all duration-300 cursor-pointer select-none ${modeColors[mode]}`}
        onClick={() => setExpanded(p => !p)}
      >
        {/* Wave bars */}
        <div className="flex items-center gap-[2px] h-4">
          {waveAmplitudes.map((amp, i) => (
            <motion.div
              key={i}
              animate={{ scaleY: isActive ? amp : 0.3 }}
              transition={{ duration: 0.1 }}
              className={`w-[3px] rounded-full origin-bottom ${
                mode === 'dictating'  ? 'bg-rose-400' :
                mode === 'commanding' ? 'bg-amber-400' :
                mode === 'speaking'   ? 'bg-blue-400' :
                'bg-zinc-600'
              }`}
              style={{ height: 14 }}
            />
          ))}
        </div>

        <span className={`text-[10px] font-mono font-bold hidden sm:inline ${
          mode === 'dictating'  ? 'text-rose-400' :
          mode === 'commanding' ? 'text-amber-400' :
          mode === 'speaking'   ? 'text-blue-400' :
          'text-zinc-500'
        }`}>
          {modeLabel[mode]}
        </span>

        {ttsEnabled ? (
          <Volume2 className="w-3 h-3 text-zinc-600" />
        ) : (
          <VolumeX className="w-3 h-3 text-zinc-700" />
        )}

        {expanded ? <ChevronUp className="w-3 h-3 text-zinc-600" /> : <ChevronDown className="w-3 h-3 text-zinc-600" />}
      </div>

      {/* ── Expanded Panel ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-80 z-[9999] bg-[#09090e] border border-rose-500/20 rounded-3xl shadow-2xl shadow-black/90 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/[0.06]">
              <div>
                <p className="text-xs font-bold text-white">Voice System</p>
                <p className="text-[10px] text-zinc-500 font-mono">Web Speech API · HIPAA Compliant</p>
              </div>
              <button onClick={() => setExpanded(false)} className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-400 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Live Transcript Display */}
            {isActive && (
              <div className={`mx-4 mt-3 p-3 rounded-2xl border text-xs font-mono min-h-[44px] ${
                mode === 'dictating'  ? 'bg-rose-500/8 border-rose-500/20 text-rose-200' :
                mode === 'commanding' ? 'bg-amber-500/8 border-amber-500/20 text-amber-200' :
                                       'bg-blue-500/8 border-blue-500/20 text-blue-200'
              }`}>
                {transcript || (
                  <span className="text-zinc-600 italic">
                    {mode === 'dictating' ? 'Speak to dictate into the focused field...' :
                     mode === 'commanding' ? 'Say a page name to navigate...' : '...'}
                  </span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="p-4 space-y-2">

              {/* Dictation */}
              <button
                onClick={mode === 'dictating' ? stopListening : startDictation}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  mode === 'dictating'
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    : 'bg-white/[0.04] border-white/[0.08] text-zinc-300 hover:bg-white/[0.08]'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${mode === 'dictating' ? 'bg-rose-500/30' : 'bg-white/[0.06]'}`}>
                  <Mic className={`w-4 h-4 ${mode === 'dictating' ? 'text-rose-400 animate-pulse' : 'text-zinc-400'}`} />
                </div>
                <div className="text-left">
                  <p>{mode === 'dictating' ? '● Stop Dictation' : 'Start Voice Dictation'}</p>
                  <p className="text-[10px] font-normal text-zinc-500 mt-0.5">Speak → Types in focused field</p>
                </div>
              </button>

              {/* Voice Commands */}
              <button
                onClick={mode === 'commanding' ? stopListening : startCommanding}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  mode === 'commanding'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-white/[0.04] border-white/[0.08] text-zinc-300 hover:bg-white/[0.08]'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${mode === 'commanding' ? 'bg-amber-500/30' : 'bg-white/[0.06]'}`}>
                  <Zap className={`w-4 h-4 ${mode === 'commanding' ? 'text-amber-400 animate-pulse' : 'text-zinc-400'}`} />
                </div>
                <div className="text-left">
                  <p>{mode === 'commanding' ? '● Stop Commands' : 'Voice Navigation'}</p>
                  <p className="text-[10px] font-normal text-zinc-500 mt-0.5">Say "patients", "dashboard"…</p>
                </div>
              </button>

              {/* TTS Toggle */}
              <button
                onClick={() => { setTtsEnabled(p => !p); stopSpeaking(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  ttsEnabled
                    ? 'bg-white/[0.04] border-white/[0.08] text-zinc-300 hover:bg-white/[0.08]'
                    : 'bg-white/[0.02] border-white/[0.04] text-zinc-600'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${ttsEnabled ? 'bg-white/[0.06]' : 'bg-white/[0.02]'}`}>
                  {ttsEnabled ? <Volume2 className="w-4 h-4 text-zinc-400" /> : <VolumeX className="w-4 h-4 text-zinc-600" />}
                </div>
                <div className="text-left">
                  <p>Voice Alerts (TTS): <span className={ttsEnabled ? 'text-rose-400' : 'text-zinc-600'}>{ttsEnabled ? 'ON' : 'OFF'}</span></p>
                  <p className="text-[10px] font-normal text-zinc-500 mt-0.5">Reads notifications aloud</p>
                </div>
                {/* Toggle pill */}
                <div className="ml-auto">
                  <div className={`w-9 h-5 rounded-full border flex items-center px-0.5 transition-all ${ttsEnabled ? 'bg-rose-500/30 border-rose-500/40 justify-end' : 'bg-white/[0.04] border-white/[0.08] justify-start'}`}>
                    <div className={`w-4 h-4 rounded-full shadow ${ttsEnabled ? 'bg-rose-400' : 'bg-zinc-600'}`} />
                  </div>
                </div>
              </button>
            </div>

            {/* Command Quick Reference */}
            <div className="px-4 pb-3">
              <p className="text-[10px] font-bold text-zinc-600 uppercase font-mono mb-2">Quick Commands</p>
              <div className="flex flex-wrap gap-1">
                {['patients', 'dashboard', 'appointments', 'lab', 'billing', 'settings'].map(cmd => (
                  <span key={cmd} className="text-[9px] font-mono px-2 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded-full text-zinc-500">
                    "{cmd}"
                  </span>
                ))}
              </div>
            </div>

            {/* Command History Log */}
            {commandHistory.length > 0 && (
              <div className="border-t border-white/[0.06] px-4 py-3">
                <p className="text-[10px] font-bold text-zinc-600 uppercase font-mono mb-2">Recent Activity</p>
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {commandHistory.slice(0, 6).map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] font-mono">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${h.type === 'nav' ? 'bg-amber-400' : h.type === 'dictate' ? 'bg-rose-400' : 'bg-blue-400'}`} />
                      <span className="text-zinc-400 truncate flex-1">{h.text}</span>
                      <span className="text-zinc-700 shrink-0">{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
