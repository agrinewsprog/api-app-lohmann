You are a senior backend engineer. We already have a working Express + TypeScript backend with:

- JWT authentication (access + refresh tokens) ALREADY IMPLEMENTED
- Roles: admin / user ALREADY IMPLEMENTED
- authenticateJWT and authorizeRoles middlewares ALREADY EXIST
- MySQL database (phpMyAdmin) using mysql2 pool
- Module-based repository structure
- Centralized error handling and validation

Your task is to implement the STANDARDS feature ONLY.
Do NOT implement auth again.
Do NOT modify existing auth logic.

GOAL
Implement a Standards module that:

1. Stores a normalized product catalog (Breed + Color)
2. Stores Growth standards (Body Weight) per product, week, and sex
3. Imports data from a provided CSV file into MySQL safely and idempotently
4. Exposes read-only endpoints for frontend/mobile consumption

CONSTRAINTS

- MySQL via phpMyAdmin
- No ORM (no Sequelize, Prisma, etc.)
- Use mysql2 pool + prepared statements
- Follow existing code style and module conventions
- Idempotent imports (safe to re-run)

CSV FILE
File name:
PS Standards 2025-FINAL-05.08.csv

CSV characteristics:

- Delimiter: semicolon (;)
- Contains many extra "Unnamed: X" columns
- Header "Age in \nWeeks" contains a newline
- Contains embedded mini-tables and percentage rows we must IGNORE

ONLY USE THESE COLUMNS:

- Breed
- Color
- Age in \nWeeks
- Min BW Female
- Avg BW Female
- Max BW Female
- Min BW Male
- Avg BW Male
- Max BW Male

DATA CLEANING RULES

- Import only rows where:
  - Breed is non-empty string
  - Color is non-empty string
  - Age in Weeks is a valid integer
  - All BW fields are numeric
- Ignore all other rows and columns
- Ignore embedded tables and text rows
- Normalize header names in code

DATABASE MIGRATIONS (plain SQL files in /database/migrations)

1. standards_products

- id INT AUTO_INCREMENT PK
- breed VARCHAR(150) NOT NULL
- color VARCHAR(80) NOT NULL
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
- UNIQUE KEY uniq_breed_color (breed, color)

2. standards_growth

- id INT AUTO_INCREMENT PK
- product_id INT NOT NULL
- week INT NOT NULL
- sex ENUM('female','male') NOT NULL
- min_value DECIMAL(10,2) NOT NULL
- avg_value DECIMAL(10,2) NOT NULL
- max_value DECIMAL(10,2) NOT NULL
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
- UNIQUE KEY uniq_growth (product_id, week, sex)
- FOREIGN KEY (product_id) REFERENCES standards_products(id) ON DELETE CASCADE
- INDEX(product_id), INDEX(week), INDEX(sex)

STANDARDS MODULE STRUCTURE
Implement inside:
src/modules/standards/
standards.routes.ts
standards.controller.ts
standards.service.ts
standards.repository.ts
standards.validators.ts
standards.types.ts
standards.importer.ts

IMPORT IMPLEMENTATION (REQUIRED)
Implement a CSV importer that:

- Uses fs + streaming CSV parser (csv-parse or fast-csv)
- Supports delimiter ';'
- Cleans and validates rows according to rules
- Upserts products into standards_products
- Upserts growth rows into standards_growth
- Inserts two records per row (female + male)
- Uses INSERT ... ON DUPLICATE KEY UPDATE
- Uses batched transactions for performance
- Returns summary:
  - productsInserted
  - growthRowsInserted
  - rowsSkipped

IMPORT ENTRYPOINT
Implement ONE of the following (preferred: API endpoint):

Option A — API (preferred)
POST /api/standards/import/growth

- Protected with existing authenticateJWT + authorizeRoles('admin')
- CSV path read from env variable: STANDARDS_CSV_PATH
- No file upload needed
- Returns import summary JSON

Option B — CLI
npm run import:standards:growth

- Reads STANDARDS_CSV_PATH
- Outputs summary to console

PUBLIC READ ENDPOINTS

1. GET /api/standards/products
   Returns:
   [
   { id, breed, color }
   ]

2. GET /api/standards/growth
   Query params:

- productId (required)
- week (optional)
- sex (optional: female | male)

Behavior:

- productId only → full curve (female + male, ordered by week)
- productId + sex → curve for that sex
- productId + week + sex → single record

RESPONSE FORMAT (single)
{
"productId": 1,
"week": 5,
"sex": "female",
"min": 331,
"avg": 349,
"max": 366
}

RESPONSE FORMAT (curve)
{
"productId": 1,
"breed": "LB Classic",
"color": "Brown",
"female": [{ week, min, avg, max }],
"male": [{ week, min, avg, max }]
}

VALIDATION

- Validate query params
- Return 400 with clear errors if invalid

README UPDATE
Update README with:

- How to run migrations in phpMyAdmin
- How to import standards
- Example curl calls for standards endpoints

OUTPUT
Generate all code files and SQL migrations required.
Do NOT modify existing auth code.
Ensure everything compiles and runs.
