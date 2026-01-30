You are a senior backend engineer. We already have an Express + TypeScript API with:

- JWT auth with access + refresh tokens
- roles: admin / user
- MySQL (mysql2 pool, no ORM)
- module-based structure
- standards module (products + growth import and read endpoints)
- weight module and production module with flocks CRUD (per-user ownership with req.user.id)

Now we need to adapt the API for an ADMIN web panel.

REQUIREMENTS

1. API port must be 8089 by default.

- Update config so PORT defaults to 8089 if not present.
- Document this in README.

2. Admin has full access to CRUD of everything:

- Standards:
  - keep public read endpoints as they are
  - admin-only import endpoints (already exist) remain admin-only
- Users (NEW):
  - Admin can list users, get user by id, create user (set role), update user (fullname, email, role), delete user
  - Password handling:
    - For create user: accept password or auto-generate and return it once (document behavior)
    - For update user: optional password reset endpoint
- Weight flocks:
  - Existing endpoints are user-scoped. Add ADMIN endpoints to manage any user’s weight flocks:
    - GET /api/admin/weight/flocks (supports filters: userId, search by name)
    - GET /api/admin/weight/flocks/:id
    - POST /api/admin/weight/flocks (must include userId)
    - PUT /api/admin/weight/flocks/:id
    - DELETE /api/admin/weight/flocks/:id
- Production flocks:
  - Same admin endpoints:
    - GET /api/admin/production/flocks
    - GET /api/admin/production/flocks/:id
    - POST /api/admin/production/flocks (must include userId)
    - PUT /api/admin/production/flocks/:id
    - DELETE /api/admin/production/flocks/:id

3. Security & RBAC

- Use existing authenticateJWT middleware
- For admin endpoints enforce authorizeRoles('admin')
- User endpoints (non-admin) remain unchanged and only access own data
- For admin endpoints, do not apply user_id filtering; admin can access all rows

4. Consistent responses and validation

- Use existing validation pattern (express-validator or the project’s validator)
- Return 400 for invalid input, 404 for not found, 409 for duplicates when needed
- Keep response shape consistent:
  - list: { items, meta? }
  - single: { item }
  - delete: { success: true }

5. Add pagination to admin list endpoints

- For /api/admin/weight/flocks and /api/admin/production/flocks and /api/admin/users:
  - query params: page (default 1), pageSize (default 20, max 100)
  - return meta: { page, pageSize, total }

6. README documentation (REQUIRED)
   Update README with:

- How to run the API on port 8089
- .env example (include PORT=8089 and DB vars, JWT vars)
- Auth flow summary (login -> access token -> refresh)
- Admin endpoints list and how to call them with curl
- Standards import instructions
- Database migrations instructions for phpMyAdmin
- Example Postman/curl requests for:
  - login
  - refresh
  - admin list users
  - admin CRUD flocks

OUTPUT

- Implement all admin endpoints under /api/admin/\*
- Implement the Users admin module (if not existing)
- Ensure code compiles and all routes are wired
- Do NOT break existing user-scoped endpoints
- Update README with the full documentation
