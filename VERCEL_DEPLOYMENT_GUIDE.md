# Vercel Deployment Guide for Data Sync

## Prerequisites
- MongoDB Atlas account with a cluster set up
- Vercel account
- Your project code

## Step 1: Set Up MongoDB Atlas

1. **Create a MongoDB Atlas Cluster** (if you haven't already)
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create a new cluster
   - Choose the free tier (M0) for testing

2. **Get Your Connection String**
   - In your cluster, click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name (e.g., `gamedata`)

## Step 2: Configure Vercel Environment Variables

1. **Go to Your Vercel Dashboard**
   - Navigate to your project
   - Go to "Settings" tab
   - Click on "Environment Variables"

2. **Add the MongoDB URI**
   - **Name**: `MONGODB_URI`
   - **Value**: Your MongoDB Atlas connection string
   - **Environment**: Select all environments (Production, Preview, Development)
   - Click "Add"

   Example connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/gamedata?retryWrites=true&w=majority
   ```

## Step 3: Deploy to Vercel

1. **Push your code to GitHub** (if not already done)
2. **Connect your repository to Vercel**
   - In Vercel dashboard, click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the configuration from `vercel.json`

3. **Deploy**
   - Vercel will automatically deploy your project
   - The API routes will be available at `https://your-domain.vercel.app/api/`

## Step 4: Test the Data Sync

1. **Open your deployed app**
2. **Open browser developer tools** (F12)
3. **Go to Console tab**
4. **Perform some actions** in your app that modify localStorage
5. **Check the console** for sync messages
6. **Check MongoDB Atlas** to verify data is being saved

## Troubleshooting

### Issue: "MONGODB_URI is not defined" Error
**Solution**: Make sure you've added the environment variable in Vercel dashboard

### Issue: CORS Errors
**Solution**: The updated `vercel.json` includes proper CORS headers

### Issue: API Routes Not Working
**Solution**: 
1. Check that your `vercel.json` is properly configured
2. Ensure your API files are in the `/api` folder
3. Verify the deployment was successful

### Issue: Data Not Syncing
**Solution**:
1. Check browser console for errors
2. Verify MongoDB Atlas connection string is correct
3. Check that your MongoDB Atlas cluster is accessible from Vercel

## Testing Checklist

- [ ] Environment variable `MONGODB_URI` is set in Vercel
- [ ] App deploys successfully without errors
- [ ] API endpoints respond correctly (`/api/sync`, `/api/user`)
- [ ] Data syncs when you perform actions in the app
- [ ] Data persists when you refresh the page
- [ ] Data syncs across different devices/browsers

## Monitoring

- **Vercel Logs**: Check function logs in Vercel dashboard
- **MongoDB Atlas**: Monitor your database for new documents
- **Browser Console**: Check for sync messages and errors

## Security Notes

- Never commit your MongoDB connection string to version control
- Use environment variables for all sensitive data
- Consider implementing user authentication for production use
- Regularly rotate your database passwords
