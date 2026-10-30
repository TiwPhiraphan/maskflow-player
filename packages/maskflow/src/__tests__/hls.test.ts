import { describe, it, expect } from 'vitest';
import { isHlsSource, getHlsUrl } from '../core/media/hls';

describe('HLS Utilities', () => {
  it('detects HLS sources from string', () => {
    expect(isHlsSource('https://example.com/video.m3u8')).toBe(true);
    expect(isHlsSource('https://example.com/stream.m3u8?token=xyz')).toBe(true);
    expect(isHlsSource('https://example.com/video.mp4')).toBe(false);
  });

  it('detects HLS sources from source array', () => {
    expect(
      isHlsSource([
        { src: 'https://example.com/video.mp4', type: 'video/mp4' },
        { src: 'https://example.com/video.m3u8', type: 'application/x-mpegURL' },
      ]),
    ).toBe(true);

    expect(isHlsSource([{ src: 'https://example.com/video.mp4', type: 'video/mp4' }])).toBe(false);
  });

  it('extracts HLS URL correctly', () => {
    expect(getHlsUrl('https://example.com/video.m3u8')).toBe('https://example.com/video.m3u8');
    expect(
      getHlsUrl([
        { src: 'https://example.com/video.mp4', type: 'video/mp4' },
        { src: 'https://example.com/stream.m3u8', type: 'application/x-mpegURL' },
      ]),
    ).toBe('https://example.com/stream.m3u8');
  });
});
