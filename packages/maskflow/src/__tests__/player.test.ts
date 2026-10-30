import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPlayer } from '../core/player';

describe('Player', () => {
  let video: HTMLVideoElement;

  beforeEach(() => {
    video = document.createElement('video');
    // Mock HTMLMediaElement methods not implemented by jsdom
    video.play = vi.fn().mockResolvedValue(undefined);
    video.pause = vi.fn();
    video.load = vi.fn();
  });

  it('creates player and initializes store with default state', () => {
    const player = createPlayer(video, {
      src: 'https://example.com/video.mp4',
    });

    const state = player.getState();
    expect(state.status).toBe('idle');
    expect(state.currentTime).toBe(0);
    expect(state.duration).toBe(0);
    expect(state.volume).toBe(1);
    expect(state.muted).toBe(false);
    expect(state.aspectRatio).toBe('16/9');
    expect(video.src).toBe('https://example.com/video.mp4');
  });

  it('sets and updates aspect ratio', () => {
    const player = createPlayer(video, {
      src: 'https://example.com/video.mp4',
      aspectRatio: '16/9',
    });

    expect(player.getState().aspectRatio).toBe('16/9');
    player.setAspectRatio('4/3');
    expect(player.getState().aspectRatio).toBe('4/3');
  });

  it('clamps volume between 0 and 1', () => {
    const player = createPlayer(video, {
      src: 'https://example.com/video.mp4',
    });

    player.setVolume(0.5);
    expect(video.volume).toBe(0.5);

    player.setVolume(-1);
    expect(video.volume).toBe(0);

    player.setVolume(2);
    expect(video.volume).toBe(1);
  });

  it('clamps seek between 0 and duration', () => {
    Object.defineProperty(video, 'duration', { value: 100, writable: true });
    const player = createPlayer(video, {
      src: 'https://example.com/video.mp4',
    });

    player.seek(50);
    expect(video.currentTime).toBe(50);

    player.seek(-10);
    expect(video.currentTime).toBe(0);

    player.seek(150);
    expect(video.currentTime).toBe(100);
  });

  it('clamps playback rate', () => {
    const player = createPlayer(video, {
      src: 'https://example.com/video.mp4',
    });

    player.setRate(1.5);
    expect(video.playbackRate).toBe(1.5);

    player.setRate(0.1);
    expect(video.playbackRate).toBe(0.25);

    player.setRate(10);
    expect(video.playbackRate).toBe(4);
  });

  it('toggles play/pause correctly', async () => {
    const player = createPlayer(video, {
      src: 'https://example.com/video.mp4',
    });

    // When paused, toggle calls play
    Object.defineProperty(video, 'paused', { value: true, writable: true });
    await player.toggle();
    expect(video.play).toHaveBeenCalledTimes(1);

    // When playing, toggle calls pause
    Object.defineProperty(video, 'paused', { value: false, writable: true });
    await player.toggle();
    expect(video.pause).toHaveBeenCalledTimes(1);
  });

  it('calls onReady and emits ready event', () => {
    const onReady = vi.fn();
    const player = createPlayer(video, {
      src: 'https://example.com/video.mp4',
      onReady,
    });

    expect(onReady).toHaveBeenCalledWith(player);
  });

  it('cleans up on destroy()', () => {
    const player = createPlayer(video, {
      src: 'https://example.com/video.mp4',
    });

    const onDestroy = vi.fn();
    player.events.on('destroy', onDestroy);

    player.destroy();
    expect(onDestroy).toHaveBeenCalled();
  });
});
