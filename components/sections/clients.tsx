import { clients } from "@/lib/content";

export function Clients() {
  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-muted">Empresas que confían en nosotros</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
          {clients.map((client) => (
            <div key={client} className="rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink-soft shadow-sm">
              {client}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}