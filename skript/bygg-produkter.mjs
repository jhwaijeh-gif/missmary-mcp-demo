// Gör om sparade produktsidor (HTML) till data/produkter.json.
// Körs en gång efter hämtningen: node skript/bygg-produkter.mjs <mapp-med-html> <hamtdatum>
// Läser bara det som står publikt på sidan: datablocket (JSON-LD) och sidtexten.

import fs from "node:fs";
import path from "node:path";

const mapp = process.argv[2];
const datum = process.argv[3] || new Date().toISOString().slice(0, 10);
if (!mapp) {
  console.error("Ange mappen med sparade produktsidor.");
  process.exit(1);
}

// Färgen står sist i adressen. Svenska namn för de färger som finns i urvalet.
const FARGER = {
  "black-white": "svart och vit",
  "black-beige": "svart och beige",
  "beige-white": "beige och vit",
  english_red: "röd (English red)",
  dark_blue: "mörkblå",
  navy_blue: "marinblå",
  dusty_pink: "gammelrosa",
  soft_aqua: "aqua",
  black: "svart",
  beige: "beige",
  white: "vit",
  green: "grön",
  champagne: "champagne",
  petrol: "petrol",
  coral: "korall",
  taupe: "taupe",
  lavender: "lavendel",
  peach: "persika",
};

function farg(slug) {
  for (const [nyckel, namn] of Object.entries(FARGER)) {
    if (slug.endsWith("-" + nyckel)) return namn;
  }
  return null; // Färgen står inte i adressen. Se produktsidan.
}

function typ(slug) {
  if (slug.includes("bikini-panty")) return "bikinitrosa";
  if (slug.includes("bikini-bra")) return "bikini-bh";
  if (slug.includes("swimsuit") || slug.includes("swimdress")) return "baddräkt";
  if (slug.includes("body")) return "body";
  if (slug.includes("panty")) return "trosa";
  return "bh";
}

function textAv(html) {
  return html
    .replace(/<!--.*?-->/gs, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function falt(html, etikett) {
  const re = new RegExp(
    `<label[^>]*>${etikett}:?</label><h4[^>]*>(.*?)</h4>`,
    "s"
  );
  const m = html.match(re);
  return m ? textAv(m[1]).replace(/^[:\s]+/, "").replace(/\s+,/g, ",").replace(/\.$/, "") : null;
}

function normaliseraStorlek(namn) {
  // "105xG" blir "105G". Trosor och baddräkter har till exempel "M" eller "40".
  return namn.replace(/x/i, "").toUpperCase().trim();
}

const produkter = [];
for (const fil of fs.readdirSync(mapp).filter((f) => f.endsWith(".html")).sort()) {
  const slug = fil.replace(/\.html$/, "");
  const html = fs.readFileSync(path.join(mapp, fil), "utf8");

  const block = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>(.*?)<\/script>/gs)]
    .map((m) => {
      try {
        return JSON.parse(m[1]);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  const p = block.find((b) => b["@type"] === "Product");
  if (!p) {
    console.warn("Inget produktblock i", fil);
    continue;
  }

  // Beskrivningen står närmast före punktlistan med fördelar.
  const forstaPunkt = html.indexOf('<li class="empty:hidden list-disc"');
  const listStart = forstaPunkt > 0 ? html.lastIndexOf("<ul", forstaPunkt) : -1;
  let beskrivning = null;
  let fordelar = [];
  if (listStart > 0) {
    const fore = html.slice(Math.max(0, listStart - 8000), listStart);
    const delar = fore.split(/<[^>]+>/).map((s) => textAv(s)).filter((s) => s.length > 0);
    beskrivning = delar[delar.length - 1] || null;
    const listSlut = html.indexOf("</ul>", listStart);
    fordelar = [...html.slice(listStart, listSlut).matchAll(/<li[^>]*>(.*?)<\/li>/gs)]
      .map((m) => textAv(m[1]))
      .filter(Boolean);
  }

  // Etiketterna på produktbilden, till exempel "Extra bred rygg".
  const etiketter = [
    ...new Set(
      [...html.matchAll(/rounded-md bg-black text-white[^"]*">([^<]{2,40})<\/div>/g)].map((m) =>
        textAv(m[1])
      )
    ),
  ];

  const storlekar = (p.model || []).map((v) => ({
    storlek: normaliseraStorlek(v.size?.name || ""),
    artikelnummer: v.sku,
    ean: v.gtin13 || null,
    iLager: v.offers?.availability === "InStock",
  }));

  produkter.push({
    id: slug,
    namn: p.name,
    farg: farg(slug),
    typ: typ(slug),
    bygel: slug.includes("non-wired") ? "utan bygel" : slug.includes("underwired") ? "med bygel" : null,
    artikelnummer: p.sku,
    pris: p.offers?.lowPrice ?? p.offers?.price ?? null,
    valuta: p.offers?.priceCurrency || "SEK",
    kortBeskrivning: p.description || null,
    beskrivning,
    fordelar,
    etiketter,
    material: falt(html, "Material"),
    tvatt: falt(html, "Tvättinstruktioner"),
    hakOchHysk: falt(html, "Hak och hysk"),
    bild: Array.isArray(p.image) ? p.image[0] : p.image || null,
    lank: `https://www.missmary.se/se/${slug}`,
    storlekar,
  });
}

const ut = {
  hamtad: datum,
  kalla: "Publika produktsidor på missmary.se, datablocket (JSON-LD) och sidtexten",
  antal: produkter.length,
  produkter,
};
const mal = path.join(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, "$1"), "..", "data", "produkter.json");
fs.writeFileSync(mal, JSON.stringify(ut, null, 2) + "\n", "utf8");
console.log(`Skrev ${produkter.length} produkter till ${mal}`);
