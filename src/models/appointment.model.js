import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    appointmentDateTime: {
      type: String,
      required: [true, "Appointment datetime must required!!"],
      default: Date.now(),
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    hospitalId: {
      type: String,
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "REFUND"],
      required: true,
    },
    appointmentStatus: {
      type: String,
      enum: ["SCHEDULED", "CANCELLED", "COMPLETED"],
    },
  },
  {
    timestamps: true,
  }
);

export const Appointment = mongoose.model("Appointment", AppointmentSchema);
