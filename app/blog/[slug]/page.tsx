import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogIllustration } from "@/components/blog/blog-illustration";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import { BlogRichContent } from "@/components/blog/blog-rich-content";
import { Footer } from "@/components/sections/footer";
import { Header } from "@/components/sections/header";
import { blogAuthor, blogPosts, getBlogAuthor, getBlogCategory, getBlogPost, getRelatedPosts } from "@/lib/blog";
import { configuracion } from "@/utils/configuracion";

type Props = { params: Promise<{ slug: string }> };

function articleUrl(slug: string) {
  return new URL(`/blog/${slug}`, configuracion.siteUrl).toString();
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  const canonical = `/blog/${post.slug}`;
  const brandedTitle = `${post.seoTitle} | ${configuracion.nameCompany}`;
  return {
    title: post.seoTitle,
    description: post.seoDescription,
    alternates: { canonical },
    openGraph: {
      title: brandedTitle,
      description: post.seoDescription,
      type: "article",
      url: canonical,
      siteName: configuracion.nameCompany,
      publishedTime: `${post.publishedAt}T00:00:00-03:00`,
      modifiedTime: `${post.updatedAt ?? post.publishedAt}T00:00:00-03:00`,
      authors: [blogAuthor.name],
      ...(post.featuredImage ? { images: [post.featuredImage] } : {}),
    },
    twitter: {
      card: post.featuredImage ? "summary_large_image" : "summary",
      title: brandedTitle,
      description: post.seoDescription,
      ...(post.featuredImage ? { images: [post.featuredImage] } : {}),
    },
    robots: { index: true, follow: true },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const category = getBlogCategory(post.category);
  const author = getBlogAuthor(post.authorSlug) ?? blogAuthor;
  const relatedPosts = getRelatedPosts(post).slice(0, 3);
  const canonicalUrl = articleUrl(post.slug);
  const breadcrumbItems = [
    { name: "Inicio", url: `${configuracion.siteUrl}/` },
    { name: "Recursos", url: `${configuracion.siteUrl}/blog` },
    { name: category?.title ?? "Blog", url: `${configuracion.siteUrl}/blog#categoria-${post.category}` },
    { name: post.title, url: canonicalUrl },
  ];
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.seoDescription,
      datePublished: `${post.publishedAt}T00:00:00-03:00`,
      dateModified: `${post.updatedAt ?? post.publishedAt}T00:00:00-03:00`,
      author: { "@type": author.type, name: author.name, url: `${configuracion.siteUrl}${author.href}` },
      publisher: { "@type": "Organization", name: configuracion.nameCompany, url: configuracion.siteUrl },
      mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
      articleSection: category?.title,
      keywords: post.keywords.join(", "),
      ...(post.featuredImage ? { image: [new URL(post.featuredImage, configuracion.siteUrl).toString()] } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    },
  ];

  return (
    <div className="overflow-x-clip bg-surface text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Header homePrefix="/" />
      <main>
        <article>
          <header className="px-5 pb-12 pt-12 sm:px-8 sm:pb-16 sm:pt-20 lg:px-10">
            <div className="mx-auto max-w-7xl">
              <nav aria-label="Migas de pan" className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted sm:text-sm">
                <Link href="/" className="hover:text-ink">Inicio</Link><span aria-hidden="true">/</span>
                <Link href="/blog" className="hover:text-ink">Recursos</Link><span aria-hidden="true">/</span>
                <Link href={`/blog#categoria-${post.category}`} className="hover:text-ink">{category?.title}</Link>
              </nav>
              <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,.75fr)] lg:items-center">
                <div className="max-w-3xl">
                  <p className="eyebrow">{category?.title}</p>
                  <h1 className="mt-4 font-display text-[clamp(2.4rem,5.7vw,4.8rem)] font-semibold leading-[1.02] tracking-[-0.055em]">{post.title}</h1>
                  <p className="mt-5 text-lg leading-8 text-muted">{post.description}</p>
                  <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted">
                    <Link href={author.href} className="font-semibold text-ink hover:text-brand-deep">{author.name}</Link>
                    <time dateTime={post.publishedAt}>{new Date(`${post.publishedAt}T12:00:00`).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}</time>
                    <span>{post.readingTime}</span>
                  </div>
                </div>
                <BlogIllustration visual={post.visual} />
              </div>
            </div>
          </header>

          <div className="border-t border-line bg-white px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
              <aside className="lg:sticky lg:top-28 lg:self-start">
                <details className="rounded-2xl border border-line bg-surface p-4 lg:hidden">
                  <summary className="cursor-pointer text-sm font-semibold">En este artículo</summary>
                  <TableOfContents sections={post.sections} />
                </details>
                <div className="hidden lg:block">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">En este artículo</p>
                  <TableOfContents sections={post.sections} />
                </div>
              </aside>

              <div className="min-w-0 max-w-3xl">
                <p className="text-lg leading-8 text-ink-soft">{post.introduction}</p>
                <div className="mt-10 grid gap-11">
                  {post.sections.map((section) => (
                    <section key={section.id} id={section.id} className="scroll-mt-28">
                      <h2 className="font-display text-2xl font-semibold leading-tight tracking-[-0.04em] sm:text-3xl">{section.heading}</h2>
                      <div className="mt-5 grid gap-5"><BlogRichContent blocks={section.blocks} /></div>
                    </section>
                  ))}
                </div>

                <div className="mt-12 flex flex-wrap gap-2 border-t border-line pt-6">
                  {post.tags.map((tag) => <span key={tag} className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted">{tag}</span>)}
                </div>

                <aside className="mt-12 rounded-[1.6rem] bg-ink p-6 text-white sm:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">/ Siguiente paso</p>
                  <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">{post.ctaTitle}</h2>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href={post.ctaHref} className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5">{post.ctaLabel} <span aria-hidden="true" className="ml-2">↗</span></Link>
                    <Link href={post.relatedService.href} className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-white">Conocer {post.relatedService.title}</Link>
                  </div>
                </aside>

                <div className="mt-10 rounded-2xl border border-line p-5 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Sobre el autor</p>
                  <Link href={author.href} className="mt-2 inline-block font-display text-xl font-semibold hover:text-brand-deep">{author.name}</Link>
                  <p className="mt-2 text-sm leading-6 text-muted">{author.description}</p>
                </div>
              </div>
            </div>
          </div>
        </article>

        {relatedPosts.length ? <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10"><div className="mx-auto max-w-7xl"><p className="eyebrow">/ Seguí explorando</p><h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.045em]">Artículos relacionados</h2><div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{relatedPosts.map((related) => <BlogPostCard key={related.slug} post={related} />)}</div></div></section> : null}
      </main>
      <Footer homePrefix="/" />
    </div>
  );
}

function TableOfContents({ sections }: { sections: { id: string; heading: string }[] }) {
  return <nav aria-label="Contenido del artículo" className="mt-3 grid gap-2 border-l border-line pl-3 text-sm text-muted">{sections.map((section) => <a key={section.id} href={`#${section.id}`} className="leading-5 transition hover:text-ink">{section.heading}</a>)}</nav>;
}