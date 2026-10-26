import { getSnapshot } from './storage';

let ctx: AudioContext | null = null;

export function playTone(freq: number, duration = 0.12, type: OscillatorType = 'sine') {
  if (!getSnapshot().settings.sound) return;
  const AudioCtx = window.AudioContext;
  if (!ctx) ctx = new AudioCtx();
  if (ctx.state === 'suspended') void ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.045, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}
