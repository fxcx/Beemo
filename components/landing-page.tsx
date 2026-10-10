"use client";

import { AboutSection } from "@/components/sections/about-section";
import { Footer } from "@/components/sections/footer";
import { Header } from "@/components/sections/header";
import { Hero } from "@/components/sections/hero";
import { Clients } from "@/components/sections/clients";
import { Process } from "@/components/sections/process";
import { QuoteForm } from "@/components/sections/quote-form";
import { Services } from "@/components/sections/services";
import { WhatsAppButton } from "@/components/sections/whatsapp-button";

export function LandingPage({ initialProjectType = "" }: { initialProjectType?: string }) {
  return (
    <div className="overflow-x-clip bg-surface text-ink">
      <Header />
      <main>
        <Hero />
        <Clients />
        <Services />
        <AboutSection />
        <Process />
        <QuoteForm initialProjectType={initialProjectType} />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}