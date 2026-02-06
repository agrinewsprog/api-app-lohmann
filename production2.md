Necesito que actualices el backend (Node.js + TypeScript + Express, mismo estilo modular que venimos usando en /production/\*) para que el módulo Production Planning deje de usar products.json/standards.json (beta) y pase a usar la base de datos real.

CONTEXTO

- Ya existen módulos production/farms, production/flocks y production/planning.
- Ya existe la tabla `standars_growth` (sí, con ese nombre) que contiene TODOS los standards por semana.
- La tabla `production_flocks` tiene: id, name, hatchDate, hensHoused, productionPeriod (semanas), productId, etc.
- La salida actual del endpoint planning/execute devuelve rows con {period, weekIndex, hensHoused, eggs}, pero eggs se calculaba desde standards JSON.
- Ahora debe leer standards desde DB y además calcular 2 curvas nuevas: Hatching Eggs y Saleable Chicks.

ESQUEMA REAL DE STANDARDS (standars_growth)
Campos relevantes:

- product_id (int)
- week (int)
- sex enum('female','male')
- hh_pct_production (double) -> % HH Production (porcentaje 0-100, tal cual CSV)
- hd_pct_production (double) -> % HD Production (porcentaje 0-100, tal cual CSV)
- he_week (double) -> Hatching Eggs week (valor "tal cual CSV", no porcentaje, ej 6.2)
- he_cum (double) -> Hatching Eggs cumulative (acumulado "tal cual CSV")
- saleable_chicks_week (double) -> Saleable Chicks week (tal cual CSV)
- saleable_chicks_cum (double) -> Saleable Chicks cumulative (tal cual CSV)
- egg_weight_week (double) -> Egg weight (no es clave ahora pero mantener disponible)
- livability, saleable_pct_hatch, etc. existen pero no son requeridos para el endpoint salvo que sea fácil incluirlos.
  NOTA: min_value/avg_value/max_value son BW y NO se usan en planning.

OBJETIVO
Actualizar endpoint:
GET /api/production/planning/execute?flockId=ID

para que:

1. Use el flockId, cargue el flock y su productId.
2. Traiga standards desde DB:
   SELECT \* FROM standars_growth
   WHERE product_id = flock.productId
   AND sex = 'female' (por defecto usar female; luego podremos parametrizar)
   ORDER BY week ASC
3. Determine el "inicio de postura" para NO mostrar semanas con 0:
   - startWeek = la primera week donde hd_pct_production > 0 (o hh_pct_production > 0 si hd viene null).
   - Si no hay ninguna > 0, startWeek = 0.
4. Generar rows SOLO desde startWeek hasta startWeek + productionPeriod inclusive (si productionPeriod=52 normalmente salen 53 filas con la semana 0..52 del periodo, pero aquí el periodo empieza en startWeek).
   - rowWeek = startWeek + i (i=0..productionPeriod)
   - Buscar standard exacto por week = rowWeek.
   - Si falta el standard para esa semana, usar el último disponible anterior (carry-forward) o devolver nulls (elige una estrategia y documentala). Preferencia: carry-forward para no romper el gráfico.
5. Cálculos por semana:
   - hensHoused = flock.hensHoused (se mantiene constante por ahora)
   - eggsWeek = hensHoused _ (hd_pct_production / 100) _ 7
     (si hd_pct_production es null, usar hh_pct_production. Si ambos null, eggsWeek=0)
   - hatchingEggsWeek = hensHoused \* he_week
     (si he_week null => 0)
   - saleableChicksWeek = hensHoused \* saleable_chicks_week
     (si null => 0)
     Y opcionalmente incluir:
   - hatchingEggsCum = hensHoused \* he_cum
   - saleableChicksCum = hensHoused \* saleable_chicks_cum
6. “period”:
   - Mantener el formato actual "YYYY.WW" basado en ISO week.
   - El period debe ser hatchDate ISOweek + rowWeek (offset semanas) (igual que lo veníamos haciendo).
7. Respuesta JSON final:
   {
   flock: { id, name, hatchDate, hensHoused, productionPeriod, farmId, ... },
   product: { id: productId, name: (si lo tienes en products table; si no, devolver solo id) },
   startWeek: number,
   rows: [
   {
   period: "2026.26",
   weekIndex: 0,
   standardWeek: rowWeek,
   hensHoused: 28500,
   eggs: 123690,
   hatchingEggs: 176700, // ejemplo
   saleableChicks: 123000, // ejemplo
   // opcional:
   hatchingEggsCum,
   saleableChicksCum,
   hdPctProduction,
   hhPctProduction
   }
   ]
   }

REQUISITOS DE IMPLEMENTACIÓN

- No usar JSON beta en absoluto para planning.
- Implementar repository/service/controller siguiendo la estructura del proyecto:
  - productionPlanning.repository.ts -> consultas DB
  - productionPlanning.service.ts -> lógica startWeek + cálculo rows
  - productionPlanning.controller.ts -> endpoint
  - productionPlanning.routes.ts -> ruta
- Validar flockId, ownership del flock, y que exista productId.
- Añadir index sugerido si aplica (opcional): (product_id, sex, week) en standars_growth.
- Mantener el código simple y claro.

ENTREGABLE

- Código completo de los cambios (archivos editados/nuevos).
- Explicar brevemente:
  - cómo se determina startWeek
  - cómo se hace carry-forward si falta una week en standards
  - cómo se calculan eggs, hatchingEggs y saleableChicks.
