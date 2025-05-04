import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

const storage = new Storage();
const bucket  = storage.bucket(process.env.GCP_BUCKET_NAME);


export async function uploadImage(buffer, fileMeta) {

  const ext = fileMeta.filename.split('.').pop();
  const filePath = `students/${uuidv4()}.${ext}`;

  await new Promise((resolve, reject) => {
    const file = bucket.file(filePath);
    const ws   = file.createWriteStream({
      metadata:  { contentType: fileMeta.mimetype },
      resumable: false,
      public:    false    
    });
    ws.on('error',   reject);
    ws.on('finish',  resolve);
    ws.end(buffer);
  });

  return filePath;
}
export async function generateSignedUrl(filePath, expiresSeconds = 900) {
  const file = bucket.file(filePath);
  const [url] = await file.getSignedUrl({
    action:  'read',
    expires: Date.now() + expiresSeconds * 1000
  });
  return url;
}
