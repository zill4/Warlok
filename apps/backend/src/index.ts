import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user';
import profileRoutes from './routes/profile';
import cardRoutes from './routes/card';
import gameRoutes from './routes/game';

const app = express();
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Middleware
    app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:4321', // Astro's default port
      credentials: true
    }));
    app.use(express.json());

    // Route Mounting
    app.use('/api/users', userRoutes);
    app.use('/api/profiles', profileRoutes);
    app.use('/api/cards', cardRoutes);
    app.use('/api/games', gameRoutes);

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Root Route (Optional)
    app.get('/', (req, res) => {
      res.json({ message: 'Welcome to the Turbo Monorepo Backend!' });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
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