import { useEffect, useRef } from 'react';
import { FADE_MS, TRACKS, STINGS, type MusicPhase } from '../constants';
import { useSettingsStore } from '../store/useSettingsStore';

/**
 * Background music hook — plays static audio files only.
 * No Web Audio API synthesizer fallback: if the file fails to load/play,
 * it simply does nothing (the browser may block autoplay until interaction).
 *
 * IMPORTANT: This hook should only be mounted in the PROFESSOR's device
 * (AdminPage), not in the player's device. The professor shares screen/audio
 * with the class.
 */
export function useBackgroundMusic(
  phase: MusicPhase,
  musicEnabledByAdmin: boolean,
): void {
  const localMuted = useSettingsStore((s) => s.localMuted);
  const volume = useSettingsStore((s) => s.volume);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const effectiveEnabled = musicEnabledByAdmin && !localMuted;

  useEffect(() => {
    const cleanup = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };

    if (!effectiveEnabled || phase === 'idle') {
      cleanup();
      return cleanup;
    }

    const trackSrc = TRACKS[phase as keyof typeof TRACKS];
    if (!trackSrc) {
      cleanup();
      return cleanup;
    }

    let cancelled = false;
    const audio = new Audio(trackSrc);
    audio.loop = true;
    audio.preload = 'none';
    audio.volume = 0;
    audioRef.current = audio;

    void audio
      .play()
      .then(() => {
        if (cancelled) return;
        // Fade in
        const steps = 20;
        const stepMs = FADE_MS / steps;
        let step = 0;
        const fadeIn = setInterval(() => {
          step += 1;
          if (!audioRef.current || cancelled) {
            clearInterval(fadeIn);
            return;
          }
          audioRef.current.volume = Math.min(1, (volume * step) / steps);
          if (step >= steps) clearInterval(fadeIn);
        }, stepMs);
      })
      .catch(() => {
        // Static file failed — fail silently (no synth fallback)
        console.warn(`[useBackgroundMusic] Failed to play: ${trackSrc}`);
      });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [phase, effectiveEnabled, volume]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    },
    [],
  );
}

/**
 * Play a short sting sound (correct/wrong answer feedback).
 * This runs on the STUDENT's device. No synth fallback — if the file
 * fails, log a warning and do nothing.
 */
export function playSting(correct: boolean, musicEnabledByAdmin: boolean): void {
  const { localMuted, volume } = useSettingsStore.getState();
  if (!musicEnabledByAdmin || localMuted) return;

  const src = correct ? STINGS.correct : STINGS.wrong;
  const audio = new Audio(src);
  audio.volume = volume * 0.8;
  void audio.play().catch(() => {
    console.warn(`[playSting] Failed to play: ${src}`);
  });
}
