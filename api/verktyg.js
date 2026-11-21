// Samma fyra verktyg som MCP-servern, men som en vanlig webbadress.
// Testsidan (public/index.html) använder den här, så att man kan prova
// verktygen utan Claude. Logiken är exakt densamma: lib/verktyg.js.
//
//   GET  /api/verktyg              listan över verktygen
//   POST /api/verktyg  {"verktyg": "rakna_storlek", "indata": {...}}

import { z } from "zod";
import { VERKTYG } from "../lib/verktyg.js";

export default function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).json(
      VERKTYG.map((v) => ({ namn: v.namn, titel: v.titel, beskrivning: v.beskrivning }))
    );
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ fel: "Använd GET eller POST." });
    return;
  }

  const { verktyg, indata } = req.body || {};
  const v = VERKTYG.find((x) => x.namn === verktyg);
  if (!v) {
    res.status(400).json({ fel: "Okänt verktyg." });
    return;
  }
  const kontroll = z.object(v.indata).safeParse(indata || {});
  if (!kontroll.success) {
    res.status(400).json({ fel: "Uppgifterna saknas eller har fel form.", detaljer: kontroll.error.issues });
    return;
  }
  try {
    res.status(200).json({ svar: v.kor(kontroll.data) });
  } catch (fel) {
    console.error(fel);
    res.status(500).json({ fel: "Internt fel i demon." });
  }
}
