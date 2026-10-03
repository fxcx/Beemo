import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home({ searchParams }: { searchParams: Promise<{ projectType?: string | string[] }> }) {
  const { projectType } = await searchParams;
  return <LandingPage initialProjectType={typeof projectType === "string" ? projectType : ""} />;
}