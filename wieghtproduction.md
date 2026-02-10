# Prompt para Claude — Módulo Weight & Uniformity (Producción, sin mocks)

Quiero que implementes/ajustes el módulo **Weight & Uniformity** en el backend **usando datos reales de producción** (DB) y eliminando cualquier dependencia de **mocks / JSON**.

**Importante:** antes de codear, **revisá el repo y razoná**:

- qué ya existe (tablas, endpoints, módulos, servicios)
- qué falta realmente para completar el flujo
- qué conviene persistir y qué conviene calcular on-the-fly
- mantené coherencia con el estilo/arquitectura actual del proyecto

No quiero que sigas un “paso a paso” rígido; quiero que pienses la solución y la implementes con criterio, pero respetando el flujo funcional y las fórmulas.

---

## 1) Contexto actual (lo que ya tenemos)

- Existe la tabla `weight_flocks` (flocks del usuario para este módulo).
- Existe la tabla `standards_growth` con standards reales del cliente.
  - `standards_growth` tiene `product_id`, `week`, `sex` y valores de referencia de peso (min/avg/max) + otros campos.
- Actualmente en algún punto se usan **mocks / JSON** para standards o para cálculos (esto debe eliminarse).

Lo que **no** tenemos (o no está completo):

- Persistencia de **pesos ingresados por el usuario** por semana (samples).
- Persistencia de **resultados calculados** (uniformity / CV) por semana y flock.
- Endpoints robustos que permitan:
  - guardar pesos por semana
  - consultar lo guardado
  - traer standards desde DB para esa semana y producto
  - mantener historial por flock

---

## 2) Flujo funcional esperado (Weight & Uniformity)

El flujo (como lo explicó el cliente) es:

1. El usuario selecciona/crea un **flock** dentro del módulo Weight.
2. Para una **week** determinada, el usuario ingresa una lista de **pesos reales** (g) de varias aves.
3. Con esos pesos se calcula:
   - **Mean (Average Weight)**
   - **Standard Deviation**
   - **CV (%)** = (std_dev / mean) \* 100
   - **Uniformity (%)** = (cantidad de aves dentro de ±10% del mean / total) \* 100
4. Además, para esa week, se deben obtener los **standards** del cliente desde DB (`standards_growth`) para mostrar referencia:
   - min / avg / max (según `product_id`, `week`, `sex`)
5. Todo esto debe quedar asociado a:
   - `user`
   - `flock`
   - `week`
   - `sex`

**Nota sobre la week:**

- Si `weight_flocks.hatch_date` existe, la week se puede inferir por diferencia entre fechas (hatch_date vs hoy).
- Si no existe o el front decide controlarlo, la week puede venir explícita desde el front.
  Implementalo de forma razonable (y consistente con el repo).

---

## 3) Fórmulas del cliente (sin reinterpretar)

### Uniformity

Uniformity (%) = (Birds within ±10% of mean weight / Total birds weighed) × 100

- lower_limit = mean \* 0.9
- upper_limit = mean \* 1.1

### CV

CV (%) = (Standard Deviation / Mean Weight) × 100

Interpretación (para devolver al front si querés):

- Uniformity: Very Good >85%, Good 80–85%, Fair 70–80%, Poor <70%
- CV: ideal <8% (laying hens)

---

## 4) Qué hay que lograr (objetivo técnico)

- **Eliminar mocks/JSON** y usar **standards_growth** como fuente de verdad.
- Diseñar/crear la persistencia necesaria para:
  - guardar los **weights samples** por semana
  - guardar el **resultado calculado** por semana
- Crear/ajustar endpoints para que el front pueda:
  - guardar una medición de una week
  - leer una medición existente
  - listar historial por flock
  - obtener standards por week/product/sex desde DB

---

## 5) Sugerencia de endpoints (podés adaptarlo al estilo del repo)

### Guardar pesos de una week

`POST /api/weight/uniformity/week`

Body ejemplo:

```json
{
  "flockId": 12,
  "week": 22,
  "sex": "female",
  "weights": [900, 880, 910, 870, 1050, 905, 920, 750, 890, 915]
}
```

Debe:
• validar ownership del flock
• validar weights (array, mínimo razonable, ints)
• calcular mean, std_dev, cv, uniformity
• persistir
• traer standards desde standards_growth para esa week/product/sex
• devolver payload completo para que el front pinte la pantalla

Consultar datos de una week

GET /api/weight/uniformity/week?flockId=12&week=22&sex=female

Debe devolver:
• si existe medición guardada: medición + weights + standards
• si no existe: standards y estructura “vacía” para que el front muestre referencia

⸻

### 6) Reglas/criterios

    •	No duplicar ni recalcular standards: solo leer de standards_growth.
    •	Persistir lo que tenga sentido para historial y para que el usuario no pierda mediciones.
    •	Mantener consistencia con la arquitectura existente (controllers/services/repos/validators).
    •	Hacerlo robusto:
    •	validaciones claras
    •	ownership
    •	errores HTTP correctos
    •	índices/constraints razonables

⸻

7. Entregable esperado
   • Migraciones SQL (tablas nuevas o ajustes) necesarias para:
   • mediciones (resultado)
   • samples (pesos individuales)
   • Módulo backend completo (tipos, validadores, repo, service, controller, routes) siguiendo la estructura del repo.
   • Remover/neutralizar código viejo que use mocks/JSON.

Antes de implementar, revisá el repo para entender:
• cómo están estructurados los módulos (ej: production/farms, production/flocks, standards)
• cómo hacen auth/ownership
• cómo hacen migraciones y naming conventions
y decidí la mejor integración.
