import { Router } from "express";
import { body } from "express-validator";
import { createAdminUser, loginUser } from "../controllers/auth.controller.js";

const router = Router();

router
  .route("/createAdmin")
  .post(
    [
      body("email").trim().isEmail(),
      body("password").trim().isLength({ min: 5 }),
    ],
    createAdminUser
  );

router.route("/login").post([], loginUser);

export default router;
