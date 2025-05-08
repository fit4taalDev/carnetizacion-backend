// src/services/establishmentQrService.js
import QRCode from 'qrcode'
import { Storage } from '@google-cloud/storage'

const BUCKET_NAME  = process.env.GCP_BUCKET_NAME
const KEY_FILENAME = process.env.KEY_FILE_NAME

const storage = new Storage({ keyFilename: KEY_FILENAME })
const bucket  = storage.bucket(BUCKET_NAME)

export async function generateEstablishmentQRCode(establishmentUrl) {
  if (!establishmentUrl) {
    throw new Error('El parámetro establishmentUrl es requerido')
  }

  const qrBuffer = await QRCode.toBuffer(establishmentUrl, {
    type:   'png',
    width:  300,
    margin: 2
  })

  const destination = `establishmentQrcodes/${encodeURIComponent(establishmentUrl)}.png`
  const file        = bucket.file(destination)

  await file.save(qrBuffer, {
    resumable: false,
    metadata: {
      contentType: 'image/png',
      cacheControl: 'public, max-age=31536000'
    }
  })

  return destination
}
