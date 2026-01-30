You are a senior backend engineer. We have an Express + TypeScript backend with:
- JWT auth already implemented (access + refresh)
- Middlewares already exist: authenticateJWT and authorizeRoles
- MySQL with mysql2 pool (no ORM)
- Module-based repo structure (domain modules)
- Central error handler and validation pattern already used in the project

TASK
Implement Flocks (farms/lots) inside TWO existing domain modules:
1) Weight module
2) Production module

Each module has its own flock table and its own endpoints.
All flock operations are for authenticated users only.
Each user can CRUD only their own flocks, enforced via req.user.id from JWT.
Never trust user_id sent from the client.

DATABASE MIGRATIONS (plain SQL files in /database/migrations)
Create two tables:

1) weight_flocks
- id INT AUTO_INCREMENT PK
- user_id INT NOT NULL (FK -> users.id ON DELETE CASCADE)
- name VARCHAR(120) NOT NULL
- location VARCHAR(160) NULL
- notes TEXT NULL
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
Indexes:
- INDEX(user_id)
- UNIQUE KEY uniq_user_weight_flock_name (user_id, name)

2) production_flocks
- id INT AUTO_INCREMENT PK
- user_id INT NOT NULL (FK -> users.id ON DELETE CASCADE)
- name VARCHAR(120) NOT NULL
- location VARCHAR(160) NULL
- notes TEXT NULL
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
Indexes:
- INDEX(user_id)
- UNIQUE KEY uniq_user_production_flock_name (user_id, name)

PROJECT STRUCTURE (IMPORTANT)
Put flocks INSIDE each module, not as standalone modules. Use one of these structures:

Option A (preferred):
src/modules/
  weight/
    flocks/
      weightFlocks.routes.ts
      weightFlocks.controller.ts
      weightFlocks.service.ts
      weightFlocks.repository.ts
      weightFlocks.validators.ts
      weightFlocks.types.ts
  production/
    flocks/
      productionFlocks.routes.ts
      productionFlocks.controller.ts
      productionFlocks.service.ts
      productionFlocks.repository.ts
      productionFlocks.validators.ts
      productionFlocks.types.ts

Or follow the existing conventions in the repo, but KEEP the nesting inside weight and production modules.

API ENDPOINTS
All endpoints require authenticateJWT.

WEIGHT FLOCKS
- GET    /api/weight/flocks
- POST   /api/weight/flocks
- GET    /api/weight/flocks/:id
- PUT    /api/weight/flocks/:id
- DELETE /api/weight/flocks/:id

PRODUCTION FLOCKS
- GET    /api/production/flocks
- POST   /api/production/flocks
- GET    /api/production/flocks/:id
- PUT    /api/production/flocks/:id
- DELETE /api/production/flocks/:id

SECURITY RULES (CRITICAL)
- LIST: always filter by user_id = req.user.id
- READ/UPDATE/DELETE:
  - query by id AND user_id = req.user.id
  - if not found => 404 (do not leak if another user owns it)
- CREATE:
  - ignore any user_id in body, always set user_id = req.user.id
- UNIQUE constraint: (user_id, name)
  - return 409 or 400 with a clear message if duplicated

VALIDATION
Use the project’s validation approach:
- name: required, length 2..120
- location: optional, max 160
- notes: optional
- :id param must be positive integer

RESPONSE SHAPE
Return consistent JSON:
- List: { items: [...] }
- Single: { item: ... }
- Create: 201 { item: createdItem }
- Delete: 200 { success: true }

OUTPUT
- SQL migration files for both tables
- Full code for both CRUDs following repo conventions
- Ensure routes are registered in the app router
- Do NOT modify existing auth; just use authenticateJWT
