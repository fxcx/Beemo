"use client";

import { useState } from "react";
import { Send } from "@/components/icons";
import { chatContent } from "@/lib/content";
import { configuracion } from "@/utils/configuracion";

type Message = { from: "bot" | "user"; text: string };

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: chatContent.greeting },
  ]);

  const send = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setMessages((current) => [...current, { from: "user", text: trimmed }, { from: "bot", text: chatContent.response }]);
    setValue("");
  };

  return (
    <>
      {open ? (
        <div className="fixed bottom-5 right-5 z-[70] w-[min(390px,calc(100vw-2rem))] overflow-hidden rounded-[1.8rem] border border-line bg-white shadow-2xl">
          <div className="bg-ink px-5 py-4 text-white">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-full bg-brand font-bold text-ink">S</div>
                <div><p className="text-sm font-semibold">Susy</p><p className="text-xs text-white/45">Asistente de {configuracion.nameCompany}</p></div>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-sm text-white/55 hover:text-white" aria-label="Cerrar asistente">×</button>
            </div>
          </div>
          <div className="max-h-80 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div key={`${message.from}-${index}`} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}>
                <p className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${message.from === "user" ? "bg-ink text-white" : "bg-surface text-ink-soft"}`}>{message.text}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-line p-3">
            <div className="flex gap-2">
              <input value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => event.key === "Enter" && send()} placeholder={chatContent.inputPlaceholder} className="min-w-0 flex-1 rounded-full border border-line px-4 py-2.5 text-sm outline-none focus:border-ink" />
              <button type="button" onClick={send} className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-white" aria-label="Enviar consulta"><Send size={17} /></button>
            </div>
            <a href="#presupuesto" className="mt-3 block text-center text-xs font-semibold text-brand-deep hover:underline" onClick={() => setOpen(false)}>{chatContent.budgetCta}</a>
            <p className="mt-2 text-center text-[10px] leading-4 text-muted">{chatContent.privacyNotice}</p>
          </div>
        </div>
      ) : null}

      <button type="button" onClick={() => setOpen((current) => !current)} className="chat-bounce fixed bottom-5 right-5 z-[65] grid size-16 place-items-center rounded-full border-4 border-white bg-brand text-ink shadow-2xl transition hover:scale-105" aria-label="Abrir asistente Susy">
        <span className="font-display text-xl font-black">S</span>
        <span className="absolute -left-24 top-1/2 hidden -translate-y-1/2 rounded-full bg-ink px-3 py-2 text-xs font-semibold text-white shadow-xl sm:block">¿Tenés alguna duda?</span>
      </button>
    </>
  );
}