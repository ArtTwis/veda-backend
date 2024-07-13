import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    appointmentDateTime: {
      type: String,
      required: [true, "Appointment datetime must required!!"],
    },
    status: {
      type: String,
      enum: ["SCHEDULED", "CANCELLED", "COMPLETED"],
    },
  },
  {
    timestamps: true,
  }
);

export default Appointment = mongoose.model("Appointment", AppointmentSchema);
