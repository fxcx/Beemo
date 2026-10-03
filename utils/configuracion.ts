const whatsappPhoneNumber = "5491151446625";
const legalCompanyName = "Beemo S.A.S.";

export const configuracion = {
  nameCompany: "Beemo",
  legalCompanyName : legalCompanyName,
  email: "Contacto@Beemo.com.ar",
  location: "Plar, Buenos Aires, Argentina.",
  allyName: "Beemo AI",
  copyright: `© ${new Date().getFullYear()} ${legalCompanyName}. Todos los derechos reservados.`,
  whatsapp: {
    phoneNumber: whatsappPhoneNumber,
    url: `https://wa.me/${whatsappPhoneNumber}`,
  },
} as const;