import type { MusicPhase } from '../constants';

type SynthKind = 'lobby' | 'question' | 'podium';

const activeLoops = new Map<SynthKind, { stop: () => void }>();

function startLoop(
  kind: SynthKind,
  volume: number,
  ctx: AudioContext,
): { stop: () => void } {
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(ctx.destination);

  const oscillators: OscillatorNode[] = [];

  const notes: Record<SynthKind, number[]> = {
    lobby: [220, 277.18, 329.63],
    question: [330, 392, 466.16],
    podium: [261.63, 329.63, 392, 523.25],
  };

  for (const freq of notes[kind]) {
    const osc = ctx.createOscillator();
    osc.type = kind === 'question' ? 'square' : 'sine';
    osc.frequency.value = freq;
    const oscGain = ctx.createGain();
    oscGain.gain.value = kind === 'podium' ? 0.08 : 0.05;
    osc.connect(oscGain);
    oscGain.connect(gain);
    osc.start();
    oscillators.push(osc);
  }

  const targetVol = volume * (kind === 'question' ? 0.35 : 0.25);
  gain.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 0.4);

  return {
    stop: () => {
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.35);
      setTimeout(() => {
        oscillators.forEach((o) => {
          try {
            o.stop();
          } catch {
            /* already stopped */
          }
        });
        void ctx.close();
      }, 400);
    },
  };
}

let sharedCtx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!sharedCtx || sharedCtx.state === 'closed') {
    sharedCtx = new AudioContext();
  }
  return sharedCtx;
}

export function playSynthLoop(phase: MusicPhase, volume: number): (() => void) | null {
  if (phase === 'idle' || phase === 'result') return null;

  const kind: SynthKind =
    phase === 'question' ? 'question' : phase === 'podium' ? 'podium' : 'lobby';

  for (const [key, loop] of activeLoops) {
    if (key !== kind) {
      loop.stop();
      activeLoops.delete(key);
    }
  }

  if (activeLoops.has(kind)) return () => activeLoops.get(kind)?.stop();

  const ctx = getContext();
  void ctx.resume();
  const loop = startLoop(kind, volume, ctx);
  activeLoops.set(kind, loop);
  return () => {
    loop.stop();
    activeLoops.delete(kind);
  };
}

export function playSynthSting(correct: boolean, volume: number): void {
  const ctx = getContext();
  void ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'triangle';
  osc.frequency.value = correct ? 880 : 220;
  gain.gain.value = volume * 0.4;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
  osc.start();
  osc.stop(ctx.currentTime + 0.35);
}

export function stopAllSynth(): void {
  for (const loop of activeLoops.values()) loop.stop();
  activeLoops.clear();
}
