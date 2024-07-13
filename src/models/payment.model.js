import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default Payment = mongoose.model("Payment", PaymentSchema);
