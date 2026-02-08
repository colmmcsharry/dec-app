# Vimeo Integration Setup

Your app is now configured to use Vimeo instead of Dropbox! Here's how to finish the setup.

## Step 1: Get Vimeo Access Token

1. Go to [vimeo.com/settings/apps](https://vimeo.com/settings/apps)
2. If you already have an app, click on it. Otherwise, click **"Create App"**
3. Scroll to **"Personal Access Token"** section
4. Click **"Generate"** or use existing token
5. Make sure these scopes are checked:
   - ✅ **public** (view public videos)
   - ✅ **private** (view private videos)
   - ✅ **video_files** (access video files)
6. Copy the token

## Step 2: Get Your Folder IDs

You need the folder ID for each module. Here's how:

1. Go to your Vimeo library
2. Click on each folder (module 1, module 2, etc.)
3. Look at the URL: `https://vimeo.com/user/12345678/folder/28053774`
4. The number at the end (`28053774`) is your folder ID
5. Copy each folder ID

## Step 3: Update Config

Open `config/vimeo.config.ts` and fill in:

```typescript
export const VIMEO_CONFIG = {
  accessToken: 'paste_your_vimeo_token_here',
  
  categoryFolders: {
    'sleep': '28053774',           // Module 1 folder ID
    'morning-routines': '12345678', // Module 2 folder ID  
    'energy-management': '87654321', // Module 3 folder ID
    'fuel-2-perform': '11223344',   // Module 4 folder ID
    'move-2-perform': '55667788',   // Module 5 folder ID
    'thinking-2-perform': '99887766', // Module 6 folder ID
    'recovery': 'FOLDER_ID_7',      // Module 7 folder ID
    'mindfulness': 'FOLDER_ID_8',   // Module 8 folder ID
    'stress-management': 'FOLDER_ID_9', // Module 9 folder ID
    'habits': 'FOLDER_ID_10',       // Module 10 folder ID
  },
};
```

## Step 4: Restart the App

```bash
# Make sure you're on Node 20
nvm use 20

# Start the app
npx expo start --tunnel
```

## What's Different from Dropbox:

✅ **No token expiration** - Vimeo tokens don't expire!
✅ **Faster loading** - Vimeo's CDN is optimized for video
✅ **Better quality** - Adaptive streaming (HD/SD based on connection)
✅ **Professional** - Built for video hosting
✅ **Scalable** - Handles hundreds of concurrent users easily

## Folder Organization Tips:

In your Vimeo library, you can organize folders like:
- Module 1 (Sleep)
- Module 2 (Morning Routines)
- Module 3 (Energy Management)
- etc.

The app will automatically fetch videos from the correct folder based on what category the user taps.

## Troubleshooting:

### "Failed to load videos"
- Check your access token is correct
- Make sure you copied the folder IDs correctly
- Verify the folders exist in your Vimeo account

### "Videos not showing"
- Check the folder ID is correct (copy from URL)
- Make sure videos are uploaded to that folder
- Verify token has proper scopes (public, private, video_files)

### "Token not configured"
- You haven't replaced `YOUR_VIMEO_ACCESS_TOKEN_HERE` in the config

## Next Steps:

Once videos are loading:
1. ✅ No more token expiration issues
2. ✅ Ready for production with hundreds of users
3. ✅ Professional video hosting infrastructure
4. ✅ Can add analytics, privacy controls, etc.

Much better than Dropbox! 🎉
