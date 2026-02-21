import accountModel from '../models/account.model.js';
// import getBalance from '

async function createAccountController(req, res) {
    const { account_num } = req.body;
    const isAccountAlreadyExists = await accountModel.findOne({ account_num });
    if (isAccountAlreadyExists) return res.status(401).json({ message: `Account Number: [${account_num}] already exists` })
    const user = req.user_auth;
    const account = await accountModel.create({
        user: user._id,
        account_num
    });

    await account.populate("user", "name email");

    res.status(201).json({
        message: `Congratulations!! ${user.name} Your Account has been created with account_num : ${account_num} `,
        account
    })
}

async function getAllAccountsController(req, res) {
    const accounts = await accountModel.find({ user: req.user_auth._id });
    return res.status(200).json({ accounts });
}

async function getAccountBalanceController(req, res) {
    const { account_num } = req.body;
    const account = await accountModel.findOne({
        account_num,
        user: req.user_auth._id
    });
    if (!account) return res.status(404).json({ message: `Account Num : ${account_num} not found , Create first` })
        console.log(account);
    const balance = await account.getBalance();
    account.populate("user", "name email")
    return res.status(201).json({
        account,
        message: `Account Balance: ${balance}`
    })
}
export default {
    createAccountController,
    getAllAccountsController,
    getAccountBalanceController
};