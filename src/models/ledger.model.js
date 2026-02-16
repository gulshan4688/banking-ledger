import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "ledger must be associated with an account"],
        index: true,
        immutable: true
    },
    amount: {
        type: Number,
        required: [true, "Amount is required to create a ledger entity"],
        immutable: true
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
        required: [true, "ledger must be associated with a transaction"],
        index: true,
        immutable: true
    },
    type: {
        type: String,
        enum: {
            values: ["CREDIT", "DEBIT"],
            message: "type must be CREDIT or DEBIT",
        },
        required: [true, "Ledger type is required"],
        immutable: true
    }
})

function preventLedgerModification() {
    throw new Error("Ledger entries can be not be modified or deleted")
}
const blockedOperations = [
    "updateOne",
    "updateMany",
    "findOneAndUpdate",
    "replaceOne",
    "findOneAndReplace",
    "deleteOne",
    "deleteMany",
    "findOneAndDelete",
    "findByIdAndUpdate",
    "findByIdAndDelete"
];

blockedOperations.forEach(op => {
    ledgerSchema.pre(op, preventLedgerModification);
});
const ledgerModel = mongoose.model("Ledger", ledgerSchema);

export default ledgerModel;