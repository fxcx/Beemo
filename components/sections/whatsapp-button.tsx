import { configuracion } from "@/utils/configuracion";

export function WhatsAppButton() {
  return (
    <a
      href={configuracion.whatsapp.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Abrir conversación de WhatsApp con ${configuracion.nameCompany}`}
      className="fixed bottom-5 right-5 z-65 inline-flex min-h-14 max-w-[calc(100vw-2.5rem)] items-center justify-center whitespace-nowrap rounded-full border border-white/20 bg-[#25D366] px-5 text-sm font-bold text-[#064b2e] shadow-xl transition duration-200 hover:-translate-y-0.5 hover:bg-[#20bd5a] active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#064b2e]"
    >
      <span>Hablemos por WhatsApp</span>
    </a>
  );
}
