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
};