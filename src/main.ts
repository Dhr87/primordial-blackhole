import { GameLoop } from './core/GameLoop';
import { RenderSystem } from './rendering/RenderSystem';

const loop = new GameLoop();
loop.add(new RenderSystem());
loop.start().catch((err) => console.error('[boot] error al iniciar el juego', err));
