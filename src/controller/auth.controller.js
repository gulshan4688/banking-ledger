import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import dotenv from "dotenv";
import sendRegistrationEmail from "../services/email.service.js";
import tokenBlackListModel from "../models/blackList.model.js";

dotenv.config()

async function userRegisterController(req, res) {
    const { name, email, password } = req.body;

    const emailAlreadyExists = await userModel.findOne({ email })
    if (emailAlreadyExists) return res.status(409).json({ message: "Email already Exists" });

    const user = await userModel.create({ name, email, password });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "9d" });
    res.cookie("token", token);
    res.status(201).json({
        message: `${name} Registered Successfully`,
        user: user,
        token
    })

    await sendRegistrationEmail({
        username: name,
        email: email
    });

}

async function userloginController(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("password");
    if (!user) res.status(401).json({ message: "user does not exists" });

    const userDetails = await userModel.findOne({ email: email });
    const isInvalidPassword = user.comparePassword(password);
    if (!isInvalidPassword) res.status(401).json({ message: "Invalid password or email" });
    let username = "";
    if (userDetails.systemUser === true) {
        username = "system User";
    } else {
        username = userDetails.name;
    }

    const token = jwt.sign({ user_id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" })
    res.cookie("token", token);
    res.status(200).json({ message: `${username} logged in successfully`, user })
}

async function userLogoutController(req, res) {
    const token = req.cookies.token || req.headers.authorizations?.split(" ")[1];
    if (!token) return res.status(400).json({ message: "token not found" })

    await tokenBlackListModel.create({
        token: token
    })
    res.clearCookie("token");

    res.status(200).json({
        message: "User logged out Successfully"
    })
}

export { userRegisterController, userloginController, userLogoutController };
