# Multi-Device Authentication System

## Overview
This system allows users to access their game data from multiple devices by implementing email/password authentication. Instead of each device creating its own anonymous user ID, users can now register/login to access their data from anywhere.

## How It Works

### 1. Authentication Flow
- **Anonymous Users**: Each device gets a unique `anonymous_` ID (stored in localStorage)
- **Authenticated Users**: Users register/login with email/password to get a persistent user ID
- **Data Sync**: Authenticated users' data is synced across all their devices

### 2. Files Added
- `auth-manager.js` - Handles user registration, login, and authentication
- `multi-device-setup.js` - Adds UI for authentication to the login page
- Updated `user-manager.js` - Supports both anonymous and authenticated users

### 3. Backend API Requirements
The system expects these API endpoints:

#### Registration
```javascript
POST /api/register
Body: { email: string, password: string }
Response: { token: string, userId: string }
```

#### Login  
```javascript
POST /api/login
Body: { email: string, password: string }
Response: { token: string, userId: string }
```

#### Token Verification
```javascript
POST /api/verify-token
Body: { email: string, token: string }
Response: 200 OK or 401 Unauthorized
```

#### User Data (with auth)
```javascript
GET /api/user/{userId}
Headers: { Authorization: "Bearer {token}" }
```

### 4. User Experience

**First-time Users:**
1. Open app on any device
2. Use the app anonymously (data stays on that device)
3. Register/login to sync data across devices

**Returning Users:**
1. Open app on any device
2. Login with email/password
3. All game data loads from server
4. Continue playing seamlessly

### 5. Data Migration

When a user registers/logs in:
1. Local anonymous data is preserved
2. Server data takes precedence (if it exists)
3. Future syncs use the authenticated user ID

### 6. Security Features

- JWT tokens for authentication
- Automatic token verification on app load
- Secure API calls with authorization headers
- Local data isolation for anonymous users

### 7. Implementation Status

✅ **Frontend Complete**: 
- Authentication UI added to login page
- User manager supports both modes
- Automatic token management

⏳ **Backend Required**:
- Need to implement the API endpoints listed above
- User database with email/password storage
- JWT token generation/verification

### 8. Testing

Test scenarios:
1. Anonymous usage on single device
2. Registration and login flow
3. Multi-device data synchronization
4. Token expiration handling
5. Offline functionality

### 9. Next Steps

1. **Implement backend API endpoints**
2. **Set up user database** (MongoDB collection for users)
3. **Add password hashing** (bcrypt recommended)
4. **JWT implementation** for token generation
5. **Testing** across multiple devices

This system solves the original problem where each device was creating separate user entries in MongoDB. Now users can truly access their data from any device!
