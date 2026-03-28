import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;

  // Relations
  buses: mongoose.Types.ObjectId[];   // list of buses created by admin
  routes: mongoose.Types.ObjectId[];
  schedules: mongoose.Types.ObjectId[];

  // Stats (optional but useful for quick access)
  totalBuses: number;
  totalRoutes: number;
  totalSchedules: number;

  createdAt: Date;
}

const AdminSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    // 🔗 Relationships
    buses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bus",
      },
    ],

    routes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Route",
      },
    ],

    schedules: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Schedule",
      },
    ],

    // 📊 Quick stats (denormalized for performance)
    totalBuses: {
      type: Number,
      default: 0,
    },

    totalRoutes: {
      type: Number,
      default: 0,
    },

    totalSchedules: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IAdmin>("Admin", AdminSchema);