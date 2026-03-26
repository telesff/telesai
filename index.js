const path = require("path");
const express = require("express");

const app = express();
const PORT = process.env.PORT;

// fetch fix
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static files
app.use("/images", express.static(path.join(__dirname, "public", "images")));
app.use(express.static(path.join(__dirname, "public")));

// ✅ health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// 🚀 TELEGRAM WEBHOOK (FULL WORKING)
app.post("/api/telegram/webhook", async (req, res) => {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
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

    // 🔥 START COMMAND
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

    // 🔐 ADMIN PANEL
    if (chatId && text === "/teles" && userId === ADMIN_TELEGRAM_ID) {
      await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "🔐 <b>Admin Panel</b>",
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

// frontend fallback
app.get("*", (req, res) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  }
});

// ✅ ONLY ONE SERVER
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Running on port ${PORT}`);
});
