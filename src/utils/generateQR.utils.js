import QRCode from 'qrcode';
import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.QR_KEY

export async function generateQRCode(studentId) {
  if (!studentId) throw new Error('Not received studentId');

  const signature = CryptoJS.HmacSHA256(studentId, SECRET_KEY).toString(CryptoJS.enc.Base64);

  const qrContent = JSON.stringify({ id: studentId, sig: signature });

  const base64QRCode = await QRCode.toDataURL(qrContent);
  return base64QRCode;
}
