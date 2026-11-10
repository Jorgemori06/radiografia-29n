# Radiografía Electoral 29N: mantenimiento

Web estática (un solo `index.html`) sobre las elecciones generales del 29 de noviembre de 2026.
Cada push a `main` se publica solo en https://radiografia-29n.vercel.app/ (Vercel, plan gratuito).
El autor es Jorge, que la comparte con familia y amigos. Habla en español informal y directo.

## Criterio editorial (lo más importante)

La web tiene que ser **objetiva**. Jorge lo ha pedido expresamente: no quiere que se use para
hacer campaña contra nadie, por ejemplo con listas de «mentiras» de un candidato en entrevistas.

Qué entra:
- Hitos judiciales con resolución formal: imputación, procesamiento, apertura de juicio oral,
  sentencia firme o recurrible, archivo o absolución. **Los archivos y absoluciones entran
  igual que las condenas**: si un proceso que ya está en la web se archiva, se actualiza el
  tipo y el texto.
- Hechos verificables: votaciones en el Congreso, decretos, el BOE, listas y candidaturas,
  pactos firmados, fechas oficiales (debates confirmados, campaña, Junta Electoral).
- Encuestas de institutos reconocidos con campo y medio identificados.
- Propuestas oficiales de programa, citadas como «propuesta».

Qué no entra:
- Valoraciones, adjetivos o calificativos («escandaloso», «sucio», «histórico»).
- Acusaciones de rivales, rumores o noticias con una sola fuente sin confirmar.
- Comprobaciones de frases de entrevistas o mítines (seleccionar unas sí y otras no es sesgo).
- Nada sobre la vida privada de nadie que no sea cargo público ni candidato.

Cómo se redacta:
- Frases cortas y en tono notarial. Si hay versión del afectado (lo niega, recurre, la Fiscalía
  pide absolución…), se dice.
- Cada hecho lleva su fuente en `S` (preferiblemente un medio de referencia o una fuente
  oficial) y la URL tiene que existir: ábrela antes de usarla.
- Mismo listón para todos los partidos. No se rellena un partido por «equilibrar», pero
  tampoco se omite algo de uno que se pondría de otro.
- Ante la duda, no se incluye.
- El tipo también informa: `institucional`, `opacidad` o `controversia` solo cuando hay una
  resolución o un informe formal que lo respalde. Un suceso cuya causa no está establecida
  (un accidente, por ejemplo) va como `hemeroteca`.

## Programas electorales

Cada ficha de `PARTIES` tiene `programa:{url, nota}` (o solo `nota:"sin publicar a …"`).
En cada revisión, comprobar si algún partido sin programa lo ha publicado. Cuando salga uno:

1. Confirmar que es el programa del 29N de 2026. La portada o la introducción deben citar
   las generales de 2026 o el 29 de noviembre. Cuidado con documentos que no son el
   programa: programas de 2023, programas autonómicos, manifiestos previos como el
   «Contrato con España» del PP (19 oct) o notas de prensa.
2. Enlazar preferiblemente el PDF en la web oficial del partido. Si solo está alojado en un
   medio, se enlaza ese y se dice en la `nota`.
3. Leer el PDF entero (WebFetch con `offset` hasta el final). Cada medida que se ponga en la
   ficha tiene que estar en el texto con esa misma cifra o formulación: pide la cita literal.
   Si una parte no se ha podido leer o la herramienta solo devuelve un resumen, esa parte
   no se usa, y se le dice a Jorge qué ha quedado pendiente de comprobar.
4. Sustituir en la ficha las propuestas anteriores por las del programa (tipo `propuesta`,
   empezando por «Programa:») y quitar las que el programa no recoja.
5. Añadir a `TIMELINE` la presentación del programa (tipo `propuesta`).
6. Actualizar la fecha de la `nota` («sin publicar a …») de los partidos que siguen sin programa.

## Veda de encuestas (art. 69.7 LOREG)

Del **24 al 29 de noviembre de 2026** (hasta el cierre de los colegios a las 20:00) la ley
prohíbe publicar, difundir o reproducir sondeos electorales. En esos días:
- No se añade ni se cambia ninguna encuesta en `POLLS`, ni se menciona ninguna encuesta
  nueva en la cronología, las fichas o el resumen a Jorge. Tampoco las que se publican en
  Andorra u otros países para sortear la veda.
- `scripts/check.mjs` falla si en esas fechas `POLLS` difiere de lo ya publicado en `origin/main`.
- La revisión del 23 de noviembre es la última que puede añadir encuestas.

## Estructura de `index.html` (todo está en el `<script>` principal)

- `VERIFIED` (`"24 oct 2026"`) y el pie («Datos verificados a 24 de octubre de 2026.»): se
  actualizan en cada revisión que cambie datos.
- `S`: diccionario de URLs de fuentes. Se añaden claves nuevas justo antes de
  `  g2023:"https://en.wikipedia.org/wiki/2023_Spanish_general_election"`.
- `TYPE`: etiquetas permitidas (hemeroteca, sentencia, nofirme, proceso, archivada,
  absolucion, sancion, opacidad, institucional, controversia, limpio, propuesta,
  valoracion, electoral).
- `PARTIES`: 12 fichas (ids: psoe, pp, vox, fa, podemos, salf, junts, erc, bildu, pnv, d21,
  adel). Cada una tiene `resumen`, `hemeroteca`, `corrupcion` y `economia` (listas de
  `it(tipo, texto, fuente)` o `hm(texto, fuente)`) y `paradoja` (lógica condicional de voto).
- `TIMELINE`: entradas `{d:"AAAA-MM-DD", p:[ids o "general"], t:tipo, x:texto, s:S.clave}`
  en orden cronológico.
- `KEY_DATES`: próximas fechas `{d, t, x, s}`, ordenadas.
- `POLLS`: encuestas `{firm, media, campo, pp, psoe, vox, vpp, vpsoe, vvox, s, note?}`.
  Escaños como número o `[min,max]`; `null` si no los da. Se sustituye la de un instituto
  cuando publica otra más reciente.
- `SEATS` y `R23`: reparto y resultados de 2023. No se tocan salvo error demostrado.
- El test (`QROWS`, `HELP`, `QW`, `OVERRIDES`) solo se toca si un partido cambia su postura
  oficial de forma documentada.

## Procedimiento de una revisión

1. `git pull` (o `git fetch origin main && git reset --hard origin/main` en un clon limpio).
2. Buscar en la web qué ha pasado desde la fecha de `VERIFIED`: tribunales y causas que
   salen en las fichas, encuestas nuevas, debates, listas, decretos y Junta Electoral.
   Revisar también si alguna `KEY_DATES` ha cambiado.
3. Editar `index.html` con cambios mínimos y precisos (nada de reescribir secciones).
4. Ejecutar `node scripts/check.mjs`. Tiene que terminar con «OK».
5. Commit en `main` con un mensaje descriptivo en español y `git push origin main`.
6. Comprobar el despliegue a través de GitHub, no de vercel.app (desde el entorno de las
   revisiones el acceso a vercel.app está bloqueado; es normal y no hay que avisar de ello).
   Al cabo de un minuto, ejecutar:
   `gh api repos/Jorgemori06/radiografia-29n/commits/$(git rev-parse HEAD)/statuses --jq '.[0] | "\(.state) \(.description)"'`
   - `success Deployment has completed`: está publicado. Decir solo «publicado».
   - `pending` o sin respuesta todavía: esperar 1 minuto y repetir, hasta 5 veces.
   - `failure` o `error`: avisar a Jorge de que Vercel ha fallado en ese commit.
7. Enviar a Jorge un resumen breve: qué se ha añadido o cambiado, con las fuentes, y qué se
   ha visto pero se ha dejado fuera y por qué. Si no hay nada relevante, se dice y no se
   hace commit.
