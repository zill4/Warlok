import express from 'express';
import { PrismaClient } from '@prisma/client';
import { auth, AuthRequest, generateToken } from '../middleware/auth';
import bcrypt from 'bcrypt';
// import { createCustodialWallet } from '../services/solana';

const router = express.Router();
const prisma = new PrismaClient();

// Sign Up
router.post('/signup', async (req, res) => {
  const { email, username, password } = req.body;
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const wallet = "test"; // temporary wallet value
    const user = await prisma.user.create({ 
      data: { 
        email,
        password: hashedPassword,
        wallet
      } 
    });
    
    const profile = await prisma.profile.create({
      data: { userId: user.id, username },
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({ 
      user: { id: user.id, email: user.email }, 
      profile, 
      token 
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({ 
      user: { id: user.id, email: user.email },
      profile: user.profile,
      token 
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get current user (protected route)
router.get('/me', auth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      include: { profile: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ 
      user: { id: user.id, email: user.email },
      profile: user.profile 
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// // Create User (with wallet and profile)
// router.post('/', async (req, res) => {
//   const { email, username } = req.body;
//   try {
//     // const wallet = await createCustodialWallet(user.id);
//     const wallet = "test"; // temporary wallet value
//     const user = await prisma.user.create({ 
//       data: { 
//         email,
//         wallet // Add the wallet field here
//       } 
//     });
//     const profile = await prisma.profile.create({
//       data: { userId: user.id, username },
//     });
//     res.status(201).json({ user, profile, wallet });
//   } catch (error) {
//     res.status(500).json({ error: (error as Error).message });
//   }
// });

// Get User by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Update User
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { email },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Delete User
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;