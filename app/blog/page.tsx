import type { Metadata } from "next";
import Link from "next/link";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import { Footer } from "@/components/sections/footer";
import { Header } from "@/components/sections/header";
import { blogCategories } from "@/data/blog-posts";
import { blogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Recursos sobre software, IA y soluciones digitales | BEEMO",
  description: "Ideas prácticas para decidir sobre software a medida, desarrollo web, agentes de IA, automatización, integraciones, presencia y marketing digital.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Recursos sobre software y soluciones digitales | BEEMO",
    description: "Guías para tomar mejores decisiones sobre tecnología, procesos y crecimiento digital.",
    type: "website",
    url: "/blog",
  },
  twitter: {
    card: "summary",
    title: "Recursos sobre software y soluciones digitales | BEEMO",
    description: "Guías para tomar mejores decisiones sobre tecnología, procesos y crecimiento digital.",
  },
  robots: { index: true, follow: true },
};

const featuredPost = blogPosts[0];

export default function BlogIndexPage() {
  return (
    <div className="overflow-x-clip bg-surface text-ink">
      <Header homePrefix="/" />
      <main>
        <section className="px-5 pb-14 pt-16 sm:px-8 sm:pb-20 sm:pt-24 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <p className="eyebrow">/ Recursos BEEMO</p>
            <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.6rem,6vw,5rem)] font-semibold leading-[0.98] tracking-[-0.055em]">Ideas útiles para <span className="text-muted">decidir mejor</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">Guías prácticas sobre tecnología, procesos y crecimiento digital. Sin recetas mágicas: contexto para elegir la solución adecuada para tu empresa.</p>
            <nav aria-label="Categorías del blog" className="mt-9 flex flex-wrap gap-x-6 gap-y-3 border-y border-line py-4 text-sm font-semibold">
              {blogCategories.map((category) => <a key={category.slug} href={`#categoria-${category.slug}`} className="text-muted transition hover:text-ink">{category.title}</a>)}
            </nav>
          </div>
        </section>

        <section id={`categoria-${featuredPost.category}`} className="scroll-mt-28 px-5 pb-16 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <p className="eyebrow">/ Artículo destacado</p>
            <div className="mt-5"><BlogPostCard post={featuredPost} featured /></div>
          </div>
        </section>

        <section className="border-t border-line bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="eyebrow">/ Biblioteca</p>
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Explorá por tema</h2>
              </div>
              <Link href="/#presupuesto" className="text-sm font-semibold text-ink transition hover:text-brand-deep">Hablemos de tu proyecto ↗</Link>
            </div>
            <div className="mt-10 grid gap-12">
              {blogCategories.filter((category) => category.slug !== featuredPost.category).map((category) => {
                const categoryPosts = blogPosts.filter((post) => post.category === category.slug);
                if (!categoryPosts.length) return null;
                return (
                  <section key={category.slug} id={`categoria-${category.slug}`} className="scroll-mt-28 border-t border-line pt-8">
                    <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
                      <h3 className="font-display text-2xl font-semibold tracking-[-0.04em]">{category.title}</h3>
                      <p className="max-w-xl text-sm leading-6 text-muted">{category.description}</p>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {categoryPosts.map((post) => <BlogPostCard key={post.slug} post={post} />)}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer homePrefix="/" />
    </div>
  );
}