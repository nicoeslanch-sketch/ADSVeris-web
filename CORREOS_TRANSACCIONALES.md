# Acuses del formulario y folletos originales

Configuración preparada el 22/10/2026, por petición del propietario. No presupone que SendGrid esté habilitado ni que se haya recibido un email real.

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

- `CONTACT_EMAIL_MODE=off`: no llama a SendGrid. Es el valor predeterminado.
- `check`: solo lee información de cuenta y remitentes mediante la clave existente del servidor; comprueba también que el PDF del servicio esté empaquetado. Nunca envía mensajes. Los registros técnicos solo incluyen IDs, códigos HTTP y estados, no claves ni direcciones personales.
- `test`: requiere `CONTACT_EMAIL_BUDGET_APPROVED=true`, remitente verificado `CONTACT_EMAIL_FROM` del dominio adsveris.com y destinatario en `CONTACT_EMAIL_TEST_TO`. No crear otra cuenta, prueba ni plan.
- `live`: requiere la misma aprobación de presupuesto y verificación previa de cuota sin cargos adicionales. Antes de habilitarlo para todo el público, revisar también límites de abuso globales en el alojamiento/proveedor; el origen permitido y el honeypot no sustituyen un control distribuido de bots.

El estado de cuenta `free` o `paid` y una clave guardada no acreditan cuota disponible ni ausencia de sobrecostos. Si no puede verificarse la facturación o la cuenta pide login, no activar `test`/`live`. El remitente inicial coincide con el de los antiguos avisos (`noreply@adsveris.com`); las respuestas van a `servicios@adsveris.com`. No inventar una identidad de remitente ni cambiar permisos de una clave sin aprobación específica.

Solo un HTTP 202 se considera aceptado por SendGrid: no significa entrega, lectura ni ausencia de spam. Se escribe el estado en la ficha del lead. Los fallos del proveedor conservan el lead y muestran confirmación de correo pendiente; no se reintenta un envío incierto ni se pide reenviar el formulario. No hay cola duradera ni reenvío retroactivo. El equipo puede responder manualmente desde Kommo cuando el acuse está pendiente.

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
