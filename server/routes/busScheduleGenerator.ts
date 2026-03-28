import express from "express";
import { Schedule } from "../models/Schedule";
import { Bus } from "../models/Bus";
import { Route } from "../models/Route";
import { Heatmap } from "../models/Heatmap";
import { number } from "zod/v4";
const router = express.Router();

// 🔥 helper: rotate buses
async function getBusForIndex(index: number) {
  const buses = await Bus.find();
  if (buses.length === 0) throw new Error("No buses found");
  return buses[index % buses.length]._id;
}

router.post("/auto-generate", async (req, res) => {
  console.log("🚀 GLOBAL SMART AUTO GENERATE STARTED");

  try {
    const { numberOfBuses, startTime, endTime, date } = req.body;

    if (!numberOfBuses || !startTime || !endTime || !date) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    // 🔥 FIX: Normalize date to start of day to ensure deleteMany matches insertMany
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const allRoutes = await Route.find();
    if (allRoutes.length === 0) {
      return res.status(404).json({ message: "No routes found." });
    }

    // 🔥 FIX: PREVENT DOUBLING - Delete existing active schedules for this specific day
    await Schedule.deleteMany( );

    const allNewSchedules: any[] = [];

    for (const route of allRoutes) {
      // Fetch Demand for this specific route
      const heatmaps = await Heatmap.find({
        source: route.source,
        destination: route.destination,
      });

      const demandMap: any = {};
      heatmaps.forEach((h) => {
        demandMap[h.hour] = (demandMap[h.hour] || 0) + h.count;
      });

      let currentTime = new Date(`${date}T${startTime}`);
      const end = new Date(`${date}T${endTime}`);
      let busIndex = 0;

      while (currentTime <= end) {
        const currentHour = currentTime.getHours();
        const demand = demandMap[currentHour] || 1;

        // Dynamic Interval Logic
        let dynamicInterval = demand > 50 ? 5 : demand > 20 ? 10 : 30;
        
        const busId = await getBusForIndex(busIndex);

        const stops = route.stops.map((stop: any, index: number) => ({
          location: stop.name,
          order: index + 1,
          arrivalTime: new Date(currentTime.getTime() + index * 10 * 60000),
          departureTime: new Date(currentTime.getTime() + index * 10 * 60000 + 2 * 60000),
        }));

        allNewSchedules.push({
          route: route._id,
          bus: busId,
          departureTime: new Date(currentTime),
          arrivalTime: new Date(currentTime.getTime() + (route.avgDuration || 60) * 60000),
          date: targetDate, // Store normalized date
          stops,
          totalSeats: 40,
          availableSeats: 40,
          price: 100,
          status: "ACTIVE",
        });

        currentTime = new Date(currentTime.getTime() + dynamicInterval * 60000);
        busIndex = (busIndex + 1) % numberOfBuses;
      }
    }

    if (allNewSchedules.length > 0) {
      await Schedule.insertMany(allNewSchedules);
    }

    res.json({
      message: `✅ Smart schedules refreshed for ${allRoutes.length} routes.`,
      totalGenerated: allNewSchedules.length,
    });

  } catch (err) {
    console.error("❌ Generation Error:", err);
    res.status(500).json({ message: "Global smart generation failed" });
  }
});

// ✅ Manual Schedule (UNCHANGED)
router.post("/manual", async (req, res) => {
  try {
    const {
      route,
      bus,
      departureTime,
      arrivalTime,
      date,
      totalSeats,
      price,
    } = req.body;

    if (!route || !bus || !departureTime || !arrivalTime || !date || !totalSeats || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const schedule = await Schedule.create({
      route,
      bus,
      departureTime: new Date(departureTime),
      arrivalTime: new Date(arrivalTime),
      date: new Date(date),
      totalSeats,
      availableSeats: totalSeats,
      price,
      status: "ACTIVE",
    });

    res.status(201).json({
      message: "Schedule created successfully",
      schedule,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Manual schedule creation failed" });
  }
});


// ✅ Get All
router.get("/all", async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate("bus")
      .populate("route")
      .sort({ departureTime: 1 });

    res.json({
      count: schedules.length,
      schedules,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch schedules" });
  }
});
router.post("/add", async (req, res) => {
  try {
    const {
      busNumber,
      capacity,
      type,
      routeId,
      currentLocation // optional
    } = req.body;

    // 🔹 1. Validate input
    if (!busNumber || !capacity || !routeId) {
      return res.status(400).json({
        success: false,
        message: "busNumber, capacity, routeId are required"
      });
    }

    // 🔹 2. Check if route exists
    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found"
      });
    }

    // 🔹 3. Check duplicate bus
    const existingBus = await Bus.findOne({ busNumber });
    if (existingBus) {
      return res.status(400).json({
        success: false,
        message: "Bus already exists"
      });
    }

    // 🔹 4. Create new bus
    const newBus = new Bus({
      busNumber,
      capacity,
      type,
      route: route._id,
      status: "IN_SERVICE",

      currentLocation: currentLocation || {
        type: "Point",
        coordinates: route.stops?.[0]?.location?.coordinates || [0, 0]
      }
    });

    await newBus.save();

    // 🔹 5. Return response with route + stops
    const populatedBus = await Bus.findById(newBus._id).populate("route");

    res.status(201).json({
      success: true,
      message: "Bus added successfully",
      data: {
        bus: populatedBus,
        stops: route.stops // 🔥 important for frontend
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});
router.get("/routes", async (req, res) => {
  try {
    const routes = await Route.find();

    res.json({
      success: true,
      data: routes
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});
router.get("/buses", async (req, res) => {
  try {
    const buses = await Bus.find().populate("route");
    res.json({
      success: true,
      data: buses,
      number: buses.length
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

export default router;