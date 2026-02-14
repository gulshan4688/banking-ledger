import express from "express";
import {userRegisterController, userloginController} from "../controller/auth.controller.js";


const router = express.Router();


router.post("/register", userRegisterController );
router.post("/login", userloginController);

 
export default router;