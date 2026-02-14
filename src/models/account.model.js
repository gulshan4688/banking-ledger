import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "An account must be associated with an user"],
        index : true
    },
    status: {
        type: String,
        enum: {
            values: ["ACTIVE", "FROZEN", "CLOSED"],
            message: "Status must be ACTIVE, FROZEN, or CLOSED",
        },
        default: "ACTIVE"
    },
    currency: {
        type: String,
        required: [true, "Currency is required for using an account"],
        default: "INR"
    }
}, {
    timestamps: true
})

accountSchema.index({user : 1, status : 1});

const accountModel = mongoose.model("Account", accountSchema);

export default accountModel;