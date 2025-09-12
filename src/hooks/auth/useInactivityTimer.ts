import { useEffect, useRef, useCallback } from 'react';

interface UseInactivityTimerProps {
  timeout: number; // timeout in milliseconds
  onTimeout: () => void;
  isActive: boolean; // whether the timer should be active
}

export const useInactivityTimer = ({ 
  timeout, 
  onTimeout, 
  isActive 
}: UseInactivityTimerProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(isActive);

  // Update the ref when isActive changes
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  // Clear existing timeout
  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Start or restart the timer
  const resetTimer = useCallback(() => {
    clearTimer();
    
    if (isActiveRef.current) {
      timeoutRef.current = setTimeout(() => {
        if (isActiveRef.current) {
          onTimeout();
        }
      }, timeout);
    }
  }, [timeout, onTimeout, clearTimer]);

  // Activity event handler
  const handleActivity = useCallback(() => {
    if (isActiveRef.current) {
      resetTimer();
    }
  }, [resetTimer]);

  useEffect(() => {
    if (!isActive) {
      clearTimer();
      return;
    }

    // List of events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown'
    ];

    // Start the timer initially
    resetTimer();

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup function
    return () => {
      clearTimer();
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [isActive, handleActivity, resetTimer, clearTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    resetTimer,
    clearTimer
  };
};
