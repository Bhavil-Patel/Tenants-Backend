const mongoose = require('mongoose');

const VisitScheduleSchema = new mongoose.Schema({
    ownerName: String,
    ownerContact: String,
    propertyTitle: String,
    propertyAddress: String,
    visitDate: String,
    visitTime: String,
    visitorName: String,
    visitorContact: String,
    status: String,
    reasonForDisagreement: String,
}, { timestamps: true, versionKey: false });

const schema = mongoose.model('VisitSchedule', VisitScheduleSchema);

module.exports = schema