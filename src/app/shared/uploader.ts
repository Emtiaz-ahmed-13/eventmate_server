import multer from "multer";
import path from "path";
import imagekit from "./imagekit";

// Store files in memory to be uploaded directly to ImageKit
const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only images (jpeg, jpg, png, webp) are allowed!"));
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const uploadToImageKit = async (file: Express.Multer.File, fileName: string) => {
  try {
    const response = await imagekit.upload({
      file: file.buffer, // Buffer from memoryStorage
      fileName: fileName,
      folder: "/event_banners",
    });
    return response;
  } catch (error) {
    console.error("ImageKit Upload Error:", error);
    throw error;
  }
};
