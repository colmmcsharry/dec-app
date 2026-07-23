import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Article } from "@/data/articles/types";

const WP_SITE = "performancetreanor.wordpress.com";
const WP_POSTS_URL = `https://public-api.wordpress.com/rest/v1.1/sites/${WP_SITE}/posts`;
const CACHE_KEY = "__dd_wordpress_articles_v1";

type WpCategory = { name?: string; slug?: string };

type WpPost = {
  ID: number;
  slug: string;
  title: string;
  date: string;
  modified?: string;
  excerpt?: string;
  content?: string;
  featured_image?: string;
  post_thumbnail?: { URL?: string };
  categories?: Record<string, WpCategory>;
};

type WpPostsResponse = {
  found: number;
  posts: WpPost[];
};

type WordpressArticlesCache = {
  savedAt: number;
  fingerprint: string;
  articles: WordpressArticle[];
};

function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, n: string) =>
      String.fromCharCode(Number(n)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) =>
      String.fromCharCode(parseInt(h, 16)),
    )
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—");
}

function stripHtml(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function firstImageUrl(html: string): string | undefined {
  const matches = html.matchAll(/src=["'](https?:\/\/[^"']+)["']/gi);
  for (const match of matches) {
    const raw = decodeEntities(match[1] ?? "");
    if (!raw) continue;
    // Skip video embeds / non-image sources WP often puts first.
    if (
      /youtube\.com|youtu\.be|vimeo\.com|\/embed\/|\.mp4(\?|$)/i.test(raw)
    ) {
      continue;
    }
    if (
      !/\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i.test(raw) &&
      !/wp-content\/uploads\//i.test(raw)
    ) {
      continue;
    }
    // Prefer a reasonably sized derivative when WP appends huge ?w=3264 params.
    return raw.replace(/([?&])w=\d+/i, "$1w=640").replace(/([?&])h=\d+/i, "$1h=640");
  }
  return undefined;
}

export type WordpressArticle = Article & {
  source: "wordpress";
  htmlContent: string;
};

/** WP copies of Sean / Danny etc. — those live as hardcoded Podcasts, not Articles. */
function isWordpressPodcastPost(post: WpPost): boolean {
  const title = decodeEntities(post.title ?? "");
  const haystack = `${title} ${post.excerpt ?? ""} ${post.content ?? ""} ${post.slug ?? ""}`;
  if (/danny\s*lennon|sean\s*mcgarrity/i.test(haystack)) return true;
  if (/podcast|\.mp3|\.wav|\[audio/i.test(haystack)) return true;
  const cats = Object.values(post.categories ?? {});
  return cats.some((c) => /podcast/i.test(`${c.name ?? ""} ${c.slug ?? ""}`));
}

function mapPost(post: WpPost): WordpressArticle {
  const content = post.content ?? "";
  const thumbnail =
    (post.featured_image && post.featured_image.length > 0
      ? post.featured_image
      : undefined) ??
    post.post_thumbnail?.URL ??
    firstImageUrl(content);

  const excerptRaw = post.excerpt?.trim()
    ? stripHtml(post.excerpt)
    : stripHtml(content).slice(0, 180);

  return {
    source: "wordpress",
    slug: post.slug,
    title: decodeEntities(post.title),
    publishedAt: post.date.slice(0, 10),
    excerpt: excerptRaw,
    kind: "article",
    thumbnail,
    blocks: [],
    htmlContent: content,
  };
}

function articlesFingerprint(articles: WordpressArticle[]): string {
  return articles
    .map((a) => `${a.slug}:${a.publishedAt}:${a.title.length}:${a.htmlContent.length}`)
    .join("|");
}

async function readArticlesCache(): Promise<WordpressArticlesCache | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WordpressArticlesCache;
    if (!Array.isArray(parsed.articles) || typeof parsed.fingerprint !== "string") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function writeArticlesCache(articles: WordpressArticle[]): Promise<string> {
  const fingerprint = articlesFingerprint(articles);
  const payload: WordpressArticlesCache = {
    savedAt: Date.now(),
    fingerprint,
    articles,
  };
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Cache write can fail on low storage — network path still works.
  }
  return fingerprint;
}

async function fetchPostsPage(number = 100): Promise<WpPost[]> {
  const url = `${WP_POSTS_URL}?number=${number}&status=publish`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`WordPress posts failed (${response.status})`);
  }
  const data = (await response.json()) as WpPostsResponse;
  return data.posts ?? [];
}

async function fetchArticlesFromNetwork(): Promise<WordpressArticle[]> {
  const posts = await fetchPostsPage(100);
  return posts.filter((post) => !isWordpressPodcastPost(post)).map(mapPost);
}

/**
 * Force a network fetch and update the on-device cache.
 * Prefer `loadWordpressArticles` for normal screens.
 */
export async function fetchWordpressArticles(): Promise<WordpressArticle[]> {
  const articles = await fetchArticlesFromNetwork();
  await writeArticlesCache(articles);
  return articles;
}

export type LoadWordpressArticlesResult = {
  articles: WordpressArticle[];
  /** True when the returned list came from disk (a background refresh may follow). */
  fromCache: boolean;
};

/**
 * Cache-first load:
 * 1) Return saved articles immediately when present (no spinner wait).
 * 2) Refresh from WordPress in the background; call `onUpdate` only if content changed.
 */
export async function loadWordpressArticles(options?: {
  onUpdate?: (articles: WordpressArticle[]) => void;
}): Promise<LoadWordpressArticlesResult> {
  const cached = await readArticlesCache();

  const refresh = async () => {
    const fresh = await fetchArticlesFromNetwork();
    const nextFingerprint = articlesFingerprint(fresh);
    const changed = !cached || cached.fingerprint !== nextFingerprint;
    if (changed) {
      await writeArticlesCache(fresh);
      options?.onUpdate?.(fresh);
    } else {
      // Touch savedAt so we know we checked recently.
      try {
        await AsyncStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            ...cached,
            savedAt: Date.now(),
          } satisfies WordpressArticlesCache),
        );
      } catch {
        /* ignore */
      }
    }
    return fresh;
  };

  if (cached && cached.articles.length > 0) {
    void refresh().catch(() => {
      // Keep showing cache if offline / request fails.
    });
    return { articles: cached.articles, fromCache: true };
  }

  const articles = await refresh();
  return { articles, fromCache: false };
}

export async function fetchWordpressArticleBySlug(
  slug: string,
): Promise<WordpressArticle | undefined> {
  const cached = await readArticlesCache();
  const fromCache = cached?.articles.find((a) => a.slug === slug);
  if (fromCache?.htmlContent) {
    // Still refresh this slug in the background when possible.
    void (async () => {
      try {
        const url = `${WP_POSTS_URL}/slug:${encodeURIComponent(slug)}`;
        const response = await fetch(url);
        if (!response.ok) return;
        const post = (await response.json()) as WpPost;
        if (!post?.slug || isWordpressPodcastPost(post)) return;
        const mapped = mapPost(post);
        if (!cached) {
          await writeArticlesCache([mapped]);
          return;
        }
        const next = cached.articles.map((a) =>
          a.slug === mapped.slug ? mapped : a,
        );
        if (!next.some((a) => a.slug === mapped.slug)) {
          next.unshift(mapped);
        }
        await writeArticlesCache(next);
      } catch {
        /* ignore */
      }
    })();
    return fromCache;
  }

  const url = `${WP_POSTS_URL}/slug:${encodeURIComponent(slug)}`;
  const response = await fetch(url);
  if (response.status === 404) return undefined;
  if (!response.ok) {
    throw new Error(`WordPress post failed (${response.status})`);
  }
  const post = (await response.json()) as WpPost;
  if (!post?.slug) return undefined;
  if (isWordpressPodcastPost(post)) return undefined;
  const mapped = mapPost(post);

  if (cached) {
    const next = [
      mapped,
      ...cached.articles.filter((a) => a.slug !== mapped.slug),
    ];
    await writeArticlesCache(next);
  } else {
    await writeArticlesCache([mapped]);
  }

  return mapped;
}
