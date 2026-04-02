import mongoose from "mongoose";
import dotenv from "dotenv";

import Admin from "./models/Admin";
import { Bus } from "./models/Bus";
import { Route } from "./models/Route";
import { Schedule } from "./models/Schedule";
import { Heatmap } from "./models/Heatmap";
import User from "./models/User";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");

    // 🧹 Clear DB
    await Promise.all([
      Admin.deleteMany({}),
      Bus.deleteMany({}),
      Route.deleteMany({}),
      Schedule.deleteMany({}),
      Heatmap.deleteMany({}),
      User.deleteMany({}),
    ]);

    console.log("🧹 Old data cleared");

    // 👨‍💼 Admin
    const admin = await Admin.create({
      name: "Admin One",
      email: "admin@test.com",
      password: "123456",
    });

    // 🛣️ Routes
    const route1 = await Route.create({
      name: "Route A-B",
      source: "Station A",
      destination: "Station B",
      distance: 12,
      avgDuration: 25,
      stops: [
        {
          name: "Stop 1",
          order: 1,
          location: { type: "Point", coordinates: [85.8245, 20.2961] },
        },
        {
          name: "Stop 2",
          order: 2,
          location: { type: "Point", coordinates: [85.8300, 20.3000] },
        },
      ],
    });

    const route2 = await Route.create({
      name: "Route B-C",
      source: "Station B",
      destination: "Station C",
      distance: 18,
      avgDuration: 35,
      stops: [
        {
          name: "Stop 3",
          order: 1,
          location: { type: "Point", coordinates: [85.8400, 20.3100] },
        },
      ],
    });

    // 🚌 Buses
    const bus1 = await Bus.create({
      busNumber: "BUS101",
      capacity: 40,
      type: "AC",
      route: route1._id,
      currentLocation: {
        type: "Point",
        coordinates: [85.8245, 20.2961],
      },
    });

    const bus2 = await Bus.create({
      busNumber: "BUS102",
      capacity: 50,
      type: "NON_AC",
      route: route2._id,
      currentLocation: {
        type: "Point",
        coordinates: [85.8400, 20.3100],
      },
    });

    // 🗓️ Schedules
    const schedule1 = await Schedule.create({
      route: route1._id,
      bus: bus1._id,
      departureTime: new Date(),
      arrivalTime: new Date(Date.now() + 25 * 60000),
      date: new Date(),
      stops: [
        {
          location: "Stop 1",
          arrivalTime: new Date(),
          departureTime: new Date(),
          order: 1,
        },
      ],
      totalSeats: 40,
      availableSeats: 30,
      price: 20,
    });

    const schedule2 = await Schedule.create({
      route: route2._id,
      bus: bus2._id,
      departureTime: new Date(),
      arrivalTime: new Date(Date.now() + 35 * 60000),
      date: new Date(),
      stops: [
        {
          location: "Stop 3",
          arrivalTime: new Date(),
          departureTime: new Date(),
          order: 1,
        },
      ],
      totalSeats: 50,
      availableSeats: 45,
      price: 30,
    });

    // 🔥 Heatmap (THIS IS YOUR AI BASE)
    await Heatmap.insertMany([
      { source: "Station A", destination: "Station B", hour: 9, count: 80 },
      { source: "Station A", destination: "Station B", hour: 18, count: 120 },
      { source: "Station B", destination: "Station C", hour: 10, count: 40 },
    ]);

    // 👤 Users
    const user = await User.create({
      name: "Test User",
      email: "user@test.com",
      password: "123456",
      bookings: [schedule1._id],
    });

    // 🔗 Link admin relations
    admin.buses = [bus1._id, bus2._id];
    admin.routes = [route1._id, route2._id];
    admin.schedules = [schedule1._id, schedule2._id];

    admin.totalBuses = 2;
    admin.totalRoutes = 2;
    admin.totalSchedules = 2;

    await admin.save();

    console.log("🌱 Database seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seed();