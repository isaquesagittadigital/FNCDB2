
import { FastifyInstance } from 'fastify';
import { supabase } from '../lib/supabase';
import { z } from 'zod';

const clientSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).optional(), // Optional for updates
    nome_fantasia: z.string().optional(),
    razao_social: z.string().optional(),
    cpf: z.string().optional(),
    cnpj: z.string().optional(),
    data_nascimento: z.string().optional(),
    sexo: z.string().optional(),
    nacionalidade: z.string().optional(),
    rg: z.string().optional(),
    orgao_emissor: z.string().optional(),
    uf_rg: z.string().optional(),
    estado_civil: z.string().optional(),
    profissao: z.string().optional(),
    ppe: z.boolean().optional(),
    tipo_user: z.enum(['Cliente', 'Consultor', 'Admin']).default('Cliente'),
    tipo_cliente: z.enum(['Pessoa Física', 'Pessoa Jurídica']).default('Pessoa Física'),
    // Address
    cep: z.string().optional(),
    logradouro: z.string().optional(),
    numero: z.string().optional(),
    complemento: z.string().optional(),
    bairro: z.string().optional(),
    cidade: z.string().optional(),
    uf: z.string().optional(),
    // Contacts
    telefone_principal: z.string().optional(),
    telefone_secundario: z.string().optional(),
    celular: z.string().optional(),
    email_alternativo: z.string().optional(),
});

export async function adminRoutes(server: FastifyInstance) {
    // 1. List Clients (Paginated)
    server.get('/clients', async (request: any, reply) => {
        const { page = 1, limit = 20, search = '' } = request.query;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        try {
            let query = supabase
                .from('usuarios')
                .select('*', { count: 'exact' })
                .eq('tipo_user', 'Cliente')
                .range(from, to)
                .order('created_at', { ascending: false });

            if (search) {
                // Determine if search is CPF/CNPJ or Name
                if (search.match(/^\d+$/)) { // digits only -> cpf/cnpj
                    query = query.or(`cpf.eq.${search},cnpj.eq.${search}`);
                } else {
                    query = query.ilike('nome_fantasia', `%${search}%`);
                }
            }

            const { data, count, error } = await query;

            if (error) throw error;

            return reply.send({ data, total: count, page: Number(page), limit: Number(limit) });
        } catch (err: any) {
            server.log.error(err);
            return reply.status(500).send({ error: err.message });
        }
    });

    // 2. Get Client Details
    server.get('/clients/:id', async (request: any, reply) => {
        const { id } = request.params;
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return reply.send(data);
        } catch (err: any) {
            return reply.status(500).send({ error: err.message });
        }
    });

    // 3. Create Client
    server.post('/clients', async (request: any, reply) => {
        try {
            const body = clientSchema.parse(request.body);

            // 1. Create Auth User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: body.email,
                password: body.password || 'temp123456', // Default temp password
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Failed to create auth user');

            // 2. Create Profile (Trigger might handle this, or we do it manually if trigger is basic)
            // Assuming we need to update/insert the profile with details
            const profileData = {
                id: authData.user.id,
                email: body.email,
                ...body
            };

            // Remove password from profile update object
            delete (profileData as any).password;

            const { data: profile, error: profileError } = await supabase
                .from('usuarios')
                .upsert(profileData) // Upsert in case trigger created a blank row
                .select()
                .single();

            if (profileError) throw profileError;

            return reply.send(profile);

        } catch (err: any) {
            server.log.error(err);
            return reply.status(400).send({ error: err.message || 'Error creating client' });
        }
    });

    // 4. Update Client
    server.put('/clients/:id', async (request: any, reply) => {
        const { id } = request.params;
        try {
            // Validate partial? For now accept body as is, just sanitizing
            const body = request.body;
            // Remove sensitive/immutable fields
            delete body.id;
            delete body.email;
            delete body.password;

            const { data, error } = await supabase
                .from('usuarios')
                .update(body)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return reply.send(data);
        } catch (err: any) {
            return reply.status(500).send({ error: err.message });
        }
    });

    // Recent Clients (Keep existing)
    server.get('/clients/recent', async (request, reply) => {
        try {
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
