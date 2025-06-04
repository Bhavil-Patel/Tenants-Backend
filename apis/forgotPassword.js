const express = require('express');
const router = express.Router();
const userSchema = require('../models/userSchema');

const resetPassword = async (req, res) => {
    const { contact, password } = req.body;
    console.log("contact", contact)
    console.log("password", password)
    try {
        const findUser = await userSchema.findOne({
            $or: [
                { contact: isNaN(parseInt(contact)) ? 0 : parseInt(contact) },
                { email: contact },
            ]
        });
        if (!findUser) {
            return res.status(404).json({ message: 'User with this contact not found.' });
        }
        const updateResult = await userSchema.updateOne(
            { _id: findUser._id },
            { $set: { password } }
        );
        if (updateResult.modifiedCount === 0) {
            return res.status(500).json({ message: 'Password reset failed. Try again.' });
        }
        return res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error) {
        console.error('Error resetting password:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};
router.post('/resetPassword', resetPassword);
module.exports = router;