const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const router = express.Router();
const userSchema = require('../models/authSchema');
const upload = require('../middlewares/multer')

const register = async (req, res) => {
    const { userName, contact, password } = req.body;
    const identification = req.files?.identification?.[0];
    const rentalHistory = req.files?.rentalHistory?.[0];
    if (!userName || !contact || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const existingUser = await userSchema.findOne({ contact });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this contact" });
        }
        const user = new userSchema({
            _id: new mongoose.Types.ObjectId(),
            userName,
            contact,
            password,
            identification: `http://localhost:5000/assets/images/${identification.filename}`,
            rentalHistory: `http://localhost:5000/assets/images/${rentalHistory.filename}`,
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
                contact: newUser.contact
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
        const findUser = await userSchema.findOne({ contact });
        if (!findUser) {
            return res.status(400).json({ message: 'Invalid contact or password' });
        }
        if (findUser.password !== password) {
            return res.status(400).json({ message: 'Invalid contact or password' });
        }
        const token = jwt.sign({ _id: findUser._id, userName: findUser.userName }, process.env.JWT_SECRET);
        return res.status(200).json({
            message: 'Login successful',
            user: {
                _id: findUser._id,
                userName: findUser.userName,
                contact: findUser.contact
            },
            token
        });
    } catch (error) {
        console.error("login", error);
        res.status(500).json({ error: error.message });
    }
};

router.post("/signIn", upload.fields([{ name: "identification", maxCount: 1 }, { name: "rentalHistory", maxCount: 1 },]), register);
router.post("/logIn", logIn);

module.exports = router;