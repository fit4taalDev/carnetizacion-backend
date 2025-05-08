import { Storage } from '@google-cloud/storage'

const storageUrl = new Storage({ keyFilename: process.env.KEY_FILE_NAME })
const bucketUrl  = storageUrl.bucket(process.env.GCP_BUCKET_NAME)

export async function generateSignedUrl(filePath, expiresSeconds = 7200) {
  const file = bucketUrl.file(filePath)
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + expiresSeconds * 1000
  })
  return url
}
