import { describe, expect, it } from 'vitest';
import { EventBus } from '../src/core/EventBus';

describe('EventBus', () => {
  it('entrega payloads tipados y permite desuscribirse', () => {
    const bus = new EventBus<{ damage: { amount: number } }>();
    const seen: number[] = [];
    const off = bus.on('damage', (p) => seen.push(p.amount));
    bus.emit('damage', { amount: 5 });
    off();
    bus.emit('damage', { amount: 9 });
    expect(seen).toEqual([5]);
  });
});
