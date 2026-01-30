# CONTEXTO (NO INVENTAR)

Estamos replicando el módulo "Production Planning" de una app existente (Lohmann).
Objetivo: construir una API propia + DB MySQL para producción, pero en esta fase:

- Farms y Flocks: SE GUARDAN EN DB (como producción).
- Products y Standards (incluye eggs por week): SE SIMULAN (modo beta) desde JSONs mock (sin DB por ahora).

Datos observados del sistema real:

- Endpoint de products lista: GET /products/?uuid=...&userName=...
- Endpoint de flocks list: GET /flock/list?uuid=...&userName=...
- Endpoint de farms list: GET /farm/list?uuid=...&userName=...
- Endpoint getProductsById trae product + standards[week 0..72] con eggs/hours etc.

En nuestro sistema:

- Autenticación: JWT. req.user.id disponible.
- Un usuario puede crear Farms.
- Un usuario puede crear Flocks vinculados a una Farm (farm_id obligatorio).
- Luego, al "Execute plan", se calcula una tabla por period (año.semana) con hens housed y eggs.
- El valor de eggs depende del product seleccionado: algunos products devuelven eggs=0 en standards y por eso el plan queda todo 0.
- El user puede cambiar product del flock y el plan cambia (eggs deja de ser 0).

# OBJETIVO TÉCNICO

Implementar:

1. Esquema DB MySQL para farms y flocks (producción real).
2. Endpoints CRUD mínimos para farms + flocks.
3. Endpoints "planning" que consuman standards mock (JSON) para calcular el plan por semanas.
4. Mantener contratos estables para luego reemplazar standards JSON por DB real.

# REGLAS IMPORTANTES

- NO usar ids hardcodeados en backend.
- Todo filtrado por req.user.id (ownership).
- farm_id en flock es obligatorio.
- productId se guarda en flock (string UUID).
- hatch_date se guarda en DB (fecha). En la app aparece formato mm/dd/yyyy, pero nosotros guardamos ISO.
- production_period (cullingAge) por defecto 72, pero debe ser editable (int).
- hens_housed int.
- Al listar flocks, incluir farm {id,name} si se puede (join).
- Standards/product data NO va a DB en beta: se lee desde archivos JSON (mock).

# ARTEFACTOS MOCK (BETA)

Crear en el repo una carpeta /mocks:

- products.json: lista de products (id, name, productgroup, color, producttype, kindofattitude, etc).
- standards_by_product.json (o un archivo por product): map productId -> standards[] (week 0..72).
  Cada standard tiene al menos: week, eggs (number), hours (number) y otros campos si existen.
  Nota: los standards ya los tenemos/extraemos del endpoint getProductsById real. En beta cargamos 2 products:
- Product A: eggs siempre 0 (para reproducir el caso "todo 0")
- Product B: eggs con valores (para reproducir el caso "muestra datos")

# MODELO DE DATOS (MySQL)

## Tabla: users

Ya existe. Solo usar id.

## Tabla: production_farms

- id BIGINT PK AI
- user_id BIGINT NOT NULL FK -> users(id)
- name VARCHAR(120) NOT NULL
- created_at DATETIME
- updated_at DATETIME
  Índices:
- idx_prod_farms_user (user_id)
- uq_prod_farms_user_name (user_id, name) opcional

## Tabla: production_flocks

- id BIGINT PK AI
- user_id BIGINT NOT NULL FK -> users(id)
- farm_id BIGINT NOT NULL FK -> production_farms(id)
- name VARCHAR(120) NOT NULL // Flock name
- flock_number VARCHAR(50) NULL // si UI lo separa; si no, usar solo name
- hatch_date DATE NOT NULL
- hens_housed INT NOT NULL DEFAULT 0
- production_period INT NOT NULL DEFAULT 72 // semanas (cullingAge)
- product_id CHAR(36) NOT NULL // id del product seleccionado (UUID string)
- created_at DATETIME
- updated_at DATETIME
  Índices:
- idx_prod_flocks_user (user_id)
- idx_prod_flocks_farm (farm_id)
- idx_prod_flocks_user_farm (user_id, farm_id)
- idx_prod_flocks_product (product_id)

Restricciones:

- farm_id debe pertenecer al mismo user_id (validar en backend).
- Opcional unique: (user_id, name) o (user_id, farm_id, name).

# ENDPOINTS (PRODUCCIÓN PARA FARMS + FLOCKS)

## Farms

GET /api/production/farms

- Devuelve farms del usuario.

POST /api/production/farms
Body: { name }

- Crea farm para req.user.id.

PUT /api/production/farms/:id
Body: { name }

- Solo owner.

DELETE /api/production/farms/:id

- Solo owner.
- Validar dependencias: si hay flocks asociados, devolver 409 con mensaje claro.

## Flocks

GET /api/production/flocks

- Devuelve flocks del usuario, incluir farm.
- Permitir filtro opcional ?farmId=.

GET /api/production/flocks/:id

- Devuelve un flock con farm.

POST /api/production/flocks
Body:
{
farmId,
name,
flockNumber?, // opcional
hatchDate, // ISO "YYYY-MM-DD"
hensHoused,
productionPeriod, // default 72
productId
}
Validaciones:

- farmId existe y pertenece al user
- productId existe en products.json (beta)
- hensHoused >= 0
- productionPeriod 1..100 (ejemplo) (mínimo 1)
  Guardar en DB.

PUT /api/production/flocks/:id
Body: mismo shape (parcial permitido)

- Validar owner.
- Si cambia farmId, validar pertenece al user.
- Si cambia productId, validar existe en products.json.

DELETE /api/production/flocks/:id

- Solo owner.

# ENDPOINTS (BETA PARA PRODUCTS + STANDARDS)

Estos endpoints no usan DB (leen mocks):

GET /api/production/products

- devuelve products.json
- filtros opcionales: ?group=CM|PS etc, ?client=... si existe campo

GET /api/production/products/:productId

- devuelve product

GET /api/production/products/:productId/standards

- devuelve standards[] week 0..72 desde standards_by_product.json

# ENDPOINT PRINCIPAL: EXECUTE / PRODUCTION PLAN

Cuando el user hace "Execute" en UI (tras seleccionar un flock), debe generar una tabla de plan:

GET /api/production/planning/execute?flockId=ID
Respuesta:
{
flock: { ... },
product: { id, name, ... },
rows: [
{ period: "YYYY.WW", weekIndex: number, hensHoused: number, eggs: number }
]
}

Lógica:

- Cargar flock de DB por flockId y req.user.id (ownership).
- Cargar product y standards (mock) por flock.product_id.
- Determinar weekStart basado en hatch_date:
  - period = ISO week-year + "." + ISO week number (2 dígitos)
  - Cada row representa una semana consecutiva desde hatch_date (week 0) hacia adelante.
- Cantidad de rows = production_period (por defecto 72) + 1 si se incluye week 0 (definir; usar 72 si UI muestra 72 semanas).
- eggs:
  - eggs = standards[weekIndex].eggs
  - si no existe standard para esa week, eggs=0
  - si el product es el caso A, eggs=0 en todas
- hensHoused:
  - en beta mantener constante flock.hens_housed (no aplicar mortality hasta confirmar)
  - luego en producción puede aplicarse initialMortality si cliente lo pide.

IMPORTANTE:

- No persistir rows en DB todavía (a menos que el cliente lo pida). Por ahora calcular al vuelo.
- Mantener este contrato para luego reemplazar standards JSON por DB real.

# VALIDACIONES Y ERRORES

- 401 si no auth
- 404 si farm/flock no existe o no pertenece al user
- 400 si productId inválido
- 409 si delete farm con flocks

# STACK / IMPLEMENTACIÓN

Node.js + Express + MySQL (mysql2/promise).
Estructura:

- /src/routes
- /src/controllers
- /src/services
- /src/db (pool)
- /src/mocks (products.json, standards_by_product.json)
- Middleware auth JWT

Entregar:

1. SQL schema migrations (CREATE TABLE).
2. Implementación endpoints.
3. Funciones helper:
   - loadProducts()
   - loadStandards(productId)
   - isoWeekPeriod(date, offsetWeeks) => "YYYY.WW"
4. Ejemplos de requests (curl o Postman JSON).

NO escribir frontend. Solo API + DB + mocks.
NO hardcodear userId ni flockId.
Todo debe funcionar con req.user.id real.
