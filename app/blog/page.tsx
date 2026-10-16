import type { Metadata } from "next";
import Link from "next/link";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import { Footer } from "@/components/sections/footer";
import { Header } from "@/components/sections/header";
import { blogCategories } from "@/data/blog-posts";
import { blogPosts } from "@/lib/blog";
import { configuracion } from "@/utils/configuracion";

export const metadata: Metadata = {
  title: "Recursos sobre software, IA y soluciones digitales",
  description: "Ideas prácticas para decidir sobre software a medida, desarrollo web, agentes de IA, automatización, integraciones, presencia y marketing digital.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: `Recursos sobre software y soluciones digitales | ${configuracion.nameCompany}`,
    description: "Guías para tomar mejores decisiones sobre tecnología, procesos y crecimiento digital.",
    type: "website",
    url: "/blog",
    siteName: configuracion.nameCompany,
  },
  twitter: {
    card: "summary",
    title: `Recursos sobre software y soluciones digitales | ${configuracion.nameCompany}`,
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
        <section className="px-5 pb-14 pt-12 sm:px-8 sm:pb-16 sm:pt-16 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-5 border-b border-ink pb-7 lg:flex-row lg:items-end lg:justify-between">
              <h1 className="max-w-3xl font-display text-[clamp(2.6rem,5.5vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.035em]"><span className="block">Ideas útiles para</span>decidir mejor</h1>
              <p className="max-w-md pb-1 text-base leading-7 text-muted sm:text-lg">Guías prácticas sobre tecnología, procesos y crecimiento digital. Sin recetas mágicas: contexto para elegir la solución adecuada para tu empresa.</p>
            </div>

            <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,.72fr)] lg:gap-12">
              <div id={`categoria-${featuredPost.category}`} className="scroll-mt-28">
                <BlogPostCard post={featuredPost} featured />
              </div>
              <aside aria-labelledby="blog-topics-title" className="border-t border-line pt-5 lg:border-t-0 lg:pt-1">
                <h2 id="blog-topics-title" className="font-display text-xl font-semibold tracking-[-0.025em]">Explorá por tema</h2>
                <nav aria-label="Categorías del blog" className="mt-4">
                  {blogCategories.map((category) => {
                    const count = blogPosts.filter((post) => post.category === category.slug).length;
                    return (
                      <a
                        key={category.slug}
                        href={`#categoria-${category.slug}`}
                        className="group flex items-baseline justify-between gap-4 border-t border-line py-3 transition-colors hover:text-brand-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-deep"
                      >
                        <span className="text-sm font-semibold">{category.title}</span>
                        <span className="text-xs text-muted transition-colors group-hover:text-brand-deep">{count} {count === 1 ? "artículo" : "artículos"}</span>
                      </a>
                    );
                  })}
                </nav>
              </aside>
            </div>
          </div>
        </section>

        <section className="border-t border-line bg-white px-5 py-14 sm:px-8 sm:py-18 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end justify-between gap-5 border-b border-line pb-6">
              <div>
                <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Todos los temas</h2>
              </div>
              <Link href="/#presupuesto" className="text-sm font-semibold text-ink transition hover:text-brand-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-deep">Hablemos de tu proyecto ↗</Link>
            </div>
            <div className="mt-8 grid gap-11">
              {blogCategories.filter((category) => category.slug !== featuredPost.category).map((category) => {
                const categoryPosts = blogPosts.filter((post) => post.category === category.slug);
                if (!categoryPosts.length) return null;
                return (
                  <section key={category.slug} id={`categoria-${category.slug}`} className="scroll-mt-28 border-t border-line pt-6">
                    <div className="mb-5 grid gap-2 md:grid-cols-[minmax(12rem,.7fr)_minmax(0,1.3fr)] md:items-baseline">
                      <h3 className="font-display text-2xl font-semibold tracking-[-0.025em]">{category.title}</h3>
                      <p className="max-w-2xl text-sm leading-6 text-muted">{category.description}</p>
                    </div>
                    <div className="grid gap-x-7 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
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