import QRCode from 'qrcode';
import CryptoJS from 'crypto-js';
import { Storage } from '@google-cloud/storage';

const SECRET_KEY   = process.env.QR_KEY;
const BUCKET_NAME  = process.env.GCP_BUCKET_NAME;
const KEY_FILENAME = process.env.KEY_FILE_NAME;

const storage = new Storage({ keyFilename: KEY_FILENAME });
const bucket  = storage.bucket(BUCKET_NAME);

export async function generateQRCode(studentId) {
  if (!studentId) throw new Error('The studentId was not received');

  const signature = CryptoJS
    .HmacSHA256(studentId, SECRET_KEY)
    .toString(CryptoJS.enc.Base64);
  const qrContent = JSON.stringify({ id: studentId, sig: signature });
  const buffer    = await QRCode.toBuffer(qrContent, { type: 'png' });

  const objectKey = `StudentsQrcodes/${studentId}.png`;
  const file      = bucket.file(objectKey);
  await file.save(buffer, {
    metadata:    { contentType: 'image/png' },
    resumable:   false,
    validation:  'md5',
  });

  return objectKey;
}
