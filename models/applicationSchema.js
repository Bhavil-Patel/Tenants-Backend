const mongoose = require('mongoose')

const listingSchema = new mongoose.Schema({
    userId: mongoose.Types.ObjectId,
    ownerId: mongoose.Types.ObjectId,
    propertyId: mongoose.Types.ObjectId,
    propertyTitle: String,
    propertyAddress: String,
    userName: String,
    contact: Number,
    email: String,
    dob: String,
    profession: String,
    income: Number,
    CurrentAddress: String,
    moveInDate: String,
    pet: [String],
    drinking: Boolean,
    foodPreference: String,
    livingPreference: String,
    smoking: Boolean,
    status: String,
}, { timestamps: true, versionKey: false })

const schema = mongoose.model('application', listingSchema)

module.exports = schema
