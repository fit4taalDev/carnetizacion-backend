import QRCode from 'qrcode';
import CryptoJS from 'crypto-js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cloudinary from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SECRET_KEY = process.env.QR_KEY;

export async function generateQRCode(studentId) {
    if (!studentId) throw new Error('The studentId was not received');
  
    const signature = CryptoJS.HmacSHA256(studentId, SECRET_KEY).toString(CryptoJS.enc.Base64);
  
    const qrContent = JSON.stringify({ id: studentId, sig: signature });
  
    const uploadDir = path.join(__dirname, 'uploads');
    const filePath = path.join(uploadDir, `${studentId}_qrcode.png`);
  
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    await QRCode.toFile(filePath, qrContent, { type: 'png' });
  
    try {
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        resource_type: 'image',
        public_id: `qrcode/${studentId}`, 
      });
  
      fs.unlinkSync(filePath);

      return uploadResult.secure_url;
    } catch (error) {
      fs.unlinkSync(filePath);
      throw new Error('Error al subir el QR Code a Cloudinary: ' + error.message);
    }
}
