# Game Design Document (borrador — Fase 1)

> Estado: EN CONSTRUCCIÓN. Sección 1 aprobada por el Game Director (issue #5). El resto sigue pendiente; el Game Director completa cada sección y la somete a revisión.

## 1. Visión
- Pitch en una frase: Sos un superviviente en un mundo muerto: cazás bestias colosales entre las ruinas de civilizaciones extintas, y cada hallazgo te hace más fuerte y te acerca a una verdad enterrada.
- Género / perspectiva: RPG de acción, tercera persona
- Plataforma: PC (desktop), Windows primero. Motor: Unity (decisión formal en el issue #1).

### Pilares de diseño
Regla de uso: si una idea no sirve a ninguno de los 3 pilares, se descarta.

**Pilar 1 — Combate con peso.** Cada golpe, tuyo o del enemigo, tiene consecuencia y se lee a tiempo.
- Se hace: animaciones con anticipación y recuperación claras, esquiva con ventana de tiempo, enemigos que telegrafían sus ataques, golpes con impacto (hit-stop, stagger).
- Se descarta: combos largos de spam de botones, hordas de decenas de enemigos en pantalla, enemigos esponja sin patrón, escenas de QTE.

**Pilar 2 — Un mundo hostil que se descubre.** El mundo se conoce por tramos y leyendo el entorno, no con texto ni iconos.
- Se hace: ruinas cuya arquitectura y objetos cuentan qué pasó, peligro que escala con la distancia al refugio, secretos que premian explorar.
- Se descarta: mapas enormes y vacíos, exposición en diálogos largos, coleccionables de relleno, un mapa lleno de marcadores.

**Pilar 3 — El botín cambia cómo jugás.** Pocos objetos, cada uno con identidad y efecto en el juego, no solo un número más alto.
- Se hace: una pieza que convierte la esquiva en contraataque, un arma que cambia el ritmo del combate, hallazgos ligados a un lugar y a su historia.
- Se descarta: cientos de drops basura, mejoras de +2% sin identidad, sistemas de crafting complejos, botín puramente aleatorio sin identidad de build.

### Visión de producción (fuera de la vertical slice)
Ideas del Game Director que no entran en la slice y no se pierden: ciudades y asentamientos con otras facciones y razas de supervivientes, y clanes (facciones, reputación, base propia). Si los clanes implicaran jugadores reales, es cooperativo/multijugador, que sigue fuera de alcance. Se reevalúan después de aprobar la vertical slice.

## 2. Universo original
- Trasfondo e historia: _(pendiente)_
- Facciones / civilizaciones: _(pendiente)_
- Reglas de tecnología y magia: _(pendiente)_
- Bestiario inicial: _(pendiente)_

## 3. Sistemas
Progresión, clases, talentos, builds, equipamiento (rarezas, sets, modificadores), loot contextual, economía, combate, IA enemiga. _(pendiente — RPG Systems Designer)_

## 4. Mundo
Regiones, biomas, mazmorras, ciudades, eventos, jefes, secretos. Cada espacio con razón narrativa, funcional o jugable. _(pendiente)_

## 5. Alcance de la vertical slice
Un escenario terminado, personaje detallado, enemigos, combate, efectos, audio, interfaz, loot, progresión y guardado.

## 6. Fuera de alcance (por ahora)
Multijugador, mundo persistente, WebGPU como requisito.
