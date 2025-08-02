import mongoose from "mongoose";
const { Schema } = mongoose;

// Interfaces (Types Only)
interface PortfolioValue {
  timestamp: Date;
  value: number;
}

interface PortfolioItem {
  id: string;
  amount: number;
  addedAt: Date;
}

export interface UserType extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  profilePicture?: string;
  portfolio: PortfolioItem[];
  portfolioValues: PortfolioValue[];
  createdAt: Date;
  updatedAt: Date;
}

// Schemas
const portfolioValueSchema = new Schema({
  timestamp: { type: Date, default: Date.now },
  value: { type: Number },
});

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "is invalid"],
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: { type: String },
    portfolio: [
      {
        id: { type: String, required: true, trim: true },
        amount: { type: Number, required: true },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    portfolioValues: [portfolioValueSchema],
  },
  {
    timestamps: true,
  }
);

// Typed Model Export
export const User = mongoose.model<UserType>("User", userSchema);

// Types Export (same as before)
export type { PortfolioItem, PortfolioValue };
