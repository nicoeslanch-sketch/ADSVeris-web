# Acuses del formulario y folletos originales

Migración a Resend preparada el 22/10/2026 por petición del propietario. Las comprobaciones históricas de SendGrid al final de este documento no describen el proveedor actual. La recepción real se documenta por separado de las pruebas automatizadas.

## Flujo

`api/submit-kommo.js` conserva el alta y enrutamiento en Kommo. Solo después de validar contacto principal, nota de consentimiento, etiqueta y etapa, invoca el acuse del servicio seleccionado. El webhook antiguo de Contactado y los endpoints de contraseña permanecen deshabilitados para evitar dos remitentes o un relay público. El sitio no necesita reactivar cuentas públicas ni el Supabase Auth pausado para registrar solicitudes o preparar los acuses.

Las cuatro respuestas recuperan el contenido de las plantillas actuales de Kommo, con tablas adaptables para email, colores ADS Veris, nombre escapado, enlaces del servicio, WhatsApp `+56 9 8389 4129`, correo de respuesta corporativo e identificación legal. Se conserva un texto alternativo sin HTML. No se insertan en el mensaje la descripción libre ni el teléfono del solicitante. Aperturas y clics no se rastrean. No se envían comunicaciones a contactos antiguos ni se activan difusiones.

## PDFs preservados

| Servicio / plantilla Kommo | Adjunto | SHA-256 |
|---|---|---|
| Planillas / Plantilla personalizada | ADS_Veris_Planillas_Excel.pdf | 50bb0708616f34d578b395e2df259d77840318f6e3525dcb7aa7678d09b10d6a |
| WordPress / Pagina web | ADS_Veris_Paginas_Web.pdf | 47625218867a1256a9310688f09b706df0030793a61c93d4d04687bd0a938d25 |
| Procesos / Procesos | ADS_Veris_Procesos.pdf | 2f2b11e9a924f5d38398585467c1ef5b85ea57bcc4865f08503fec2fec0b1f23 |
| Plataforma / Plataforma de datos | Sin PDF existente; solo acuse | — |

Los tres originales de dos páginas permanecen en `pdfs/`, sin cambios. Antes de adjuntar se comprueba su firma y hash; un archivo faltante o modificado bloquea ese correo, no el registro del cliente. Vercel los incluye expresamente en la función, no en el sitio estático. El email aclara que el folleto es material comercial previo y que sus precios/promociones no son una oferta vigente; la cotización se confirma antes de contratar. Esto permite conservar los originales sin presentar el folleto web antiguo como el plan WordPress actual.

## Activación controlada, sin compras

- `CONTACT_EMAIL_MODE=off`: no llama a Resend. Es el valor predeterminado.
- `check`: comprueba únicamente la configuración local y que el PDF del servicio esté empaquetado. No contacta a Resend, no acredita validez de la clave, remitente o cuota y nunca envía mensajes. Los registros técnicos solo incluyen IDs, códigos HTTP y estados, no claves ni direcciones personales. Una clave Sending restringida no necesita acceso de lectura a la cuenta.
- `test`: requiere `RESEND_API_KEY`, `CONTACT_EMAIL_BUDGET_APPROVED=true`, `CONTACT_EMAIL_SENDER_VERIFIED=true`, `CONTACT_EMAIL_TRACKING_DISABLED=true`, remitente `CONTACT_EMAIL_FROM` del dominio adsveris.com y destinatario en `CONTACT_EMAIL_TEST_TO`. Las banderas deben reflejar una comprobación real en el panel, no suponerla. No crear otra cuenta, prueba ni plan.
- `live`: requiere la misma aprobación de presupuesto y verificación previa de cuota sin cargos adicionales. Antes de habilitarlo para todo el público, revisar también límites de abuso globales en el alojamiento/proveedor; el origen permitido y el honeypot no sustituyen un control distribuido de bots.

Una clave guardada no acredita cuota disponible ni ausencia de sobrecostos. Si no puede verificarse la facturación o la cuenta pide login, no activar `test`/`live`. El remitente y Reply-To son `servicios@adsveris.com`, con nombre ADS Veris. No inventar una identidad de remitente ni cambiar permisos de una clave sin aprobación específica. Usar una clave independiente Sending limitada a adsveris.com, guardada como secreto de producción en Vercel, nunca como VITE_ ni en el repositorio. No se modifican las dos claves de la otra plataforma. Al cambiar dominio, rastreo o plan, volver a revisar las banderas de verificación.

Solo un HTTP 200/201 de Resend con un ID de envío UUID válido se considera aceptado: no significa entrega, lectura ni ausencia de spam. Se escribe estado y referencia del proveedor en la ficha con marcador ADSVERIS_EMAIL_V2. Los fallos, agotamiento de cuota y respuestas inciertas conservan el lead y muestran confirmación de correo pendiente; no se reintenta ni se pide reenviar el formulario. La clave Idempotency-Key `adsveris-contact-v2/<leadId>` evita repetir el mismo acuse dentro de la ventana de 24 horas de Resend; no sustituye una cola ni deduplicación permanente. No hay cola duradera ni reenvío retroactivo. El equipo puede responder manualmente desde Kommo cuando el acuse está pendiente.

La llamada es HTTPS desde el servidor a `api.resend.com/emails`, sin nuevo SDK ni cambios a CSP. Los adjuntos se envían en base64 desde archivos locales verificados, nunca desde una URL aportada por el visitante. No se llaman endpoints Audience, Broadcasts ni Contacts. El rastreo de aperturas y enlaces se controla a nivel del dominio Resend y debe permanecer desactivado: no se utilizan opciones de SendGrid que Resend no admite. No se reactiva Supabase Auth ni el acceso público a cuentas para este flujo.

Comprobación del panel Resend el 22/10/2026: adsveris.com Verified, cuenta nicoeslanch, plan Transactional Free, consumo mostrado 0/3.000 mensual y 0/100 diario, Pay-as-you-go desactivado y no disponible en ese plan. No se activaron Forge, dominios de rastreo, extras ni upgrades. Los límites se comparten con otros usos de la misma cuenta. Si la cuota se agota, el acuse queda pendiente en Kommo; no se compra cuota ni se intenta un proveedor alternativo. El formulario mantiene origen permitido, tamaño limitado, honeypot y ninguna ruta pública independiente de envío; esto no equivale a protección global contra bots.

Pruebas automatizadas de la migración: 49 aprobadas, incluyendo contrato Resend, destinatario único, conservación exacta de adjuntos, gates de presupuesto/remitente, idempotencia, ausencia de envío tras un fallo del CRM, cuota/timeout y validación estricta del ID de respuesta. La compilación de producción pasó. Estas pruebas no acreditan recepción de correo real.

Referencias primarias: [Enviar email](https://resend.com/docs/api-reference/emails/send-email), [Adjuntos](https://resend.com/docs/dashboard/emails/attachments), [Idempotencia](https://resend.com/docs/dashboard/emails/idempotency-keys), [Rastreo por dominio](https://resend.com/docs/dashboard/domains/tracking).

Vista previa local sin envíos: `node scripts/preview-contact-emails.mjs`, rutas `http://127.0.0.1:4174/{planilla,web,procesos,plataforma}` y `/mobile/web`. No es un endpoint de producción ni usa credenciales.

## Estado externo observado

- Supabase `ADSVeris-web`: INACTIVE; no se restauró ni modificó el proyecto. Los correos Auth no son un servicio general de folletos con adjuntos.
- SendGrid: el navegador muestra login; no hay una sesión disponible para comprobar facturación. El diagnóstico real de solo lectura con la clave ya existente en Vercel devolvió HTTP 401 tanto en `/v3/user/account` como en `/v3/verified_senders`. No acredita si la causa exacta es revocación, caducidad u otra restricción de acceso. No se expuso, extrajo ni reemplazó la clave. No se hicieron llamadas a `/v3/mail/send`. Antes de activar envíos, el titular debe recuperar acceso a la cuenta y verificar remitente, permiso de envío y cuota sin cargos adicionales.
- Kommo WhatsApp Business: integración instalada, sin número conectado (`waStatus=NOT_CONNECTED`). Se eligió conectar WhatsApp existente → aplicación WhatsApp Business; queda pendiente el paso de Facebook y la verificación del teléfono. No se desinstaló, migró ni borró WhatsApp, ni se contrató un número o proveedor.

La conexión de WhatsApp Business requiere intervención del titular si Meta solicita inicio de sesión, aprobación de acceso o escaneo QR desde el teléfono. No confundir el enlace `wa.me` del sitio/correos con una conexión del canal en Kommo.

## Prueba de producción de solo lectura, 22/10 07:45

Una única solicitud identificada `PRUEBA PDF SMTP 2210` creó contacto `50362695` y lead `25559299` en Web (`14023535`), Contactado, responsable Nicolás. El teléfono público de ADS Veris quedó en el campo estándar PHONE del contacto de prueba, y la descripción y autorización en la nota. No se sobrescribieron teléfonos de clientes existentes. La ficha conserva el marcador `[ADSVERIS_EMAIL_V1:checked]` y el acuse pendiente.

La función confirmó `pdfReady: true`, `pdfCount: 1`: el original Web estaba empaquetado y conservaba su SHA-256 en el servidor de producción. Las dos consultas SendGrid devolvieron 401; no se envió ningún correo. Se devolvió `CONTACT_EMAIL_MODE` a `off` para la publicación final. Los otros dos adjuntos se validaron en las pruebas locales, no mediante envíos reales. Se mantienen 39 pruebas aprobadas; no equivalen a recepción real.

Se envió consulta al chat de soporte Kommo sobre el canal instalado sin conexión y el asistente detenido después de Continuar con Facebook, solicitando reconexión/coexistencia para el número empresarial sin migraciones, borrados ni cargos. Pendiente de respuesta. No se afirma que WhatsApp haya quedado conectado.
