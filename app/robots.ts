import type { MetadataRoute } from "next";
import { configuracion } from "@/utils/configuracion";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${configuracion.siteUrl}/sitemap.xml`,
  };
}