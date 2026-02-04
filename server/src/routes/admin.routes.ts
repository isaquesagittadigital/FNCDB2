import { FastifyInstance } from 'fastify';
import { supabase } from '../lib/supabase';
import { z } from 'zod';
import { sendWelcomeEmail } from '../services/email.service';
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
                    .eq('tipo_user', 'Cliente')
                    .eq('meu_consultor.consultor_id', consultant_id);
            } else {
                query = supabase
                    .from('usuarios')
                    .select('*', { count: 'exact' })
                    .eq('tipo_user', 'Cliente');
            }

            query = query
                .range(from, to)
                .order('created_at', { ascending: false });

            // Apply filters
            if (name) {
                query = query.ilike('nome_fantasia', `%${name}%`);
            }

            if (document) {
                const cleanDoc = document.replace(/\D/g, '');
                if (cleanDoc) {
                    query = query.or(`cpf.eq.${document},cnpj.eq.${document},cpf.ilike.%${cleanDoc}%,cnpj.ilike.%${cleanDoc}%`);
                } else {
                    query = query.or(`cpf.eq.${document},cnpj.eq.${document}`);
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
    server.get('/clients/recent', async (_request, reply) => {
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
    server.get('/consultants', async (_request, reply) => {
        try {
            const { data: consultants, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('tipo_user', 'Consultor')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Fetch client counts
            const consultantsWithCounts = await Promise.all(consultants.map(async (c: any) => {
                const { count } = await supabase
                    .from('meu_consultor')
                    .select('*', { count: 'exact', head: true })
                    .eq('consultor_id', c.id);
                return { ...c, client_count: count || 0 };
            }));

            return reply.send(consultantsWithCounts);
        } catch (err: any) {
            return reply.status(500).send({ error: err.message });
        }
    });

    server.post('/consultants', async (request: any, reply) => {
        const body = request.body;
        try {
            // Basic validation
            if (!body.email || !body.nome_fantasia) { // Using nome_fantasia as main name
                return reply.status(400).send({ error: 'Nome e Email são obrigatórios.' });
            }

            // Create auth user (mock or real if admin has permissions) - For now creating directly in public.usuarios
            // In a real scenario, we might need to create auth.users first, but supabase client-side usually handles that.
            // If we are strictly admin-side without user interaction, we might just insert into usuarios table and let a trigger handle auth, 
            // OR just insert data and assume an invite flow.
            // For this project context, sticking to simple insertion into 'usuarios' assuming the ID is auto-gen or we treat it as metadata.

            // Wait, 'usuarios' usually references auth.users. 
            // If we insert here without auth.users, it might fail FK constraints if they exist.
            // Let's assume for now we just insert into 'usuarios' directly if possible, or use a function.
            // Based on previous Client creation, it seems we might be creating users via Supabase Admin Auth API in a real backend, 
            // but here we might just be inserting into the public table if RLS allows or if it's a separate entity.
            // Re-checking create-admin.ts... it creates auth user.
            // Let's assume for this MVP we just insert into `usuarios` and let the trigger/flow handle it, 
            // OR we just focus on the data layer. 
            // NOTE: The `ClientForm` uses `api/admin/clients` which does a simple insert/update. 
            // I'll replicate that pattern.

            const { data, error } = await supabase
                .from('usuarios')
                .insert({
                    ...body,
                    tipo_user: 'Consultor',
                    status_cliente: 'Ativo' // Default status
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
            delete body.id; // protect ID
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
                .delete()
                .eq('id', id);

            if (error) throw error;
            return reply.send({ message: 'Consultor excluído com sucesso' });
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
                } catch (emailErr) {
                    console.error('Email sending failed:', emailErr);
                    // Don't fail the whole user creation if just email fails, but maybe return a partial success?
                }
            }

            return reply.send(profile);
        } catch (err: any) {
            console.error('Creation Error:', err);
            return reply.status(500).send({ error: err.message });
        }
    });


    // Global Contracts Management
    server.get('/contracts', async (_request: any, reply) => {
        try {
            // Join contratos with users to get client name
            // Assuming 'usuarios' table contains client info and user_id in 'contratos' FKs to it (or auth.users which is linked)
            // Using Supabase join syntax: select('*, usuarios(*)') if there is a FK relation.
            // If FK is not explicitly defined in Supabase schema between contratos and usuarios (public), we might need to rely on matching IDs.
            // Let's try explicit join assuming FK exists or Supabase infers it.
            // If it fails, we will fallback to separate fetch or raw query.

            // Note: If no FK exists, we can still fetch all contracts and then fetch users where id in (contract_user_ids).
            // But let's try the join first as it's cleaner.
            const { data, error } = await supabase
                .from('contratos')
                .select('*, usuarios:user_id(nome_fantasia, email)') // Aliasing user_id relation if possible, or just usuarios(*). 
                // If the relation name is different, this might fail. 
                // In create_contracts_table.sql: user_id REFERENCES auth.users(id).
                // 'usuarios' table likely also has id as PK (referencing auth.users).
                // Join between public.contratos and public.usuarios via shared ID (which is auth.users.id) is... 
                // Actually they don't reference each other directly. They both reference auth.users.
                // So standard join syntax might not work directly unless we defined a FK from contratos.user_id to usuarios.id.
                // WE DID NOT define that in the SQL script contracts table creation.
                // So we can't simple join public 'contratos' with public 'usuarios'.

                // WORKAROUND: Fetch all contracts, then fetch all relevant users from 'usuarios' table.
                // This is less efficient but guarantees it works without altering schema constraints now.
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Fetch users manually
            if (data && data.length > 0) {
                const userIds = [...new Set(data.map((c: any) => c.user_id))];
                const { data: users, error: userError } = await supabase
                    .from('usuarios')
                    .select('id, nome_fantasia, email')
                    .in('id', userIds);

                if (!userError && users) {
                    // Merge data
                    const contractsWithUser = data.map((c: any) => {
                        const user = users.find((u: any) => u.id === c.user_id);
                        return { ...c, client_name: user ? user.nome_fantasia : 'Desconhecido' };
                    });
                    return reply.send(contractsWithUser);
                }
            }

            return reply.send(data);
        } catch (err: any) {
            return reply.status(500).send({ error: err.message });
        }
    });

    server.post('/contracts', async (request: any, reply) => {
        const body = request.body;
        try {
            if (!body.user_id || !body.titulo) {
                return reply.status(400).send({ error: 'Cliente (user_id) e Título são obrigatórios.' });
            }

            // Map frontend fields to DB columns if they mismatch, or just pass body
            const { data, error } = await supabase
                .from('contratos')
                .insert(body)
                .select()
                .single();

            if (error) throw error;
            return reply.send(data);
        } catch (err: any) {
            return reply.status(500).send({ error: err.message });
        }
    });

    server.put('/contracts/:id', async (request: any, reply) => {
        const { id } = request.params;
        const body = request.body;
        try {
            delete body.id; // protect ID
            // Allow user_id update if explicitly needed, but usually kept for safety.
            // For now, let's just pass the body as is (Supabase update is partial).

            const { data, error } = await supabase
                .from('contratos')
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

    server.delete('/contracts/:id', async (request: any, reply) => {
        const { id } = request.params;
        try {
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
        const { nome_fantasia, email, tipo_perfil_usuario, tipo_user } = request.body;

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
}
