import QRCode from 'qrcode';
import CryptoJS from 'crypto-js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Storage } from '@google-cloud/storage';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SECRET_KEY = process.env.QR_KEY;
const BUCKET_NAME = process.env.GCP_BUCKET_NAME 
const KEY_FILENAME = process.env.KEY_FILE_NAME

// Initialization of google cloud
const storage = new Storage({ keyFilename: KEY_FILENAME });
const bucket = storage.bucket(BUCKET_NAME);

export async function generateQRCode(studentId) {
  if (!studentId) throw new Error('The studentId was not received');

  const signature = CryptoJS.HmacSHA256(studentId, SECRET_KEY).toString(CryptoJS.enc.Base64);
  const qrContent = JSON.stringify({ id: studentId, sig: signature });

  const uploadDir = path.join(__dirname, 'uploads');
  const filePath = path.join(uploadDir, `${studentId}_qrcode.png`);
  const destination = `qrcodes/${studentId}.png`;

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  await QRCode.toFile(filePath, qrContent, { type: 'png' });

  try {
    await bucket.upload(filePath, {
      destination,
      resumable: false,
      metadata: {
        cacheControl: 'private, max-age=0',
      },
    });

    fs.unlinkSync(filePath);

    const [url] = await bucket.file(destination).getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    return url;
  } catch (error) {
    fs.unlinkSync(filePath);
    throw new Error('Error uploading the QR Code to Google Cloud Storage: ' + error.message);
  }
}
