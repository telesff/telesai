const path = require("path");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Fix fetch for Node
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/images", express.static(path.join(__dirname, "public", "images")));
app.use(express.static(path.join(__dirname, "public")));

// 🔥 IMPORTANT: Only load routes, NOT server
try {
  const serverBundle = require("./server.cjs");

  // ❌ DO NOT use _router (it causes issues sometimes)
  if (typeof serverBundle === "function") {
    app.use(serverBundle);
  }

  console.log("✅ server.cjs loaded");
} catch (e) {
  console.log("⚠️ Running in standalone mode");

  const { Pool } = require("pg");
  new Pool({ connectionString: process.env.DATABASE_URL });

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  app.post("/api/telegram/webhook", async (req, res) => {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
    const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
    const MINI_APP_URL =
      process.env.MINI_APP_URL ||
      "https://telesai-production.up.railway.app";

    const ADMIN_TELEGRAM_ID = parseInt(
      process.env.ADMIN_TELEGRAM_ID || "7049127887"
    );

    try {
      const update = req.body;
      const text = update?.message?.text;
      const chatId = update?.message?.chat?.id;
      const userId = update?.message?.from?.id;

      // 🚀 START
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

      // 🔐 ADMIN
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
      console.error("🔥 FULL ERROR:", error);
      res.json({ ok: true });
    }
  });
}

// frontend fallback
app.get("*", (req, res) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  }
});

// 🚀 ONLY ONE SERVER START
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Running on port ${PORT}`);
});
