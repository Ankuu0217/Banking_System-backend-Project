const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: true,
        index: true
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
        default: "PENDING"
    },
    amount: {
        type: Number,
        required: [true, "Transaction amount is required"],
        min: [0, "Transaction amount cannot be negative"]
    },
    idempotencyKey: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
})


const transactionModel = mongoose.model("transaction", transactionSchema)

module.exports = transactionModel