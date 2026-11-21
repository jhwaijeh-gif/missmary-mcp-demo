# Storleks- och regelhjälpen (demo)

**Demo byggd av Jude Hwaijeh inför ansökan, inte en officiell Miss Mary-tjänst.** Ingen logga, inget samarbete. All data är publik och hämtades 21 november 2026 från missmary.se och support.missmary.com.

En liten MCP-server med fyra verktyg för en medarbetare i kundtjänst. Medarbetaren klistrar in en kundfråga i Claude. Claude väljer verktyg, hämtar fakta ur datan och skriver ett utkast med källänk. Medarbetaren läser, ändrar och skickar själv.

- **Testsidan, utan Claude:** startsidan för adressen där demon ligger.
- **MCP-servern, för Claude:** samma adress plus `/mcp`.

## De fyra verktygen

| Verktyg | Vad det gör | Läser |
|---|---|---|
| `rakna_storlek` | Bh-storlek ur mått under och runt bysten, och systerstorlekar. Flaggar tabellrader som ser felskrivna ut | Storlekstabellen |
| `sok_produkter` | Söker på egenskaper: material, bygel, typ, storlek, pris | 35 produktsidor |
| `kolla_lager` | Ja eller nej per storlek och färg. Systerstorlekar om storleken är slut | Samma produktsidor |
| `regler_och_skotsel` | Retur, ångerrätt, frakt, betalning, tvättgaranti, material och tvättråd | Regelsidorna och 61 hjälpartiklar |

Alla fyra bara läser. Inget verktyg kan ändra något, skicka något eller se en kund eller order.

## Så hänger det ihop

```
Medarbetaren skriver i Claude
        |
        v
Claude läser verktygslistan och väljer verktyg
        |
        v
api/mcp.js          tar emot anropet (MCP-protokollet)
        |
        v
lib/verktyg.js      de fyra verktygen, all logik
        |
        v
lib/kallor/*.js     fyra datakällor, en fil var
        |
        v
data/*.json         ögonblicksbilden från 21 november 2026
```

Testsidan (`public/index.html`) går genom `api/verktyg.js` till exakt samma `lib/verktyg.js`. Det finns alltså bara en logik, med två ingångar.

## Byt datakälla

Verktygen pratar aldrig med en sajt eller en fil direkt. De frågar en datakälla. Byt källan, så fungerar verktygen som förut.

| Fil | I dag | Byt mot | Vad som behövs |
|---|---|---|---|
| `lib/kallor/produkter.js` | `data/produkter.json`, 35 produktsidor | Centra | En läsnyckel med lägsta möjliga behörighet. Ger riktigt lagersaldo och hela sortimentet |
| `lib/kallor/storlekstabell.js` | `data/storlekstabell.json` | Storyblok, där storleksguiden ligger | Läsbehörighet |
| `lib/kallor/regler.js` | `data/regler.json`, nio stycken ur regelsidorna | Storyblok | Läsbehörighet |
| `lib/kallor/hjalpcenter.js` | `data/hjalpartiklar.json`, 61 artiklar | Zendesk med nyckel, så att makron och interna artiklar kommer med | En Zendesk-nyckel som bara får läsa |
| (finns inte) | Order och retur: verktyget säger att det kräver koppling | Centra | Personuppgifter. Avstämning med den som ansvarar för dataskydd först |

En nyckel läggs alltid som hemlig miljövariabel hos värden. Den skrivs aldrig in i koden och checkas aldrig in i Git.

## Mapparna

| Mapp | Vad |
|---|---|
| `api/` | De två ingångarna: `mcp.js` för Claude, `verktyg.js` för testsidan |
| `lib/` | Verktygen och sökningen. `kallor/` håller datakällorna |
| `data/` | Ögonblicksbilden. Datum står i varje fil |
| `public/` | Testsidan |
| `skript/` | Hur datan byggdes, en lokal server och testerna |
| `docs/` | Kom igång-guiden, fem övningar, driftbladet och hur datan hämtades |

## Köra själv

```
npm install
node skript/lokal-server.mjs          # http://localhost:3000 och http://localhost:3000/mcp
node skript/testa.mjs                 # tio kundfrågor direkt mot verktygen
node skript/testa.mjs https://<adress> # samma frågor mot den driftsatta servern
```

Driftsatt på Vercel, gratisplanen. `vercel.json` skickar `/mcp` till `api/mcp.js`.

## Dokumenten

- [Kom igång för kundtjänst](docs/KOM-IGANG.md)
- [Fem övningar för ett utbildningspass](docs/OVNINGAR.md)
- [Driftbladet](docs/DRIFTBLAD.md)
- [Datan: vad som hämtades och hur](docs/DATAN.md)

## Licens

Koden: MIT. Produkttexter, regler och hjälpartiklar i `data/` tillhör Miss Mary of Sweden och ligger här bara för demon.
