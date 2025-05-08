import { Storage } from '@google-cloud/storage'
import { v4 as uuidv4 } from 'uuid'

const storage = new Storage({ keyFilename: process.env.KEY_FILE_NAME })
const bucket  = storage.bucket(process.env.GCP_BUCKET_NAME)

export async function uploadImage(buffer, fileMeta, id, folder) {
  const ext = fileMeta.filename.split('.').pop()
  const filePath = `${folder}/${id}/${uuidv4()}.${ext}`
  const file = bucket.file(filePath)
  await file.save(buffer, {
    metadata: { contentType: fileMeta.mimetype },
    resumable: false
  })
  return filePath
}
