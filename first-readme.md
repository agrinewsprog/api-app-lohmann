You are a senior backend engineer. Build a production-ready Node.js backend using Express + TypeScript with a modular (feature/module) repository structure. Use MySQL (managed via phpMyAdmin) and do NOT use Sequelize or any ORM. Use only mysql2 and write SQL manually.

PROJECT GOAL
Step 1: Authentication service with JWT + roles + refresh tokens (DB table).
Step 2: Standards feature (scaffold only, empty for now).

TECH STACK / REQUIREMENTS
- Node.js + Express + TypeScript
- MySQL (phpMyAdmin)
- No ORM (no Sequelize/Prisma)
- mysql2 with connection pool
- bcrypt for password hashing
- jsonwebtoken for access tokens
- Refresh tokens stored in DB (table refresh_tokens)
- Use token rotation: on refresh, invalidate old refresh token and issue a new one
- Store refresh tokens securely: store HASHED refresh tokens in DB (recommended)
- Validation: use express-validator (consistent)
- Security: helmet, cors, rate limiter
- Centralized error handling middleware
- Env validation at startup (fail fast)

ENV (.env)
- PORT
- DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
- JWT_ACCESS_SECRET, JWT_ACCESS_EXPIRES_IN (e.g. "15m")
- JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN (e.g. "30d")
- CORS_ORIGIN

DATABASE MIGRATIONS (plain SQL files in /database/migrations)
1) users table:
   - id INT AUTO_INCREMENT PK
   - fullname VARCHAR(150) NOT NULL
   - email VARCHAR(190) NOT NULL UNIQUE
   - password_hash VARCHAR(255) NOT NULL
   - role ENUM('admin','user') NOT NULL DEFAULT 'user'
   - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   - updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

2) refresh_tokens table:
   - id INT AUTO_INCREMENT PK
   - user_id INT NOT NULL (FK -> users.id ON DELETE CASCADE)
   - token_hash VARCHAR(255) NOT NULL
   - revoked_at DATETIME NULL
   - expires_at DATETIME NOT NULL
   - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   - INDEX(user_id), INDEX(expires_at)

AUTH ENDPOINTS
1) POST /api/auth/register
   body: fullname, email, password
   - Public register must always create role='user'
   - Hash password
   - Create user
   - Issue access token + refresh token
   - Store hashed refresh token in DB with expires_at
   - Return: user (no password) + accessToken + refreshToken

2) POST /api/auth/login
   body: email, password
   - Validate password with bcrypt
   - Issue access token + refresh token
   - Store hashed refresh token in DB (new session)
   - Return: user + accessToken + refreshToken

3) POST /api/auth/refresh
   body: refreshToken
   - Verify refresh JWT signature + expiry
   - Hash incoming refreshToken and find matching record token_hash where revoked_at IS NULL and expires_at > now
   - Token rotation:
     - Revoke old token (set revoked_at=now)
     - Issue new access token + new refresh token
     - Store new hashed refresh token
   - Return: accessToken + refreshToken

4) POST /api/auth/logout
   body: refreshToken
   - Verify refresh token (best-effort)
   - Hash and revoke token in DB (set revoked_at=now)
   - Return success

5) GET /api/auth/me
   headers: Authorization: Bearer <accessToken>
   - Requires JWT middleware
   - Return current user

MIDDLEWARES
- authenticateJWT: verifies access token and attaches req.user { id, role }
- authorizeRoles(...roles): blocks if role not allowed
- validate: wraps express-validator results
- errorHandler: centralized error formatting

SECURITY / BEST PRACTICES
- Never return password_hash
- Strong typing, no "any"
- Consistent response format (success/error)
- Use MySQL pool + prepared statements
- Add basic logging

PROJECT STRUCTURE (MODULE ORGANIZATION)
src/
  app.ts
  server.ts
  config/
    env.ts
  db/
    pool.ts
    query.ts
  middlewares/
    auth.ts
    errorHandler.ts
    validate.ts
  utils/
    crypto.ts (hash refresh token)
    logger.ts
  modules/
    auth/
      auth.routes.ts
      auth.controller.ts
      auth.service.ts
      auth.repository.ts
      auth.validators.ts
      auth.types.ts
    standards/ (scaffold only with TODOs)
      standards.routes.ts
      standards.controller.ts
      standards.service.ts
      standards.repository.ts
      standards.validators.ts
      standards.types.ts
database/
  migrations/
README.md

OUTPUT
Generate the full code for the repository (all files), plus SQL migration files. Ensure it compiles and boots.
Include npm scripts: dev (ts-node-dev), build, start.
Explain in README how to run migrations with phpMyAdmin and test auth endpoints.
