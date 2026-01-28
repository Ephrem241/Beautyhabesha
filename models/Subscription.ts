import mongoose, { type Document, Schema } from "mongoose";

export type SubscriptionStatus = "pending" | "active" | "expired" | "rejected";

export interface SubscriptionDocument extends Document {
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  paymentMethod: string;
  paymentProof: {
    url: string;
    publicId: string;
  };
  rejectionReason?: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<SubscriptionDocument>(
  {
    userId: { type: String, required: true, index: true },
    planId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "active", "expired", "rejected"],
      default: "pending",
    },
    paymentMethod: { type: String, required: true },
    paymentProof: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    rejectionReason: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ status: 1, endDate: 1 });
SubscriptionSchema.index({ userId: 1, status: 1 });

export default mongoose.models.Subscription ||
  mongoose.model<SubscriptionDocument>("Subscription", SubscriptionSchema);
