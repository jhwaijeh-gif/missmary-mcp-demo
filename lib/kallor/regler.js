// DATAKÄLLA: REGLER (retur, ångerrätt, frakt, betalning, tvättgaranti)
//
// I dag: data/regler.json, nio korta stycken ur de publika regelsidorna på
// missmary.se (2026-11-21), varje stycke med länk till sidan.
//
// BYT MOT STORYBLOK: regelsidorna ligger i deras innehållssystem. De har
// redan en MCP-server för Storyblok enligt annonsen. Läs styckena därifrån
// med en nyckel som bara får läsa.

import { lasData } from "./las.js";

const data = lasData("regler.json");

export function allaRegler() {
  return data.regler;
}

export function hamtad() {
  return data.hamtad;
}
