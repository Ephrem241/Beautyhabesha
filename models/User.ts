import mongoose, { type Document, Schema } from "mongoose";

export interface UserDocument extends Document {
  email: string;
  password?: string;
  name?: string;
  role: "admin" | "escort" | "user";
  currentPlan?: "Normal" | "VIP" | "Platinum";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: false, select: false },
    name: { type: String, trim: true },
    role: {
      type: String,
      enum: ["admin", "escort", "user"],
      default: "user",
    },
    currentPlan: {
      type: String,
      enum: ["Normal", "VIP", "Platinum"],
      default: "Normal",
    },
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model<UserDocument>("User", UserSchema);
