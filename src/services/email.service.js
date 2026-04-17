require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    },
});

// Verify the connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Error connecting to email server:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});



// Function to send email
const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Your Name" <${process.env.EMAIL_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html, // html body
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

async function sendregisterEmail(userEmail, name) {
    const subject = "Welcome to Our Platform"
    const text = `Hello ${name}, Welcome to Our Platform`
    const html = `<h1>Hello ${name}, Welcome to Our Platform</h1>`

    await sendEmail(userEmail, subject, text, html)
}


async function sendTransactionEmail(userEmail, name, amount, type) {
    const subject = "Transaction Notification"
    const text = `Hello ${name}, Your transaction of amount ${amount} of type ${type} has been completed`
    const html = `<h1>Hello ${name}, Your transaction of amount ${amount} of type ${type} has been completed</h1>`

    await sendEmail(userEmail, subject, text, html)
}

module.exports = { sendEmail, sendregisterEmail, sendTransactionEmail };