# Formulario y Kommo: verificación real del 22/10/2026

## Alcance y autorización

El propietario autorizó las pruebas en uno de sus dos buzones abiertos en el navegador integrado. Se usó uno solo, sin publicar la dirección personal en este documento. Nombre de cada prueba: `PRUEBA ADS Veris 2210` más el servicio. Teléfono: canal público de ADS Veris. Descripción: prueba técnica, no cliente real, no llamar ni cotizar. Casilla de publicidad desmarcada. No se cobraron ni contrataron servicios.

Las pruebas se enviaron una sola vez por servicio desde el formulario publicado, no directamente al API. Se verificaron los resultados en las fichas de Kommo y en los registros de servidor. Los IDs de oportunidades no son credenciales.

| Servicio | Lead | Contacto | Pipeline | Etapa final |
|---|---:|---:|---:|---|
| Planillas personalizadas | 25557575 | 50361105 | 14023387 | Contactado (108238131) |
| Página Web | 25557609 | 50361135 | 14023535 | Contactado (108239227) |
| Optimización de Procesos | 25557631 | 50361159 | 14023539 | Contactado (108239243) |
| Plataforma de Análisis | 25557655 | 50361183 | 14023551 | Contactado (108239311) |

Las fichas muestran a Nicolás Albornoz como responsable, el contacto con el correo autorizado y la etiqueta del servicio. En Planillas se desplegó la nota completa y se comprobaron descripción y consentimiento comercial NO autorizado. Las cuatro respuestas de la web indicaron solicitud recibida, y el servidor registró `Kommo form routed`. No se probaron los cuatro subservicios WordPress por separado contra producción: comparten la ruta Web y están cubiertos por la prueba automatizada de todas las opciones.

## Límite del envío automático

La búsqueda en Gmail incluyó todas las carpetas, filtrando por remitente corporativo y fecha. No se encontraron los acuses automáticos, y las fichas no mostraron un envío de email automático durante las comprobaciones. No se equipara registro de lead con entrega de correo.

La [documentación oficial de correos automáticos](https://support.kommo.com/docs/send-emails-automatically) exige Advanced/Enterprise. La cuenta contratada es Base. Tras la consulta y transferencia, el operador humano Denis Malanichev confirmó el 22/10 a las 06:50 que las reglas de email automático existentes no pueden ejecutarse con la suscripción Base. Sí se permite enviar manualmente desde las fichas mediante los buzones conectados y plantillas disponibles. No es necesario cambiar usuarios ni suscripción para confirmar esta limitación. No se cambió el plan ni se activaron pruebas comerciales.

Se envió una única prueba manual desde Kommo, por `servicios@adsveris.com`, con asunto `PRUEBA MANUAL ADS Veris 2210 — conexión de correo`. Se verificó recepción en Recibidos del Gmail autorizado a las 06:47 y se desplegaron los detalles: remitente corporativo, destinatario correcto y cifrado TLS. Hilo de salida Kommo: `139836176`. La búsqueda solo encontró este mensaje manual, no los acuses automáticos. Esto acredita conexión y entrega manual del buzón, no automatización.

## Reparaciones del código

- El aviso del formulario ya no afirma que el registro está caído; distingue el registro disponible de la confirmación automática aún no activa.
- La nota del CRM conserva ahora `/contacto-kommo`, la ruta real del formulario React. No registra URLs externas, parámetros con datos personales ni saltos de línea como fuente.
- Se retiró el acceso a `req.query` del webhook antiguo, que generó DEP0169 en producción. Usa URL estándar y rechaza secretos duplicados o URLs malformadas. El envío por SendGrid sigue deshabilitado.
- Las pruebas automatizadas nuevas cubren estas tres correcciones. No se añadieron credenciales al cliente, servicios pagos, procesos de envío alternativos ni una garantía de capacidad o entrega.

Verificación local: `npm run build` correcto, `npm test` con 31/31 pruebas aprobadas y `git diff --check` sin errores de espacios.

La promoción de planillas gratuitas terminó el 15/10/2026. No se prolongó ni se probó una descarga gratuita fuera de plazo.
