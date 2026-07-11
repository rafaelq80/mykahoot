import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/useGameStore';

/**
 * Drives the countdown timer in the game store.
 * Must be mounted once at the app level (e.g. in the question page).
 */
export function useCountdown() {
  const timer = useGameStore((s) => s.timer);
  const setTimer = useGameStore((s) => s.setTimer);
  const screen = useGameStore((s) => s.screen);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start/stop interval based on screen and timer value
  useEffect(() => {
    if (screen !== 'question' || timer <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (timerRef.current) return; // already running

    timerRef.current = setInterval(() => {
      const current = useGameStore.getState().timer;
      if (current <= 1) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        setTimer(0);
      } else {
        setTimer(current - 1);
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [screen, timer, setTimer]);
}
