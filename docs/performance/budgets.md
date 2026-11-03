# Hardware de referencia y presupuestos de rendimiento

Estado: **PROVISORIO** · Fecha: 2026-11-03 · Ticket: #8 · Motor: Unity 6.3 LTS (ADR 0002)

> **Ningún número de este documento es una medición.** Todos son metas o límites propuestos.
> Siguen siendo provisorios hasta que (a) se cierre el pipeline de render (#2) y (b) se midan en una escena real con la metodología de la sección 5.
> Al cerrar el #2 hay que revisar este documento. Cualquier cambio de límites se hace con un commit que lo justifique.

## 1. Perfiles de hardware

Los perfiles de hardware son decisiones del Game Director. No se cambian sin su aprobación.

| Perfil | Resolución | Meta de FPS | Calidad | CPU | GPU | RAM |
|---|---|---|---|---|---|---|
| **Referencia (meta)** | 1920×1080 | **60 FPS** | Alta | 6 núcleos | Gama media, **8 GB de VRAM** | 16 GB |
| **Piso** | 1920×1080 | **30 FPS obligatorios**, 60 FPS deseables | Baja | *Sin definir, ver 1.3* | Gama de entrada, **6 GB de VRAM** | *Sin definir, ver 1.3* |
| Desarrollo | — | — | — | Ryzen de gama alta | RTX 5070 | — |

- **El perfil de referencia es el que aprueba.** El criterio de la Fase 5, "60 FPS en hardware de referencia", se evalúa con ese perfil.
- **El piso es una garantía de jugabilidad, no de calidad.** Si un build no llega a 30 FPS en el piso, el bloqueo es igual de grave que uno funcional.
- **La PC de desarrollo no sirve para aprobar.** Es mucho más potente que la de referencia y puede ocultar problemas de CPU y de VRAM. Se usa para perfilar e iterar, nunca como evidencia de aprobación.

### 1.1 Ejemplos concretos: referencia (meta)

| Componente | Modelo | Especificación verificada | Fuente | Nivel de verificación |
|---|---|---|---|---|
| CPU | **Intel Core i5-12400F** | 6 núcleos (6 P-cores y 0 E-cores), 12 hilos. Base power de 65 W, turbo de 117 W. Lanzamiento: Q1'22. | [Intel ARK](https://www.intel.com/content/www/us/en/products/sku/134587/intel-core-i512400f-processor-18m-cache-up-to-4-40-ghz/specifications.html) | ✅ Fuente oficial |
| CPU | **AMD Ryzen 5 5600** | 6 núcleos, 12 hilos. Lanzamiento: 4 de abril de 2022. | [Wikipedia: List of AMD Ryzen processors](https://en.wikipedia.org/wiki/List_of_AMD_Ryzen_processors) | ⚠️ Solo fuente secundaria. La página oficial de AMD no respondió al consultarla. |
| GPU | **NVIDIA GeForce RTX 4060** | 8 GB GDDR6, bus de 128 bits, TGP de 115 W | [NVIDIA: GeForce RTX 4060 Family](https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4060-4060ti/) | ✅ Fuente oficial |
| GPU | **AMD Radeon RX 7600** | TBP de 165 W. Lanzamiento: 25 de mayo de 2023. **La VRAM de 8 GB GDDR6 no se pudo confirmar en una fuente primaria.** | [Wikipedia: List of AMD GPUs](https://en.wikipedia.org/wiki/List_of_AMD_graphics_processing_units) | ⚠️ Parcial. La página oficial de AMD devolvió 404. |
| RAM | 16 GB, doble canal | — | — | Decisión del Game Director |

**GPU principal de referencia: RTX 4060.** Es la única GPU de gama media con 8 GB de VRAM confirmada en una fuente oficial. La RX 7600 se mantiene como contraste AMD, pero no se usa para aprobar hasta verificar su VRAM.

### 1.2 Ejemplos concretos: piso

| Componente | Modelo | Especificación verificada | Fuente | Nivel de verificación |
|---|---|---|---|---|
| GPU | **NVIDIA GeForce RTX 2060 (6 GB)** | 6 GB GDDR6, bus de 192 bits, 1920 CUDA cores. Graphics Card Power de 160 W (valor asignado por posición en la tabla comparativa). | [NVIDIA: comparativa de la serie 20](https://www.nvidia.com/en-us/geforce/graphics-cards/compare/?section=compare-20) | ✅ Fuente oficial |
| GPU | NVIDIA GeForce GTX 1660 SUPER | **No verificada.** Hay listados de fabricantes asociados que indican 6 GB GDDR6 y bus de 192 bits, pero no se pudo leer la página de NVIDIA. | — | ❌ Pendiente |
| GPU | AMD Radeon RX 5600 XT | TBP de 160 W. Lanzamiento: 21 de enero de 2020. **La VRAM de 6 GB no se pudo confirmar en una fuente primaria.** | [Wikipedia: List of AMD GPUs](https://en.wikipedia.org/wiki/List_of_AMD_graphics_processing_units) | ⚠️ Parcial |

**GPU principal del piso: RTX 2060 de 6 GB.** Hay una nota sobre la GTX 1660 SUPER: no soporta ray tracing por hardware. Si el piso termina siendo esa placa, ninguna característica obligatoria del juego puede depender de RT.

Consultas hechas el 2026-11-03. Las páginas de AMD (Ryzen 5 5600 y 3600, RX 7600 y RX 5600 XT) y las fichas individuales de NVIDIA (GTX 1660 SUPER y RTX 2060) devolvieron timeout o 404. TechPowerUp bloqueó el acceso automatizado con un 403. Los valores marcados ⚠️ o ❌ los tiene que confirmar una persona antes de cerrar la Fase 1.

### 1.3 Pendiente de decisión del Game Director
- **CPU y RAM del piso.** No están definidas. Propuesta: CPU de 6 núcleos y 12 hilos de generación anterior a la de referencia, y 16 GB de RAM. Con 8 GB el presupuesto de RAM de la sección 4 no entra. No se adopta sin aprobación.
- **Acceso físico al hardware de referencia y al de piso.** El issue exige que sea hardware que el equipo pueda probar realmente, y hoy el equipo solo tiene la PC de desarrollo. Hay que definir cómo se consigue (compra, préstamo o un tester externo) antes de la Fase 5. Sin ese hardware no se puede cumplir el criterio de salida de la Fase 5.

## 2. Presupuesto de frame

En Unity el **main thread** (scripts, animación, física, UI y la preparación del render) y el **render thread** (envío de comandos al API gráfico) trabajan en paralelo con la **GPU**. El frame dura lo que tarde el más lento de los tres. Por eso cada uno tiene su propio presupuesto, que no se suma con los demás.

**Margen de seguridad: 15 %** sobre el tiempo de frame. Cubre la variación entre placas, los drivers y el *overhead* de los builds de desarrollo.

| | 60 FPS (referencia, Alta) | 30 FPS (piso, Baja) |
|---|---|---|
| Frame total disponible | 16,67 ms | 33,33 ms |
| **Presupuesto con margen** | **14,0 ms** | **28,0 ms** |
| CPU: main thread | ≤ 14,0 ms | ≤ 28,0 ms (meta deseable: ≤ 14,0 ms, ver nota) |
| CPU: render thread | ≤ 10,0 ms | ≤ 20,0 ms |
| GPU | ≤ 14,0 ms | ≤ 28,0 ms |

Nota: el piso apunta a 30-60 FPS. La CPU del piso (por definir) debería sostener el main thread cerca de los 60 FPS, porque bajar la calidad gráfica alivia sobre todo a la GPU y casi no reduce el costo de la simulación.

### 2.1 Reparto del main thread a 60 FPS (provisorio)
| Sistema | ms |
|---|---|
| Gameplay y scripts (combate, habilidades, IA) | 4,0 |
| Animación | 2,0 |
| Física | 1,5 |
| UI/HUD | 1,0 |
| Audio | 0,5 |
| Preparación del render (culling y envío en el main thread) | 3,0 |
| Reserva | 2,0 |
| **Total** | **14,0** |

### 2.2 Reparto de la GPU a 60 FPS y 1080p (provisorio)
Este reparto depende del pipeline elegido en el #2 (forward, forward+ o deferred) y se rehace cuando ese ticket se cierre.

| Pase | ms |
|---|---|
| Sombras | 2,5 |
| Geometría opaca | 4,5 |
| Iluminación | 2,5 |
| Transparencias y VFX de combate | 2,0 |
| Post-proceso | 2,0 |
| UI | 0,5 |
| **Total** | **14,0** |

### 2.3 Criterios de estabilidad
El promedio no alcanza: el combate con peso exige un frame estable.

| Métrica | Referencia (60) | Piso (30) |
|---|---|---|
| FPS promedio | ≥ 60 | ≥ 30 |
| Frame time p95 | ≤ 16,7 ms | ≤ 33,3 ms |
| Frame time p99 | ≤ 20,0 ms | ≤ 40,0 ms |
| Hitches (frames de más de 50 ms) durante el combate | 0 | 0 |
| GC alloc por frame en régimen estable | 0 B (tolerancia ≤ 1 KB) | igual |

## 3. Límites por escena (PROVISORIOS)

Los valores son por frame y se leen desde la cámara de juego en el peor punto del escenario de medición.

| Límite | Referencia (Alta) | Piso (Baja) | Dónde se lee |
|---|---|---|---|
| Batches (draw calls) | ≤ 2.500 | ≤ 1.500 | Profiler: módulo Rendering / Frame Debugger |
| SetPass calls | ≤ 300 | ≤ 200 | Profiler: módulo Rendering |
| Triángulos visibles | ≤ 3 M | ≤ 1,5 M | Profiler: módulo Rendering |
| Luces con sombra activas | ≤ 4 | ≤ 1 | Frame Debugger |

Batches y SetPass calls dependen de cómo agrupa los draw calls cada pipeline (SRP Batcher, instancing). Se revisan al cerrar el #2.

## 4. Memoria y tamaño de build (PROVISORIOS)

Reserva del sistema: se asume que el sistema operativo, el compositor y otras apps usan entre 1 y 1,5 GB de VRAM y unos 4 GB de RAM.

| Límite | Referencia | Piso |
|---|---|---|
| VRAM total del juego | ≤ 6,0 GB (de 8) | ≤ 4,5 GB (de 6) |
| — Texturas | ≤ 3,0 GB | ≤ 2,0 GB (con mip limit en calidad Baja) |
| — Render targets a 1080p | ≤ 1,0 GB | ≤ 0,75 GB |
| — Mallas y buffers | ≤ 1,0 GB | ≤ 0,75 GB |
| — Reserva | 1,0 GB | 1,0 GB |
| RAM total del proceso | ≤ 8 GB | ≤ 6 GB |
| — Heap administrado (C#) | ≤ 512 MB | ≤ 512 MB |
| Tamaño del build de la vertical slice (instalado) | ≤ 5 GB | — |
| Tamaño del build del juego completo | Por definir en la Fase 4 | — |
| Carga inicial (SSD, hasta el menú) | ≤ 20 s | ≤ 30 s |
| Carga de escena o región (SSD) | ≤ 10 s | ≤ 15 s |
| Errores en `Player.log` durante el escenario | 0 | 0 |

**Insumo para el #2:** con 6 GB de VRAM en calidad Baja, el piso es el escenario de memoria más restrictivo. La decisión URP/HDRP tiene que demostrar con una escena de prueba que entra en estos límites, en lugar de suponerlo.

## 5. Metodología de medición con Unity

### 5.1 Herramientas
| Herramienta | Tipo | Uso |
|---|---|---|
| **Unity Profiler** (módulos CPU Usage, GPU Usage, Rendering, Memory) | Integrada en el Editor | Desglose por sistema y por hilo, batches, SetPass, triángulos y memoria total. Se conecta a un *Development Build* en el hardware de prueba. |
| **Frame Debugger** | Integrado en el Editor | Inspección de pases, draw calls y sombras de un frame concreto |
| **Memory Profiler** | **Paquete** (`com.unity.memoryprofiler`) | Snapshots de memoria nativa, administrada y de GPU |
| Profile Analyzer (opcional) | **Paquete** | Comparar capturas antes y después con estadísticas |
| `Player.log` | Archivo del player | Errores y excepciones durante el escenario |

- **Paquetes:** Memory Profiler y Profile Analyzer son paquetes oficiales de Unity, pero son paquetes. Por la regla de dependencias de CLAUDE.md, este ticket no los agrega. Se proponen en un ADR cuando exista el proyecto Unity (#3), con su versión verificada para 6000.3.
- **GPU Usage:** la disponibilidad del módulo depende del API gráfico (DX11, DX12 o Vulkan). Hay que verificarla en el manual de 6000.3 cuando se elija el API. Si el módulo no está disponible, la GPU se mide con la herramienta del fabricante, y esa elección también se documenta en un ADR.
- **Builds:** el desglose se toma de un *Development Build* con el Profiler conectado. Los números que aprueban (FPS y percentiles) se toman de un **build de release** con Windows x64 y IL2CPP, porque el Profiler agrega *overhead*. El método para registrar el frame time en release sin el Profiler se define en un ticket de implementación aparte.

### 5.2 Escenarios estándar
Las escenas de benchmark no existen todavía. Se crean con el proyecto y la vertical slice. Cada una sigue un recorrido de cámara y jugador reproducible, siempre el mismo.

| ID | Escenario | Qué estresa |
|---|---|---|
| `S1-exploracion` | Recorrido por la zona más densa de la vertical slice | Streaming, geometría, draw calls |
| `S2-combate` | Combate típico: jugador, varios enemigos y habilidades | Main thread (IA, animación, física) y VFX |
| `S3-peor-caso` | Máximo de enemigos y efectos simultáneos que permita el diseño | Picos de CPU y GPU, transparencias y GC |

La cantidad de enemigos de `S2` y `S3` se fija junto con el diseño de combate.

### 5.3 Protocolo
1. Fijar y anotar el hardware (modelo exacto, driver de GPU), la versión de Windows, la versión de Unity, el commit, la calidad, la resolución y si VSync está apagado (para medir siempre va **apagado**).
2. Usar un build limpio y reiniciar entre corridas. No dejar otras apps abiertas.
3. Hacer un calentamiento de 30 s, que no se registra (compilación de shaders y caché).
4. Hacer **3 corridas de 60 s por escenario.** El resultado de cada métrica es la **mediana** de las 3 corridas.
5. Tomar en una corrida aparte una captura del Profiler de ≥ 300 frames para el desglose por hilo y por sistema.
6. Tomar un snapshot de memoria al final de `S3`.
7. Comparar contra las secciones 2, 3 y 4 de este documento. Cualquier valor fuera de presupuesto es un defecto con severidad.
8. Repetir después de cada cambio de rendering o de contenido pesado, con una tabla de antes y después.
9. Registrar el resultado en `docs/reports/AUDIT_LOG.md`.

Los informes se guardan en `reports/performance/`, con la convención de nombres de [`reports/performance/README.md`](../../reports/performance/README.md).

## 6. Adaptación del skill `performance-audit`

El skill `.claude/skills/performance-audit` se escribió para el stack web. Este documento lo aplica a Unity así:

| El skill dice | En Unity se aplica como |
|---|---|
| "Fijar hardware y navegador de referencia" | Hardware de la sección 1, más driver de GPU, API gráfico, versión de Unity y tipo de build |
| "memoria JS/GPU" | Heap administrado de C#, memoria nativa, RAM total del proceso y VRAM |
| "errores de consola" | Errores y excepciones en `Player.log` |
| (no existe en el skill) | Se agregan SetPass calls, GC alloc por frame, percentiles p95 y p99, y desglose de main thread, render thread y GPU |

El archivo del skill **no se modifica en este ticket**, porque queda fuera de su alcance. La adaptación de `.claude/` corresponde al ticket #4.
