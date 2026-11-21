// Enkel textsökning på svenska. Ingen AI här: bara ord som jämförs.
// Varje ord kortas till sina första fem bokstäver, så att "returnerar",
// "returen" och "retur" räknas som samma ord.

const STOPPORD = new Set(
  ("och att det som en ett är på av för med till den har de inte om ni vi jag du hon han man " +
    "min mitt mina din ditt dina sin sitt sina hur vad vilken vilket vilka när var varför kan ska " +
    "skall får fick finns gäller kund kunden kunder vill har hade blir bli sig mig dig oss er " +
    "någon något några här där också bara mycket eller men så nu efter före från över under " +
    "storlek storleken storlekar tack hej snälla")
    .split(" ")
);

// Ord som betyder samma sak för kunden men står olika i texterna.
const SYNONYMER = {
  retur: ["retur"],
  skick: ["retur"],
  tillb: ["retur", "återb"],
  penga: ["återb"],
  refun: ["återb"],
  tvätt: ["tvätt", "skötsel"],
  sköts: ["tvätt", "sköts"],
  frakt: ["frakt", "lever"],
  lever: ["lever", "frakt"],
  paket: ["paket", "lever"],
  kosta: ["kosta", "avgif"],
  byta: ["byte", "byta"],
  byte: ["byte", "byta"],
  ånger: ["ånger", "ångra"],
  ångra: ["ånger", "ångra"],
  betal: ["betal"],
  garan: ["garan"],
  tull: ["tull"],
  reklam: ["rekla"],
  rekla: ["rekla"],
  trasi: ["rekla", "garan"],
  mater: ["mater"],
  tyg: ["mater"],
};

export function normalisera(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-zåäöéü0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function stam(ord) {
  return ord.length <= 5 ? ord : ord.slice(0, 5);
}

// Gör om en fråga till en lista med ordstammar. Varje post är en lista med
// alternativ: träff på något av dem räknas.
export function sokord(fraga) {
  return normalisera(fraga)
    .split(" ")
    .filter((o) => o.length >= 3 && !STOPPORD.has(o))
    .map((o) => {
      const s = stam(o);
      return [...new Set([s, ...(SYNONYMER[s] || [])])];
    });
}

// Räknar hur många av sökorden som finns i texten.
export function poang(text, ord) {
  const stammar = new Set(normalisera(text).split(" ").map(stam));
  let p = 0;
  for (const alternativ of ord) {
    if (alternativ.some((a) => stammar.has(a))) p++;
  }
  return p;
}

// Plockar de stycken i en lång text som bäst matchar sökorden.
export function utdrag(text, ord, maxTecken = 600) {
  const stycken = String(text)
    .split(/\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (stycken.length === 0) return "";
  const rankade = stycken
    .map((s, i) => ({ s, i, p: poang(s, ord) }))
    .sort((a, b) => b.p - a.p || a.i - b.i);
  const valda = [];
  let langd = 0;
  for (const r of rankade) {
    if (langd + r.s.length > maxTecken && valda.length > 0) break;
    valda.push(r);
    langd += r.s.length;
  }
  valda.sort((a, b) => a.i - b.i);
  let ut = valda.map((v) => v.s).join(" ");
  if (ut.length > maxTecken) ut = ut.slice(0, maxTecken).replace(/\s+\S*$/, "") + " ...";
  return ut;
}
