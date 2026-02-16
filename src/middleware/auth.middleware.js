import jwt from "jsonwebtoken";
import accountModel from "../models/account.model.js";
import dotenv from "dotenv";
import userModel from "../models/user.model.js";

dotenv.config();

export async function authMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Un-authorized acces , no token found" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log(decoded);
        const user = await userModel.findById(decoded.user);
        if (!user) {
            return res.status(401).json({
                message: "User not found. Token invalid."
            });
        }
        req.user = user;
        next();

    } catch (error) {
        return res.status(400).json({
            message: error.message
        })
    }
}

export async function authSystemUserMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized , token not found" })

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userId).select("+systemUser");
        if (!user.systemUser) return res.status(403).json({ message: "Not a system User" });
        req.user = user;
        return next();
    } catch (error) {
        res.status(403).json({ message: error.message });
    }
}

// export default { authMiddleware, authSystemUserMiddleware };

