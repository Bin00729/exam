import { useEffect, useRef, useState, useCallback } from 'react';
import { ProctoringViolationType, SecurityIncident } from '../types/exam';

interface UseProctoringOptions {
  isActive: boolean;
  maxStrikes?: number;
  onViolation?: (incident: SecurityIncident, newStrikeCount: number) => void;
  onMaxStrikesExceeded?: () => void;
}

export function useProctoring({
  isActive,
  maxStrikes = 3,
  onViolation,
  onMaxStrikesExceeded,
}: UseProctoringOptions) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [strikes, setStrikes] = useState(0);
  const [activeWarning, setActiveWarning] = useState<SecurityIncident | null>(null);
  const [isLockedOut, setIsLockedOut] = useState(false);

  const blurTimestampRef = useRef<number | null>(null);
  const hiddenTimestampRef = useRef<number | null>(null);
  const strikesRef = useRef(0);
  strikesRef.current = strikes;

  const registerIncident = useCallback(
    (
      type: ProctoringViolationType,
      description: string,
      severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
      durationAwaySeconds?: number
    ) => {
      const incident: SecurityIncident = {
        id: `inc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type,
        timestamp: Date.now(),
        description,
        severity,
        durationAwaySeconds,
      };

      const newStrikes = strikesRef.current + 1;
      setStrikes(newStrikes);
      setIncidents((prev) => [incident, ...prev]);
      setActiveWarning(incident);

      if (onViolation) {
        onViolation(incident, newStrikes);
      }

      if (newStrikes >= maxStrikes) {
        setIsLockedOut(true);
        if (onMaxStrikesExceeded) {
          onMaxStrikesExceeded();
        }
      }

      return incident;
    },
    [maxStrikes, onViolation, onMaxStrikesExceeded]
  );

  // Request Fullscreen
  const enterFullscreen = useCallback(async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        await (elem as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
      return true;
    } catch (err) {
      console.warn('Fullscreen request rejected or blocked by browser:', err);
      return false;
    }
  }, []);

  // Exit Fullscreen programmatically (when exam ends)
  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
    } catch (err) {
      console.warn('Error exiting fullscreen:', err);
    }
  }, []);

  const dismissWarning = useCallback(() => {
    setActiveWarning(null);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    // 1. Fullscreen change listener
    const handleFullscreenChange = () => {
      const isCurrentFS = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      setIsFullscreen(isCurrentFS);

      if (!isCurrentFS && isActive) {
        registerIncident(
          'fullscreen_exit',
          'Candidate exited fullscreen mode. The examination must remain in fullscreen at all times.',
          'high'
        );
      }
    };

    // 2. Tab switch / Visibility change listener
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        hiddenTimestampRef.current = Date.now();
      } else if (document.visibilityState === 'visible' && hiddenTimestampRef.current) {
        const awayMs = Date.now() - hiddenTimestampRef.current;
        const awaySec = Math.max(1, Math.round(awayMs / 1000));
        hiddenTimestampRef.current = null;

        registerIncident(
          'tab_switch',
          `Tab switch detected. Candidate navigated away from exam window for ${awaySec} second(s).`,
          awaySec > 3 ? 'critical' : 'high',
          awaySec
        );
      }
    };

    // 3. Window blur listener (app switching, clicking outside)
    const handleWindowBlur = () => {
      blurTimestampRef.current = Date.now();
    };

    const handleWindowFocus = () => {
      if (blurTimestampRef.current) {
        const awayMs = Date.now() - blurTimestampRef.current;
        const awaySec = Math.round(awayMs / 1000);
        blurTimestampRef.current = null;

        if (awaySec >= 1 && document.visibilityState === 'visible') {
          // If visibility was already triggered, don't duplicate
          registerIncident(
            'window_blur',
            `Focus lost. Candidate clicked outside the exam interface for ${awaySec} second(s).`,
            'medium',
            awaySec
          );
        }
      }
    };

    // 4. Context menu (right click) prevention
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      registerIncident(
        'copy_paste_attempt',
        'Right-click context menu was intercepted and blocked.',
        'low'
      );
    };

    // 5. Copy & Cut prevention
    const handleCopyCut = (e: ClipboardEvent) => {
      e.preventDefault();
      registerIncident(
        'copy_paste_attempt',
        `Unauthorized ${e.type.toUpperCase()} command attempted. Exam materials are protected.`,
        'medium'
      );
    };

    // 6. Paste prevention
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      registerIncident(
        'copy_paste_attempt',
        'External clipboard PASTE attempted. Answers must be typed directly.',
        'medium'
      );
    };

    // 7. Developer tools & restricted shortcut prevention
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        registerIncident('devtools_opened', 'F12 DevTools key press intercepted.', 'critical');
        return;
      }

      // Ctrl+Shift+I or Cmd+Opt+I (DevTools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c' || e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
        registerIncident('devtools_opened', 'DevTools inspect shortcut intercepted.', 'critical');
        return;
      }

      // Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        registerIncident('devtools_opened', 'View page source shortcut intercepted.', 'medium');
        return;
      }

      // Print Screen detection
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        registerIncident('copy_paste_attempt', 'Screenshot attempt (PrintScreen) intercepted.', 'high');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopyCut);
    window.addEventListener('cut', handleCopyCut);
    window.addEventListener('paste', handlePaste);
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopyCut);
      window.removeEventListener('cut', handleCopyCut);
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isActive, registerIncident]);

  return {
    isFullscreen,
    incidents,
    strikes,
    activeWarning,
    isLockedOut,
    enterFullscreen,
    exitFullscreen,
    dismissWarning,
    registerIncident,
    setStrikes,
    setIsLockedOut,
  };
}
