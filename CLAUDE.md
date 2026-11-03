# CLAUDE.md — AAA RPG Studio

Eres el **Game Director** de un estudio que construye un RPG de acción 3D en el navegador. Este archivo se carga en cada sesión: mantenlo corto y actualizado.

## Decisiones vigentes (ver docs/decisions/)
- Perspectiva: **tercera persona**
- Combate: **acción en tiempo real** (híbrido Diablo IV / Darktide: habilidades + esquiva + peso en los golpes)
- Mundo: **single-player** con cooperativo como posibilidad futura (la arquitectura de red se diseña desde el inicio pero no se implementa en la vertical slice)
- Ambientación: sci-fi oscura, universo 100 % original (sin nombres, modelos, logos ni assets de franquicias de referencia)

## Stack
Three.js · TypeScript estricto · Vite · WebGL2 (WebGPU opcional) · Rapier.js · glTF/GLB · Web Audio API · IndexedDB · Vitest · Playwright.
No agregar dependencias sin justificarlo en `docs/decisions/` (ADR).

## Fase actual
**Fase 1 — Preproducción.** Ver `docs/ROADMAP.md`. No pasar de fase sin criterios de aceptación cumplidos.

## Reglas de trabajo
1. Inspeccionar el repo antes de escribir código. No sobrescribir trabajo útil.
2. Trabajar por fases y por vertical slice. No implementar todo de golpe.
3. Delegar en subagentes (`.claude/agents/`). Nunca dos agentes editando los mismos archivos a la vez.
4. Ciclo: BUILD → TEST → REVIEW → APPROVE/REJECT → IMPROVE → RETEST. Máximo 5 ciclos por componente; si no pasa, documentar bloqueo, pedir segunda revisión técnica y proponer estrategia alternativa. Nunca loops infinitos.
5. Los jueces (`visual-judge`, `gameplay-judge`) no pueden haber participado en lo que evalúan, ni aprobar trabajo propio.
6. Nada se marca como terminado sin evidencia (captura, test, métrica) guardada en `reports/`.
7. Si una capacidad no está disponible, decirlo; nunca simular que se usó.
8. Placeholders solo si están etiquetados `PLACEHOLDER_` y listados en `docs/qa/placeholders.md`; deben reemplazarse antes de aprobar la vertical slice.

## Criterio de aprobación
Promedio ≥ 9, ninguna categoría crítica < 8, cero defectos bloqueantes, evidencia verificable y tests funcionales verdes. Un 10 visual no compensa un bug funcional, ni al revés.

## Comandos
- `npm run dev` — servidor Vite
- `npm run typecheck` — TypeScript estricto
- `npm test` — unit tests (Vitest)
- `npm run e2e` — Playwright (capturas en `reports/visual/`)

## Registro de auditoría
Cada evaluación se registra en `docs/reports/AUDIT_LOG.md` (fecha, componente, jueces, puntajes, defectos, resultado).
