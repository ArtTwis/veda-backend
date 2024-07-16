import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAuth",
    },
    userType: {
      type: String,
      enum: ["DOCTOR", "PATIENT", "ADMIN"],
      required: [true, "User type must required!!"],
      trim: true,
    },
    name: {
      type: String,
      required: [true, "User name must required!!"],
      trim: true,
      index: true,
    },
    guardianName: {
      type: String,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [true, "User mobile number must required!!"],
      trim: true,
    },
    guardianMobileNumber: {
      type: String,
      trim: true,
    },
    yearOfBirth: {
      type: Number,
      required: [true, "User year of birth must required!!"],
    },
    dateOfBirth: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      required: true,
    },
    email: {
      type: String,
      required: [true, "User email must required!!"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    addressLine1: {
      type: String,
      trim: true,
    },
    addressCity: {
      type: String,
      trim: true,
    },
    addressState: {
      type: String,
      trim: true,
    },
    uniqueIdType: {
      type: String,
      enum: ["ADHAAR", "BHAMASHAH", "DL", "VOTERID"],
      required: [true, "User unique id type must required!!"],
    },
    uniqueIdValue: {
      type: String,
      required: [true, "User unique id value must required!!"],
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
      required: [true, "User blood group must required!!"],
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", UserSchema);
