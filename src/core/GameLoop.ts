import type { System } from './System';

/** Loop con paso fijo para simulación y render por frame. */
export class GameLoop {
  private systems: System[] = [];
  private last = 0;
  private acc = 0;
  private rafId = 0;
  private running = false;

  constructor(private readonly fixedStep = 1 / 60, private readonly maxFrame = 0.25) {}

  add(system: System): void {
    this.systems.push(system);
  }

  async start(): Promise<void> {
    for (const s of this.systems) await s.init();
    this.running = true;
    this.last = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
    for (const s of [...this.systems].reverse()) s.dispose();
  }

  private tick = (now: number): void => {
    if (!this.running) return;
    const dt = Math.min((now - this.last) / 1000, this.maxFrame);
    this.last = now;
    this.acc += dt;
    while (this.acc >= this.fixedStep) {
      for (const s of this.systems) s.fixedUpdate(this.fixedStep);
      this.acc -= this.fixedStep;
    }
    for (const s of this.systems) s.update(dt);
    this.rafId = requestAnimationFrame(this.tick);
  };
}
