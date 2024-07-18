import { Router } from "express";
import { body } from "express-validator";
import { isAdmin, verifyJwtToken } from "../middlewares/auth.middleware.js";
import {
  createPatient,
  disablePatient,
  enablePatient,
  getAllPatients,
  getPatientDetail,
  updatePatientInfo,
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
  .route("/patient/disable/:patientId")
  .patch(verifyJwtToken, isAdmin, disablePatient);

router
  .route("/patient/enable/:patientId")
  .patch(verifyJwtToken, isAdmin, enablePatient);

router
  .route("/patient/update/:patientId")
  .patch(verifyJwtToken, isAdmin, updatePatientInfo);

export default router;
