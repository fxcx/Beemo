const whatsappPhoneNumber = "5491151446625";
const legalCompanyName = "Beemo S.A.S.";

export const configuracion = {
  nameCompany: "Beemo",
  legalCompanyName,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  seoDescription: "Desarrollo de software a medida, aplicaciones web y móviles, automatización y soluciones de inteligencia artificial para empresas.",
  email: "Contacto@Beemo.com.ar",
  location: "Plar, Buenos Aires, Argentina.",
  allyName: "Beemo AI",
  copyright: `© ${new Date().getFullYear()} ${legalCompanyName}. Todos los derechos reservados.`,
  whatsapp: {
    phoneNumber: whatsappPhoneNumber,
    url: `https://wa.me/${whatsappPhoneNumber}`,
  },
} as const;