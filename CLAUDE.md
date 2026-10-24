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
6. Comprobar al minuto que https://radiografia-29n.vercel.app/ sirve el cambio
   (por ejemplo, buscando el texto nuevo).
7. Enviar a Jorge un resumen breve: qué se ha añadido o cambiado, con las fuentes, y qué se
   ha visto pero se ha dejado fuera y por qué. Si no hay nada relevante, se dice y no se
   hace commit.
