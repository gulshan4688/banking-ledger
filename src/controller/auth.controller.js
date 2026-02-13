import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config()

async function userRegisterController(req, res) {
    const { name, email, password } = req.body;
    const emailAlreadyExists = await userModel.findOne({
        email
    })
    if (emailAlreadyExists) return res.status(409).json({ message: "Email already Exists" });


    const user = await userModel.create({ name, email, password });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "9d" });
    res.cookie("token", token);
    res.status(200).json({
        message: "User Registered Successfully",
        user: user,
        token
    })

}

export default userRegisterController;