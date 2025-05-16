const mongoose = require('mongoose')

const dataBase = async () => {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
    }).then(() => {
        console.log('Connected to MongoDB');
    }).catch(err => console.error('MongoDB connection error:', err));
}

module.exports = dataBase