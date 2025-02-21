import express from 'express';
import { PrismaClient } from '@prisma/client';
// import { transferCard } from '../services/solana';
import { CardData } from '@warlok/shared-types'; // From shared-types package

const router = express.Router();
const prisma = new PrismaClient();

// Create Card
router.post('/', async (req, res) => {
  const { creatorId, ...cardInput }: { creatorId: string } & Omit<CardData, 'image'> & { image?: string } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: creatorId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // At this point, image should already be uploaded and we should have its URL/path
    const card = await prisma.card.create({
      data: {
        ...cardInput,
        creatorId,
        ownerWallet: user.wallet,
      },
    });
    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get Card by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const card = await prisma.card.findUnique({ where: { id } });
    if (!card) return res.status(404).json({ error: 'Card not found' });
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Update Card
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates: Omit<Partial<CardData>, 'image'> & { image?: string } = req.body;
  try {
    const card = await prisma.card.update({
      where: { id },
      data: updates,
    });
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Delete Card
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.card.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Trade Card (Buy/Sell/Trade via Solana)
// router.post('/trade/:id', async (req, res) => {
//   const { id } = req.params;
//   const { toWallet } = req.body; // Buyer's wallet
//   try {
//     const card = await prisma.card.findUnique({ where: { id } });
//     if (!card) return res.status(404).json({ error: 'Card not found' });

//     const signature = await transferCard(id, card.ownerWallet, toWallet);
//     res.json({ signature, card });
//   } catch (error) {
//     res.status(500).json({ error: (error as Error).message });
//   }
// });

export default router;