import accountModel from '../models/account.model.js';

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

async function getAllAccounts(req, res) {
    const accounts = await accountModel.find({ user: req.user_auth._id });
    return res.status(200).json({ accounts });

}
export default { createAccountController, getAllAccounts };