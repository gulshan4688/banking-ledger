import accountModel from '../models/account.model.js'
import transactionModel from '../models/transaction.model.js'
import getBalance from "../models/account.model.js"
import mongoose, { modelNames } from 'mongoose';
import ledgerModel from '../models/ledger.model.js';
import userModel from '../models/user.model.js';
import emailService from '../services/email.service.js'

async function createTransaction(req, res) {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "fromAccount, toAccount, amount and idempotency key are required."
        })
    }
    // does accounts exists
    const userFromAccountExists = await accountModel.findOne({
        _id: fromAccount
    })
    const userToAccountExists = await accountModel.findOne({
        _id: toAccount
    })
    // console.log(userFromAccountExists);
    // console.log(userToAccountExists);
    if (!userFromAccountExists || !userToAccountExists) return res.status(400).json({
        message: "Invalid fromAccount and toAccount Ids "
    });

    // is idempotency key duplicate ??
    const idempotencyAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })
    if (idempotencyAlreadyExists) {
        if (idempotencyAlreadyExists.status === "COMPLETED") {
            return res.status(200).json({
                message: "Transcatoin already completed",
                transaction: idempotencyAlreadyExists
            })
        }
        if (idempotencyAlreadyExists.status === "PENDING") {
            return res.status(202).json({
                message: "Transcatoin is Pending_",
            })
        }
        if (idempotencyAlreadyExists.status === "FAILED") {
            return res.status(500).json({
                message: "Transcatoin Failed",
            })
        }
        if (idempotencyAlreadyExists.status === "REVERSED") {
            return res.status(500).json({
                message: "Money credit to original account",
            })
        }
    }
    // is accounts are active or not
    if (userFromAccountExists.status !== "ACTIVE" || userToAccountExists.status !== "ACTIVE") {
        return res.status(400).json({
            message: "Both accounts should be active for proper transaction"
        })
    }

    const balance = await userFromAccountExists.getBalance();
    if (balance < amount) {
        return res.status(400).json({
            message: `Insufficient Balance , Current Balance = ${balance} and Requested Amount = ${amount}`
        })
    }
    let transaction ;

    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        transaction = await transactionModel.create({
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        })
        const debitLedgerEntry = await ledgerModel.create([{
            account: fromAccount,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT",
        }], { session });

        const creditLedgerEntry = await ledgerModel.create([{
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session })

        transaction.status = "COMPLETED";
        await transaction.save({ session });

        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
            message : "Transaction Failed"
        })
    }

    await emailService.sendTransactionEmail({
        userEmail: req.user_auth.email,
        name: req.user_auth.name,
        amount,
        toAccount: toAccount._id
    })
    return res.status(200).json({
        message: "Transaction Completed successfully",
        transaction: transaction
    })
}

async function createInitialFundTransfer(req, res) {
    // what do we have 
    const { toAccount, amount, idempotencyKey } = req.body;
    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(401).json({ message: "amount, toAccount and idempotencyKey are required" });
    }

    const isRepeatedPayment = await transactionModel.findOne({ idempotencyKey: idempotencyKey });
    if (isRepeatedPayment) return res.status(409).json({ message: "Idempotency Key already exists , repeated payment" })

    const fromToAccount = await accountModel.findOne({ _id: toAccount })
    if (!fromToAccount) return res.status(401).json({ message: "Invalid toAccount" });

    // we have a toAccount now we need to system user account 
    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    })
    console.log(req.user._id);
    if (!fromUserAccount) return res.status(409).json({ message: "system user account not found" });

    // finding credentials
    const creditAccountDetails = await accountModel.findOne({ _id: toAccount }); // toAccount is id
    // console.log(creditAccountDetails);
    const userDetails = await userModel.findOne({ _id: creditAccountDetails.user });

    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    },)

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"
    }], { session })

    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    }], { session })

    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
        message: "Initial funds transaction completed successfully",
        transaction: transaction,
        // Debited_from : `${modelNames}`,
        credited_to: `${userDetails.name}`
    })
}

export default { createTransaction, getBalance, createInitialFundTransfer };