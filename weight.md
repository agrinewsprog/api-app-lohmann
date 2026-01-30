You are a senior backend engineer. We already have an Express + TypeScript API with:

- JWT auth already implemented (access + refresh)
- authenticateJWT middleware exists and attaches req.user (id, email, role)
- module-based structure by domain (weight, production, standards, etc.)
- centralized error handling + validation pattern
- API runs on PORT 8089

TASK
Implement a BETA DATA PROVIDER inside the WEIGHT module to serve:

- the list of available products for Weight
- weekly standards data per product (used by Weight & Uniformity UI)

Do NOT create DB tables for this yet.
Do NOT normalize into MySQL yet.
This beta provider must be user-scoped (based on JWT user), similar to the original service endpoint that receives userName.

INPUT DATA STRUCTURE
The fixture file contains an array of objects like:
{
"product": {
"id": "string",
"name": "string",
"productgroup": "PS|CM|...",
"color": "string",
"kindofattitude": "string",
"producttype": "string"
},
"standards": [
{
"week": number,
"bodyWeightMin": number,
"bodyWeightMax": number,
"bodyWeightAverage": number,
"hours": number,
"eggs": number,
... many other fields ...
}
]
}

The dataset is huge (tens of thousands of lines). Performance matters.

ENV
Add a required env var:
BETA_WEIGHT_PRODUCTS_JSON_PATH=./weight.json

FEATURE REQUIREMENTS

1. Security

- All beta endpoints must require authenticateJWT
- For beta, return the same dataset for any authenticated user
- Keep architecture flexible to later map by req.user.email or req.user.id

2. Efficient loading + caching

- Load JSON fixture only once at startup (or first request) and cache in memory
- Build indexes:
  - Map productId -> { product, standards }
  - Optional: Map productId -> Map week -> standardRow for fast week lookup
- Never read the file per request

3. Endpoints (WEIGHT module paths)
   Implement these endpoints under /api/weight:

A) GET /api/weight/products

- Returns only product summaries (NO standards array)
  Response:
  { "items": [ {id, name, productgroup, color, kindofattitude, producttype} ] }

B) GET /api/weight/products/:productId

- Returns full object including standards array (used if needed)
  Response:
  { "product": {...}, "standards": [...] }

C) GET /api/weight/products/:productId/standards

- Query param: week (required integer)
- Returns only the single standard row for that week
  Response:
  { "item": { ...standardRow... } }

4. Validation

- Validate :productId is non-empty string
- Validate week exists and is integer >= 0
- Return 400 with clear message for invalid inputs
- Return 404 if productId not found or week not found

5. Module structure (IMPORTANT: keep inside weight)
   Create a nested folder under weight:
   src/modules/weight/
   products/
   weightProducts.routes.ts
   weightProducts.controller.ts
   weightProducts.service.ts
   weightProducts.provider.ts (or repository/loader)
   weightProducts.validators.ts
   weightProducts.types.ts
   weightProducts.fixtureLoader.ts

The loader/provider must:

- read BETA_WEIGHT_PRODUCTS_JSON_PATH
- parse JSON
- build indexes
- expose methods:
  - getProductSummaries()
  - getProductById(productId)
  - getStandardByWeek(productId, week)

6. Keep API contract stable
   We will replace this beta provider later with real DB without breaking endpoints.
   So keep response shapes stable and independent of internal implementation.

7. README update
   Update README with:

- purpose of the weight beta provider
- env var BETA_WEIGHT_PRODUCTS_JSON_PATH
- endpoints + curl examples (with Authorization Bearer)
- performance notes (cached loading)
- API port 8089

IMPORTANT

- Do NOT modify existing auth implementation, just use authenticateJWT
- Do NOT implement weight calculations yet
- Ensure routes are registered in the main router:
  - /api/weight/products...
- Use strong TypeScript types

OUTPUT
Provide all new files + modifications required to wire routes and env validation.
