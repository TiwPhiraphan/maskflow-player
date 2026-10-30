export type StateListener<T> = (state: T, prevState: T) => void;

export interface Store<T> {
  getState: () => T;
  setState: (updater: Partial<T> | ((prevState: T) => Partial<T>)) => void;
  subscribe: (listener: StateListener<T>) => () => void;
}

/**
 * Creates a minimal reactive store.
 */
export function createStore<T extends object>(initialState: T): Store<T> {
  let state = Object.freeze({ ...initialState });
  const listeners = new Set<StateListener<T>>();

  return {
    getState(): T {
      return state;
    },

    setState(updater: Partial<T> | ((prevState: T) => Partial<T>)): void {
      const partial = typeof updater === 'function' ? updater(state) : updater;
      if (!partial || Object.keys(partial).length === 0) {
        return;
      }

      // Check for actual changes
      let changed = false;
      for (const key of Object.keys(partial) as Array<keyof T>) {
        if (!Object.is(state[key], partial[key])) {
          changed = true;
          break;
        }
      }

      if (!changed) {
        return;
      }

      const prevState = state;
      state = Object.freeze({ ...state, ...partial });

      for (const listener of listeners) {
        listener(state, prevState);
      }
    },

    subscribe(listener: StateListener<T>): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
