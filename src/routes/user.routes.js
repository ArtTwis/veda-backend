import { Router } from "express";
import { body } from "express-validator";
import { isAdmin, verifyJwtToken } from "../middlewares/auth.middleware.js";
import { setDefaultPassword } from "../middlewares/setDefaultPassword.middleware.js";
import {
  createUser,
  disableUser,
  enableUser,
  getAllUsers,
  getUserDetails,
  updateUserInfo,
} from "../controllers/user.controller.js";

const router = Router();

router
  .route("/user/create/:userType")
  .post(
    [body("email").trim().isEmail()],
    verifyJwtToken,
    isAdmin,
    setDefaultPassword,
    createUser
  );

router.route("/user/:userType").post(verifyJwtToken, isAdmin, getAllUsers);

router.route("/user/:userType/:userId").post(verifyJwtToken, getUserDetails);

router
  .route("/user/disable/:userType/:userId")
  .patch(verifyJwtToken, isAdmin, disableUser);

router
  .route("/user/enable/:userType/:userId")
  .patch(verifyJwtToken, isAdmin, enableUser);

router
  .route("/user/update/:userType/:userId")
  .patch(verifyJwtToken, isAdmin, updateUserInfo);

export default router;
