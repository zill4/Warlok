import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  endpoint: process.env.ENDPOINT_URL_32,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

export const uploadCardImage = async (
  userId: string,
  imageBuffer: Buffer,
  mimeType: string,
  filename: string
): Promise<string> => {
  const key = `users/${userId}/cards/${filename}`;
  
  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: imageBuffer,
        ContentType: mimeType,
        Metadata: {
          userId,
          filename
        }
      })
    );

    return `${process.env.ENDPOINT_URL_32}/${process.env.AWS_BUCKET_NAME}/${key}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload image');
  }
}; 