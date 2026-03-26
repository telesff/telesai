const express = require("express");

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

// health check (Railway ke liye important)
app.get("/", (req, res) => {
  res.send("OK");
});

// webhook
app.post("/api/telegram/webhook", async (req, res) => {
  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

    if (!BOT_TOKEN) {
      console.log("No token");
      return res.sendStatus(200);
    }

    const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

    const update = req.body;
    const text = update?.message?.text;
    const chatId = update?.message?.chat?.id;

    if (chatId && text === "/start") {
      await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "Bot working ✅",
        }),
      });
    }

    res.json({ ok: true });
  } catch (e) {
    console.error("ERROR:", e);
    res.json({ ok: true });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("RUNNING ON", PORT);
});
