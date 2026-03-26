const express = require("express");

const app = express();

// ❗ IMPORTANT
const PORT = process.env.PORT;

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

app.use(express.json());

// ✅ ROOT (health check)
app.get("/", (req, res) => {
  res.status(200).send("OK");
});

// ✅ HEALTH (extra)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// 🤖 webhook
app.post("/api/telegram/webhook", async (req, res) => {
  try {
    console.log("Webhook hit");
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.json({ ok: true });
  }
});

// 🚀 start
app.listen(PORT, "0.0.0.0", () => {
  console.log("RUNNING ON", PORT);
});
