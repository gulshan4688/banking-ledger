import express from "express";
import userRegisterController from "../controller/auth.controller.js";

const router = express.Router();


router.use("/register", userRegisterController );
// router.use("/login",);

 
export default router;