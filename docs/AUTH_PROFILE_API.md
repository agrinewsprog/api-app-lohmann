# User Profile & Password Management API

This document describes the endpoints for managing user profile information and password changes.

## Base URL

```
/api/auth
```

## Authentication

All endpoints require authentication. Include the JWT access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## Endpoints

### 1. Get Current User Profile

Get the authenticated user's profile information.

**Endpoint:** `GET /api/auth/me`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "fullname": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

### 2. Update User Profile

Update the authenticated user's profile information. Currently supports updating the full name only. **Email cannot be changed.**

**Endpoint:** `PUT /api/auth/profile`

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "fullname": "Jane Doe"
}
```

**Validation Rules:**

- `fullname`: Required, string, 2-150 characters

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "fullname": "Jane Doe",
      "email": "john@example.com",
      "role": "user",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-02-05T14:22:00.000Z"
    }
  }
}
```

**Error Responses:**

`400 Bad Request` - Validation error

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "fullname",
      "message": "Full name must be between 2 and 150 characters"
    }
  ]
}
```

`401 Unauthorized` - Missing or invalid token

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

`404 Not Found` - User not found

```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 3. Change Password

Change the authenticated user's password. After a successful password change, all refresh tokens are revoked, requiring the user to log in again on all devices.

**Endpoint:** `PUT /api/auth/password`

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456"
}
```

**Validation Rules:**

- `currentPassword`: Required, string
- `newPassword`: Required, minimum 8 characters, must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Password changed successfully. Please log in again on all devices."
}
```

**Error Responses:**

`400 Bad Request` - Validation error

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "newPassword",
      "message": "New password must be at least 8 characters long"
    }
  ]
}
```

`400 Bad Request` - Same password

```json
{
  "success": false,
  "message": "New password must be different from current password"
}
```

`401 Unauthorized` - Incorrect current password

```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

`401 Unauthorized` - Missing or invalid token

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

`404 Not Found` - User not found

```json
{
  "success": false,
  "message": "User not found"
}
```

---

## Implementation Examples

### JavaScript/Fetch Example

#### Get Current User Profile

```javascript
async function getCurrentUser(accessToken) {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (data.success) {
    return data.data.user;
  } else {
    throw new Error(data.message);
  }
}
```

#### Update Profile

```javascript
async function updateProfile(accessToken, fullname) {
  const response = await fetch("/api/auth/profile", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fullname }),
  });

  const data = await response.json();

  if (data.success) {
    return data.data.user;
  } else {
    throw new Error(data.message);
  }
}
```

#### Change Password

```javascript
async function changePassword(accessToken, currentPassword, newPassword) {
  const response = await fetch("/api/auth/password", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const data = await response.json();

  if (data.success) {
    // Password changed successfully
    // User needs to log in again on all devices
    return data.message;
  } else {
    throw new Error(data.message);
  }
}
```

### React/Axios Example

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// Interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get current user
export const getCurrentUser = async () => {
  const { data } = await api.get("/auth/me");
  return data.data.user;
};

// Update profile
export const updateProfile = async (fullname) => {
  const { data } = await api.put("/auth/profile", { fullname });
  return data.data.user;
};

// Change password
export const changePassword = async (currentPassword, newPassword) => {
  const { data } = await api.put("/auth/password", {
    currentPassword,
    newPassword,
  });
  return data.message;
};
```

---

## Important Notes

1. **Email is immutable**: The user's email address cannot be changed through these endpoints.

2. **Password change security**: When a user changes their password, all existing refresh tokens are revoked. This means the user will need to log in again on all devices for security purposes.

3. **Token expiration**: If the access token expires during a session, use the `/api/auth/refresh` endpoint to get a new access token.

4. **Password requirements**: Enforce the following password requirements on the frontend:
   - Minimum 8 characters
   - At least one uppercase letter (A-Z)
   - At least one lowercase letter (a-z)
   - At least one number (0-9)

5. **Error handling**: Always handle authentication errors (401) by redirecting to the login page and clearing stored tokens.

---

## UI/UX Recommendations

### Profile Section

- Display current user information (name, email, role)
- Show email as read-only (greyed out or disabled)
- Provide an edit button/form for the full name
- Show last updated timestamp
- Confirm changes before saving

### Password Change Section

- Use password input fields with visibility toggle
- Show password strength indicator for new password
- Validate password requirements in real-time
- Require current password for security
- Show confirmation message after successful change
- Automatically log out after password change (clear tokens and redirect to login)

### Error Messages

- Display validation errors inline with form fields
- Show toast/notification for successful operations
- Handle network errors gracefully
- Provide clear feedback for incorrect current password
