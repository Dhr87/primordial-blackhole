/** Contrato que implementan todos los sistemas del juego. */
export interface System {
  readonly name: string;
  init(): Promise<void> | void;
  /** Simulación a paso fijo (física, combate, IA). */
  fixedUpdate(dt: number): void;
  /** Una vez por frame, con delta real. */
  update(dt: number): void;
  dispose(): void;
}
