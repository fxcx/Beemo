import { WhatsApp } from "@/components/icons";
import { configuracion } from "@/utils/configuracion";
import { chatContent } from "@/lib/content";

export function WhatsAppButton() {
  return (
    <a
      href={configuracion.whatsapp.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Abrir conversación de WhatsApp con La Plata Systems"
      className="fixed bottom-5 right-5 z-[65] inline-flex min-h-14 max-w-[calc(100vw-2.5rem)] items-center gap-2.5 rounded-full bg-[#25D366] px-5 text-sm font-bold text-[#064b2e] shadow-2xl transition hover:bg-[#20bd5a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#064b2e]"
    >
      <WhatsApp size={21} />
      <span>{chatContent.whatsappLabel}</span>
    </a>
  );
}