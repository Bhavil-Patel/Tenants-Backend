const mongoose = require('mongoose');

const VisitScheduleSchema = new mongoose.Schema({
    propertyId: mongoose.Types.ObjectId,
    propertyTitle: String,
    propertyAddress: String,
    ownerId: mongoose.Types.ObjectId,
    ownerName: String,
    ownerContact: Number,
    ownerEmail: String,
    visitorId: mongoose.Types.ObjectId,
    visitorName: String,
    visitorContact: Number,
    visitorEmail: String,
    visitorDob: String,
    visitorProfession: String,
    visitorIncome: Number,
    visitorCurrentAddress: String,
    visitorPet: [String],
    visitorDrinking: Boolean,
    visitorFoodPreference: String,
    visitorLivingPreference: String,
    visitorSmoking: Boolean,
    visitDate: String,
    visitTime: String,
    rescheduleVisit: [{ date: String, time: String, from: String, rescheduleReason: String, updatedAt: Date, }],
    status: String,
    reasonForDisagreement: String,
}, { timestamps: true, versionKey: false });

const schema = mongoose.model('VisitSchedule', VisitScheduleSchema);

module.exports = schema