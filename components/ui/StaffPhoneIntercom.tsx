'use client';

/**
 * HealthOS Internal VoIP Staff Phone & Intercom System
 * ─────────────────────────────────────────────────────────────────
 * Includes:
 *  1. In-App Internal Extension Phone System (Dialpad, Direct Call, Transfer, Hold, Mute)
 *  2. Incoming Call Ringing Popup with Audio Ringtone
 *  3. Active Voice Call Banner & Timer
 *  4. Medical Sound Notification Engine (New Patient, 5-Min Warning, Doctor Pager)
 *  5. Direct Sound Preview & Live Simulation Console
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  PhoneIncoming,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  BellRing,
  User,
  Users,
  Building2,
  FlaskConical,
  Pill,
  CreditCard,
  X,
  Play,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

import {
  playNextPatientPresentChime,
  playNextPatientAbsentChime,
  playNewPatientChime,
  playDoctorPagerChime,
  playIntercomChirp,
  startPhoneRingtone,
  stopPhoneRingtone
} from '@/utils/services/audioChimes';

// ── Extension Directory ──────────────────────────────────────────────────────
interface StaffExtension {
  ext: string;
  name: string;
  role: string;
  status: 'available' | 'busy' | 'in_call' | 'offline';
  icon: React.ElementType;
  avatarBg: string;
}

const STAFF_EXTENSIONS: StaffExtension[] = [
  { ext: '101', name: 'الاستقبال الرئيسي (Reception)', role: 'Front Desk', status: 'available', icon: Building2, avatarBg: 'bg-emerald-500/20 text-emerald-400' },
  { ext: '102', name: 'د. أرثر - العيادة 1 (Dr. Arthur)', role: 'Chief Dentist', status: 'available', icon: User, avatarBg: 'bg-rose-500/20 text-rose-400' },
  { ext: '103', name: 'مختبر التركيبات (Dental Lab)', role: 'Lab Tech', status: 'available', icon: FlaskConical, avatarBg: 'bg-cyan-500/20 text-cyan-400' },
  { ext: '104', name: 'الصيدلية (Pharmacy)', role: 'Pharmacist', status: 'busy', icon: Pill, avatarBg: 'bg-amber-500/20 text-amber-400' },
  { ext: '105', name: 'المحاسبة والشؤون (Billing)', role: 'Cashier', status: 'available', icon: CreditCard, avatarBg: 'bg-purple-500/20 text-purple-400' },
];

export default function StaffPhoneIntercom() {
  // Panel States
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'phone' | 'chimes' | 'intercom'>('phone');

  // Phone Call States
  const [dialNumber, setDialNumber] = useState('');
  const [incomingCall, setIncomingCall] = useState<StaffExtension | null>(null);
  const [activeCall, setActiveCall] = useState<{ ext: StaffExtension; duration: number; isMuted: boolean; isHeld: boolean } | null>(null);

  // Push-to-Talk (PTT) State
  const [isPttTalking, setIsPttTalking] = useState(false);
  const [pttTarget, setPttTarget] = useState<string>('all');
  const [pttLog, setPttLog] = useState<{ sender: string; target: string; time: string }[]>([]);

  // Simulation Feedback Toast
  const [feedback, setFeedback] = useState<string | null>(null);

  // Call timer interval reference
  const callTimerRef = useRef<NodeJS.Timeout>();

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  // ── Global Sound Event Listener ──
  useEffect(() => {
    const handleSoundEvent = (e: Event) => {
      const ev = e as CustomEvent;
      if (ev.detail?.type === 'patient_present') {
        playNextPatientPresentChime();
        showToast('🟢 اقتراب الموعد: المريض متواجد وجاهز في الاستقبال!');
      } else if (ev.detail?.type === 'patient_absent') {
        playNextPatientAbsentChime();
        showToast('🟡 تنبيه اقتراب الموعد: المريض لم يصل بعد إلى الاستقبال!');
      } else if (ev.detail?.type === 'new_patient') {
        playNewPatientChime();
        showToast('🔵 تم تسجيل موعد مريض جديد في الاستقبال!');
      } else if (ev.detail?.type === 'doctor_pager') {
        playDoctorPagerChime();
        showToast('🔴 نغمة نداء: الطبيب يطلب الاستقبال فوراً!');
      } else if (ev.detail?.type === 'phone_incoming') {
        triggerSimulatedIncomingCall('101');
      }
    };
    window.addEventListener('healthos_sound_event', handleSoundEvent);
    return () => window.removeEventListener('healthos_sound_event', handleSoundEvent);
  }, []);

  // ── Active Call Timer ──
  useEffect(() => {
    if (activeCall && !activeCall.isHeld) {
      callTimerRef.current = setInterval(() => {
        setActiveCall(prev => prev ? { ...prev, duration: prev.duration + 1 } : null);
      }, 1000);
    } else {
      clearInterval(callTimerRef.current);
    }
    return () => clearInterval(callTimerRef.current);
  }, [activeCall]);

  // ── Dial Extension / Initiate Call ──
  const startCall = (extObj: StaffExtension) => {
    setDialNumber(extObj.ext);
    stopPhoneRingtone();
    setIncomingCall(null);
    playIntercomChirp(true);
    setActiveCall({ ext: extObj, duration: 0, isMuted: false, isHeld: false });
    showToast(`جاري الاتصال بـ ${extObj.name} (Ext ${extObj.ext})...`);
  };

  // ── Answer Incoming Call ──
  const answerCall = () => {
    if (!incomingCall) return;
    stopPhoneRingtone();
    setActiveCall({ ext: incomingCall, duration: 0, isMuted: false, isHeld: false });
    setIncomingCall(null);
    playIntercomChirp(true);
    showToast(`تم الرد على مكالمة ${incomingCall.name}`);
  };

  // ── End / Decline Call ──
  const endCall = () => {
    stopPhoneRingtone();
    playIntercomChirp(false);
    setActiveCall(null);
    setIncomingCall(null);
    showToast('تم إنهاء المكالمة');
  };

  // ── Simulate Incoming Call ──
  const triggerSimulatedIncomingCall = (ext = '101') => {
    const caller = STAFF_EXTENSIONS.find(s => s.ext === ext) || STAFF_EXTENSIONS[0];
    setIncomingCall(caller);
    startPhoneRingtone();
    showToast(`📞 اتصال داخلي وارد من ${caller.name} (Ext ${caller.ext})`);
  };

  // ── Push to Talk Handlers ──
  const handlePttStart = () => {
    setIsPttTalking(true);
    playIntercomChirp(true);
  };

  const handlePttEnd = () => {
    setIsPttTalking(false);
    playIntercomChirp(false);
    const targetName = pttTarget === 'all' ? 'جميع الموظفين (Broadcast)' : `Ext ${pttTarget}`;
    setPttLog(prev => [{ sender: 'أنت (Doctor)', target: targetName, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
    showToast(`تم إرسال نداء لاسلكي إلى ${targetName}`);
  };

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* ── Topbar Trigger Button ── */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(p => !p)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer select-none ${
            activeCall
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
              : incomingCall
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-bounce'
              : 'bg-white/[0.04] border-white/[0.08] text-zinc-300 hover:bg-white/[0.08]'
          }`}
        >
          {activeCall ? (
            <>
              <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-mono text-rose-300">{formatTime(activeCall.duration)}</span>
            </>
          ) : (
            <>
              <Phone className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden md:inline">هاتف الموظفين</span>
            </>
          )}

          {incomingCall && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          )}
        </button>

        {/* ── Main Dropdown Drawer Panel ── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-12 w-96 z-[9999] bg-[#09090e] border border-rose-500/20 rounded-3xl shadow-2xl shadow-black/90 overflow-hidden text-right"
              dir="rtl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/[0.08] bg-zinc-950">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 text-right">
                    <h3 className="text-xs font-bold text-white truncate">الهاتف الداخلي واللاسلكي</h3>
                    <p className="text-[10px] text-zinc-500 font-mono truncate">Internal VoIP & Audio Alerts</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-zinc-500 hover:text-white cursor-pointer shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-white/[0.06] bg-zinc-950/60 p-1 gap-1">
                <button
                  onClick={() => setActiveTab('phone')}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'phone' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Phone className="w-3 h-3" />
                  <span>دليل الهاتف</span>
                </button>
                <button
                  onClick={() => setActiveTab('chimes')}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'chimes' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <BellRing className="w-3 h-3" />
                  <span>الأصوات والتنبيهات</span>
                </button>
                <button
                  onClick={() => setActiveTab('intercom')}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'intercom' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Radio className="w-3 h-3" />
                  <span>اللاسلكي (PTT)</span>
                </button>
              </div>

              {/* Toast Feedback Banner */}
              {feedback && (
                <div className="mx-3 mt-3 px-3 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-[10px] font-medium flex items-center gap-2 animate-fadeIn">
                  <Sparkles className="w-3 h-3 text-rose-400 shrink-0" />
                  <span>{feedback}</span>
                </div>
              )}

              {/* Tab 1: Staff Phone Extension Directory */}
              {activeTab === 'phone' && (
                <div className="p-3 space-y-3">
                  {/* Extension Directory List */}
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {STAFF_EXTENSIONS.map((staff) => {
                      const Icon = staff.icon;
                      const isTargetActive = activeCall?.ext.ext === staff.ext;

                      return (
                        <div
                          key={staff.ext}
                          className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                            isTargetActive
                              ? 'bg-rose-500/15 border-rose-500/40 text-white'
                              : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${staff.avatarBg} shrink-0 font-mono font-bold text-xs`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white truncate">{staff.name}</span>
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400 border border-white/[0.08]">
                                  Ext {staff.ext}
                                </span>
                              </div>
                              <span className="text-[10px] text-zinc-500 block">{staff.role}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => startCall(staff)}
                            disabled={!!activeCall}
                            className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                              isTargetActive
                                ? 'bg-rose-500 text-white border-rose-400'
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Simulator incoming call trigger */}
                  <div className="pt-2 border-t border-white/[0.06]">
                    <button
                      onClick={() => triggerSimulatedIncomingCall('101')}
                      className="w-full py-2 px-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <PhoneIncoming className="w-3.5 h-3.5" />
                      <span>تجربة استقبال مكالمة واردة من الاستقبال 📞</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Sound Effects Preview & Trigger Console */}
              {activeTab === 'chimes' && (
                <div className="p-3 space-y-2.5">
                  <p className="text-[10px] text-zinc-500 font-mono mb-2">نغمات التنبيهات الطبية الفاخرة المخصصة:</p>

                  {/* 🟢 1. Next Patient Present & Ready Chime */}
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-emerald-500/20 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        اقتراب الموعد + المريض متواجد 🟢
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">نغمة ماريمبا دافئة عند حضور المريض وصعوده للانتظار</p>
                    </div>
                    <button
                      onClick={() => playNextPatientPresentChime()}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Play className="w-3 h-3" />
                      <span>تشغيل</span>
                    </button>
                  </div>

                  {/* 🟡 2. Next Patient Absent Warning Chime */}
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-amber-500/20 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                        اقتراب الموعد + المريض غير موجود 🟡
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">تنبيه ناعم مزدوج إذا لم يصل المريض بعد للمستشفى</p>
                    </div>
                    <button
                      onClick={() => playNextPatientAbsentChime()}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Play className="w-3 h-3" />
                      <span>تشغيل</span>
                    </button>
                  </div>

                  {/* 🔵 3. New Patient Booking Chime */}
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-cyan-500/20 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                        تسجيل موعد مريض جديد 🔵
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">نغمة ثلاثية ثلاثية النغم عند حجز الاستقبال لمريض</p>
                    </div>
                    <button
                      onClick={() => playNewPatientChime()}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Play className="w-3 h-3" />
                      <span>تشغيل</span>
                    </button>
                  </div>

                  {/* 🔴 4. Doctor Pager Chime */}
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-rose-500/20 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shrink-0" />
                        نداء الاستقبال الفوري (Pager) 🔴
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">نغمة نداء الطبيب لاستدعاء مريض أو ممرضة</p>
                    </div>
                    <button
                      onClick={() => playDoctorPagerChime()}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Play className="w-3 h-3" />
                      <span>تشغيل</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Push-to-Talk (PTT) Intercom */}
              {activeTab === 'intercom' && (
                <div className="p-4 space-y-4 text-center">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">وجهة البث اللاسلكي:</label>
                    <select
                      value={pttTarget}
                      onChange={(e) => setPttTarget(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                    >
                      <option value="all">📢 كافة الموظفين (General Broadcast)</option>
                      <option value="101">🏢 الاستقبال (Ext 101)</option>
                      <option value="103">🧪 المختبر (Ext 103)</option>
                      <option value="104">💊 الصيدلية (Ext 104)</option>
                    </select>
                  </div>

                  {/* Big Hold-to-Talk Button */}
                  <div className="py-2">
                    <button
                      onMouseDown={handlePttStart}
                      onMouseUp={handlePttEnd}
                      onTouchStart={handlePttStart}
                      onTouchEnd={handlePttEnd}
                      className={`w-28 h-28 mx-auto rounded-full border-2 flex flex-col items-center justify-center transition-all cursor-pointer select-none shadow-2xl ${
                        isPttTalking
                          ? 'bg-rose-600 border-rose-300 text-white scale-105 shadow-rose-500/50'
                          : 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                      }`}
                    >
                      <Radio className={`w-8 h-8 mb-1 ${isPttTalking ? 'animate-bounce' : ''}`} />
                      <span className="text-xs font-bold">{isPttTalking ? 'جاري البث...' : 'اضغط للتحدث'}</span>
                      <span className="text-[9px] opacity-75">Hold to Speak</span>
                    </button>
                  </div>

                  {/* PTT History Log */}
                  {pttLog.length > 0 && (
                    <div className="text-left border-t border-white/[0.06] pt-3">
                      <p className="text-[10px] font-bold text-zinc-500 font-mono mb-1">سجل النداءات الأخيرة:</p>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {pttLog.map((log, i) => (
                          <div key={i} className="text-[10px] font-mono text-zinc-400 flex justify-between bg-white/[0.02] p-1.5 rounded-lg border border-white/[0.04]">
                            <span>{log.sender} → {log.target}</span>
                            <span className="text-zinc-600">{log.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Modal 1: Incoming Phone Call Popup Ringing ── */}
      <AnimatePresence>
        {incomingCall && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 left-6 z-[99999] w-80 bg-zinc-950 border-2 border-amber-500/60 rounded-3xl p-5 shadow-2xl shadow-amber-500/20 text-center"
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-3 animate-bounce">
              <PhoneIncoming className="w-7 h-7" />
            </div>

            <h4 className="text-sm font-bold text-white mb-0.5">مكالمة هاتفية داخلية واردة</h4>
            <p className="text-xs text-amber-300 font-semibold mb-1">{incomingCall.name}</p>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-[10px] mb-4">
              Ext {incomingCall.ext} · {incomingCall.role}
            </span>

            <div className="flex gap-3">
              <button
                onClick={answerCall}
                className="flex-1 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>رد على المكالمة</span>
              </button>
              <button
                onClick={endCall}
                className="flex-1 py-2.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <PhoneOff className="w-4 h-4" />
                <span>رفض</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Banner 2: Active Phone Call Sticky Bar ── */}
      <AnimatePresence>
        {activeCall && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-[99999] bg-zinc-950 border border-rose-500/40 rounded-3xl p-4 shadow-2xl flex items-center gap-4 min-w-[320px]"
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate">{activeCall.ext.name}</span>
                <span className="text-xs font-mono font-bold text-rose-400">{formatTime(activeCall.duration)}</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Ext {activeCall.ext.ext} · مكالمة جارية</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Mute Mic */}
              <button
                onClick={() => setActiveCall(p => p ? { ...p, isMuted: !p.isMuted } : null)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  activeCall.isMuted ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-white/[0.06] border-white/10 text-zinc-400'
                }`}
                title="كتم الصوت"
              >
                {activeCall.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* End Call */}
              <button
                onClick={endCall}
                className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer shadow-lg shadow-rose-600/30"
                title="إنهاء المكالمة"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
