/** Bus de eventos tipado. Los sistemas se comunican por aquí, no por referencias directas. */
export type EventMap = Record<string, unknown>;
type AnyHandler = (payload: never) => void;

export class EventBus<E extends EventMap> {
  private handlers = new Map<keyof E, Set<AnyHandler>>();

  on<K extends keyof E>(type: K, handler: (payload: E[K]) => void): () => void {
    let set = this.handlers.get(type);
    if (!set) {
      set = new Set();
      this.handlers.set(type, set);
    }
    const h = handler as AnyHandler;
    set.add(h);
    return () => {
      set.delete(h);
    };
  }

  emit<K extends keyof E>(type: K, payload: E[K]): void {
    this.handlers.get(type)?.forEach((h) => (h as (p: E[K]) => void)(payload));
  }

  clear(): void {
    this.handlers.clear();
  }
}
