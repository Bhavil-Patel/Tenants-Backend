const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const otpStore = require('../utils/otpStore');

const otpVerify = async (req, res) => {
    try {
        const { TWILIO_SERVICE_SID, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;

        if (!TWILIO_SERVICE_SID || !TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
            console.error('Twilio configuration missing in environment variables');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, { lazyLoading: true });

        const { contact, otp } = req.body;

        if (!contact || !otp) {
            return res.status(400).json({ message: 'Email or phone number and OTP are required' });
        }

        const contactStr = String(contact).trim();
        const isEmail = contactStr.includes('.com');
        const email = isEmail ? contactStr : null;
        const number = !isEmail ? contactStr : null;
        const formattedNumber = number ? (number.startsWith('+91') ? number : `+91${number}`) : null;

        if (isEmail) {
            const stored = otpStore[email];
            if (!stored) {
                return res.status(400).json({ message: 'No OTP request found for this email.' });
            }

            if (Date.now() > stored.expiresAt) {
                delete otpStore[email];
                return res.status(400).json({ message: 'OTP expired' });
            }

            if (stored.otp !== otp) {
                return res.status(400).json({ message: 'Invalid OTP' });
            }

            delete otpStore[email];
            return res.status(200).json({
                message: 'OTP verified successfully',
                otpStatus: 'approved'
            });
        } else {
            try {
                const verifiedResponse = await client.verify
                    .v2.services(TWILIO_SERVICE_SID)
                    .verificationChecks.create({
                        to: formattedNumber,
                        code: otp,
                    });

                if (verifiedResponse.status !== "approved") {
                    return res.status(400).json({ message: "Invalid OTP." });
                }

                return res.status(200).json({
                    message: 'OTP verified successfully',
                    otpStatus: verifiedResponse.status
                });
            } catch (twilioError) {
                console.error('Twilio verification error:', twilioError?.message || twilioError);
                return res.status(twilioError?.status || 500).json({
                    message: twilioError?.message || 'Twilio OTP verification failed',
                });
            }
        }
    } catch (error) {
        console.error('OTP Verification Error:', error);
        return res.status(500).json({
            message: 'An unexpected error occurred during OTP verification.',
            error: error.message || error
        });
    }
};

router.post('/verifyOtp', otpVerify);

module.exports = router;