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
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default Service = mongoose.model("Service", ServiceSchema);
