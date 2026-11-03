---
name: visual-audit
description: Procedimiento para auditar visualmente el juego: capturas con Playwright, puntuación por categoría y informe en reports/visual/. Usar antes de aprobar cualquier componente visual.
---
# Visual audit
1. Levantar `npm run dev` y ejecutar `npm run e2e` para generar capturas en `reports/visual/<fecha>/`.
2. Capturar: escena general, personaje, enemigo, combate/VFX, HUD, inventario, menú.
3. Puntuar 1–10: iluminación, materiales, composición, modelos, animación, efectos, legibilidad, identidad artística.
4. Si hay referencias legítimas, comparar a ciegas (mezclar y ocultar origen antes de puntuar).
5. Informe: defectos (severidad, evidencia, agente responsable, corrección sugerida) + decisión APROBADO/RECHAZADO.
6. Añadir fila en `docs/reports/AUDIT_LOG.md`.
Aprobación: promedio ≥ 9, ninguna categoría crítica < 8, sin bloqueantes.
