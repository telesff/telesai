const path = require("path");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/images", express.static(path.join(__dirname, "public", "images")));
app.use(express.static(path.join(__dirname, "public")));

try {
  const serverBundle = require("./server.cjs");
  const serverApp = serverBundle.default || serverBundle;

  if (serverApp && serverApp._router) {
    app.use(serverApp._router);
  } else if (typeof serverApp === "function") {
    app.use(serverApp);
  }
} catch (e) {
  console.error("Failed to load server bundle, using standalone mode");

  const { Pool } = require("pg");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  app.post("/api/telegram/webhook", async (req, res) => {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
    const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
    const MINI_APP_URL = process.env.MINI_APP_URL || `http://localhost:${PORT}`;
    const ADMIN_TELEGRAM_ID = parseInt(process.env.ADMIN_TELEGRAM_ID || "7049127887");

    try {
      const update = req.body;
      const text = update?.message?.text;
      const chatId = update?.message?.chat?.id;
      const userId = update?.message?.from?.id;

      if (chatId && text === "/start") {
        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "🚀 <b>Welcome to TELES ADS</b>\n\nChoose an option below.",
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "🚀 Open Platform", web_app: { url: MINI_APP_URL } }],
              ],
            },
          }),
        });
      }

      if (chatId && text === "/teles" && userId === ADMIN_TELEGRAM_ID) {
        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "🔐 Admin Panel",
            parse_mode: "HTML",
          }),
        });
      }

      res.json({ ok: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.json({ ok: true });
    }
  });
}

app.get("*", (req, res) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Running on port ${PORT}`);
});
