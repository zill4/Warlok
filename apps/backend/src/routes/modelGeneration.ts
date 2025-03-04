import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { auth, AuthRequest } from '../middleware/auth';
import * as dotenv from 'dotenv';
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';

dotenv.config();

const router = express.Router();
const prisma = new PrismaClient();

// Define types for Azure function responses
interface AzureTriggerResponse {
  job_id: string;
  status: string;
  message: string;
  status_url: string;
}

interface AzureStatusResponse {
  status: string;
  progress?: number;
  message?: string;
  model_url?: string;
}

// Validate required environment variables
const requiredEnvVars = {
  AZURE_STORAGE_ACCOUNT: process.env.AZURE_STORAGE_ACCOUNT,
  AZURE_STORAGE_KEY: process.env.AZURE_STORAGE_KEY,
  AZURE_STORAGE_CONTAINER: process.env.AZURE_STORAGE_CONTAINER || 'images',
  AZURE_FUNCTION_KEY: process.env.AZURE_FUNCTION_KEY,
  AZURE_FUNCTION_URL: process.env.AZURE_FUNCTION_URL || 'https://z3d-functions.azurewebsites.net/api/ProcessImageTrigger'
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Configure Azure Storage client with validated variables
const azureStorageAccount = requiredEnvVars.AZURE_STORAGE_ACCOUNT!;
const azureStorageKey = requiredEnvVars.AZURE_STORAGE_KEY!;
const azureStorageContainer = requiredEnvVars.AZURE_STORAGE_CONTAINER;

const sharedKeyCredential = new StorageSharedKeyCredential(
  azureStorageAccount,
  azureStorageKey
);

const blobServiceClient = new BlobServiceClient(
  `https://${azureStorageAccount}.blob.core.windows.net`,
  sharedKeyCredential
);

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

// Update the uploadToAzureStorage function
async function uploadToAzureStorage(buffer: Buffer, userId: string, assetName: string, mimeType: string): Promise<string> {
  try {
    // Get container client and create if it doesn't exist
    const containerClient = blobServiceClient.getContainerClient(azureStorageContainer);
    await containerClient.createIfNotExists();
    
    // Generate filename: YYYYMMDD_assetname.extension
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const sanitizedName = assetName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const extension = mimeType.split('/')[1];
    const filename = `${date}_${sanitizedName}.${extension}`;
    
    // Create path: images/{userId}/{filename}
    const blobPath = `${userId}/${filename}`;
    const blobClient = containerClient.getBlockBlobClient(blobPath);
    
    // Upload data
    await blobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: mimeType
      }
    });
    
    // Return the blob URL
    return blobClient.url;
  } catch (error) {
    console.error('Error uploading to Azure Storage:', error);
    throw new Error('Failed to upload image to storage');
  }
}

// Update the generate endpoint
router.post('/generate', auth, upload.single('image'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get metadata from request body
    const { assetName } = req.body;
    if (!assetName) {
      return res.status(400).json({ error: 'Asset name is required' });
    }
    
    // Generate a unique job ID
    const jobId = `${userId}_${Date.now()}`;
    
    // Upload to Azure Storage in the images container
    const imageUrl = await uploadToAzureStorage(
      req.file.buffer,
      userId,
      assetName,
      req.file.mimetype
    );

    // Extract the relative path from the URL for the Azure function
    const urlParts = new URL(imageUrl);
    const imagePath = urlParts.pathname.split('/').slice(2).join('/'); // Remove container name and first slash
    
    // Call the Azure function with the image path
    const azureFunctionUrl = process.env.AZURE_FUNCTION_URL || 
      'https://z3d-functions.azurewebsites.net/api/ProcessImageTrigger';
    
    console.log('Calling Azure Function:', {
      url: azureFunctionUrl,
      imageUrl,
      jobId
    });

    const azureResponse = await fetch(azureFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-functions-key': process.env.AZURE_FUNCTION_KEY || '',
        'Origin': process.env.BACKEND_URL || 'http://localhost:3000'
      },
      body: JSON.stringify({
        job_id: jobId,
        image_url: imageUrl
      })
    });

    // Read the response text once and store it
    const responseText = await azureResponse.text();
    
    console.log('Azure Function Response:', {
      status: azureResponse.status,
      statusText: azureResponse.statusText,
      headers: Object.fromEntries(azureResponse.headers.entries()),
      body: responseText
    });

    if (!azureResponse.ok) {
      throw new Error(`Azure function error (${azureResponse.status}): ${responseText}`);
    }

    let azureData: AzureTriggerResponse;
    try {
      azureData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Azure function response:', parseError);
      throw new Error(`Invalid response from Azure function: ${responseText}`);
    }

    // Store job information in database for tracking
    await prisma.modelJob.create({
      data: {
        id: jobId,
        userId,
        status: 'queued',
        imageUrl,
        statusUrl: azureData.status_url,
        metadata: {
          assetName
        }
      }
    });

    res.status(200).json({
      success: true,
      jobId,
      status: azureData.status,
      message: azureData.message,
      statusUrl: azureData.status_url
    });

  } catch (error) {
    console.error('Error generating 3D model:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get job status
router.get('/status/:jobId', auth, async (req: AuthRequest, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user?.id;

    // Find job in database
    const job = await prisma.modelJob.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if user owns this job
    if (job.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to view this job' });
    }

    // Call Azure status endpoint
    const statusResponse = await fetch(job.statusUrl);
    
    if (!statusResponse.ok) {
      const errorData = await statusResponse.text();
      throw new Error(`Status check failed: ${errorData}`);
    }

    const statusData = await statusResponse.json() as AzureStatusResponse;

    // Update job status in database
    await prisma.modelJob.update({
      where: { id: jobId },
      data: {
        status: statusData.status,
        progress: statusData.progress || 0,
        modelUrl: statusData.model_url,
        updatedAt: new Date()
      }
    });

    res.status(200).json(statusData);
  } catch (error) {
    console.error('Error checking job status:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router; 