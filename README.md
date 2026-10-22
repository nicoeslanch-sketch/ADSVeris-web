# ADS Veris

Sitio estático desplegado en GitHub + Vercel. Su lanzamiento comercial tiene dependencias pendientes: ver `REVISION_SEGURIDAD_CAPACIDAD.md`.

## Formulario y descargas

El formulario registra solicitudes en el embudo del servicio elegido, con contacto principal, correo, descripción opcional y una nota de consentimiento. Registro real verificado en las cuatro rutas el 22/10/2026. **El plan Base no permite ejecutar los disparadores nativos de email automático**, según la documentación oficial y el operador Denis Malanichev (22/10, 06:50). Un correo manual enviado desde Kommo sí llegó al buzón autorizado. Por petición posterior del propietario se preparó el acuse externo con SendGrid, cuatro mensajes HTML y los tres PDFs originales, sin activar envíos hasta verificar cuenta, remitente y costos. Ver `CORREOS_TRANSACCIONALES.md` y `KOMMO_VERIFICACION_2026-10-22.md`. No se contrató otro plan ni servicio.

Las once planillas del catálogo se ofrecen por $0 CLP durante la inauguración, hasta el 15/10/2026 a las 23:59 Chile continental. La vigencia compartida está en `assets/launch-promotion.js`; al terminar no se habilitan cobros automáticos. Para descargar se solicita nombre, correo y autorización para atender esa solicitud. El teléfono y el permiso comercial son opcionales; este último nunca viene marcado. Las cookies no sustituyen el consentimiento comercial.

Los archivos Excel se excluyen de `dist` y se entregan mediante un enlace firmado válido durante diez minutos tras registrar la solicitud. Los originales se conservan en el repositorio: esta protección controla la descarga del sitio, no el acceso a un repositorio público.

Credenciales del servidor: `KOMMO_API_TOKEN`, `KOMMO_SUBDOMAIN`, `KOMMO_ACCOUNT_ID`. Nunca incluir sus valores en código ni documentación. La arquitectura de cuentas permanece, pero el acceso público está deshabilitado mediante su bandera existente.

## Verificación

Meta Pixel `1151078920784729`: entrada compartida para páginas estáticas y aplicación, con permiso publicitario previo, revocación y eventos PageView/Lead sin datos del formulario. Detalles, límites y comprobación pendiente en el Administrador de eventos: `PIXEL_META.md`. No insertar un segundo snippet inline ni un noscript de seguimiento incondicional. La migración a Resend permanece pendiente; no se contrató ningún plan.

```bash
npm run build
npm test
```

Las pruebas cubren rutas por servicio, validación, consentimiento, enlaces de descarga firmados y archivos estáticos. Para comprobar el correo real también hay que enviar el formulario publicado, revisar la ficha en Kommo y verificar recepción en el buzón destinatario.

El formulario reinicia datos y autorizaciones al abrir una nueva solicitud. Tiene espera máxima de 55 segundos y no reintenta automáticamente: perder una respuesta no demuestra que el CRM no haya recibido el POST. El servidor respeta las respuestas 429 del proveedor, sin presentar esto como un límite global contra bots. Una descarga nunca se anuncia lista sin un enlace firmado válido.

Acuses externos, 22/10/2026: HTML por servicio y tres adjuntos PDF preparados, con 39 pruebas aprobadas. Un diagnóstico real confirmó el empaquetado del PDF Web y creó correctamente el lead `25559299`; SendGrid rechazó la autorización de lectura con HTTP 401. No se envió un email ni se habilitaron envíos públicos. `CONTACT_EMAIL_MODE=off` hasta resolver acceso, remitente y cuota sin costos adicionales. WhatsApp Business está instalado, pero su conexión no se confirmó; consulta de reconexión enviada a soporte. Ver `CORREOS_TRANSACCIONALES.md`.

Estado de prueba real, 2026-10-01: Kommo rechaza nuevas altas con error 205 y deshabilita su botón de crear contactos. La cuenta tiene 2 usuarios activos y 1 licencia; el propietario eligió mantener ambos y dejar pendiente el ajuste. La confirmación automática y el registro para descargas no están operativos para nuevos contactos hasta resolver la restricción. La web no anuncia éxito falso y ofrece correo/WhatsApp como alternativas de atención. Ver `KOMMO_STRUCTURE.md`.

Actualización 2026-10-22: soporte confirmó que el exceso de usuarios bloqueaba la API. Con autorización expresa se desactivó reversiblemente a Vicente y se seleccionó a Nicolás como nuevo responsable de sus datos. Nicolás queda como administrador activo; plan Básico, 1 licencia pagada, 1/1 usados, vigencia 03/09/2027 y renovación automática desactivada, sin cargos ni cambios de plan. Cuatro pruebas reales del formulario registraron correctamente contacto, lead, etiqueta y etapa Contactado. El aviso público distingue ahora este registro operativo del correo automático pendiente; no debe retirarse la advertencia de correo sin verificar entrega real.

Seguimiento 2026-10-02: consulta enviada a soporte Kommo, confirmada en Gmail, sin autorizar cargos, upgrades ni bajas. Ver `KOMMO_SOPORTE_BORRADOR.md` (ahora registra el envío). Gestión de solicitudes de datos: `PROCEDIMIENTO_DATOS_PERSONALES.md`, que requiere aplicación real por el equipo.

Seguimiento 2026-10-19: Gmail contiene solo la respuesta automática que deriva el soporte técnico al chat interno. Se envió allí la consulta y se pidió atención en inglés, siempre sin autorizar cargos ni bajas. La interfaz sigue deshabilitando «Agregar contacto» y facturación mantiene 2/1 licencias usadas. Pendientes el diagnóstico del proveedor y la verificación real contacto → embudo → correo; no se retiró el aviso público de indisponibilidad. Compilación y 28 pruebas correctas.

## Archivos principales
- index.html
- tienda.html
- producto.html
- plataforma.html
- nosotros.html
- contacto.html
- legal.html
- terminos.html
- privacidad.html
- reembolsos.html
- ayuda.html
- assets/styles.css
- assets/products.js
- assets/script.js

## Cómo cambiar las capturas
1. Guarda tus imágenes dentro de `assets/productos/nombre-del-producto/`
2. Edita el array `images` del producto correspondiente en `assets/products.js`
3. Cambia también `thumb` si quieres otra miniatura en la tarjeta

## Cómo publicar cambios
```bash
git add -- nombre-del-archivo-modificado
git commit -m "actualización del sitio"
git push
```

Incluye solo los archivos revisados para esa actualización. No añadas `.env`, claves, exportaciones del CRM ni archivos privados. El repositorio es público. El push a `main` inicia el despliegue conectado; comprueba su estado READY y el commit antes de darlo por publicado.
