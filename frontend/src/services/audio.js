let audioCtx = null;
let alarmInterval = null;
let currentVolume = 0.8;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function startAlarmAudio(soundType = 'energetic', volume = 0.8) {
  stopAlarmAudio();
  currentVolume = volume;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    let step = 0;
    const intervalMs = soundType === 'digital' ? 250 : soundType === 'gentle' ? 500 : 200;

    alarmInterval = setInterval(() => {
      if (!audioCtx || audioCtx.state === 'closed') return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(currentVolume, now);

      if (soundType === 'energetic') {
        const freqs = [880, 1046.5, 1318.5, 1760];
        const freq = freqs[step % freqs.length];
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (soundType === 'digital') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(1000, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.14);
      } else if (soundType === 'gentle') {
        const chimes = [523.25, 659.25, 783.99, 1046.50];
        const freq = chimes[step % chimes.length];
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.45);
      } else { // Cyber Pulse / default
        const freq = (step % 2 === 0) ? 600 : 1200;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.18);
      }

      step++;
    }, intervalMs);

  } catch (err) {
    console.error("Web Audio Playback error:", err);
  }
}

export function stopAlarmAudio() {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
}

export function previewSound(soundType = 'energetic') {
  startAlarmAudio(soundType, 0.7);
  setTimeout(() => {
    stopAlarmAudio();
  }, 2000);
}
