import dotenv from 'dotenv';

dotenv.config();

function must(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const config = {
  // Allowed frontend origins
  corsOrigins: (
    process.env.CORS_ORIGINS ||
    "http://localhost:5173,https://maadinul.vercel.app"
  )
    .split(",")
    .map(origin => origin.trim()),

  // Supabase
  supabaseUrl: must("SUPABASE_URL"),
  supabaseServiceRoleKey: must("SUPABASE_SERVICE_ROLE_KEY"),
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
  jwtSecret: process.env.JWT_SECRET || null,
  // Webhook secrets (optional in development, required in production)
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || null,
  paystackWebhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET || null,
};

// Enforce presence of webhook secrets in production to avoid silent insecurity
if (process.env.NODE_ENV === 'production') {
  if (!config.stripeWebhookSecret) throw new Error('Missing STRIPE_WEBHOOK_SECRET in production')
  if (!config.paystackWebhookSecret) throw new Error('Missing PAYSTACK_WEBHOOK_SECRET in production')
  if (!config.jwtSecret) throw new Error('Missing JWT_SECRET in production')
}