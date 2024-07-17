import { Router } from "express";
import { body } from "express-validator";
import { isAdmin, verifyJwtToken } from "../middlewares/auth.middleware.js";
import { createPatient } from "../controllers/patient.controller.js";

const router = Router();

router
  .route("/patient")
  .post(
    [body("email").trim().isEmail()],
    verifyJwtToken,
    isAdmin,
    createPatient
  );

export default router;