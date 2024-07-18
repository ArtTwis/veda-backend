import { Router } from "express";
import { body } from "express-validator";
import { verifyJwtToken } from "../middlewares/auth.middleware.js";
import { setDefaultPassword } from "../middlewares/setDefaultPassword.middleware.js";
import {
  changePassword,
  createAdminUser,
  loginUser,
  logoutUser,
  reGenerateAccessToken,
} from "../controllers/auth.controller.js";

const router = Router();

router
  .route("/create/:userType")
  .post([body("email").trim().isEmail()], setDefaultPassword, createAdminUser);

router
  .route("/login")
  .post(
    [body("email").trim().isEmail(), body("password").trim().notEmpty()],
    loginUser
  );

router.route("/logout").post(verifyJwtToken, logoutUser);

router.route("/regenerateToken").post(reGenerateAccessToken);

router
  .route("/changePassword")
  .put(
    [
      body("oldPassword").trim().notEmpty,
      body("newPassword").trim().notEmpty(),
    ],
    verifyJwtToken,
    changePassword
  );

export default router;
