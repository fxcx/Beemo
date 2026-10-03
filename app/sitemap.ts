import type { MetadataRoute } from "next";
import { blogAuthors, blogPosts } from "@/lib/blog";
import { services } from "@/lib/content";
import { configuracion } from "@/utils/configuracion";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = configuracion.siteUrl;
  return [
    { url: siteUrl, lastModified: new Date() },
    { url: `${siteUrl}/blog`, lastModified: new Date() },
    ...blogAuthors.map((author) => ({ url: `${siteUrl}${author.href}`, lastModified: new Date() })),
    { url: `${siteUrl}/terminos`, lastModified: new Date() },
    { url: `${siteUrl}/privacidad`, lastModified: new Date() },
    ...blogPosts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt ?? post.publishedAt),
    })),
    ...services.filter((service) => service.slug && service.seoTitle).map((service) => ({
      url: `${siteUrl}/servicios/${service.slug}`,
      lastModified: new Date(),
    })),
  ];
}