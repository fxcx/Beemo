import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: "TechService <contacto@tudominio.com>",
  to: ["cliente@gmail.com"],
  subject: "Confirmación de servicio",
  html: "<h1>Servicio confirmado</h1>",
});