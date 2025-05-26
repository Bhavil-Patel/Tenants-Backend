const mongoose = require('mongoose')

const listingSchema = new mongoose.Schema({
    id: mongoose.Types.ObjectId,
    ownerDetails: { name: String, contact: String },
    images: [String],
    title: String,
    location: String,
    favourite: [String],
    rent: String,
    city: String,
    availability: [String],
    discription: [String],
    bookedTill: Date,
    maxMembers: Number,
    rating: Number,
    coordinates: [Number], // [longitude, latitude]
}, { versionKey: false })

const schema = mongoose.model('listings', listingSchema)

module.exports = schema
