# Lohmann App API

Production-ready Node.js backend built with Express, TypeScript, and MySQL featuring JWT authentication with refresh token rotation and comprehensive admin panel endpoints.

## Features

- **Express + TypeScript**: Fully typed REST API
- **MySQL Database**: Raw SQL queries with mysql2 (no ORM)
- **JWT Authentication**: Access tokens + refresh tokens with rotation
- **Secure Token Storage**: Refresh tokens hashed in database
- **Role-Based Access Control**: Admin and user roles
- **Admin Panel API**: Full CRUD for users, weight flocks, and production flocks
- **Pagination**: Admin endpoints support pagination with meta information
- **Input Validation**: express-validator for consistent validation
- **Security**: Helmet, CORS, rate limiting
- **Modular Architecture**: Feature-based folder structure
- **Error Handling**: Centralized error middleware
- **Environment Validation**: Fail-fast configuration checking

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MySQL (mysql2)
- bcrypt (password hashing)
- jsonwebtoken (JWT tokens)
- express-validator (input validation)
- helmet (security headers)
- cors (cross-origin resource sharing)
- express-rate-limit (rate limiting)

## Project Structure

```
api/
├── database/
│   └── migrations/
│       ├── 001_create_users_table.sql
│       ├── 002_create_refresh_tokens_table.sql
│       ├── 003_create_standards_products_table.sql
│       ├── 004_create_standards_growth_table.sql
│       ├── 005_create_weight_flocks_table.sql
│       └── 006_create_production_flocks_table.sql
├── src/
│   ├── config/
│   │   └── env.ts
│   ├── db/
│   │   ├── pool.ts
│   │   └── query.ts
│   ├── middlewares/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── validate.ts
│   ├── utils/
│   │   ├── crypto.ts
│   │   └── logger.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── standards/
│   │   ├── weight/
│   │   │   ├── flocks/
│   │   │   ├── products/
│   │   │   └── uniformity/
│   │   ├── production/flocks/
│   │   └── admin/
│   │       ├── users/
│   │       ├── weight/
│   │       └── production/
│   ├── app.ts
│   └── server.ts
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- phpMyAdmin or MySQL client

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration (default: 8089 if not set)
PORT=8089

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=lohmann_app
DB_PORT=3306

# JWT Configuration (use strong secrets in production!)
JWT_ACCESS_SECRET=your_super_secret_access_token_key_change_this_in_production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key_change_this_in_production
JWT_REFRESH_EXPIRES_IN=30d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Standards Import Configuration (optional)
STANDARDS_CSV_PATH=/path/to/PS Standards 2025-FINAL-05.08.csv

# Beta Weight Products Configuration
BETA_WEIGHT_PRODUCTS_JSON_PATH=./weight.json

# Beta Weight Uniformity Configuration
BETA_WEIGHT_UNIFORMITY_JSON_PATH=./wiegth2.json
```

**Important**: JWT secrets must be at least 32 characters long. Generate secure secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Database Setup with phpMyAdmin

#### Step 1: Create Database

1. Open phpMyAdmin in your browser
2. Click "New" in the left sidebar
3. Enter database name: `lohmann_app`
4. Select collation: `utf8mb4_unicode_ci`
5. Click "Create"

Or execute this SQL:

```sql
CREATE DATABASE lohmann_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Step 2: Run Migrations

Select the `lohmann_app` database, then go to the "SQL" tab and execute each migration in order:

**Migration 1: Users Table** (`database/migrations/001_create_users_table.sql`)

```sql
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(150) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Migration 2: Refresh Tokens Table** (`database/migrations/002_create_refresh_tokens_table.sql`)

```sql
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    revoked_at DATETIME NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_token_hash (token_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Migration 3: Standards Products Table** (`database/migrations/003_create_standards_products_table.sql`)

```sql
CREATE TABLE IF NOT EXISTS standards_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    breed VARCHAR(150) NOT NULL,
    color VARCHAR(80) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_breed_color (breed, color),
    INDEX idx_breed (breed),
    INDEX idx_color (color)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Migration 4: Standards Growth Table** (`database/migrations/004_create_standards_growth_table.sql`)

```sql
CREATE TABLE IF NOT EXISTS standards_growth (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    week INT NOT NULL,
    sex ENUM('female', 'male') NOT NULL,
    min_value DECIMAL(10,2) NOT NULL,
    avg_value DECIMAL(10,2) NOT NULL,
    max_value DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_growth (product_id, week, sex),
    FOREIGN KEY (product_id) REFERENCES standards_products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_week (week),
    INDEX idx_sex (sex),
    INDEX idx_product_week (product_id, week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Migration 5: Weight Flocks Table** (`database/migrations/005_create_weight_flocks_table.sql`)

```sql
CREATE TABLE IF NOT EXISTS weight_flocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(120) NOT NULL,
    location VARCHAR(160) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    UNIQUE KEY uniq_user_weight_flock_name (user_id, name),
    CONSTRAINT fk_weight_flocks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Migration 6: Production Flocks Table** (`database/migrations/006_create_production_flocks_table.sql`)

```sql
CREATE TABLE IF NOT EXISTS production_flocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(120) NOT NULL,
    location VARCHAR(160) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    UNIQUE KEY uniq_user_production_flock_name (user_id, name),
    CONSTRAINT fk_production_flocks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4. Start the Server

**Development mode** (with auto-reload):

```bash
npm run dev
```

**Production mode**:

```bash
npm run build
npm start
```

The server will start on `http://localhost:8089` (or your configured PORT).

---

## Authentication Flow

The API uses JWT-based authentication with access and refresh tokens:

```
1. User logs in with email/password
   POST /api/auth/login
   └── Returns: accessToken (15min) + refreshToken (30 days)

2. User makes authenticated requests
   GET /api/some-endpoint
   Authorization: Bearer <accessToken>

3. When accessToken expires, refresh it
   POST /api/auth/refresh
   Body: { "refreshToken": "..." }
   └── Returns: new accessToken + new refreshToken (rotation)

4. User logs out
   POST /api/auth/logout
   Body: { "refreshToken": "..." }
   └── Revokes the refresh token
```

**Key Points:**
- Access tokens are short-lived (15 minutes) for security
- Refresh tokens are long-lived (30 days) for convenience
- Token rotation: each refresh invalidates the old token and issues a new one
- Refresh tokens are stored hashed (SHA-256) in the database

---

## API Endpoints

### Health Check

```
GET /health
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login | No |
| POST | `/api/auth/refresh` | Refresh tokens | No |
| POST | `/api/auth/logout` | Logout (revoke token) | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Standards Endpoints (Public)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/standards/products` | List all products | No |
| GET | `/api/standards/growth` | Get growth data | No |
| POST | `/api/standards/import/growth` | Import growth data | Admin |

### User Endpoints (User-scoped)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/weight/flocks` | List user's weight flocks | Yes |
| GET | `/api/weight/flocks/:id` | Get weight flock | Yes |
| POST | `/api/weight/flocks` | Create weight flock | Yes |
| PUT | `/api/weight/flocks/:id` | Update weight flock | Yes |
| DELETE | `/api/weight/flocks/:id` | Delete weight flock | Yes |
| GET | `/api/weight/products` | List all weight products | Yes |
| GET | `/api/weight/products/:productId` | Get product with standards | Yes |
| GET | `/api/weight/products/:productId/standards` | Get standard by week | Yes |
| GET | `/api/weight/uniformity` | Get uniformity by flock/product | Yes |
| GET | `/api/weight/uniformity/week` | Get uniformity week setup | Yes |
| GET | `/api/weight/uniformity/last` | Get last/default uniformityUuid | Yes |
| GET | `/api/weight/uniformity/:uuid` | Get uniformity by UUID | Yes |
| GET | `/api/weight/uniformity/:uuid/week` | Get week setup by uniformityUuid | Yes |
| GET | `/api/production/flocks` | List user's production flocks | Yes |
| GET | `/api/production/flocks/:id` | Get production flock | Yes |
| POST | `/api/production/flocks` | Create production flock | Yes |
| PUT | `/api/production/flocks/:id` | Update production flock | Yes |
| DELETE | `/api/production/flocks/:id` | Delete production flock | Yes |

### Admin Endpoints

All admin endpoints require `Authorization: Bearer <accessToken>` with an admin role.

#### Admin Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users (paginated) |
| GET | `/api/admin/users/:id` | Get user by ID |
| POST | `/api/admin/users` | Create user |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| POST | `/api/admin/users/:id/reset-password` | Reset user password |

**Query Parameters for List:**
- `page` (default: 1)
- `pageSize` (default: 20, max: 100)
- `search` (search by fullname or email)
- `role` (filter by 'admin' or 'user')

**Create User Notes:**
- If `password` is not provided, a secure password is auto-generated
- Auto-generated passwords are returned once in the response as `generatedPassword`

#### Admin Weight Flocks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/weight/flocks` | List all weight flocks (paginated) |
| GET | `/api/admin/weight/flocks/:id` | Get weight flock by ID |
| POST | `/api/admin/weight/flocks` | Create weight flock (requires userId) |
| PUT | `/api/admin/weight/flocks/:id` | Update weight flock |
| DELETE | `/api/admin/weight/flocks/:id` | Delete weight flock |

**Query Parameters for List:**
- `page` (default: 1)
- `pageSize` (default: 20, max: 100)
- `userId` (filter by user)
- `search` (search by name)

#### Admin Production Flocks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/production/flocks` | List all production flocks (paginated) |
| GET | `/api/admin/production/flocks/:id` | Get production flock by ID |
| POST | `/api/admin/production/flocks` | Create production flock (requires userId) |
| PUT | `/api/admin/production/flocks/:id` | Update production flock |
| DELETE | `/api/admin/production/flocks/:id` | Delete production flock |

**Query Parameters for List:**
- `page` (default: 1)
- `pageSize` (default: 20, max: 100)
- `userId` (filter by user)
- `search` (search by name)

---

## Response Formats

### Success Responses

**List with pagination:**
```json
{
  "success": true,
  "items": [...],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 150
  }
}
```

**Single item:**
```json
{
  "success": true,
  "item": {...}
}
```

**Delete:**
```json
{
  "success": true
}
```

### Error Responses

```json
{
  "success": false,
  "error": {
    "message": "Error message here"
  }
}
```

**Validation errors:**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

---

## Testing with curl

### Authentication

**Login:**
```bash
curl -X POST http://localhost:8089/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePass123"
  }'
```

**Refresh Token:**
```bash
curl -X POST http://localhost:8089/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Admin Users

**List Users:**
```bash
curl -X GET "http://localhost:8089/api/admin/users?page=1&pageSize=20" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

**List Users with Search:**
```bash
curl -X GET "http://localhost:8089/api/admin/users?search=john&role=user" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

**Get User by ID:**
```bash
curl -X GET http://localhost:8089/api/admin/users/1 \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

**Create User (with password):**
```bash
curl -X POST http://localhost:8089/api/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "role": "user"
  }'
```

**Create User (auto-generate password):**
```bash
curl -X POST http://localhost:8089/api/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Jane Doe",
    "email": "jane@example.com",
    "role": "user"
  }'
# Response will include generatedPassword
```

**Update User:**
```bash
curl -X PUT http://localhost:8089/api/admin/users/1 \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "John Updated",
    "role": "admin"
  }'
```

**Reset User Password:**
```bash
# With specific password
curl -X POST http://localhost:8089/api/admin/users/1/reset-password \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "NewSecurePass123"
  }'

# Auto-generate new password
curl -X POST http://localhost:8089/api/admin/users/1/reset-password \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
# Response will include the generated password
```

**Delete User:**
```bash
curl -X DELETE http://localhost:8089/api/admin/users/1 \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

### Admin Weight Flocks

**List All Weight Flocks:**
```bash
curl -X GET "http://localhost:8089/api/admin/weight/flocks?page=1&pageSize=20" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

**List Weight Flocks by User:**
```bash
curl -X GET "http://localhost:8089/api/admin/weight/flocks?userId=1" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

**Search Weight Flocks:**
```bash
curl -X GET "http://localhost:8089/api/admin/weight/flocks?search=flock" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

**Get Weight Flock by ID:**
```bash
curl -X GET http://localhost:8089/api/admin/weight/flocks/1 \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

**Create Weight Flock:**
```bash
curl -X POST http://localhost:8089/api/admin/weight/flocks \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "name": "Flock A",
    "location": "Barn 1",
    "notes": "Started January 2024"
  }'
```

**Update Weight Flock:**
```bash
curl -X PUT http://localhost:8089/api/admin/weight/flocks/1 \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Flock A Updated",
    "location": "Barn 2"
  }'
```

**Delete Weight Flock:**
```bash
curl -X DELETE http://localhost:8089/api/admin/weight/flocks/1 \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

### Admin Production Flocks

**List All Production Flocks:**
```bash
curl -X GET "http://localhost:8089/api/admin/production/flocks?page=1&pageSize=20" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

**Create Production Flock:**
```bash
curl -X POST http://localhost:8089/api/admin/production/flocks \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "name": "Production Flock A",
    "location": "Barn 3",
    "notes": "Started February 2024"
  }'
```

### Standards Import

**Import Growth Standards:**
```bash
curl -X POST http://localhost:8089/api/standards/import/growth \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

Note: Ensure `STANDARDS_CSV_PATH` is configured in your `.env` file.

### Weight Products (Beta Data Provider)

The weight products endpoints serve product and weekly standards data from a JSON fixture file. This is a beta implementation that caches data in memory for high performance.

**List All Products:**
```bash
curl -X GET http://localhost:8089/api/weight/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:
```json
{
  "success": true,
  "items": [
    {
      "id": "31303936-3431-3235-3036-333036323038",
      "name": "Brown Nick Layers",
      "productgroup": "CM",
      "color": "brown",
      "kindofattitude": "both",
      "producttype": ""
    }
  ]
}
```

**Get Product with Standards:**
```bash
curl -X GET http://localhost:8089/api/weight/products/31303936-3431-3235-3036-333036323038 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:
```json
{
  "success": true,
  "product": {
    "id": "31303936-3431-3235-3036-333036323038",
    "name": "Brown Nick Layers",
    "productgroup": "CM",
    "color": "brown",
    "kindofattitude": "both",
    "producttype": ""
  },
  "standards": [
    {
      "week": 0,
      "bodyWeightMin": 0,
      "bodyWeightMax": 0,
      "bodyWeightAverage": 0,
      "hours": 24,
      "eggs": 0
    }
  ]
}
```

**Get Standard by Week:**
```bash
curl -X GET "http://localhost:8089/api/weight/products/31303936-3431-3235-3036-333036323038/standards?week=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:
```json
{
  "success": true,
  "item": {
    "week": 10,
    "bodyWeightMin": 850,
    "bodyWeightMax": 950,
    "bodyWeightAverage": 900,
    "hours": 12,
    "eggs": 0
  }
}
```

**Performance Notes:**
- The JSON fixture is loaded once at startup and cached in memory
- Indexes are built for O(1) product and week lookups
- Large datasets (tens of thousands of rows) are handled efficiently
- No file I/O occurs per request

### Weight Uniformity (Beta Data Provider)

The weight uniformity endpoints serve uniformity session data from a JSON fixture file. This is a **beta read-only implementation** for testing purposes before database persistence is implemented.

**Key Concepts:**
- A uniformity "session" is associated with `userId + flockId + productId` and has a unique `uuid`
- Each session contains `uniformitySetup[]` with per-week data: minWeight, maxWeight, interval, weights (JSON string), totalChicken
- The frontend changes week and fetches the setup for that week

**Security:**
- All endpoints require JWT authentication (`Authorization: Bearer <token>`)
- The API only returns uniformity data that belongs to the authenticated user
- If not found or not owned by user, returns 404 (does not leak existence)

**Get Uniformity by Flock and Product:**
```bash
curl -X GET "http://localhost:8089/api/weight/uniformity?flockId=684&productId=31303936-3431-3235-3036-333036323038" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:
```json
{
  "success": true,
  "uniformity": {
    "productId": "31303936-3431-3235-3036-333036323038",
    "measureUnit": "g",
    "userId": "33393530-3337-3238-3638-393137393831",
    "flockId": 684,
    "uuid": "5CNHWKOS-kQ99c4rs-dAi5MIcW-xlCmfp9C"
  },
  "uniformitySetup": [
    {
      "week": 0,
      "minWeight": 52,
      "interval": 58,
      "maxWeight": 4927,
      "uniformityUuid": "5CNHWKOS-kQ99c4rs-dAi5MIcW-xlCmfp9C",
      "weights": "{\"4054\":0,\"4692\":0,...}",
      "totalChicken": 9
    }
  ]
}
```

**Get Uniformity Week Setup:**
```bash
curl -X GET "http://localhost:8089/api/weight/uniformity/week?flockId=684&productId=31303936-3431-3235-3036-333036323038&week=5" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:
```json
{
  "success": true,
  "uniformity": {
    "productId": "31303936-3431-3235-3036-333036323038",
    "measureUnit": "g",
    "userId": "33393530-3337-3238-3638-393137393831",
    "flockId": 684,
    "uuid": "5CNHWKOS-kQ99c4rs-dAi5MIcW-xlCmfp9C"
  },
  "item": {
    "week": 5,
    "minWeight": 355,
    "interval": 5,
    "maxWeight": 377,
    "uniformityUuid": "5CNHWKOS-kQ99c4rs-dAi5MIcW-xlCmfp9C",
    "weights": "{\"375\":1,\"365\":8,\"355\":0,\"260\":3,\"370\":2,\"360\":8}",
    "totalChicken": 22
  }
}
```

**Get Uniformity by UUID:**
```bash
curl -X GET "http://localhost:8089/api/weight/uniformity/5CNHWKOS-kQ99c4rs-dAi5MIcW-xlCmfp9C" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:
```json
{
  "success": true,
  "uniformity": {
    "productId": "31303936-3431-3235-3036-333036323038",
    "measureUnit": "g",
    "userId": "33393530-3337-3238-3638-393137393831",
    "flockId": 684,
    "uuid": "5CNHWKOS-kQ99c4rs-dAi5MIcW-xlCmfp9C"
  },
  "uniformitySetup": [...]
}
```

**Get Last/Default UniformityUuid:**
```bash
# Get last/default uniformityUuid for the user (any product)
curl -X GET "http://localhost:8089/api/weight/uniformity/last" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get last/default uniformityUuid for a specific product
curl -X GET "http://localhost:8089/api/weight/uniformity/last?productId=31303936-3431-3235-3036-333036323038" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:
```json
{
  "success": true,
  "uniformityUuid": "5CNHWKOS-kQ99c4rs-dAi5MIcW-xlCmfp9C"
}
```

Rules for selecting:
- Returns uniformityUuid belonging to the authenticated user
- If `productId` provided, filters by product
- Prefers entries with missing/0/null `flockId` as "default"
- If multiple candidates, picks the first deterministically

**Get Week Setup by UniformityUuid:**
```bash
curl -X GET "http://localhost:8089/api/weight/uniformity/5CNHWKOS-kQ99c4rs-dAi5MIcW-xlCmfp9C/week?week=5" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:
```json
{
  "success": true,
  "uniformity": {
    "productId": "31303936-3431-3235-3036-333036323038",
    "measureUnit": "g",
    "userId": "33393530-3337-3238-3638-393137393831",
    "flockId": 684,
    "uuid": "5CNHWKOS-kQ99c4rs-dAi5MIcW-xlCmfp9C"
  },
  "item": {
    "week": 5,
    "minWeight": 355,
    "interval": 5,
    "maxWeight": 377,
    "uniformityUuid": "5CNHWKOS-kQ99c4rs-dAi5MIcW-xlCmfp9C",
    "weights": "{\"375\":1,\"365\":8,\"355\":0,\"260\":3,\"370\":2,\"360\":8}",
    "totalChicken": 22
  }
}
```

**Validation Errors:**
- `flockId`: must be a positive integer
- `productId`: must be a non-empty string
- `week`: must be an integer >= 0

**Performance Notes:**
- The JSON fixture is loaded once on first request and cached in memory
- Indexes are built for O(1) lookups by `userId:flockId:productId` triplet and by `uuid`
- Week lookups within an entry are also O(1)
- No file I/O occurs per request after initial load

---

## Creating Admin Users

### Method 1: Using Admin API (Recommended)

If you already have an admin user, create new admins via the API:

```bash
curl -X POST http://localhost:8089/api/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "New Admin",
    "email": "newadmin@example.com",
    "role": "admin"
  }'
```

### Method 2: Direct Database Insert (First Admin)

For the first admin user, insert directly via phpMyAdmin:

1. Generate a password hash:
```bash
node -e "console.log(require('bcrypt').hashSync('YourSecurePassword123', 12))"
```

2. Execute in phpMyAdmin SQL tab:
```sql
INSERT INTO users (fullname, email, password_hash, role)
VALUES (
  'Admin User',
  'admin@example.com',
  '$2b$12$YOUR_GENERATED_HASH_HERE',
  'admin'
);
```

---

## Security Features

1. **Password Hashing**: bcrypt with 12 salt rounds
2. **JWT Tokens**: Separate access and refresh tokens
3. **Token Rotation**: Refresh tokens are rotated on use
4. **Hashed Refresh Tokens**: Tokens stored hashed in database (SHA-256)
5. **Token Expiration**: Access tokens expire in 15 minutes, refresh tokens in 30 days
6. **Rate Limiting**: 100 requests per 15 minutes per IP
7. **Helmet**: Security headers
8. **CORS**: Configurable cross-origin access
9. **Input Validation**: All inputs validated with express-validator
10. **SQL Injection Prevention**: Prepared statements
11. **Admin Self-Delete Protection**: Admins cannot delete their own account

---

## Troubleshooting

### Database Connection Failed

- Verify MySQL is running
- Check DB credentials in `.env`
- Ensure database `lohmann_app` exists
- Test connection: `mysql -u root -p -h localhost`

### Port Already in Use

Change `PORT` in `.env` or kill the process:

```bash
# macOS/Linux
lsof -ti:8089 | xargs kill -9

# Windows
netstat -ano | findstr :8089
taskkill /PID <PID> /F
```

### JWT Secret Too Short

Ensure `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are at least 32 characters.

### Admin Access Denied

- Verify your user has `role = 'admin'` in the database
- Check that you're using a valid, non-expired access token
- Ensure the Authorization header format is correct: `Bearer <token>`

---

## Database Maintenance

### Cleanup Expired Tokens

Run periodically (or set up a cron job):

```sql
DELETE FROM refresh_tokens
WHERE expires_at < NOW() OR revoked_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

---

## License

ISC
