import { Keypair, Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const connection = new Connection('https://api.devnet.solana.com', 'confirmed'); // Use devnet for testing

export async function createCustodialWallet(userId: string): Promise<string> {
  const keypair = Keypair.generate();
  const publicKey = keypair.publicKey.toString();

  // Fund the wallet minimally (for testing; in production, use a faucet or funding strategy)
  const airdropSignature = await connection.requestAirdrop(keypair.publicKey, 1e9); // 1 SOL
  await connection.confirmTransaction(airdropSignature);

  // Store wallet in DB
  await prisma.user.update({
    where: { id: userId },
    data: { wallet: publicKey },
  });

  return publicKey; // Return public key; store secret key securely if needed
}

export async function transferCard(cardId: string, fromWallet: string, toWallet: string) {
  const fromKeypair = Keypair.fromSecretKey(/* Load from secure storage */);
  const toPublicKey = new PublicKey(toWallet);

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: toPublicKey,
      lamports: 1e6, // Minimal amount; adjust for card value
    })
  );

  const signature = await connection.sendTransaction(transaction, [fromKeypair]);
  await connection.confirmTransaction(signature);

  // Update card ownership
  await prisma.card.update({
    where: { id: cardId },
    data: { ownerWallet: toWallet },
  });

  return signature;
}