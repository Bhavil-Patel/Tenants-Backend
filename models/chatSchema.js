const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
    senderId: mongoose.Types.ObjectId,
    reciverId: mongoose.Types.ObjectId,
    message: String,
    time: Date
}, { versionKey: false })

const schema = mongoose.model("chat", chatSchema)

module.exports = schema