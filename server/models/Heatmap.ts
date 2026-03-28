import mongoose from "mongoose";

const heatmapSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: true,
    },

    destination: {
      type: String,
      required: true,
    },

    hour: {
      type: Number, // 0–23
      required: true,
    },

    count: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// 🔥 safe export (VERY IMPORTANT)
export const Heatmap =
  mongoose.models.Heatmap || mongoose.model("Heatmap", heatmapSchema);