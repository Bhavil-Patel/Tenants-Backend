const express = require('express')
const router = express.Router()
const listingSchema = require('../models/listingsSchema')

const getListings = async (req, res) => {
    try {
        const allListings = await listingSchema.find()
        res.status(200).json({ allListings });
    } catch (error) {
        console.error('Error sending OTP:', error);
        return res.status(error?.status || 400).json({ error: error?.message || 'Something went wrong!' });
    }
}

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
router.post('/favourite', addAndRemoveToFavourite)
module.exports = router