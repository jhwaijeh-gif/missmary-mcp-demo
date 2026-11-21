// MCP-servern. Det är den här adressen man lägger till som koppling i Claude:
//   https://<adressen>/mcp
//
// Vad en MCP-server är: en lista med verktyg. Varje verktyg har ett namn, en
// beskrivning och vilka uppgifter det behöver. Claude läser listan och väljer
// själv vilket verktyg som passar frågan. Servern svarar bara på frågor. Den
// ändrar aldrig något någonstans.
//
// Servern är "tillståndslös": varje anrop är fristående. Det gör den enkel och
// stabil, och den behöver ingen databas.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { VERKTYG } from "../lib/verktyg.js";

function skapaServer() {
  const server = new McpServer(
    { name: "storleks-och-regelhjalpen-demo", version: "1.0.0" },
    {
      instructions:
        "Demo byggd av Jude Hwaijeh inför ansökan, inte en officiell Miss Mary-tjänst. " +
        "Verktygen läser en ögonblicksbild av publik data från missmary.se och support.missmary.com. " +
        "Svara som ett utkast till en medarbetare i kundtjänst, på svenska om inget annat önskas. " +
        "Visa alltid källänken och datumet för datan. Medarbetaren läser och skickar själv.",
    }
  );

  for (const v of VERKTYG) {
    server.registerTool(
      v.namn,
      {
        title: v.titel,
        description: v.beskrivning,
        inputSchema: v.indata,
        annotations: { readOnlyHint: true, openWorldHint: false },
      },
      async (args) => ({ content: [{ type: "text", text: v.kor(args) }] })
    );
  }
  return server;
}

export default async function handler(req, res) {
  if (req.method === "GET" && !String(req.headers.accept || "").includes("text/event-stream")) {
    // Någon har öppnat adressen i en webbläsare. Visa en kort förklaring.
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send(
      "Det här är MCP-servern för demon. Den används från Claude som anpassad koppling, inte i webbläsaren.\n" +
        "Testsidan finns på startsidan för samma adress.\n" +
        "Demo byggd av Jude Hwaijeh inför ansökan, inte en officiell Miss Mary-tjänst."
    );
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Bara POST stöds. Servern är tillståndslös." },
      id: null,
    });
    return;
  }

  const server = skapaServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  res.on("close", () => {
    transport.close();
    server.close();
  });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (fel) {
    console.error(fel);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internt fel i demon." },
        id: null,
      });
    }
  }
}
