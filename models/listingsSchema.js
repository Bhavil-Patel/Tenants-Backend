const mongoose = require('mongoose')

const listingSchema = new mongoose.Schema({
    ownerDetails: {
        _id: mongoose.Types.ObjectId,
        name: String,
        contact: Number,
        email: String,
    },
    images: [String],
    title: String,
    location: String,
    favourite: [String],
    rent: String,
    city: String,
    availability: [String],
    description: [String],
    bookedTill: Date,
    maxMembers: Number,
    propertyRules: Array,
    coordinates: [Number], // [longitude, latitude]
}, { versionKey: false })

const schema = mongoose.model('listings', listingSchema)

module.exports = schema
