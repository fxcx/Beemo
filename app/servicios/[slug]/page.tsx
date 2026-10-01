import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Icon } from "@/components/icons";
import { Footer } from "@/components/sections/footer";
import { Header } from "@/components/sections/header";
import { getServiceBySlug, services } from "@/lib/content";

type Props = {
  params: Promise<{ slug: string }>;
};

function getPublicServices() {
  return services.filter((service) => service.slug && service.seoTitle && service.seoDescription);
}

export function generateStaticParams() {
  return getPublicServices().map((service) => ({ slug: service.slug! }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service?.seoTitle || !service.seoDescription) return {};

  return {
    title: service.seoTitle,
    description: service.seoDescription,
    openGraph: {
      title: service.seoTitle,
      description: service.seoDescription,
      type: "website",
      url: `/servicios/${slug}`,
    },
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service?.slug || !service.seoTitle || !service.seoDescription) notFound();

  const quoteHref = `/?projectType=${encodeURIComponent(service.quoteProjectType ?? service.title)}#presupuesto`;

  return (
    <div className="overflow-x-clip bg-surface text-ink">
      <Header homePrefix="/" />
      <main>
        <section className="px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <Link href="/#servicios" className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-ink"><ArrowLeft size={17} /> Todos los servicios</Link>
            <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,.7fr)] lg:items-start">
              <div className="max-w-3xl">
                <p className="eyebrow">{service.tag}</p>
                <h1 className="mt-4 font-display text-[clamp(2.5rem,6vw,4.8rem)] font-semibold leading-[0.98] tracking-[-0.055em]">{service.title}</h1>
                <p className="mt-7 text-lg leading-8 text-muted">{service.detailIntro ?? service.description}</p>
                <Link href={quoteHref} className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-black">Pedir presupuesto <ArrowRight size={17} /></Link>
              </div>
              <div className="rounded-[1.6rem] border border-line bg-white p-6 shadow-card sm:p-8">
                <span className="grid size-12 place-items-center rounded-2xl bg-surface text-ink"><Icon name={service.icon} size={25} /></span>
                <h2 className="mt-7 font-display text-2xl font-semibold tracking-[-0.04em]">Qué incluye</h2>
                <ul className="mt-5 grid gap-3">
                  {(service.detailBullets ?? service.bullets).map((item) => <li key={item} className="flex items-start gap-3 text-sm leading-6 text-ink-soft"><Check size={17} className="mt-0.5 shrink-0 text-brand-deep" />{item}</li>)}
                </ul>
                {service.note ? <p className="mt-6 border-t border-line pt-5 text-sm leading-6 text-muted">{service.note}</p> : null}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer homePrefix="/" />
    </div>
  );
}