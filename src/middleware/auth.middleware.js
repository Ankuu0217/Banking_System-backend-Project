const userModel = require("../model/user.model")
const tokenBlackListModel = require("../model/blacklist.model")


const jwt = require("jsonwebtoken")


async function authMiddleware(req, res, next) {

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY)

    const user = await userModel.findById(decodedToken.userId)

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }

    req.user = user
    next()
}

async function systemUserMiddleware(req, res, next) {

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }


    const isTokenBlacklisted = await tokenBlackListModel.findOne({ token })

    if (isTokenBlacklisted) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY)

    const user = await userModel.findById(decodedToken.userId).select("+systemUser")

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }

    if (!user.systemUser) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }

    req.user = user
    next()
}



module.exports = { authMiddleware, systemUserMiddleware }