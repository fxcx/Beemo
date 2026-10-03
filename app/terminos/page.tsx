import type { Metadata } from "next";
import Link from "next/link";
import { configuracion } from "@/utils/configuracion";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: `Términos y condiciones de ${configuracion.nameCompany}. El texto legal oficial debe ser aprobado antes de publicar.`,
  alternates: { canonical: "/terminos" },
  openGraph: {
    title: `Términos y condiciones | ${configuracion.nameCompany}`,
    description: `Términos y condiciones de ${configuracion.nameCompany}.`,
    type: "website",
    url: "/terminos",
    siteName: configuracion.nameCompany,
  },
  twitter: {
    card: "summary",
    title: `Términos y condiciones | ${configuracion.nameCompany}`,
    description: `Términos y condiciones de ${configuracion.nameCompany}.`,
  },
};

export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-surface px-6 py-20 text-ink">
      <div className="mx-auto max-w-3xl rounded-3xl border border-line bg-white p-8 shadow-soft sm:p-12">
        <p className="eyebrow">{configuracion.nameCompany}</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em]">Términos y condiciones</h1>
        <p className="mt-6 text-muted">
          Página preparada como destino del enlace legal de la web de referencia. Reemplazá este contenido por la versión jurídica oficial antes de publicar en producción.
        </p>
        <Link className="mt-8 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white" href="/">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}