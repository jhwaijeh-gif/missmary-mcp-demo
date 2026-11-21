// DATAKÄLLA: PRODUKTER OCH LAGER
//
// I dag: data/produkter.json, en ögonblicksbild av 35 publika produktsidor
// (missmary.se, hämtade 2026-11-21). Lagret är bara "finns" eller "slut",
// som det stod på sidan den dagen.
//
// BYT MOT CENTRA: skriv om de två funktionerna nedan så att de frågar Centra
// i stället för att läsa filen. Verktygen märker ingen skillnad, de anropar
// bara allaProdukter() och hamtad(). Med Centra kommer riktigt lagersaldo och
// hela sortimentet. Det kräver en läsnyckel med lägsta möjliga behörighet,
// som ligger som hemlig miljövariabel hos värden, aldrig i koden.

import { lasData } from "./las.js";

const data = lasData("produkter.json");

export function allaProdukter() {
  return data.produkter;
}

export function hamtad() {
  return data.hamtad;
}
