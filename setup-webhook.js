const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.argv[2];

if (!BOT_TOKEN) {
  console.error("Error: Set TELEGRAM_BOT_TOKEN environment variable first");
  process.exit(1);
}

if (!WEBHOOK_URL) {
  console.error("Usage: node setup-webhook.js <your-domain-url>");
  console.error("Example: node setup-webhook.js https://yourdomain.com/api/telegram/webhook");
  process.exit(1);
}

async function setup() {
  const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

  console.log("Setting webhook to:", WEBHOOK_URL);
  const webhookRes = await fetch(`${API}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: WEBHOOK_URL, allowed_updates: ["message"] }),
  });
  const webhookResult = await webhookRes.json();
  console.log("Webhook result:", webhookResult);

  console.log("\nRegistering bot commands...");
  const ADMIN_ID = parseInt(process.env.ADMIN_TELEGRAM_ID || "7049127887");

  await fetch(`${API}/setMyCommands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      commands: [{ command: "start", description: "Start TELES ADS bot" }],
    }),
  });

  await fetch(`${API}/setMyCommands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      commands: [
        { command: "start", description: "Start TELES ADS bot" },
        { command: "teles", description: "Admin Dashboard" },
      ],
      scope: { type: "chat", chat_id: ADMIN_ID },
    }),
  });

  console.log("Commands registered!");

  const infoRes = await fetch(`${API}/getWebhookInfo`);
  const info = await infoRes.json();
  console.log("\nWebhook info:", JSON.stringify(info.result, null, 2));
}

setup().catch(console.error);
