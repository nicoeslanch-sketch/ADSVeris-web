# ADS Veris

Sitio estático listo para subir a GitHub + Vercel.

## Formulario y descargas

El formulario registra solicitudes en el embudo del servicio elegido, con contacto principal, correo, descripción opcional y una nota de consentimiento. El envío de confirmación corresponde a los disparadores nativos de Kommo, desde `servicios@adsveris.com`; no se utiliza SendGrid.

Las once planillas del catálogo son gratuitas. Para descargar se solicita nombre, correo y autorización para atender esa solicitud. El teléfono y el permiso comercial son opcionales; este último nunca viene marcado. Las cookies no sustituyen el consentimiento comercial.

Los archivos Excel se excluyen de `dist` y se entregan mediante un enlace firmado válido durante diez minutos tras registrar la solicitud. Los originales se conservan en el repositorio: esta protección controla la descarga del sitio, no el acceso a un repositorio público.

Credenciales del servidor: `KOMMO_API_TOKEN`, `KOMMO_SUBDOMAIN`, `KOMMO_ACCOUNT_ID`. Nunca incluir sus valores en código ni documentación. La arquitectura de cuentas permanece, pero el acceso público está deshabilitado mediante su bandera existente.

## Verificación

```bash
npm run build
npm test
```

Las pruebas cubren rutas por servicio, validación, consentimiento, enlaces de descarga firmados y archivos estáticos. Para comprobar el correo real también hay que enviar el formulario publicado, revisar la ficha en Kommo y verificar recepción en el buzón destinatario.

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
git add .
git commit -m "actualización del sitio"
git push
```
