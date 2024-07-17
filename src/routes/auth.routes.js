import { Router } from "express";
import { body } from "express-validator";
import { verifyJwtToken } from "../middlewares/auth.middleware.js";
import {
  changePassword,
  createAdminUser,
  loginUser,
  logoutUser,
  reGenerateAccessToken,
} from "../controllers/auth.controller.js";

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

router
  .route("/login")
  .post(
    [body("email").trim().isEmail(), body("password").trim().notEmpty()],
    loginUser
  );

router.route("/regenerateToken").post(reGenerateAccessToken);

router.route("/logout").post(verifyJwtToken, logoutUser);

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
