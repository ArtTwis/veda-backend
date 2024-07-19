import mongoose from "mongoose";

const MedicalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
    diagnoses: {
      type: String,
      required: [true, "Patient diagnoses must required!!"],
      trim: true,
    },
    treatment: {
      type: String,
      trim: true,
    },
    labTests: [
      {
        type: String,
        trim: true,
      },
    ],
    procedure: {
      type: String,
      enum: ["SURGICAL", "MEDICAL"],
    },
    description: {
      type: String,
      trim: true,
    },
    prescription: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default MedicalRecord = mongoose.model(
  "MedicalRecord",
  MedicalRecordSchema
);
