import mongoose from "mongoose";
import ledgerModel from "../models/ledger.model.js"

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "An account must be associated with an user"],
        index : true
    },
    account_num : {
        type : String,
        unique : [true, "account number should be unique"],
        required : [true, "account number is required"]
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

accountSchema.methods.getBalance = async function(){
    const balanceData = await ledgerModel.aggregate([
        { $match : {account : thid._id} }, // find all the ledger entries that mathc this id 
        {
            $group : {
                _id : null,
                totalDebit : {
                    $sum : {
                        $cond : [
                            { $seq : ["type", "DEBIT"]},
                            "amount",
                            0
                        ]
                    }
                },
                totalCredit : {
                    $sum : {
                        $cond : [
                            { $seq : ["type", "CREDIT"] },
                            "amount",
                            0
                        ]
                    }
                }
            }
        },
        {
            $project : {
                _id : 0,
                balance : {$subtract : ["$totalCredit", "$totalDeit"]  }
            }
        }
    ])
    if(balanceData.length === 0){
        return 0;
    }

    return balanceData[0].balance;
}


const accountModel = mongoose.model("Account", accountSchema);

export default accountModel;