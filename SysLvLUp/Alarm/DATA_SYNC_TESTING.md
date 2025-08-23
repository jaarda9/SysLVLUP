# Data Synchronization Testing Guide

## Overview
This guide explains how to test and troubleshoot data synchronization in your PWA across different platforms, particularly iOS where you've experienced issues.

## Testing Data Synchronization

### 1. Verify User ID Consistency
- Check that the same user ID is being used across all pages
- The user ID should be stored in localStorage as 'userId'
- If you're seeing new data each time, it might be because a new user ID is being generated

### 2. Test API Endpoints
- Open the browser's developer tools
- Go to the Network tab
- Perform actions that should trigger data synchronization
- Check if the API calls to `/api/sync` and `/api/user/:userId` are successful

### 3. Check Service Worker Behavior
- In developer tools, go to Application > Service Workers
- Check if the service worker is registered and activated
- Look for any errors in the service worker
- Verify that API calls are not being incorrectly cached

### 4. iOS-Specific Testing
- When installed on iOS, the PWA runs in a different context
- Ensure that all pages are properly loading the database.js and sync.js files
- Check that the beforeunload event is working (iOS may handle this differently)

## Troubleshooting Common Issues

### Issue: Data Not Syncing on iOS
**Possible Causes:**
1. iOS Safari handles beforeunload events differently than other browsers
2. The service worker might be caching API responses incorrectly
3. CORS issues when running as a PWA

**Solutions:**
1. Add manual sync buttons to key pages for iOS users
2. Implement periodic sync using setInterval in addition to beforeunload
3. Ensure API endpoints are properly configured for CORS

### Issue: New User ID Generated Each Time
**Possibled Causes:**
1. localStorage is not persisting between sessions
2. The user ID generation logic is flawed

**Solutions:**
1. Verify that localStorage is being used correctly
2. Check that the user ID is only generated if it doesn't already exist

### Issue: API Calls Failing
**Possible Causes:**
1. Network connectivity issues
2. Server not properly configured
3. Incorrect API URLs

**Solutions:**
1. Ensure the server is running and accessible
2. Check that all HTML files are using the correct API URLs
3. Verify that the server.js file has the proper routes

## Manual Testing Steps

1. Open the app in a browser
2. Perform some actions that modify localStorage
3. Close the browser tab/window
4. Reopen the app
5. Check if the data persists

## Additional Recommendations

1. Add error handling to sync functions to display user-friendly messages
2. Implement a manual sync button for users to force synchronization
3. Add logging to track when sync operations occur
4. Consider using IndexedDB instead of localStorage for more robust data storage