const { Pool } = require("pg");

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("Error: Set DATABASE_URL environment variable first");
  console.error("Example: DATABASE_URL=postgresql://user:pass@localhost:5432/telesads");
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

const schema = `
CREATE TABLE IF NOT EXISTS channels (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  handle TEXT NOT NULL,
  members INTEGER NOT NULL DEFAULT 0,
  growth_24h REAL NOT NULL DEFAULT 0,
  growth_7d REAL NOT NULL DEFAULT 0,
  engagement_rate REAL NOT NULL DEFAULT 0,
  avg_views_per_post INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'crypto',
  verified BOOLEAN NOT NULL DEFAULT false,
  quality_score REAL NOT NULL DEFAULT 0,
  top_countries TEXT NOT NULL DEFAULT '[]',
  price INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT '',
  package_name TEXT NOT NULL,
  channel_link TEXT NOT NULL DEFAULT '',
  audience TEXT NOT NULL DEFAULT 'mixed',
  status TEXT NOT NULL DEFAULT 'active',
  members_target INTEGER NOT NULL DEFAULT 0,
  members_delivered INTEGER NOT NULL DEFAULT 0,
  ad_reach INTEGER NOT NULL DEFAULT 0,
  conversion_rate REAL NOT NULL DEFAULT 0,
  cost_per_member REAL NOT NULL DEFAULT 0,
  price INTEGER NOT NULL DEFAULT 0,
  duration_days INTEGER NOT NULL DEFAULT 7,
  start_date TEXT NOT NULL DEFAULT '',
  end_date TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT '',
  campaign_id INTEGER,
  amount INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  method TEXT NOT NULL DEFAULT 'usdt_trc20',
  tx_hash TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'open',
  admin_reply TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'general',
  message TEXT NOT NULL,
  rating INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL DEFAULT '',
  channel_link TEXT NOT NULL DEFAULT '',
  trading_category TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  telegram_id TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL DEFAULT '',
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  channel_link TEXT NOT NULL DEFAULT '',
  trading_category TEXT NOT NULL DEFAULT '',
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  role TEXT NOT NULL DEFAULT 'user',
  referral_code TEXT NOT NULL DEFAULT '',
  referred_by TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS packages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  members TEXT NOT NULL DEFAULT '',
  features TEXT NOT NULL DEFAULT '[]',
  price INTEGER NOT NULL DEFAULT 0,
  original_price INTEGER,
  popular BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO packages (name, description, members, features, price, popular) 
SELECT 'Best Package', 'Perfect for small channels starting out', '1k-2k Members', '["1 Instagram Ad","Banner Promotion","3 Day Campaign"]', 199, false
WHERE NOT EXISTS (SELECT 1 FROM packages LIMIT 1);

INSERT INTO packages (name, description, members, features, price, original_price, popular)
SELECT 'Recommended Package', 'Best for growing trading communities', '3k-5k Members', '["2 Instagram Ads","Banner Promotion","5 Day Campaign","Priority Support"]', 359, 399, true
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE id = 2);

INSERT INTO packages (name, description, members, features, price, popular)
SELECT 'Luxury Package', 'Maximum growth for serious channels', '5k-10k Members', '["3 Instagram Ads","Banner Promotion","7 Day Campaign","Dedicated Manager","Analytics Report"]', 599, false
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE id = 3);
`;

async function setup() {
  console.log("Setting up database...");
  try {
    await pool.query(schema);
    console.log("✅ Database tables created successfully!");
    console.log("✅ Default packages seeded!");
    
    const result = await pool.query("SELECT COUNT(*) FROM packages");
    console.log(`   Packages in DB: ${result.rows[0].count}`);
  } catch (err) {
    console.error("Database setup error:", err.message);
  } finally {
    await pool.end();
  }
}

setup();
