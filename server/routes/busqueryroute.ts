import express from "express";
import { Schedule } from "../models/Schedule";
import { Heatmap } from "../models/Heatmap";
const router = express.Router();

// GET upcoming buses between stops
router.get("/between-stops", async (req, res) => {
  try {
    const { startLocation, endLocation } = req.query;

    if (!startLocation || !endLocation) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    const now = new Date();

    // 🔥 Only fetch relevant schedules (IMPORTANT OPTIMIZATION)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const schedules = await Schedule.find({
      date: { $gte: today },
      status: "ACTIVE",
    });
    const hour = new Date().getHours();

    await Heatmap.findOneAndUpdate(
      {
        source: startLocation,
        destination: endLocation,
        hour,
      },
      { $inc: { count: 1 } },
      { upsert: true }
    );
    const result: any[] = [];

    for (let schedule of schedules) {
      const stops = schedule.stops;

      // find indexes
      const startIndex = stops.findIndex(
        (s) => s.location === startLocation
      );

      const endIndex = stops.findIndex(
        (s) => s.location === endLocation
      );

      // valid route direction check
      if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
        const departure = new Date(stops[startIndex].departureTime || stops[startIndex].arrivalTime);

        // 🔥 FILTER ONLY UPCOMING
        if (departure >= now) {
          result.push({
            scheduleId: schedule._id,
            bus: schedule.bus,
            route: schedule.route,

            from: startLocation,
            to: endLocation,

            departureTime: departure,
            arrivalTime: stops[endIndex].arrivalTime,

            availableSeats: schedule.availableSeats,
            price: schedule.price,
          });
        }
      }
    }

    res.json(result);

  } catch (err) {
    res.status(500).json({ message: "Error fetching buses" });
  }
});

export default router;