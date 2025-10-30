import { useState, useRef, useEffect, useCallback } from "react";

interface UseReadingTimerProps {
  onTimerEnd?: () => void;
}

interface TimerState {
  enabled: boolean;
  duration: number; // in minutes
  remaining: number; // in seconds
  active: boolean;
}

interface UseReadingTimerReturn {
  timer: TimerState;
  actions: {
    setEnabled: (enabled: boolean) => void;
    setDuration: (duration: number) => void;
    start: () => void;
    stop: () => void;
  };
  formatTimer: (seconds: number) => string;
}

export function useReadingTimer({ onTimerEnd }: UseReadingTimerProps = {}): UseReadingTimerReturn {
  // Timer state
  const [timer, setTimer] = useState<TimerState>({
    enabled: false,
    duration: 10, // Default 10 minutes
    remaining: 0,
    active: false,
  });

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format seconds to MM:SS display
  const formatTimer = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Start timer countdown
  const startTimer = useCallback(() => {
    if (!timer.enabled || timer.duration <= 0) return;

    setTimer(prev => ({
      ...prev,
      remaining: timer.duration * 60, // Convert minutes to seconds
      active: true,
    }));
  }, [timer.enabled, timer.duration]);

  // Stop timer
  const stopTimer = useCallback(() => {
    setTimer(prev => ({
      ...prev,
      active: false,
      remaining: 0,
    }));

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // Set timer enabled state
  const setTimerEnabled = useCallback((enabled: boolean) => {
    setTimer(prev => ({ ...prev, enabled }));
  }, []);

  // Set timer duration
  const setTimerDuration = useCallback((duration: number) => {
    setTimer(prev => ({ ...prev, duration }));
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (timer.active && timer.remaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev.remaining <= 1) {
            // Timer finished
            stopTimer();
            onTimerEnd?.();
            return {
              ...prev,
              active: false,
              remaining: 0,
            };
          }
          return {
            ...prev,
            remaining: prev.remaining - 1,
          };
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [timer.active, timer.remaining, stopTimer, onTimerEnd]);

  return {
    timer,
    actions: {
      setEnabled: setTimerEnabled,
      setDuration: setTimerDuration,
      start: startTimer,
      stop: stopTimer,
    },
    formatTimer,
  };
}