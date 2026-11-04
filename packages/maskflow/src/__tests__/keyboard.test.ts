import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createKeyboardManager } from '../core/features/keyboard';
import type { MaskflowPlayer, PlayerState } from '../core/types';

describe('KeyboardManager', () => {
  let container: HTMLDivElement;
  let mockPlayer: MaskflowPlayer;
  let eventsEmitMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    container.focus();

    const mockState: PlayerState = {
      title: 'Test Video',
      loading: false,
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

    eventsEmitMock = vi.fn();

    mockPlayer = {
      getState: vi.fn(() => mockState),
      events: {
        emit: eventsEmitMock,
      },
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

  it('triggers seek -10s / +10s on ArrowLeft, ArrowRight, J, L', () => {
    const manager = createKeyboardManager(container, mockPlayer);

    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(mockPlayer.seekBy).toHaveBeenCalledWith(-10);

    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(mockPlayer.seekBy).toHaveBeenCalledWith(10);

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

  it('toggles settings on s key and Escape', () => {
    const manager = createKeyboardManager(container, mockPlayer);

    container.dispatchEvent(new KeyboardEvent('keydown', { key: 's', bubbles: true }));
    expect(eventsEmitMock).toHaveBeenCalledWith('togglesettings', undefined);

    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(eventsEmitMock).toHaveBeenCalledWith('togglesettings', undefined);

    manager.destroy();
  });

  it('ignores events with modifier keys (ctrl, meta, alt)', () => {
    const manager = createKeyboardManager(container, mockPlayer);

    container.dispatchEvent(
      new KeyboardEvent('keydown', { key: ' ', ctrlKey: true, bubbles: true }),
    );
    expect(mockPlayer.toggle).not.toHaveBeenCalled();

    container.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true, bubbles: true }),
    );
    expect(mockPlayer.seekBy).not.toHaveBeenCalled();

    container.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'f', metaKey: true, bubbles: true }),
    );
    expect(mockPlayer.toggleFullscreen).not.toHaveBeenCalled();

    manager.destroy();
  });

  it('does not double-toggle Space when focus is on a button', () => {
    const manager = createKeyboardManager(container, mockPlayer);

    const button = document.createElement('button');
    container.appendChild(button);
    button.focus();

    button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(mockPlayer.toggle).not.toHaveBeenCalled();

    manager.destroy();
  });
});
