import express from "express";
import {userLogoutController, userRegisterController, userloginController} from "../controller/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";


const router = express.Router();


router.post("/register", userRegisterController );
router.post("/login", userloginController);
router.post("/log-out", authMiddleware , userLogoutController);
 
export default router;