import { useEffect, useRef } from 'react';
import { FADE_MS, TRACKS, type MusicPhase } from '../constants';
import { playSynthLoop, playSynthSting, stopAllSynth } from '../utils/synthAudio';
import { useSettingsStore } from '../../../stores/useSettingsStore';

export function useBackgroundMusic(
  phase: MusicPhase,
  musicEnabledByAdmin: boolean,
): void {
  const localMuted = useSettingsStore((s) => s.localMuted);
  const volume = useSettingsStore((s) => s.volume);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthStopRef = useRef<(() => void) | null>(null);

  const effectiveEnabled = musicEnabledByAdmin && !localMuted;

  useEffect(() => {
    const cleanup = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      synthStopRef.current?.();
      synthStopRef.current = null;
    };

    if (!effectiveEnabled || phase === 'idle') {
      cleanup();
      stopAllSynth();
      return cleanup;
    }

    let cancelled = false;
    const trackSrc =
      phase === 'result' ? TRACKS.lobby : TRACKS[phase as keyof typeof TRACKS];

    const startSynth = () => {
      if (cancelled) return;
      synthStopRef.current?.();
      synthStopRef.current = playSynthLoop(phase, volume);
    };

    if (trackSrc) {
      const audio = new Audio(trackSrc);
      audio.loop = true;
      audio.preload = 'none';
      audio.volume = 0;
      audioRef.current = audio;

      void audio
        .play()
        .then(() => {
          if (cancelled) return;
          const steps = 20;
          const stepMs = FADE_MS / steps;
          let step = 0;
          const fadeIn = setInterval(() => {
            step += 1;
            if (!audioRef.current) {
              clearInterval(fadeIn);
              return;
            }
            audioRef.current.volume = (volume * step) / steps;
            if (step >= steps) clearInterval(fadeIn);
          }, stepMs);
        })
        .catch(() => {
          if (!cancelled) startSynth();
        });
    } else {
      startSynth();
    }

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [phase, effectiveEnabled, volume]);

  useEffect(
    () => () => {
      if (audioRef.current) audioRef.current.pause();
      synthStopRef.current?.();
      stopAllSynth();
    },
    [],
  );
}

export function playSting(correct: boolean, musicEnabledByAdmin: boolean): void {
  const { localMuted, volume } = useSettingsStore.getState();
  if (!musicEnabledByAdmin || localMuted) return;

  const src = correct ? '/audio/correct-sting.mp3' : '/audio/wrong-sting.mp3';
  const audio = new Audio(src);
  audio.volume = volume * 0.8;
  void audio.play().catch(() => playSynthSting(correct, volume));
}
