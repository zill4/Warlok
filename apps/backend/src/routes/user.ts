import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createCustodialWallet } from '../services/solana';

const router = express.Router();
const prisma = new PrismaClient();

// Create User (with wallet and profile)
router.post('/', async (req, res) => {
  const { email, username } = req.body;
  try {
    const user = await prisma.user.create({ data: { email } });
    const wallet = await createCustodialWallet(user.id);
    const profile = await prisma.profile.create({
      data: { userId: user.id, username },
    });
    res.status(201).json({ user, profile, wallet });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

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