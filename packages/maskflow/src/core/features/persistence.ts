import type { MaskflowPlayer } from '../types';

export interface PersistenceManager {
  restore(): void;
  destroy(): void;
}

const STORAGE_KEYS = {
  VOLUME: 'maskflow:volume',
  MUTED: 'maskflow:muted',
  RATE: 'maskflow:playbackRate',
};

function getStorageItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // Ignore storage errors (e.g. private browsing)
  }
  return null;
}

function setStorageItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Ignore storage errors
  }
}

export function createPersistenceManager(
  player: MaskflowPlayer,
  enabled = true,
): PersistenceManager {
  if (!enabled) {
    return {
      restore: () => {},
      destroy: () => {},
    };
  }

  function restore(): void {
    const savedVolume = getStorageItem(STORAGE_KEYS.VOLUME);
    if (savedVolume !== null) {
      const v = parseFloat(savedVolume);
      if (!Number.isNaN(v)) {
        player.setVolume(v);
      }
    }

    const savedMuted = getStorageItem(STORAGE_KEYS.MUTED);
    if (savedMuted !== null) {
      const isMuted = savedMuted === 'true';
      if (player.getState().muted !== isMuted) {
        player.toggleMute();
      }
    }

    const savedRate = getStorageItem(STORAGE_KEYS.RATE);
    if (savedRate !== null) {
      const r = parseFloat(savedRate);
      if (!Number.isNaN(r)) {
        player.setRate(r);
      }
    }
  }

  // Listen to changes and persist
  const unsubVolume = player.events.on('volumechange', ({ volume, muted }) => {
    setStorageItem(STORAGE_KEYS.VOLUME, volume.toString());
    setStorageItem(STORAGE_KEYS.MUTED, muted.toString());
  });

  const unsubRate = player.events.on('ratechange', (rate) => {
    setStorageItem(STORAGE_KEYS.RATE, rate.toString());
  });

  // Restore saved values initially
  restore();

  return {
    restore,
    destroy(): void {
      unsubVolume();
      unsubRate();
    },
  };
}
