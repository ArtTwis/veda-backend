import { Router } from "express";
import { body } from "express-validator";
import { isAdmin, verifyJwtToken } from "../middlewares/auth.middleware.js";
import {
  createDoctorService,
  getDoctorServices,
} from "../controllers/service.controller.js";

const router = Router();

router
  .route("/service/create")
  .post(
    [
      body("name").trim().notEmpty(),
      body("fees").isNumeric(),
      body("userId").trim().notEmpty(),
      body("hospitalId").trim().notEmpty(),
    ],
    verifyJwtToken,
    isAdmin,
    createDoctorService
  );

router
  .route("/services/:userId")
  .post(verifyJwtToken, isAdmin, getDoctorServices);

export default router;
