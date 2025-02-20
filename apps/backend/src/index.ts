import express from 'express';
import userRoutes from './routes/user';
import profileRoutes from './routes/profile';
import cardRoutes from './routes/card';
import gameRoutes from './routes/game';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Route Mounting
app.use('/api/users', userRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/games', gameRoutes);

// Root Route (Optional)
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Turbo Monorepo Backend!' });
});

// Error Handling Middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});