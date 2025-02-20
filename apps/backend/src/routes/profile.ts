import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Update Profile (Create handled with User)
router.put('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { username, bio } = req.body;
  try {
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: { username, bio },
      create: { userId, username, bio },
    });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get Profile
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Delete Profile
router.delete('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    await prisma.profile.delete({ where: { userId } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;