
import { FastifyInstance } from 'fastify';
import { supabase } from '../lib/supabase';

export async function adminRoutes(server: FastifyInstance) {
    server.get('/clients/recent', async (request, reply) => {
        try {
            // Fetch recent 10 clients with their consultant info
            // Note: We use !inner or referencing the foreign key correctly.
            // Based on schema: meu_consultor.cliente_id -> usuarios.id
            // We want to select from usuarios where tipo_user is Cliente.
            // And also get the associated consultant name.

            const { data, count, error } = await supabase
                .from('usuarios')
                .select(`
                    id,
                    nome_fantasia,
                    razao_social,
                    cpf,
                    cnpj,
                    status_cliente,
                    tipo_cliente,
                    created_at,
                    meu_consultor!meu_consultor_cliente_id_fkey (
                        consultor:consultor_id (
                            nome_fantasia,
                            razao_social
                        )
                    )
                `, { count: 'exact' })
                .eq('tipo_user', 'Cliente')
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) {
                server.log.error(error);
                return reply.status(500).send({ error: error.message });
            }

            return reply.send({ data, total: count });
        } catch (err) {
            server.log.error(err);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
}
