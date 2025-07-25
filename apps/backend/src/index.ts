import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user';
import profileRoutes from './routes/profile';
import cardRoutes from './routes/card';
import gameRoutes from './routes/game';
import modelGenerationRoutes from './routes/modelGeneration';

// Load environment variables before any other imports
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

async function startServer() {
  try {
    // Middleware
    app.use(cors({
      origin: [
        'https://warlok.net',
        'http://localhost:4321', // Astro's default port
        'http://localhost:3000'  // For local development
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    }));
    app.use(express.json());

    // Route Mounting
    app.use('/api/users', userRoutes);
    app.use('/api/profiles', profileRoutes);
    app.use('/api/cards', cardRoutes);
    app.use('/api/games', gameRoutes);
    app.use('/api/models', modelGenerationRoutes);

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Root Route (Optional)
    app.get('/', (req, res) => {
      res.json({ message: 'Welcome to the Turbo Monorepo Backend!' });
    });

    // Start server
    app.listen(PORT, HOST, () => {
      console.log(`✅ Server running on http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Error Handling Middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});