You are a senior backend engineer. We have an Express + TypeScript API with JWT auth already implemented.
We already have:

- Weight flocks CRUD (user-owned): /api/weight/flocks...
- Weight Products beta provider (cached JSON fixture): /api/weight/products and /api/weight/products/:id/standards?week=XX
  API runs on PORT 8089.

TASK
Implement a NEW beta provider for WEIGHT UNIFORMITY using a JSON fixture file (NOT in-memory generated data).
The goal is to replicate the existing Lohmann webapp flow:

- A uniformity "session" is associated with userId + flockId + productId and has a uuid
- It contains uniformitySetup[] with per-week data: minWeight, maxWeight, interval, weights (JSON string), totalChicken
- The frontend changes week and fetches the setup for that week

IMPORTANT

- Do NOT create DB tables yet
- Do NOT implement persistence/saving yet (read-only provider)
- Use cached loading like the products provider (load once, build indexes)

FIXTURE
Add env var:
BETA_WEIGHT_UNIFORMITY_JSON_PATH=./wiegth2.json

Fixture file contains entries like:
{
"uniformity": {
"productId": "...",
"measureUnit": "g",
"userId": "...",
"flockId": 684,
"uuid": "PPOqoU99-..."
},
"uniformitySetup": [
{
"week": 0,
"minWeight": 0,
"interval": 1,
"maxWeight": 0,
"uniformityUuid": "PPOqoU99-...",
"weights": "{}",
"totalChicken": 0
},
...
]
}

We may have MANY uniformity objects in the file for different users/flocks/products.

SECURITY

- All endpoints require authenticateJWT
- The API must only return the uniformity data that belongs to the authenticated user:
  - req.user.id must match uniformity.userId OR
  - if your JWT uses email, map appropriately, but default to userId matching
- If not found or not owned by user -> 404 (do not leak)

CACHING & INDEXING
On startup (or first request), load BETA_WEIGHT_UNIFORMITY_JSON_PATH and build indexes:

- Map keyByTriplet: `${userId}:${flockId}:${productId}` -> uniformityEntry
- Map keyByUuid: uuid -> uniformityEntry
- For fast week access:
  - build inside each entry a Map week->weekSetup (optional)

ENDPOINTS (READ ONLY)
A) GET /api/weight/uniformity
Query params:

- flockId (required int)
- productId (required string)

Behavior:

- Find entry by `${req.user.id}:${flockId}:${productId}`
- Return:
  {
  "success": true,
  "uniformity": {...},
  "uniformitySetup": [...]
  }
  If not found -> 404

B) GET /api/weight/uniformity/week
Query params:

- flockId (required int)
- productId (required string)
- week (required int)

Behavior:

- Find entry by triplet key
- Find week setup
- Return:
  {
  "success": true,
  "uniformity": {...},
  "item": { ...weekSetup... }
  }
  If week not found -> 404

C) GET /api/weight/uniformity/:uuid
Return full entry by uuid (only if owned by user)

VALIDATION

- flockId: positive integer
- productId: non-empty string
- week: integer >=0
  Return 400 for invalid inputs.

MODULE STRUCTURE (keep inside weight)
src/modules/weight/uniformity/
weightUniformity.routes.ts
weightUniformity.controller.ts
weightUniformity.service.ts
weightUniformity.provider.ts (fixture loader + indexes)
weightUniformity.validators.ts
weightUniformity.types.ts
weightUniformity.fixtureLoader.ts

README
Update README with:

- env var BETA_WEIGHT_UNIFORMITY_JSON_PATH
- endpoints + curl examples
- explain this is beta fixture read-only
- note ownership enforcement based on req.user.id

OUTPUT
Provide all code files and wire routes under:

- /api/weight/uniformity
- /api/weight/uniformity/week
- /api/weight/uniformity/:uuid
  No DB changes.
