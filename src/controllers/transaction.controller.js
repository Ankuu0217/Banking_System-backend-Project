const transactionModel = require("../model/transaction.model")
const accountModel = require("../model/account.model")
const ledgerModel = require("../model/ledger.model")
const mongoose = require("mongoose")
const emailService = require("../services/email.service")

async function createTransaction(req, res) {

    const { fromAccount, toAccount, amount, idempotencyKey } = req.body

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            success: false,
            message: "Invalid Format"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount,
    })

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            success: false,
            message: "Invalid Account"
        })
    }

    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })

    if (isTransactionAlreadyExists) {
        if (isTransactionAlreadyExists.status === "COMPLETED") {
            return res.status(400).json({
                message: "Transaction already exists",
                transaction: isTransactionAlreadyExists
            })
        }
        if (isTransactionAlreadyExists.status === "PENDING") {
            return res.status(200).json({
                message: "Transaction is already in progress",
            })
        }
        if (isTransactionAlreadyExists.status === "FAILED") {
            return res.status(400).json({
                message: "Transaction is failed",
            })
        }
    }

    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({
            success: false,
            message: "Account is not active",
        })
    }

    const balance = await fromUserAccount.getBalance()

    if (balance < amount) {
        return res.status(400).json({
            success: false,
            message: `Insufficient Balance. Cureent balance is ${balance}`,
        })
    }

    let transaction;

    try {

        const session = await mongoose.startSession()

        session.startTransaction()

        transaction = (await transactionModel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], {
            session
        }))[0]

        const debitLedger = await ledgerModel.create([{
            account: fromAccount,
            amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], {
            session
        })

        await (() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve()
                }, 10000);
            })
        })()

        const creditLedger = await ledgerModel.create([{
            account: toAccount,
            amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], {
            session
        })

        await transactionModel.findOneAndUpdate({
            _id: transaction._id
        }, {
            status: "COMPLETED"
        }, {
            session
        })

        await session.commitTransaction()
        session.endSession()
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        return res.status(500).json({
            success: false,
            message: "Transaction failed",
            error: error.message
        })
    }


    emailService.sendTransactionEmail(req.user.email, req.user.name, amount, "DEBIT")

    res.status(200).json({
        success: true,
        message: "Transaction completed successfully",
        transaction
    })

}

async function initialFunds(req, res) {


    const { toAccount, amount, idempotencyKey } = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            success: false,
            message: "Invalid Format"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if (!toUserAccount) {
        return res.status(400).json({
            success: false,
            message: "Invalid Account"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id,
    })

    if (!fromUserAccount) {
        return res.status(400).json({
            success: false,
            message: "Invalid Account"
        })
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    })

    const debitLedger = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount,
        transaction: transaction._id,
        type: "DEBIT"
    }], {
        session
    })

    const creditLedger = await ledgerModel.create([{
        account: toAccount,
        amount,
        transaction: transaction._id,
        type: "CREDIT"
    }], {
        session
    })

    transaction.status = "COMPLETED"
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    return res.status(200).json({
        success: true,
        message: "Initial funds added successfully",
        transaction
    })
}











module.exports = { createTransaction, initialFunds }