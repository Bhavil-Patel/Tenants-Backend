const mongoose = require('mongoose')

const registerSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    contact: String,
    userName: String,
    password: String,
})

const schema = mongoose.model('users', registerSchema)

module.exports = schema