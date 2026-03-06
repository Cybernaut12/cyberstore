const cloudinary = require("../config/cloudinary");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const hasCloudinaryConfig = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

const saveLocally = async (req) => {
  const uploadsDir = path.join(__dirname, "..", "uploads", "products");
  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(req.file.originalname || "").toLowerCase();
  const allowed = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
  const safeExt = allowed.has(ext) ? ext : ".jpg";
  const fileName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${safeExt}`;
  const filePath = path.join(uploadsDir, fileName);

  await fs.writeFile(filePath, req.file.buffer);

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}/uploads/products/${fileName}`;
};

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (hasCloudinaryConfig()) {
      try {
        // Convert buffer to upload stream
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "cyberstore/products",
              resource_type: "image",
            },
            (error, uploadResult) => {
              if (error) reject(error);
              else resolve(uploadResult);
            }
          );

          stream.end(req.file.buffer);
        });

        return res.json({
          message: "Upload successful",
          url: result.secure_url,
          public_id: result.public_id,
          storage: "cloudinary",
        });
      } catch (cloudErr) {
        const localUrl = await saveLocally(req);
        return res.json({
          message: "Upload saved locally after cloud upload failed",
          url: localUrl,
          storage: "local",
        });
      }
    }

    const localUrl = await saveLocally(req);
    return res.json({
      message: "Upload successful",
      url: localUrl,
      storage: "local",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
