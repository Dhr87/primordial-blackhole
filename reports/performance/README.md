# reports/performance

Informes de medición de rendimiento. Los presupuestos y la metodología están en [`docs/performance/budgets.md`](../../docs/performance/budgets.md).

## Convención de nombres

```
AAAA-MM-DD_<componente>_<escenario>_<perfil>_<calidad>.md
```

| Campo | Valores |
|---|---|
| `AAAA-MM-DD` | Fecha de la medición |
| `<componente>` | Lo que se evalúa, en kebab-case. Ejemplos: `vertical-slice`, `combate`, `pipeline-urp-test` |
| `<escenario>` | `S1-exploracion`, `S2-combate` o `S3-peor-caso` |
| `<perfil>` | `ref` (referencia), `piso` o `dev` (la PC de desarrollo, **no aprueba**) |
| `<calidad>` | `alta` o `baja` |

Ejemplo: `2027-03-15_vertical-slice_S2-combate_ref_alta.md`

Los datos crudos van en una carpeta con el mismo nombre, sin el `.md`:
- capturas del Profiler (`.data`);
- snapshots de memoria (`.snap`);
- CSV de frame times.

Las capturas son binarios pesados: no se versionan hasta que el repo tenga Git LFS (#3). Hasta entonces, el informe `.md` tiene que incluir las tablas con los valores.

## Contenido mínimo de cada informe
1. Hardware exacto, driver, Windows, versión de Unity, commit, tipo de build, calidad, resolución y VSync.
2. Una tabla por métrica con la mediana de las 3 corridas, el presupuesto y el estado (OK o FUERA).
3. Una tabla de antes y después, si el informe evalúa un cambio.
4. Los defectos encontrados, con su severidad.
5. La decisión y su registro en `docs/reports/AUDIT_LOG.md`.

Si un número no salió de una medición real, no va en un informe.
