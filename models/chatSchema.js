const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
    senderId: mongoose.Types.ObjectId,
    reciverId: mongoose.Types.ObjectId,
    propertyId: mongoose.Types.ObjectId,
    visitorName: String,
    visitorContact: Number,
    ownerName: String,
    ownerContact: Number,
    propertyTitle: String,
    propertyLocation: String,
    message: String,
    time: Date
}, { versionKey: false })

const schema = mongoose.model("chat", chatSchema)

module.exports = schema