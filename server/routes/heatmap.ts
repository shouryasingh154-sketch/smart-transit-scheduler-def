import express from "express";
import { Heatmap } from "../models/Heatmap";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const data = await Heatmap.find().sort({ count: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch heatmap" });
  }
});

export default router;