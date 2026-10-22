# Consulta enviada a soporte Kommo

## Actualización del 22 de octubre de 2026

Se leyó la respuesta de Nikita Bekishchuk del 19/10, 07:33: el exceso de usuarios bloquea la API; desactivar un usuario o comprar otra licencia restaura el acceso. El propietario autorizó dejar solo a Nicolás si el plan quedaba intacto. Se verificó la documentación oficial de suscripciones (el plan pertenece al espacio, no al pagador) y se desactivó reversiblemente a Vicente, seleccionando a Nicolás para reasignar sus datos. Facturación antes/después: Básico activo, una licencia pagada, misma fecha 03/09/2027 y renovación automática desactivada; pasa de 2/1 a 1/1. Sin compras ni cargos.

El formulario publicado registró cuatro pruebas reales en sus embudos. No hubo correos automáticos en el buzón destinatario ni entradas de envío en las fichas durante la revisión. Se consultó nuevamente al chat con los IDs de prueba, sin contraseñas ni datos de clientes, y se solicitó diagnóstico sin upgrade. Tras la transferencia, el operador Denis Malanichev confirmó el 22/10 a las 06:50 que las reglas de email automático no pueden ejecutarse con Base: requieren Advanced/Enterprise. La alternativa disponible en el plan actual es el envío manual desde fichas con el buzón conectado y las plantillas disponibles. Una prueba manual por Kommo llegó al Gmail autorizado a las 06:47. No se activó otro proveedor ni se intentó eludir una función restringida por plan. Ver `KOMMO_VERIFICACION_2026-10-22.md`.

## Historial de las consultas anteriores

Enviada el 2 de octubre de 2026 a `support@kommo.com`, desde el buzón del propietario abierto en Gmail. Se verificaron destinatario, asunto y cuerpo antes de enviar; Gmail confirmó «Mensaje enviado». La búsqueda específica en Enviados mostró un único mensaje al destinatario con este asunto, fechado el 2 de octubre a las 6:36. No se envió un segundo mensaje cuando el navegador demoró en devolver la confirmación.

Asunto: **ADS Veris: bloqueo de contactos / error 205 — diagnóstico sin cambios ni cargos (cuenta 36669295)**.

Estado actualizado el 19 de octubre de 2026: se encontró en Gmail una respuesta automática de Support del 2 de octubre, 15:03. Informa que no se brinda soporte técnico por correo y remite a «Ayuda → Obtener soporte» dentro de Kommo. No contiene diagnóstico del error 205 ni número de caso.

El 19 de octubre se envió la consulta al chat «Habla con Soporte» de la cuenta correcta. Se confirmaron el mensaje publicado en el hilo y la respuesta automática que ofrece atención en inglés fuera del horario de español (11:00–23:00 UTC). Se pidió continuar en inglés y se reiteró que no se autorizan compras, upgrades, complementos, cargos ni bajas de usuarios. El chat confirmó la transferencia a un especialista («I’ll transfer the conversation to a Kommo support specialist»). Pendiente de respuesta técnica y número de caso; no se considera reparada la integración.

Comprobación actual en la interfaz: «Agregar contacto» tiene las clases `button-input-disabled` y `js-disabled`. Facturación muestra plan Básico activo, 1 licencia pagada y 2/1 usados, con aviso explícito de exceso de licencias. No se cambió nada de facturación, usuarios o permisos. La coincidencia sigue sin demostrar por sí sola la causa del error API.

El formulario público de Plataforma de Análisis conserva el aviso de indisponibilidad y los canales alternativos. Un POST de cuerpo vacío al endpoint publicado devolvió 400 de validación, sin crear contactos ni enviar correos. Compilación correcta y 28 pruebas aprobadas. No se repitió un alta real mientras el proveedor mantiene deshabilitada la creación, ni se afirma entrega de correos a partir de mocks.

El disparador guardado de Planillas sigue visible en Contactado: etiqueta Planillas, ejecución al mover a la etapa, plantilla personalizada, buzón corporativo `servicios@adsveris.com` y nombre de remitente ADS Veris. Inspección sin guardar cambios. Ver una regla guardada no demuestra que el plan la ejecute ni que el mensaje llegue.

El correo automático a clientes sigue siendo responsabilidad de las reglas nativas de Kommo, no de Gmail.

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
