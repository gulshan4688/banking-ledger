import express from "express" ; 
import {authMiddleware} from "../middleware/auth.middleware.js";
import accountController from "../controller/account.controller.js";



const router = express.Router();


router.post('/create-account', authMiddleware,accountController.createAccountController);
router.get('/get-all-accounts', authMiddleware, accountController.getAllAccounts);


export default router;