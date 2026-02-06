import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../middlewares/validate";
import { authenticateJWT } from "../../middlewares/auth";
import {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  logoutValidation,
  updateProfileValidation,
  changePasswordValidation,
} from "./auth.validators";

const router = Router();
const authController = new AuthController();

router.post("/register", validate(registerValidation), authController.register);

router.post("/login", validate(loginValidation), authController.login);

router.post(
  "/refresh",
  validate(refreshTokenValidation),
  authController.refresh,
);

router.post("/logout", validate(logoutValidation), authController.logout);

router.get("/me", authenticateJWT, authController.getMe);

router.put(
  "/profile",
  authenticateJWT,
  validate(updateProfileValidation),
  authController.updateProfile,
);

router.put(
  "/password",
  authenticateJWT,
  validate(changePasswordValidation),
  authController.changePassword,
);

export default router;
