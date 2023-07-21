import * as express from "express";
import { authController } from "../controllers/authController";
import { check } from "express-validator";
export const router = express.Router();
import { middleware } from "../middelware/middleware";

router.post(
  "/login",
  [
    check("username", "username cannot be empty").notEmpty(),
    check("password", "password cannot be empty").notEmpty(),
    check("password", "password minlength 6, max: 20").isLength({
      min: 6,
      max: 20,
    }),
    check("username", "username minlength 6, max: 12 ").isLength({
      min: 6,
      max: 12,
    }),
  ],
  authController.login
);
router.post(
  "/register",
  [
    check("username", "username cannot be empty").notEmpty(),
    check("password", "password cannot be empty").notEmpty(),
    check("email", "email cannot be empty").notEmpty(),
    check("name", "name cannot be empty").notEmpty(),
    check("password", "password minlength 6, max: 20").isLength({
      min: 6,
      max: 20,
    }),
    check("username", "username minlength 6, max: 12 ").isLength({
      min: 6,
      max: 12,
    }),
  ],
  authController.register
);
router.get(
  "/getProfile/",
  middleware.verifyToken,
  authController.getprofileUser
);

router.patch(
  "/changePassword",
  [
    check("oldPassword", "oldPassword cannot be empty").notEmpty(),
    check("newPassword", "newPassword cannot be empty").notEmpty(),
    check("rePassword", "rePassword cannot be empty").notEmpty(),
    check("newPassword", "newPassword minlength 6, max: 20").isLength({
      min: 6,
      max: 20,
    }),
    check("rePassword", "rePassword minlength 6, max: 20 ").isLength({
      min: 6,
      max: 20,
    }),
  ],
  middleware.verifyToken,
  authController.changePassword
);

router.post(
  "/forgotPassword",
  check("email", "email cannot be empty").notEmpty(),
  authController.forgotPassword
);
router.post(
  "/verifyEmail",
  [check("token", "token cannot be empty").notEmpty()],
  authController.verifyEmail
);

router.post("/refreshToken", authController.refreshToken);
