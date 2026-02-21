import mongoose from "mongoose";

const tokenBlackListSchema = new mongoose.Schema({
    token: {
        type: String,
        unique: [true, "Token is already blackListed"],
        required: [true, "Token is Required to blacklist"]
    }
}, { timestamps: true })

tokenBlackListSchema.index({ createdAt: 1 }, {
    expiteAfterSeconds: 60 * 60 * 24 // 1 day 
})

const tokenBlackListModel = mongoose.model("tokenBlackList", tokenBlackListSchema);

export default tokenBlackListModel;