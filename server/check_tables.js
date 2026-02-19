// Script to search which tables are referenced in the codebase
const { execSync } = require('child_process');
const fs = require('fs');

const tables = [
    "contratos", "comprovantes", "faqs", "renovacoes", "chat_messages",
    "resgates", "processos_comprovantes", "contract_templates", "doc_arquivos",
    "processos", "contracts", "comissoes", "perfil_user", "notificacoes",
    "usuarios", "app_users", "valores_comissoes", "contas_bancarias",
    "meu_consultor", "banks", "equipe", "invoices", "webhooks",
    "user_onboarding", "logs", "contract_cl", "documents", "aportes",
    "chat_conversations", "participacoes", "nome_banco", "produtos",
    "notifications", "permissoes_usuario", "calendario"
];

const results = [];

for (const table of tables) {
    try {
        // Search in both frontend and backend
        const cmd = `findstr /s /i /c:"'${table}'" "c:\\Projeto Code IA\\fncd-capital\\components\\*.tsx" "c:\\Projeto Code IA\\fncd-capital\\components\\*.ts" "c:\\Projeto Code IA\\fncd-capital\\server\\src\\*.ts" "c:\\Projeto Code IA\\fncd-capital\\lib\\*.ts" "c:\\Projeto Code IA\\fncd-capital\\pages\\*.tsx" 2>nul`;
        const output = execSync(cmd, { encoding: 'utf8', timeout: 5000 }).trim();
        const files = [...new Set(output.split('\n').map(l => {
            const match = l.match(/^(.+?\.(tsx?|ts)):/);
            return match ? match[1].replace('c:\\Projeto Code IA\\fncd-capital\\', '') : null;
        }).filter(Boolean))];
        results.push({ table, used: true, files: files.length, filesList: files.slice(0, 5) });
    } catch (e) {
        results.push({ table, used: false, files: 0, filesList: [] });
    }
}

// Output results
const used = results.filter(r => r.used);
const unused = results.filter(r => !r.used);

console.log('=== TABELAS EM USO ===');
used.forEach(r => console.log(`  ✅ ${r.table} (${r.files} arquivos)`));

console.log('\n=== TABELAS NÃO UTILIZADAS ===');
unused.forEach(r => console.log(`  ❌ ${r.table}`));

fs.writeFileSync('C:/tmp/table_usage.json', JSON.stringify({ used, unused }, null, 2));
console.log('\nSaved to C:/tmp/table_usage.json');
