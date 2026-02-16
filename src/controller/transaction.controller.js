import accountModel from '../models/account.model.js'
import transactionModel from '../models/transaction.model.js'
import getBalance from "../models/account.model.js"
import mongoose from 'mongoose';
import ledgerModel from '../models/ledger.model.js';
import sendTransactionEmail from '../services/email.service.js'

async function createTransaction(req, res) {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({   // 400 when mistake is form client side 
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
    if (!userFromAccountExists || userToAccountExists) return res.json(400).json({
        message: "Invalid fromAccoutn and toAccount"
    });
    // is idempotency key duplicate ??
    const idempotencyAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })
    if (!idempotencyAlreadyExists) {
        if (idempotencyAlreadyExists.status === "COMPLETED") {
            return res.status(200).json({
                message: "Transcatoin already completed",
                transaction: idempotencyAlreadyExists
            })
        }
        if (idempotencyAlreadyExists.status === "PENDING") {
            return res.status(202).json({
                message: "Transcatoin is Pending",
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
    if (fromAccount.status !== "ACTIVE" || fromAccount.status !== "ACTIVE") {
        return res.status(400).json({
            message: "Both accounts should be active for proper transaction"
        })
    }

    const balance = await fromAccount.getBalance();
    if (balance < amount) {
        return res.status(400).json({
            message: `Insufficient Balance , Current Balance = ${balance} and Requested Amount = ${amount}`
        })
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction = await transactionModel.create({
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    }, { session })
    const debitLedgerEntry = await ledgerModel.create({
        account: fromAccount,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT",
    }, { session })
    const creditLedgerEntry = await ledgerModel.create({
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    }, { session })

    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    await sendTransactionEmail({
        userEmail: req.user.email,
        name: req.user.name,
        amount,
        toAccount: toAccount._id
    })
    return res.status(200).json({
        message: "Transaction Completed successfully",
        transaction: transaction
    })
}

async function createInitialFundTransfer(req, res) {
    const { fromAccount, toAccount, idempotencyKey } = req.body;
    if (!fromAccount || !toAccount || !idempotencyKey) {
        return res.status(401).json({ message: "toAccount, fromAccount and idempotencyKey are required" });
    }
    const existanceOfToAccount = await accountModel.findOne({ _id: toAccount })
    if (!existanceOfToAccount) return res.status(401).json({ message: "Invalid Account" });

    // we have a to account now we need to system user account 
    const fromUserAccount = await accountModel.findOne({
        systemUser: true,
        user: req.user._id
    })
    if (!fromUserAccount) return res.status(409).json({ message: "system user account not found" });
    
}

export default { createTransaction, getBalance };