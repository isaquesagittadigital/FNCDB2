import { FastifyInstance } from 'fastify';
import { z } from 'zod';
// import { supabase } from '../lib/supabase';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

export async function authRoutes(server: FastifyInstance) {
    server.post('/login', async (request, reply) => {
        try {
            const { email, password } = loginSchema.parse(request.body);

            // Create a scoped client for this request context
            // This ensures the session is isolated and properly applied for RLS
            const { createClient } = await import('@supabase/supabase-js');
            const supabaseUrl = process.env.SUPABASE_URL!;
            const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Using the key from env (which might be anon, but that's fine for this flow)

            const scopedSupabase = createClient(supabaseUrl, supabaseKey, {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            });

            const { data, error } = await scopedSupabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                return reply.status(401).send({ error: error.message });
            }

            // Fetch user profile from public schema using the AUTHENTICATED client
            // Because scopedSupabase just signed in, it has the session.
            const { data: profile, error: profileError } = await scopedSupabase
                .from('usuarios')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                server.log.warn(`Profile not found for user ${data.user.id}: ${profileError.message}`);
            }

            // check if user is inativated
            if (profile && profile.deletado === true) {
                await scopedSupabase.auth.signOut();
                return reply.status(403).send({ error: 'Sua conta está inativa. Entre em contato com o suporte.' });
            }

            // Fetch permissions
            const { data: permissions, error: permError } = await scopedSupabase
                .from('permissoes_usuario')
                .select('*')
                .eq('user_id', data.user.id);

            if (permError) {
                server.log.warn(`Permissions not found for user ${data.user.id}: ${permError.message}`);
            }

            return reply.send({ session: data.session, user: data.user, profile, permissions: permissions || [] });
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                return reply.status(400).send({ error: 'Dados inválidos', details: err.errors });
            }
            server.log.error(err);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
}
