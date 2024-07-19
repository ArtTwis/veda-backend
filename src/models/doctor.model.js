import mongoose from "mongoose";

const ExperienceSchema = new mongoose.Schema({
  hospitalName: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  jobTitle: { type: String, required: true, trim: true },
  totalMonth: { type: Number, required: true },
  description: { type: String, trim: true },
  department: { type: String, trim: true },
});

const DegreeSchema = new mongoose.Schema({
  degreeType: { type: String, required: true, trim: true },
  institutionName: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  degreeStatus: {
    type: String,
    enum: ["COMPLETED", "PURSUING", "DISCONTINUED"],
  },
  specialization: { type: String, trim: true },
});

const DoctorSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      enum: ["ENT", "HEART", "DENTAL", "DERMATOLOGY", "GENERAL"],
    },
    totalExperience: {
      type: Number,
      required: [true, "Experience in year must required!!"],
    },
    experiences: [ExperienceSchema],
    degrees: [DegreeSchema],
    userAuthId: {
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

export const Doctor = mongoose.model("Doctor", DoctorSchema);
