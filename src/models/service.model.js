import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Service name must required!!"],
      trim: true,
    },
    fees: {
      type: Number,
      required: [true, "Service fees must required!!"],
    },
    description: {
      type: String,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

export const Service = mongoose.model("Service", ServiceSchema);
