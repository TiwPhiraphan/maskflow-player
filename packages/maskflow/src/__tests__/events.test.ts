import { describe, it, expect, vi } from 'vitest';
import { createEventEmitter } from '../core/events';

interface TestEvents {
  play: void;
  seek: number;
  message: string;
}

describe('EventEmitter', () => {
  it('subscribes and receives emitted events', () => {
    const emitter = createEventEmitter<TestEvents>();
    const onSeek = vi.fn();

    emitter.on('seek', onSeek);
    emitter.emit('seek', 42);

    expect(onSeek).toHaveBeenCalledWith(42);
  });

  it('unsubscribes with returned function', () => {
    const emitter = createEventEmitter<TestEvents>();
    const onPlay = vi.fn();

    const unsub = emitter.on('play', onPlay);
    emitter.emit('play', undefined);
    expect(onPlay).toHaveBeenCalledTimes(1);

    unsub();
    emitter.emit('play', undefined);
    expect(onPlay).toHaveBeenCalledTimes(1);
  });

  it('supports once()', () => {
    const emitter = createEventEmitter<TestEvents>();
    const onMsg = vi.fn();

    emitter.once('message', onMsg);
    emitter.emit('message', 'first');
    emitter.emit('message', 'second');

    expect(onMsg).toHaveBeenCalledTimes(1);
    expect(onMsg).toHaveBeenCalledWith('first');
  });

  it('supports removeAllListeners()', () => {
    const emitter = createEventEmitter<TestEvents>();
    const h1 = vi.fn();
    const h2 = vi.fn();

    emitter.on('play', h1);
    emitter.on('seek', h2);

    emitter.removeAllListeners();
    emitter.emit('play', undefined);
    emitter.emit('seek', 10);

    expect(h1).not.toHaveBeenCalled();
    expect(h2).not.toHaveBeenCalled();
  });
});
