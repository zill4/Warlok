import express from 'express';
import { PrismaClient } from '@prisma/client';
// import { transferCard } from '../services/solana';
import { CardData } from '../types/shared'; // From shared-types package
import multer from 'multer';
import { uploadCardImage } from '../services/s3';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  },
});

// Create Card with image upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { creatorId, creator, ...cardInput }: { creatorId: string } & Omit<CardData, 'image'> = JSON.parse(req.body.cardData);
    
    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: creatorId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    let imageUrl = '';
    if (req.file) {
      // Use card name for image filename (sanitized)
      const sanitizedName = cardInput.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      // Upload image to S3
      imageUrl = await uploadCardImage(
        creatorId,
        req.file.buffer,
        req.file.mimetype,
        `${sanitizedName}-${Date.now()}`
      );
    }

    // Create card in database - omit fields that Prisma doesn't expect
    const { id, createdAt, ...createInput } = cardInput;
    
    const card = await prisma.card.create({
      data: {
        ...createInput,
        image: imageUrl,
        creatorId,
        ownerWallet: user.wallet,
        edition: uuidv4().split('-')[0], // Use first segment of UUID for shorter edition number
      },
    });

    res.status(201).json(card);
  } catch (error) {
    console.error('Error creating card:', error);
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
  const { creator, createdAt, ...updates }: Omit<Partial<CardData>, 'image'> & { image?: string } = req.body;
  
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