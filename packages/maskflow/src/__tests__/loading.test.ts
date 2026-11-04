import { describe, it, expect } from 'vitest';
import { computeLoading } from '../core/media/native';

describe('Loading State (UPDATE-UI Spec)', () => {
  it('forces loading = false when video has error or is ended', () => {
    const mockErrorVideo = {
      error: { code: 4, message: 'Media error' },
      ended: false,
      seeking: true,
      paused: false,
      readyState: 0,
      networkState: 2,
    } as unknown as HTMLMediaElement;

    expect(computeLoading(mockErrorVideo)).toBe(false);

    const mockEndedVideo = {
      error: null,
      ended: true,
      seeking: false,
      paused: true,
      readyState: 4,
      networkState: 1,
    } as unknown as HTMLMediaElement;

    expect(computeLoading(mockEndedVideo)).toBe(false);
  });

  it('computes loading = true when seeking', () => {
    const mockSeekingVideo = {
      error: null,
      ended: false,
      seeking: true,
      paused: false,
      readyState: 4, // HAVE_ENOUGH_DATA
      networkState: 1,
    } as unknown as HTMLMediaElement;

    expect(computeLoading(mockSeekingVideo)).toBe(true);
  });

  it('computes loading = true when not paused and readyState < HAVE_FUTURE_DATA (3)', () => {
    const mockBufferingVideo = {
      error: null,
      ended: false,
      seeking: false,
      paused: false,
      readyState: 2, // HAVE_CURRENT_DATA (< 3)
      networkState: 2,
    } as unknown as HTMLMediaElement;

    expect(computeLoading(mockBufferingVideo)).toBe(true);

    const mockPlayingReadyVideo = {
      error: null,
      ended: false,
      seeking: false,
      paused: false,
      readyState: 3, // HAVE_FUTURE_DATA (>= 3)
      networkState: 1,
    } as unknown as HTMLMediaElement;

    expect(computeLoading(mockPlayingReadyVideo)).toBe(false);
  });

  it('computes loading = true when readyState === HAVE_NOTHING (0) and networkState === NETWORK_LOADING (2)', () => {
    const mockInitialLoadingVideo = {
      error: null,
      ended: false,
      seeking: false,
      paused: true,
      readyState: 0, // HAVE_NOTHING
      networkState: 2, // NETWORK_LOADING
    } as unknown as HTMLMediaElement;

    expect(computeLoading(mockInitialLoadingVideo)).toBe(true);

    const mockIdleVideo = {
      error: null,
      ended: false,
      seeking: false,
      paused: true,
      readyState: 0, // HAVE_NOTHING
      networkState: 1, // NETWORK_IDLE
    } as unknown as HTMLMediaElement;

    expect(computeLoading(mockIdleVideo)).toBe(false);
  });
});

