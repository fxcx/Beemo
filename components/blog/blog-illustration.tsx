import type { BlogPost } from "@/lib/blog-types";

const visuals: Record<BlogPost["visual"], { label: string; nodes: string[]; connector: string }> = {
  software: { label: "Del negocio a una herramienta propia", nodes: ["Empresa", "Procesos", "Software"], connector: "→" },
  web: { label: "Pilares de una web empresarial", nodes: ["Contenido", "Experiencia", "Rendimiento", "SEO"], connector: "+" },
  ai: { label: "Un agente conectado con límites", nodes: ["Cliente", "Agente IA", "Sistemas"], connector: "→" },
  automation: { label: "Flujo de automatización", nodes: ["Entrada", "Workflow", "Resultado"], connector: "→" },
  integrations: { label: "Herramientas que intercambian datos", nodes: ["CRM", "API", "ERP", "Reporte"], connector: "↔" },
  presence: { label: "Ecosistema mínimo de presencia digital", nodes: ["Web", "Google", "WhatsApp", "Redes", "SEO"], connector: "+" },
  marketing: { label: "Del mensaje a una oportunidad", nodes: ["Contenido", "Meta Ads", "Consulta"], connector: "→" },
};

export function BlogIllustration({ visual, compact = false }: { visual: BlogPost["visual"]; compact?: boolean }) {
  const diagram = visuals[visual];

  return (
    <div
      role="img"
      aria-label={diagram.label}
      className={`noise relative isolate flex w-full items-center justify-center overflow-hidden rounded-2xl border border-line bg-white ${compact ? "min-h-36 p-4" : "min-h-56 p-6 sm:min-h-72 sm:p-10"}`}
    >
      <div className="absolute inset-0 -z-10 opacity-60" style={{ backgroundImage: "radial-gradient(#dbe3df 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
      <div className={`relative flex max-w-full flex-wrap items-center justify-center ${compact ? "gap-2" : "gap-3 sm:gap-5"}`}>
        {diagram.nodes.map((node, index) => (
          <div key={node} className="contents">
            <span className={`grid min-h-12 place-items-center rounded-xl border border-line bg-white px-3 text-center font-semibold text-ink shadow-card ${compact ? "min-w-16 text-xs" : "min-w-20 px-4 py-3 text-sm sm:min-w-24 sm:text-base"} ${index === 1 ? "border-brand/50 bg-brand-soft" : ""}`}>
              {node}
            </span>
            {index < diagram.nodes.length - 1 ? <span aria-hidden="true" className={`font-bold text-brand-deep ${compact ? "text-sm" : "text-lg sm:text-xl"}`}>{diagram.connector}</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}