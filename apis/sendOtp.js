const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const { sendOtpEmail } = require('../middlewares/mailer');
const otpStore = require('../utils/otpStore')

const otpSend = async (req, res) => {
    const TWILIO_SERVICE_SID = process.env.TWILIO_SERVICE_SID;
    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, {
        lazyLoading: true,
    });

    const { contact } = req.body;
    
    const contactStr = String(contact).trim();
    const isEmail = contactStr.includes('.com');
    const email = isEmail ? contactStr : null;
    const number = !isEmail ? contactStr : null;
    const formattedNumber = number ? (number.startsWith('+91') ? number : `+91${number}`) : null;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    if (isEmail) {
        otpStore[email] = { otp, expiresAt };
        console.log("new otp", otp)
        console.log('otpStore', otpStore)
    }

    try {
        let responseMessage;
        let otpResponse;

        if (isEmail) {
            await sendOtpEmail(email, otp);
            responseMessage = 'OTP sent via email!';
            otpResponse = { email, otp };
        } else {
            otpResponse = await client.verify
                .v2.services(TWILIO_SERVICE_SID)
                .verifications.create({
                    to: formattedNumber,
                    channel: 'sms',
                });
            responseMessage = 'OTP sent via SMS!';
        }

        return res.status(200).json({
            message: responseMessage,
            response: otpResponse,
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        return res.status(error?.status || 400).json({ error: error?.message || 'Something went wrong!' });
    }
};

router.post('/sendOtp', otpSend);

module.exports = router;