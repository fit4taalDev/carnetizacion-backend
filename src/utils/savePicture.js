import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'crypto';

// Initialize Google Cloud Storage
const bucket = new Storage({ keyFilename: process.env.KEY_FILE_NAME })
  .bucket(process.env.GCP_BUCKET_NAME);

/**
 * Uploads a file stream (from FormData) to GCS and returns a signed read URL.
 * Accepts only PNG, JPG, JPEG. Enforces max size of 200 KB.
 *
 * @param {import('stream').Readable} stream - Readable stream of the file.
 * @param {string} originalName - Original filename (with extension).
 * @param {string} mimeType - MIME type of the file.
 * @returns {Promise<string>} Signed read URL (15 min expiration).
 */
export function savePictureFromStream(stream, originalName, mimeType) {
  // Validate extension
  const ext = originalName.split('.').pop().toLowerCase();
  if (!['png', 'jpg', 'jpeg'].includes(ext)) {
    throw new Error('Invalid file type. Only PNG, JPG, JPEG allowed.');
  }

  // Generate unique filename
  const fileName = `${Date.now()}-${randomUUID()}.${ext}`;
  const gcsFile = bucket.file(`images/${fileName}`);

  // Create write stream to GCS
  const writeStream = gcsFile.createWriteStream({
    metadata: { contentType: mimeType, cacheControl: 'public, max-age=3600' },
    resumable: false
  });

  return new Promise((resolve, reject) => {
    let uploadedBytes = 0;
    stream.on('data', chunk => {
      uploadedBytes += chunk.length;
      if (uploadedBytes > 200 * 1024) {
        writeStream.destroy();
        reject(new Error('File size exceeds 200 KB.'));
      }
    });

    stream.pipe(writeStream)
      .on('error', err => reject(new Error('Upload error: ' + err.message)))
      .on('finish', async () => {
        try {
          const [url] = await gcsFile.getSignedUrl({
            action: 'read',
            expires: Date.now() + 15 * 60 * 1000
          });
          resolve(url);
        } catch (e) {
          reject(e);
        }
      });
  });
}
