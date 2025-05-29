const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOtpEmail = async (to, otp) => {
    return await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: 'Your OTP Code',
        text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });
};

const scheduleVisitsEmail = async (subject, to, content, contentHTMl) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: subject,
        text: content,
    };
    if (contentHTMl) {
        mailOptions.html = contentHTMl;
    }
    return await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail, scheduleVisitsEmail };
