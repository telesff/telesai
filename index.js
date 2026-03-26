const path = require("path");
const express = require("express");

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

const app = express();
const PORT = process.env.PORT;

// safe fetch
let fetch;
(async () => {
  fetch = (await import("node-fetch")).default;
})();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// health route (IMPORTANT for Railway)
app.get("/", (req, res) => {
  res.send("✅ Bot running");
});

// webhook
app.post("/api/telegram/webhook", async (req, res) => {
  try {
    if (!fetch) return res.sendStatus(200);

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!BOT_TOKEN) return res.sendStatus(200);

    const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
    const MINI_APP_URL = process.env.MINI_APP_URL || "";

    const update = req.body;
    const text = update?.message?.text;
    const chatId = update?.message?.chat?.id;

    if (chatId && text === "/start") {
      await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "🚀 Bot is working!",
        }),
      });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("🔥 ERROR:", err);
    res.json({ ok: true });
  }
});

// start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Running on port ${PORT}`);
});
