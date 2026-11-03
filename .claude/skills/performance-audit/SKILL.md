---
name: performance-audit
description: Procedimiento para medir y reportar rendimiento (FPS, frame time, draw calls, memoria, carga) en reports/performance/.
---
# Performance audit
1. Fijar hardware y navegador de referencia en el informe.
2. Medir con escenario estándar: FPS medio/p1, frame time, draw calls, triángulos, memoria JS/GPU, tiempo de carga inicial y por escenario, errores de consola.
3. Repetir tras cada cambio de rendering; comparar contra el presupuesto en `docs/performance/`.
4. Informe con tabla antes/después y decisión; registrar en `docs/reports/AUDIT_LOG.md`.
