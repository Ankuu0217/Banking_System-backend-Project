const express = require("express")
const { authMiddleware, systemUserMiddleware } = require("../middleware/auth.middleware")
const transactionController = require("../controllers/transaction.controller")
const router = express.Router()


router.post("/transfer", authMiddleware, transactionController.createTransaction)
router.post("/system/initial-funds", systemUserMiddleware, transactionController.initialFunds)

module.exports = router
