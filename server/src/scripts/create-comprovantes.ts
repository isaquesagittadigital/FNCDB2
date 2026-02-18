// Migration script using Supabase Management API
// Usage: npx tsx src/scripts/create-comprovantes.ts

import fs from 'fs';
import path from 'path';

const PROJECT_REF = 'ktuztuypejbbzjadlemh';

async function migrate() {
    // Find access token
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
        token = process.env.SUPABASE_ACCESS_TOKEN || '';
    }

    if (!token) {
        console.error('ERROR: No Supabase access token found.');
        console.error('Run: supabase login');
        process.exit(1);
    }

    // Query 1: Create table
    console.log('Creating comprovantes table...');
    let res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: `
                CREATE TABLE IF NOT EXISTS public.comprovantes (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    contrato_id UUID NOT NULL,
                    arquivo_url TEXT NOT NULL,
                    arquivo_nome TEXT,
                    data_transferencia DATE,
                    observacao TEXT,
                    uploaded_by UUID,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_comprovantes_contrato_id 
                    ON public.comprovantes(contrato_id);
                    
                ALTER TABLE public.comprovantes ENABLE ROW LEVEL SECURITY;
            `
        })
    });
    console.log('Table creation status:', res.status);
    let text = await res.text();
    console.log('Result:', text.substring(0, 500));

    // Query 2: RLS Policy
    console.log('\nCreating RLS policy...');
    res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: `
                DO $$ 
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_policies WHERE tablename = 'comprovantes' AND policyname = 'srv_comprovantes'
                    ) THEN
                        CREATE POLICY "srv_comprovantes" ON public.comprovantes 
                        FOR ALL USING (true) WITH CHECK (true);
                    END IF;
                END $$;
            `
        })
    });
    console.log('Policy status:', res.status);
    text = await res.text();
    console.log('Result:', text.substring(0, 500));

    // Query 3: Storage bucket
    console.log('\nCreating storage bucket...');
    res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: `
                INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
                VALUES (
                    'comprovantes',
                    'comprovantes', 
                    true,
                    2097152,
                    ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
                )
                ON CONFLICT (id) DO NOTHING;
            `
        })
    });
    console.log('Bucket status:', res.status);
    text = await res.text();
    console.log('Result:', text.substring(0, 500));

    // Query 4: Storage policies
    console.log('\nCreating storage policies...');
    const storagePolicies = [
        `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'public_read_comprovantes') THEN CREATE POLICY "public_read_comprovantes" ON storage.objects FOR SELECT USING (bucket_id = 'comprovantes'); END IF; END $$;`,
        `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'insert_comprovantes') THEN CREATE POLICY "insert_comprovantes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'comprovantes'); END IF; END $$;`,
        `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'delete_comprovantes') THEN CREATE POLICY "delete_comprovantes" ON storage.objects FOR DELETE USING (bucket_id = 'comprovantes'); END IF; END $$;`,
    ];

    for (const sql of storagePolicies) {
        res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: sql })
        });
        console.log('Storage policy status:', res.status);
    }

    console.log('\n✅ Migration complete!');
}

migrate().catch(console.error);
