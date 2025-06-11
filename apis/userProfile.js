const express = require('express');
const router = express.Router();
const schema = require('../models/userSchema');
const mongoose = require('mongoose');
const listingSchema = require('../models/listingsSchema')


const profile = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ message: "User ID is required." });
        }
        const user = await schema.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const allListings = await listingSchema.find({ 'ownerDetails._id': new mongoose.Types.ObjectId(id) });
        const propertyCount = allListings.length;

        return res.status(200).json({
            message: "User profile fetched successfully.",
            user,
            propertyCount
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({
            message: "An error occurred while fetching the user profile.",
            error: error.message
        });
    }
};

const editUser = async (req, res) => {
    const { _id, userName, email, contact, password, livingPreference, pet, drinking, smoking, foodPreference } = req.body

    const userData = {
        userName,
        email,
        contact,
        password,
        livingPreference,
        pet,
        drinking,
        smoking,
        foodPreference
    }

    const updatedData = await schema.findOneAndUpdate(
        { _id },
        { $set: userData },
        { new: true }
    )

    if (!updatedData) {
        throw new Error('User not found');
    }

    res.status(200).json({
        message: "User updated sucessfully",
        user: {
            _id: updatedData._id,
            userName: updatedData.userName,
            contact: updatedData.contact,
            email: updatedData.email,
            role: updatedData.role
        }
    })
}

router.get('/profile', profile);
router.post('/editProfile', editUser);

module.exports = router;
