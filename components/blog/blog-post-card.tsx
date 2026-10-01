import Link from "next/link";
import { ArrowUpRight } from "@/components/icons";
import { BlogIllustration } from "@/components/blog/blog-illustration";
import { getBlogCategory } from "@/lib/blog";
import type { BlogPost } from "@/lib/blog-types";

export function BlogPostCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  const category = getBlogCategory(post.category);

  return (
    <article className={`service-card group h-full overflow-hidden rounded-[1.6rem] border border-line bg-white shadow-card ${featured ? "grid lg:grid-cols-2" : ""}`}>
      <Link href={`/blog/${post.slug}`} className={`block ${featured ? "min-h-64 lg:min-h-full" : "p-4 pb-0"}`} aria-label={`Leer: ${post.title}`}>
        <BlogIllustration visual={post.visual} compact={!featured} />
      </Link>
      <div className={`flex flex-col p-6 ${featured ? "sm:p-8 lg:p-10" : ""}`}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-bold uppercase tracking-[0.12em] text-brand-deep">
          <span>{category?.title}</span>
          <span className="size-1 rounded-full bg-line" aria-hidden="true" />
          <time dateTime={post.publishedAt}>{new Date(`${post.publishedAt}T12:00:00`).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}</time>
        </div>
        <h2 className={`mt-4 font-display font-semibold leading-tight tracking-[-0.035em] ${featured ? "text-3xl sm:text-4xl" : "text-xl"}`}>
          <Link href={`/blog/${post.slug}`} className="transition group-hover:text-brand-deep">{post.title}</Link>
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">{post.description}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <span className="text-xs font-medium text-muted">{post.readingTime}</span>
          <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-ink" aria-label={`Leer artículo: ${post.title}`}>
            Leer artículo <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}