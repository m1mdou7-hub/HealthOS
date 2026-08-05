/**
 * HealthOS Audio Chimes & Sound Synthesizer Service
 * ─────────────────────────────────────────────────────────────
 * Uses native Web Audio API (AudioContext) for 100% reliable, zero-latency
 * medical notification chimes, phone ringtones, and pager beeps without external MP3 dependencies.
 */

// Global AudioContext singleton instance
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
 * 🟢 1. New Patient Booking Chime (Ascending 3-tone harmonic chime)
 * Played when Reception registers a new patient appointment for the doctor.
 */
export function playNewPatientChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.12);

    gain.gain.setValueAtTime(0.01, now + idx * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.3, now + idx * 0.12 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.12);
    osc.stop(now + idx * 0.12 + 0.45);
  });
}

/**
 * 🟡 2. Upcoming Appointment Warning Chime (Dual alert pulse tone)
 * Played 5 minutes before the next patient's appointment time.
 */
export function playAppointmentWarningChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const pulses = [
    { freq: 440, time: 0 },       // A4
    { freq: 880, time: 0.18 },    // A5
    { freq: 440, time: 0.36 },    // A4
    { freq: 880, time: 0.54 }     // A5
  ];

  pulses.forEach(p => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(p.freq, now + p.time);

    gain.gain.setValueAtTime(0.01, now + p.time);
    gain.gain.linearRampToValueAtTime(0.25, now + p.time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + p.time + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + p.time);
    osc.stop(now + p.time + 0.16);
  });
}

/**
 * 🔴 3. Doctor Pager Call Chime (Attention dual-frequency medical pager)
 * Played when Doctor summons Reception or vice versa.
 */
export function playDoctorPagerChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  [0, 0.25].forEach(delay => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'square';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(1046.50, now + delay); // C6
    osc2.frequency.setValueAtTime(1318.51, now + delay); // E6

    gain.gain.setValueAtTime(0.01, now + delay);
    gain.gain.linearRampToValueAtTime(0.2, now + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.18);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now + delay);
    osc2.start(now + delay);

    osc1.stop(now + delay + 0.2);
    osc2.stop(now + delay + 0.2);
  });
}

/**
 * 📻 4. Push-to-Talk Intercom Chirp
 * Walkie-talkie start/end transmission chirp sound.
 */
export function playIntercomChirp(isStart = true) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  const startFreq = isStart ? 1200 : 800;
  const endFreq = isStart ? 1600 : 500;

  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08);

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.1);
}

/**
 * 📞 5. Internal Phone Electronic Ringtone
 * Loopable ringing sound generator for incoming internal VoIP staff calls.
 */

let activeRingtoneInterval: NodeJS.Timeout | null = null;

export function startPhoneRingtone() {
  stopPhoneRingtone();

  const ringOnce = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Dual-tone US/EU phone ringing frequencies (440Hz + 480Hz)
    [0, 0.15, 0.8, 0.95].forEach(offset => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(440, now + offset);
      osc2.frequency.setValueAtTime(480, now + offset);

      gain.gain.setValueAtTime(0.01, now + offset);
      gain.gain.linearRampToValueAtTime(0.2, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now + offset);
      osc2.start(now + offset);
      osc1.stop(now + offset + 0.13);
      osc2.stop(now + offset + 0.13);
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
 * Dispatcher helper for global application audio event triggers
 */
export function triggerSoundEvent(type: 'new_patient' | 'appointment_warning' | 'doctor_pager' | 'phone_incoming') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('healthos_sound_event', { detail: { type } }));
}
