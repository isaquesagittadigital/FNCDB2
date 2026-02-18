
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import dotenv from 'dotenv';
import path from 'path';
import { supabase } from './lib/supabase';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const server: FastifyInstance = Fastify({
    logger: true
});

// Plugins
server.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
});

server.register(multipart, {
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
    }
});

// Routes
// Routes
import { authRoutes } from './routes/auth.routes';
import { adminRoutes } from './routes/admin.routes';
import { webhookRoutes } from './routes/webhook.routes';

server.register(authRoutes, { prefix: '/api' });
server.register(adminRoutes, { prefix: '/api/admin' });
server.register(webhookRoutes, { prefix: '/api' });

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
