const express = require("express");

const app = express();
const PORT = process.env.PORT || 8080;

// crash protection
process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

app.use(express.json());

// ✅ ROOT (Railway health check)
app.get("/", (req, res) => {
  res.status(200).send("OK");
});

// ✅ HEALTH (extra safety)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// 🤖 TELEGRAM WEBHOOK
app.post("/api/telegram/webhook", async (req, res) => {
  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

    if (!BOT_TOKEN) {
      console.log("❌ BOT TOKEN missing");
      return res.json({ ok: true });
    }

    const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

    const update = req.body;
    const text = update?.message?.text;
    const chatId = update?.message?.chat?.id;

    // 🔥 START COMMAND
    if (chatId && text === "/start") {
      await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: "🚀 Bot working perfectly ✅",
        }),
      });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("🔥 ERROR:", error);
    res.json({ ok: true });
  }
});

// 🚀 START SERVER
app.listen(PORT, "0.0.0.0", () => {
  console.log("RUNNING ON", PORT);
});
