import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createKeyboardManager } from '../core/features/keyboard';
import type { MaskflowPlayer, PlayerState } from '../core/types';

describe('KeyboardManager', () => {
  let container: HTMLDivElement;
  let mockPlayer: MaskflowPlayer;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    container.focus();

    const mockState: PlayerState = {
      status: 'playing',
      currentTime: 20,
      duration: 100,
      buffered: 0.5,
      volume: 0.8,
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
      play: vi.fn(),
      pause: vi.fn(),
      toggle: vi.fn(),
      seek: vi.fn(),
      seekBy: vi.fn(),
      setVolume: vi.fn(),
      toggleMute: vi.fn(),
      setRate: vi.fn(),
      toggleFullscreen: vi.fn(),
      togglePip: vi.fn(),
      toggleCaptions: vi.fn(),
    } as unknown as MaskflowPlayer;
  });

  it('triggers toggle on Space and K', () => {
    const manager = createKeyboardManager(container, mockPlayer);

    container.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(mockPlayer.toggle).toHaveBeenCalledTimes(1);

    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', bubbles: true }));
    expect(mockPlayer.toggle).toHaveBeenCalledTimes(2);

    manager.destroy();
  });

  it('triggers seek on ArrowLeft, ArrowRight, J, L', () => {
    const manager = createKeyboardManager(container, mockPlayer);

    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(mockPlayer.seekBy).toHaveBeenCalledWith(-5);

    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(mockPlayer.seekBy).toHaveBeenCalledWith(5);

    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'j', bubbles: true }));
    expect(mockPlayer.seekBy).toHaveBeenCalledWith(-10);

    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'l', bubbles: true }));
    expect(mockPlayer.seekBy).toHaveBeenCalledWith(10);

    manager.destroy();
  });

  it('jumps with numeric keys 0-9', () => {
    const manager = createKeyboardManager(container, mockPlayer);

    container.dispatchEvent(new KeyboardEvent('keydown', { key: '5', bubbles: true }));
    expect(mockPlayer.seek).toHaveBeenCalledWith(50); // 50% of 100s

    container.dispatchEvent(new KeyboardEvent('keydown', { key: '0', bubbles: true }));
    expect(mockPlayer.seek).toHaveBeenCalledWith(0);

    manager.destroy();
  });

  it('adjusts volume on ArrowUp and ArrowDown', () => {
    const manager = createKeyboardManager(container, mockPlayer);

    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(mockPlayer.setVolume).toHaveBeenCalledWith(0.85);

    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(mockPlayer.setVolume).toHaveBeenCalledWith(0.75);

    manager.destroy();
  });

  it('ignores keys when target is an input', () => {
    const manager = createKeyboardManager(container, mockPlayer);
    const input = document.createElement('input');
    container.appendChild(input);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(mockPlayer.toggle).not.toHaveBeenCalled();

    manager.destroy();
  });
});
