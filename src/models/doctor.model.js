import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    department: {
      type: String,
      enum: ["ENT", "HEART", "DENTAL", "DERMATOLOGY", "GENERAL"],
    },
    degrees: [
      {
        type: String,
        trim: true,
      },
    ],
    totalExperience: {
      type: Number,
      required: [true, "Experience in year must required!!"],
    },
    experiences: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default Doctor = mongoose.model("Doctor", DoctorSchema);
