/**
 * HealthOS Distinct Medical Audio Synthesizer Engine (v3)
 * ─────────────────────────────────────────────────────────────
 * Designed for maximum auditory contrast so doctors & reception staff can
 * instantly distinguish every alert type by sound signature alone.
 *
 * 🟢 Patient Present : Bright ascending crystal bell (high pitch C6-E6-G6 chord)
 * 🟡 Patient Absent  : Low double wood-block drop (deep low pitch D4-G4)
 * 🔵 New Booking     : Modern triple pulse chime (mid pitch G5-C6)
 * 🔴 Doctor Pager    : Sharp dual-tone medical pager pulse (high pitch F#6)
 * 📞 Phone Ringtone  : Double-ring electronic desk phone
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * 🟢 1. اقتراب الموعد + المريض متواجد وجاهز (Patient Present & Ready)
 * Sound Signature: High-pitch ascending crystal bell (C6 -> E6 -> G6 -> C7)
 * Uplifting, high-pitched, bright chime chord.
 */
export function playNextPatientPresentChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [1046.50, 1318.51, 1567.98, 2093.00]; // C6, E6, G6, C7

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.1);

    gain.gain.setValueAtTime(0.0001, now + idx * 0.1);
    gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.1 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.1);
    osc.stop(now + idx * 0.1 + 0.75);
  });
}

/**
 * 🟡 2. اقتراب الموعد + المريض لم يصل بعد (Patient NOT Present / Absent Warning)
 * Sound Signature: Low deep double wood-block / low marimba drop (D4 -> A3)
 * Completely different timbre (triangle/soft square), low pitch, zero high harmonics.
 */
export function playNextPatientAbsentChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [
    { freq: 293.66, time: 0 },    // D4 (Low)
    { freq: 220.00, time: 0.22 }   // A3 (Even Lower)
  ];

  notes.forEach(note => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle'; // Low warm woodblock feel
    osc.frequency.setValueAtTime(note.freq, now + note.time);

    gain.gain.setValueAtTime(0.0001, now + note.time);
    gain.gain.linearRampToValueAtTime(0.35, now + note.time + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + note.time);
    osc.stop(now + note.time + 0.5);
  });
}

/**
 * 🔵 3. تسجيل موعد مريض جديد في الاستقبال (New Patient Booking)
 * Sound Signature: Modern triple digital pulse (G5 -> C6 -> G6)
 */
export function playNewPatientChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [783.99, 1046.50, 1567.98]; // G5, C6, G6

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.12);

    gain.gain.setValueAtTime(0.0001, now + idx * 0.12);
    gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.12 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.12);
    osc.stop(now + idx * 0.12 + 0.45);
  });
}

/**
 * 🔴 4. نداء الاستقبال الفوري (Doctor Pager Call)
 * Sound Signature: Sharp dual-tone medical pager pulse (F#6 / C#7 sharp call)
 * High clarity, distinctive emergency call beep.
 */
export function playDoctorPagerChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  [0, 0.18].forEach(delay => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1479.98, now + delay); // F#6

    gain.gain.setValueAtTime(0.0001, now + delay);
    gain.gain.linearRampToValueAtTime(0.2, now + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + delay);
    osc.stop(now + delay + 0.14);
  });
}

/**
 * 📻 5. Push-to-Talk Intercom Chirp
 */
export function playIntercomChirp(isStart = true) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(isStart ? 1200 : 600, now);

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.11);
}

/**
 * 📞 6. Internal Phone Electronic Ringtone
 */
let activeRingtoneInterval: NodeJS.Timeout | null = null;

export function startPhoneRingtone() {
  stopPhoneRingtone();

  const ringOnce = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    [0, 0.15, 0.8, 0.95].forEach(offset => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now + offset); // C5

      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.linearRampToValueAtTime(0.25, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.13);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 0.14);
    });
  };

  ringOnce();
  activeRingtoneInterval = setInterval(ringOnce, 2200);
}

export function stopPhoneRingtone() {
  if (activeRingtoneInterval) {
    clearInterval(activeRingtoneInterval);
    activeRingtoneInterval = null;
  }
}

/**
 * Dispatcher helper for global sound triggers
 */
export function triggerSoundEvent(type: 'patient_present' | 'patient_absent' | 'new_patient' | 'doctor_pager' | 'phone_incoming') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('healthos_sound_event', { detail: { type } }));
}
