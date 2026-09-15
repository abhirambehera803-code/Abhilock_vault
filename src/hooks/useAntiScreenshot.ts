import { useState, useEffect, useCallback } from 'react';
import { storageService } from '../services/storageService';

interface UseAntiScreenshotOptions {
  enabled: boolean;
  fileTitle: string;
  userName: string;
}

export function useAntiScreenshot({ enabled, fileTitle, userName }: UseAntiScreenshotOptions) {
  const [isShieldActive, setIsShieldActive] = useState(false);
  const [shieldReason, setShieldReason] = useState<string>('');
  const [violationCount, setViolationCount] = useState(0);

  const triggerShield = useCallback((reason: string, actionType: 'screenshot_attempt' | 'screen_recording_detected' | 'print_blocked' | 'window_unfocused') => {
    if (!enabled) return;

    setIsShieldActive(true);
    setShieldReason(reason);
    setViolationCount(prev => prev + 1);

    // Try to clear clipboard if document is focused and API is supported
    try {
      if (typeof document !== 'undefined' && document.hasFocus && document.hasFocus() && navigator?.clipboard?.writeText) {
        navigator.clipboard
          .writeText('⚠️ PROTECTED CONTENT: Copying and screen capture are strictly prohibited by LockVault DRM.')
          .catch(() => {
            // Silently catch focus loss or clipboard permission denial
          });
      }
    } catch {
      // Silently ignore any synchronous clipboard failure
    }

    // Log to security audit
    storageService.logSecurityEvent({
      userName,
      fileTitle,
      action: actionType,
      details: reason,
    });
  }, [enabled, fileTitle, userName]);

  const dismissShield = useCallback(() => {
    setIsShieldActive(false);
    setShieldReason('');
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // 1. Keyboard shortcut interception
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        triggerShield('PrintScreen Key Pressed! Screenshot attempt blocked.', 'screenshot_attempt');
        return;
      }

      // Windows Snipping Tool (Win + Shift + S) or Mac (Cmd + Shift + 3/4/5)
      if ((e.shiftKey && (e.metaKey || e.ctrlKey) && (e.key === 'S' || e.key === 's' || e.key === '3' || e.key === '4' || e.key === '5'))) {
        e.preventDefault();
        e.stopPropagation();
        triggerShield('Screen Snipping Shortcut Intercepted (Shift + Cmd/Ctrl + S)! Content protected.', 'screenshot_attempt');
        return;
      }

      // Print (Ctrl+P or Cmd+P)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        triggerShield('Print action blocked. Document printing is disabled for this protected file.', 'print_blocked');
        return;
      }

      // Save page (Ctrl+S or Cmd+S)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        triggerShield('Direct file saving blocked. Content is protected from offline extraction.', 'screenshot_attempt');
        return;
      }
    };

    let blurTimeout: ReturnType<typeof setTimeout> | null = null;

    const isMobileDevice = typeof window !== 'undefined' && (
      'ontouchstart' in window || 
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '')
    );

    // 2. Window blur & visibility changes (often happens when snipping tool / screen recorder opens)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerShield('Application lost focus or screen recording tool active. Content hidden.', 'window_unfocused');
      }
    };

    const handleWindowBlur = () => {
      // On touch mobile devices, scrolling or touching the address bar fires blur events.
      // Only trigger shield on mobile if document is truly hidden (switched away).
      if (isMobileDevice) {
        if (document.hidden) {
          triggerShield('Background capture intercepted.', 'window_unfocused');
        }
        return;
      }

      // Desktop: delay slightly to prevent false triggers during iframe click interactions
      if (blurTimeout) clearTimeout(blurTimeout);
      blurTimeout = setTimeout(() => {
        if (!document.hasFocus() || document.hidden) {
          triggerShield('Window focus lost. Content hidden to prevent third-party screen capture.', 'window_unfocused');
        }
      }, 600);
    };

    const handleWindowFocus = () => {
      if (blurTimeout) {
        clearTimeout(blurTimeout);
        blurTimeout = null;
      }
    };

    // 3. Before print event
    const handleBeforePrint = (e: Event) => {
      e.preventDefault();
      triggerShield('Print dialogue intercepted. Export disabled.', 'print_blocked');
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('beforeprint', handleBeforePrint);

    return () => {
      if (blurTimeout) clearTimeout(blurTimeout);
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('beforeprint', handleBeforePrint);
    };
  }, [enabled, triggerShield]);

  return {
    isShieldActive,
    shieldReason,
    dismissShield,
    violationCount,
    triggerShield,
  };
}
