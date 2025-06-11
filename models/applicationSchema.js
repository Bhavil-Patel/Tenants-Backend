const mongoose = require('mongoose')
const { array } = require('../middlewares/multer')

const applicationSchema = new mongoose.Schema({
    visitorId: mongoose.Types.ObjectId,
    propertyId: mongoose.Types.ObjectId,
    ownerId: mongoose.Types.ObjectId,
    ownerName: String,
    ownerContact: Number,
    ownerEmail: String,
    propertyTitle: String,
    propertyAddress: String,
    visitorName: String,
    visitorContact: Number,
    visitorEmail: String,
    visitorDob: String,
    visitorProfession: String,
    visitorIncome: Number,
    visitorCurrentAddress: String,
    moveInDate: String,
    visitorPet: [String],
    visitorDrinking: Boolean,
    visitorFoodPreference: String,
    visitorLivingPreference: String,
    visitorSmoking: Boolean,
    applicationStatus: String,
    discription: String,
    documents: [String],
    confirmation: String,
    agreementFrom: String,
    agreement: [{ document: String, from: String, action: String, reason: String, date: Date }],
    signedAgreement: String,
    deposit:Number,
    rent:Number,
    payment: String
}, { timestamps: true, versionKey: false })

const schema = mongoose.model('application', applicationSchema)

module.exports = schema
