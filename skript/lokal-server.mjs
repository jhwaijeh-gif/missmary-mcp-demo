// Kör demon på din egen dator, utan Vercel: node skript/lokal-server.mjs
// Öppna sedan http://localhost:3000. MCP-servern svarar på http://localhost:3000/mcp
// Den gör samma sak som Vercel: skickar /mcp och /api/verktyg till filerna i api/,
// och visar public/index.html på startsidan.

import http from "node:http";
import { readFile } from "node:fs/promises";
import mcp from "../api/mcp.js";
import verktyg from "../api/verktyg.js";

const PORT = Number(process.env.PORT || 3000);

function hjalp(res) {
  res.status = (k) => ((res.statusCode = k), res);
  res.json = (o) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(o));
    return res;
  };
  res.send = (t) => (res.end(t), res);
  return res;
}

http
  .createServer(async (req, res) => {
    hjalp(res);
    const url = new URL(req.url, "http://localhost");
    let kropp = "";
    for await (const bit of req) kropp += bit;
    try {
      req.body = kropp ? JSON.parse(kropp) : undefined;
    } catch {
      req.body = undefined;
    }
    if (url.pathname === "/mcp" || url.pathname === "/api/mcp") return mcp(req, res);
    if (url.pathname === "/api/verktyg") return verktyg(req, res);
    if (url.pathname === "/" || url.pathname === "/index.html") {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.end(await readFile(new URL("../public/index.html", import.meta.url)));
    }
    res.status(404).send("Finns inte");
  })
  .listen(PORT, () => console.log(`Demon kör på http://localhost:${PORT}`));
