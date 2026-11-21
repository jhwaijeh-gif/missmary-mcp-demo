// Slår ihop Kom igång-guiden och övningarna till en utskriftsvänlig HTML-sida.
// Edge gör sedan PDF av den: msedge --headless --print-to-pdf=<fil.pdf> <sida.html>
// Körs: node skript/gor-pdf-html.mjs <utfil.html>

import fs from "node:fs";

const ut = process.argv[2];
const las = (f) => fs.readFileSync(new URL(`../docs/${f}`, import.meta.url), "utf8");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (s) =>
  esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/_([^_]+)_/g, "<em>$1</em>")
    .replace(/(https?:\/\/[^\s,)]*[^\s,).])/g, '<a href="$1">$1</a>');

function tillHtml(md) {
  const rader = md.split(/\r?\n/);
  const html = [];
  let i = 0;
  while (i < rader.length) {
    const r = rader[i];
    if (/^#{1,3} /.test(r)) {
      const n = r.match(/^#+/)[0].length;
      html.push(`<h${n}>${inline(r.slice(n + 1))}</h${n}>`);
      i++;
    } else if (r.startsWith("|")) {
      const tab = [];
      while (i < rader.length && rader[i].startsWith("|")) tab.push(rader[i++]);
      const celler = (t) => t.split("|").slice(1, -1).map((c) => inline(c.trim()));
      const [huvud, , ...kropp] = tab;
      html.push(
        "<table><thead><tr>" + celler(huvud).map((c) => `<th>${c}</th>`).join("") + "</tr></thead><tbody>" +
          kropp.map((t) => "<tr>" + celler(t).map((c) => `<td>${c}</td>`).join("") + "</tr>").join("") +
          "</tbody></table>"
      );
    } else if (/^\d+\. /.test(r)) {
      const lista = [];
      while (i < rader.length && /^\d+\. /.test(rader[i])) lista.push(rader[i++].replace(/^\d+\. /, ""));
      html.push("<ol>" + lista.map((l) => `<li>${inline(l)}</li>`).join("") + "</ol>");
    } else if (/^- /.test(r)) {
      const lista = [];
      while (i < rader.length && /^- /.test(rader[i])) lista.push(rader[i++].slice(2));
      html.push("<ul>" + lista.map((l) => `<li>${inline(l)}</li>`).join("") + "</ul>");
    } else if (r.trim() === "---") {
      html.push("<hr>");
      i++;
    } else if (r.trim() === "") {
      i++;
    } else {
      const stycke = [];
      while (i < rader.length && rader[i].trim() && !/^(#|\||- |\d+\. |---)/.test(rader[i])) stycke.push(rader[i++]);
      html.push(`<p>${stycke.map(inline).join("<br>")}</p>`);
    }
  }
  return html.join("\n");
}

const sida = `<!doctype html>
<html lang="sv"><head><meta charset="utf-8"><title>Storleks- och regelhjälpen: guide och övningar</title>
<style>
  @page { size: A4; margin: 18mm 16mm 18mm 16mm; }
  body { font: 10.5pt/1.5 "Segoe UI", system-ui, sans-serif; color: #1d1b19; }
  .markning { background: #fff4dc; color: #6b4600; padding: 6pt 10pt; border-radius: 4pt; font-weight: 600; font-size: 9.5pt; margin-bottom: 12pt; }
  h1 { font-size: 19pt; margin: 0 0 8pt; line-height: 1.2; }
  h2 { font-size: 13pt; margin: 16pt 0 6pt; color: #7a3b4f; }
  h3 { font-size: 11pt; margin: 12pt 0 4pt; }
  p { margin: 0 0 7pt; }
  table { border-collapse: collapse; width: 100%; margin: 4pt 0 10pt; font-size: 9.5pt; }
  th, td { border: 1px solid #e3ded7; padding: 4pt 6pt; text-align: left; vertical-align: top; }
  th { background: #f4f0eb; }
  code { font-family: Consolas, monospace; font-size: 9pt; background: #f4f0eb; padding: 1pt 3pt; border-radius: 3pt; }
  a { color: #7a3b4f; }
  hr { border: 0; border-top: 1px solid #e3ded7; margin: 10pt 0; }
  ul, ol { margin: 0 0 8pt; padding-left: 18pt; }
  .ny-sida { break-before: page; }
  h2, h3 { break-after: avoid; }
  table, li { break-inside: avoid; }
</style></head><body>
<div class="markning">Demo byggd av Jude Hwaijeh inför ansökan, inte en officiell Miss Mary-tjänst.</div>
${tillHtml(las("KOM-IGANG.md"))}
<div class="ny-sida"></div>
${tillHtml(las("OVNINGAR.md"))}
</body></html>`;

fs.writeFileSync(ut, sida, "utf8");
console.log("Skrev", ut);
