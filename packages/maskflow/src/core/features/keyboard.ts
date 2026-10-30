import type { MaskflowPlayer } from '../types';

export interface KeyboardManager {
  enable(): void;
  disable(): void;
  destroy(): void;
}

export function createKeyboardManager(
  container: HTMLElement,
  player: MaskflowPlayer,
  enabled = true,
): KeyboardManager {
  let isEnabled = enabled;

  function isInputFocused(event: KeyboardEvent): boolean {
    const target = event.target as HTMLElement | null;
    if (!target) return false;
    const tagName = target.tagName.toLowerCase();
    return (
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      target.isContentEditable
    );
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (!isEnabled) return;
    if (isInputFocused(event)) return;

    // Check if event is on the container or container is focused/hovered
    const currentTarget = event.currentTarget as HTMLElement | null;
    const isDirect = currentTarget === container || event.target === container;
    const doc = typeof document !== 'undefined' ? document : null;
    const activeEl = doc?.activeElement;
    const hasFocus = activeEl && (activeEl === container || container.contains(activeEl));

    let isHovered = false;
    try {
      isHovered = Boolean(container.matches?.(':hover'));
    } catch {
      // Ignore pseudo-class errors in test environments
    }

    if (!isDirect && !hasFocus && !isHovered) {
      return;
    }

    const key = event.key;

    switch (key) {
      case ' ':
      case 'k':
      case 'K':
        event.preventDefault();
        player.toggle();
        break;

      case 'ArrowLeft':
        event.preventDefault();
        player.seekBy(-5);
        break;

      case 'ArrowRight':
        event.preventDefault();
        player.seekBy(5);
        break;

      case 'j':
      case 'J':
        event.preventDefault();
        player.seekBy(-10);
        break;

      case 'l':
      case 'L':
        event.preventDefault();
        player.seekBy(10);
        break;

      case 'ArrowUp':
        event.preventDefault();
        player.setVolume(Math.round((player.getState().volume + 0.05) * 100) / 100);
        break;

      case 'ArrowDown':
        event.preventDefault();
        player.setVolume(Math.round((player.getState().volume - 0.05) * 100) / 100);
        break;

      case 'm':
      case 'M':
        event.preventDefault();
        player.toggleMute();
        break;

      case 'f':
      case 'F':
        event.preventDefault();
        player.toggleFullscreen();
        break;

      case 'c':
      case 'C':
        event.preventDefault();
        player.toggleCaptions();
        break;

      case 'p':
      case 'P':
      case 'i':
      case 'I':
        event.preventDefault();
        player.togglePip();
        break;

      case 'Home':
        event.preventDefault();
        player.seek(0);
        break;

      case 'End': {
        event.preventDefault();
        const duration = player.getState().duration;
        if (duration > 0) {
          player.seek(duration);
        }
        break;
      }

      case '<':
      case ',':
        if (event.shiftKey || key === '<') {
          event.preventDefault();
          const currentRate = player.getState().playbackRate;
          player.setRate(Math.max(0.25, currentRate - 0.25));
        } else if (player.getState().status === 'paused') {
          event.preventDefault();
          player.seek(Math.max(0, player.getState().currentTime - 0.04));
        }
        break;

      case '>':
      case '.':
        if (event.shiftKey || key === '>') {
          event.preventDefault();
          const currentRate = player.getState().playbackRate;
          player.setRate(Math.min(4, currentRate + 0.25));
        } else if (player.getState().status === 'paused') {
          event.preventDefault();
          player.seek(Math.min(player.getState().duration, player.getState().currentTime + 0.04));
        }
        break;

      case '?':
      case '/':
        if (event.shiftKey || key === '?') {
          event.preventDefault();
          player.events.emit('toggleshortcuts', undefined);
        }
        break;

      default:
        // Handle numeric jump 0-9
        if (/^[0-9]$/.test(key)) {
          event.preventDefault();
          const percent = parseInt(key, 10) * 0.1;
          const duration = player.getState().duration;
          if (duration > 0) {
            player.seek(duration * percent);
          }
        }
        break;
    }
  }

  // Make container focusable if not already
  if (!container.hasAttribute('tabindex')) {
    container.setAttribute('tabindex', '0');
  }

  container.addEventListener('keydown', handleKeyDown);

  return {
    enable(): void {
      isEnabled = true;
    },
    disable(): void {
      isEnabled = false;
    },
    destroy(): void {
      container.removeEventListener('keydown', handleKeyDown);
    },
  };
}
