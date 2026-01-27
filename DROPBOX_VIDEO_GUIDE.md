# How to Add Your Dropbox Videos

## Step 1: Get Dropbox Shareable Links

1. Go to [Dropbox.com](https://www.dropbox.com) and sign in
2. Navigate to your video folder
3. For each video:
   - Click the **Share** button
   - Click **Create link** (or **Copy link** if already created)
   - The link will look like: `https://www.dropbox.com/scl/fi/abc123/video.mp4?rlkey=xyz&dl=0`

## Step 2: Convert to Direct Download Links

The app automatically converts Dropbox share links to direct streaming links, but you can also do it manually:

**Change this:**
```
https://www.dropbox.com/scl/fi/abc123/video.mp4?rlkey=xyz&dl=0
```

**To this (for better performance):**
```
https://dl.dropboxusercontent.com/scl/fi/abc123/video.mp4?rlkey=xyz
```

Simply:
- Replace `www.dropbox.com` with `dl.dropboxusercontent.com`
- Remove `&dl=0` from the end

## Step 3: Add Videos to Your App

Open `app/category/[slug].tsx` and update the `categoryVideos` object:

```typescript
const categoryVideos: Record<string, Array<{ id: string; title: string; url: string; description?: string }>> = {
  sleep: [
    {
      id: '1',
      title: 'Deep Sleep Meditation',
      url: 'https://dl.dropboxusercontent.com/scl/fi/YOUR_VIDEO_LINK_HERE',
      description: 'A calming 20-minute meditation',
    },
    {
      id: '2',
      title: 'Bedtime Routine',
      url: 'https://dl.dropboxusercontent.com/scl/fi/YOUR_VIDEO_LINK_HERE',
      description: 'Evening wind-down exercises',
    },
    // Add more videos...
  ],
  'morning-routines': [
    {
      id: '1',
      title: 'Morning Stretch',
      url: 'https://dl.dropboxusercontent.com/scl/fi/YOUR_VIDEO_LINK_HERE',
      description: '10-minute energizing stretch',
    },
    // Add more videos...
  ],
  // Add videos for other categories...
};
```

## Step 4: Test Your Videos

1. Save the file
2. The app should automatically reload in Expo Go
3. Tap a category card to see your videos
4. Videos should load and play with native controls

## Supported Video Formats

- MP4 (recommended)
- MOV
- M4V

## Tips for Best Performance

1. **Keep videos under 100MB** for faster loading
2. **Use MP4 format** with H.264 encoding
3. **Optimize videos** before uploading (720p or 1080p recommended)
4. **Test on both WiFi and cellular** to ensure smooth playback

## Troubleshooting

### Video won't play
- Check that the Dropbox link is public and accessible
- Verify the link is properly formatted
- Ensure the video format is supported (MP4 recommended)

### Video loads slowly
- The video might be too large
- Try compressing the video before uploading to Dropbox
- Check your internet connection

### "Video not found" error
- The Dropbox link might have expired
- The file might have been moved or deleted
- Check that the sharing permissions are set to "Anyone with the link"

## Next Steps

Consider moving to a better video hosting solution for production:
- **Vimeo** - Better streaming performance, privacy controls
- **AWS S3 + CloudFront** - Scalable, fast CDN delivery
- **Mux** - Video hosting specifically designed for apps

For now, Dropbox works great for testing and initial development!
