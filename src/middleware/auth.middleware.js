import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import tokenBlackListModel from "../models/blackList.model.js";
import userModel from "../models/user.model.js";

dotenv.config();

export async function authMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Un-authorized acces , no token found" });
    }
    const isBlackListed = await tokenBlackListModel.findOne({token});

    if(isBlackListed) return res.status(409).json({ message : "Unauthorized access, token is blacklisted" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // it returns the user id , iat and exp[expiry]
        // console.log(decoded);
        const user = await userModel.findById(decoded.user_id);
        if (!user) {
            return res.status(401).json({
                message: "User not found. Token invalid."
            });
        }
        req.user_auth = user;
        // console.log(user);
        next();

    } catch (error) {
        return res.status(400).json({
            message: error.message
        })
    }
}

export async function authSystemUserMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized , token not found" });

    const isBlackListed = await tokenBlackListModel.findOne({token});
    if(isBlackListed) return res.status(409).json({ message : "Unauthorized access, token is blacklisted" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.user_id).select("+systemUser");
        console.log(user);
        if (!user) return res.status(404).json({ message: "Sytem User not found [auth error]" });
        if (!user.systemUser) return res.status(403).json({ message: "Not a system User" });
        req.user = user;
        return next();
    } catch (error) {
        res.status(403).json({ message: error.message });
    }
}

export default { authMiddleware, authSystemUserMiddleware };

