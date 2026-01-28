import mongoose, { type Document, Schema } from "mongoose";

export interface PlanDocument extends Document {
  name: string;
  price: number;
  durationDays: number;
  features: string[];
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema = new Schema<PlanDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    price: { type: Number, required: true },
    durationDays: { type: Number, required: true },
    features: { type: [String], required: true, default: [] },
    priority: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Plan ||
  mongoose.model<PlanDocument>("Plan", PlanSchema);
