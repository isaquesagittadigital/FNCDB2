require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Erro: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos no .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function atualizarDataFim() {
    console.log("Iniciando atualização dos contratos vivos...");
    console.log("ATENÇÃO: Certifique-se de que a coluna 'data_fim' ('date') foi criada no painel do Supabase antes de rodar este script.\n");

    try {
        // Busca todos os contratos
        const { data: contratos, error } = await supabase
            .from('contratos')
            .select('id, data_inicio, periodo_meses, data_fim');

        if (error) throw error;

        console.log(`Encontrados ${contratos.length} contratos para processar.`);

        let atualizados = 0;
        let jaPreenchidos = 0;
        let semDados = 0;

        for (const contrato of contratos) {
            if (contrato.data_fim) {
                jaPreenchidos++;
                continue;
            }

            if (contrato.data_inicio && contrato.periodo_meses) {
                const dataInicio = new Date(contrato.data_inicio + 'T12:00:00Z');
                dataInicio.setMonth(dataInicio.getMonth() + parseInt(contrato.periodo_meses));
                const dataFimCalculada = dataInicio.toISOString().split('T')[0];

                // Atualiza no banco
                const { error: updateError } = await supabase
                    .from('contratos')
                    .update({ data_fim: dataFimCalculada })
                    .eq('id', contrato.id);

                if (updateError) {
                    console.error(`Erro ao atualizar contrato ${contrato.id}:`, updateError.message);
                } else {
                    atualizados++;
                    console.log(`Contrato ${contrato.id}: data_fim atualizada para ${dataFimCalculada}`);
                }
            } else {
                semDados++;
            }
        }

        console.log("\n================ RESULTADO ===============");
        console.log(`Atualizados com sucesso: ${atualizados}`);
        console.log(`Já estavam preenchidos : ${jaPreenchidos}`);
        console.log(`Sem data_inicio/periodo: ${semDados}`);
        console.log("==========================================\n");

    } catch (error) {
        if (error.code === '42703') {
            console.error("ERRO CRÍTICO: A coluna 'data_fim' DE FATO AINDA NÃO EXISTE!");
            console.error("Crie a coluna 'data_fim' do tipo 'date' na tabela 'contratos' do Supabase e tente novamente.");
        } else {
            console.error("Erro inesperado:", error);
        }
    }
}

atualizarDataFim();
