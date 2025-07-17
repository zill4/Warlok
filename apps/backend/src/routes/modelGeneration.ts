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
  success: boolean;
  job_id: string;
  status: string;
  message: string;
  status_url?: string;
}

interface AzureStatusResponse {
  PartitionKey?: string;  // 'jobs'
  RowKey?: string;        // job_id
  status: string;
  progress?: number;
  error?: string;
  model_url?: string;
  [key: string]: any;     // For any additional fields from Table Storage
}

// Validate required environment variables
const requiredEnvVars = {
  AZURE_STORAGE_ACCOUNT: process.env.AZURE_STORAGE_ACCOUNT,
  AZURE_STORAGE_KEY: process.env.AZURE_STORAGE_KEY,
  AZURE_STORAGE_CONTAINER: process.env.AZURE_STORAGE_CONTAINER || 'images',
  AZURE_FUNCTION_KEY: process.env.AZURE_FUNCTION_KEY,
  AZURE_FUNCTION_URL: process.env.AZURE_FUNCTION_URL || 'https://z3d-functions.azurewebsites.net/api',
  AZURE_PROCESS_FUNCTION: 'ProcessImageTrigger',
  AZURE_STATUS_FUNCTION: 'GetJobStatus',
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
    const azureFunctionUrl = `${requiredEnvVars.AZURE_FUNCTION_URL}/${requiredEnvVars.AZURE_PROCESS_FUNCTION}`;
    
    console.log('Calling Azure Function:', {
      url: azureFunctionUrl,
      imageUrl,
      jobId
    });

    // Add debug logging for the key
    console.log('Function key check:', {
      keyPresent: !!process.env.AZURE_FUNCTION_KEY,
      keyLength: process.env.AZURE_FUNCTION_KEY?.length || 0
    });

    const functionKey = process.env.AZURE_FUNCTION_KEY;
    console.log('Using function key:', functionKey); // We'll remove this after debugging

    if (!functionKey) {
      throw new Error('Azure function key is not configured');
    }

    // Try with both header variations
    const headers = {
      'Content-Type': 'application/json',
      'x-functions-key': functionKey,
      // Add these variations
      'code': functionKey,  // Try as query parameter instead
      'Origin': process.env.BACKEND_URL || 'http://localhost:3000'
    };

    // Add the code as a query parameter as well
    const urlWithCode = `${azureFunctionUrl}?code=${encodeURIComponent(functionKey)}`;

    const azureResponse = await fetch(urlWithCode, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        job_id: jobId,
        image_url: imageUrl
      })
    });

    console.log('Complete request details:', {
      url: urlWithCode,
      method: 'POST',
      headers,
      body: {
        job_id: jobId,
        image_url: imageUrl
      }
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
      let errorDetails = responseText;
      
      try {
        // Try to parse the error response as JSON
        const errorJson = JSON.parse(responseText);
        errorDetails = JSON.stringify(errorJson, null, 2);
      } catch (e) {
        // If it's not JSON, use the raw text
      }
      
      console.error('Azure Function Error Details:', {
        status: azureResponse.status,
        statusText: azureResponse.statusText,
        errorDetails
      });
      
      throw new Error(`Azure function error (${azureResponse.status}): ${errorDetails}`);
    }

    let azureData: AzureTriggerResponse;
    try {
      azureData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Azure function response:', parseError);
      throw new Error(`Invalid response from Azure function: ${responseText}`);
    }

    // Add this before creating the database record
    console.log('Azure Data for DB creation:', {
      jobId,
      userId,
      status: azureData.status,
      imageUrl,
      statusUrl: azureData.status_url,
      metadata: {
        assetName
      }
    });

    // Generate a status URL using the status function
    const statusUrl = `${requiredEnvVars.AZURE_FUNCTION_URL}/${requiredEnvVars.AZURE_STATUS_FUNCTION}/${jobId}`;

    // Store job information in database for tracking
    await prisma.modelJob.create({
      data: {
        id: jobId,
        userId,
        status: azureData.status,
        imageUrl,
        statusUrl, // Use our generated status URL
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

    // Call Azure status endpoint with job_id as query parameter
    const statusUrl = `${requiredEnvVars.AZURE_FUNCTION_URL}/${requiredEnvVars.AZURE_STATUS_FUNCTION}?job_id=${encodeURIComponent(jobId)}`;
    
    console.log('Checking status at:', statusUrl);

    const statusResponse = await fetch(statusUrl, {
      headers: {
        'x-functions-key': process.env.AZURE_FUNCTION_KEY!,
        'Content-Type': 'application/json'
      }
    });
    
    // Log the complete response for debugging
    console.log('Status Response:', {
      status: statusResponse.status,
      statusText: statusResponse.statusText,
      headers: Object.fromEntries(statusResponse.headers.entries())
    });

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error('Status check error:', errorText);
      
      // Handle 404 specifically since we know the function returns this for unknown jobs
      if (statusResponse.status === 404) {
        return res.status(404).json({ error: 'Job status not found in Azure' });
      }
      
      throw new Error(`Status check failed: ${errorText}`);
    }

    const statusData = await statusResponse.json();
    console.log('Status Data:', statusData);

    // Update job status in database
    await prisma.modelJob.update({
      where: { id: jobId },
      data: {
        status: statusData.status || job.status,
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