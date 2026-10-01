import { blogAuthors as blogAuthorSources, blogCategories, blogPostSources } from "@/data/blog-posts";
import type { BlogPost, BlogPostSource } from "@/lib/blog-types";

export const blogAuthors = blogAuthorSources.map((author) => ({ ...author, href: `/blog/autores/${author.slug}` }));
export const getBlogAuthor = (slug: string) => blogAuthors.find((author) => author.slug === slug);
export const blogAuthor = blogAuthors[0];

function collectText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(collectText).join(" ");
  if (value && typeof value === "object") return Object.values(value).map(collectText).join(" ");
  return "";
}

function withReadingTime(source: BlogPostSource): BlogPost {
  const wordCount = collectText([source.introduction, source.sections]).trim().split(/\s+/u).filter(Boolean).length;
  return {
    ...source,
    wordCount,
    readingTime: `${Math.max(1, Math.ceil(wordCount / 220))} min de lectura`,
  };
}

export const blogPosts = blogPostSources.map(withReadingTime);
export const getBlogPost = (slug: string) => blogPosts.find((post) => post.slug === slug);
export const getBlogCategory = (slug: string) => blogCategories.find((category) => category.slug === slug);
export const getRelatedPosts = (post: BlogPost) => post.relatedArticles.map(getBlogPost).filter((related): related is BlogPost => Boolean(related));
export const getCategoryForPost = (post: BlogPost) => getBlogCategory(post.category);