import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * FRS-SAP-101: Auto-refresh hook.
 * Calls `callback` every `intervalMs` (default 60 000ms) while active.
 * Returns controls for pause/resume and a countdown to next refresh.
 */
export function useAutoRefresh(
  callback: () => void,
  intervalMs = 60_000,
) {
  const [paused, setPaused] = useState(false);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(
    Math.floor(intervalMs / 1000),
  );
  const savedCallback = useRef(callback);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep callback reference current
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const resetCountdown = useCallback(() => {
    setSecondsUntilRefresh(Math.floor(intervalMs / 1000));
  }, [intervalMs]);

  // Main interval
  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      return;
    }

    resetCountdown();

    intervalRef.current = setInterval(() => {
      savedCallback.current();
      resetCountdown();
    }, intervalMs);

    countdownRef.current = setInterval(() => {
      setSecondsUntilRefresh((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [paused, intervalMs, resetCountdown]);

  const pause = useCallback(() => setPaused(true), []);
  const resume = useCallback(() => setPaused(false), []);
  const toggle = useCallback(() => setPaused((p) => !p), []);

  const refreshNow = useCallback(() => {
    savedCallback.current();
    resetCountdown();
  }, [resetCountdown]);

  return {
    paused,
    secondsUntilRefresh,
    pause,
    resume,
    toggle,
    refreshNow,
  };
}
