import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import { Footer } from "@/components/sections/footer";
import { Header } from "@/components/sections/header";
import { blogAuthors, blogPosts, getBlogAuthor } from "@/lib/blog";
import { configuracion } from "@/utils/configuracion";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blogAuthors.map((author) => ({ slug: author.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = getBlogAuthor(slug);
  if (!author) return {};

  return {
    title: `${author.name}: autor de recursos sobre soluciones digitales`,
    description: author.description,
    alternates: { canonical: author.href },
    openGraph: { title: `${author.name} | ${configuracion.nameCompany}`, description: author.description, type: "profile", url: author.href, siteName: configuracion.nameCompany },
    twitter: { card: "summary", title: `${author.name} | ${configuracion.nameCompany}`, description: author.description },
    robots: { index: true, follow: true },
  };
}

export default async function BlogAuthorPage({ params }: Props) {
  const { slug } = await params;
  const author = getBlogAuthor(slug);
  if (!author) notFound();

  const siteUrl = configuracion.siteUrl;
  const authorJsonLd = {
    "@context": "https://schema.org",
    "@type": author.type,
    name: author.name,
    description: author.description,
    url: `${siteUrl}${author.href}`,
    ...(author.type === "Person" ? { worksFor: { "@type": "Organization", name: configuracion.nameCompany, url: siteUrl } } : {}),
  };
  const authoredPosts = blogPosts.filter((post) => post.authorSlug === author.slug);

  return (
    <div className="overflow-x-clip bg-surface text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(authorJsonLd).replace(/</g, "\\u003c") }} />
      <Header homePrefix="/" />
      <main>
        <section className="px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <nav aria-label="Migas de pan" className="flex items-center gap-2 text-sm font-medium text-muted"><Link href="/" className="hover:text-ink">Inicio</Link><span aria-hidden="true">/</span><Link href="/blog" className="hover:text-ink">Recursos</Link><span aria-hidden="true">/</span><span className="text-ink">Autor</span></nav>
            <div className="mt-9 grid gap-7 border-b border-ink pb-9 md:grid-cols-[minmax(0,.8fr)_minmax(18rem,1fr)] md:items-end">
              <h1 className="font-display text-[clamp(2.5rem,5vw,4.25rem)] font-semibold leading-[1.04] tracking-[-0.035em]">{author.name}</h1>
              <div>
                <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">{author.description}</p>
                <Link href="/blog" className="mt-5 inline-flex text-sm font-semibold text-ink transition-colors hover:text-brand-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-deep">Volver a Recursos ↗</Link>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-white px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
          <div className="mx-auto max-w-7xl"><h2 className="border-b border-line pb-5 font-display text-2xl font-semibold tracking-[-0.025em]">Artículos de {author.name}</h2><div className="mt-7 grid gap-x-7 gap-y-8 md:grid-cols-2 xl:grid-cols-3">{authoredPosts.map((post) => <BlogPostCard key={post.slug} post={post} />)}</div></div>
        </section>
      </main>
      <Footer homePrefix="/" />
    </div>
  );
}