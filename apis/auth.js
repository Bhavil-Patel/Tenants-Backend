const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const router = express.Router();
const userSchema = require('../models/userSchema');
const upload = require('../middlewares/multer')
const BASE_URL = process.env.BASE_URL;


const register = async (req, res) => {
    const { userName, email, contact, password, role, dob, monthlyIncome, profession, currentAddress, } = req.body;

    const identification = req.files?.identification?.[0];
    const rentalHistory = req.files?.rentalHistory?.[0];
    const QRCode = req.files?.QRCode?.[0];
    if (!userName || !contact || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const existingUser = await userSchema.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this contact" });
        }
        const user = new userSchema({
            _id: new mongoose.Types.ObjectId(),
            userName,
            contact,
            email,
            password,
            role,
            dob,
            monthlyIncome,
            profession,
            currentAddress,
            identification: `${process.env.ASSETS_URL}${identification.filename}`,
            rentalHistory: `${process.env.ASSETS_URL}${rentalHistory.filename}`,
            QRCode: `${process.env.ASSETS_URL}${QRCode.filename}`,
        });
        const newUser = await user.save();
        const token = jwt.sign(
            { _id: newUser._id, userName: newUser.userName }, process.env.JWT_SECRET);
        res.status(200).json({
            message: "Registered successfully",
            token,
            user: {
                _id: newUser._id,
                userName: newUser.userName,
                contact: newUser.contact,
                email: newUser.email,
                role: newUser.role,

            }
        });
    } catch (error) {
        console.error("register", error);
        res.status(500).json({ error: error.message });
    }
};

const logIn = async (req, res) => {
    const { contact, password } = req.body;
    if (!contact || !password) {
        return res.status(400).json({ message: "Contact and password are required" });
    }
    try {
        const findUser = await userSchema.findOne({
            $or: [
                { contact: isNaN(parseInt(contact)) ? 0 : parseInt(contact) },
                { email: contact },
            ]
        });
        if (!findUser) {
            return res.status(400).json({ message: 'Invalid contact' });
        }
        if (findUser.password !== password) {
            return res.status(400).json({ message: 'Invalid password' });
        }
        const token = jwt.sign(
            { _id: findUser._id, userName: findUser.userName },
            process.env.JWT_SECRET
        );

        return res.status(200).json({
            message: 'Login successful',
            user: {
                _id: findUser._id,
                userName: findUser.userName,
                contact: findUser.contact,
                email: findUser.email,
                role: findUser.role
            },
            token
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: error.message });
    }
};

router.post("/signUp", upload.fields([{ name: "identification", maxCount: 1 }, { name: "QRCode", maxCount: 1 }, { name: "rentalHistory", maxCount: 1 },]), register);
router.post("/logIn", logIn);

module.exports = router;