import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const { data, error } = await supabase.from("reviews").select("*").order("name");
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Unable to load reviews." });
  }
});

router.post("/", async (req, res) => {
  const { name, role, content } = req.body;

  if (!name || !role || !content) {
    return res.status(400).json({ error: "Name, role and content are required." });
  }

  try {
    const { data, error } = await supabase
      .from("reviews")
      .insert({ name, role, content })
      .select("*")
      .single();

    if (error) throw error;

    return res.status(201).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Unable to save review." });
  }
});

export default router;
