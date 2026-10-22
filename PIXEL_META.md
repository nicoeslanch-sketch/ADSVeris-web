# Meta Pixel ADS Veris

ID solicitado por el propietario: `1151078920784729`. Integración compartida de `assets/meta-pixel.js`, importada por `assets/script.js` para las 14 páginas HTML públicas y por `src/main.jsx` para la aplicación React. No pegar un segundo bloque en index/contacto/app: duplicaría la integración. No se han creado campañas ni autorizado cargos.

## Consentimiento y privacidad

- Antes de elegir o al seleccionar Solo necesarias, no se inserta `fbevents.js`, no se crea un fallback de imagen y no se envían eventos. El formulario y las descargas mantienen su funcionamiento sin permiso publicitario.
- Solo Aceptar publicidad permite cargar el SDK. La elección, versión y fecha se guardan en almacenamiento local durante un máximo de 180 días. El botón Cookies permite volver a elegir; la decisión se sincroniza entre pestañas del mismo origen. Un error de almacenamiento no se considera consentimiento previo.
- Retirar permiso revoca el envío, descarta conversiones pendientes y elimina _fbp/_fbc que el sitio puede controlar. No promete borrar cookies de Facebook o datos ya enviados.
- No se inicializa en rutas de cuenta/contraseña ni URLs con tokens, emails o parámetros libres. Solo se admiten páginas públicas conocidas y parámetros del catálogo/servicios o campaña restringidos. También se omiten fuentes con consultas o rutas internas privadas, para no transmitir un referrer sensible.
- `autoConfig=false`: no habilitamos captura automática de formularios, coincidencia avanzada ni Meta-enabled CAPI. No se incluyen nombre, correo, teléfono, descripción o referencia del CRM en los parámetros enviados a Meta.
- La política de privacidad explica Meta, datos técnicos, transferencias, cookies y revocación. El permiso de cookies no reemplaza la casilla independiente de comunicaciones comerciales.

## Eventos

PageView: una vez por navegación pública elegible, solo después del permiso. `fbq.disablePushState=true` deshabilita la captura de historial del SDK: React Router notifica explícitamente y la integración elimina duplicados de StrictMode o de la carga repetida del widget.

Lead: únicamente tras el HTTP de registro completo del formulario y una referencia numérica positiva del servidor; no se produce al abrir un modal, hacer clic en Contactar/WhatsApp o recibir un resultado pendiente/incierto. La referencia solo se usa en memoria para no duplicar el evento. A Meta se envía una categoría de servicio de una lista cerrada y un eventID aleatorio, no el ID interno del CRM. La aceptación del correo por un proveedor no se confunde con alta de lead ni entrega de email. No se registra Purchase.

No se guardan conversiones realizadas antes de consentir para enviarlas retroactivamente. Si el SDK falla o el visitante lo bloquea, no se interrumpe el formulario ni se reenvía la solicitud al CRM.

## Seguridad y comprobación

La CSP permite únicamente el SDK desde `connect.facebook.net` y los eventos a `www.facebook.com/tr/`, conservando la prohibición de scripts inline/eval. No se relajaron los orígenes de envío del formulario ni se expusieron credenciales.

Pruebas locales automatizadas: consentimiento ausente/rechazado/expirado, revocación durante la carga, consentimiento entre pestañas, SDK fallido, datos sensibles en URL/referrer, catálogo permitido, una sola inicialización/PageView, deduplicación de Lead y conversión solo tras confirmación del CRM. Suite completa: 48 pruebas aprobadas. La verificación visual local confirmó el aviso y ausencia del script Meta antes de aceptar y tras rechazar. Estas pruebas no acreditan recepción en los informes de Meta.

Para confirmar recepción real:

1. Iniciar sesión en el Administrador de eventos de Meta con la cuenta que administra el píxel.
2. Elegir Pixel ADS Veris, ID `1151078920784729`, y Probar eventos.
3. Abrir `https://pymex-web.vercel.app/index.html` y aceptar publicidad. Comprobar PageView, sin duplicarlo en la misma navegación.
4. Comprobar otra página pública y, si se prueba un formulario, usar una solicitud técnica claramente identificada y verificar la ficha en Kommo antes de considerar validado Lead.
5. Retirar publicidad desde Cookies y comprobar que no se generan nuevos eventos. Un navegador con bloqueo de rastreadores puede impedir medición aunque el código esté instalado.

El navegador integrado pidió iniciar sesión en Meta; no se pudo inspeccionar Probar eventos ni confirmar los permisos de administración del ID indicado. No se aceptaron términos nuevos ni se cambiaron configuraciones comerciales de Meta. Referencia técnica primaria: [plantilla oficial de Meta para GTM](https://github.com/facebook/GoogleTagManager-WebTemplate-For-FacebookPixel/blob/main/template.tpl).

La migración de correo a Resend quedó en pausa por indicación posterior del propietario. Este cambio no activa correos ni altera los PDFs o el plan de Kommo.
