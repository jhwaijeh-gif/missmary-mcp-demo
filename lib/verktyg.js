// DE FYRA VERKTYGEN
//
// Varje verktyg har:
//   namn         det Claude anropar
//   titel        kort namn för människor
//   beskrivning  det Claude läser för att välja verktyg. Skrivs som en
//                instruktion: när verktyget ska användas och vad det inte kan.
//   indata       vilka uppgifter verktyget behöver (kontrolleras automatiskt)
//   kor          själva arbetet. Läser bara data, ändrar aldrig något.
//
// Verktygen pratar aldrig direkt med en sajt. De frågar datakällorna i
// lib/kallor/, och de går att byta utan att något här ändras.

import { z } from "zod";
import { allaProdukter, hamtad as produkterHamtade } from "./kallor/produkter.js";
import { storlekstabell } from "./kallor/storlekstabell.js";
import { allaRegler } from "./kallor/regler.js";
import { allaArtiklar } from "./kallor/hjalpcenter.js";
import { normalisera, sokord, poang, utdrag } from "./sok.js";

const MARKNING =
  "Demo byggd av Jude Hwaijeh inför ansökan, inte en officiell Miss Mary-tjänst. " +
  "Svaret är ett utkast: medarbetaren läser, ändrar och skickar själv.";

const STORLEKSGUIDE = "https://www.missmary.se/se/blog/size-chart";
const SYSTERARTIKEL =
  "https://support.missmary.com/hc/sv/articles/17042794907026-Systerstorlekar-det-magiska-tricket-med-kupstorlek";

function fot(kallor, datum) {
  return `\n\nKällor: ${kallor.join(" , ")}\nData hämtad ${datum}.\n${MARKNING}`;
}

// ---------- Storlekar ----------

const KUPOR = () => storlekstabell().kupordning; // A till J

// "80F", "80 F", "80xF", "80f" blir { band: 80, kupa: "F" }
export function lasBhStorlek(text) {
  const m = String(text || "").toUpperCase().replace(/\s|X/g, "").match(/^(\d{2,3})([A-J])$/);
  return m ? { band: Number(m[1]), kupa: m[2] } : null;
}

function systrar(band, kupa) {
  const k = KUPOR();
  const i = k.indexOf(kupa);
  const ut = [];
  if (band - 5 >= 70 && i + 1 < k.length) ut.push({ storlek: `${band - 5}${k[i + 1]}`, slag: "mindre band, större kupa" });
  if (band + 5 <= 120 && i - 1 >= 0) ut.push({ storlek: `${band + 5}${k[i - 1]}`, slag: "större band, mindre kupa" });
  return ut;
}

// Rader i tabellen där en kupa börjar innan kupan före har slutat.
function avvikelser(rad) {
  const k = KUPOR();
  const fel = [];
  for (let i = 1; i < k.length; i++) {
    const fore = rad.kupor[k[i - 1]];
    const denna = rad.kupor[k[i]];
    if (denna[0] < fore[1]) fel.push({ kupa: k[i], denna, fore, foreKupa: k[i - 1] });
  }
  return fel;
}

function raknaStorlek(underbyst, overbyst) {
  const t = storlekstabell();
  const rader = [];
  let bandRad = t.bh.band.find((b) => underbyst >= b.underbyst[0] && underbyst <= b.underbyst[1]);
  if (!bandRad) {
    const min = t.bh.band[0].underbyst[0];
    const max = t.bh.band[t.bh.band.length - 1].underbyst[1];
    if (underbyst < min || underbyst > max) {
      return { rader: [`Underbystmåttet ${underbyst} cm ligger utanför tabellen (${min} till ${max} cm). Hänvisa till kundtjänstens personliga rådgivning.`], storlekar: [] };
    }
    // Mellan två intervall, till exempel 72,5: närmaste band.
    bandRad = t.bh.band.reduce((bast, b) => {
      const avst = Math.min(Math.abs(underbyst - b.underbyst[0]), Math.abs(underbyst - b.underbyst[1]));
      return avst < bast.avst ? { b, avst } : bast;
    }, { b: null, avst: Infinity }).b;
    rader.push(`Underbyst ${underbyst} cm ligger mellan två intervall i tabellen. Närmast är band ${bandRad.band}.`);
  } else {
    rader.push(`Underbyst ${underbyst} cm ger band ${bandRad.band} (tabellen: ${bandRad.underbyst[0]} till ${bandRad.underbyst[1]} cm).`);
  }

  const rad = t.bh.kupa.find((r) => r.band === bandRad.band);
  const k = KUPOR();
  const traffar = k.filter((kupa) => overbyst >= rad.kupor[kupa][0] && overbyst <= rad.kupor[kupa][1]);

  if (traffar.length === 0) {
    const a = rad.kupor[k[0]];
    const j = rad.kupor[k[k.length - 1]];
    if (overbyst < a[0]) rader.push(`Överbyst ${overbyst} cm är mindre än kupa ${k[0]} i band ${bandRad.band} (${a[0]} cm).`);
    else if (overbyst > j[1]) rader.push(`Överbyst ${overbyst} cm är större än kupa ${k[k.length - 1]} i band ${bandRad.band} (${j[1]} cm). Tabellen räcker inte, hänvisa till personlig rådgivning.`);
    return { rader, storlekar: [] };
  }

  for (const kupa of traffar) {
    rader.push(`Överbyst ${overbyst} cm passar kupa ${kupa} i band ${bandRad.band} (tabellen: ${rad.kupor[kupa][0]} till ${rad.kupor[kupa][1]} cm).`);
  }

  const fel = avvikelser(rad).filter((f) => traffar.includes(f.kupa) || traffar.includes(f.foreKupa));
  for (const f of fel) {
    rader.push(
      `OBS, kontrollera tabellen: i band ${bandRad.band} står kupa ${f.kupa} som ${f.denna[0]} till ${f.denna[1]} cm, ` +
        `men kupa ${f.foreKupa} slutar först på ${f.fore[1]} cm. På de andra raderna börjar nästa kupa där den förra slutar. ` +
        `Raden ser ut att vara felskriven, så ge inte rådet utan att stämma av.`
    );
  }
  if (traffar.length > 1 && fel.length === 0) {
    rader.push(`Måttet ligger precis på gränsen mellan kupa ${traffar.join(" och ")}. Tabellen anger båda. Föreslå att kunden provar båda, eller utgår från storleken hon brukar trivas i.`);
  }
  return { rader, storlekar: traffar.map((kupa) => `${bandRad.band}${kupa}`) };
}

const raknaStorlekVerktyg = {
  namn: "rakna_storlek",
  titel: "Storlek och passform",
  beskrivning:
    "Räknar ut bh-storlek ur kundens mått enligt Miss Marys publika storlekstabell, och ger systerstorlekar " +
    "(samma kupvolym, annat band). Använd när en kund uppger mått under och över bysten, eller frågar vilken " +
    "systerstorlek hon kan prova. Ange underbyst och overbyst i centimeter, eller nuvarandeStorlek som till exempel 80F. " +
    "Gäller bh, bikini-bh och linnen. Svaret flaggar om tabellraden ser felskriven ut.",
  indata: {
    underbyst: z.number().min(40).max(160).optional().describe("Mått direkt under bysten i cm"),
    overbyst: z.number().min(50).max(200).optional().describe("Mått runt bysten där den är som fylligast, i cm"),
    nuvarandeStorlek: z.string().max(10).optional().describe("Storlek kunden har i dag, till exempel 80F"),
  },
  kor({ underbyst, overbyst, nuvarandeStorlek }) {
    const t = storlekstabell();
    const ut = [];
    let storlekar = [];

    if (underbyst != null && overbyst != null) {
      const r = raknaStorlek(underbyst, overbyst);
      ut.push("STORLEK ENLIGT TABELLEN", ...r.rader);
      storlekar = r.storlekar;
      if (storlekar.length) ut.push(`Förslag: ${storlekar.join(" eller ")}.`);
    } else if (underbyst != null || overbyst != null) {
      ut.push("Båda måtten behövs: under bysten och runt bysten där den är som fylligast.");
    }

    const egen = lasBhStorlek(nuvarandeStorlek);
    if (nuvarandeStorlek && !egen) ut.push(`Storleken "${nuvarandeStorlek}" gick inte att läsa. Skriv band och kupa, till exempel 80F.`);
    if (egen) storlekar = [...new Set([...storlekar, `${egen.band}${egen.kupa}`])];

    if (storlekar.length) {
      ut.push("", "SYSTERSTORLEKAR (samma kupvolym)");
      for (const s of storlekar) {
        const b = lasBhStorlek(s);
        const sys = systrar(b.band, b.kupa);
        ut.push(`${s}: ${sys.map((x) => `${x.storlek} (${x.slag})`).join(", ") || "inga inom tabellen"}.`);
      }
      ut.push(
        "Tumregeln i hjälpcentret: upp en storlek i band, ner en i kupa, eller tvärtom. " +
          "Behöver bysten lyft och stöd avråder artikeln från det större bandet, eftersom bh:n kan sitta för löst runt ryggen."
      );
    }

    if (ut.length === 0) ut.push("Ange mått (underbyst och overbyst i cm) eller en nuvarande storlek, till exempel 80F.");
    ut.push(
      "",
      "Tabellen är en guide. Hjälpcentret säger: är kunden nöjd med sin vanliga storlek och tabellen visar en helt annan, ska hon kontakta kundtjänst."
    );
    return ut.join("\n") + fot([STORLEKSGUIDE, SYSTERARTIKEL], t.hamtad);
  },
};

// ---------- Produkter ----------

const TYPER = ["bh", "trosa", "bikini-bh", "bikinitrosa", "baddräkt", "body"];

function visaStorlek(s) {
  // Badkläder har storlek plus kupa, till exempel "42DE", som visas "42 D/E".
  const m = s.match(/^(\d{2,3})([A-J]{2})$/);
  return m ? `${m[1]} ${m[2][0]}/${m[2][1]}` : s;
}

// Matchar kundens storlek mot en variant. "80F" mot "80F". "42" mot "42",
// "42BC", "42DE" och "42FG". "42F" mot "42FG".
function storlekPassar(variant, fraga) {
  const v = variant.toUpperCase();
  const q = String(fraga).toUpperCase().replace(/\s|X|\//g, "");
  if (v === q) return true;
  const qm = q.match(/^(\d{2,3})([A-J]?)$/);
  const vm = v.match(/^(\d{2,3})([A-J]{2})$/);
  if (qm && vm && qm[1] === vm[1]) return !qm[2] || vm[2].includes(qm[2]);
  return false;
}

function storleksStatus(produkt, storlek) {
  const v = produkt.storlekar.filter((s) => storlekPassar(s.storlek, storlek));
  if (v.length === 0) return { status: "saknas", varianter: [] };
  return { status: v.some((s) => s.iLager) ? "finns" : "slut", varianter: v };
}

function sokbarText(p) {
  return [p.typ, p.namn, p.bygel, p.farg, p.kortBeskrivning, p.beskrivning, ...(p.fordelar || []), ...(p.etiketter || []), p.material].join(" ");
}

function tolkaFritext(fritext) {
  let t = normalisera(fritext);
  let bygel = null;
  if (/bygelfri|utan bygel|bygellös|bygellos/.test(t)) {
    bygel = "utan bygel";
    t = t.replace(/bygelfria?|utan bygel|bygellösa?|bygellosa?/g, " ");
  } else if (/med bygel|bygel bh|bygelbh/.test(t)) {
    bygel = "med bygel";
    t = t.replace(/med bygel|bygel bh|bygelbh/g, " ");
  }
  let typ = null;
  if (/bikinitros|bikini tros/.test(t)) typ = ["bikinitrosa"];
  else if (/bikini/.test(t)) typ = ["bikini-bh", "bikinitrosa"];
  else if (/baddräkt|baddrakt/.test(t)) typ = ["baddräkt"];
  else if (/badkläder|bad /.test(t + " ")) typ = ["bikini-bh", "bikinitrosa", "baddräkt"];
  else if (/\btrosa|\btrosor/.test(t)) typ = ["trosa"];
  if (typ) t = t.replace(/bikinis?|bikinitros\w*|baddräkt\w*|badkläder|trosa|trosor/g, " ");
  return { ord: sokord(t), bygel, typ };
}

const sokProdukterVerktyg = {
  namn: "sok_produkter",
  titel: "Produktsök på egenskaper",
  beskrivning:
    "Söker bland ett urval på 35 produktsidor från missmary.se (bästsäljare plus bikini, baddräkt, minimizer, " +
    "framknäppt, protes, sport och shapewear) på egenskaper som material, bygel, typ och storlek. " +
    "Använd när en kund beskriver vad hon vill ha, till exempel 'bygelfri bh i bomull i 95F' eller 'bikinis i 80F'. " +
    "Fritext tolkas som egenskaper. Svaret visar pris, material, länk och om storleken fanns i lager vid hämtningen. " +
    "Urvalet är inte hela sortimentet.",
  indata: {
    fritext: z.string().max(200).optional().describe("Egenskaper, till exempel 'bomull bygelfri breda axelband'"),
    typ: z.enum(TYPER).optional().describe("Produkttyp"),
    bygel: z.enum(["med bygel", "utan bygel"]).optional(),
    storlek: z.string().max(10).optional().describe("Till exempel 80F för bh, 42 för trosa eller baddräkt"),
    baraILager: z.boolean().optional().describe("Visa bara färger där storleken fanns i lager. Standard: ja, om storlek anges"),
    maxPris: z.number().positive().optional().describe("Högsta pris i kronor"),
  },
  kor({ fritext, typ, bygel, storlek, baraILager, maxPris }) {
    const tolkat = tolkaFritext(fritext || "");
    const typFilter = typ ? [typ] : tolkat.typ;
    const bygelFilter = bygel || tolkat.bygel;
    const iLagerKrav = baraILager ?? Boolean(storlek);
    const ord = tolkat.ord;

    let traffar = allaProdukter()
      .filter((p) => !typFilter || typFilter.includes(p.typ))
      .filter((p) => !bygelFilter || p.bygel === bygelFilter)
      .filter((p) => !maxPris || (p.pris != null && p.pris <= maxPris))
      .map((p) => ({ p, poang: ord.length ? poang(sokbarText(p), ord) : 0, lager: storlek ? storleksStatus(p, storlek) : null }));

    if (ord.length) {
      const bast = Math.max(0, ...traffar.map((t) => t.poang));
      traffar = traffar.filter((t) => t.poang > 0 && t.poang >= bast - 1);
    }
    const utanLager = traffar.length;
    if (storlek && iLagerKrav) traffar = traffar.filter((t) => t.lager.status === "finns");

    // Samma modell i flera färger visas som en rad.
    const grupper = new Map();
    for (const t of traffar) {
      const nyckel = `${t.p.namn}|${t.p.typ}`;
      if (!grupper.has(nyckel)) grupper.set(nyckel, { namn: t.p.namn, poang: t.poang, farger: [] });
      grupper.get(nyckel).farger.push(t);
      grupper.get(nyckel).poang = Math.max(grupper.get(nyckel).poang, t.poang);
    }
    const lista = [...grupper.values()].sort((a, b) => b.poang - a.poang).slice(0, 6);

    const filterText = [
      typFilter && `typ: ${typFilter.join(" eller ")}`,
      bygelFilter,
      storlek && `storlek ${storlek}${iLagerKrav ? " i lager" : ""}`,
      maxPris && `högst ${maxPris} kr`,
      ord.length && `egenskaper: ${fritext}`,
    ].filter(Boolean).join(", ");

    const ut = [`SÖKNING (${filterText || "hela urvalet"})`];
    if (lista.length === 0) {
      ut.push("Ingen produkt i demons urval matchade.");
      if (storlek && iLagerKrav && utanLager > 0) ut.push(`${utanLager} produktsidor matchade egenskaperna, men storleken var slut eller fanns inte. Prova systerstorlek med verktyget rakna_storlek.`);
      ut.push("Urvalet är 35 produktsidor, inte hela sortimentet. Sök på missmary.se för resten.");
    }
    for (const g of lista) {
      const forsta = g.farger[0].p;
      ut.push("", `${g.namn} (${forsta.typ}${forsta.bygel ? ", " + forsta.bygel : ""})`);
      const forstaMening = (forsta.beskrivning || "").split(/(?<=\.)\s/)[0];
      if (forstaMening) ut.push(`  ${forstaMening}`);
      if (forsta.material) ut.push(`  Material: ${forsta.material}. Tvätt: ${forsta.tvatt || "se sidan"}.`);
      if (forsta.fordelar?.length) ut.push(`  Fördelar enligt sidan: ${forsta.fordelar.slice(0, 3).join(" ")}`);
      for (const t of g.farger) {
        const lager = t.lager ? ` Storlek ${storlek}: ${t.lager.status === "finns" ? "fanns i lager" : t.lager.status === "slut" ? "slut" : "finns inte i modellen"}.` : "";
        ut.push(`  Färg ${t.p.farg || "se sidan"}: ${t.p.pris} kr.${lager} ${t.p.lank}`);
      }
    }
    if (lista.length) ut.push("", "Priserna är de som stod på sidan vid hämtningen och kan vara kampanjpriser.");
    return ut.join("\n") + fot(["Produktsidor på missmary.se (länkar ovan)"], produkterHamtade());
  },
};

// ---------- Lager ----------

const FARGORD = ["svart", "beige", "vit", "grön", "röd", "mörkblå", "marinblå", "champagne", "petrol", "korall", "taupe", "lavendel", "persika", "aqua", "gammelrosa"];

const kollaLagerVerktyg = {
  namn: "kolla_lager",
  titel: "Lager per storlek",
  beskrivning:
    "Svarar ja eller nej på om en viss produkt fanns i lager i en viss storlek vid hämtningen, per färg. " +
    "Om storleken är slut visas systerstorlekar som fanns. Använd när kunden frågar 'har ni X i storlek Y'. " +
    "Ange produktens namn, gärna med färg, till exempel 'Stay Fresh svart', och storleken. " +
    "Visar inte antal i lager eller när varan kommer in igen: det kräver koppling till lagersystemet.",
  indata: {
    produkt: z.string().min(2).max(100).describe("Produktens namn, gärna med färg"),
    storlek: z.string().min(1).max(10).describe("Till exempel 80F, 42 eller 42F"),
  },
  kor({ produkt, storlek }) {
    const fraga = normalisera(produkt);
    const farger = FARGORD.filter((f) => fraga.split(" ").includes(f));
    const ord = sokord(FARGORD.reduce((t, f) => t.replace(new RegExp(`\\b${f}\\b`, "g"), " "), fraga));

    let kandidater = allaProdukter().map((p) => ({ p, poang: poang(`${p.namn} ${p.typ}`, ord) }));
    const bast = Math.max(0, ...kandidater.map((k) => k.poang));
    kandidater = bast > 0 ? kandidater.filter((k) => k.poang === bast) : [];
    if (farger.length) {
      const medFarg = kandidater.filter((k) => farger.some((f) => (k.p.farg || "").includes(f)));
      if (medFarg.length) kandidater = medFarg;
    }

    const ut = [`LAGER: "${produkt}" i storlek ${storlek}`];
    if (kandidater.length === 0) {
      ut.push("Produkten finns inte i demons urval på 35 produktsidor. Kolla produktsidan på missmary.se.");
      return ut.join("\n") + fot(["Produktsidor på missmary.se"], produkterHamtade());
    }

    for (const { p } of kandidater) {
      const s = storleksStatus(p, storlek);
      let rad = `${p.namn}, färg ${p.farg || "se sidan"}: `;
      if (s.status === "finns") rad += `JA, ${s.varianter.filter((v) => v.iLager).map((v) => visaStorlek(v.storlek)).join(", ")} fanns i lager.`;
      else if (s.status === "slut") rad += `NEJ, ${s.varianter.map((v) => visaStorlek(v.storlek)).join(", ")} var slut.`;
      else rad += `modellen finns inte i storlek ${storlek}. Storlekar: ${p.storlekar.map((v) => visaStorlek(v.storlek)).reverse().join(", ")}.`;
      ut.push(rad, `  ${p.lank}`);

      const bh = lasBhStorlek(storlek);
      if (s.status !== "finns" && bh) {
        const alt = systrar(bh.band, bh.kupa).map((x) => ({ ...x, st: storleksStatus(p, x.storlek).status }));
        if (alt.length) ut.push(`  Systerstorlekar i samma färg: ${alt.map((a) => `${a.storlek} ${a.st === "finns" ? "fanns" : a.st === "slut" ? "slut" : "finns inte i modellen"}`).join(", ")}.`);
      }
    }
    ut.push("", "Lagret är ja eller nej vid hämtningen, inte i realtid. Antal och inleverans syns inte i publik data. Med koppling till Centra eller lagret kan verktyget visa det.");
    return ut.join("\n") + fot(["Produktsidorna ovan (datablocket JSON-LD)"], produkterHamtade());
  },
};

// ---------- Regler och skötsel ----------

const ORDERFRAGA = /(min|mitt|mina) (order|beställning|paket|retur|faktura|återbetalning)|ordernummer|var är|har ni (fått|tagit emot)|spåra|kommit fram/;

const reglerVerktyg = {
  namn: "regler_och_skotsel",
  titel: "Retur, frakt, tvätt och material",
  beskrivning:
    "Hittar vad som gäller för retur, ångerrätt, byte, frakt, leverans, betalning, tull, reklamation, tvättgaranti " +
    "och skötsel, ur Miss Marys publika regelsidor och de 61 svenska artiklarna i hjälpcentret. Ange produkt om " +
    "frågan gäller material eller tvätt för en viss produkt. Svarar med utdrag och länk till källan. " +
    "Kan inte se en viss kunds order, retur eller paket: det kräver koppling till ordersystemet.",
  indata: {
    fraga: z.string().min(2).max(300).describe("Kundens fråga, till exempel 'hur returnerar jag?'"),
    produkt: z.string().max(100).optional().describe("Produktnamn om frågan gäller material eller tvätt"),
  },
  kor({ fraga, produkt }) {
    const ord = sokord(fraga);
    const ut = [];
    const datum = produkterHamtade();

    if (ORDERFRAGA.test(normalisera(fraga))) {
      ord.push(["spåra"]);
      ut.push(
        "GÄLLER EN VISS ORDER",
        "Demon har ingen koppling till ordersystemet (Centra), returerna eller fraktbolaget, och ska inte ha det utan avstämning om personuppgifter. " +
          "Slå upp ordern i era system. Det allmänna svaret står nedan.",
        ""
      );
    }

    if (produkt) {
      const pord = sokord(produkt);
      const kand = allaProdukter()
        .map((p) => ({ p, poang: poang(`${p.namn} ${p.typ} ${p.farg || ""}`, pord) }))
        .filter((k) => k.poang > 0)
        .sort((a, b) => b.poang - a.poang);
      if (kand.length) {
        const p = kand[0].p;
        ut.push(
          `PRODUKTEN: ${p.namn}${p.farg ? ", " + p.farg : ""}`,
          `Material: ${p.material || "står inte på sidan"}. Tvättråd: ${p.tvatt || "står inte på sidan"}.`,
          p.typ === "bh" ? "Bh:ar omfattas av 100-tvättarsgarantin om de tvättas enligt tvättråden." : "",
          p.lank,
          ""
        );
      } else {
        ut.push(`Produkten "${produkt}" finns inte i demons urval. Material och tvättråd står på produktsidan.`, "");
      }
    }

    const kallor = [
      ...allaRegler().map((r) => ({ typ: "regel", rubrik: r.rubrik, text: r.text, lank: r.lank, poang: poang(r.rubrik + " " + r.amne.join(" "), ord) * 3 + poang(r.text, ord) })),
      ...allaArtiklar()
        .filter((a) => a.text.length > 40)
        .map((a) => ({ typ: "hjälpartikel", rubrik: a.rubrik, text: a.text, lank: a.lank, uppdaterad: a.uppdaterad, poang: poang(a.rubrik, ord) * 3 + poang(a.text, ord) })),
    ]
      .filter((k) => k.poang > 0)
      .sort((a, b) => b.poang - a.poang)
      .slice(0, 3);

    if (kallor.length === 0 && !produkt) {
      ut.push("Hittade inget i regelsidorna eller hjälpcentret som matchar frågan. Prova andra ord, eller sök på support.missmary.com.");
    }
    for (const k of kallor) {
      ut.push(`${k.typ === "regel" ? "REGEL" : "HJÄLPARTIKEL"}: ${k.rubrik}${k.uppdaterad ? ` (uppdaterad ${k.uppdaterad})` : ""}`, utdrag(k.text, ord), k.lank, "");
    }
    return ut.join("\n").trim() + fot(["Regelsidor på missmary.se", "support.missmary.com"], datum);
  },
};

export const VERKTYG = [raknaStorlekVerktyg, sokProdukterVerktyg, kollaLagerVerktyg, reglerVerktyg];
