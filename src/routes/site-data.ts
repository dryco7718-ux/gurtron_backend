import { Router } from "express";
import { loadSiteData, saveSiteData, type SiteData } from "../lib/site-data";
import { logger } from "../lib/logger";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const data = await loadSiteData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Unable to load site data." });
  }
});

router.put("/", async (req, res) => {
  try {
    const payload = req.body as SiteData;
    await saveSiteData(payload);
    return res.json(payload);
  } catch (error) {
    logger.error({ err: error, body: req.body }, "PUT /api/site-data failed");
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: message });
  }
});

export default router;
