const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const dataBase = require('./config/dataBaseConfig')
const bodyParser = require('body-parser');
const path = require('path');
const auth = require('./apis/auth')
const sendOtp = require('./apis/sendOtp')
const verifyOtp = require('./apis/verifyOtp')
const resetPassword = require('./apis/forgotPassword')
const listings = require('./apis/listings')

const app = express()
dotenv.config()
dataBase()
const port = process.env.PORT || 4000

app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());
app.use(bodyParser.json());
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

app.use('/api', auth)
app.use('/api', sendOtp)
app.use('/api', verifyOtp)
app.use('/api', resetPassword)
app.use('/api', listings)


app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})