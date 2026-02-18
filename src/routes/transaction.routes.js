import express from "express";
import {authSystemUserMiddleware} from '../middleware/auth.middleware.js'
import transactionController from "../controller/transaction.controller.js";

const transactionRoutes = express.Router();

transactionRoutes.post("/", authSystemUserMiddleware  , transactionController.createTransaction);
transactionRoutes.post("/initial-Funds",authSystemUserMiddleware , transactionController.createInitialFundTransfer )

export default transactionRoutes; 
 