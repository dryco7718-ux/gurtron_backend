import { Router } from "express";
import multer from "multer";
import { supabase } from "../lib/supabase";
import { logger } from "../lib/logger";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }

    const ext = file.originalname.split(".").pop() ?? "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadErr } = await supabase.storage
      .from("photos")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadErr) {
      logger.error({ err: uploadErr }, "Supabase storage upload failed");
      res.status(500).json({ error: "Upload failed" });
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("photos").getPublicUrl(filePath);
    const url = publicUrlData?.publicUrl ?? null;

    res.json({ url });
  } catch (error) {
    logger.error({ err: error }, "Upload error");
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
