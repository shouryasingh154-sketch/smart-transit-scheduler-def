import mongoose from "mongoose";

const stopSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
  },

  arrivalTime: {
    type: Date,
    required: true,
  },

  departureTime: {
    type: Date,
  },

  order: {
    type: Number, // sequence (1,2,3...)
    required: true,
  },
});

const scheduleSchema = new mongoose.Schema(
  {
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },

    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
    },

    // 🕒 Main timings
    departureTime: {
      type: Date,
      required: true,
    },

    arrivalTime: {
      type: Date,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    // 🛑 MULTI STOPS
    stops: [stopSchema],

    // 🎫 Seats
    totalSeats: {
      type: Number,
      required: true,
    },

    availableSeats: {
      type: Number,
      required: true,
    },

    // 💰 Pricing
    price: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "CANCELLED", "COMPLETED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

// 🔥 Index for fast search
scheduleSchema.index({ route: 1, date: 1 });

export const Schedule =
  mongoose.models.Schedule ||
  mongoose.model("Schedule", scheduleSchema);