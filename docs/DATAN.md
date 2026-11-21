# Datan: vad som hämtades och hur

_Demo byggd av Jude Hwaijeh inför ansökan, inte en officiell Miss Mary-tjänst._

**Hämtad:** 21 november 2026, mellan kl. 17.15 och 17.30.

## Reglerna för hämtningen

- Bara publika sidor. Ingen inloggning, inget konto, inget formulär, inget köp.
- robots.txt lästes först på båda adresserna. Allt som hämtades är tillåtet där.
- En sida i taget, med 4 sekunders paus mellan produktsidorna.
- 56 anrop totalt, och inga fler. Demon läser sedan bara filerna i `data/`, aldrig sajten.

| Vad | Anrop | Varifrån |
|---|---|---|
| robots.txt | 2 | missmary.se, support.missmary.com |
| Sitemap för produkter och sidor (svenska marknaden) | 2 | missmary.se/sitemap/products/se och /sitemap/links/se |
| Kategorisidor för att välja produkter | 9 | best-sellers, bestsellers-bras, bikinis, swimsuits, minimizer-bras, front-closure, mastectomy-bra, sport-bra, shapewear |
| Produktsidor | 35 | En per produkt och färg |
| Storleksguiden och regelsidor | 6 | size-chart, retur, betalning och leverans, 100-tvättarsgaranti, tull, ångerrätt |
| Hjälpcentret | 2 | Zendesks öppna läsadress: alla svenska artiklar och sektionerna |

## Filerna

| Fil | Innehåll | Byggd med |
|---|---|---|
| `data/produkter.json` | 35 produktsidor: namn, färg, typ, pris, material, tvättråd, fördelar och varje storlek med artikelnummer, EAN och finns eller slut | `skript/bygg-produkter.mjs`, läser datablocket (JSON-LD) och sidtexten |
| `data/storlekstabell.json` | Bh-tabellen (band och kupa), trosor, dubbelstorlekar, baddräkt | `skript/bygg-storlekstabell.mjs`, avskriven exakt som den stod |
| `data/regler.json` | Nio stycken ur regelsidorna, med länk | För hand, ur sidtexten |
| `data/hjalpartiklar.json` | 61 svenska hjälpartiklar med rubrik, text, datum och länk | `skript/bygg-hjalpcenter.mjs` |

## Urvalet: 35 produktsidor

Bästsäljarna enligt sidorna "Bästsäljare" och "Bästsäljande bh:ar", plus en eller två ur varje kategori som kundtjänst rimligen får frågor om.

| Grupp | Produkter |
|---|---|
| Bästsäljande bh:ar (12) | Stay Fresh med sidvinge (svart, beige), Lovely Lace Support (beige, röd), Smooth Divide (svart, beige), Cotton Divide (svart, beige), Feel Fresh (svart, vit), Organic Cotton t-shirt bh (svart), Lace Charm (champagne) |
| Bästsäljande trosor (5) | Cool Sensation med långa ben (svart, beige, mörkblå), 4-pack Organic Cotton maxitrosa, 4-pack Recycled Comfort maxitrosa |
| Minimizer och framknäppt (4) | Cotton Now Minimizer, Nova framknäppt, Cotton X-Back med framknäppning, Stay Fresh framknäppt |
| Protes-bh (1) | Ava |
| Sport-bh (2) | Exhale Comfort med och utan bygel |
| Bikini (6) | Bondi bh och trosa, Maya, Jungle Summer, Azur, Aruba trosa |
| Baddräkt (3) | Malva, Azur, Aurora baddräktsklänning |
| Shapewear (2) | Cool Sensation Soft Shape body, Contour Curve trosa med långa ben |

Varje färg har en egen sida med eget lager, därför räknas färgerna var för sig.

## Det som inte går att se i publik data

- Antal i lager. Bara finns eller slut.
- När en vara kommer in igen.
- Svaren på produktsidornas egna vanliga frågor. De laddas först när man klickar, så de finns inte i den sparade sidan.
- Innehållet i de hopfällda rutorna på retursidan ("Hur returnerar jag?", "Byten" med flera). Samma ämnen finns i hjälpartiklarna, som är med.

## Det jag såg i datan

Skrivet som iakttagelser. Kontrollera på sajten innan något används.

**1. Storlekstabellen, band 85, kupa G.** Tabellen säger:

| Band 85 | E | F | G | H |
|---|---|---|---|---|
| Runt bysten, cm | 105-108 | 108-110 | **108-112** | 112-114 |

På alla andra rader börjar nästa kupa där den förra slutar. Band 80 har F 103-105 och G 105-107. Band 90 har F 113-115 och G 115-117. På rad 85 börjar G på 108, samma som F. Troligen ska det stå 110-112. Verktyget `rakna_storlek` hittar det själv: med måtten 86 och 109 säger det att raden ser felskriven ut och att rådet ska stämmas av. Det är så tabellen stod i sidans HTML 21 november 2026, läst direkt ur tabellkoden.

**2. Återbetalningstiden står på två sätt.** Sidan Betalning och leverans: "normalt inom 14 arbetsdagar". Hjälpartikeln Registrera returen online: "inom två veckor". Två veckor är tio arbetsdagar.

**3. Returkostnaden beskrivs olika.** Retursidan: "Returfrakt betalas av kunden". Hjälpartikeln Kostar det något att returnera?: returkostnaden på 49 kr är redan betald och dras av vid återbetalningen. Artikeln Registrera returen online kallar samma 49 kr en administrationsavgift. Det går att läsa ihop, men en kund kan fråga.

**4. En engelsk kortbeskrivning.** Cotton Divide har kortbeskrivningen på engelska i datablocket på den svenska sidan. Den syns i sökmotorer. Demon använder i stället första meningen i den svenska beskrivningen.

**5. 24 av 61 hjälpartiklar har under 200 tecken text.** En del är korta svar, till exempel om returkostnaden. Andra, som "BH med bygel" och "Minimizer bh", ser ut att vara länkar vidare till bloggen. Demon hoppar över de fyra artiklar som har under 40 tecken.

Produktnamn och texter är återgivna som de står på sidan, med deras egna skiljetecken.
