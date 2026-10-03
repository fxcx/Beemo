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
        <section className="px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <nav aria-label="Migas de pan" className="flex items-center gap-2 text-sm font-semibold text-muted"><Link href="/" className="hover:text-ink">Inicio</Link><span aria-hidden="true">/</span><Link href="/blog" className="hover:text-ink">Recursos</Link><span aria-hidden="true">/</span><span className="text-ink">Autor</span></nav>
            <p className="eyebrow mt-10">/ Autoría</p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tighter sm:text-5xl">{author.name}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">{author.description}</p>
            <Link href="/blog" className="mt-6 inline-flex text-sm font-semibold text-ink hover:text-brand-deep">Volver a Recursos ↗</Link>
          </div>
        </section>
        <section className="border-t border-line bg-white px-5 py-14 sm:px-8 sm:py-18 lg:px-10">
          <div className="mx-auto max-w-7xl"><h2 className="font-display text-2xl font-semibold tracking-[-0.04em]">Artículos de {author.name}</h2><div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{authoredPosts.map((post) => <BlogPostCard key={post.slug} post={post} />)}</div></div>
        </section>
      </main>
      <Footer homePrefix="/" />
    </div>
  );
}