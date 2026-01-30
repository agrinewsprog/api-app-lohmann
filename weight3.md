We have an Express + TS API on port 8089 with JWT auth already done.
We already have a uniformity JSON fixture provider that can return uniformity data.

We want to replicate the original Lohmann webapp flow where the page receives a uniformityUuid and does NOT send flockId.
We need a minimal change:

1. Add endpoint to get the "last/default" uniformityUuid for the logged user:
   GET /api/weight/uniformity/last
   Optional query param:

- productId (optional). If provided, return last/default uniformityUuid for that product; if not, return last/default overall.
  Response:
  { "success": true, "uniformityUuid": "..." }

Rule to choose:

- Prefer an entry whose uniformity.userId matches req.user.id
- If productId provided, filter by uniformity.productId
- Prefer entries with missing/0/null flockId as "default"
- If multiple candidates, pick the first deterministically (fixture has no timestamps)

2. Add endpoint to fetch a week by uniformityUuid:
   GET /api/weight/uniformity/:uniformityUuid/week?week=XX
   Response:
   { "success": true, "uniformity": {...}, "item": {...weekSetup...} }

3. Security:

- Both endpoints require authenticateJWT
- Ensure req.user.id matches uniformity.userId for uuid-based access (otherwise 404)

4. Do not remove or break existing endpoints.

Update README with curl examples.
No DB changes.
