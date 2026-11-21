# Driftblad: storleks- och regelhjälpen

_Demo byggd av Jude Hwaijeh inför ansökan, inte en officiell Miss Mary-tjänst. Det jag inte vet om era system står som frågor, inte som antaganden. Systemen jag nämner är de som står i annonsen._

## Det som gäller i dag

| | |
|---|---|
| Vad | MCP-server med fyra verktyg som bara läser |
| Var | Vercel, gratisplanen, eget projekt. Adress: {{ADRESS}}/mcp |
| Kod | https://github.com/jhwaijeh-gif/missmary-mcp-demo, publik, MIT |
| Data | Ögonblicksbild 21 november 2026: 35 produktsidor, storleksguiden, nio regelstycken, 61 hjälpartiklar |
| Nycklar | Inga. All data är publik |
| Inloggning | Ingen. Vem som helst med adressen kan använda den |
| Personuppgifter | Inga. Verktygen kan inte se kunder eller ordrar |
| Loggar | Vercels vanliga anropsloggar. Frågorna sparas inte av koden |
| Ägare | Jude Hwaijeh, tills vidare |

## Datakällorna och vad som krävs för att byta

| Datakälla | I dag | Byts mot | Frågor till er |
|---|---|---|---|
| Produkter och lager | Fil, 35 produktsidor | Centra | Kan er befintliga MCP-server för Centra användas, eller ska verktyget läsa Centra själv? Finns en nyckel som bara får läsa produkter och lager? |
| Lagersaldo och inleverans | Finns inte | Centra eller Logent | Var finns det mest aktuella saldot: i Centra, i Dynamics 365 eller hos Logent? Får kundtjänst se antal? |
| Storleksguiden | Fil | Storyblok | Ligger storleksguiden som en sida i Storyblok? Vem ändrar den? |
| Regler | Fil, nio stycken | Storyblok | Vilken text är den gällande när retursidan och hjälpcentret säger olika? |
| Hjälpcentret | Fil, 61 artiklar | Zendesk med nyckel | Ska interna artiklar och makron vara med? Vem får skapa en Zendesk-nyckel som bara läser? |
| Order och retur | Finns inte | Centra | Vill ni alls att ett AI-verktyg ser ordrar? Vem ansvarar för dataskyddet, och vad säger er AI-policy? |

## Nycklar och behörigheter

- En nyckel per system, med lägsta möjliga behörighet: läsa, aldrig skriva.
- Nyckeln ligger som hemlig miljövariabel hos värden. Aldrig i koden, aldrig i Git, aldrig i en chatt.
- Frågor: var förvarar ni nycklar i dag? Vem får skapa och återkalla dem? Hur ofta byts de?

## Var den ska ligga

- Ni kör MCP-servrar för Centra och Storyblok på Cloudflare Workers enligt annonsen. Koden här är vanlig JavaScript och går att flytta dit.
- Frågor: ska den ligga hos er, bredvid de andra? Vem i Tech-teamet äger den då?
- Med kunddata behöver kopplingen inloggning, så att bara er personal når den. Fråga: hur loggar ni in i era andra MCP-servrar i dag?

## Hur ni mäter om den hjälper

Mät före och efter, på samma ärendetyper:

| Mått | Var det finns | Fråga till er |
|---|---|---|
| Tid per ärende för storleks- och returfrågor | Zendesk | Går det att filtrera ärenden på ämne? |
| Andel ärenden där verktyget användes | Vercels loggar plus en enkel fråga till personalen | Räcker en veckovis avstämning med en Champion? |
| Fel i utkasten | Personalen noterar | Var ska de notera, och vem läser? |
| Returer med orsak "fel storlek" | Centra | Följer ni redan returorsak per modell? |

## När något är fel

- Varje svar har en källänk och ett datum. Medarbetaren kontrollerar källan och skickar själv.
- Ett fel i ett svar beror nästan alltid på datan. Rätta i källan, inte i koden.
- Stäng av: ta bort kopplingen i Claude, eller stäng projektet hos värden. Inget annat system påverkas.

## Underhåll

- Ögonblicksbilden blir gammal. Med riktiga kopplingar försvinner problemet.
- Tills dess: kör skripten i `skript/` igen och byt filerna i `data/`. Det tar några minuter.
- Fråga: vem ska äga verktyget efter testet, och hur ofta ska datan uppdateras?
