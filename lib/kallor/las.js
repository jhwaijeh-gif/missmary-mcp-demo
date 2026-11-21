// Läser en JSON-fil i mappen data/. Alla fyra datakällorna använder den här.
import { readFileSync } from "node:fs";

export function lasData(filnamn) {
  return JSON.parse(readFileSync(new URL(`../../data/${filnamn}`, import.meta.url), "utf8"));
}
