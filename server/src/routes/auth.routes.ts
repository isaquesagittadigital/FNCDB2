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

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                return reply.status(401).send({ error: error.message });
            }

            // Fetch user profile from public schema to get role
            const { data: profile, error: profileError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                // Fallback or error handling if profile doesn't exist (though it should)
                server.log.warn(`Profile not found for user ${data.user.id}: ${profileError.message}`);
                // Choose whether to block login or allow with restricted access. blocking for consistent role logic.
                return reply.status(500).send({ error: 'Erro ao recuperar perfil do usuário.' });
            }

            return reply.send({ session: data.session, user: data.user, profile });
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                return reply.status(400).send({ error: 'Dados inválidos', details: err.errors });
            }
            server.log.error(err);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
}
