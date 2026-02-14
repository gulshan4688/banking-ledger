import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    fromAccount : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Account",
        required : [true, "Account must be associated with a from account"],
        index : true
    },
    toAccount : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Account",
        required : [true, "Transaction must be associated with a to account"],
        index : true
    },
    status : {
        type : String,
        enum : {
            values : ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
            message : "status can be either PENDING, COMPLETED, FAILED or REVERSED"
        },
        default : 'PENDING'
    },
    amount : {
        type : Number, 
        required : [true, "Amount is required for creating a transaction"],
        min : [1, "amount can not be 0"]
    },
    idempotency : {
        type : String,
        required : [true, "Idempotency key is required for transaction"],
        unique : true,
        index : true
    },
},{
    timestamps : true
})

const transactionModel = mongoose.model("Transaction", transactionSchema);

export default transactionModel;