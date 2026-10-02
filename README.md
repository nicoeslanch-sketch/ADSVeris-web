# ADS Veris

Sitio estático desplegado en GitHub + Vercel. Su lanzamiento comercial tiene dependencias pendientes: ver `REVISION_SEGURIDAD_CAPACIDAD.md`.

## Formulario y descargas

El formulario registra solicitudes en el embudo del servicio elegido, con contacto principal, correo, descripción opcional y una nota de consentimiento. El envío de confirmación corresponde a los disparadores nativos de Kommo, desde `servicios@adsveris.com`; no se utiliza SendGrid.

Las once planillas del catálogo se ofrecen por $0 CLP durante la inauguración, hasta el 15/10/2026 a las 23:59 Chile continental. La vigencia compartida está en `assets/launch-promotion.js`; al terminar no se habilitan cobros automáticos. Para descargar se solicita nombre, correo y autorización para atender esa solicitud. El teléfono y el permiso comercial son opcionales; este último nunca viene marcado. Las cookies no sustituyen el consentimiento comercial.

Los archivos Excel se excluyen de `dist` y se entregan mediante un enlace firmado válido durante diez minutos tras registrar la solicitud. Los originales se conservan en el repositorio: esta protección controla la descarga del sitio, no el acceso a un repositorio público.

Credenciales del servidor: `KOMMO_API_TOKEN`, `KOMMO_SUBDOMAIN`, `KOMMO_ACCOUNT_ID`. Nunca incluir sus valores en código ni documentación. La arquitectura de cuentas permanece, pero el acceso público está deshabilitado mediante su bandera existente.

## Verificación

```bash
npm run build
npm test
```

Las pruebas cubren rutas por servicio, validación, consentimiento, enlaces de descarga firmados y archivos estáticos. Para comprobar el correo real también hay que enviar el formulario publicado, revisar la ficha en Kommo y verificar recepción en el buzón destinatario.

El formulario reinicia datos y autorizaciones al abrir una nueva solicitud. Tiene espera máxima de 55 segundos y no reintenta automáticamente: perder una respuesta no demuestra que el CRM no haya recibido el POST. El servidor respeta las respuestas 429 del proveedor, sin presentar esto como un límite global contra bots. Una descarga nunca se anuncia lista sin un enlace firmado válido.

Estado de prueba real, 2026-10-01: Kommo rechaza nuevas altas con error 205 y deshabilita su botón de crear contactos. La cuenta tiene 2 usuarios activos y 1 licencia; el propietario eligió mantener ambos y dejar pendiente el ajuste. La confirmación automática y el registro para descargas no están operativos para nuevos contactos hasta resolver la restricción. La web no anuncia éxito falso y ofrece correo/WhatsApp como alternativas de atención. Ver `KOMMO_STRUCTURE.md`.

Seguimiento 2026-10-02: consulta enviada a soporte Kommo, confirmada en Gmail, sin autorizar cargos, upgrades ni bajas. Ver `KOMMO_SOPORTE_BORRADOR.md` (ahora registra el envío). Gestión de solicitudes de datos: `PROCEDIMIENTO_DATOS_PERSONALES.md`, que requiere aplicación real por el equipo.

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
