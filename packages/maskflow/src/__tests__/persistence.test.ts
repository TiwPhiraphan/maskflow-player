import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createEventEmitter } from '../core/events';
import { createPersistenceManager } from '../core/features/persistence';
import type { MaskflowPlayer, PlayerEvents, PlayerState } from '../core/types';

describe('PersistenceManager', () => {
  let mockPlayer: MaskflowPlayer;
  let events: ReturnType<typeof createEventEmitter<PlayerEvents>>;

  beforeEach(() => {
    localStorage.clear();
    events = createEventEmitter<PlayerEvents>();

    const mockState: PlayerState = {
      status: 'idle',
      currentTime: 0,
      duration: 0,
      buffered: 0,
      volume: 1,
      muted: false,
      playbackRate: 1,
      isFullscreen: false,
      isPip: false,
      quality: 'auto',
      qualities: [],
      captionsEnabled: false,
      controlsVisible: true,
      aspectRatio: '16/9',
      error: null,
    };

    mockPlayer = {
      getState: vi.fn(() => mockState),
      events,
      setVolume: vi.fn(),
      toggleMute: vi.fn(),
      setRate: vi.fn(),
    } as unknown as MaskflowPlayer;
  });

  it('restores saved volume, muted, and playbackRate', () => {
    localStorage.setItem('maskflow:volume', '0.65');
    localStorage.setItem('maskflow:muted', 'true');
    localStorage.setItem('maskflow:playbackRate', '1.5');

    const manager = createPersistenceManager(mockPlayer, true);

    expect(mockPlayer.setVolume).toHaveBeenCalledWith(0.65);
    expect(mockPlayer.toggleMute).toHaveBeenCalled();
    expect(mockPlayer.setRate).toHaveBeenCalledWith(1.5);

    manager.destroy();
  });

  it('saves changes to localStorage when events fire', () => {
    const manager = createPersistenceManager(mockPlayer, true);

    events.emit('volumechange', { volume: 0.4, muted: false });
    expect(localStorage.getItem('maskflow:volume')).toBe('0.4');
    expect(localStorage.getItem('maskflow:muted')).toBe('false');

    events.emit('ratechange', 2);
    expect(localStorage.getItem('maskflow:playbackRate')).toBe('2');

    manager.destroy();
  });
});
