import type { Article } from "@/data/articles/types";

const WP_SITE = "performancetreanor.wordpress.com";
const WP_POSTS_URL = `https://public-api.wordpress.com/rest/v1.1/sites/${WP_SITE}/posts`;

type WpCategory = { name?: string; slug?: string };

type WpPost = {
  ID: number;
  slug: string;
  title: string;
  date: string;
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

function isPodcastPost(post: WpPost): boolean {
  const haystack = `${post.title} ${post.excerpt ?? ""} ${post.content ?? ""}`;
  if (/podcast|\.mp3|\[audio/i.test(haystack)) return true;
  const cats = Object.values(post.categories ?? {});
  return cats.some((c) => /podcast/i.test(`${c.name ?? ""} ${c.slug ?? ""}`));
}

export type WordpressArticle = Article & {
  source: "wordpress";
  htmlContent: string;
};

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
    kind: isPodcastPost(post) ? "podcast" : "article",
    thumbnail,
    blocks: [],
    htmlContent: content,
  };
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

/** All published posts from Declan's WordPress.com site. */
export async function fetchWordpressArticles(): Promise<WordpressArticle[]> {
  const posts = await fetchPostsPage(100);
  return posts.map(mapPost);
}

export async function fetchWordpressArticleBySlug(
  slug: string,
): Promise<WordpressArticle | undefined> {
  const url = `${WP_POSTS_URL}/slug:${encodeURIComponent(slug)}`;
  const response = await fetch(url);
  if (response.status === 404) return undefined;
  if (!response.ok) {
    throw new Error(`WordPress post failed (${response.status})`);
  }
  const post = (await response.json()) as WpPost;
  if (!post?.slug) return undefined;
  return mapPost(post);
}
