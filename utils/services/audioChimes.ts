/**
 * HealthOS Advanced Sound Synthesizer Engine (v2)
 * ─────────────────────────────────────────────────────────────
 * Smooth, warm, multi-harmonic bell & marimba audio synthesizer for medical environments.
 * Uses soft attack/release envelopes, sine overtones, and harmonic resonance.
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
 * Helper: Play a warm, organic bell/marimba note with harmonic overtones
 */
function playHarmonicBellNote(freq: number, startTime: number, duration = 0.8, volume = 0.25, type: OscillatorType = 'sine') {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Fundamental frequency
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();

  // 1st Harmonic overtone for warmth
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();

  osc1.type = type;
  osc1.frequency.setValueAtTime(freq, startTime);

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq * 2, startTime); // 1 octave higher overtone

  // Soft attack and smooth exponential decay envelope
  gain1.gain.setValueAtTime(0.0001, startTime);
  gain1.gain.linearRampToValueAtTime(volume, startTime + 0.02); // 20ms soft attack
  gain1.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  gain2.gain.setValueAtTime(0.0001, startTime);
  gain2.gain.linearRampToValueAtTime(volume * 0.35, startTime + 0.02);
  gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.6);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);

  osc1.start(startTime);
  osc2.start(startTime);

  osc1.stop(startTime + duration + 0.05);
  osc2.stop(startTime + duration + 0.05);
}

/**
 * 🟢 1. نغمة اقتراب الموعد + المريض متواجد في الاستقبال وجاهز (Patient Present & Ready)
 * Warm, uplifting 4-note marimba/chime chord (E5 -> G#5 -> B5 -> E6)
 */
export function playNextPatientPresentChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const sequence = [
    { freq: 659.25, time: 0 },    // E5
    { freq: 830.61, time: 0.12 },  // G#5
    { freq: 987.77, time: 0.24 },  // B5
    { freq: 1318.51, time: 0.36 }  // E6
  ];

  sequence.forEach(note => {
    playHarmonicBellNote(note.freq, now + note.time, 1.0, 0.25);
  });
}

/**
 * 🟡 2. نغمة اقتراب الموعد + المريض لم يصل بعد (Patient NOT Present / Late Warning)
 * Soft amber two-pulse warning chime (C5-F5 -> pause -> C5-F5)
 */
export function playNextPatientAbsentChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const sequence = [
    { freq: 523.25, time: 0 },    // C5
    { freq: 698.46, time: 0.14 },  // F5
    { freq: 523.25, time: 0.45 },  // C5
    { freq: 698.46, time: 0.59 }   // F5
  ];

  sequence.forEach(note => {
    playHarmonicBellNote(note.freq, now + note.time, 0.6, 0.22, 'sine');
  });
}

/**
 * 🔵 3. نغمة تسجيل موعد جديد في الاستقبال (New Patient Booking Chime)
 * Elegant 3-note ascending chime (A4 -> C#5 -> E5)
 */
export function playNewPatientChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const sequence = [
    { freq: 440.00, time: 0 },    // A4
    { freq: 554.37, time: 0.14 },  // C#5
    { freq: 659.25, time: 0.28 }   // E5
  ];

  sequence.forEach(note => {
    playHarmonicBellNote(note.freq, now + note.time, 0.9, 0.24);
  });
}

/**
 * 🔴 4. نغمة نداء الاستقبال الفوري (Doctor Pager Call)
 * High-clarity dual-chime tone (F#5 + C#6)
 */
export function playDoctorPagerChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  [0, 0.22].forEach(delay => {
    playHarmonicBellNote(739.99, now + delay, 0.7, 0.28);  // F#5
    playHarmonicBellNote(1108.73, now + delay + 0.05, 0.7, 0.22); // C#6
  });
}

/**
 * 📻 5. Push-to-Talk Intercom Chirp
 */
export function playIntercomChirp(isStart = true) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  playHarmonicBellNote(isStart ? 880 : 587.33, now, 0.15, 0.15);
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

    // Dual soft ring pulse
    [0, 0.16, 0.8, 0.96].forEach(offset => {
      playHarmonicBellNote(587.33, now + offset, 0.4, 0.2); // D5
      playHarmonicBellNote(880.00, now + offset + 0.02, 0.4, 0.15); // A5
    });
  };

  ringOnce();
  activeRingtoneInterval = setInterval(ringOnce, 2400);
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
