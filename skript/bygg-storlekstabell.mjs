// Läser storleksguiden (https://www.missmary.se/se/blog/size-chart) och skriver
// data/storlekstabell.json. Tabellerna skrivs av som de står, även raden 85 G.
// Körs: node skript/bygg-storlekstabell.mjs <size-chart.html> <hamtdatum>

import fs from "node:fs";
import path from "node:path";

const [fil, datum] = process.argv.slice(2);
const html = fs.readFileSync(fil, "utf8");

const tabeller = [...html.matchAll(/<table[\s\S]*?<\/table>/g)].map((t) =>
  [...t[0].matchAll(/<tr[\s\S]*?<\/tr>/g)].map((r) =>
    [...r[0].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map((c) => c[1].replace(/<[^>]+>/g, "").trim())
  )
);

const intervall = (s) => {
  const [a, b] = s.split("-").map(Number);
  return [a, b ?? a];
};

// Tabell 1: underbyst i cm till bandstorlek.
const band = tabeller[0].slice(1).map(([cm, storlek]) => ({ underbyst: intervall(cm), band: Number(storlek) }));

// Tabell 2: kupstorlek per band, mått runt bysten i cm.
const [huvud, ...rader] = tabeller[1];
const kupor = huvud.slice(1);
const kupa = rader.map((r) => ({
  band: Number(r[0]),
  kupor: Object.fromEntries(kupor.map((k, i) => [k, intervall(r[i + 1])])),
}));

const trosor = tabeller[2].slice(1).map(([storlek, midja, hoft]) => ({ storlek, midja: Number(midja), stuss: Number(hoft) }));
const dubbelstorlekar = tabeller[3].slice(1).map(([midja, hoft, storlek]) => ({ midja: intervall(midja), stuss: intervall(hoft), storlek }));
const baddrakt = tabeller[4].slice(1).map(([byst, midja, hoft, storlek]) => ({ byst: Number(byst), midja: Number(midja), stuss: Number(hoft), storlek }));

const ut = {
  hamtad: datum,
  kalla: "https://www.missmary.se/se/blog/size-chart",
  forklaring: "Alla mått i centimeter, mått på kroppen och inte på plagget. Avskrivet exakt som tabellen stod på sidan.",
  kupordning: kupor,
  bh: { band, kupa },
  trosor,
  dubbelstorlekar,
  baddrakt,
};
const mal = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "data", "storlekstabell.json");
fs.writeFileSync(mal, JSON.stringify(ut, null, 2) + "\n", "utf8");
console.log("Skrev", mal);
