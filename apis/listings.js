const express = require('express')
const router = express.Router()
const listingSchema = require('../models/listingsSchema')
const userSchema = require('../models/userSchema')
const upload = require('../middlewares/multer')
const mongoose = require('mongoose');

const getListings = async (req, res) => {
    try {
        const allListings = await listingSchema.find()
        res.status(200).json({ allListings });
    } catch (error) {
        console.error('Error getting Listings:', error);
        return res.status(error?.status || 400).json({ error: error?.message || 'Something went wrong!' });
    }
}

const getOwnerListings = async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Owner ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid Owner ID format' });
    }

    try {
        const allListings = await listingSchema.find({ 'ownerDetails._id': new mongoose.Types.ObjectId(id) });

        if (!allListings || allListings.length === 0) {
            return res.status(404).json({ error: 'No listings found for this owner' });
        }

        res.status(200).json({ allListings });
    } catch (error) {
        console.error(`Error getting listings for owner ${id}:`, error);
        return res.status(500).json({ error: 'Failed to retrieve listings. Please try again later.' });
    }
};

const addListing = async (req, res) => {
    try {
        const {
            title,
            rent,
            city,
            location,
            maxMembers,
            description,
            userId,
            coordinates,
            propertyRules,
            availability
        } = req.body;

        const files = req.files

        console.log("req.body", req.body, "<=============================================================================================");
        console.log("req.files", req.files, "<=============================================================================================");

        const getUser = await userSchema.findById(userId);
        if (!getUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const images = Array.isArray(files)
            ? files.map(file => `http://192.168.1.7:4000/assets/images/${file.filename}`)
            : [];

        let formattedRules = [];
        if (typeof propertyRules === 'string') {
            try {
                const rulesArray = JSON.parse(propertyRules);
                formattedRules = rulesArray.map(rule => ({
                    [rule.name]: rule.value
                }));
            } catch (error) {
                return res.status(400).json({ error: 'Invalid propertyRules format' });
            }
        } else if (Array.isArray(propertyRules)) {
            formattedRules = propertyRules.map(rule => ({
                [rule.name]: rule.value
            }));
        }

        const newListing = new listingSchema({
            title,
            rent,
            city,
            location,
            maxMembers,
            description,
            availability,
            coordinates,
            propertyRules: formattedRules,
            images,
            ownerDetails: {
                _id: getUser._id,
                name: getUser.userName,
                contact: getUser.contact,
                email: getUser.email
            }
        });

        const listingDetails = await newListing.save();
        console.log("listingDetails", listingDetails);
        return res.status(200).json({ message: 'Property added successfully!', listing: listingDetails });

    } catch (error) {
        console.error('Error adding listing:', error);
        return res.status(500).json({ error: error.message || 'Something went wrong!' });
    }
};


const addAndRemoveToFavourite = async (req, res) => {
    try {
        const { user, id } = req.body;
        console.log(req.body);

        if (!id || !user) {
            return res.status(400).json({ error: 'Invalid input: ID and userId are required' });
        }
        const listing = await listingSchema.findById(id);

        if (!listing) {
            throw new Error("Listing not found");
        }

        let updatedListing;

        if (listing.favourite.includes(user)) {
            updatedListing = await listingSchema.findByIdAndUpdate(
                id,
                { $pull: { favourite: user } },
                { new: true }
            );
        } else {
            updatedListing = await listingSchema.findByIdAndUpdate(
                id,
                { $addToSet: { favourite: user } },
                { new: true }
            );
        }

        if (!updatedListing) {
            return res.status(404).json({ error: 'Listing not found' });
        }
        return res.status(200).json({
            message: 'Favorite status updated successfully',
            listing: updatedListing
        });

    } catch (error) {
        console.error('Error updating favorite status:', error);
        return res.status(error?.status || 400).json({
            error: error?.message || 'Something went wrong!'
        });
    }
};

router.get('/getListings', getListings)
router.get('/getOwnerListings', getOwnerListings)
router.post('/addListing', upload.array('images'), addListing)
router.post('/favourite', addAndRemoveToFavourite)
module.exports = router