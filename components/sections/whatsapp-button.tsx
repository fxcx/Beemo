import { configuracion } from "@/utils/configuracion";

export function WhatsAppButton() {
  return (
    <a
      href={configuracion.whatsapp.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Abrir conversación de WhatsApp con ${configuracion.nameCompany}`}
      className="fixed bottom-5 right-5 z-65 inline-flex min-h-14 max-w-[calc(100vw-2.5rem)] items-center gap-2.5 rounded-full bg-[#25D366] px-5 text-sm font-bold text-[#064b2e] shadow-2xl transition hover:bg-[#20bd5a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#064b2e]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 shrink-0 text-green-500"
        aria-hidden="true"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path
          fill="currentColor"
          stroke="none"
          transform="translate(6.6 4.6) scale(.45)"
          d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
        />
      </svg>
    </a>
  );
}
