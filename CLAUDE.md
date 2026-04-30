# Lohmann API — CLAUDE.md

Express + TypeScript + MySQL backend. No ORM — raw SQL via `mysql2/promise`.

---

## Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js + TypeScript
- **Database**: MySQL 8 — raw SQL, no ORM (`src/db/query.ts` wrappers)
- **Auth**: JWT access tokens (15m) + refresh tokens (30d, stored hashed SHA-256)
- **Validation**: `express-validator`
- **Security**: `helmet`, `cors`, `express-rate-limit`

---

## Module Architecture

Feature-based. Each module has controller → service → repository layers:

```
src/modules/<domain>/
  <name>.controller.ts   # HTTP layer — extracts req params, calls service
  <name>.service.ts      # Business logic — orchestrates repository calls
  <name>.repository.ts   # SQL queries only — returns raw DB rows
  <name>.types.ts        # Interfaces: DB row types, DTOs, response types, sanitize fn
  <name>.routes.ts       # Express router — mounts middleware + controller methods
  <name>.validator.ts    # express-validator chains
```

**Sanitize functions** in `.types.ts` map snake_case DB columns → camelCase API responses. Always use them — never return raw DB rows.

---

## Route Namespaces

| Prefix | Who | Notes |
|--------|-----|-------|
| `/api/auth/` | Public | Login, register, refresh, logout |
| `/api/standards/` | Public | Read-only product/growth data |
| `/api/weight/` | Authenticated user | User-scoped weight data |
| `/api/production/` | Authenticated user | User-scoped production data |
| `/api/admin/` | Admin only | All users + all data, no ownership filter |

**Critical distinction**: admin routes return data for ALL users; user routes filter by `req.user!.id`.

---

## Production Module

### Flock fields

| Column | Type | Meaning |
|--------|------|---------|
| `initial_mortality_pct` | DECIMAL(5,2) NULL | Flat % mortality applied once to hens housed |
| `eggs_pct` | DECIMAL(5,2) NULL | Egg production as % of breed standard (100 = standard) |
| `hatching_eggs_pct` | DECIMAL(5,2) NULL | % of total eggs set for hatching |
| `chicks_pct` | DECIMAL(5,2) NULL | % of hatching eggs → saleable chicks |

`NULL` = use breed standard per-week curve. Send `null` explicitly to reset.

MySQL DECIMAL columns return as **strings** (`"5.00"`) at runtime despite TypeScript typing as `number`. Sanitize functions must `Number()` coerce them.

### Advanced settings calculation chain

```
hensAlive    = hensHoused × (1 - initialMortalityPct / 100)
eggs         = hensAlive × (hdPct / 100) × 7 × (eggsPct / 100)
hatchingEggs = eggs × (hatchingEggsPct / 100)   [or per-week he_week curve]
chicks       = hatchingEggs × (chicksPct / 100)  [or per-week saleable_chicks_week curve]
```

### Response shape

All flock responses include `advancedSettings` nested object:

```json
{
  "id": 9,
  "name": "Flock A",
  "advancedSettings": {
    "initialMortalityPct": 5,
    "eggsPct": 97,
    "hatchingEggsPct": 75,
    "chicksPct": 80
  }
}
```

### Admin vs user repository

Both repositories fully support the 4 advanced columns in SELECT, INSERT, UPDATE.
- `adminProductionFlocks.repository.ts` — no ownership filter; used by admin panel
- `productionFlocks.repository.ts` — filters by `userId`; used by mobile/user endpoints

---

## Database Migrations

Run in order: `database/migrations/001_*.sql` through `012_*.sql`.

| # | Migration |
|---|-----------|
| 001 | `users` |
| 002 | `refresh_tokens` |
| 003 | `standards_products` |
| 004 | `standards_growth` |
| 005 | `weight_flocks` |
| 006 | `production_flocks` (base) |
| 007 | `production_farms` |
| 008 | ALTER `production_flocks` — add farm_id, flock_number, hatch_date, hens_housed, production_period, product_id |
| 009 | ALTER `standards_growth` — add production metric columns (hd_pct_production, he_week, saleable_chicks_week, …) |
| 010 | ALTER `weight_flocks` — add product_id, hatch_date |
| 011 | `weight_measurements` |
| 012 | ALTER `production_flocks` — add initial_mortality_pct, eggs_pct, hatching_eggs_pct, chicks_pct |

---

## Key Patterns

### Query helpers (`src/db/query.ts`)
- `query<T>(sql, params)` → `[rows, fields]`
- `queryOne<T>(sql, params)` → `row | null`

### Error handling
Throw `new AppError(statusCode, message)` from service/repository. Centralized middleware in `src/middlewares/errorHandler.ts` catches it.

### Auth middleware
- `authenticate` — verifies JWT, attaches `req.user = { id, role }`
- `requireAdmin` — checks `req.user.role === 'admin'`

### Validation
Add `express-validator` chains in `.validator.ts`, mount with `validate` middleware before controller. Validation errors return `{ success: false, error: { message: "Validation failed", details: [...] } }`.

---

## Response Conventions

```json
// List (paginated)
{ "success": true, "items": [...], "meta": { "page": 1, "pageSize": 20, "total": 150 } }

// Single item
{ "success": true, "item": { ... } }

// Delete / action
{ "success": true }

// Error
{ "success": false, "error": { "message": "..." } }
```

---

## Environment Variables

```env
PORT=8089
DB_HOST / DB_USER / DB_PASSWORD / DB_NAME / DB_PORT
JWT_ACCESS_SECRET / JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET / JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN
STANDARDS_CSV_PATH
BETA_WEIGHT_PRODUCTS_JSON_PATH
BETA_WEIGHT_UNIFORMITY_JSON_PATH
```

JWT secrets must be ≥ 32 characters.
