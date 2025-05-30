import { generateSignedUrl } from "./src/utils/signedUrl.js";
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const url = await generateSignedUrl('Logo-01.jpg', 7 * 24 * 60 * 60);
  console.log(url);
}

test();