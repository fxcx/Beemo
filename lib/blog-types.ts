export type BlogCategory = {
  slug: string;
  title: string;
  description: string;
};

export type BlogAuthor = {
  slug: string;
  name: string;
  description: string;
  type: "Person" | "Organization";
};

export type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "links"; lead: string; items: { label: string; href: string }[] }
  | { type: "list"; title?: string; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "callout"; title: string; body: string }
  | { type: "formula"; items: string[] }
  | { type: "diagram"; title: string; items: string[] }
  | { type: "faq"; items: { question: string; answer: string }[] };

export type BlogSection = {
  id: string;
  heading: string;
  blocks: BlogBlock[];
};

export type BlogPostSource = {
  slug: string;
  title: string;
  description: string;
  introduction: string;
  category: string;
  author: string;
  authorSlug: string;
  publishedAt: string;
  updatedAt?: string;
  featuredImage?: string;
  visual: "software" | "web" | "ai" | "automation" | "integrations" | "presence" | "marketing";
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  relatedService: { title: string; href: string };
  ctaTitle: string;
  ctaLabel: string;
  ctaHref: string;
  sections: BlogSection[];
  relatedArticles: string[];
};

export type BlogPost = BlogPostSource & {
  readingTime: string;
  wordCount: number;
};