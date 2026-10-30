import { describe, it, expect, vi } from 'vitest';
import { createStore } from '../core/store';

describe('Store', () => {
  it('initializes with given state', () => {
    const store = createStore({ count: 0, label: 'test' });
    expect(store.getState()).toEqual({ count: 0, label: 'test' });
  });

  it('updates state with partial object', () => {
    const store = createStore({ count: 0, text: 'hello' });
    store.setState({ count: 1 });
    expect(store.getState()).toEqual({ count: 1, text: 'hello' });
  });

  it('updates state with updater function', () => {
    const store = createStore({ count: 5 });
    store.setState((prev) => ({ count: prev.count + 2 }));
    expect(store.getState().count).toBe(7);
  });

  it('notifies listeners when state changes', () => {
    const store = createStore({ val: 'a' });
    const listener = vi.fn();
    const unsub = store.subscribe(listener);

    store.setState({ val: 'b' });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ val: 'b' }, { val: 'a' });

    unsub();
    store.setState({ val: 'c' });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('does not notify if updated with identical values', () => {
    const store = createStore({ val: 42 });
    const listener = vi.fn();
    store.subscribe(listener);

    store.setState({ val: 42 });
    expect(listener).not.toHaveBeenCalled();
  });
});
