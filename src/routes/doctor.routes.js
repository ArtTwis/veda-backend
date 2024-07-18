import { Router } from "express";
import { body } from "express-validator";
import { isAdmin, verifyJwtToken } from "../middlewares/auth.middleware.js";
import { createDoctor } from "../controllers/doctor.controller.js";

const router = Router();

router.route("/doctor").post(verifyJwtToken, isAdmin, createDoctor);

export default router;
