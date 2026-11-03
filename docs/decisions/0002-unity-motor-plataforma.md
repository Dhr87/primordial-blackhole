# ADR 0002 — Unity como motor y plataforma objetivo
Estado: **Aceptada** · Fecha: 2026-11-03 · Ticket: #1

## Contexto
El scaffold inicial se armó para un juego web (Three.js + TypeScript + Vite, física con Rapier, tests con Vitest y Playwright). La visión del juego cambió desde entonces. Ahora es un RPG de acción 3D en tercera persona con combate de peso (ADR 0001), con un objetivo de calidad visual alto y la posibilidad de agregar cooperativo más adelante. Para llegar a eso hacen falta animación avanzada, iluminación de alta calidad, herramientas de contenido y builds nativos de escritorio, y un navegador no lo permite de forma razonable.

## Decisión
1. **Motor: Unity, scripting en C#.**
2. **Versión: Unity 6.3 LTS (rama `6000.3`).**
   - Es la LTS más reciente que publica Unity. Tiene soporte de dos años, **hasta diciembre de 2027**.
   - Se descarta Unity 6.0 LTS: su soporte terminó en **octubre de 2026**.
   - La versión de parche exacta (`6000.3.xfN`) se fija en el ticket #3 al crear el proyecto: será la última de la rama 6.3 que ofrezca Unity Hub ese día. Queda registrada en `ProjectSettings/ProjectVersion.txt`, que es la fuente de verdad. Los parches dentro de 6000.3 se pueden actualizar con un commit dedicado. Saltar de rama (por ejemplo a una futura 6.7 LTS) requiere un ADR nuevo.
3. **Plataforma objetivo: desktop, Windows x64 primero** (Standalone Windows).

### Fuentes verificadas (consultadas el 2026-11-03)
- Unity 6 Releases & Support: <https://unity.com/releases/unity-6/support>. Dice textualmente: *"Unity 6.3 LTS is supported until December 2027, while Unity 6.0 LTS is supported through October 2026."*
- Unity 6: <https://unity.com/releases/unity-6>. Dice textualmente: *"Unity 6.3 LTS is supported with two-year LTS until December 2027…"*
- Anuncio de 6.3 LTS: <https://unity.com/blog/unity-6-3-lts-is-now-available>
- Requisitos de sistema de Unity 6.3: <https://docs.unity.com/en-us/engine/6000.3/manual/get-started/install-and-upgrade/getting-started-installing-unity/system-requirements>

## Plataformas
| Plataforma | Estado | Notas |
|---|---|---|
| **Windows x64 (Standalone)** | **Soportada, objetivo principal** | Player: *"Windows 10 version 21H1 (build 19043) or newer"*, CPU x64 con SSE2, GPU *"DX10, DX11, DX12 or Vulkan capable"* (requisitos oficiales de 6.3). El API gráfico del juego (DX11/DX12/Vulkan) y el mínimo de hardware real se definen en el ticket #8 (hardware de referencia) y el ticket #2 (pipeline de render). |
| Editor de desarrollo | Windows 10 21H1+ x64 | Requisito oficial del Editor 6.3. Para el backend IL2CPP hace falta Visual Studio 2019+ con C++ Tools y Windows SDK 10.0.19041.0 o superior. |
| Linux / macOS desktop | Fuera de alcance por ahora | Unity los soporta. Se evaluarán después de la vertical slice. No se debe introducir código específico de Windows que bloquee el port. |
| Windows on Arm | Fuera de alcance | No se prueba ni se optimiza para esta plataforma. |
| Consolas | **Fuera de alcance** | Requieren licencias y devkits de cada fabricante. No se diseña para ellas en esta etapa. |
| Móvil (iOS / Android) | **Fuera de alcance** | Los presupuestos de rendimiento y el esquema de controles son incompatibles con el objetivo del juego. |
| Web (WebGL / WebGPU) | **Fuera de alcance** | Es justo lo que se abandona con este ADR. |

## Alternativas descartadas
- **Unreal Engine 5 (C++/Blueprints).** Ofrece la mayor calidad visual de partida y buen networking. Se descarta por estas razones: C++ y los tiempos de compilación e iteración pesan más para un equipo chico; los proyectos y builds pesan mucho; y el flujo de trabajo con agentes de IA editando código y datos es más fricción con Blueprints (binarios) que con C# y assets de texto (YAML).
- **Godot 4 (GDScript/C#).** Es liviano, abierto y sin regalías. Se descarta porque su pipeline 3D de alta gama (iluminación, streaming de mundo, herramientas de animación), su ecosistema de middleware y el soporte de C# en algunas plataformas están menos maduros que en Unity para el nivel visual buscado.
- **Seguir en web (Three.js + Rapier + Vite).** Ya está scaffolded. Se descarta por los límites del navegador en memoria, hilos, tamaño de assets y APIs gráficas. Además, para animación, iluminación, editor de niveles y herramientas habría que construir a mano lo que un motor ya trae.

## Consecuencias
- **Positivas:** editor y herramientas de contenido integrados; C# como lenguaje único de gameplay; Unity Test Framework para tests; builds nativos de Windows; LTS con soporte hasta diciembre de 2027.
- **Negativas y riesgos:**
  - Dependemos de un proveedor y de sus términos de licencia. Hay que revisarlos antes de cualquier release comercial.
  - El repo va a tener assets binarios pesados, así que hace falta Git LFS desde el inicio (ticket #3).
  - El CI con Unity necesita licencia y runners específicos (ticket #12).
  - Para 2027 habrá que planificar la migración a la siguiente LTS.
- **Decisiones que esto desbloquea:** pipeline de render URP vs HDRP (#2), reset del repo (#3), reescritura de los documentos rectores (#4), arquitectura C# (#9), guardado en disco (#10) y CI (#12).
- **Sobre el ADR 0001:** las decisiones de diseño (tercera persona, acción en tiempo real, single-player con cooperativo a futuro, sci-fi oscuro 100 % original) no cambian. La consecuencia técnica de 0001, *"character controller cinemático sobre Rapier"*, queda **reemplazada**: el controlador se implementará con los sistemas de física de Unity, y el detalle se define en el ADR de arquitectura C# (#9).

## Scaffold web: qué se conserva y qué se descarta
La ejecución corresponde al ticket #3, y la adaptación de documentos al ticket #4. Este ADR solo fija el criterio.

**Se descarta (código y configuración del stack web):**
- `package.json`, `vite.config.ts`, `tsconfig.json`, `playwright.config.ts`, `index.html`
- `src/` completo, incluido `src/core/{EventBus,GameLoop,System}.ts`, `src/main.ts` y `src/rendering/RenderSystem.ts`
- `tests/` (Vitest y Playwright) y `public/`
- Dependencias: `three`, `@dimforge/rapier3d-compat`, `vite`, `vitest`, `@playwright/test`, `typescript`
- El `.gitignore` actual (se reemplaza por uno de Unity)

**Se conserva:**
- `.claude/` (agentes y skills). Se adapta en #4 para quitar las referencias a Three.js, Vite y Playwright.
- `docs/`: GDD, dirección de arte, roadmap, ADR, QA y registro de auditoría. Se adapta en #4.
- `reports/` (estructura de evidencia), `CLAUDE.md` y `README.md` (este último se adapta).
- **Como ideas, no como código:**
  - el contrato de sistema (init / fixed update / update / dispose);
  - la separación entre simulación a paso fijo y render por frame;
  - la comunicación entre sistemas por eventos tipados, sin referencias directas;
  - las reglas de dependencia (`core` no depende de nadie; el gameplay no depende de rendering ni de UI; networking es una interfaz vacía);
  - la división por sistemas de `src/` (ai, combat, skills, inventory, loot, save…), que sirve de referencia para la estructura de `Assets/`.

  Estas ideas se trasladan a C# y Assembly Definitions en el ticket #9.
