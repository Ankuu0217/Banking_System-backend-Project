const express = require("express")

const router = express.Router()

const { authMiddleware } = require("../middleware/auth.middleware")
const authController = require("../controllers/auth.controller")


router.post("/register", authController.userRegisterController)
router.post("/login", authController.userLoginController)
router.post("/logout", authMiddleware, authController.userLogoutController)

module.exports = router
