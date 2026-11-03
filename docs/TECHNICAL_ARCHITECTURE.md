# Arquitectura técnica

## Principios
Modular, desacoplada, sin monolitos. Cada sistema tiene responsabilidad única y se comunica por contratos explícitos (interfaces TS + bus de eventos tipado).

## Sistemas
Rendering · Game Loop · Input · Character Controller · Combat · Skills · Inventory · Equipment · Loot · Progression · Quests · Enemy AI · NPC · World · Physics · Animation · Audio · UI · Save · Networking

## Contrato base (ya en `src/core/`)
- `System`: `init()`, `fixedUpdate(dt)`, `update(dt)`, `dispose()`.
- `GameLoop`: timestep fijo para simulación/física, render por frame.
- `EventBus`: eventos tipados entre sistemas (sin referencias directas).

## Reglas de dependencia
- `core` no depende de nadie.
- Los sistemas de gameplay no importan `rendering` ni `ui`; hablan por eventos.
- `networking` queda como interfaz vacía hasta que se decida el cooperativo.

## Pendiente (Technical Architect)
Diagrama de dependencias, formato de datos (ítems, skills, enemigos), esquema de guardado versionado en IndexedDB, estrategia de carga progresiva de assets.
