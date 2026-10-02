# Correos nativos de Kommo

Configuración revisada en la interfaz de `nicolasadsveris.kommo.com` el 1 de octubre de 2026. Mantener los nombres de plantilla: los disparadores existentes las referencian. Remitente: buzón corporativo conectado `servicios@adsveris.com`. Destinatario: contacto principal del lead.

| Plantilla existente | Embudo | Asunto actualizado |
| --- | --- | --- |
| Plantilla personalizada | Planillas | Recibimos tu solicitud de planillas · ADS Veris |
| Pagina web | Paginas web | Recibimos tu solicitud WordPress · ADS Veris |
| Procesos | Procesos | Recibimos tu consulta de procesos · ADS Veris |
| Plataforma de datos | Plataforma | Recibimos tu interés en la plataforma · ADS Veris |

## Contenido

- Planillas: confirma la solicitud, distingue descargas gratuitas de trabajos personalizados y dirige al botón de descarga de la web o a una cotización.
- WordPress: confirma reparación, mantenimiento, hosting o mejoras; solicita URL y breve descripción; no publica el antiguo precio de creación de webs ni el folleto obsoleto.
- Procesos: solicita contexto del proceso y confirma alcance, entregables, precio y plazos antes de trabajar.
- Plataforma: indica expresamente que está en desarrollo y permite registrar interés, sin prometer un acceso operativo.

Las cuatro respuestas usan `{{contact.name}}`, enlace real de WhatsApp `https://wa.me/56983894129`, posibilidad de responder al correo, identificación de ADS Veris SpA y aviso de que el acuse no suscribe a publicidad. Los PDF originales se conservan en el repositorio, pero no se adjuntan automáticamente mientras su oferta no esté actualizada.

## Recorrido

1. La web valida los campos y crea el contacto con el correo del visitante.
2. Crea el lead con su etiqueta de servicio y contacto principal en una etapa editable del embudo correspondiente.
3. Guarda descripción, fuente y consentimientos separados en una nota.
4. Comprueba contacto y etiqueta; mueve a `Contactado`.
5. El disparador nativo `Enviar correo` usa la plantilla de ese embudo y el buzón corporativo.

No se utiliza SendGrid ni se habilita el webhook antiguo. No aplicar los disparadores retroactivamente a todos los leads: podría enviar correos no solicitados. Una respuesta HTTP del formulario confirma registro/enrutamiento, no entrega del correo. La entrega se verifica en la ficha del lead y en el buzón destinatario.

El permiso opcional para futuras comunicaciones comerciales queda en la nota y, si se acepta, en la etiqueta `Autoriza contacto comercial web`. No usar el mero registro, descarga o aceptación de cookies como autorización publicitaria.

## Verificación en producción pendiente

Las cuatro plantillas actualizadas se reabrieron y comprobaron después de recargar Kommo. Se comprobó que la regla WordPress utiliza el buzón corporativo y solo el contacto principal. La prueba real del formulario no pudo crear el contacto: Kommo devuelve error 205 y también tiene deshabilitada la creación manual. La cuenta muestra 2 usuarios/1 licencia; el propietario pidió mantener ambos y dejar este ajuste pendiente. No se confirmó recepción de ningún correo automático. No habilitar proveedores alternativos ni compras para eludirlo.
