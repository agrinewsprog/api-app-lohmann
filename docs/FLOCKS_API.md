# Flocks API Documentation

API endpoints for managing flocks (farms/lots) in Weight and Production modules.

## Authentication

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Base URLs

- **Weight Flocks:** `/api/weight/flocks`
- **Production Flocks:** `/api/production/flocks`

Both modules share identical endpoint structures and request/response formats.

---

## Endpoints

### List All Flocks

Returns all flocks belonging to the authenticated user.

**Request**
```
GET /api/weight/flocks
GET /api/production/flocks
```

**Response** `200 OK`
```json
{
  "success": true,
  "items": [
    {
      "id": 1,
      "name": "Farm Alpha",
      "location": "Building A",
      "notes": "Main production facility",
      "created_at": "2025-01-27T10:00:00.000Z",
      "updated_at": "2025-01-27T10:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Farm Beta",
      "location": null,
      "notes": null,
      "created_at": "2025-01-27T11:00:00.000Z",
      "updated_at": "2025-01-27T11:00:00.000Z"
    }
  ]
}
```

---

### Get Single Flock

Returns a specific flock by ID. Only returns flocks owned by the authenticated user.

**Request**
```
GET /api/weight/flocks/:id
GET /api/production/flocks/:id
```

**Response** `200 OK`
```json
{
  "success": true,
  "item": {
    "id": 1,
    "name": "Farm Alpha",
    "location": "Building A",
    "notes": "Main production facility",
    "created_at": "2025-01-27T10:00:00.000Z",
    "updated_at": "2025-01-27T10:00:00.000Z"
  }
}
```

**Error** `404 Not Found`
```json
{
  "success": false,
  "error": {
    "message": "Flock not found"
  }
}
```

---

### Create Flock

Creates a new flock for the authenticated user.

**Request**
```
POST /api/weight/flocks
POST /api/production/flocks
```

**Body**
```json
{
  "name": "Farm Alpha",
  "location": "Building A",
  "notes": "Main production facility"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | Yes | 2-120 characters |
| `location` | string | No | Max 160 characters |
| `notes` | string | No | No limit |

**Response** `201 Created`
```json
{
  "success": true,
  "item": {
    "id": 1,
    "name": "Farm Alpha",
    "location": "Building A",
    "notes": "Main production facility",
    "created_at": "2025-01-27T10:00:00.000Z",
    "updated_at": "2025-01-27T10:00:00.000Z"
  }
}
```

**Error** `409 Conflict` (duplicate name)
```json
{
  "success": false,
  "error": {
    "message": "A flock with this name already exists"
  }
}
```

**Error** `400 Bad Request` (validation failed)
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": [
      {
        "field": "name",
        "message": "name is required"
      }
    ]
  }
}
```

---

### Update Flock

Updates an existing flock. Only the provided fields will be updated.

**Request**
```
PUT /api/weight/flocks/:id
PUT /api/production/flocks/:id
```

**Body** (all fields optional)
```json
{
  "name": "Farm Alpha Updated",
  "location": "Building B",
  "notes": "Updated notes"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | No | 2-120 characters |
| `location` | string | No | Max 160 characters |
| `notes` | string | No | No limit |

**Response** `200 OK`
```json
{
  "success": true,
  "item": {
    "id": 1,
    "name": "Farm Alpha Updated",
    "location": "Building B",
    "notes": "Updated notes",
    "created_at": "2025-01-27T10:00:00.000Z",
    "updated_at": "2025-01-27T12:00:00.000Z"
  }
}
```

**Error** `404 Not Found`
```json
{
  "success": false,
  "error": {
    "message": "Flock not found"
  }
}
```

**Error** `409 Conflict` (duplicate name)
```json
{
  "success": false,
  "error": {
    "message": "A flock with this name already exists"
  }
}
```

---

### Delete Flock

Deletes a flock by ID.

**Request**
```
DELETE /api/weight/flocks/:id
DELETE /api/production/flocks/:id
```

**Response** `200 OK`
```json
{
  "success": true
}
```

**Error** `404 Not Found`
```json
{
  "success": false,
  "error": {
    "message": "Flock not found"
  }
}
```

---

## Error Codes

| Status | Meaning |
|--------|---------|
| `200` | Success |
| `201` | Created successfully |
| `400` | Validation error (check `details` array) |
| `401` | Missing or invalid JWT token |
| `404` | Flock not found or not owned by user |
| `409` | Duplicate flock name |
| `429` | Rate limit exceeded |
| `500` | Server error |

---

## Usage Examples

### JavaScript/Fetch

```javascript
const API_BASE = 'http://localhost:3000/api';

// List weight flocks
const listFlocks = async (token) => {
  const res = await fetch(`${API_BASE}/weight/flocks`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return res.json();
};

// Create a flock
const createFlock = async (token, data) => {
  const res = await fetch(`${API_BASE}/weight/flocks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

// Update a flock
const updateFlock = async (token, id, data) => {
  const res = await fetch(`${API_BASE}/weight/flocks/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

// Delete a flock
const deleteFlock = async (token, id) => {
  const res = await fetch(`${API_BASE}/weight/flocks/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return res.json();
};
```

### TypeScript Interfaces

```typescript
interface Flock {
  id: number;
  name: string;
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface FlockListResponse {
  success: boolean;
  items: Flock[];
}

interface FlockItemResponse {
  success: boolean;
  item: Flock;
}

interface FlockDeleteResponse {
  success: boolean;
}

interface CreateFlockDTO {
  name: string;
  location?: string;
  notes?: string;
}

interface UpdateFlockDTO {
  name?: string;
  location?: string;
  notes?: string;
}

interface ApiError {
  success: false;
  error: {
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}
```

---

## Notes

- Flock names must be unique per user within each module (weight/production)
- A user's weight flocks and production flocks are stored separately
- The same flock name can exist in both weight and production modules
- Deleting a user cascades to delete all their flocks
