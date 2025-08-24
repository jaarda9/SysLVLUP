# Daily Reset Functionality Test Guide

## Overview
The daily reset system automatically resets HP, MP, stamina, fatigue, and daily quests every day. It also provides a manual reset button for testing purposes.

## What Gets Reset Daily
- **HP**: Reset to 100%
- **MP**: Reset to 100%
- **Stamina**: Reset to 100%
- **Fatigue**: Reset to 0
- **Daily Quests**: Reset to [0/4], [0/3], [0/2] for Physical, Mental, and Spiritual respectively

## How It Works

### Automatic Reset
1. **Time-based Check**: The system checks for daily reset every hour
2. **Page Load Check**: Also checks when the status page or daily quest page loads
3. **Date Comparison**: Compares current date with last reset date stored in the database
4. **Automatic Execution**: If it's a new day, automatically performs the reset

### Manual Reset
1. **Button Access**: Use the "Daily Reset" button in the status page header
2. **Confirmation**: System asks for confirmation before resetting
3. **Immediate Execution**: Resets all values immediately

## Testing the Functionality

### Test 1: Manual Reset
1. Open the status page
2. Modify some values (HP, MP, stamina, fatigue, or daily quests)
3. Click the "Daily Reset" button
4. Confirm the reset
5. Verify all values are reset to their starting values

### Test 2: Automatic Reset (Simulation)
1. Open browser developer tools (F12)
2. Go to the Console tab
3. Manually change the last reset date in the database:
   ```javascript
   // Get current user data
   const userData = userManager.getData();
   // Change last reset date to yesterday
   userData.lastResetDate = new Date(Date.now() - 86400000).toLocaleDateString();
   // Save the change
   userManager.saveUserData();
   ```
4. Refresh the page
5. Check console for "New day detected, performing daily reset..." message
6. Verify the notification appears and values are reset

### Test 3: Daily Quest Page Reset
1. Follow the same steps as Test 2
2. Instead of refreshing the status page, navigate to the daily quest page
3. Verify the reset happens there as well

## Console Messages to Look For
- "Daily reset check - Today: [date], Last reset: [date]"
- "New day detected, performing daily reset..."
- "Daily reset completed successfully"
- "Same day, no reset needed" (when no reset is needed)

## Notification
When a daily reset occurs, a beautiful notification appears at the top of the screen with:
- 🌅 Daily Reset Complete! message
- Information about what was reset
- Automatic dismissal after 5 seconds

## Database Storage
The system stores the last reset date in the user's data as `lastResetDate` field, which is automatically saved to MongoDB.

## Safety Features
- Confirmation dialog for manual reset
- Error handling for all reset operations
- Automatic saving to database after reset
- UI updates to reflect reset values immediately
