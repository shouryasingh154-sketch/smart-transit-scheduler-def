import mongoose from "mongoose";

const busSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: true,
    unique: true
  },

  capacity: {
    type: Number,
    required: true
  },

  type: {
    type: String,
    enum: ["AC", "NON_AC"],
    default: "NON_AC"
  },

  status: {
    type: String,
    enum: ["AVAILABLE", "IN_SERVICE", "MAINTENANCE"],
    default: "AVAILABLE"
  },

  currentLocation: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [lng, lat]
      default: [0, 0]
    }
  },

  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Route"
  },

  lastUpdated: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });


// 🔥 Geo index (important for future tracking)
busSchema.index({ currentLocation: "2dsphere" });

export const Bus =
  mongoose.models.Bus || mongoose.model("Bus", busSchema);