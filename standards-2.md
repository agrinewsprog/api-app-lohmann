Necesito que implementes la carga a DB de standards desde el CSV /standards-2.csv usando la tabla existente standars_growth (NO crear tablas nuevas).

Objetivo 1. Reutilizar standars_growth como tabla única de standards por (product_id, week, sex). 2. Agregar columnas nuevas necesarias para guardar TODOS los valores del CSV tal cual vienen. 3. Crear un importer (script/servicio) que lea el CSV y haga UPSERT por (product_id, week, sex):
• Verificar el product_id con los productos del csv para que coincidan.
• Si existe: UPDATE
• Si no existe: INSERT 4. NO hacer cálculos, NO multiplicaciones, NO transformaciones de negocio:
• Si un valor es % y en el CSV viene 30,0000, guardar 30.0000 (misma magnitud).
• Si viene 0, guardar 0.
• La única “transformación” permitida es parsear coma decimal a número para persistir (tema técnico), pero sin cambiar el valor.

⸻

Estado actual

Tabla existente standars_growth:
• id
• product_id
• week
• sex
• min_value
• avg_value
• max_value
• created_at
• updated_at

Hoy se usa para weights, pero ahora la vamos a extender con columnas adicionales.

⸻

Regla clave: tipado y precisión
• Para todos los valores numéricos que vengan del CSV:
• Usar DECIMAL(10,4) (o mayor si hace falta) para preservar precisión.
• Para porcentajes:
• Guardar el número tal cual (ej: 95.3000 significa 95.3000% si así viene).
• NO guardar 0.9530 ni dividir/multiplicar.

⸻

1. Migración SQL

Crear migración nueva, por ejemplo:
009_alter_standars_growth_add_columns.sql

Debe: 1. Agregar columnas nuevas según header real del CSV. 2. Crear índice único:
• UNIQUE(product_id, week, sex) 3. Mantener compatibilidad con datos existentes (weights).

Cómo definir columnas nuevas
• Leé el header del CSV /standards-2.csv.
• Convertí los nombres a snake_case.
• Por cada columna numérica nueva, agregar:
• DECIMAL(10,4) NULL
• Si hay columnas no numéricas (texto/categoría), usar VARCHAR(255) NULL.

Importante: no adivines columnas: deben salir del header real del CSV.

⸻

2. Importer CSV (Node/TS)

Crear script/servicio:
• scripts/importProductionStandards.ts (o donde el repo maneje scripts)
• Lee /standards-2.csv
• Detecta el header
• Para cada fila:
• Obtiene product_id, week, sex (si no existe sex en CSV => set female)
• Construye objeto con todas las columnas del CSV mapeadas a snake_case
• Parsea números:
• Reemplazar coma por punto SOLO para parsear, manteniendo el mismo valor.
• Ej 30,0000 -> 30.0000
• UPSERT a DB por (product_id, week, sex) usando el índice único:
• INSERT … ON DUPLICATE KEY UPDATE (MySQL)
• o el mecanismo equivalente según DB.

Requisitos
• Log claro:
• cuántas filas insertadas
• cuántas actualizadas
• cuántas fallaron y por qué
• Validación mínima:
• week debe ser int válido
• product_id no null
• si un valor numérico viene vacío, guardar NULL

⸻

3. Endpoints (si aplica)

Si ya existen endpoints que consultan standars_growth, actualizalos para que puedan devolver también estas nuevas columnas (tal cual están en DB), pero SIN calcular nada.

Ejemplo:
• GET /api/production/products/:id/standards
• ahora debe devolver rows con week + columnas nuevas

⸻

4. IMPORTANTE: separar “persistencia” de “cálculo”

En este ticket NO implementar cálculos de huevos.
El alcance es:
• persistir standards tal cual
• exponerlos tal cual por API

Los cálculos, si se necesitan, van en otro ticket.

5. Si hay alguna duda o algo avisa antes. Asimismo antes de empezar revisa la logica de standards y si esta todo bien entendido, comenza.
   ⸻

Entregables 1. Migración SQL con columnas nuevas y UNIQUE index. 2. Script de importación UPSERT desde /standards-2.csv. 3. Ajuste de repositorio/endpoint para leer y devolver las nuevas columnas sin cálculos. 4. Ejemplo de ejecución con output de logs.
