import { describe, it, expect } from 'vitest';
import { clamp, formatTime } from '../core/utils';

describe('Utils', () => {
  describe('clamp', () => {
    it('keeps value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('handles boundary values', () => {
      expect(clamp(0, 0, 1)).toBe(0);
      expect(clamp(1, 0, 1)).toBe(1);
    });

    it('returns min for NaN', () => {
      expect(clamp(NaN, 0, 100)).toBe(0);
    });
  });

  describe('formatTime', () => {
    it('formats seconds correctly', () => {
      expect(formatTime(0)).toBe('0:00');
      expect(formatTime(5)).toBe('0:05');
      expect(formatTime(59)).toBe('0:59');
    });

    it('formats minutes correctly', () => {
      expect(formatTime(60)).toBe('1:00');
      expect(formatTime(75)).toBe('1:15');
      expect(formatTime(600)).toBe('10:00');
    });

    it('formats hours correctly', () => {
      expect(formatTime(3600)).toBe('1:00:00');
      expect(formatTime(3665)).toBe('1:01:05');
      expect(formatTime(72000)).toBe('20:00:00');
    });

    it('handles invalid numbers gracefully', () => {
      expect(formatTime(-10)).toBe('0:00');
      expect(formatTime(NaN)).toBe('0:00');
      expect(formatTime(Infinity)).toBe('0:00');
    });
  });
});
