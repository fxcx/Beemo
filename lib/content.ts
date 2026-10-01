import siteContent from "@/data/site-content.json";

export type IconName =
  | "strategy"
  | "research"
  | "mobile"
  | "code"
  | "support"
  | "web"
  | "ai"
  | "globe2"
  | "megaphone"
  | "rocket";

export type ServiceCategoryId = "software" | "digital-growth";

export type Service = {
  id: string;
  slug?: string;
  quoteProjectType?: string;
  category: ServiceCategoryId;
  tag: string;
  title: string;
  short: string;
  description: string;
  bullets: string[];
  icon: IconName;
  featured?: boolean;
  visible?: boolean;
  detailIntro?: string;
  detailBullets?: string[];
  note?: string;
  partnerNote?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type ServiceCategory = {
  id: ServiceCategoryId;
  title: string;
  description: string;
  intro?: string;
  services: Service[];
};

const iconNames: IconName[] = ["strategy", "research", "mobile", "code", "support", "web", "ai", "globe2", "megaphone", "rocket"];

function asIconName(value: string): IconName {
  if (!iconNames.includes(value as IconName)) {
    throw new Error(`Icono de servicio desconocido en data/site-content.json: ${value}`);
  }
  return value as IconName;
}

export const serviceCategories: ServiceCategory[] = siteContent.serviceCategories.map((category) => ({
  ...category,
  id: category.id as ServiceCategoryId,
  services: category.services.map((service) => ({
    ...service,
    category: category.id as ServiceCategoryId,
    icon: asIconName(service.icon),
  })),
}));

export const services = serviceCategories.flatMap((category) => category.services).filter((service) => service.visible !== false);
export const getServiceBySlug = (slug: string) => services.find((service) => service.slug === slug);

export const clients: string[] = siteContent.clients;
export const aboutTabs = siteContent.aboutTabs;
export const processSteps = siteContent.processSteps;
export const quoteProjectTypes = siteContent.quoteProjectTypes;
export const quoteDeadlines = siteContent.quoteDeadlines;
export const heroContent = siteContent.hero;
export const companyContent = siteContent.company;
export const contactContent = siteContent.contact;
export const chatContent = siteContent.chat;
export const mainNavigation = siteContent.contact.mainNavigation;
export const quoteContent = siteContent.quote;