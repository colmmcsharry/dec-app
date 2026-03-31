import { File, Paths } from 'expo-file-system';
import { getVideosFromFolder, parseVideoMetadata, VimeoVideo } from './vimeo';
import { VIMEO_CONFIG } from '@/config/vimeo.config';

interface CachedVideo {
  id: string;
  title: string;
  url: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
}

interface CacheEntry {
  videos: CachedVideo[];
  timestamp: number;
}

const CACHE_MAX_AGE = 1000 * 60 * 60; // 1 hour

function getCacheFile(slug: string): File {
  return new File(Paths.document, `video_cache_${slug}.json`);
}

function readCache(slug: string): CacheEntry | null {
  try {
    const file = getCacheFile(slug);
    if (!file.exists) return null;
    const data = JSON.parse(file.text()) as CacheEntry;
    return data;
  } catch {
    return null;
  }
}

function writeCache(slug: string, videos: CachedVideo[]): void {
  try {
    const file = getCacheFile(slug);
    file.write(JSON.stringify({ videos, timestamp: Date.now() }));
  } catch {
    // silent fail on cache write
  }
}

function transformVideos(vimeoVideos: VimeoVideo[]): CachedVideo[] {
  return vimeoVideos.map((video) => {
    const metadata = parseVideoMetadata(video.name);
    return {
      id: video.id,
      title: metadata.displayName || video.name,
      url: video.playerEmbedUrl,
      description: video.description || metadata.description,
      thumbnail: video.thumbnail,
      duration: video.duration,
    };
  });
}

export interface LoadResult {
  videos: CachedVideo[];
  fromCache: boolean;
}

export function getCachedVideos(slug: string): CachedVideo[] | null {
  const cache = readCache(slug);
  if (!cache) return null;
  return cache.videos;
}

export async function fetchAndCacheVideos(slug: string): Promise<CachedVideo[]> {
  const folderId = VIMEO_CONFIG.categoryFolders[slug as keyof typeof VIMEO_CONFIG.categoryFolders];
  if (!folderId) return [];

  const vimeoVideos = await getVideosFromFolder(folderId);
  const videos = transformVideos(vimeoVideos);
  writeCache(slug, videos);
  return videos;
}

export function isCacheStale(slug: string): boolean {
  const cache = readCache(slug);
  if (!cache) return true;
  return Date.now() - cache.timestamp > CACHE_MAX_AGE;
}
