import QRCode from 'qrcode'
import { Storage } from '@google-cloud/storage'

const BUCKET_NAME = process.env.GCP_BUCKET_NAME
const KEY_FILENAME = process.env.KEY_FILE_NAME

const storage = new Storage({ keyFilename: KEY_FILENAME })
const bucket = storage.bucket(BUCKET_NAME)

export async function generateEstablishmentQRCode(establishmentUrl) {
  if (!establishmentUrl) {
    throw new Error('El parámetro establishmentUrl es requerido')
  }

  // 1) Genera el buffer
  const qrBuffer = await QRCode.toBuffer(establishmentUrl, {
    type: 'png',
    width: 300,
    margin: 2,
  })

  // 2) Define la ruta en el bucket
  const destination = `qrcodes/${encodeURIComponent(establishmentUrl)}.png`
  const file = bucket.file(destination)

  // 3) Guarda el archivo SIN ACLs a nivel de objeto
  await file.save(qrBuffer, {
    resumable: false,
    metadata: {
      contentType: 'image/png',
      cacheControl: 'public, max-age=31536000',
    }
  })

  // 4) Genera un Signed URL de larga duración
  const [signedUrl] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() +  2 * 60 * 60 * 1000,
  });

  return signedUrl  // esto sí es un string y funciona con uniform access
}
