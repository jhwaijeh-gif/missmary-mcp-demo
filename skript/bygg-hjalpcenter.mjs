// Gör om Zendesks publika artikellista till data/hjalpartiklar.json.
// Hämtningen är ett enda anrop mot Zendesks öppna läsadress, utan inloggning:
//   https://support.missmary.com/api/v2/help_center/sv/articles.json?per_page=100
// Körs: node skript/bygg-hjalpcenter.mjs <artiklar.json> <sektioner.json> <hamtdatum>

import fs from "node:fs";
import path from "node:path";

const [artFil, sekFil, datum] = process.argv.slice(2);
const art = JSON.parse(fs.readFileSync(artFil, "utf8"));
const sek = sekFil ? JSON.parse(fs.readFileSync(sekFil, "utf8")) : { sections: [] };
const sektionsNamn = Object.fromEntries((sek.sections || []).map((s) => [s.id, s.name]));

function text(html) {
  return String(html || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li|h\d|div|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*/g, "\n")
    .trim();
}

const artiklar = art.articles
  .filter((a) => !a.draft)
  .map((a) => ({
    id: String(a.id),
    rubrik: a.title.trim(),
    sektion: sektionsNamn[a.section_id] || null,
    text: text(a.body),
    uppdaterad: a.updated_at?.slice(0, 10) || null,
    lank: a.html_url,
  }));

const ut = {
  hamtad: datum,
  kalla: "Zendesks publika hjälpcenter för Miss Mary, svenska artiklar",
  antal: artiklar.length,
  artiklar,
};
const mal = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "data", "hjalpartiklar.json");
fs.writeFileSync(mal, JSON.stringify(ut, null, 2) + "\n", "utf8");
console.log(`Skrev ${artiklar.length} artiklar till ${mal}`);
