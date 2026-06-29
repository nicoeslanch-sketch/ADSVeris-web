# Kommo Contactados Email Templates

These are the default emails used by `api/kommo-contactados-webhook.js` when a lead reaches the `Contactados` status in a service pipeline.

The main `Embudo de ventas` is intentionally excluded.

## Planillas

- Pipeline ID: `14023387`
- Contactados status ID: `108238131`
- Subject: `Ya recibimos tu solicitud de planilla personalizada`

```text
Hola {{nombre}}, ya estamos revisando tu solicitud.

Gracias por contactarnos por una planilla Excel personalizada.

Vamos a revisar lo que necesitas ordenar, automatizar o visualizar para proponerte una herramienta simple, clara y util para tu operacion.

El siguiente paso es entender tus datos actuales, tus dolores principales y el resultado que quieres obtener.

Si quieres adelantarnos mas contexto, responde este correo con archivos, referencias o detalles importantes.

ADS Veris
servicios@adsveris.com
```

## Paginas Web

- Pipeline ID: `14023535`
- Contactados status ID: `108239227`
- Subject: `Ya recibimos tu solicitud de pagina web`

```text
Hola {{nombre}}, ya estamos revisando tu solicitud.

Gracias por contactarnos por una pagina web para tu pyme.

Vamos a revisar el tipo de sitio que necesitas, el objetivo comercial y la mejor estructura para presentar tu negocio con claridad.

El siguiente paso es levantar el contenido base, referencias visuales y las secciones que deberia tener tu sitio.

Si quieres adelantarnos mas contexto, responde este correo con archivos, referencias o detalles importantes.

ADS Veris
servicios@adsveris.com
```

## Procesos

- Pipeline ID: `14023539`
- Contactados status ID: `108239243`
- Subject: `Ya recibimos tu solicitud para ordenar procesos`

```text
Hola {{nombre}}, ya estamos revisando tu solicitud.

Gracias por contactarnos para trabajar en tus procesos.

Vamos a revisar donde se produce el desorden operativo, que tareas se repiten y que partes del flujo conviene documentar, simplificar o automatizar.

El siguiente paso es entender como opera hoy tu equipo y detectar los puntos donde una mejora puede generar mas impacto.

Si quieres adelantarnos mas contexto, responde este correo con archivos, referencias o detalles importantes.

ADS Veris
servicios@adsveris.com
```

## Plataforma

- Pipeline ID: `14023551`
- Contactados status ID: `108239311`
- Subject: `Ya recibimos tu solicitud de plataforma de analisis`

```text
Hola {{nombre}}, ya estamos revisando tu solicitud.

Gracias por contactarnos por una plataforma de analisis.

Vamos a revisar que indicadores necesitas mirar, desde donde vienen tus datos y como convertir esa informacion en paneles utiles para decidir mejor.

El siguiente paso es identificar tus fuentes de datos, metricas clave y usuarios que consultaran la plataforma.

Si quieres adelantarnos mas contexto, responde este correo con archivos, referencias o detalles importantes.

ADS Veris
servicios@adsveris.com
```

## Manual Use

Kommo API automation sends these emails automatically from Vercel when the webhook fires.

For manual use inside Kommo, copy the corresponding subject and body into a Kommo email template or into the lead email composer.
