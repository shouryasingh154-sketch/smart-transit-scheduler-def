import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { connectDB } from "./config/db";
import heatmapRoutes from "./routes/heatmap";
import busQueryRoutes from "./routes/busqueryroute";
import router from "./routes/busScheduleGenerator";

// ✅ ADD THIS

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // 🔥 ROUTES
  app.use("/api/bus", busQueryRoutes);
  app.use("/api/schedule", router);
  app.use("/api/heatmap", heatmapRoutes);

  return app;
}

// 🚀 Start server
const startServer = async () => {
  try {
    await connectDB();

    const app = createServer();
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
};

startServer();