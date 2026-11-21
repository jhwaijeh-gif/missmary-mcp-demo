// DATAKÄLLA: HJÄLPCENTRET (Zendesk)
//
// I dag: data/hjalpartiklar.json, alla 61 publika svenska artiklar från
// support.missmary.com, hämtade i ett anrop 2026-11-21 via Zendesks öppna
// läsadress för hjälpcenter.
//
// BYT MOT ZENDESK MED NYCKEL: fråga Zendesk direkt i stället för filen. Då
// följer ändringar med samma minut, och interna artiklar och makron kan
// komma med. Det kräver en Zendesk-nyckel som bara får läsa.

import { lasData } from "./las.js";

const data = lasData("hjalpartiklar.json");

export function allaArtiklar() {
  return data.artiklar;
}

export function hamtad() {
  return data.hamtad;
}
