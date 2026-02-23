import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { supabase } from '../lib/supabase';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

export async function authRoutes(server: FastifyInstance) {
    server.post('/login', async (request, reply) => {
        try {
            const { email, password } = loginSchema.parse(request.body);

            // Create a scoped client for authentication using ANON key
            // This ensures the returned session tokens are compatible with the frontend anon key client
            const { createClient } = await import('@supabase/supabase-js');
            const supabaseUrl = process.env.SUPABASE_URL!;
            const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;

            const scopedSupabase = createClient(supabaseUrl, supabaseAnonKey, {
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

            // Use the global supabase client (service_role) to fetch profile
            // This bypasses RLS, ensuring the profile is always found
            const { data: profile, error: profileError } = await supabase
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

            // Fetch permissions using service_role client (bypasses RLS)
            const { data: permissions, error: permError } = await supabase
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
