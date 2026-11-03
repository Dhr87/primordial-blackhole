# ADR 0003 — Pipeline de render: URP vs HDRP
Estado: **Aceptado** (aceptado por el Game Director el 2026-11-03) · Fecha: 2026-11-03 · Ticket: #2 · Depende de: ADR 0002 (Unity 6.3 LTS, Windows x64)

> **Ningún número de este ADR es una medición.** El proyecto Unity todavía no existe (#3). Todos los valores son metas o límites que vienen de `docs/performance/budgets.md`.

## Contexto
El template del proyecto Unity se elige al crearlo (#3), así que el pipeline de render tiene que estar decidido antes. Unity lo advierte: *"It can be very time-consuming to switch a project from one render pipeline to another, especially if the project is far along in development."* [F5]

Qué le pide el juego al render:
- **Pilar 1, combate con peso:** VFX de combate legibles, frame estable (p95 y p99, cero hitches, ver budgets.md §2.3), y hit-stop y stagger que no se pierdan entre caídas de FPS.
- **Pilar 2, mundo hostil que se descubre:** ruinas monumentales, sci-fi oscuro y atmósfera. Eso pide niebla, luz volumétrica, sombras de calidad e iluminación que cuente historia. También hay jefes colosales, que exigen mucha distancia de dibujo y sombras de gran escala.
- **Hardware:** referencia RTX 4060 de 8 GB (60 FPS en Alta, GPU ≤ 14,0 ms). Piso RTX 2060 de 6 GB (30 FPS en Baja, GPU ≤ 28,0 ms, VRAM del juego ≤ 4,5 GB, render targets ≤ 0,75 GB). Ver budgets.md §1, §2 y §4.
- **Equipo:** muy chico, que trabaja con agentes de IA. El tiempo de producción pesa más que el techo visual.

## Estado oficial de los pipelines (verificado el 2026-11-03)

### Estrategia de Unity para 2026: el cambio de rumbo
El post oficial "Render Pipelines strategy for 2026" (foro de Unity, etiqueta *Official*, 23 de febrero de 2026) [F1] dice textualmente:
- HDRP: *"Maintaining HDRP, focusing only on expanding platform reach with Nintendo Switch™ 2 support and stability."* y *"While no new features are planned for HDRP…"*. También: *"we are focusing maintenance of HDRP on stability, regressions and critical issues of widely used functionalities while we continue to accelerate URP's feature set and capabilities."*
- URP: *"We are heavily investing on enhancing its visual capabilities to cover genres requiring dynamic 3D content and dynamic lighting conditions […]. This will include physical light units support, pre and auto exposure, physical sky and dynamic sky manager, real-time global illumination […], screen space reflections, on-tile post processing for mobile devices, and more."*
- Proyectos nuevos: *"we strongly encourage using URP when starting any new project, and converting all education and asset store content to be compatible by default with URP."*
- Built-in: queda deprecado desde Unity 6.5, y se garantiza su disponibilidad hasta 6.7 LTS.

Lo que **no está verificado**:
- El post no usa la expresión "maintenance mode" ni da una fecha de fin de soporte de HDRP. Ninguna respuesta de Unity en la primera página del hilo aclara si URP va a recibir **niebla volumétrica** o agua (lo preguntó un usuario). Solo se leyó la página 1 del hilo.
- **En qué versión llega cada mejora prometida para URP** (GI en tiempo real, SSR, physical sky). Nada indica que estén en 6.3. Usarlas exigiría saltar de rama, y según el ADR 0002 eso requiere un ADR nuevo.
- Una búsqueda devolvió un resumen secundario que decía que "HDRP no es compatible con 6000.3". Viene de un listado del Asset Store sobre un asset concreto, no sobre HDRP. La documentación oficial de HDRP 17.3 existe y lista sus plataformas [F6]. **Se descarta esa afirmación.** Que el paquete 17.3 sea el que corresponde a Unity 6.3 se infiere de la convención de versiones que describe [F3], pero no se confirmó en una tabla explícita.

### Requisitos de hardware y API
| | URP (6000.3) | HDRP (17.3) |
|---|---|---|
| API en Windows | DX11 (feature level 11_0+), DX12, Vulkan [F3] | *"DirectX 11 or DirectX 12 and Shader Model 5.0"* y Vulkan [F6] |
| Compute shaders | No los exige el pipeline: *"This package does not add any extra platform-specific requirements."* [F3] | Obligatorios: *"HDRP only works on these platforms if the device you use supports Compute Shaders."* [F6] |
| Ray tracing | No disponible [F2] | Opcional. En Windows *"Requires DX12, and platforms with hardware supporting RTX."* [F2] |
| GPU mínima | No figura en la documentación | No figura en la documentación [F6] |

La RTX 2060 (piso) y la RTX 4060 (referencia) son GPU DX12 con compute shaders, así que **los dos pipelines son técnicamente compatibles con los dos perfiles.** Esto es una inferencia a partir de los requisitos de API, no una prueba en esas placas.

### Funciones relevantes para este proyecto (comparativa oficial 6000.3 [F2])
La tabla oficial se extrajo con las celdas aplanadas. La asignación a cada columna se revisó fila por fila, pero conviene confirmarla visualmente en la página antes de aceptar el ADR.

| Función | URP 6.3 | HDRP | Importancia para el juego |
|---|---|---|---|
| Niebla exponencial | Sí | Sí | Base de la atmósfera |
| Niebla volumétrica local, scattering atmosférico | **No** | Sí | **Alta**: rayos de luz en las ruinas, profundidad |
| Nubes volumétricas | **No** | Sí | Baja (el juego transcurre sobre todo en ruinas) |
| Screen Space Reflections | **No** (prometido a futuro [F1]) | Sí | Media: pisos mojados o metálicos |
| GI en tiempo real (SSGI) | **No** (prometida a futuro [F1]) | Sí | Media (se cubre con GI horneada y probes) |
| Probe Volumes (APV): iluminación por píxel, blending, streaming | Sí (streaming *"Incl. non compute pass for lower end devices"*) | Sí | **Alta**: iluminación indirecta de ruinas |
| Contact shadows | **No** | Sí | Media: anclar personajes y jefes al suelo |
| Area lights | Rectángulo y disco **solo horneadas** | Rectángulo en tiempo real y horneado, tubo en tiempo real | Media: paneles de luz sci-fi |
| Decals | Proyectados o screen-space, con decal layers, **sin decals emisivos** | Proyectados y de malla, en transparentes, **emisivos** | Media: marcas de impacto, runas o paneles que brillan |
| Physical sky | **No** (prometido a futuro [F1]) | Sí | Baja |
| Ray tracing (reflejos, sombras, GI, AO) | **No** | Sí (DX12 + RTX) | Baja: el piso no puede depender de RT (budgets.md §1.2) |
| Luces por cámara | Forward+: hasta 256 según la plataforma [F4] | En Deferred, 63 por tile de 16×16 px | Suficiente en los dos casos para el límite de budgets.md §3 |

Rendering paths de URP [F4]: **Forward, Forward+, Deferred y Deferred+.** Forward+ tiene luces por objeto *"Unlimited"* y soporta MSAA. Deferred no soporta MSAA.

### Herramientas de rendimiento y contenido de URP (6000.3)
- **GPU Resident Drawer** (reduce el trabajo de CPU con instancing por GPU) [F8]: *"works only with […] The Forward+ rendering path"* y con APIs que soporten compute shaders. Cuesta tiempo de build: *"Build times are longer because Unity compiles all the BatchRendererGroup shader variants into your build."* **Discrepancia sin resolver:** la tabla comparativa [F2] dice *"Supported on Forward+ and Deferred+"*, mientras que la página propia [F8] solo nombra Forward+. Se resuelve en la prueba (ver el plan de validación).
- **STP** (upscaler por software) [F9]: *"STP uses compute shaders, so target platforms must support Shader Model 5.0."* y *"STP requires temporal anti-aliasing (TAA) pre-processing"*. Es una palanca para el piso: renderizar por debajo de 1080p y escalar.
- **VFX Graph 17.3** [F7]: *"compatible with the Universal Render Pipeline (URP) and the High Definition Render Pipeline (HDRP)."* Un aviso importante: *"The Visual Effect Graph isn't out of preview for URP, which means it only supports some of the platforms that URP supports."* y *"The Visual Effect Graph is out of preview for HDRP, which means it supports every platform that HDRP supports."* Requiere compute shaders y SSBO en los dos pipelines. **No verificado:** si Windows x64/DX12 está dentro de las plataformas soportadas de VFX Graph en URP. Tampoco la lista de funciones de VFX Graph exclusivas de HDRP, porque la página de comparación de VFX devolvió 404.

## Comparativa aplicada al proyecto

### 1. Rendimiento frente a los presupuestos
| | URP | HDRP |
|---|---|---|
| Costo base del frame | Escalable desde móvil hasta PC [F5]. Las funciones caras (volumétricos, SSGI, SSR) no existen, así que tampoco cuestan. | Pensado para *"high-end platforms"* y para aprovechar *"async compute shaders"* [F5]. Arranca con más pases activos (volumétricos, sky, exposure, SSR), que hay que apagar por calidad. |
| GPU a 60 FPS en la referencia (≤ 14,0 ms) | Plausible. Hay margen para agregar un volumétrico propio (ver §3). | Plausible en Alta con ajuste. El reparto de budgets.md §2.2 (2,0 ms de post-proceso, 2,5 ms de iluminación) queda justo si los volumétricos y el SSR están activos. |
| CPU (render thread ≤ 10,0 ms, batches ≤ 2.500) | SRP Batcher y GPU Resident Drawer con Forward+ [F8] | SRP Batcher y GPU Resident Drawer (disponible en HDRP: **no verificado** en este ADR) |
| Riesgo de presupuesto | Bajo a medio | Medio a alto |

**No hay mediciones que respalden estas valoraciones.** Se basan en el posicionamiento oficial de cada pipeline [F5] y en qué funciones trae cada uno [F2]. El plan de validación las convierte en datos.

### 2. Viabilidad del piso (RTX 2060, 6 GB, calidad Baja, 30 FPS)
- **URP: viable según los requisitos documentados**, y es el pipeline diseñado para escalar hacia abajo [F5]. STP permite bajar la resolución interna [F9]. El riesgo principal en el piso es la VRAM de texturas (2,0 GB), no el pipeline.
- **HDRP: compatible según los requisitos** (DX12, SM 5.0 y compute [F6]), pero **la viabilidad del piso no está demostrada** y tiene más riesgo: los buffers y pases propios de HDRP (G-buffer, volumétricos, historiales temporales) compiten con el límite de 0,75 GB de render targets y 4,5 GB de VRAM total del juego. **No se puede afirmar que HDRP sea inviable en el piso, ni que sea viable.** Habría que medirlo.

### 3. Calidad visual alcanzable (pilar 2, sci-fi oscuro)
- **HDRP** tiene el techo más alto y trae de fábrica justo lo que pide la ambientación: niebla volumétrica local, luces que atraviesan el volumen, contact shadows, area lights en tiempo real, decals emisivos, SSR y SSGI [F2].
- **URP 6.3** llega a una atmósfera oscura convincente con niebla exponencial, APV, iluminación horneada, post-proceso, Forward+ con muchas luces locales y emisivos en los materiales. **Le faltan** volumétricos locales, contact shadows, SSR y area lights en tiempo real [F2].
  - La brecha más importante para el pilar 2 es la **luz volumétrica**. Hay tres caminos: (a) un *Renderer Feature* propio, con costo de ingeniería y una meta de GPU a fijar; (b) un asset de terceros, que exige un ADR por la regla de dependencias; (c) falsificarla con geometría y partículas (*light shafts* con planos y VFX), que es barato y es el estándar en juegos de este estilo.
  - Unity promete GI en tiempo real, SSR y physical sky para URP [F1], pero **no en 6.3** y sin versión confirmada.
- Ninguno de los dos aporta ray tracing utilizable en el piso, así que el RT no cuenta a favor de HDRP para este juego (budgets.md §1.2).

### 4. Esfuerzo de producción para un equipo muy chico
| | URP | HDRP |
|---|---|---|
| Shader Graph | Soportado | Soportado |
| VFX Graph | Soportado, pero **en preview para URP** [F7]: es un riesgo | Fuera de preview [F7] |
| Configuración e iluminación | Menos parámetros. *"Designed for both realistic and stylized lighting"* [F5] | Físicamente correcta, con unidades físicas de luz y exposición [F5]. Más potente, pero con más controles que dominar (exposure, volúmenes, perfiles) |
| Assets del Asset Store y material educativo | Unity los orienta a URP por defecto [F1] | Menos contenido nuevo esperable, porque HDRP no tiene funciones planeadas [F1] |
| Futuro del pipeline | **Recibe la inversión** [F1] | **Sin funciones nuevas** [F1]. Una producción de varios años quedaría fijada en el conjunto actual |

### 5. Costo de cambiar de pipeline más adelante
- Los proyectos de URP y de HDRP no son compatibles entre sí [F3][F6], y Unity avisa que cambiar lleva mucho tiempo [F5].
- **No se encontró una ruta oficial de migración de HDRP a URP** en las fuentes leídas. Unity solo publica guías de Built-in a URP [F1].
- Al cambiar hay que rehacer los materiales (shaders Lit de cada pipeline), los perfiles de volumen y post-proceso, la iluminación de las escenas y las salidas de VFX Graph. **No verificado:** si un mismo Shader Graph puede tener targets de los dos pipelines sin rehacerlo.
- **El costo crece con cada asset producido.** El momento más barato para revertir es justo después de la escena de validación, antes de producir arte final.
- Hay una asimetría a favor de URP: si URP no alcanza, pasar a HDRP es caro, pero HDRP sigue documentado y mantenido. Si HDRP se queda sin funciones o pierde soporte, salir de él es igual de caro y sin una ruta oficial.

## Decisión propuesta
**Recomendación del Technical Director: URP (el paquete de URP que trae Unity 6.3 LTS), con Forward+ como rendering path por defecto.**

Argumentos, en orden de peso:
1. **Rumbo oficial de Unity.** HDRP no tiene funciones nuevas planeadas y Unity recomienda URP para cualquier proyecto nuevo [F1]. Este proyecto empieza a fines de 2026 y va a durar años.
2. **Presupuestos y piso.** URP es el pipeline pensado para escalar [F5] y ofrece la ruta de menor riesgo hacia 14,0 ms en la referencia y hacia 28,0 ms y 4,5 GB de VRAM en el piso.
3. **Equipo chico.** Tiene menos superficie de configuración, el ecosistema y el contenido educativo apuntan a URP [F1], y Shader Graph está disponible.
4. **Forward+:** es requisito del GPU Resident Drawer [F8], soporta MSAA [F4] y no tiene límite de luces por objeto [F4]. Cambiar a Deferred o Deferred+ dentro de URP es un ajuste del renderer, no un cambio de pipeline, y se puede decidir con datos en la prueba.

Lo que se acepta perder: volumétricos locales, contact shadows, SSR, SSGI y area lights en tiempo real nativos [F2]. La atmósfera del pilar 2 se construye con niebla, APV, luz horneada, emisivos, VFX y post-proceso. La luz volumétrica se resuelve con uno de los tres caminos de §3, a elegir en la validación.

## Decisión del Game Director (2026-11-03)
- **Pipeline:** URP (el paquete que trae Unity 6.3 LTS), con **Forward+** como rendering path por defecto.
- **Meta de hardware:** se mantiene la de `docs/performance/budgets.md` (1080p/60 en calidad Alta con GPU de 8 GB de VRAM; piso de generación anterior con 6 GB). No se sube la meta.
- **Nivel de calidad "Ultra" (opcional):** se agrega para hardware más potente (por ejemplo, más resolución, sombras y texturas de mayor calidad). Es un extra: no forma parte de los criterios de aprobación ni de la Fase 5, y no cambia ningún presupuesto.

La aceptación se da con la validación pendiente: la escena `S0-validacion-pipeline` sigue siendo obligatoria antes de producir arte final, y su aprobación definitiva exige el hardware de referencia y de piso.

## Alternativas descartadas
- **HDRP.** Tiene la mayor calidad de partida y trae volumétricos nativos, que es lo que más pide la ambientación. Se descarta por estas razones: no tiene funciones nuevas planeadas [F1]; hay más riesgo de no entrar en el piso de 6 GB (no demostrado en ninguna dirección); requiere más configuración y especialización para un equipo chico; y salir de él después no tiene una ruta oficial. **Se reconsidera solo si** la validación demuestra que URP no alcanza el pilar visual dentro de los presupuestos (ver criterios de reversión).
- **URP con Deferred o Deferred+ como path por defecto.** No se descarta: queda como opción a comparar en la prueba. Deferred no tiene MSAA [F4], y la compatibilidad de Deferred+ con el GPU Resident Drawer es contradictoria en la documentación [F2][F8].
- **Built-in Render Pipeline.** Queda deprecado desde 6.5 y Unity *"strictly do[es] not recommend it for any new title"* [F1].
- **Pipeline propio (SRP a medida).** Un equipo muy chico no puede mantenerlo, y contradice el criterio del ADR 0002 de apoyarse en el motor.

## Consecuencias para arte y VFX (si se acepta URP)
- **Materiales:** URP Lit y Shader Graph con target URP, con un flujo PBR de metal y rugosidad. Los materiales y shaders de HDRP del Asset Store no sirven sin conversión.
- **Iluminación:** luz horneada con APV como base, y luces locales en tiempo real dentro del límite de budgets.md §3 (≤ 4 con sombra en la referencia, ≤ 1 en el piso). Los paneles de luz sci-fi se resuelven con emisivos y area lights horneadas, no en tiempo real [F2].
- **Atmósfera:** no hay niebla volumétrica nativa. La dirección de arte tiene que diseñar la profundidad con niebla exponencial, capas de partículas, *light shafts* falsos y contraste de iluminación. Esto debe quedar escrito en las reglas de iluminación de `docs/ART_DIRECTION.md`, que hoy figuran como "a definir".
- **Decals:** no hay decals emisivos [F2]. Las marcas que brillan (runas, paneles, quemaduras de energía) van como mallas o partículas emisivas.
- **Jefes colosales:** no hay contact shadows [F2]. El anclaje al suelo se resuelve con la calidad de las sombras de la luz principal, AO y decals de sombra.
- **VFX:** VFX Graph está en preview para URP [F7], así que su uso en Windows se valida en la prueba. El plan B es el Particle System clásico (Shuriken), que es parte del motor. **No verificado** en este ADR que Shuriken tenga soporte completo en URP 6.3. Todo VFX de combate tiene que leerse sin depender de distorsión ni refracción hasta confirmar qué soporta cada uno.
- **Upscaling:** STP es la palanca del piso [F9]. Implica TAA, y los VFX y la UI tienen que verse bien con TAA activo (ghosting en partículas rápidas).
- **Prototipo (Fase 2):** hasta que `S0-validacion-pipeline` esté validada en el hardware de referencia, el prototipo usa greybox y activos `PLACEHOLDER_`, sin arte final.

## Prueba mínima

### Por qué no se puede hacer ahora
- El proyecto Unity no existe; lo crea el #3. Hacer dos proyectos de prueba (URP y HDRP) por fuera del #3 sería trabajo fuera del alcance de este ticket.
- El equipo solo tiene la PC de desarrollo (RTX 5070). Según budgets.md §1, **no sirve para aprobar**, porque oculta problemas de VRAM y de CPU. El hardware de referencia y el del piso todavía no está disponible (budgets.md §1.3).
- Por eso este ADR **no incluye ni inventa mediciones.** La recomendación se basa en la documentación oficial y queda sujeta al plan de validación.

### Plan de validación (primera escena después del #3)
**Escena:** `S0-validacion-pipeline`, una porción de ruina en greybox. Lleva `PLACEHOLDER_` y figura en `docs/qa/placeholders.md`. Contiene:
- un corredor interior y un espacio abierto de escala monumental con una silueta de jefe colosal (malla placeholder de alto conteo de triángulos);
- una luz direccional con sombras, 4 luces locales con sombra y unas 30 sin sombra;
- APV horneado y niebla exponencial;
- el camino elegido para la luz volumétrica (de §3);
- un efecto de combate en VFX Graph (ráfaga e impacto) repetido en el peor caso de `S3-peor-caso`;
- post-proceso: tonemapping, bloom, color grading y STP en el piso.

**Variantes que se miden:** URP Forward+ (principal) y URP Deferred+ (contraste). HDRP solo se prueba si se dispara un criterio de reversión.

**Qué se mide:** el protocolo de budgets.md §5.3 (3 corridas de 60 s, mediana, build de release IL2CPP, VSync apagado).

| Métrica | Umbral de aceptación (budgets.md) | Perfil |
|---|---|---|
| GPU frame time | ≤ 14,0 ms | Referencia, Alta |
| GPU frame time | ≤ 28,0 ms | Piso, Baja (con STP si hace falta) |
| Render thread | ≤ 10,0 ms (ref) / ≤ 20,0 ms (piso) | Ambos |
| Frame time p95 / p99 | ≤ 16,7 / 20,0 ms (ref); ≤ 33,3 / 40,0 ms (piso) | Ambos |
| Hitches de más de 50 ms | 0 | Ambos |
| Batches / SetPass | ≤ 2.500 / 300 (ref); ≤ 1.500 / 200 (piso) | Ambos |
| VRAM total del juego | ≤ 6,0 GB (ref); ≤ 4,5 GB (piso) | Ambos |
| Render targets a 1080p | ≤ 1,0 GB (ref); ≤ 0,75 GB (piso) | Ambos |
| Costo de la luz volumétrica | Meta a fijar antes de medir, dentro de los 2,5 ms de iluminación o los 2,0 ms de post-proceso de budgets.md §2.2 | Referencia |
| Calidad visual de la atmósfera | `visual-judge` (que no participó en la escena) ≥ 8 en iluminación y atmósfera | Referencia |
| VFX Graph | Corre en el build de Windows x64 sin errores en `Player.log` | Ambos |
| GPU Resident Drawer | Confirmar con qué paths funciona (resuelve la discrepancia [F2]/[F8]) | Referencia |

**Hardware:** la aprobación exige la RTX 4060 (referencia) y la RTX 2060 de 6 GB (piso). Mientras no estén disponibles, la PC de desarrollo sirve para iterar y detectar fallos grandes, pero **no para aceptar** (budgets.md §1).

**Criterios de decisión:**
- **Se confirma URP** si se cumplen todos los umbrales en los dos perfiles.
- **Se optimiza, no se revierte,** si se exceden umbrales de rendimiento por contenido o configuración (sombras, triángulos, resolución). Se aplica el ciclo de CLAUDE.md, con un máximo de 5 iteraciones.
- **Se reabre el ADR y se arma la misma escena en HDRP** si, después de esas iteraciones, (a) `visual-judge` no llega a 8 en atmósfera porque faltan funciones del pipeline (no por falta de arte), o (b) VFX Graph no funciona en Windows con URP y Shuriken no alcanza para el pilar 1. En ese caso, HDRP también tiene que pasar los umbrales del piso para ganar.

## Impacto en budgets.md (para revisar al aceptar; este ticket no lo modifica)
1. **§2.2 Reparto de la GPU:** rehacerlo para URP Forward+. Hace falta una línea explícita para la **luz volumétrica o la atmósfera**, sacando tiempo de "Iluminación" o "Post-proceso". "Iluminación" en Forward+ se paga dentro del pase opaco (no hay pase de luces separado), así que habría que fusionar o redefinir esas filas.
2. **§2.2 Post-proceso:** sumar el costo de **TAA y STP** si se usan. En el piso, el post-proceso corre a la resolución de salida y la geometría a la resolución interna, y el reparto tiene que reflejarlo.
3. **§3 Batches y SetPass:** con SRP Batcher y GPU Resident Drawer, los batches y los SetPass dejan de reflejar bien el costo de CPU. Conviene definir qué contador se usa como límite.
4. **§3 Luces con sombra:** confirmar que los 4 y 1 son razonables con el atlas de sombras de URP. Revisar también la distancia y las cascadas de la luz principal, que son críticas para los jefes colosales.
5. **§4 Render targets:** recalcular los 1,0 y 0,75 GB con los buffers de URP Forward+ (depth, normales si las hay, color HDR, historial de TAA y STP). Si se elige Deferred+, sumar el G-buffer.
6. **§4 Tamaño del build y carga:** el GPU Resident Drawer obliga a guardar todas las variantes de BatchRendererGroup y alarga el build [F8]. Revisar el tamaño de la vertical slice (≤ 5 GB) y agregar un límite de variantes de shader y de tiempo de compilación.
7. **§5.1 Herramientas:** agregar el Rendering Debugger de URP al protocolo si se verifica que está disponible en 6000.3 (no verificado en este ADR).

## Fuentes (consultadas el 2026-11-03)
- [F1] Unity Discussions, "Render Pipelines strategy for 2026" (post oficial, 23/02/2026): <https://discussions.unity.com/t/render-pipelines-strategy-for-2026/1710004>
- [F2] Unity 6.3 Manual, Render pipeline feature comparison: <https://docs.unity.com/en-us/engine/6000.3/manual/render-pipelines/choose-a-render-pipeline/feature-comparison> (redirige desde `docs.unity3d.com/6000.3/Documentation/Manual/render-pipelines-feature-comparison.html`)
- [F3] Unity 6.3 Manual, URP requirements: <https://docs.unity.com/en-us/engine/6000.3/manual/render-pipelines/universal-render-pipeline/requirements>
- [F4] Unity 6.3 Manual, URP rendering paths comparison: <https://docs.unity.com/en-us/engine/6000.3/manual/render-pipelines/universal-render-pipeline/introduction/urp-concepts/rendering-paths/comparison>
- [F5] Unity 6.3 Manual, Choose a render pipeline: <https://docs.unity.com/en-us/engine/6000.3/manual/render-pipelines/choose-a-render-pipeline/pipeline>
- [F6] HDRP 17.3, System requirements and compatibility: <https://docs.unity3d.com/Packages/com.unity.render-pipelines.high-definition@17.3/manual/System-Requirements.html>
- [F7] Visual Effect Graph 17.3, System requirements: <https://docs.unity3d.com/Packages/com.unity.visualeffectgraph@17.3/manual/System-Requirements.html>
- [F8] Unity 6.3 Manual, GPU Resident Drawer (URP): <https://docs.unity.com/en-us/engine/6000.3/manual/analysis/graphics-performance-profiling/in-urp/reduce-draw-calls-urp/reduce-rendering-work-on-cpu/gpu-resident-drawer>
- [F9] Unity 6.3 Manual, STP upscaler (URP): <https://docs.unity.com/en-us/engine/6000.3/manual/cameras/urp/change-resolution-scale-urp/stp-upscaler>
- Complementaria, también oficial: URP introduction 6.3: <https://docs.unity.com/en-us/engine/6000.3/manual/render-pipelines/universal-render-pipeline/urp-introduction>

**Fuentes que no se pudieron leer:** la comparación de funciones de VFX Graph entre URP y HDRP (`com.unity.visualeffectgraph@17.3/manual/rp-feature-comparison.html` devolvió 404). Las páginas 2 en adelante del hilo [F1] no se leyeron.
