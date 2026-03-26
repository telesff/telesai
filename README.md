# TELES ADS — Telegram Mini App Bot

Full-stack Telegram Mini App for selling advertising services to Forex/Crypto/Binary trading channels.

## Quick Deploy

### 1. Install dependencies
```bash
npm install
```

### 2. Set environment variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` — PostgreSQL connection string
- `TELEGRAM_BOT_TOKEN` — Your bot token from @BotFather
- `ADMIN_TELEGRAM_ID` — Your Telegram user ID (default: 7049127887)
- `MINI_APP_URL` — Your deployed domain (e.g., https://yourdomain.com)
- `PORT` — Server port (default: 3000)

### 3. Setup database
```bash
node setup-db.js
```

### 4. Start the server
```bash
npm start
```

### 5. Setup Telegram webhook
```bash
node setup-webhook.js https://yourdomain.com/api/telegram/webhook
```

## Deploy to VPS/Cloud

### Using PM2
```bash
npm install -g pm2
pm2 start index.js --name teles-ads
pm2 save
pm2 startup
```

### Using Docker
```bash
docker build -t teles-ads .
docker run -d -p 3000:3000 --env-file .env teles-ads
```

## Bot Commands
- `/start` — Welcome message (all users)
- `/teles` — Admin panel with management buttons (admin only)

## Admin Features
- Manage packages (add/edit/delete/enable/disable)
- Manage channels for sale (add/edit/delete/price/active toggle)
- View campaigns, payments, tickets, leads, meetings
- Approve/reject payments
- Reply to support tickets
