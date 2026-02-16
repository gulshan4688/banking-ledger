import accountModel from '../models/account.model.js'
import transactionModel from '../models/transaction.model.js'

async function createTransaction(req, res) {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "fromAccount, toAccount, amount and idempotency key are required."
        })
    }

    const userFromAccountExists = await accountModel.findOne({
        _id: fromAccount
    })
    const userToAccountExists = await accountModel.findOne({
        _id: toAccount
    })

    if (!userFromAccountExists || userToAccountExists) return res.json(400).json({
        message: "Invalid fromAccoutn and toAccount"
    });

    const idempotencyAlreadyExists = await transactionModel.findOne({
        idempotencyKey : idempotencyKey
    })

}


export default createTransaction;