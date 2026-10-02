# ADS Veris — revisión técnica y comercial

Revisión: 1 de octubre de 2026, Chile. Es una revisión técnica acotada, no una certificación de seguridad ni un dictamen legal.

## Seguimiento del 2 de octubre de 2026

- Consulta enviada a `support@kommo.com`, con destinatario y contenido verificados y confirmación «Mensaje enviado» en Gmail. Se pidió diagnóstico del error 205 y confirmación de las reglas nativas de email, conservando ambos usuarios y sin autorizar cargos o cambios. Pendiente de respuesta/número de caso. Ver `KOMMO_SOPORTE_BORRADOR.md`.
- Cada nueva solicitud del formulario limpia datos y consentimientos; las dependencias del reinicio usan el identificador de producto, no un objeto que puede cambiar en cada render. Aplicado siguiendo la guía React de Vercel.
- Espera del cliente limitada a 55 segundos, sin reintentos automáticos. Un error de conexión o timeout no invita a duplicar la solicitud. Respuesta 429 del CRM respetada con Retry-After acotado; no es un rate limit global ni protección completa contra bots.
- Honeypot devuelve rechazo, no éxito ficticio. Se validan respuestas malformadas e identificadores positivos del proveedor. La descarga requiere un enlace relativo firmado en la respuesta; un caso pendiente no anuncia un archivo inexistente.
- Privacidad versionada como 2026-10-02; canal directo para derechos sin cuenta ni cookies, información veraz sobre la restricción de Kommo y preparación para la reforma. Creado procedimiento operativo para el equipo, no ejecutado sobre datos de clientes.
- Retracto: información de plazos aplicables, extensión por falta de confirmación escrita, devolución y ausencia de obligación de justificar arrepentimiento. La confirmación de una consulta no sustituye la confirmación contractual. Orientación revisada en [SERNAC](https://www.sernac.cl/portal/618/articles-84009_archivo_01.pdf).
- Importes WordPress conservados sin conversión inventada; referencia EUR y cotización final CLP con impuestos aclaradas junto a cada precio. Límites de alojamiento y respuesta 24/7 pendientes de concretar en la propuesta.

No se cambiaron plan, usuarios, visibilidad del repositorio ni reglas de firewall; permanecen las limitaciones señaladas más abajo. No se afirma cumplimiento legal integral ni funcionamiento de nuevos contactos hasta confirmar la reparación con Kommo.

Verificación de este seguimiento: `npm run build` correcto; 25 pruebas automatizadas aprobadas tras construir; `npm audit` sin vulnerabilidades conocidas reportadas; 145 commits revisados con patrones limitados de credenciales, sin coincidencias. No equivale a un pentest exhaustivo.

Navegador integrado, preview local de producción a 390 × 844: catálogo → producto → modal, reapertura con nombre vacío y ambas casillas desmarcadas; modal contenido en el área disponible, sin desbordamiento horizontal ni overlay de error. Inicio, precios WordPress y reembolsos visibles; ninguna imagen rota en inicio y WordPress. No se enviaron estos datos de prueba al CRM.

| Límite del flujo | Evidencia / estado |
|---|---|
| Catálogo y formulario | Verificados en navegador integrado; promoción y aviso temporal visibles |
| Cliente → API y respuesta → interfaz | Contrato validado con pruebas de respuesta, enlaces, fallos y timeout; comprobación segura en producción tras publicar |
| API → Kommo | Bloqueado en altas reales por error 205 observado anteriormente; no se insistió ni se modificaron licencias |
| Embudo → correo recibido | No verificable mientras falle la creación del contacto; el soporte debe aclarar también disponibilidad de reglas en el plan |

La guía de verificación obliga a detener el recorrido real en el primer límite roto: no se declaró éxito de CRM o entrega de correo a partir de pruebas con mocks.

Comprobación posterior a la primera publicación: los probes sin efectos externos devolvieron 400 para cuerpo inválido y honeypot, 403 para origen externo y descarga sin ticket, y 404 para notificaciones de contraseña deshabilitadas. No llamaron a Kommo ni enviaron correos. Los logs mostraron una advertencia DEP0169 de Node en el acceso de descarga; se sustituyó `req.query` por lectura mediante URL/URLSearchParams estándar, sin silenciar advertencias. Se añadió rechazo de tickets duplicados, URLs malformadas y leadId no positivo; la suite final tiene 26 pruebas.

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

1. **Kommo:** 2 usuarios activos para 1 licencia. Aviso de facturación y botón de creación de contactos deshabilitado. Uso: 576/12.500 contactos y compañías, 18/2.500 leads, 5/50 pipelines, cuotas no agotadas. El API devolvió error 205 en las pruebas reales anteriores. La coincidencia no prueba por sí sola la causa del error. Sin nuevas altas no se puede verificar el recorrido de confirmación automática; no se anuncia que esté operativo. Aviso visible con alternativas antes de rellenar el formulario. No se modificaron usuarios ni plan. Consulta enviada a soporte el 2 de octubre con autorización expresa del propietario; pendiente de respuesta.
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
