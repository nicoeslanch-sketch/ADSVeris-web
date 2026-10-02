# Consulta enviada a soporte Kommo

Enviada el 2 de octubre de 2026 a `support@kommo.com`, desde el buzón del propietario abierto en Gmail. Se verificaron destinatario, asunto y cuerpo antes de enviar; Gmail confirmó «Mensaje enviado». La búsqueda específica en Enviados mostró un único mensaje al destinatario con este asunto, fechado el 2 de octubre a las 6:36. No se envió un segundo mensaje cuando el navegador demoró en devolver la confirmación.

Asunto: **ADS Veris: bloqueo de contactos / error 205 — diagnóstico sin cambios ni cargos (cuenta 36669295)**.

Estado: pendiente de respuesta y número de caso de Kommo. El envío de la consulta no acredita que la integración esté reparada. El correo automático a clientes sigue siendo responsabilidad de las reglas nativas de Kommo, no de Gmail.

Solicito ayuda con la cuenta empresarial `nicolasadsveris.kommo.com` (ID 36669295).

La web envía los formularios a nuestra integración privada para crear un contacto, registrar una oportunidad en el embudo correspondiente y activar un correo nativo desde el buzón corporativo conectado.

Problema observado el 1 de octubre de 2026:

- El botón «Agregar contacto» está deshabilitado en la propia interfaz de Kommo.
- `POST /api/v4/contacts`, con nombre y campo estándar EMAIL (WORK), devuelve HTTP 400, `application/problem+json`, con `Error code 205`. No devuelve un listado de errores de validación de campos.
- Facturación muestra plan Básico activo hasta 03/09/2027, una licencia pagada y dos usuarios activos (2/1). También aparece el aviso de exceso de licencias.
- El apartado Uso muestra 576/12.500 contactos y compañías, 18/2.500 leads y 5/50 pipelines; esas cuotas no están agotadas.

Necesitamos que confirmen si el error 205 y el bloqueo de contactos son consecuencia del exceso de usuarios o de otro límite/configuración. Queremos conservar ambos usuarios y no comprar licencias, cambiar el plan ni activar complementos de pago. ¿Existe una solución permitida, sin costo, para este caso? Por favor, indiquen si alguna alternativa implicaría reducir permisos o funcionalidades antes de proponer aplicarla.

También necesitamos confirmar si el plan Básico contratado permite ejecutar las reglas nativas existentes de envío de email cuando una oportunidad entra en Contactado, desde servicios@adsveris.com al contacto principal, o si hay restricciones de plan en esas reglas.

No autoricen ni ejecuten cambios, bajas de usuarios, renovaciones, upgrades o cargos. Solo solicitamos diagnóstico y opciones sin costo.

No se adjuntaron claves de API, contraseñas ni datos de clientes. El propietario autorizó expresamente el envío en este seguimiento. No se autorizó ninguna modificación de la cuenta ni cargo.
