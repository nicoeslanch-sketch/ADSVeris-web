# ADS Veris — revisión técnica y comercial

Revisión: 1 de octubre de 2026, Chile. Es una revisión técnica acotada, no una certificación de seguridad ni un dictamen legal.

## Cambios verificados

- Dos endpoints antiguos de notificación de contraseñas permanecen cerrados por servidor (404), no solamente ocultos en la interfaz. Su código se conserva; no deben reactivarse sin autenticar al usuario y verificar el evento real.
- Formularios: POST JSON, origen permitido, rechazo de solicitudes de otros sitios, cuerpo máximo de 20 KiB y límites por campo. El origen no es una defensa contra bots que falsifican cabeceras.
- CSP, protección contra incrustación, MIME sniffing y uso de cámara/micrófono/geolocalización. Referrer-Policy evita transmitir tickets de descarga a otros sitios.
- Metadatos de archivos de entrega retirados del cliente. Excel fuera de los archivos públicos de Vercel; enlaces firmados por diez minutos. No entregar un ticket si falla el registro de autorización.
- Axios actualizado. `npm audit` completo: cero vulnerabilidades conocidas reportadas en el momento de la revisión; no equivale a ausencia de todas las vulnerabilidades.
- Historial: 144 commits revisados con patrones limitados de tokens GitHub/SendGrid y claves privadas, sin coincidencias. No es un análisis exhaustivo de todos los formatos de secretos.
- Buscador de planillas, filtro combinado por categoría, estado sin resultados y restablecimiento accesible. Foco de teclado contenido en la galería ampliada.
- Promoción por $0 CLP con término real el 15/10/2026, 23:59 Chile continental, compartido por catálogo, formulario y servidor. Vencida, se retira la oferta y se permite consultar; no hay pago ni suscripción automática.

## Bloqueos y riesgos pendientes

1. **Kommo:** 2 usuarios activos para 1 licencia. Aviso de facturación y botón de creación de contactos deshabilitado. Uso: 576/12.500 contactos y compañías, 18/2.500 leads, 5/50 pipelines, cuotas no agotadas. El API devolvió error 205 en las pruebas reales anteriores. La coincidencia no prueba por sí sola la causa del error. Sin nuevas altas no se puede verificar el recorrido de confirmación automática; no se anuncia que esté operativo. Aviso visible con alternativas antes de rellenar el formulario. No se modificaron usuarios ni plan. Consulta de soporte preparada, no enviada sin autorización.
2. **Repositorio público:** los originales Excel y el historial están disponibles en GitHub. El formulario controla la entrega desde el sitio, no protege archivos publicados en un repositorio abierto. Para exigir registro de correo en todos los canales habría que decidir la privacidad del repositorio y la exposición de su historial. No se cambió su visibilidad.
3. **Alojamiento comercial:** la cuenta Vercel está en Hobby, confirmado por su API. Hobby solo permite uso personal no comercial. No se contrató Pro ni ningún otro servicio; hace falta decidir un alojamiento compatible con la actividad empresarial antes de declarar el lanzamiento comercial resuelto. [Documentación vigente](https://vercel.com/docs/plans/hobby).
4. **Antispam:** se preparó un borrador WAF gratuito en acción `log`, solo para POST `/api/submit-kommo`. No bloquea ni limita tráfico; no está publicado. No se activó rate limiting de pago, Attack Mode ni excepciones de seguridad. La guía exige que el propietario revise y publique los borradores. Revisar el borrador final con `vercel firewall diff` antes de cualquier publicación.

## Capacidad: qué se puede afirmar

No existe una cifra comprobada de personas simultáneas para este sitio. No se hizo una prueba de carga contra producción ni contra Kommo.

Prueba reproducible, solo HTML local: `node scripts/check-static-capacity.mjs`, con Vite preview en 127.0.0.1:4173. Resultado: 100 solicitudes, 10 concurrentes, 0 fallos, 329 ms totales, p95 84 ms. No incluye imágenes, JavaScript, sesiones reales, funciones Vercel, CRM ni email; no demuestra que soporte 100 personas.

La parte estática se entrega por la red CDN de Vercel. Depende del tamaño de imágenes y páginas, caché, solicitudes por visita, ubicación de los visitantes y cuotas del equipo. El plan Hobby incluye actualmente 100 GB de transferencia, 1 millón de solicitudes CDN y 1 millón de invocaciones de funciones. Son cuotas de uso, no cupos de visitantes simultáneos. Superarlas puede pausar recursos. [Límites del plan](https://vercel.com/docs/plans/hobby).

El flujo actual de un formulario válido usa seis llamadas a Kommo. El proveedor publica un límite de siete solicitudes por segundo; aritméticamente, con uso dedicado y uniforme, el techo nominal sería unos 1,17 formularios por segundo. No es una capacidad garantizada: otras integraciones, ráfagas, latencia y restricciones del CRM consumen el margen. Puede responder 429 y bloquear accesos si se insiste. Con el bloqueo actual de altas, la capacidad verificada para registrar contactos nuevos es **cero**. [Límites Kommo](https://developers.kommo.com/docs/limitations).

Para una campaña de gran volumen hace falta una cola persistente e idempotencia antes del CRM y una prueba de carga con objetivos acordados. No se añadió infraestructura ni ningún costo nuevo. No hay límite global persistente implementado en este proyecto.

## Quién responde por cada parte

| Parte | Responsable |
|---|---|
| Web, navegación, formularios, términos, atención y servicios vendidos | ADS Veris y quien mantenga su código |
| Hosting, HTTPS, CDN y ejecución de funciones | Vercel, según el alcance de su plan |
| Contactos, embudos, permisos y reglas de automatización | Kommo; configuración y seguimiento a cargo de ADS Veris |
| Entrega del mensaje y reputación del remitente | Kommo y el proveedor del buzón corporativo; ADS Veris debe verificar recepción |
| Condiciones legales, impuestos, facturación y gestión de solicitudes de datos | ADS Veris; revisión profesional cuando corresponda |

Vercel no mantiene automáticamente el código, no atiende a los clientes de ADS Veris y no corrige el bloqueo de Kommo. Hobby no incluye soporte por email en la comparación vigente. Vercel proporciona mitigación DDoS automática, pero no garantiza que el código esté libre de fallos. [Protección DDoS](https://vercel.com/docs/vercel-firewall/ddos-mitigation).

## Revisión legal acotada: Chile

- Identidad, RUT, dirección, contacto, privacidad, condiciones y cancelaciones publicados con los datos facilitados por el propietario. No se comprobó documentalmente la constitución de la sociedad, inicio de actividades ni facultades de representación.
- Una consulta no contrata ni cobra. Los importes WordPress en EUR son referencias; faltan precios finales publicados en CLP e impuestos confirmados por el propietario. No se alteraron precios comerciales sin esa decisión. Deben concretarse también límites reales de hosting, licencias, respaldo, dominio y tiempos de soporte en la propuesta.
- Bases y duración de la promoción visibles. Sin descuento porcentual inventado, precio anterior ficticio ni contador que se reinicie. [SERNAC: promociones y ofertas](https://www.sernac.cl/portal/617/w3-article-57431.html).
- Publicidad separada de la atención solicitada y opcional; las cookies no autorizan marketing. Debe existir un procedimiento real para retirar permisos, excluir envíos, tramitar derechos y borrar o anonimizar datos innecesarios del CRM. Es una obligación operativa, no se resuelve solo escribiendo una política.
- La Ley 21.719 entra en vigor el 1 de diciembre de 2026; no se presenta como ya vigente el 1 de octubre. Preparar adecuación de tratamientos, proveedores y procedimientos antes de esa fecha. [Biblioteca del Congreso](https://www.bcn.cl/balance-legislativo/detalle/ficha_LEY_21719_2024-12-13).
- Las condiciones no eliminan derechos irrenunciables ni el retracto cuando corresponda. [SERNAC: retracto](https://www.sernac.cl/portal/607/w3-propertyvalue-15024.html).

No es responsable afirmar «cumple todo» mientras no se resuelvan estos puntos técnicos, comerciales y operativos.
