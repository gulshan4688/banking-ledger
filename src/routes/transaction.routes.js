import express from "express";
import {authSystemUserMiddleware} from '../middleware/auth.middleware.js'
import transactionController from "../controller/transaction.controller.js";
const transactionRoutes = express.Router();

transactionRoutes.post("/", authSystemUserMiddleware  , transactionController.createTransaction);


export default transactionRoutes; 
