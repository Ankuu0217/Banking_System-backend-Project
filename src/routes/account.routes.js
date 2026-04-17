const express = require("express")
const router = express.Router()
const { authMiddleware } = require("../middleware/auth.middleware")
const accountController = require("../controllers/account.controller")



router.post("/create", authMiddleware, accountController.createAccount)


module.exports = router