// Testar de fyra verktygen med riktiga kundfrågor.
//   node skript/testa.mjs                      kör verktygen direkt på datorn
//   node skript/testa.mjs https://<adressen>   kör samma frågor mot MCP-servern på nätet

const FRAGOR = [
  ["rakna_storlek", { underbyst: 78, overbyst: 98 }, "Kund har undersida 78 och byst 98, vilken storlek?"],
  ["rakna_storlek", { underbyst: 86, overbyst: 109 }, "Rad 85 där F och G överlappar"],
  ["rakna_storlek", { nuvarandeStorlek: "80F" }, "Vilka systerstorlekar har 80F?"],
  ["sok_produkter", { fritext: "bikinis", storlek: "80F" }, "Har ni bikinis i storlek 80F?"],
  ["sok_produkter", { fritext: "bygelfri bh i bomull", storlek: "95F" }, "Bygelfri bh i bomull i 95F"],
  ["kolla_lager", { produkt: "Stay Fresh svart", storlek: "85G" }, "Finns Stay Fresh svart i 85G?"],
  ["kolla_lager", { produkt: "Feel Fresh vit", storlek: "80C" }, "Finns Feel Fresh vit i 80C?"],
  ["regler_och_skotsel", { fraga: "Hur returnerar jag?" }, "Hur returnerar jag?"],
  ["regler_och_skotsel", { fraga: "Hur tvättar jag den?", produkt: "Lovely Lace Support" }, "Tvätt för en produkt"],
  ["regler_och_skotsel", { fraga: "Var är mitt paket?" }, "Orderfråga som demon inte kan svara på"],
];

const adress = process.argv[2];
let fel = 0;

async function viaMcp(namn, args, id) {
  const svar = await fetch(adress.replace(/\/$/, "") + "/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id, method: "tools/call", params: { name: namn, arguments: args } }),
  });
  const json = await svar.json();
  if (json.error) throw new Error(JSON.stringify(json.error));
  return json.result.content[0].text;
}

let lokala = null;
if (!adress) lokala = (await import("../lib/verktyg.js")).VERKTYG;

if (adress) {
  const lista = await fetch(adress.replace(/\/$/, "") + "/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 0, method: "tools/list" }),
  }).then((r) => r.json());
  console.log("Verktyg på servern:", lista.result.tools.map((t) => t.name).join(", "), "\n");
}

let i = 1;
for (const [namn, args, rubrik] of FRAGOR) {
  console.log("=".repeat(70));
  console.log(`FRÅGA: ${rubrik}\nVERKTYG: ${namn} ${JSON.stringify(args)}\n`);
  try {
    const text = adress ? await viaMcp(namn, args, i++) : lokala.find((v) => v.namn === namn).kor(args);
    console.log(text, "\n");
  } catch (e) {
    fel++;
    console.log("FEL:", e.message, "\n");
  }
}
console.log(fel ? `${fel} fel` : "Alla frågor gav svar.");
process.exitCode = fel ? 1 : 0;
