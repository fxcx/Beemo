# La Plata Systems — Next.js recreation

Recreación funcional de la web pública de La Plata Systems con **Next.js App Router + TypeScript + Tailwind CSS v4**.

La referencia analizada contiene una landing de una sola página con navegación por anclas, tarjetas de servicios con detalle, bloque de empresa, metodología, formulario de presupuesto de 3 pasos, footer y asistente flotante. Esta implementación reproduce esos flujos y los adapta a una arquitectura mantenible de Next.js.

## Stack

- Next.js `16.3.7`
- React `19.3.0`
- TypeScript
- Tailwind CSS `4.3.3`
- App Router
- React Compiler habilitado
- Sin librerías UI obligatorias: iconografía SVG propia para mantener el bundle liviano

Las versiones de Next/React/Tailwind se fijaron después de verificar los paquetes publicados actualmente. Next.js 16.x es la línea vigente y Tailwind CSS 4.3.x es la línea actual. 

## Ejecutar

```bash
pnpm install
pnpm dev
```

Abrí `http://localhost:3000`.

Para producción:

```bash
pnpm build
pnpm start
```

## Funcionalidades incluidas

- Header sticky con navegación desktop/mobile.
- CTA de presupuesto con scroll suave.
- Hero con bloque visual de proceso y métricas.
- Clientes/empresas que confían en la marca.
- Servicios en cards y modal de detalle por servicio.
- Servicio destacado de Agentes de IA.
- Tabs de Nosotros: Nosotros, Misión & Visión, Metodología y Valores.
- Proceso de trabajo en 3 etapas.
- Presupuesto en 3 pasos con validación y resumen.
- Resumen de demostración y opción de cargar otro proyecto. El formulario no envía ni guarda datos.
- Chat flotante “Susy” con respuestas demo y acceso a WhatsApp.
- Footer con navegación y enlaces legales.
- Diseño responsive y mobile-first.

## Assets remotos

Para respetar el diseño de referencia, la imagen del equipo usa un asset público del dominio original (`web.laplatasystems.com.ar`). Su URL está en `data/site-content.json`, dentro de `company.teamImageUrl`.

Para dejar el proyecto independiente, reemplazá esa URL por un asset propio con autorización y alojalo en `public/`.

## Datos del sitio

El contenido público y editable está centralizado en `data/site-content.json`. Servicios, clientes, tabs, proceso, opciones del presupuesto, textos del sitio, contacto y copy de Susy se importan desde `lib/content.ts`, que conserva los tipos y exports usados por los componentes.

Para agregar o cambiar contenido, editá el JSON respetando la estructura existente y los tipos relacionados en `lib/content.ts`. Los cambios se incorporan al compilar/desplegar el sitio. Este archivo es contenido estático versionado; no se usa para guardar solicitudes ni conversaciones durante la ejecución.

## Variables de entorno

En desarrollo podés crear `.env.local` en la raíz:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_URL=https://wa.me/5492210000000
```

En producción, configurá `NEXT_PUBLIC_SITE_URL` con el dominio público real para que metadata, `robots.txt` y sitemap no publiquen URLs locales. Configurá `NEXT_PUBLIC_WHATSAPP_URL` con el enlace válido de WhatsApp; si se omite, el enlace lleva a la sección de contacto.

## Backend del formulario

El formulario y Susy son demostraciones front-end: no se envían ni persisten los datos. El punto de integración del formulario está en `components/sections/quote-form.tsx`. Para recibir solicitudes en producción se debe agregar una Route Handler o Server Action conectada a almacenamiento persistente; no se deben escribir solicitudes en archivos JSON del repo.

Las páginas de términos y privacidad todavía requieren el texto legal oficial aprobado antes de publicarse.
