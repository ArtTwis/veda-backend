import { Router } from "express";
import { body } from "express-validator";
import { isAdmin, verifyJwtToken } from "../middlewares/auth.middleware.js";
import {
  createAppointment,
  getAllAppointments,
  updateAppointmentStatus,
  updatePaymentStatus,
} from "../controllers/appointment.controller.js";

const router = Router();

router
  .route("/appointment/create")
  .post(
    [
      body("patientId").trim().notEmpty(),
      body("doctorId").trim().notEmpty(),
      body("serviceId").trim().notEmpty(),
      body("paymentStatus").trim().notEmpty(),
    ],
    verifyJwtToken,
    isAdmin,
    createAppointment
  );

router.route("/appointments").get(verifyJwtToken, isAdmin, getAllAppointments);

router
  .route("/appointment/update/paymentStatus/:appointmentId")
  .patch(
    [body("paymentStatus").trim().notEmpty()],
    verifyJwtToken,
    isAdmin,
    updatePaymentStatus
  );

router
  .route("/appointment/update/appointmentStatus/:appointmentId")
  .patch(
    [body("appointmentStatus").trim().notEmpty()],
    verifyJwtToken,
    isAdmin,
    updateAppointmentStatus
  );

export default router;
