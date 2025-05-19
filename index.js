const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const dataBase = require('./config/dataBaseConfig')
const auth = require('./apis/auth')
const sendOtp = require('./apis/sendOtp')
const verifyOtp = require('./apis/verifyOtp')
const bodyParser = require('body-parser');

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

app.use('/api', auth)
app.use('/api', sendOtp)
app.use('/api', verifyOtp)


app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})