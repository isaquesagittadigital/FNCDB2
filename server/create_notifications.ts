// Create the notificacoes table using direct Postgres connection
const { Client } = require('pg');

// Supabase direct connection (project: ktuztuypejbbzjadlemh)
// Default Supabase Postgres connection format
const connectionString = `postgresql://postgres.ktuztuypejbbzjadlemh:${process.env.SUPABASE_DB_PASSWORD || 'YOUR_DB_PASSWORD'}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`;

// Alternative: use the transaction pooler
const client = new Client({
    host: 'aws-0-sa-east-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.ktuztuypejbbzjadlemh',
    password: process.env.SUPABASE_DB_PASSWORD || 'NEED_PASSWORD',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to Postgres!');

        const sql = `
            CREATE TABLE IF NOT EXISTS public.notificacoes (
                id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id uuid NOT NULL,
                type text DEFAULT 'Sistema',
                title text NOT NULL,
                content text,
                is_read boolean DEFAULT false,
                created_at timestamptz DEFAULT now(),
                updated_at timestamptz DEFAULT now()
            );
        `;

        await client.query(sql);
        console.log('Table created!');

        // Enable RLS
        await client.query('ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;');
        console.log('RLS enabled!');

        // Create policies
        await client.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notificacoes' AND policyname = 'Users can read own notifications') THEN
                    CREATE POLICY "Users can read own notifications" ON public.notificacoes FOR SELECT USING (auth.uid() = user_id);
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notificacoes' AND policyname = 'Users can update own notifications') THEN
                    CREATE POLICY "Users can update own notifications" ON public.notificacoes FOR UPDATE USING (auth.uid() = user_id);
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notificacoes' AND policyname = 'Users can delete own notifications') THEN
                    CREATE POLICY "Users can delete own notifications" ON public.notificacoes FOR DELETE USING (auth.uid() = user_id);
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notificacoes' AND policyname = 'Service role can insert notifications') THEN
                    CREATE POLICY "Service role can insert notifications" ON public.notificacoes FOR INSERT WITH CHECK (true);
                END IF;
            END $$;
        `);
        console.log('Policies created!');

        // Create indexes
        await client.query('CREATE INDEX IF NOT EXISTS idx_notificacoes_user_id ON public.notificacoes(user_id);');
        await client.query('CREATE INDEX IF NOT EXISTS idx_notificacoes_created_at ON public.notificacoes(created_at DESC);');
        console.log('Indexes created!');

        // Reload PostgREST cache
        await client.query("NOTIFY pgrst, 'reload schema';");
        console.log('Schema cache reloaded!');

        console.log('\nAll done! Table notificacoes is ready.');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
