# API Debug Guide - Fixing 404 Error (Alternative Approach)

## Problem
The API endpoint `/api/sync` is returning a 404 (Not Found) error when trying to load user data, but POST requests are working fine.

## Root Cause Analysis
The issue is likely that Vercel is not properly recognizing the API routes. This can happen when:
1. Vercel routing issues with specific API names
2. API files not properly structured for Vercel
3. MongoDB connection issues
4. Environment variables not set correctly

## Solution Steps

### 1. Deploy the Updated Code
First, commit and push the updated files to your repository:

```bash
git add js/user-manager.js api/users.js
git commit -m "Add fallback API endpoint and improved error handling"
git push
```

### 2. Test API Endpoints
After deployment, test these endpoints in your browser or using curl:

#### Test 1: Health Check
```
https://sys-lvlup.vercel.app/api/health
```
**Expected Response:**
```json
{
  "status": "healthy",
  "message": "MongoDB connection successful",
  "timestamp": "2025-01-24T...",
  "database": "your-database-name",
  "collections": ["userData"],
  "userDataCount": 0,
  "environment": "production"
}
```

#### Test 2: Users API (New Fallback)
```
https://sys-lvlup.vercel.app/api/users?userId=greg
```
**Expected Response (if user exists):**
```json
{
  "localStorageData": {
    "userId": "greg",
    "gameData": {...},
    "lastResetDate": "24/08/2025"
  }
}
```

**Expected Response (if user doesn't exist):**
```json
{
  "error": "User not found"
}
```

#### Test 3: Original Sync API (Should still work for POST)
```
https://sys-lvlup.vercel.app/api/sync?userId=greg
```
**Expected Response:** Either user data or "User not found" (not 404)

### 3. Check Environment Variables
Make sure your Vercel deployment has the correct environment variables:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Verify `MONGODB_URI` is set correctly

### 4. Debug Console Testing
Open your browser console and run these tests:

```javascript
// Test 1: Health check
fetch('https://sys-lvlup.vercel.app/api/health')
  .then(response => response.json())
  .then(data => console.log('Health check:', data))
  .catch(error => console.error('Health check failed:', error));

// Test 2: Users API (new fallback)
fetch('https://sys-lvlup.vercel.app/api/users?userId=greg')
  .then(response => {
    console.log('Users API response status:', response.status);
    return response.json();
  })
  .then(data => console.log('Users API:', data))
  .catch(error => console.error('Users API failed:', error));

// Test 3: Original sync API
fetch('https://sys-lvlup.vercel.app/api/sync?userId=greg')
  .then(response => {
    console.log('Sync API response status:', response.status);
    return response.json();
  })
  .then(data => console.log('Sync API:', data))
  .catch(error => console.error('Sync API failed:', error));
```

### 5. Check Vercel Logs
If the issue persists, check Vercel function logs:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Functions tab
4. Check the logs for `/api/sync` function

### 6. Alternative Fix - Update API Structure
If the issue continues, we might need to update the API structure. The current structure should work, but sometimes Vercel needs specific configurations.

## Expected Behavior After Fix

### Before Fix:
- ❌ GET `/api/sync?userId=greg` → 404 Not Found
- ✅ POST `/api/sync` → 200 OK (working)

### After Fix:
- ✅ GET `/api/sync?userId=greg` → 200 OK (with user data or "User not found")
- ✅ GET `/api/users?userId=greg` → 200 OK (fallback endpoint)
- ✅ POST `/api/sync` → 200 OK (continues working)
- ✅ POST `/api/users` → 200 OK (fallback endpoint)
- ✅ Automatic fallback when one API fails

## Troubleshooting Steps

1. **Deploy the vercel.json file**
2. **Test the health endpoint** - This will verify MongoDB connection
3. **Test the test-sync endpoint** - This will verify API routing
4. **Test the actual sync endpoint** - This will verify the specific function
5. **Check environment variables** - Ensure MONGODB_URI is set
6. **Check Vercel logs** - Look for any error messages

## If Still Not Working

If the issue persists after following these steps:

1. **Check Vercel deployment status** - Ensure the latest code is deployed
2. **Verify MongoDB connection** - Test the health endpoint
3. **Check API file structure** - Ensure all API files are in the `/api` directory
4. **Contact Vercel support** - If the issue is with Vercel's routing

## Success Indicators

You'll know the fix worked when:
- ✅ Health endpoint returns successful MongoDB connection
- ✅ Users API endpoint returns either user data or "User not found" (not 404)
- ✅ Console shows "Loading existing player data" instead of "Creating new player data"
- ✅ Console shows fallback messages like "Sync API not found, trying users API..."
- ✅ Cross-device sync works properly
- ✅ No more 404 errors in the console
