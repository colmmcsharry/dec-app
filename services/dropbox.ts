import { DROPBOX_CONFIG } from '@/config/dropbox.config';

const DROPBOX_API_URL = 'https://api.dropboxapi.com/2';

export interface DropboxVideo {
  id: string;
  name: string;
  path: string;
  streamUrl?: string;
}

/**
 * List all video files in a Dropbox folder using direct API call
 */
export async function listVideosInFolder(folderPath: string): Promise<DropboxVideo[]> {
  try {
    const response = await fetch(`${DROPBOX_API_URL}/files/list_folder`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DROPBOX_CONFIG.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: folderPath,
        recursive: false,
        include_media_info: false,
        include_deleted: false,
        include_has_explicit_shared_members: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Dropbox API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    const videoFiles = data.entries
      .filter((entry: any) => {
        // Filter for video files only
        if (entry['.tag'] !== 'file') return false;
        const name = entry.name.toLowerCase();
        return name.endsWith('.mp4') || name.endsWith('.mov') || name.endsWith('.m4v');
      })
      .map((entry: any) => ({
        id: entry.id,
        name: entry.name,
        path: entry.path_display || entry.path_lower,
      }));

    return videoFiles;
  } catch (error) {
    console.error('Error listing videos from Dropbox:', error);
    throw error;
  }
}

/**
 * Get a temporary streaming link for a video
 * These links expire after 4 hours
 */
export async function getVideoStreamUrl(videoPath: string): Promise<string> {
  try {
    const response = await fetch(`${DROPBOX_API_URL}/files/get_temporary_link`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DROPBOX_CONFIG.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: videoPath,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Dropbox API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.link;
  } catch (error) {
    console.error('Error getting video stream URL:', error);
    throw error;
  }
}

/**
 * Get all videos with their streaming URLs
 */
export async function getVideosWithUrls(folderPath: string): Promise<DropboxVideo[]> {
  try {
    console.log('Listing videos in folder:', folderPath);
    const videos = await listVideosInFolder(folderPath);
    console.log(`Found ${videos.length} videos, getting streaming URLs...`);
    
    // Get streaming URLs for all videos
    const videosWithUrls = await Promise.all(
      videos.map(async (video, index) => {
        try {
          console.log(`[${index + 1}/${videos.length}] Getting URL for:`, video.name);
          const streamUrl = await getVideoStreamUrl(video.path);
          console.log(`✓ Got URL for ${video.name}`);
          return { ...video, streamUrl };
        } catch (error) {
          console.error(`✗ Error getting URL for ${video.name}:`, error);
          return video;
        }
      })
    );

    const successCount = videosWithUrls.filter(v => v.streamUrl).length;
    console.log(`Successfully got ${successCount}/${videos.length} video URLs`);
    return videosWithUrls;
  } catch (error) {
    console.error('Error fetching videos with URLs:', error);
    throw error;
  }
}

/**
 * Parse video metadata from filename
 * Example: M1_01_video1.mp4 -> { module: 1, section: 1, videoNumber: 1 }
 */
export function parseVideoMetadata(filename: string) {
  const match = filename.match(/M(\d+)_(\d+)_(.+)\.mp4$/i);
  
  if (match) {
    return {
      module: parseInt(match[1], 10),
      section: parseInt(match[2], 10),
      description: match[3].replace(/_/g, ' '),
      displayName: filename.replace('.mp4', '').replace(/_/g, ' '),
    };
  }
  
  // Fallback for files that don't match the pattern
  return {
    displayName: filename.replace('.mp4', ''),
  };
}

/**
 * Organize videos by section
 */
export function organizeVideosBySection(videos: DropboxVideo[]) {
  const organized: Record<string, DropboxVideo[]> = {};
  
  videos.forEach((video) => {
    const metadata = parseVideoMetadata(video.name);
    const sectionKey = metadata.section 
      ? `Section ${metadata.section}` 
      : 'Other Videos';
    
    if (!organized[sectionKey]) {
      organized[sectionKey] = [];
    }
    
    organized[sectionKey].push({
      ...video,
      name: metadata.displayName || video.name,
    });
  });
  
  return organized;
}
