const accountModel = require("../model/account.model")


async function createAccount(req, res) {

    const user = req.user

    const account = await accountModel.create({
        user: user._id,

    })

    res.status(201).json({
        success: true,
        message: "Account created successfully",
        account
    })
}


async function getAccount(req, res) {

    const accounts = await accountModel.find({
        user: req.user._id,
    })

    res.status(200).json({
        success: true,
        message: "Accounts fetched successfully",
        accounts
    })
}


async function getBalance(req, res) {
    const { accountId } = req.params

    const account = await accountModel.findOne({
        _id: accountId,
        user: req.user._id,
    })

    if (!account) {
        return res.status(400).json({
            success: false,
            message: "Invalid Account"
        })
    }

    const balance = await account.getBalance()

    return res.status(200).json({
        success: true,
        message: "Balance fetched successfully",
        balance
    })
}



module.exports = { createAccount, getAccount, getBalance }
