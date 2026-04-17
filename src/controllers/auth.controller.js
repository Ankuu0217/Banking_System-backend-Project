const userModel = require("../model/user.model")
const tokenBlackListModel = require("../model/blacklist.model")
const jwt = require("jsonwebtoken")

const emailService = require("../services/email.service")


// User Register Controller
async function userRegisterController(req, res) {
    try {
        const { email, name, password } = req.body

        if (!email || !name || !password) {
            return res.status(422).json({
                success: false,
                message: "Invalid Format"
            })
        }

        const isAlreadyExists = await userModel.findOne({ email: email })

        if (isAlreadyExists) {
            return res.status(422).json({
                success: false,
                message: "User already exists with email"
            })
        }

        const user = await userModel.create({
            email, password, name
        })

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "3d" })

        res.cookie("token", token)

        res.status(201).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token,
            success: true,
            message: "User registered successfully"
        })

        await emailService.sendregisterEmail(user.email, user.name)

    } catch (error) {
        console.error("Registration error:", error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }

}



// Login Controller


async function userLoginController(req, res) {

    const { email, password } = req.body

    if (!email || !password) {
        return res.status(422).json({
            success: false,
            message: "Invalid Format"
        })
    }

    const user = await userModel.findOne({ email: email }).select("+password")

    if (!user) {
        return res.status(422).json({
            success: false,
            message: "User not found"
        })
    }

    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
        return res.status(422).json({
            success: false,
            message: "Invalid Password"
        })
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "3d" })

    res.cookie("token", token)

    res.status(200).json({
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        },
        token,
        success: true,
        message: "User logged in successfully"
    })
}


async function userLogoutController(req, res) {

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }

    res.cookie("token", "", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 0
    })

    await tokenBlackListModel.create({
        token
    })
    res.status(200).json({
        success: true,
        message: "User logged out successfully"
    })
}



module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
}