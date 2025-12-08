import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "complaints",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [
      { width: 600, height: 600, crop: "fill" }, // Square 600x600
      { quality: "auto:good" }, // Auto optimize quality
      { fetch_format: "auto" } // Auto choose best format (webp, etc)
    ]
  },
});

export default storage;
