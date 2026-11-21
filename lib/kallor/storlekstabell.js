// DATAKÄLLA: STORLEKSTABELLEN
//
// I dag: data/storlekstabell.json, avskriven ur den publika storleksguiden
// https://www.missmary.se/se/blog/size-chart (2026-11-21).
//
// BYT MOT STORYBLOK: storleksguiden är en sida i deras innehållssystem.
// Läs tabellen därifrån, så följer verktyget med när sidan ändras.
// Eller låt den ligga som fil, men med en ägare som uppdaterar den.

import { lasData } from "./las.js";

const data = lasData("storlekstabell.json");

export function storlekstabell() {
  return data;
}
