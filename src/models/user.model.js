import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    userType: {
      type: String,
      enum: ["DOCTOR", "PATIENT", "ADMIN"],
      trim: true,
    },
    name: {
      type: String,
      required: [
        true,
        "Error: The 'name' field is required to complete this request. Please provide a user name..",
      ],
      trim: true,
    },
    guardianName: {
      type: String,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [
        true,
        "Error: The 'mobileNumber' field is required to complete this request. Please provide a valid mobile number..",
      ],
      trim: true,
    },
    guardianMobileNumber: {
      type: String,
      trim: true,
    },
    yearOfBirth: {
      type: Number,
      required: [
        true,
        "Error: The 'yearOfBirth' field is required to complete this request. Please provide a valid year of birth..",
      ],
    },
    dateOfBirth: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      required: [
        true,
        "Error: The 'gender' field is required to complete this request. Please provide a user gender..",
      ],
    },
    email: {
      type: String,
      required: [
        true,
        "Error: The 'email' field is required to complete this request. Please provide a valid email address..",
      ],
      unique: [
        true,
        "Error: The 'email' field must be unique to complete this request. Please provide a valid email address..",
      ],
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
    },
    uniqueIdValue: {
      type: String,
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },
    isActive: {
      type: Number,
      default: 1,
    },
    userAuthId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAuth",
    },
    hospitalId: {
      type: String,
      required: [
        true,
        "Error: The 'hospitalId' field is required to complete this request. Please provide a valid hospital ID..",
      ],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", UserSchema);
