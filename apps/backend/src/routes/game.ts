import express from 'express';
import { PrismaClient } from '@prisma/client';
import { HistoryEntry } from '@your-monorepo/shared-types';

const router = express.Router();
const prisma = new PrismaClient();

// Create Game
router.post('/', async (req, res) => {
  const { playerIds, decks } = req.body;
  try {
    const game = await prisma.game.create({
      data: {
        players: { connect: playerIds.map((id: string) => ({ id })) },
        decks, // Array of card IDs or CardData
      },
    });
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get Game by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const game = await prisma.game.findUnique({
      where: { id },
      include: { players: true },
    });
    if (!game) return res.status(404).json({ error: 'Game not found' });
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Add Turn to Game
router.post('/:id/turn', async (req, res) => {
  const { id } = req.params;
  const turn: HistoryEntry = req.body;
  try {
    const game = await prisma.game.update({
      where: { id },
      data: {
        turns: {
          push: turn,
        },
      },
    });
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Update Game (e.g., set winner)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { winnerId } = req.body;
  try {
    const game = await prisma.game.update({
      where: { id },
      data: { winnerId },
    });
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Delete Game
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.game.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;