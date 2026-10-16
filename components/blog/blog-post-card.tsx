import Link from "next/link";
import { ArrowUpRight } from "@/components/genericos/icons";
import { BlogIllustration } from "@/components/blog/blog-illustration";
import { getBlogCategory } from "@/lib/blog";
import type { BlogPost } from "@/lib/blog-types";

export function BlogPostCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  const category = getBlogCategory(post.category);

  return (
    <article className={`group flex h-full flex-col ${featured ? "overflow-hidden rounded-2xl border border-line bg-white lg:grid lg:grid-cols-[minmax(0,.94fr)_minmax(0,1fr)]" : "border-t border-line pt-5"}`}>
      <Link href={`/blog/${post.slug}`} className={`block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-deep ${featured ? "min-h-64 p-3 lg:min-h-full" : ""}`} aria-label={`Leer: ${post.title}`}>
        <BlogIllustration visual={post.visual} compact={!featured} />
      </Link>
      <div className={`flex flex-1 flex-col ${featured ? "p-6 sm:p-8 lg:justify-center lg:p-9" : "pt-4"}`}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold text-muted">
          <span className="font-bold text-brand-deep">{category?.title}</span>
          <time dateTime={post.publishedAt}>{new Date(`${post.publishedAt}T12:00:00`).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}</time>
        </div>
        <h2 className={`mt-4 font-display font-semibold leading-tight tracking-[-0.035em] ${featured ? "text-3xl sm:text-4xl" : "text-xl"}`}>
          <Link href={`/blog/${post.slug}`} className="transition-colors group-hover:text-brand-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-deep">{post.title}</Link>
        </h2>
        <p className={`mt-3 leading-6 text-muted ${featured ? "text-sm sm:text-base" : "text-sm"}`}>{post.description}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="text-xs font-medium text-muted">{post.readingTime}</span>
          <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-brand-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-deep" aria-label={`Leer artículo: ${post.title}`}>
            Leer artículo <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}