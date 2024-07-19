import { Router } from "express";
import { body } from "express-validator";
import { isAdmin, verifyJwtToken } from "../middlewares/auth.middleware.js";
import { createAppointment } from "../controllers/appointment.controller.js";

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

export default router;
