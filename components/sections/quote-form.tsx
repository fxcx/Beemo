"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "@/components/icons";
import { quoteContent, quoteDeadlines, quoteProjectTypes } from "@/lib/content";

type FormState = {
  projectType: string;
  description: string;
  deadline: string;
  name: string;
  email: string;
  company: string;
  phone: string;
};

const initialState: FormState = { projectType: "", description: "", deadline: "", name: "", email: "", company: "", phone: "" };

const steps = ["Proyecto", "Alcance", "Contacto"];

export function QuoteForm({ initialProjectType }: { initialProjectType?: string }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(() => ({ ...initialState, projectType: initialProjectType ?? "" }));
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));

  const canContinue = useMemo(() => {
    if (step === 1) return form.projectType.trim().length > 0;
    if (step === 2) return form.description.trim().length >= 12 && form.deadline.trim().length > 0;
    return form.name.trim().length > 1 && /^\S+@\S+\.\S+$/.test(form.email);
  }, [step, form]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (step < 3) {
      if (!canContinue) {
        setError(step === 1 ? "Elegí un tipo de proyecto para continuar." : "Completá la descripción y el plazo para continuar.");
        return;
      }
      setStep((current) => current + 1);
      return;
    }
    if (!canContinue) {
      setError("Completá tu nombre y un email válido.");
      return;
    }
    setSubmitted(true);
  };

  const reset = () => {
    setForm(initialState);
    setStep(1);
    setSubmitted(false);
    setError("");
  };

  return (
    <section id="presupuesto" className="border-t border-line bg-surface px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">/ Pedí tu presupuesto</p>
          <h2 className="mt-4 font-display text-[clamp(2.3rem,5vw,4.4rem)] font-semibold leading-[0.98] tracking-[-0.055em]">{quoteContent.title}</h2>
          <p className="mt-5 text-base leading-7 text-muted sm:text-lg">{quoteContent.description}</p>
        </div>

        <div className="mt-12 rounded-[2rem] border border-line bg-white p-5 shadow-soft sm:p-8">
          {submitted ? (
            <div className="grid min-h-96 place-items-center text-center">
              <div className="max-w-lg">
                <div className="mx-auto grid size-16 place-items-center rounded-full bg-brand-soft text-2xl text-brand-deep">✓</div>
                <h3 className="mt-6 font-display text-3xl font-semibold tracking-[-0.04em]">Resumen listo</h3>
                <p className="mt-4 text-base leading-7 text-muted">Esta es una demostración: tus datos no se envían ni se guardan. Completaste el resumen de {form.projectType.toLowerCase()} y volverías al inicio con {form.name} como contacto.</p>
                <button type="button" onClick={reset} className="mt-8 rounded-full border border-line px-5 py-3 text-sm font-semibold text-ink transition hover:border-ink">Cargar otro proyecto</button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted">Paso {step} de 3</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{steps[step - 1]}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:w-64">
                  {steps.map((label, index) => (
                    <div key={label} className="space-y-2">
                      <div className={`h-1 rounded-full ${index < step ? "bg-brand" : "bg-line"}`} />
                      <p className={`text-[10px] font-bold uppercase tracking-[0.08em] ${index < step ? "text-ink" : "text-muted"}`}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="py-8">
                {step === 1 ? (
                  <div>
                    <h3 className="font-display text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">¿Qué tipo de proyecto tenés en mente?</h3>
                    <p className="mt-2 text-sm text-muted">Elegí la opción que mejor se acerque.</p>
                    <div className="mt-7 grid gap-3 sm:grid-cols-2">
                      {quoteProjectTypes.map((option) => (
                        <button key={option.label} type="button" aria-pressed={form.projectType === option.label} onClick={() => setField("projectType", option.label)} className={`rounded-2xl border p-4 text-left transition ${form.projectType === option.label ? "border-ink bg-ink text-white" : "border-line bg-white hover:-translate-y-0.5 hover:border-ink"}`}>
                          <span className="block text-sm font-semibold">{option.label}</span>
                          <span className={`mt-1 block text-xs leading-5 ${form.projectType === option.label ? "text-white/60" : "text-muted"}`}>{option.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {step === 2 ? (
                  <div>
                    <h3 className="font-display text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Contanos el alcance</h3>
                    <p className="mt-2 text-sm text-muted">Cuanto más nos cuentes, mejor la propuesta.</p>
                    <div className="mt-7 grid gap-5">
                      <label className="grid gap-2 text-sm font-semibold">Descripción del proyecto <span className="text-brand-deep">*</span>
                        <textarea value={form.description} onChange={(event) => setField("description", event.target.value)} rows={7} placeholder="Contanos un poco sobre el proyecto." className="rounded-2xl border border-line px-4 py-3 text-sm font-normal outline-none placeholder:text-muted/60 focus:border-ink focus:ring-4 focus:ring-brand/15" />
                      </label>
                      <label className="grid gap-2 text-sm font-semibold">¿Para cuándo lo necesitás? <span className="text-brand-deep">*</span>
                        <select value={form.deadline} onChange={(event) => setField("deadline", event.target.value)} className="rounded-2xl border border-line bg-white px-4 py-3 text-sm font-normal outline-none focus:border-ink focus:ring-4 focus:ring-brand/15">
                          <option value="">Seleccionar plazo</option>
                          {quoteDeadlines.map((deadline) => <option key={deadline} value={deadline}>{deadline}</option>)}
                        </select>
                      </label>
                    </div>
                  </div>
                ) : null}

                {step === 3 ? (
                  <div>
                    <h3 className="font-display text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">¿Cómo te contactamos?</h3>
                    <p className="mt-2 text-sm text-muted">Dejanos tus datos y te respondemos a la brevedad.</p>
                    <div className="mt-7 grid gap-5 sm:grid-cols-2">
                      <Field label="Nombre y apellido" required value={form.name} onChange={(value) => setField("name", value)} placeholder="Tu nombre" error={Boolean(error) && form.name.trim().length <= 1} />
                      <Field label="Email" required type="email" value={form.email} onChange={(value) => setField("email", value)} placeholder="tu@email.com" error={Boolean(form.email) && !/^\S+@\S+\.\S+$/.test(form.email)} />
                      <Field label="Empresa" value={form.company} onChange={(value) => setField("company", value)} placeholder="Opcional" />
                      <Field label="Teléfono" value={form.phone} onChange={(value) => setField("phone", value)} placeholder="Opcional" />
                      <div className="sm:col-span-2 rounded-2xl border border-line bg-surface p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Resumen</p>
                        <div className="mt-3 grid gap-1 text-sm"><p>Proyecto: <span className="font-semibold">{form.projectType}</span></p><p>Plazo: <span className="font-semibold">{form.deadline}</span></p></div>
                      </div>
                    </div>
                  </div>
                ) : null}
                {error ? <p className="mt-5 text-sm font-semibold text-rose-600">{error}</p> : null}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-between">
                <button type="button" disabled={step === 1} onClick={() => { setError(""); setStep((current) => Math.max(1, current - 1)); }} className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-muted transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft size={17} /> Atrás</button>
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-black">
                  {step === 3 ? "Finalizar demo" : "Continuar"} <ArrowRight size={17} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", required = false, error = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string; required?: boolean; error?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-semibold">{label} {required ? <span className="text-brand-deep">*</span> : null}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`rounded-2xl border px-4 py-3 text-sm font-normal outline-none placeholder:text-muted/60 focus:border-ink focus:ring-4 focus:ring-brand/15 ${error ? "border-rose-400" : "border-line"}`} />
      {error ? <span className="text-xs font-normal text-rose-600">{type === "email" ? "Ingresá un email válido." : "Necesitamos tu nombre."}</span> : null}
    </label>
  );
}