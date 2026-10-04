import type { Metadata, Viewport } from "next";
import { configuracion } from "@/utils/configuracion";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(configuracion.siteUrl),
  title: {
    default: `${configuracion.nameCompany} | Software a medida para empresas`,
    template: `%s | ${configuracion.nameCompany}`,
  },
  description: configuracion.seoDescription,
  applicationName: configuracion.nameCompany,
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    siteName: configuracion.nameCompany,
    title: `${configuracion.nameCompany} | Software a medida para empresas`,
    description: configuracion.seoDescription,
  },
  twitter: {
    card: "summary",
    title: `${configuracion.nameCompany} | Software a medida para empresas`,
    description: configuracion.seoDescription,
  },
  robots: { index: true, follow: true },
  verification: {
    other: {
      "facebook-domain-verification": "oy1bz6nj585fayzmrzyr2xo2lt0zxg",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
  themeColor: "#19d58d",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}