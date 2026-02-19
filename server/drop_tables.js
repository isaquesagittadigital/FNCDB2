// Drop unused tables from Supabase
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0dXp0dXlwZWpiYnpqYWRsZW1oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc3NzM2NSwiZXhwIjoyMDg1MzUzMzY1fQ.pWZN4YuH7X1uYw8Y0HloHQWVvF6m4_tAXPHqkBKslqk';
const url = 'https://ktuztuypejbbzjadlemh.supabase.co';

const tablesToDrop = [
    'faqs', 'chat_messages', 'chat_conversations', 'processos_comprovantes',
    'contract_templates', 'doc_arquivos', 'processos', 'comissoes',
    'perfil_user', 'app_users', 'valores_comissoes', 'banks',
    'logs', 'contract_cl', 'aportes', 'participacoes',
    'nome_banco', 'produtos', 'permissoes_usuario'
];

async function run() {
    // First try: check if there's an exec_sql RPC function
    console.log('Trying RPC exec_sql...');
    const sql = tablesToDrop.map(t => `DROP TABLE IF EXISTS public.${t} CASCADE;`).join('\n');

    const rpcRes = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql_query: sql })
    });
    console.log('RPC status:', rpcRes.status);
    const rpcText = await rpcRes.text();
    console.log('RPC response:', rpcText.substring(0, 200));

    if (rpcRes.ok) {
        console.log('SUCCESS via RPC!');
        return;
    }

    // Second try: use the Supabase Management API (requires personal access token)
    // This won't work with service role key, so let's just output the SQL for the user
    console.log('\n--- Cannot execute DDL via PostgREST (service role cannot DROP tables) ---');
    console.log('\nThe user needs to execute this SQL in the Supabase Dashboard SQL Editor:\n');
    console.log(sql);
}

run().catch(e => console.error(e));
