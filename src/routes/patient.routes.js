import { Router } from "express";
import { body } from "express-validator";
import { isAdmin, verifyJwtToken } from "../middlewares/auth.middleware.js";
import {
  createPatient,
  disablePatient,
  getAllPatients,
  getPatientDetail,
} from "../controllers/patient.controller.js";

const router = Router();

router
  .route("/patient")
  .post(
    [body("email").trim().isEmail()],
    verifyJwtToken,
    isAdmin,
    createPatient
  );

router.route("/patients").post(verifyJwtToken, isAdmin, getAllPatients);

router.route("/patient/:patientId").post(verifyJwtToken, getPatientDetail);

router
  .route("/patient/:patientId")
  .put(verifyJwtToken, isAdmin, disablePatient);

export default router;
