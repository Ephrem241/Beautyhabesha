import mongoose, { type Document, Schema } from "mongoose";

export interface EscortProfileDocument extends Document {
  userId: string;
  displayName: string;
  bio?: string;
  city?: string;
  images: string[];
  contact: {
    phone?: string;
    telegram?: string;
    whatsapp?: string;
  };
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EscortProfileSchema = new Schema<EscortProfileDocument>(
  {
    userId: { type: String, required: true, index: true },
    displayName: { type: String, required: true, trim: true },
    bio: { type: String },
    city: { type: String },
    images: { type: [String], default: [] },
    contact: {
      phone: { type: String },
      telegram: { type: String },
      whatsapp: { type: String },
    },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

EscortProfileSchema.index({ isPublished: 1, createdAt: -1 });

export default mongoose.models.EscortProfile ||
  mongoose.model<EscortProfileDocument>("EscortProfile", EscortProfileSchema);
