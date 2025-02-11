import Fastify from 'fastify';
import fastifyIO from 'fastify-socket.io';
import dotenv from 'dotenv';

dotenv.config();
const fastify = Fastify({ logger: true });

fastify.register(fastifyIO, { cors: { origin: '*' } });

fastify.get('/api/health', async () => ({ status: 'ok' }));

fastify.ready().then(() => {
  fastify.io.on('connection', (socket) => {
    fastify.log.info(`Socket connected: ${socket.id}`);
    socket.on('chat-message', (msg) => {
      fastify.io.emit('chat-message', msg);
    });
  });
});

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT ? Number(process.env.PORT) : 3001, host: '0.0.0.0' });
    fastify.log.info('Server started');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();