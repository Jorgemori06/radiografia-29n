// Comprobaciones antes de publicar: sintaxis del script y coherencia de los datos.
// Uso: node scripts/check.mjs
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import vm from "node:vm";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const errors = [];

// 1. Sintaxis de los <script> en línea
const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const dir = mkdtempSync(join(tmpdir(), "chk-"));
inline.forEach((code, i) => {
  const f = join(dir, `s${i}.js`);
  writeFileSync(f, code);
  try { execFileSync(process.execPath, ["--check", f], { stdio: "pipe" }); }
  catch (e) { errors.push(`Error de sintaxis en el script ${i}:\n${e.stderr}`); }
});

// 2. Evaluar solo la parte de datos (de ELECTION_DATE a UTILIDADES)
const main = inline.find(c => c.includes("const ELECTION_DATE"));
const start = main.indexOf("const ELECTION_DATE");
const end = main.indexOf("const $ = s =>");
const data = main.slice(start, end);
const keyDatesBlock = (main.match(/const KEY_DATES = \[[\s\S]*?\n\];/) || [""])[0];
const ctx = {};
vm.createContext(ctx);
try {
  vm.runInContext(data + "\n" + keyDatesBlock +
    "\nthis.out={S,TYPE,PARTIES,TIMELINE,POLLS,QUESTIONS,KEY_DATES:typeof KEY_DATES!=='undefined'?KEY_DATES:[],VERIFIED};", ctx);
} catch (e) { errors.push("Error al evaluar los datos: " + e.message); }
const D = ctx.out;

if (D) {
  const ids = new Set(D.PARTIES.map(p => p.id));
  const types = new Set(Object.keys(D.TYPE));
  const isUrl = s => typeof s === "string" && /^https:\/\/\S+$/.test(s);

  for (const [k, v] of Object.entries(D.S)) if (!isUrl(v)) errors.push(`S.${k} no es una URL https válida`);

  const checkItem = (o, where) => {
    if (!types.has(o.t)) errors.push(`${where}: tipo desconocido «${o.t}»`);
    if (!o.x || o.x.length < 10) errors.push(`${where}: texto vacío o demasiado corto`);
  };

  if (D.PARTIES.length !== 12) errors.push(`Hay ${D.PARTIES.length} partidos (se esperaban 12)`);
  for (const p of D.PARTIES) {
    for (const sec of ["hemeroteca", "corrupcion", "economia"]) {
      (p[sec] || []).forEach((o, i) => checkItem(o, `${p.id}.${sec}[${i}]`));
    }
    if (!p.resumen || !p.paradoja) errors.push(`${p.id}: falta resumen o paradoja`);
  }

  // Toda referencia S.clave del código debe existir
  for (const m of main.matchAll(/\bS\.(\w+)/g)) if (!(m[1] in D.S)) errors.push(`Fuente S.${m[1]} usada pero no definida`);

  D.TIMELINE.forEach((e, i) => {
    checkItem(e, `TIMELINE[${i}] ${e.d}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.d)) errors.push(`TIMELINE[${i}]: fecha mal formada ${e.d}`);
    for (const id of e.p) if (id !== "general" && !ids.has(id)) errors.push(`TIMELINE[${i}]: partido desconocido «${id}»`);
  });

  let prev = "";
  D.KEY_DATES.forEach((k, i) => {
    if (k.d < prev) errors.push(`KEY_DATES[${i}]: fuera de orden`);
    if ("s" in k && k.s === undefined) errors.push(`KEY_DATES[${i}]: fuente indefinida`);
    prev = k.d;
  });

  D.POLLS.forEach((p, i) => { if (!isUrl(p.s)) errors.push(`POLLS[${i}] (${p.firm}): fuente inválida`); });
  if (D.QUESTIONS.length !== 50) errors.push(`El test tiene ${D.QUESTIONS.length} preguntas (se esperaban 50)`);

  // La fecha del pie debe coincidir con VERIFIED
  const m = html.match(/Datos verificados a (\d+) de (\w+) de (\d{4})/);
  const meses = { enero: "ene", febrero: "feb", marzo: "mar", abril: "abr", mayo: "may", junio: "jun", julio: "jul", agosto: "ago", septiembre: "sep", octubre: "oct", noviembre: "nov", diciembre: "dic" };
  if (!m || `${m[1]} ${meses[m[2]]} ${m[3]}` !== D.VERIFIED) errors.push(`El pie («${m && m[0]}») no coincide con VERIFIED («${D.VERIFIED}»)`);
}

if (errors.length) { console.error("FALLOS:\n- " + errors.join("\n- ")); process.exit(1); }
console.log(`OK · ${D.TIMELINE.length} entradas de cronología · ${D.POLLS.length} encuestas · verificado ${D.VERIFIED}`);
