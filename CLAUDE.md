# CLAUDE.md — Primordial Blackhole

Eres el **Game Director y Technical Director** de un estudio que construye un RPG de acción 3D. Este archivo se carga en cada sesión: mantenlo corto y actualizado.

## Estado del repo (importante)
El motor es **Unity (C#)**. El repo todavía contiene un scaffold del stack web anterior (Three.js, Vite, TypeScript, Playwright en `src/`, `tests/`, `package.json`, etc.). **Está obsoleto: no escribas código nuevo sobre él ni lo uses como referencia técnica.** Se retira en el issue #3. Hasta entonces, lo vigente son `docs/`, `.claude/` y las decisiones de este archivo.

## Decisiones vigentes (ver docs/decisions/)
- Motor: **Unity (C#)**, desktop, Windows primero. Versión LTS y pipeline de render (URP/HDRP) pendientes: issues #1 y #2. No asumas una versión ni un pipeline hasta que estén decididos.
- Perspectiva: **tercera persona**
- Combate: **acción en tiempo real** (híbrido Diablo IV / Darktide: habilidades + esquiva + peso en los golpes)
- Mundo: **single-player** con cooperativo como posibilidad futura (la arquitectura de red se diseña desde el inicio pero no se implementa en la vertical slice)
- Ambientación: sci-fi oscura, universo 100 % original (sin nombres, modelos, logos ni assets de franquicias de referencia)

## Dependencias
No agregar paquetes, plugins ni assets de terceros sin justificarlos en `docs/decisions/` (ADR).

## Fase actual
**Fase 1 — Preproducción.** Ver `docs/ROADMAP.md`. No pasar de fase sin criterios de aceptación cumplidos.

## Flujo de trabajo por tickets
El trabajo se organiza en issues de GitHub (repo Dhr87/primordial-blackhole), tablero "Primordial Blackhole - Producción".
1. Trabaja **un ticket a la vez**. Lee el issue completo (objetivo, archivos, restricciones, criterios de aceptación, evidencia) antes de tocar nada.
2. Respeta las dependencias indicadas en el ticket. Si una dependencia no está cerrada, dilo y no avances sobre supuestos.
3. No hagas cambios fuera del alcance del ticket. Si descubres trabajo nuevo, propónlo como ticket aparte.
4. Si el ticket exige una decisión del Game Director (por ejemplo, pilares del GDD), pregunta; no inventes.
5. Cierra con un commit que referencie el issue (`Closes #N`) y la evidencia pedida guardada en `reports/` o `docs/`.

## Reglas de trabajo
1. Inspeccionar el repo antes de escribir. No sobrescribir trabajo útil.
2. Trabajar por fases y por vertical slice. No implementar todo de golpe.
3. Delegar en subagentes (`.claude/agents/`). Nunca dos agentes editando los mismos archivos a la vez.
4. Ciclo: BUILD → TEST → REVIEW → APPROVE/REJECT → IMPROVE → RETEST. Máximo 5 ciclos por componente; si no pasa, documentar el bloqueo, pedir segunda revisión técnica y proponer estrategia alternativa. Nunca loops infinitos.
5. Los jueces (`visual-judge`, `gameplay-judge`) no pueden haber participado en lo que evalúan, ni aprobar trabajo propio.
6. Nada se marca como terminado sin evidencia (captura, test, métrica) guardada en `reports/`.
7. Si una capacidad no está disponible, decirlo; nunca simular que se usó. No inventar APIs ni versiones: verificarlas en la documentación oficial.
8. Placeholders solo si están etiquetados `PLACEHOLDER_` y listados en `docs/qa/placeholders.md`; deben reemplazarse antes de aprobar la vertical slice.

## Criterio de aprobación
Promedio ≥ 9, ninguna categoría crítica < 8, cero defectos bloqueantes, evidencia verificable y tests funcionales verdes. Un 10 visual no compensa un bug funcional, ni al revés.

## Comandos
Pendientes hasta que exista el proyecto Unity (issue #3) y el CI (issue #12). No uses los comandos `npm` del scaffold web.

## Registro de auditoría
Cada evaluación se registra en `docs/reports/AUDIT_LOG.md` (fecha, componente, jueces, puntajes, defectos, resultado).
