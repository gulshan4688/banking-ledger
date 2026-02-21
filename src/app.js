import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());
app.use(express.json());

// Routes required 
import authRouter from './routes/auth.routes.js'
import accountRouter from './routes/account.routes.js'
import transactionRoutes from './routes/transaction.routes.js'

app.get('/', (req, res) => {
    res.send("Banking ledger is online and running");
})
// routes used
app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/transactions", transactionRoutes);

export default app 