import { ArrowUpRight, Check, Icon } from "@/components/icons";
import Link from "next/link";
import { serviceCategories, type Service, type ServiceCategory } from "@/lib/content";

export function Services({ onSelect }: { onSelect: (service: Service) => void }) {
  return (
    <section id="servicios" className="bg-surface px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="eyebrow">/ Qué hacemos</p>
          <h2 className="mt-4 font-display text-[clamp(2.3rem,5vw,4.4rem)] font-semibold leading-[0.98] tracking-[-0.055em]">Soluciones digitales, <span className="text-muted">de punta a punta</span></h2>
          <p className="mt-6 text-base leading-7 text-muted sm:text-lg">Desde el relevamiento inicial hasta el desarrollo, implementación y crecimiento digital de tu empresa.</p>
        </div>

        <nav aria-label="Categorías de servicios" className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-y border-line py-4 text-sm font-semibold">
          {serviceCategories.map((category) => <a key={category.id} href={`#${category.id}`} className="text-muted transition hover:text-ink">{category.title}</a>)}
        </nav>

        {serviceCategories.map((category, index) => {
          const visibleServices = category.services.filter((service) => service.visible !== false);
          if (!visibleServices.length) return null;

          return (
            <section key={category.id} id={category.id} className={index === 0 ? "mt-12 scroll-mt-28" : "mt-16 scroll-mt-28 border-t border-line pt-12 sm:mt-20 sm:pt-14"}>
              <div className="max-w-2xl">
                <p className="eyebrow">{category.id === "software" ? "/ Tecnología" : "/ Nuevas oportunidades"}</p>
                <h3 className="mt-3 font-display text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{category.title}</h3>
                <p className="mt-3 text-base leading-7 text-muted">{category.description}</p>
                {category.intro ? <p className="mt-4 text-sm leading-6 text-muted sm:text-base">{category.intro}</p> : null}
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visibleServices.map((service) => (
                  <ServiceCard key={service.id} service={service} category={category} onSelect={onSelect} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function ServiceCard({ service, category, onSelect }: { service: Service; category: ServiceCategory; onSelect: (service: Service) => void }) {
  const className = `service-card group relative block h-full text-left ${service.featured ? "md:col-span-2 xl:col-span-3" : ""}`;
  const content = <ServiceCardContent service={service} showFeatures={category.id === "digital-growth"} />;

  if (category.id === "digital-growth" && service.slug) {
    return <Link href={`/servicios/${service.slug}`} className={className}>{content}</Link>;
  }

  return <button type="button" onClick={() => onSelect(service)} className={`${className} w-full`}>{content}</button>;
}

function ServiceCardContent({ service, showFeatures }: { service: Service; showFeatures: boolean }) {
  return (
    <div className={`h-full rounded-[1.6rem] border p-6 shadow-card ${service.featured ? "border-ink bg-ink text-white sm:p-8" : "border-line bg-white"}`}>
      <div className="flex items-start justify-between gap-6">
        <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${service.featured ? "bg-brand text-ink" : "bg-surface text-ink"}`}>
          <Icon name={service.icon} size={24} />
        </span>
        <span className={`grid size-10 place-items-center rounded-full border transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${service.featured ? "border-white/15 text-white/75" : "border-line text-muted"}`}>
          <ArrowUpRight size={18} />
        </span>
      </div>
      <p className={`mt-8 text-xs font-bold uppercase tracking-[0.14em] ${service.featured ? "text-brand" : "text-brand-deep"}`}>{service.tag}</p>
      <h4 className={`mt-3 font-display text-2xl font-semibold tracking-[-0.035em] ${service.featured ? "sm:text-3xl" : ""}`}>{service.title}</h4>
      <p className={`mt-3 max-w-2xl text-sm leading-6 ${service.featured ? "text-white/65 sm:text-base" : "text-muted"}`}>{service.short}</p>
      {service.featured || showFeatures ? (
        <div className={`mt-7 grid gap-3 ${service.featured ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2"}`}>
          {service.bullets.map((bullet) => <span key={bullet} className={`flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold ${service.featured ? "bg-white/6" : "bg-surface"}`}><Check size={15} className="shrink-0 text-brand-deep" />{bullet}</span>)}
        </div>
      ) : null}
      {service.partnerNote ? <p className="mt-5 text-xs font-semibold text-white/55">{service.partnerNote}</p> : null}
      {showFeatures ? <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink">Ver servicio <ArrowUpRight size={16} /></span> : null}
    </div>
  );
}