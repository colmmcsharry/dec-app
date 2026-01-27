# Dropbox API Setup Guide

Your app is now configured to automatically fetch videos from Dropbox! Follow these steps to set it up.

## Step 1: Create a Dropbox App

1. Go to [https://www.dropbox.com/developers/apps](https://www.dropbox.com/developers/apps)
2. Click **"Create app"**
3. Choose **"Scoped access"**
4. Choose **"Full Dropbox"** (to access all your folders)
5. Name your app (e.g., "Wellness App" or "Peak Performance App")
6. Click **"Create app"**

## Step 2: Configure Permissions

1. In your app settings, go to the **"Permissions"** tab
2. Enable these permissions:
   - ✅ `files.metadata.read` - To list video files
   - ✅ `files.content.read` - To generate streaming links
3. Click **"Submit"** at the bottom

## Step 3: Generate Access Token

1. Go to the **"Settings"** tab
2. Scroll down to **"OAuth 2"** section
3. Under **"Generated access token"**, click **"Generate"**
4. Copy the generated token (it's a long string like `sl.B1234abcd...`)
5. **Keep this token secure!** Don't share it publicly.

## Step 4: Add Token to Your App

1. Open `config/dropbox.config.ts`
2. Replace `YOUR_DROPBOX_ACCESS_TOKEN_HERE` with your actual token:

```typescript
export const DROPBOX_CONFIG = {
  accessToken: 'sl.B1234abcd...YOUR_ACTUAL_TOKEN',
  // ...
};
```

## Step 5: Configure Folder Paths

In the same config file, update the folder paths to match your Dropbox structure:

```typescript
folderPaths: {
  'morning-routines': '/Performance Treanor/1. Margaux Marketing/03_Peak-Performance-Code/Course_videos/03_Exports/Module1',
  // Update other paths as needed...
}
```

**Your current Module1 path is already configured!**

## Step 6: Test It

1. Save the config file
2. The app will automatically reload
3. Tap on "Morning Routines" (or whichever category uses Module1)
4. Your videos should automatically load! 🎉

## How It Works

### Automatic Features:
- ✅ **Lists all MP4 videos** in the specified folder
- ✅ **Generates streaming links** on-demand
- ✅ **Parses video names** automatically (e.g., "M1_01_video1.mp4" → "M1 01 video1")
- ✅ **No manual link copying** needed!
- ✅ **Links expire after 4 hours** (automatic refresh on next load)

### Video Organization:
The app automatically detects your naming convention:
- `M1_00_intro.mp4` → Module 1, Section 00, "intro"
- `M1_01_video1.mp4` → Module 1, Section 01, "video 1"
- etc.

## Adding More Videos

Simply:
1. Upload new videos to your Dropbox folder
2. Pull down to refresh in the app
3. New videos appear automatically!

## Folder Structure Recommendation

Organize your Dropbox like this:

```
/Performance Treanor/
  /1. Margaux Marketing/
    /03_Peak-Performance-Code/
      /Course_videos/
        /03_Exports/
          /Module1/       ← Morning Routines videos
          /Sleep/         ← Sleep videos  
          /Energy/        ← Energy Management videos
          /Nutrition/     ← Fuel 2 Perform videos
          /Movement/      ← Move 2 Perform videos
          /Mental/        ← Thinking 2 Perform videos
```

Then update the `folderPaths` in the config to match.

## Security Note

⚠️ **For production apps:**
- Don't commit the access token to Git
- Use environment variables instead
- Consider implementing OAuth flow for user-specific access

For development, the current approach is fine!

## Troubleshooting

### "Failed to load videos"
- Check that your access token is correct
- Verify the folder path matches your Dropbox structure exactly
- Make sure permissions are enabled in the Dropbox app settings

### Videos not showing
- Check that files are `.mp4`, `.mov`, or `.m4v` format
- Verify the folder path is correct (case-sensitive!)
- Try refreshing the screen

### "Access token not configured"
- You haven't replaced the placeholder in `config/dropbox.config.ts`

## Next Steps

Once Module1 is working:
1. Organize other videos into folders
2. Update the folder paths in the config
3. All categories will automatically load their videos!

No more manual link copying for hundreds of videos! 🚀
