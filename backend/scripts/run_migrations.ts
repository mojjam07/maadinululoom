import { readFileSync, readdirSync } from 'fs'
import path from 'path'
import { Client } from 'pg'

async function run() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('Missing DATABASE_URL environment variable')
    process.exit(2)
  }

  const client = new Client({ connectionString: databaseUrl })
  await client.connect()

  // Ensure migrations table
  await client.query(`
    create table if not exists public.schema_migrations (
      id serial primary key,
      filename text not null unique,
      applied_at timestamptz not null default now()
    )
  `)

  const migrationsDir = path.join(__dirname, '..', 'supabase')
  const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()

  for (const file of files) {
    const { rows } = await client.query('select filename from public.schema_migrations where filename = $1', [file])
    if (rows.length > 0) {
      console.log(`Skipping already-applied: ${file}`)
      continue
    }

    console.log(`Applying migration: ${file}`)
    const sql = readFileSync(path.join(migrationsDir, file), 'utf8')
    try {
      await client.query(sql)
      await client.query('insert into public.schema_migrations (filename) values ($1)', [file])
      console.log(`Applied: ${file}`)
    } catch (e) {
      console.error(`Failed to apply ${file}:`, e)
      await client.end()
      process.exit(3)
    }
  }

  await client.end()
  console.log('Migrations complete')
}

run().catch((err) => {
  console.error('Migration runner crashed:', err)
  process.exit(4)
})
