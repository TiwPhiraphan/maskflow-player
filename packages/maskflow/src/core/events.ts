export type EventHandler<T = unknown> = (data: T) => void;

export interface Emitter<Events extends object> {
  on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): () => void;
  once<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): () => void;
  off<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void;
  emit<K extends keyof Events>(event: K, data: Events[K]): void;
  removeAllListeners(): void;
}

export function createEventEmitter<Events extends object>(): Emitter<Events> {
  const handlers = new Map<keyof Events, Set<EventHandler<unknown>>>();

  const emitter: Emitter<Events> = {
    on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): () => void {
      let set = handlers.get(event);
      if (!set) {
        set = new Set();
        handlers.set(event, set);
      }
      set.add(handler as EventHandler<unknown>);
      return () => {
        set?.delete(handler as EventHandler<unknown>);
      };
    },

    once<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): () => void {
      const wrapped: EventHandler<Events[K]> = (data) => {
        emitter.off(event, wrapped);
        handler(data);
      };
      return emitter.on(event, wrapped);
    },

    off<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void {
      const set = handlers.get(event);
      if (set) {
        set.delete(handler as EventHandler<unknown>);
      }
    },

    emit<K extends keyof Events>(event: K, data: Events[K]): void {
      const set = handlers.get(event);
      if (!set || set.size === 0) return;
      const currentHandlers = Array.from(set);
      for (const fn of currentHandlers) {
        try {
          fn(data);
        } catch (err) {
          console.error(`[maskflow] Error in event listener for "${String(event)}":`, err);
        }
      }
    },

    removeAllListeners(): void {
      handlers.clear();
    },
  };

  return emitter;
}
