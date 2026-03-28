import mongoose from "mongoose";

// 🔹 Stop Schema (embedded inside route)
const stopSchema = new mongoose.Schema({
  name: String,
  order: Number,

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: [Number]
  }
}, { _id: true });
// 🔥 Important for geo queries
stopSchema.index({ location: "2dsphere" });


// 🔹 Route Schema
const routeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  source: {
    type: String,
    required: true
  },

  destination: {
    type: String,
    required: true
  },

  distance: {
    type: Number // km
  },

  avgDuration: {
    type: Number // minutes
  },

  stops: [stopSchema] // 🔥 embedded stops

}, { timestamps: true });

export const Route =
  mongoose.models.Route || mongoose.model("Route", routeSchema);