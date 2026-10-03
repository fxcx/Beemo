import type { MetadataRoute } from "next";
import { configuracion } from "@/utils/configuracion";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: configuracion.nameCompany,
    short_name: configuracion.nameCompany,
    description: configuracion.seoDescription,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f4f7f6",
    theme_color: "#19d58d",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}