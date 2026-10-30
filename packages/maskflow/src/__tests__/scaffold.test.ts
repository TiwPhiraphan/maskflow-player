import { describe, it, expect } from 'vitest';
import { version } from '../index';

describe('maskflow scaffold', () => {
  it('exports valid package version', () => {
    expect(version).toBe('0.1.0');
  });
});
