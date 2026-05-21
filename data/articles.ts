import { CARRAUNTOOHIL_ARTICLE } from "./articles/carrauntoohil";
import { DANNY_LENNON_DIET_ARTICLE } from "./articles/danny-lennon-diet";
import { INNER_CHIMP_ARTICLE } from "./articles/inner-chimp";
import { MINDFUL_EATING_ARTICLE } from "./articles/mindful-eating";
import { PAT_SPILLANE_ARTICLE } from "./articles/pat-spillane";
import { TAIJI_ARTICLE } from "./articles/taiji";
import type { Article } from "./articles/types";

export type { Article, ArticleBlock, ArticlePodcastTrack } from "./articles/types";

export const ARTICLES: Article[] = [
  DANNY_LENNON_DIET_ARTICLE,
  MINDFUL_EATING_ARTICLE,
  CARRAUNTOOHIL_ARTICLE,
  TAIJI_ARTICLE,
  PAT_SPILLANE_ARTICLE,
  INNER_CHIMP_ARTICLE,
];

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}

export function getFeaturedArticle(): Article {
  return ARTICLES.find((article) => article.kind === "podcast") ?? ARTICLES[0];
}

export function getArticleThumbnail(article: Article): string | undefined {
  if (article.thumbnail) return article.thumbnail;
  const imageBlock = article.blocks.find((block) => block.type === "image");
  return imageBlock?.type === "image" ? imageBlock.path : undefined;
}
