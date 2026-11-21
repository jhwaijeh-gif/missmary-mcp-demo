# Kom igång: storleks- och regelhjälpen

_Demo byggd av Jude Hwaijeh inför ansökan, inte en officiell Miss Mary-tjänst._

**För vem:** dig som svarar kunder i kundtjänst.
**Vad det är:** fyra verktyg som Claude kan använda när du klistrar in en kundfråga. Claude hämtar fakta ur storleksguiden, produktsidorna, regelsidorna och hjälpcentret, och skriver ett utkast med länk till källan.
**Det viktigaste:** verktyget föreslår, du svarar kunden. Läs alltid utkastet och öppna källänken innan du skickar.

## Kom åt det

**Utan Claude:** öppna testsidan, https://missmary-mcp-demo.vercel.app. Välj flik, fyll i, tryck på knappen.

**I Claude:**
1. Inställningar, sedan Kopplingar (Connectors), sedan Lägg till anpassad koppling.
2. Namn: Storlekshjälpen demo. Adress: https://missmary-mcp-demo.vercel.app/mcp
3. Ny chatt. Slå på kopplingen under verktygsknappen i chattfältet.

I Claude Team och Enterprise lägger en administratör till kopplingen för organisationen först.

## Vad det kan

| Fråga från kunden | Verktyget |
|---|---|
| "Jag mäter 78 under bysten och 98 runt. Vilken storlek?" | Storlek och passform |
| "80F sitter tajt i ryggen. Vad kan jag prova?" | Storlek och passform, systerstorlekar |
| "Har ni en bygelfri bh i bomull i 95F?" | Produktsök |
| "Finns Stay Fresh i svart i 85G?" | Lager |
| "Hur returnerar jag?" "Hur tvättar jag den?" | Retur, frakt, tvätt och material |

## Tre frågor att prova först

1. `Kunden har undersida 78 och byst 98. Vilken storlek ska hon ta, och vilka systerstorlekar finns?`
2. `Har ni bikinis i storlek 80F? Skriv ett kort svar till kunden med länkar.`
3. `Kunden vill returnera en bh hon fått för två veckor sedan. Vad gäller, och vad kostar det?`

## Vad det inte kan

- **Se en viss kunds order, retur eller paket.** Det slår du upp i ordersystemet som vanligt.
- **Visa antal i lager eller när något kommer in.** Bara finns eller slut, som det stod 21 november 2026.
- **Hela sortimentet.** Demon har 35 produktsidor.
- **Veta något som inte står publikt.** Står svaret inte i källan, säger verktyget det.

## Tumregler

- **Läs källan.** Varje svar har en länk. Öppna den när svaret gäller pengar, datum eller en regel.
- **Kolla datumet.** Datan är en ögonblicksbild. Priser kan vara kampanjpriser.
- **Inga personuppgifter i chatten.** Skriv "kunden", inte namn, mejl eller ordernummer.
- **Varningar betyder något.** Säger verktyget att en tabellrad ser felskriven ut: stäm av innan du ger rådet.
- **Skriv i er egen ton.** Be Claude korta, värma eller översätta utkastet. Personlig kundtjänst är ert löfte, verktyget är bara stödet.
