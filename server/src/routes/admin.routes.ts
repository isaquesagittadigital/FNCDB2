import { FastifyInstance } from 'fastify';
import { supabase } from '../lib/supabase';
import { z } from 'zod';
import { sendWelcomeEmail, sendRenewalRequestEmail, sendRedeemRequestEmail } from '../services/email.service';
import { createContractEnvelope, getEnvelopeDetails, getEnvelopeDocuments, downloadSignedDocument, createWebhook, listWebhooks, deleteWebhook } from '../services/clicksign';
import { generateFullContractPdf } from '../services/contract-template';
import crypto from 'crypto';

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
        const { page = 1, limit = 20, name = '', document = '', consultant_id = '' } = request.query;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        try {
            let query;

            if (consultant_id) {
                query = supabase
                    .from('usuarios')
                    .select('*, meu_consultor!inner(consultor_id)', { count: 'exact' })
                    .eq('meu_consultor.consultor_id', consultant_id);
            } else {
                query = supabase
                    .from('usuarios')
                    .select('*', { count: 'exact' });
            }

            // Base filters: Only clients and not deleted
            query = query.eq('tipo_user', 'Cliente')
                .or('deletado.is.null,deletado.eq.false');

            // Apply filters
            if (name) {
                query = query.or(`nome_fantasia.ilike.%${name}%,razao_social.ilike.%${name}%`);
            }

            if (document) {
                const cleanDoc = document.replace(/\D/g, '');
                if (cleanDoc) {
                    query = query.or(`cpf.ilike.%${cleanDoc}%,cnpj.ilike.%${cleanDoc}%,cpf.eq.${document},cnpj.eq.${document}`);
                } else {
                    query = query.or(`cpf.eq.${document},cnpj.eq.${document}`);
                }
            }

            const { data, count, error } = await query
                .order('created_at', { ascending: false })
                .range(from, to);

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
            // Extend schema to accept consultant_id
            const body = clientSchema.extend({
                consultant_id: z.string().optional()
            }).parse(request.body);

            // 1. Create Auth User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: body.email,
                password: body.password || 'temp123456', // Default temp password
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Failed to create auth user');

            // 2. Create Profile
            const profileData = {
                id: authData.user.id,
                ...body
            };

            // Remove non-table fields
            delete (profileData as any).password;
            delete (profileData as any).consultant_id;

            const { data: profile, error: profileError } = await supabase
                .from('usuarios')
                .upsert(profileData)
                .select()
                .single();

            if (profileError) throw profileError;

            // 3. Link Consultant (if provided)
            if (body.consultant_id) {
                const { error: linkError } = await supabase
                    .from('meu_consultor')
                    .insert({
                        cliente_id: profile.id,
                        consultor_id: body.consultant_id
                    });

                if (linkError) {
                    server.log.error('Failed to link consultant: ' + linkError.message);
                    // Don't fail the whole request, just log it? Or maybe return a warning?
                }
            }

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
    server.get('/clients/recent', async (request: any, reply) => {
        try {
            const { startDate, endDate } = request.query;

            let query = supabase
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
                .eq('tipo_user', 'Cliente');

            if (startDate && endDate) {
                query = query.gte('created_at', startDate).lte('created_at', endDate + 'T23:59:59');
            }

            const { data, count, error } = await query
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


    // Bank Accounts Management
    // 5. list
    server.get('/clients/:id/bank-accounts', async (request: any, reply) => {
        const { id } = request.params;
        try {
            const { data, error } = await supabase
                .from('contas_bancarias')
                .select('*')
                .eq('user_id', id);

            if (error) throw error;
            return reply.send(data);
        } catch (err: any) {
            return reply.status(500).send({ error: err.message });
        }
    });

    // 6. create
    server.post('/clients/:id/bank-accounts', async (request: any, reply) => {
        const { id } = request.params;
        const body = request.body; // Validate schema ideally
        try {
            const { data, error } = await supabase
                .from('contas_bancarias')
                .insert({
                    ...body,
                    user_id: id
                })
                .select()
                .single();

            if (error) throw error;
            return reply.send(data);
        } catch (err: any) {
            return reply.status(500).send({ error: err.message });
        }
    });

    // 7. delete
    server.delete('/clients/:id/bank-accounts/:accountId', async (request: any, reply) => {
        const { accountId } = request.params;
        try {
            const { error } = await supabase
                .from('contas_bancarias')
                .delete()
                .eq('id', accountId);

            if (error) throw error;
            return reply.send({ success: true });
        } catch (err: any) {
            return reply.status(500).send({ error: err.message });
        }
    });

    // 7b. Update Bank Account
    server.put('/clients/:id/bank-accounts/:accountId', async (request: any, reply) => {
        const { accountId } = request.params;
        const body = request.body;
        try {
            delete body.id;
            delete body.user_id; // prevent moving account to another user

            const { data, error } = await supabase
                .from('contas_bancarias')
                .update(body)
                .eq('id', accountId)
                .select()
                .single();

            if (error) throw error;
            return reply.send(data);
        } catch (err: any) {
            return reply.status(500).send({ error: err.message });
        }
    });

    // 7c. Get User Onboarding/KYC Data (validation_token, ip_address, declarations_accepted_at, suitability, compliance, etc.)
    server.get('/clients/:id/onboarding', async (request: any, reply) => {
        const { id } = request.params;
        try {
            const { data, error } = await supabase
                .from('user_onboarding')
                .select('*')
                .eq('user_id', id)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
            return reply.send(data || {});
        } catch (err: any) {
            return reply.status(500).send({ error: err.message });
        }
    });


    // Contracts Management
    // 8. list contracts
    server.get('/clients/:id/contracts', async (request: any, reply) => {
        const { id } = request.params;
        try {
            const { data, error } = await supabase
                .from('contratos')
                .select('*')
                .eq('user_id', id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return reply.send(data);
        } catch (err: any) {
            return reply.status(500).send({ error: err.message });
        }
    });

    // 9. create contract (metadata + status)
    server.post('/clients/:id/contracts', async (request: any, reply) => {
        const { id } = request.params;
        const body = request.body;
        try {
            const { data, error } = await supabase
                .from('contratos')
                .insert({
                    ...body,
                    user_id: id
                })
                .select()
                .single();

            if (error) throw error;
            return reply.send(data);
        } catch (err: any) {
            return reply.status(500).send({ error: err.message });
        }
    });

    // Consultants Management
    server.get('/consultants', async (request: any, reply) => {
        const { page = 1, limit = 20, name = '', document = '' } = request.query;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        try {
            let query = supabase
                .from('usuarios')
                .select('*', { count: 'exact' })
                .eq('tipo_user', 'Consultor')
                .or('deletado.is.null,deletado.eq.false');

            // Apply filters
            if (name) {
                query = query.or(`nome_fantasia.ilike.%${name}%,razao_social.ilike.%${name}%`);
            }

            if (document) {
                const cleanDoc = document.replace(/\D/g, '');
                if (cleanDoc) {
                    query = query.or(`cpf.ilike.%${cleanDoc}%,cnpj.ilike.%${cleanDoc}%,cpf.eq.${document},cnpj.eq.${document}`);
                } else {
                    query = query.or(`cpf.eq.${document},cnpj.eq.${document}`);
                }
            }

            const { data: consultants, count, error } = await query
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            // Fetch client counts
            const consultantsWithCounts = await Promise.all(consultants.map(async (c: any) => {
                const { count: clientCount } = await supabase
                    .from('meu_consultor')
                    .select('*', { count: 'exact', head: true })
                    .eq('consultor_id', c.id);
                return { ...c, client_count: clientCount || 0 };
            }));

            return reply.send({ data: consultantsWithCounts, total: count, page: Number(page), limit: Number(limit) });
        } catch (err: any) {
            server.log.error(err);
            return reply.status(500).send({ error: err.message });
        }
    });

    server.post('/consultants', async (request: any, reply) => {
        const body = request.body;
        try {
            if (!body.email || !body.nome_fantasia) {
                return reply.status(400).send({ error: 'Nome e Email são obrigatórios.' });
            }

            const { data, error } = await supabase
                .from('usuarios')
                .insert({
                    ...body,
                    tipo_user: 'Consultor',
                    status_cliente: 'Ativo'
                })
                .select()
                .single();

            if (error) throw error;
            return reply.send(data);
        } catch (err: any) {
            return reply.status(500).send({ error: err.message });
        }
    });

    server.put('/consultants/:id', async (request: any, reply) => {
        const { id } = request.params;
        const body = request.body;
        try {
            delete body.id;
            delete body.tipo_user; // Prevent changing user type

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

    server.delete('/consultants/:id', async (request: any, reply) => {
        const { id } = request.params;
        try {
            const { error } = await supabase
                .from('usuarios')
                .update({
                    deletado: true,
                    status_cliente: 'Inativo'
                })
                .eq('id', id);

            if (error) throw error;
            return reply.send({ message: 'Consultor inativado com sucesso' });
        } catch (err: any) {
            return reply.status(500).send({ error: err.message });
        }
    });

    // Generic User Creation (Admin/Consultor)
    server.post('/users', async (request: any, reply) => {
        const body = request.body;
        try {
            // Basic validation
            if (!body.email || !body.nome_fantasia || !body.tipo_user) {
                return reply.status(400).send({ error: 'Nome, Email e Nível de Acesso são obrigatórios.' });
            }

            // 1. Create Auth User with random password
            const tempPassword = crypto.randomBytes(12).toString('hex');

            const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                email: body.email,
                password: tempPassword,
                email_confirm: true,
                user_metadata: { nome_fantasia: body.nome_fantasia }
            });

            if (authError) {
                console.error('Auth Error:', authError);
                return reply.status(400).send({ error: `Erro ao criar autenticação: ${authError.message}` });
            }

            // 2. Insert into public.usuarios
            const { data: profile, error: profileError } = await supabase
                .from('usuarios')
                .insert({
                    id: authUser.user.id,
                    email: body.email,
                    nome_fantasia: body.nome_fantasia,
                    tipo_user: body.tipo_user,
                    os_cargo_user: body.os_cargo_user || body.tipo_user,
                    status_cliente: 'Ativo'
                })
                .select()
                .single();

            if (profileError) {
                // Cleanup auth user if profile fails? (Optional but good)
                await supabase.auth.admin.deleteUser(authUser.user.id);
                throw profileError;
            }

            // 3. Generate password reset/recovery link
            const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
                type: 'recovery',
                email: body.email,
                options: {
                    redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`
                }
            });

            if (linkError) {
                console.warn('Failed to generate recovery link:', linkError);
                // We created the user, but couldn't make the link. Maybe return success but warn?
                // Or just use the standard invite if preferred.
            }

            // 4. Send Welcome Email
            if (linkData?.properties?.action_link) {
                try {
                    await sendWelcomeEmail(
                        body.email,
                        body.nome_fantasia,
                        linkData.properties.action_link
                    );
                } catch (notiErr) {
                    console.error('[Approval Finalize] Error sending notifications:', notiErr);
                    // Don't fail the whole process if notifications fail, but log it
                }
            }
            // Don't fail the whole user creation if just email fails, but maybe return a partial success?

            return reply.send(profile);
        } catch (err: any) {
            console.error('Creation Error:', err);
            return reply.status(500).send({ error: err.message });
        }
    });


    // Global Contracts Management
    server.get('/contracts', async (request: any, reply) => {
        try {
            const { startDate, endDate } = request.query;

            // Direct REST API call to bypass supabase-js PostgREST schema cache issue
            const supabaseUrl = process.env.SUPABASE_URL;
            const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            let url = `${supabaseUrl}/rest/v1/contratos?select=id,user_id,codigo,titulo,status,valor_aporte,taxa_mensal,periodo_meses,data_inicio,dia_pagamento,consultor_id,created_at,preferencia_assinatura,taxa_consultor,taxa_lider,lider_id,data_assinatura,arquivo_url,segundo_pagamento,status_contrato_id&order=created_at.desc`;

            if (startDate && endDate) {
                url += `&created_at=gte.${startDate}&created_at=lte.${endDate}T23:59:59`;
            }

            const contractsRes = await fetch(
                url,
                {
                    headers: {
                        'apikey': serviceKey!,
                        'Authorization': `Bearer ${serviceKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!contractsRes.ok) {
                const errText = await contractsRes.text();
                throw new Error(`Supabase REST error: ${errText}`);
            }

            const contracts = (await contractsRes.json()) as any[];

            // Side-load user names
            if (contracts && contracts.length > 0) {
                const userIds = [...new Set(contracts.map((c: any) => c.user_id).filter(Boolean))] as string[];

                if (userIds.length > 0) {
                    const idsParam = userIds.map((id) => `"${id}"`).join(',');
                    const usersRes = await fetch(
                        `${supabaseUrl}/rest/v1/usuarios?select=id,nome_fantasia,razao_social,email&id=in.(${idsParam})`,
                        {
                            headers: {
                                'apikey': serviceKey!,
                                'Authorization': `Bearer ${serviceKey}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    if (usersRes.ok) {
                        const users = (await usersRes.json()) as any[];
                        const result = contracts.map((c: any) => {
                            const user = users.find((u: any) => u.id === c.user_id);
                            return {
                                ...c,
                                client_name: user ? (user.nome_fantasia || user.razao_social || user.email) : 'Desconhecido'
                            };
                        });
                        return reply.send(result);
                    }
                }
            }

            return reply.send(contracts || []);
        } catch (err: any) {
            server.log.error(err);
            return reply.status(500).send({ error: err.message });
        }
    });

    // Helper to check if a string of digits contains any sequences of 3
    const hasSequentialDigits = (str: string): boolean => {
        for (let i = 0; i < str.length - 2; i++) {
            const a = parseInt(str[i]);
            const b = parseInt(str[i + 1]);
            const c = parseInt(str[i + 2]);
            // Check ascending (123, 456)
            if (a + 1 === b && b + 1 === c) return true;
            // Check descending (321, 654)
            if (a - 1 === b && b - 1 === c) return true;
        }
        return false;
    };

    server.post('/contracts', async (request: any, reply) => {
        const body = request.body;
        try {
            if (!body.user_id || !body.titulo) {
                return reply.status(400).send({ error: 'Cliente (user_id) e Título são obrigatórios.' });
            }

            // Generate a unique 6-digit numeric code
            let codigo: string;
            let codigo_externo: string;
            let isUnique = false;

            do {
                codigo = String(Math.floor(100000 + Math.random() * 900000));
                codigo_externo = String(Math.floor(100000 + Math.random() * 900000));

                if (hasSequentialDigits(codigo) || hasSequentialDigits(codigo_externo)) {
                    continue; // Skip and regenerate if they have sequence
                }

                const { data: existing } = await supabase
                    .from('contratos')
                    .select('id')
                    .or(`codigo.eq.${codigo},codigo_externo.eq.${codigo_externo}`)
                    .maybeSingle();

                isUnique = !existing;
            } while (!isUnique);

            body.codigo = codigo;
            body.codigo_externo = codigo_externo;

            // Audit fields
            const now = new Date();
            // Data in YYYY-MM-DD
            body.data_criacao = now.toISOString().split('T')[0];
            // Time in HH:MM:SS
            body.hora_criacao = now.toISOString().split('T')[1].substring(0, 8);

            // Try to get IP from x-forwarded-for or fallback to req.socket
            const ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress || 'unknown';
            body.ip_criacao = typeof ip === 'string' ? ip.split(',')[0].trim() : ip[0];

            // If a token was provided in the headers, try to get the user ID
            const authHeader = request.headers.authorization;
            if (authHeader) {
                const token = authHeader.replace('Bearer ', '');
                const { data: { user } } = await supabase.auth.getUser(token);
                if (user) {
                    body.usuario_criacao = user.id;
                }
            }

            // Apply fixed rule for consultor lider
            body.percentual_consultor_lider = 0.10;

            // Map frontend fields to DB columns if they mismatch, or just pass body
            const { data, error } = await supabase
                .from('contratos')
                .insert(body)
                .select()
                .single();

            if (error) throw error;

            // Notify Client
            if (data && data.user_id) {
                const { error: notifError } = await supabase.from('notificacoes').insert({
                    user_id: data.user_id,
                    type: 'Sistema',
                    title: 'Novo Contrato Disponível',
                    content: `Um novo contrato "${data.titulo}" foi gerado e está disponível para sua visualização.`,
                    is_read: false
                });
                if (notifError) console.error('Error creating notification:', notifError);
            }

            return reply.send(data);
        } catch (err: any) {
            return reply.status(500).send({ error: err.message });
        }
    });

    server.put('/contracts/:id', async (request: any, reply) => {
        const { id } = request.params;
        const body = request.body;
        try {
            // Fetch old contract to detect status change
            const { data: oldContract } = await supabase
                .from('contratos')
                .select('status, titulo, user_id')
                .eq('id', id)
                .single();

            delete body.id; // protect ID

            const { data, error } = await supabase
                .from('contratos')
                .update(body)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // Notify client on status changes
            if (data?.user_id && body.status && oldContract?.status !== body.status) {
                const statusMessages: Record<string, { title: string; content: string }> = {
                    'Assinando': {
                        title: 'Contrato Pronto para Assinatura',
                        content: `Seu contrato "${data.titulo}" está pronto para assinatura. Acesse seus documentos para assinar.`
                    },
                    'Vigente': {
                        title: 'Contrato Assinado com Sucesso',
                        content: `Seu contrato "${data.titulo}" foi assinado e está vigente.`
                    },
                    'Cancelado': {
                        title: 'Contrato Cancelado',
                        content: `Seu contrato "${data.titulo}" foi cancelado.`
                    },
                    'Finalizado': {
                        title: 'Contrato Finalizado',
                        content: `Seu contrato "${data.titulo}" foi finalizado com sucesso.`
                    }
                };

                const msg = statusMessages[body.status];
                if (msg) {
                    await supabase.from('notificacoes').insert({
                        user_id: data.user_id,
                        type: 'Contrato',
                        title: msg.title,
                        content: msg.content,
                        is_read: false
                    });
                }
            }

            return reply.send(data);
        } catch (err: any) {
            return reply.status(500).send({ error: err.message });
        }
    });

    server.delete('/contracts/:id', async (request: any, reply) => {
        const { id } = request.params;
        try {
            // Only allow deleting contracts with status 'Rascunho'
            const { data: contract, error: fetchError } = await supabase
                .from('contratos')
                .select('status')
                .eq('id', id)
                .single();

            if (fetchError || !contract) {
                return reply.status(404).send({ error: 'Contrato não encontrado.' });
            }

            if (contract.status !== 'Rascunho') {
                return reply.status(400).send({ error: 'Apenas contratos com status Rascunho podem ser excluídos.' });
            }

            // Delete associated calendario/pagamentos first
            const supabaseUrl = process.env.SUPABASE_URL!;
            const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
            await fetch(
                `${supabaseUrl}/rest/v1/calendario%2Fpagamentos?contrato_id=eq.${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'apikey': serviceKey,
                        'Authorization': `Bearer ${serviceKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    }
                }
            );

            // Delete the contract
            const { error } = await supabase
                .from('contratos')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return reply.send({ message: 'Contrato excluído com sucesso' });
        } catch (err: any) {
            return reply.status(500).send({ error: err.message });
        }
    });

    // Calendar Payments (Bulk Insert)
    server.post('/calendar-payments', async (request: any, reply) => {
        const { payments } = request.body;
        try {
            if (!Array.isArray(payments) || payments.length === 0) {
                return reply.status(400).send({ error: 'Pagamentos são obrigatórios.' });
            }

            // Use direct fetch with URL-encoded table name (slash in name breaks supabase-js)
            const supabaseUrl = process.env.SUPABASE_URL;
            const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;



            const res = await fetch(
                `${supabaseUrl}/rest/v1/calendario%2Fpagamentos`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': serviceKey!,
                        'Authorization': `Bearer ${serviceKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify(payments)
                }
            );

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Supabase error: ${errText}`);
            }

            return reply.send({ message: 'Pagamentos inseridos com sucesso', count: payments.length });
        } catch (err: any) {
            server.log.error(err);
            return reply.status(500).send({ error: err.message });
        }
    });

    // Calendar Payments (GET - Fetch)
    server.get('/calendar-payments', async (request: any, reply) => {
        try {
            const { consultor_id, cliente_id, contrato_id, month, year, type } = request.query;
            const supabaseUrl = process.env.SUPABASE_URL;
            const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            // Build query params for PostgREST
            const params = new URLSearchParams();
            params.append('select', '*');
            params.append('order', 'data.asc');

            if (contrato_id) {
                params.append('contrato_id', `eq.${contrato_id}`);
            }
            if (consultor_id) {
                params.append('consultor_id', `eq.${consultor_id}`);
            }
            if (cliente_id) {
                params.append('cliente_id', `eq.${cliente_id}`);
            }
            // Check for specific type (dividendos, comissoes, comissoes_lider)
            if (type === 'dividendos') {
                params.append('dividendos_clientes', 'eq.true');
            } else if (type === 'comissoes') {
                params.append('comissao_consultor', 'eq.true');
            } else if (type === 'comissoes_lider') {
                params.append('comissao_consultor_lider', 'eq.true');
            }
            // Filter by month/year if provided
            if (month && year) {
                const m = parseInt(month);
                const y = parseInt(year);
                const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
                // last day of month
                const lastDay = new Date(y, m, 0).getDate();
                const endDate = `${y}-${String(m).padStart(2, '0')}-${lastDay}`;
                params.append('data', `gte.${startDate}`);
                params.append('data', `lte.${endDate}`);
            }

            const res = await fetch(
                `${supabaseUrl}/rest/v1/calendario%2Fpagamentos?${params.toString()}`,
                {
                    headers: {
                        'apikey': serviceKey!,
                        'Authorization': `Bearer ${serviceKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Supabase error: ${errText}`);
            }

            const data = (await res.json()) as any[];

            // Only show payments from Vigente contracts for clients and consultants
            if (cliente_id || consultor_id) {
                const queryParam = cliente_id ? `user_id=eq.${cliente_id}` : `consultor_id=eq.${consultor_id}`;
                const contratosRes = await fetch(
                    `${supabaseUrl}/rest/v1/contratos?select=id&${queryParam}&status=eq.Vigente`,
                    {
                        headers: {
                            'apikey': serviceKey!,
                            'Authorization': `Bearer ${serviceKey}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (contratosRes.ok) {
                    const contratos = (await contratosRes.json()) as { id: string }[];
                    const vigenteIds = new Set(contratos.map(c => c.id));
                    const filtered = data.filter(p => vigenteIds.has(p.contrato_id));
                    return reply.send(filtered);
                }
            }

            return reply.send(data);

        } catch (err: any) {
            server.log.error(err);
            return reply.status(500).send({ error: err.message });
        }
    });

    // Calendar Payments (PATCH - Mark as paid)
    server.patch('/calendar-payments/:id/pay', async (request: any, reply) => {
        const { id } = request.params;
        try {
            const supabaseUrl = process.env.SUPABASE_URL;
            const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            const res = await fetch(
                `${supabaseUrl}/rest/v1/calendario%2Fpagamentos?id=eq.${id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'apikey': serviceKey!,
                        'Authorization': `Bearer ${serviceKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({ pago: true })
                }
            );

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Supabase error: ${errText}`);
            }

            return reply.send({ success: true, message: 'Status do pagamento atualizado com sucesso.' });
        } catch (err: any) {
            server.log.error(err);
            return reply.status(500).send({ error: err.message });
        }
    });

    // User Permissions Management
    server.get('/users/:id/permissions', async (request: any, reply) => {
        const { id } = request.params;
        try {
            const { data, error } = await supabase
                .from('permissoes_usuario')
                .select('*')
                .eq('user_id', id);

            if (error) throw error;
            return reply.send(data);
        } catch (err: any) {
            return reply.status(500).send({ error: err.message });
        }
    });

    server.put('/users/:id/permissions', async (request: any, reply) => {
        const { id } = request.params;
        const { permissions, tipo_perfil_usuario } = request.body;

        if (!id || id === 'undefined') {
            return reply.status(400).send({ error: 'ID de usuário ausente' });
        }

        console.log(`Updating permissions for user ${id}`, JSON.stringify(request.body, null, 2));

        try {
            // Update user profile type if provided
            if (tipo_perfil_usuario !== undefined) {
                const { error: userError } = await supabase
                    .from('usuarios')
                    .update({ tipo_perfil_usuario })
                    .eq('id', id);

                if (userError) {
                    console.error('Error updating usuario profile type:', userError);
                    return reply.status(500).send({ error: `Erro ao atualizar nível de acesso: ${userError.message}` });
                }
            }

            // Sync permissions: Delete old ones and insert new ones to avoid upsert complexities
            if (permissions && Array.isArray(permissions)) {
                // Delete existing permissions for this user
                const { error: deleteError } = await supabase
                    .from('permissoes_usuario')
                    .delete()
                    .eq('user_id', id);

                if (deleteError) {
                    console.error('Error deleting old permissions:', deleteError);
                    throw deleteError;
                }

                if (permissions.length > 0) {
                    const dataToInsert = permissions.map((p: any) => ({
                        user_id: id,
                        modulo: p.modulo,
                        pode_visualizar: p.pode_visualizar === true,
                        pode_cadastrar: p.pode_cadastrar === true,
                        pode_editar: p.pode_editar === true,
                        pode_excluir: p.pode_excluir === true
                    }));

                    const { error: insertError } = await supabase
                        .from('permissoes_usuario')
                        .insert(dataToInsert);

                    if (insertError) {
                        console.error('Error inserting permissions:', insertError);
                        throw insertError;
                    }
                }
            }

            return reply.send({ success: true, message: 'Permissões atualizadas com sucesso' });
        } catch (err: any) {
            console.error('CRITICAL ERROR in permissions PUT route:', err);
            return reply.status(500).send({
                error: err.message || 'Erro interno no servidor',
                details: err.details || err.hint
            });
        }
    });

    // Generic User Update (Name, Email, Profile Type)
    server.put('/users/:id', async (request: any, reply) => {
        const { id } = request.params;
        const { nome_fantasia, email, tipo_perfil_usuario, tipo_user, os_cargo_user } = request.body;

        try {
            // 1. Update Auth Email if changed
            if (email) {
                const { error: authError } = await supabase.auth.admin.updateUserById(id, { email });
                if (authError) {
                    console.error('Auth update error:', authError);
                    if (authError.message.includes('already registered')) {
                        return reply.status(400).send({ error: 'Este e-mail já está sendo utilizado por outro usuário.' });
                    }
                }
            }

            // 2. Update public.usuarios
            const updateData: any = {};
            if (nome_fantasia !== undefined) updateData.nome_fantasia = nome_fantasia;
            if (email !== undefined) updateData.email = email;
            if (tipo_perfil_usuario !== undefined) updateData.tipo_perfil_usuario = tipo_perfil_usuario;
            if (tipo_user !== undefined) updateData.tipo_user = tipo_user;
            if (os_cargo_user !== undefined) updateData.os_cargo_user = os_cargo_user;

            const { data, error: profileError } = await supabase
                .from('usuarios')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (profileError) throw profileError;

            return reply.send(data);
        } catch (err: any) {
            console.error('Update User Error:', err);
            return reply.status(500).send({ error: err.message || 'Erro interno ao atualizar usuário' });
        }
    });

    // Delete User (Soft Delete + Auth Ban)
    server.delete('/users/:id', async (request: any, reply) => {
        const { id } = request.params;
        try {
            // 1. Ban user in Auth (Prevents login)
            const { error: _authError } = await supabase.auth.admin.updateUserById(id, {
                ban_duration: 'none' // 'none' actually removes ban, but the property name is confusing in some versions.
                // In standard Supabase Admin, we usually set 'app_metadata.disabled' or use a specific flag 
                // but the most reliable way to block access is updating the user password to something random 
                // OR setting a claim. Let's use the most direct one: ban if supported or just soft-delete + check during login.
            });

            // Re-evaluating: The most robust way in Supabase Admin API is set ban_duration or just delete if strict, 
            // but user asked for "inactivate". Let's set a flag in metadata and update the DB.
            const { error: banError } = await supabase.auth.admin.updateUserById(id, {
                user_metadata: { active: false }
            });

            if (banError) console.warn('Warning: Could not update auth metadata:', banError);

            // 2. Soft delete in DB
            const { error: dbError } = await supabase
                .from('usuarios')
                .update({
                    deletado: true,
                    status_cliente: 'Inativo'
                })
                .eq('id', id);

            if (dbError) throw dbError;

            return reply.send({ success: true, message: 'Usuário inativado com sucesso' });
        } catch (err: any) {
            console.error('Delete User Error:', err);
            return reply.status(500).send({ error: err.message || 'Erro ao excluir usuário' });
        }
    });

    // ─── PDF Download ──────────────────────────────────────────────────────────

    // GET /contracts/:id/pdf - Generate and download contract PDF
    server.get('/contracts/:id/pdf', async (request: any, reply) => {
        try {
            const { id } = request.params;
            const supabaseUrl = process.env.SUPABASE_URL;
            const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            // Fetch contract via direct REST API to bypass schema cache
            const contractRes = await fetch(
                `${supabaseUrl}/rest/v1/contratos?id=eq.${id}&select=*&limit=1`,
                {
                    headers: {
                        'apikey': serviceKey!,
                        'Authorization': `Bearer ${serviceKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!contractRes.ok) {
                const errText = await contractRes.text();
                console.error('Contract fetch error:', errText);
                return reply.status(500).send({ error: 'Erro ao buscar contrato.' });
            }

            const contracts = (await contractRes.json()) as any[];
            const contract = contracts?.[0];

            if (!contract) {
                return reply.status(404).send({ error: 'Contrato não encontrado.' });
            }

            // ── Check for signed Clicksign document ──────────────────────
            if (contract.clicksign_envelope_id) {
                try {
                    console.log(`[PDF] Contract ${id} has Clicksign envelope: ${contract.clicksign_envelope_id}`);
                    const envelopeDetails = await getEnvelopeDetails(contract.clicksign_envelope_id);
                    const envelopeStatus = envelopeDetails?.data?.attributes?.status;
                    console.log(`[PDF] Envelope status: ${envelopeStatus}`);

                    // If envelope is 'closed' (all signed), download the signed PDF
                    if (envelopeStatus === 'closed') {
                        let documentId = contract.clicksign_document_id;

                        // If we don't have the document_id stored, fetch documents from envelope
                        if (!documentId) {
                            const docsResult = await getEnvelopeDocuments(contract.clicksign_envelope_id);
                            const docs = docsResult?.data || [];
                            if (Array.isArray(docs) && docs.length > 0) {
                                documentId = docs[0].id;
                            } else if (docs?.id) {
                                documentId = docs.id;
                            }
                        }

                        if (documentId) {
                            console.log(`[PDF] Downloading signed document ${documentId} from Clicksign...`);
                            const signedPdfBuffer = await downloadSignedDocument(
                                contract.clicksign_envelope_id,
                                documentId
                            );

                            const filename = `contrato_assinado_${contract.codigo || id.substring(0, 8)}.pdf`;
                            return reply
                                .header('Content-Type', 'application/pdf')
                                .header('Content-Disposition', `inline; filename="${filename}"`)
                                .header('Content-Length', signedPdfBuffer.length)
                                .header('X-Contract-Signed', 'true')
                                .send(signedPdfBuffer);
                        }
                    }
                    // If not closed, fall through to generate local PDF
                    console.log(`[PDF] Envelope not closed (status: ${envelopeStatus}), generating local PDF`);
                } catch (clicksignErr: any) {
                    console.warn(`[PDF] Clicksign download failed, falling back to local PDF:`, clicksignErr.message);
                }
            }

            // ── Generate local PDF (fallback or no Clicksign) ────────────
            // Fetch client data via direct REST API
            let client: any = {};
            const clientIdField = contract.user_id || contract.cliente_id;
            if (clientIdField) {
                const clientRes = await fetch(
                    `${supabaseUrl}/rest/v1/usuarios?id=eq.${clientIdField}&select=*&limit=1`,
                    {
                        headers: {
                            'apikey': serviceKey!,
                            'Authorization': `Bearer ${serviceKey}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                if (clientRes.ok) {
                    const clients = (await clientRes.json()) as any[];
                    if (clients?.[0]) client = clients[0];
                }
            }

            const clientDisplayName = client.nome_fantasia || client.razao_social || client.nome || 'Cliente';

            // Generate the same PDF as sent to Clicksign
            const pdfBase64 = await generateFullContractPdf({
                clientName: clientDisplayName,
                cpf: client.cpf || '',
                rg: client.rg || undefined,
                rgOrgao: client.rg_orgao || undefined,
                address: client.endereco || undefined,
                email: client.email || '',
                cnpj: client.cnpj || undefined,
                razaoSocial: client.razao_social || undefined,
                amount: contract.valor_aporte || 0,
                rate: contract.taxa_mensal || 0,
                period: contract.periodo_meses || 6,
                paymentDay: contract.dia_pagamento || 10,
                startDate: contract.data_inicio || new Date().toISOString(),
                contractId: contract.codigo || id.substring(0, 8),
            });

            const pdfBuffer = Buffer.from(pdfBase64, 'base64');
            const filename = `contrato_${contract.codigo || id.substring(0, 8)}.pdf`;

            return reply
                .header('Content-Type', 'application/pdf')
                .header('Content-Disposition', `inline; filename="${filename}"`)
                .header('Content-Length', pdfBuffer.length)
                .header('X-Contract-Signed', 'false')
                .send(pdfBuffer);

        } catch (err: any) {
            server.log.error(err);
            return reply.status(500).send({ error: err.message });
        }
    });

    // ─── Clicksign Integration ──────────────────────────────────────────────────

    // POST /clicksign/send-contract - Create envelope + send for signature
    server.post('/clicksign/send-contract', async (request: any, reply) => {
        try {
            const { contractId, sendMethod } = request.body;

            if (!contractId) {
                return reply.status(400).send({ error: 'contractId é obrigatório.' });
            }

            // Fetch contract data
            const { data: contract, error: contractError } = await supabase
                .from('contratos')
                .select('*')
                .eq('id', contractId)
                .single();

            if (contractError || !contract) {
                return reply.status(404).send({ error: 'Contrato não encontrado.' });
            }

            // Fetch client data - contratos uses 'user_id' for client reference
            let client: any = null;
            const clientIdField = contract.user_id || contract.cliente_id;
            console.log('[Clicksign] Looking for client with id:', clientIdField);
            if (clientIdField) {
                const { data: clientData, error: clientError } = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('id', clientIdField)
                    .single();
                if (clientError) {
                    console.error('[Clicksign] Error fetching client:', clientError.message);
                }
                if (clientData) {
                    client = clientData;
                    console.log('[Clicksign] Found client:', client.nome_fantasia || client.email);
                }
            }

            if (!client || !client.email) {
                return reply.status(400).send({ error: 'Cliente não encontrado ou sem email cadastrado. Verifique os dados do cliente.' });
            }

            // Validate phone for WhatsApp/SMS delivery
            const deliveryMethod = (sendMethod || 'Email').toLowerCase() as 'email' | 'whatsapp' | 'sms';
            if ((deliveryMethod === 'whatsapp' || deliveryMethod === 'sms') && !client.celular) {
                return reply.status(400).send({
                    error: `O cliente não possui celular cadastrado. Para enviar por ${sendMethod}, cadastre o celular do cliente primeiro.`
                });
            }

            const clientDisplayName = client.nome_fantasia || client.razao_social || client.nome || 'Cliente';
            console.log(`[Clicksign] Sending contract for client: ${clientDisplayName} (${client.email})`);

            // Call Clicksign flow with full client data for 17-page contract
            const result = await createContractEnvelope({
                contractId: contract.codigo || contractId.substring(0, 8),
                clientName: clientDisplayName,
                clientEmail: client.email,
                clientCpf: client.cpf || '52998224725',
                clientBirthday: client.data_nascimento || undefined,
                clientPhone: client.celular || undefined,
                deliveryMethod,
                amount: contract.valor_aporte || 0,
                rate: contract.taxa_mensal || 0,
                period: contract.periodo_meses || 6,
                startDate: contract.data_inicio || new Date().toISOString(),
                productName: contract.titulo || 'FNCD Capital',
                paymentDay: contract.dia_pagamento || 10,
                // Extra client data for the full contract template
                clientRg: client.rg || undefined,
                clientRgOrgao: client.rg_orgao || undefined,
                clientAddress: client.endereco || undefined,
                clientCnpj: client.cnpj || undefined,
                clientRazaoSocial: client.razao_social || undefined,
            });

            // Update contract with envelope info (clicksign columns may not exist yet)
            try {
                await supabase
                    .from('contratos')
                    .update({
                        clicksign_envelope_id: result.envelopeId,
                        clicksign_document_id: result.documentId,
                        status: 'Assinando'
                    })
                    .eq('id', contractId);
            } catch (updateErr: any) {
                // If clicksign columns don't exist, just update status
                console.warn('[Clicksign] Could not update clicksign columns, updating status only:', updateErr.message);
                await supabase
                    .from('contratos')
                    .update({ status: 'Assinando' })
                    .eq('id', contractId);
            }

            return reply.send({
                success: true,
                message: 'Contrato enviado para assinatura via Clicksign.',
                envelopeId: result.envelopeId,
                documentId: result.documentId,
                signers: result.signers
            });
        } catch (err: any) {
            console.error('[Clicksign Route] Error:', err);
            return reply.status(500).send({ error: err.message });
        }
    });

    // GET /clicksign/envelope/:id - Get envelope status
    server.get('/clicksign/envelope/:id', async (request: any, reply) => {
        try {
            const { id } = request.params;
            const details = await getEnvelopeDetails(id);
            return reply.send(details);
        } catch (err: any) {
            console.error('[Clicksign Route] Error:', err);
            return reply.status(500).send({ error: err.message });
        }
    });

    // ─── Webhook Management ───────────────────────────────────────────

    // POST /clicksign/webhook/register - Register webhook on Clicksign
    server.post('/clicksign/webhook/register', async (request: any, reply) => {
        try {
            const { url } = request.body;

            if (!url) {
                return reply.status(400).send({ error: 'url é obrigatório.' });
            }

            const result = await createWebhook(url);
            return reply.send({
                success: true,
                message: 'Webhook registrado com sucesso na Clicksign.',
                webhook: result.data
            });
        } catch (err: any) {
            console.error('[Webhook Register] Error:', err);
            return reply.status(500).send({ error: err.message });
        }
    });

    // GET /clicksign/webhooks - List registered webhooks
    server.get('/clicksign/webhooks', async (_request: any, reply) => {
        try {
            const result = await listWebhooks();
            return reply.send({
                webhooks: result.data || []
            });
        } catch (err: any) {
            console.error('[Webhook List] Error:', err);
            return reply.status(500).send({ error: err.message });
        }
    });

    // DELETE /clicksign/webhook/:id - Delete a webhook
    server.delete('/clicksign/webhook/:id', async (request: any, reply) => {
        try {
            const { id } = request.params;
            await deleteWebhook(id);
            return reply.send({ success: true, message: 'Webhook removido com sucesso.' });
        } catch (err: any) {
            console.error('[Webhook Delete] Error:', err);
            return reply.status(500).send({ error: err.message });
        }
    });

    // ═══════════════════════════════════════════════════════════════════
    // ─── Consultant Dashboard Endpoints ──────────────────────────────
    // ═══════════════════════════════════════════════════════════════════

    // GET /consultant/dashboard/:consultorId - Dashboard summary
    server.get('/consultant/dashboard/:consultorId', async (request: any, reply) => {
        try {
            const { consultorId } = request.params;

            // Fetch consultant profile
            const { data: profile } = await supabase
                .from('usuarios')
                .select('id, nome_fantasia, email, foto_perfil, empresa, codigo_user')
                .eq('id', consultorId)
                .single();

            // Fetch consultant contracts with client names
            const { data: contracts } = await supabase
                .from('contratos')
                .select('id, codigo, titulo, valor_aporte, taxa_mensal, periodo_meses, data_inicio, status, taxa_consultor, user_id')
                .eq('consultor_id', consultorId);

            // Calculate patrimônio total (sum of all contract amounts)
            const patrimonio = (contracts || []).reduce((sum: number, c: any) => sum + (parseFloat(c.valor_aporte) || 0), 0);

            // Unique clients
            const clientIds = [...new Set((contracts || []).map((c: any) => c.user_id).filter(Boolean))];
            let clients: any[] = [];
            if (clientIds.length > 0) {
                const { data: clientData } = await supabase
                    .from('usuarios')
                    .select('id, nome_fantasia, email')
                    .in('id', clientIds);
                clients = clientData || [];
            }

            // Pending commissions count via direct REST API (table name has slash)
            const supabaseUrl = process.env.SUPABASE_URL;
            const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
            const countParams = new URLSearchParams();
            countParams.append('select', 'id');
            countParams.append('consultor_id', `eq.${consultorId}`);
            countParams.append('comissao_consultor', 'eq.true');
            countParams.append('pago', 'is.null');

            const countRes = await fetch(
                `${supabaseUrl}/rest/v1/calendario%2Fpagamentos?${countParams.toString()}`,
                {
                    headers: {
                        'apikey': serviceKey!,
                        'Authorization': `Bearer ${serviceKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'count=exact'
                    },
                    method: 'HEAD'
                }
            );
            const pendingCommissions = parseInt(countRes.headers.get('content-range')?.split('/')[1] || '0');

            return reply.send({
                profile,
                patrimonio,
                totalContracts: (contracts || []).length,
                totalClients: clients.length,
                pendingCommissions
            });
        } catch (err: any) {
            console.error('[Consultant Dashboard] Error:', err);
            return reply.status(500).send({ error: err.message });
        }
    });

    // GET /consultant/contracts/:consultorId - Wallet contracts
    server.get('/consultant/contracts/:consultorId', async (request: any, reply) => {
        try {
            const { consultorId } = request.params;

            const { data: contracts } = await supabase
                .from('contratos')
                .select('id, codigo, titulo, valor_aporte, taxa_mensal, periodo_meses, data_inicio, status, taxa_consultor, user_id')
                .eq('consultor_id', consultorId)
                .order('created_at', { ascending: false });

            // Get client names for each contract
            const clientIds = [...new Set((contracts || []).map((c: any) => c.user_id).filter(Boolean))];
            let clientMap: Record<string, string> = {};
            if (clientIds.length > 0) {
                const { data: clientData } = await supabase
                    .from('usuarios')
                    .select('id, nome_fantasia')
                    .in('id', clientIds);
                (clientData || []).forEach((c: any) => {
                    clientMap[c.id] = c.nome_fantasia;
                });
            }

            // Calculate end dates and enrich contracts
            const enriched = (contracts || []).map((c: any) => {
                const startDate = new Date(c.data_inicio);
                const endDate = new Date(startDate);
                endDate.setMonth(endDate.getMonth() + (c.periodo_meses || 6));

                return {
                    ...c,
                    cliente_nome: clientMap[c.user_id] || 'N/A',
                    data_fim: endDate.toISOString().split('T')[0],
                    produto: c.titulo || 'Câmbio'
                };
            });

            return reply.send({ contracts: enriched });
        } catch (err: any) {
            console.error('[Consultant Contracts] Error:', err);
            return reply.status(500).send({ error: err.message });
        }
    });

    // GET /consultant/commissions/:consultorId - Commissions from calendario/pagamentos
    server.get('/consultant/commissions/:consultorId', async (request: any, reply) => {
        try {
            const { consultorId } = request.params;
            const { page = '1', limit = '10' } = request.query as any;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const offset = (pageNum - 1) * limitNum;

            const supabaseUrl = process.env.SUPABASE_URL;
            const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
            const apiHeaders = {
                'apikey': serviceKey!,
                'Authorization': `Bearer ${serviceKey}`,
                'Content-Type': 'application/json'
            };

            // Get total count via HEAD request
            const countParams = new URLSearchParams();
            countParams.append('select', 'id');
            countParams.append('consultor_id', `eq.${consultorId}`);
            countParams.append('comissao_consultor', 'eq.true');

            const countRes = await fetch(
                `${supabaseUrl}/rest/v1/calendario%2Fpagamentos?${countParams.toString()}`,
                {
                    headers: { ...apiHeaders, 'Prefer': 'count=exact' },
                    method: 'HEAD'
                }
            );
            const totalCount = parseInt(countRes.headers.get('content-range')?.split('/')[1] || '0');

            // Get paginated commissions via direct REST
            const dataParams = new URLSearchParams();
            dataParams.append('select', 'id,valor,data,comissao_consultor,pago,evento,contrato_id,cliente_id');
            dataParams.append('consultor_id', `eq.${consultorId}`);
            dataParams.append('comissao_consultor', 'eq.true');
            dataParams.append('order', 'data.asc');
            dataParams.append('offset', String(offset));
            dataParams.append('limit', String(limitNum));

            const dataRes = await fetch(
                `${supabaseUrl}/rest/v1/calendario%2Fpagamentos?${dataParams.toString()}`,
                { headers: apiHeaders }
            );

            if (!dataRes.ok) {
                const errText = await dataRes.text();
                console.error('[Consultant Commissions] REST Error:', errText);
                return reply.status(500).send({ error: errText });
            }

            const commissions: any[] = (await dataRes.json()) as any[];

            // Enrich with client names and contract codes
            const clientIds = [...new Set(commissions.map((c: any) => c.cliente_id).filter(Boolean))];
            const contractIds = [...new Set(commissions.map((c: any) => c.contrato_id).filter(Boolean))];

            let clientMap: Record<string, string> = {};
            let contractMap: Record<string, string> = {};

            if (clientIds.length > 0) {
                const { data: clientData } = await supabase
                    .from('usuarios')
                    .select('id, nome_fantasia')
                    .in('id', clientIds);
                (clientData || []).forEach((c: any) => { clientMap[c.id] = c.nome_fantasia; });
            }

            if (contractIds.length > 0) {
                const { data: contractData } = await supabase
                    .from('contratos')
                    .select('id, codigo')
                    .in('id', contractIds);
                (contractData || []).forEach((c: any) => { contractMap[c.id] = c.codigo; });
            }

            const enriched = commissions.map((c: any) => ({
                id: c.id,
                cliente_nome: clientMap[c.cliente_id] || 'N/A',
                codigo_contrato: contractMap[c.contrato_id] || 'N/A',
                valor_comissao: parseFloat(c.valor) || 0,
                data_vencimento: c.data,
                pago: c.pago,
                evento: c.evento
            }));

            return reply.send({
                commissions: enriched,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total: totalCount,
                    totalPages: Math.ceil(totalCount / limitNum)
                }
            });
        } catch (err: any) {
            console.error('[Consultant Commissions] Error:', err);
            return reply.status(500).send({ error: err.message });
        }
    });

    // ============================================================
    // APPROVAL FLOW ENDPOINTS
    // ============================================================

    // GET /approval/processes - List all contracts in 'Processando' status for approval
    server.get('/approval/processes', async (request: any, reply) => {
        try {
            const { status: filterStatus } = request.query as { status?: string };

            let query = supabase
                .from('contratos')
                .select('*')
                .order('created_at', { ascending: false });

            // Filter: if status provided, filter by it. Otherwise show all contracts
            if (filterStatus) {
                query = query.eq('status', filterStatus);
            }
            // No else filter - show all contracts in the approval panel

            const { data: contracts, error } = await query;
            if (error) throw error;

            // Enrich with client and consultant names
            const userIds = new Set<string>();
            (contracts || []).forEach((c: any) => {
                if (c.user_id) userIds.add(c.user_id);
                if (c.consultor_id) userIds.add(c.consultor_id);
            });

            const { data: users } = await supabase
                .from('usuarios')
                .select('id, nome_fantasia, cpf, cnpj')
                .in('id', Array.from(userIds));

            const userMap: Record<string, any> = {};
            (users || []).forEach((u: any) => { userMap[u.id] = u; });

            const processes = (contracts || []).map((c: any) => {
                const client = userMap[c.user_id] || {};
                const consultant = userMap[c.consultor_id] || {};
                return {
                    id: c.id,
                    clientName: client.nome_fantasia || 'N/A',
                    consultantName: consultant.nome_fantasia || 'N/A',
                    contractCode: c.codigo || c.id?.substring(0, 8) || '',
                    amount: c.valor_aporte || 0,
                    documentId: client.cpf || client.cnpj || '',
                    status: c.aprovacao_status || 'pending',
                    contractStatus: c.status,
                    steps: [
                        {
                            id: `${c.id}-comprovante`,
                            title: 'Comprovante anexado',
                            description: 'Verificar se o consultor assinou o contrato de prestação de serviços',
                            status: c.aprovacao_comprovante || 'pending',
                            hasDocument: true
                        },
                        {
                            id: `${c.id}-perfil`,
                            title: 'Perfil do investidor',
                            description: 'Confirmar que o consultor completou todo o processo de verificação KYC',
                            status: c.aprovacao_perfil || 'pending',
                            hasDocument: true
                        },
                        {
                            id: `${c.id}-assinatura`,
                            title: 'Assinatura do contrato',
                            description: 'Verificar se o consultor anexou todos os documentos comprobatórios necessários',
                            status: c.aprovacao_assinatura || 'pending',
                            hasDocument: true
                        }
                    ],
                    clientId: c.user_id,
                    consultorId: c.consultor_id,
                    comprovante_url: c.comprovante_url,
                    clicksign_envelope_id: c.clicksign_envelope_id
                };
            });

            return reply.send(processes);
        } catch (err: any) {
            console.error('[Approval Processes] Error:', err);
            return reply.status(500).send({ error: err.message });
        }
    });

    // GET /approval/process/:contractId - Get detailed process info for a specific contract
    server.get('/approval/process/:contractId', async (request: any, reply) => {
        const { contractId } = request.params;
        try {
            const { data: contract, error } = await supabase
                .from('contratos')
                .select('*')
                .eq('id', contractId)
                .single();

            if (error || !contract) {
                return reply.status(404).send({ error: 'Contrato não encontrado.' });
            }

            // Fetch client profile
            let clientProfile = null;
            if (contract.user_id) {
                const { data } = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('id', contract.user_id)
                    .single();
                clientProfile = data;
            }

            // Fetch consultant info
            let consultantProfile = null;
            if (contract.consultor_id) {
                const { data } = await supabase
                    .from('usuarios')
                    .select('id, nome_fantasia, email, cpf')
                    .eq('id', contract.consultor_id)
                    .single();
                consultantProfile = data;
            }

            // Get Clicksign status if available
            let clicksignStatus = null;
            if (contract.clicksign_envelope_id) {
                try {
                    const envelopeDetails = await getEnvelopeDetails(contract.clicksign_envelope_id);
                    clicksignStatus = envelopeDetails;
                } catch (e: any) {
                    console.warn('[Approval] Could not fetch clicksign status:', e.message);
                }
            }

            return reply.send({
                contract,
                clientProfile,
                consultantProfile,
                clicksignStatus,
                steps: [
                    {
                        id: `${contract.id}-comprovante`,
                        title: 'Comprovante anexado',
                        description: 'Verificar se o consultor assinou o contrato de prestação de serviços',
                        status: contract.aprovacao_comprovante || 'pending',
                        hasDocument: true
                    },
                    {
                        id: `${contract.id}-perfil`,
                        title: 'Perfil do investidor',
                        description: 'Confirmar que o consultor completou todo o processo de verificação KYC',
                        status: contract.aprovacao_perfil || 'pending',
                        hasDocument: true
                    },
                    {
                        id: `${contract.id}-assinatura`,
                        title: 'Assinatura do contrato',
                        description: 'Verificar se o consultor anexou todos os documentos comprobatórios necessários',
                        status: contract.aprovacao_assinatura || 'pending',
                        hasDocument: true
                    }
                ]
            });
        } catch (err: any) {
            console.error('[Approval Process Detail] Error:', err);
            return reply.status(500).send({ error: err.message });
        }
    });

    // PATCH /approval/process/:contractId/step - Approve/Reject an individual step
    server.patch('/approval/process/:contractId/step', async (request: any, reply) => {
        const { contractId } = request.params;
        const { step, status, reason: _reason } = request.body as {
            step: 'comprovante' | 'perfil' | 'assinatura';
            status: 'approved' | 'rejected';
            reason?: string;
        };

        try {
            if (!step || !status) {
                return reply.status(400).send({ error: 'step e status são obrigatórios.' });
            }

            const columnMap: Record<string, string> = {
                comprovante: 'aprovacao_comprovante',
                perfil: 'aprovacao_perfil',
                assinatura: 'aprovacao_assinatura'
            };

            const column = columnMap[step];
            if (!column) {
                return reply.status(400).send({ error: 'Step inválido. Use: comprovante, perfil ou assinatura.' });
            }

            const updateData: any = { [column]: status };

            const { data, error } = await supabase
                .from('contratos')
                .update(updateData)
                .eq('id', contractId)
                .select()
                .single();

            if (error) throw error;

            // Notify consultant if step is rejected
            if (status === 'rejected' && data?.consultor_id) {
                const stepNames: Record<string, string> = {
                    comprovante: 'Comprovante',
                    perfil: 'Perfil do investidor',
                    assinatura: 'Assinatura do contrato'
                };
                const stepLabel = stepNames[step] || step;

                await supabase.from('notificacoes').insert({
                    user_id: data.consultor_id,
                    type: 'Sistema',
                    title: 'Fluxo de aprovação parcial reprovado',
                    content: `A etapa "${stepLabel}" do processo de integralização do contrato "${data.titulo}" foi reprovada pelo administrador. Data da reprovação: ${new Date().toLocaleDateString('pt-BR')}. Motivo: ${_reason || 'Não informado'}.`,
                    is_read: false
                });
            }

            return reply.send({
                success: true,
                step,
                status,
                contract: data
            });
        } catch (err: any) {
            console.error('[Approval Step] Error:', err);
            return reply.status(500).send({ error: err.message });
        }
    });

    // PATCH /approval/process/:contractId/finalize - Approve or reject the entire process
    server.patch('/approval/process/:contractId/finalize', async (request: any, reply) => {
        const { contractId } = request.params;
        const { approved, data_ativacao, observacao } = request.body as {
            approved: boolean;
            data_ativacao?: string;
            observacao?: string;
        };

        try {
            if (approved) {
                // Fetch current contract data
                const { data: existingContract, error: fErr } = await supabase
                    .from('contratos')
                    .select('*')
                    .eq('id', contractId)
                    .single();

                if (fErr || !existingContract) {
                    server.log.error({ fErr, contractId }, '[Approval Finalize] Contract not found');
                    throw fErr || new Error('Contrato não encontrado');
                }
                server.log.info({ existingContractId: existingContract.id, keys: Object.keys(existingContract) }, '[Approval Finalize] Contract found, proceeding to activation');

                // Activate the contract
                const startDt = new Date(data_ativacao || new Date().toISOString());
                const period = parseInt(existingContract.periodo_meses) || 12;

                // Recalculate data_fim
                const endDt = new Date(startDt);
                endDt.setMonth(endDt.getMonth() + period);
                const data_fim = endDt.toISOString().split('T')[0];

                // --- Update Contract Status (Consolidated based on test results) ---
                const finalUpdateData = {
                    status: 'Vigente',
                    data_inicio: startDt.toISOString().split('T')[0],
                    aprovacao_status: 'approved',
                    aprovacao_data: new Date().toISOString(),
                    aprovacao_obs: observacao || null
                };

                const { data: updatedContract, error: uErr } = await supabase
                    .from('contratos')
                    .update(finalUpdateData)
                    .eq('id', contractId)
                    .select()
                    .single();

                if (uErr) {
                    server.log.error({ uErr, finalUpdateData }, '[Approval Finalize] Final contract update failed');
                    throw uErr;
                }

                server.log.info({ updatedContractId: updatedContract.id }, '[Approval Finalize] Contract activated successfully');

                // --- Generate Transactions & Commissions ---
                if (updatedContract) {
                    const amount = parseFloat(updatedContract.valor_aporte) || 0;
                    const rentabilidade = parseFloat(updatedContract.taxa_mensal) || 1.6;
                    const consultorId = updatedContract.consultor_id;
                    const liderId = updatedContract.lider_id;

                    let calendarRecords: any[] = [];

                    // 1. Leader Share: 0.10% fixed
                    if (liderId) {
                        calendarRecords.push({
                            contrato_id: updatedContract.id,
                            cliente_id: updatedContract.user_id,
                            consultor_id: liderId,
                            valor: amount * 0.0010,
                            data: startDt.toISOString().split('T')[0],
                            evento: 'Participação de Líder (0.10%)',
                            dividendos_clientes: false,
                            comissao_consultor: false,
                            comissao_consultor_lider: true,
                            pago: false
                        });
                    }

                    // 2. Client & Consultant Schedule
                    let currentRefDate = new Date(startDt);

                    // First payment: Pro-rata
                    let firstPaymentDate = new Date(currentRefDate.getFullYear(), currentRefDate.getMonth(), 10);
                    if (currentRefDate.getDate() >= 7) {
                        firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);
                    }

                    const diffTime = firstPaymentDate.getTime() - currentRefDate.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const proRataDividend = (amount * (rentabilidade / 100) / 30) * diffDays;

                    calendarRecords.push({
                        contrato_id: updatedContract.id,
                        cliente_id: updatedContract.user_id,
                        consultor_id: null, // Essential for key matching in batch insert
                        data: firstPaymentDate.toISOString().split('T')[0],
                        valor: proRataDividend,
                        evento: 'Pro-rata',
                        dividendos_clientes: true,
                        comissao_consultor: false,
                        comissao_consultor_lider: false,
                        pago: false
                    });

                    if (consultorId) {
                        calendarRecords.push({
                            contrato_id: updatedContract.id,
                            cliente_id: updatedContract.user_id,
                            consultor_id: consultorId,
                            valor: proRataDividend * 0.04,
                            data: firstPaymentDate.toISOString().split('T')[0],
                            evento: 'Comissão sobre Pro-rata (4%)',
                            dividendos_clientes: false,
                            comissao_consultor: true,
                            comissao_consultor_lider: false,
                            pago: false
                        });
                    }

                    // Subsequent monthly dividends
                    let monthlyPaymentDate = new Date(firstPaymentDate);
                    const monthlyDividend = amount * (rentabilidade / 100);

                    for (let i = 1; i < period; i++) {
                        monthlyPaymentDate.setMonth(monthlyPaymentDate.getMonth() + 1);
                        const paymentDateStr = monthlyPaymentDate.toISOString().split('T')[0];

                        calendarRecords.push({
                            contrato_id: updatedContract.id,
                            cliente_id: updatedContract.user_id,
                            consultor_id: null,
                            data: paymentDateStr,
                            valor: monthlyDividend,
                            evento: 'Dividendo',
                            dividendos_clientes: true,
                            comissao_consultor: false,
                            comissao_consultor_lider: false,
                            pago: false
                        });

                        if (consultorId) {
                            calendarRecords.push({
                                contrato_id: updatedContract.id,
                                cliente_id: updatedContract.user_id,
                                consultor_id: consultorId,
                                valor: monthlyDividend * 0.04,
                                data: paymentDateStr,
                                evento: `Comissão sobre Dividendo ${i + 1} (4%)`,
                                dividendos_clientes: false,
                                comissao_consultor: true,
                                comissao_consultor_lider: false,
                                pago: false
                            });
                        }
                    }

                    // 3. Capital Return at the end
                    calendarRecords.push({
                        contrato_id: updatedContract.id,
                        cliente_id: updatedContract.user_id,
                        consultor_id: null,
                        data: data_fim,
                        valor: amount,
                        evento: 'Retorno de Aporte',
                        dividendos_clientes: true,
                        comissao_consultor: false,
                        comissao_consultor_lider: false,
                        pago: false
                    });

                    // 4. Batch insert into calendario/pagamentos
                    if (calendarRecords.length > 0) {
                        server.log.info({ calendarRecordsSample: calendarRecords.slice(0, 2), total: calendarRecords.length }, '[Approval Finalize] Inserting calendar records');
                        const supabaseUrl = process.env.SUPABASE_URL;
                        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

                        const calRes = await fetch(
                            `${supabaseUrl}/rest/v1/calendario%2Fpagamentos`,
                            {
                                method: 'POST',
                                headers: {
                                    'apikey': serviceKey!,
                                    'Authorization': `Bearer ${serviceKey}`,
                                    'Content-Type': 'application/json',
                                    'Prefer': 'return=minimal'
                                },
                                body: JSON.stringify(calendarRecords)
                            }
                        );

                        if (!calRes.ok) {
                            const errTxt = await calRes.text();
                            server.log.error({ status: calRes.status, errorText: errTxt }, '[Approval Finalize] Supabase POST error');
                            throw new Error(`Erro ao gerar calendário: ${errTxt}`);
                        } else {
                            server.log.info('[Approval Finalize] Calendar records inserted successfully');
                        }
                    }

                    // --- Notifications ---
                    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

                    const commonContent = `O contrato "${updatedContract.titulo}" foi ativado em ${startDt.toLocaleDateString('pt-BR')}. Status: Vigente. Valor do Aporte: ${formatCurrency(amount)}. Regra de Pagamento: Todo dia 10.`;

                    // 1. Notify Client
                    if (updatedContract.user_id) {
                        await supabase.from('notificacoes').insert({
                            user_id: updatedContract.user_id,
                            type: 'Sistema',
                            title: 'Contrato Ativado e Vigente',
                            content: `${commonContent} Seu calendário de dividendos (Rentabilidade: ${rentabilidade}%) já está disponível no seu painel.`,
                            is_read: false
                        });
                    }

                    // 2. Notify Consultant
                    if (consultorId) {
                        await supabase.from('notificacoes').insert({
                            user_id: consultorId,
                            type: 'Sistema',
                            title: 'Novo Contrato em Carteira',
                            content: `${commonContent} Sua comissão de 4% sobre os dividendos pagos ao cliente foi provisionada.`,
                            is_read: false
                        });
                    }

                    // 3. Notify Leader
                    if (liderId) {
                        await supabase.from('notificacoes').insert({
                            user_id: liderId,
                            type: 'Sistema',
                            title: 'Comissão de Líder Gerada',
                            content: `${commonContent} Sua participação de liderança (0.10%) foi gerada com sucesso.`,
                            is_read: false
                        });
                    }

                    // 4. Notify Administrators
                    const { data: adminUsers } = await supabase.from('usuarios').select('id').eq('role', 'admin');
                    if (adminUsers && adminUsers.length > 0) {
                        const adminNotifications = adminUsers.map(admin => ({
                            user_id: admin.id,
                            type: 'Sistema',
                            title: 'Contrato Ativado com Sucesso',
                            content: `O contrato "${updatedContract.titulo}" (${updatedContract.codigo}) do cliente ${updatedContract.user_id} foi ativado. Sistema gerou calendário de pagamentos e comissões automaticamente.`,
                            is_read: false
                        }));
                        await supabase.from('notificacoes').insert(adminNotifications);
                    }
                }

                return reply.send({ success: true, status: 'Vigente', contract: updatedContract });
            } else {
                // Reject the process
                const { data: rejectedData, error: rErr } = await supabase
                    .from('contratos')
                    .update({
                        status: 'Reprovado',
                        aprovacao_status: 'rejected',
                        aprovacao_data: new Date().toISOString(),
                        aprovacao_obs: observacao || null
                    })
                    .eq('id', contractId)
                    .select()
                    .single();

                if (rErr) throw rErr;

                // Notify client
                if (rejectedData?.user_id) {
                    await supabase.from('notificacoes').insert({
                        user_id: rejectedData.user_id,
                        type: 'Sistema',
                        title: 'Contrato Reprovado',
                        content: `Seu contrato "${rejectedData.titulo}" foi reprovado. Motivo: ${observacao || 'Não informado'}`,
                        is_read: false
                    });
                }

                // Notify consultant
                if (rejectedData?.consultor_id) {
                    await supabase.from('notificacoes').insert({
                        user_id: rejectedData.consultor_id,
                        type: 'Sistema',
                        title: 'Fluxo de aprovação reprovado',
                        content: `O processo de aprovação final do contrato "${rejectedData.titulo}" foi reprovado pelo administrador. Data da reprovação: ${new Date().toLocaleDateString('pt-BR')}. Motivo: ${observacao || 'Não informado'}`,
                        is_read: false
                    });
                }

                return reply.send({ success: true, status: 'Reprovado', contract: rejectedData });
            }
        } catch (err: any) {
            console.error('[Approval Finalize] Error:', JSON.stringify(err, null, 2));
            server.log.error(err);
            return reply.status(500).send({ error: err.message || 'Erro interno no servidor' });
        }
    });

    // POST /contracts/:id/comprovante - Upload comprovante URL (legacy)
    server.post('/contracts/:id/comprovante', async (request: any, reply) => {
        const { id } = request.params;
        const { comprovante_url } = request.body as { comprovante_url: string };

        try {
            if (!comprovante_url) {
                return reply.status(400).send({ error: 'comprovante_url é obrigatório.' });
            }

            const { data, error } = await supabase
                .from('contratos')
                .update({ comprovante_url })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return reply.send({ success: true, contract: data });
        } catch (err: any) {
            return reply.status(500).send({ error: err.message });
        }
    });

    // ═══════════════════════════════════════════════════════════════
    // COMPROVANTES - Receipt attachment management
    // ═══════════════════════════════════════════════════════════════

    // Ensure comprovantes table exists
    const ensureComprovantesTable = async () => {
        try {
            await supabase.rpc('exec_sql', {
                sql: `CREATE TABLE IF NOT EXISTS public.comprovantes (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    contrato_id UUID NOT NULL,
                    arquivo_url TEXT NOT NULL,
                    arquivo_nome TEXT,
                    data_transferencia DATE,
                    observacao TEXT,
                    uploaded_by UUID,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                )`
            });
        } catch (e) {
            // Table may already exist, that's fine
        }
    };
    ensureComprovantesTable();

    // GET /contracts/:id/comprovantes - List all comprovantes for a contract
    server.get('/contracts/:id/comprovantes', async (request: any, reply) => {
        const { id } = request.params;
        try {
            const { data, error } = await supabase
                .from('comprovantes')
                .select('*')
                .eq('contrato_id', id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return reply.send(data || []);
        } catch (err: any) {
            console.error('[Comprovantes] List error:', err);
            return reply.status(500).send({ error: err.message });
        }
    });

    // POST /contracts/:id/comprovantes/upload - Upload comprovante file
    server.post('/contracts/:id/comprovantes/upload', async (request: any, reply) => {
        const { id } = request.params;
        try {
            const data = await request.file();
            if (!data) {
                return reply.status(400).send({ error: 'Nenhum arquivo enviado.' });
            }

            const buf = await data.toBuffer();
            const originalName = data.filename || 'comprovante.pdf';
            const storageName = `${id}/${Date.now()}_${originalName}`;

            // Get data_transferencia from fields if present
            let dataTransferencia: string | null = null;
            if (data.fields?.data_transferencia) {
                const field = data.fields.data_transferencia as any;
                dataTransferencia = field.value || null;
            }

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('comprovantes')
                .upload(storageName, buf, {
                    contentType: data.mimetype || 'application/pdf',
                    upsert: false
                });

            if (uploadError) {
                console.error('[Comprovantes] Storage upload error:', uploadError);
                throw uploadError;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('comprovantes')
                .getPublicUrl(storageName);

            const publicUrl = urlData?.publicUrl || '';

            // Insert record
            const { data: record, error: insertError } = await supabase
                .from('comprovantes')
                .insert({
                    contrato_id: id,
                    arquivo_url: publicUrl,
                    arquivo_nome: originalName,
                    data_transferencia: dataTransferencia,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // Also update contratos.comprovante_url for backward compat
            await supabase
                .from('contratos')
                .update({ comprovante_url: publicUrl, arquivo_url: publicUrl })
                .eq('id', id);

            // Notify client about payment proof upload
            if (record) {
                const { data: contrato } = await supabase
                    .from('contratos')
                    .select('user_id, titulo, codigo')
                    .eq('id', id)
                    .single();

                if (contrato?.user_id) {
                    await supabase.from('notificacoes').insert({
                        user_id: contrato.user_id,
                        type: 'Pagamento',
                        title: 'Comprovante de Pagamento Anexado',
                        content: `Um comprovante de pagamento foi anexado ao seu contrato "${contrato.titulo || contrato.codigo}".`,
                        is_read: false
                    });
                }
            }

            return reply.send({ success: true, comprovante: record });
        } catch (err: any) {
            console.error('[Comprovantes] Upload error:', err);
            return reply.status(500).send({ error: err.message });
        }
    });

    // DELETE /comprovantes/:compId - Delete a comprovante
    server.delete('/comprovantes/:compId', async (request: any, reply) => {
        const { compId } = request.params;
        try {
            // Fetch record first to get file path
            const { data: comp, error: fetchErr } = await supabase
                .from('comprovantes')
                .select('*')
                .eq('id', compId)
                .single();

            if (fetchErr || !comp) {
                return reply.status(404).send({ error: 'Comprovante não encontrado.' });
            }

            // Delete from storage
            if (comp.arquivo_url) {
                try {
                    const urlObj = new URL(comp.arquivo_url);
                    const pathPart = urlObj.pathname.split('/storage/v1/object/public/comprovantes/')[1];
                    if (pathPart) {
                        await supabase.storage.from('comprovantes').remove([decodeURIComponent(pathPart)]);
                    }
                } catch (e) {
                    console.warn('[Comprovantes] Could not delete file from storage:', e);
                }
            }

            // Delete record
            const { error: deleteErr } = await supabase
                .from('comprovantes')
                .delete()
                .eq('id', compId);

            if (deleteErr) throw deleteErr;
            return reply.send({ success: true });
        } catch (err: any) {
            console.error('[Comprovantes] Delete error:', err);
            return reply.status(500).send({ error: err.message });
        }
    });

    // ─── Contract Renewal Request ──────────────────────────────────────────────

    // POST /contracts/:id/renewal - Client requests contract renewal
    server.post('/contracts/:id/renewal', async (request: any, reply) => {
        try {
            const { id } = request.params;

            // Fetch the contract
            const { data: contract, error: contractError } = await supabase
                .from('contratos')
                .select('*')
                .eq('id', id)
                .single();

            if (contractError || !contract) {
                return reply.status(404).send({ error: 'Contrato não encontrado.' });
            }

            // Fetch client data
            const clientId = contract.user_id || contract.cliente_id;
            let clientData: any = {};
            if (clientId) {
                const { data: client } = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('id', clientId)
                    .single();
                if (client) clientData = client;
            }

            // Find the consultant
            // Priority: contract.consultor_id > client.consultant_id
            const consultorId = contract.consultor_id || clientData.consultant_id;
            let consultorData: any = null;

            if (consultorId) {
                const { data: consultor } = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('id', consultorId)
                    .single();
                if (consultor) consultorData = consultor;
            }

            if (!consultorData) {
                return reply.status(400).send({ error: 'Consultor não encontrado para este contrato.' });
            }

            const clientName = clientData.nome_fantasia || clientData.razao_social || clientData.nome || 'Cliente';
            const consultantName = consultorData.nome_fantasia || consultorData.razao_social || consultorData.nome || 'Consultor';
            const contractCode = contract.codigo || id.substring(0, 8).toUpperCase();
            const now = new Date();
            const requestDate = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

            // Insert renewal request into DB
            // Calculate data_vencimento from contract
            let dataVencimento = contract.data_vencimento || null;
            if (!dataVencimento && contract.data_inicio && contract.periodo_meses) {
                const start = new Date(contract.data_inicio);
                start.setMonth(start.getMonth() + contract.periodo_meses);
                dataVencimento = start.toISOString();
            }

            const { data: renewal, error: renewalError } = await supabase
                .from('renovacoes')
                .insert({
                    contrato_id: id,
                    user_id: clientId,
                    status: 'Pendente',
                    valor_renovacao: contract.valor_aporte || 0,
                    taxa_renovacao: contract.taxa_mensal || 0,
                    periodo_meses: contract.periodo_meses || null,
                    data_vencimento: dataVencimento,
                    data_solicitacao: now.toISOString(),
                })
                .select()
                .single();

            if (renewalError) {
                console.error('[Renewal] DB insert error:', renewalError);
                return reply.status(500).send({ error: 'Erro ao registrar solicitação de renovação.' });
            }

            // Send email to consultant
            try {
                await sendRenewalRequestEmail({
                    consultantEmail: consultorData.email,
                    consultantName,
                    clientName,
                    contractCode,
                    requestDate,
                });
                server.log.info(`[Renewal] Email sent to consultant ${consultorData.email} for contract ${contractCode}`);
            } catch (emailErr: any) {
                server.log.error(`[Renewal] Email failed: ${emailErr.message}`);
                // Don't fail the whole request if email fails
            }

            // Notify client about renewal request being registered
            if (clientId) {
                await supabase.from('notificacoes').insert({
                    user_id: clientId,
                    type: 'Contrato',
                    title: 'Solicitação de Renovação Registrada',
                    content: `Sua solicitação de renovação do contrato "${contractCode}" foi registrada e enviada ao consultor para análise.`,
                    is_read: false
                });
            }

            // Notify consultant about renewal request
            if (consultorId) {
                await supabase.from('notificacoes').insert({
                    user_id: consultorId,
                    type: 'Contrato',
                    title: 'Nova Solicitação de Renovação',
                    content: `O cliente ${clientName} solicitou a renovação do contrato "${contractCode}". Verifique e tome a ação necessária.`,
                    is_read: false
                });
            }

            // Notify all admins about renewal request
            const { data: admins } = await supabase
                .from('usuarios')
                .select('id')
                .in('tipo_perfil_usuario', ['Admin', 'Super Admin']);

            if (admins && admins.length > 0) {
                const adminNotifs = admins.map((admin: any) => ({
                    user_id: admin.id,
                    type: 'Contrato',
                    title: 'Nova Solicitação de Renovação',
                    content: `O cliente ${clientName} solicitou a renovação do contrato "${contractCode}". Consultor: ${consultantName}.`,
                    is_read: false
                }));
                await supabase.from('notificacoes').insert(adminNotifs);
            }

            return reply.send({
                success: true,
                renewal: renewal,
                message: 'Solicitação de renovação enviada com sucesso.',
            });

        } catch (err: any) {
            server.log.error('[Renewal] Error:', err);
            return reply.status(500).send({ error: err.message });
        }
    });

    server.post('/contracts/:id/redeem', async (req, reply) => {
        const { id } = req.params as { id: string };
        const body = req.body as { valor_resgate: number; resgate_integral: boolean };

        if (!id) return reply.status(400).send({ error: 'Contract ID is required' });

        try {
            // Check if contract exists
            const { data: contract, error } = await supabase
                .from('contratos')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !contract) {
                return reply.status(404).send({ error: 'Contrato não encontrado.' });
            }

            // Get user associated with contract
            const clientId = contract.user_id;
            let clientData = null;

            if (clientId) {
                // Try clients table or usuarios table or generic users
                const { data: client } = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('id', clientId)
                    .single();
                if (client) clientData = client;
            }

            if (!clientData) {
                // Try to get from auth.users or wait... maybe user_id is enough for email?
                // For now, assume we need client data for email
                return reply.status(400).send({ error: 'Cliente não encontrado para este contrato.' });
            }

            // Get consultant associated with contract
            const consultorId = contract.consultor_id;
            let consultorData: any = null;

            if (consultorId) {
                const { data: consultor } = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('id', consultorId)
                    .single();
                if (consultor) consultorData = consultor;
            }

            if (!consultorData) {
                return reply.status(400).send({ error: 'Consultor não encontrado para este contrato.' });
            }

            const clientName = clientData.nome_fantasia || clientData.razao_social || clientData.nome || 'Cliente';
            const consultantName = consultorData.nome_fantasia || consultorData.razao_social || consultorData.nome || 'Consultor';
            const contractCode = contract.codigo || id.substring(0, 8).toUpperCase();
            const now = new Date();
            const requestDate = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

            // Insert redeem request into DB
            const { data: redeem, error: redeemError } = await supabase
                .from('resgates')
                .insert({
                    contrato_id: id,
                    user_id: clientId,
                    consultor_id: consultorId,
                    status: 'Pendente',
                    valor_resgate: body.valor_resgate,
                    tipo_resgate: body.resgate_integral ? 'Integral' : 'Parcial',
                    data_solicitacao: now.toISOString(),
                })
                .select()
                .single();

            if (redeemError) {
                server.log.error({ err: redeemError }, '[Redeem] DB Insert Error');
                return reply.status(500).send({ error: 'Erro ao salvar solicitação de resgate.' });
            }

            // Format values for email
            const redeemValueFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(body.valor_resgate);
            const contractValueFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contract.valor_aporte || contract.valor || 0);

            // Send email to consultant
            try {
                await sendRedeemRequestEmail({
                    consultantEmail: consultorData.email,
                    consultantName,
                    clientName,
                    contractCode,
                    requestDate,
                    redeemValue: redeemValueFmt,
                    redeemType: body.resgate_integral ? 'Integral' : 'Parcial',
                    contractValue: contractValueFmt,
                });
                server.log.info(`[Redeem] Email sent to consultant ${consultorData.email} for contract ${contractCode}`);
            } catch (emailErr: any) {
                server.log.error(`[Redeem] Email failed: ${emailErr.message}`);
                // Don't fail the whole request if email fails
            }

            // Notify client about redeem request being registered
            if (clientId) {
                await supabase.from('notificacoes').insert({
                    user_id: clientId,
                    type: 'Contrato',
                    title: 'Solicitação de Resgate Registrada',
                    content: `Sua solicitação de resgate (${body.resgate_integral ? 'Integral' : 'Parcial'} - ${redeemValueFmt}) do contrato "${contractCode}" foi registrada e enviada ao consultor.`,
                    is_read: false
                });
            }

            // Notify consultant about redeem request
            if (consultorId) {
                await supabase.from('notificacoes').insert({
                    user_id: consultorId,
                    type: 'Contrato',
                    title: 'Nova Solicitação de Resgate',
                    content: `O cliente ${clientName} solicitou resgate (${body.resgate_integral ? 'Integral' : 'Parcial'} - ${redeemValueFmt}) do contrato "${contractCode}". Verifique e tome a ação necessária.`,
                    is_read: false
                });
            }

            // Notify all admins about redeem request
            const { data: adminUsers } = await supabase
                .from('usuarios')
                .select('id')
                .in('tipo_perfil_usuario', ['Admin', 'Super Admin']);

            if (adminUsers && adminUsers.length > 0) {
                const adminNotifs = adminUsers.map((admin: any) => ({
                    user_id: admin.id,
                    type: 'Contrato',
                    title: 'Nova Solicitação de Resgate',
                    content: `O cliente ${clientName} solicitou resgate (${body.resgate_integral ? 'Integral' : 'Parcial'} - ${redeemValueFmt}) do contrato "${contractCode}". Consultor: ${consultantName}.`,
                    is_read: false
                }));
                await supabase.from('notificacoes').insert(adminNotifs);
            }

            return reply.send({
                success: true,
                redeem: redeem,
                message: 'Solicitação de resgate enviada com sucesso.',
            });

        } catch (err: any) {
            server.log.error('[Redeem] Error:', err);
            return reply.status(500).send({ error: err.message });
        }
    });
}
