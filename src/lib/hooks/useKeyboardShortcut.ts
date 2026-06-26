/**
 * Register global keyboard shortcuts with modifier key support.
 *
 * Automatically maps Ctrl to Cmd on macOS.
 */

import { useEffect, useRef } from 'react';

interface Modifiers {
  readonly ctrl?: boolean;
  readonly shift?: boolean;
  readonly alt?: boolean;
}

const isMac =
  typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

/**
 * Registers a keyboard shortcut listener on `document`.
 *
 * @param key - The `KeyboardEvent.key` value to match (case-insensitive).
 * @param callback - Invoked when the shortcut fires.
 * @param modifiers - Optional modifier keys. `ctrl` maps to Meta on macOS.
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  modifiers: Modifiers = {},
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const { ctrl = false, shift = false, alt = false } = modifiers;

      // On Mac, map ctrl requirement to metaKey (Cmd)
      const ctrlPressed = isMac ? event.metaKey : event.ctrlKey;

      if (ctrl && !ctrlPressed) return;
      if (!ctrl && ctrlPressed) return;
      if (shift && !event.shiftKey) return;
      if (!shift && event.shiftKey) return;
      if (alt && !event.altKey) return;
      if (!alt && event.altKey) return;

      if (event.key.toLowerCase() !== key.toLowerCase()) return;

      event.preventDefault();
      callbackRef.current();
    };

    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [key, modifiers.ctrl, modifiers.shift, modifiers.alt]); // eslint-disable-line react-hooks/exhaustive-deps
}
