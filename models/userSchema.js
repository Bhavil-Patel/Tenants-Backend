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
    dob: Date,
    monthlyIncome: Number,
    profession: String,
    currentAddress: String,
    QRCode: String,
    identification: String,
    rentalHistory: String,
    role: String,
}, { timestamps: true, versionKey: false })

const schema = mongoose.model('users', registerSchema)

module.exports = schema