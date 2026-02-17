// Run migration using Supabase database connection
// Usage: npx tsx src/scripts/migrate_approval_columns.ts

import pg from 'pg';
const { Client } = pg;

// Supabase direct connection (uses session mode port 5432)
const connectionString = `postgresql://postgres.ktuztuypejbbzjadlemh:${process.env.DB_PASSWORD || ''}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`;

async function migrate() {
    // If no DB_PASSWORD, try using Supabase Management API
    if (!process.env.DB_PASSWORD) {
        console.log('No DB_PASSWORD set. Trying Management API...');

        // Try finding the access token
        const fs = await import('fs');
        const path = await import('path');
        const homeDir = process.env.USERPROFILE || process.env.HOME || '';

        const tokenPaths = [
            path.join(homeDir, '.supabase', 'access-token'),
            path.join(homeDir, 'AppData', 'Roaming', 'supabase', 'access-token'),
        ];

        let token = '';
        for (const p of tokenPaths) {
            try {
                token = fs.readFileSync(p, 'utf8').trim();
                console.log(`Found token at ${p}`);
                break;
            } catch { }
        }

        if (!token) {
            // Check environment variable
            token = process.env.SUPABASE_ACCESS_TOKEN || '';
        }

        if (token) {
            const res = await fetch('https://api.supabase.com/v1/projects/ktuztuypejbbzjadlemh/database/query', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: `ALTER TABLE contratos
            ADD COLUMN IF NOT EXISTS aprovacao_comprovante TEXT DEFAULT 'pending',
            ADD COLUMN IF NOT EXISTS aprovacao_perfil TEXT DEFAULT 'pending',
            ADD COLUMN IF NOT EXISTS aprovacao_assinatura TEXT DEFAULT 'pending',
            ADD COLUMN IF NOT EXISTS aprovacao_status TEXT DEFAULT 'pending',
            ADD COLUMN IF NOT EXISTS aprovacao_data TIMESTAMPTZ,
            ADD COLUMN IF NOT EXISTS aprovacao_obs TEXT,
            ADD COLUMN IF NOT EXISTS data_ativacao DATE,
            ADD COLUMN IF NOT EXISTS comprovante_url TEXT;`
                })
            });

            console.log('Management API status:', res.status);
            const text = await res.text();
            console.log('Result:', text.substring(0, 500));
            return;
        }

        console.error('ERROR: Set DB_PASSWORD env variable with your Supabase database password');
        console.error('Usage: DB_PASSWORD=your_password npx tsx src/scripts/migrate_approval_columns.ts');
        process.exit(1);
    }

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to PostgreSQL');

        await client.query(`
      ALTER TABLE contratos
        ADD COLUMN IF NOT EXISTS aprovacao_comprovante TEXT DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS aprovacao_perfil TEXT DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS aprovacao_assinatura TEXT DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS aprovacao_status TEXT DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS aprovacao_data TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS aprovacao_obs TEXT,
        ADD COLUMN IF NOT EXISTS data_ativacao DATE,
        ADD COLUMN IF NOT EXISTS comprovante_url TEXT;
    `);
        console.log('Migration applied successfully!');

        const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'contratos' 
      ORDER BY ordinal_position
    `);
        console.log('\nCurrent contratos columns:');
        res.rows.forEach((r: any) => console.log(`  ${r.column_name}: ${r.data_type}`));
    } finally {
        await client.end();
    }
}

migrate().catch(console.error);
