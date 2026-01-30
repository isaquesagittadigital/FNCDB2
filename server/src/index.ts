
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { supabase } from './lib/supabase';

dotenv.config();

const server: FastifyInstance = Fastify({
    logger: true
});

// Plugins
server.register(cors, {
    origin: true // Allow all origins for now, configure strictly in production
});

// Routes
import { authRoutes } from './routes/auth.routes';
server.register(authRoutes, { prefix: '/api' });

// Routes
server.get('/health', async (_request, _reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});

server.get('/api/test-supabase', async (_request, reply) => {
    try {
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        if (error) throw error;
        return { status: 'connected', data };
    } catch (err: any) {
        server.log.error(err);
        return reply.status(500).send({ status: 'error', message: err.message });
    }
});

const start = async () => {
    try {
        const port = parseInt(process.env.PORT || '3000');
        const host = '0.0.0.0'; // Essential for Docker
        await server.listen({ port, host });
        console.log(`Server listening on http://${host}:${port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
