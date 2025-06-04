const mongoose = require('mongoose')

const registerSchema = new mongoose.Schema({
    userName: String,
    contact: Number,
    email: String,
    password: String,
    livingPreference: String,
    pet: [String],
    drinking: Boolean,
    smoking: Boolean,
    foodPreference: String,
    identification: String,
    rentalHistory: String,
    role: String,
}, { versionKey: false })

const schema = mongoose.model('users', registerSchema)

module.exports = schema