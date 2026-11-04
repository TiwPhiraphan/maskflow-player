import { describe, it, expect, vi } from 'vitest';
import { createPlayer } from '../core/player';

describe('Mobile interactions', () => {
  it('tap shows controls and keeps them visible until autohide delay', () => {
    vi.useFakeTimers();
    const container = document.createElement('div');
    const video = document.createElement('video');
    video.play = () => Promise.resolve();
    video.pause = () => {};
    video.load = () => {};
    Object.defineProperty(video, 'paused', { value: false, writable: true });
    Object.defineProperty(video, 'ended', { value: false, writable: true });
    Object.defineProperty(video, 'duration', { value: 100, writable: true });
    container.appendChild(video);
    document.body.appendChild(container);

    const player = createPlayer(video, {
      src: 'https://example.com/video.mp4',
      container,
      autoHideDelay: 3000,
    });

    player.store.setState({ status: 'playing' });
    player.setControlsVisible(false);

    expect(player.getState().controlsVisible).toBe(false);

    // 1. pointerdown (touch)
    const pDown = new Event('pointerdown', { bubbles: true });
    Object.defineProperty(pDown, 'isPrimary', { value: true });
    Object.defineProperty(pDown, 'pointerType', { value: 'touch' });
    Object.defineProperty(pDown, 'clientX', { value: 500 });
    Object.defineProperty(pDown, 'clientY', { value: 250 });
    container.dispatchEvent(pDown);

    // 2. pointerup (touch)
    const pUp = new Event('pointerup', { bubbles: true });
    Object.defineProperty(pUp, 'isPrimary', { value: true });
    Object.defineProperty(pUp, 'pointerType', { value: 'touch' });
    Object.defineProperty(pUp, 'clientX', { value: 500 });
    Object.defineProperty(pUp, 'clientY', { value: 250 });
    container.dispatchEvent(pUp);

    // Controls wait for single tap timer
    expect(player.getState().controlsVisible).toBe(false);

    // Advance 260ms: controls become visible!
    vi.advanceTimersByTime(260);
    expect(player.getState().controlsVisible).toBe(true);

    // Advance another 2000ms: controls MUST STAY VISIBLE!
    vi.advanceTimersByTime(2000);
    expect(player.getState().controlsVisible).toBe(true);

    // Advance past full 3000ms autohide timer: controls hide
    vi.advanceTimersByTime(1100);
    expect(player.getState().controlsVisible).toBe(false);

    player.destroy();
    vi.useRealTimers();
  });
});
