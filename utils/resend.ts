import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: "Beemo <contacto@beemo.com.ar>",
  to: ["contacto@beemo.com.ar"],
  subject: "Confirmación de servicio",
  html: "<h1>Servicio confirmado</h1>",
});