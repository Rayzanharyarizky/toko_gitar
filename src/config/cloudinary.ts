// config/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
export default cloudinary;

// middlewares/upload.ts
import multer from "multer";
// Gunakan memory storage agar file bisa dikirim langsung ke Cloudinary
const storage = multer.memoryStorage();
export const upload = multer({ storage });
