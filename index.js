const http = require('http');
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
const schedule = require('./apis/scheduleVisits')
const profile = require('./apis/userProfile')
const chat = require('./apis/chat')
const agreeDisagreeForm = require('./utils/agreeDisagreeForm')
const { initializeSocket } = require('./middlewares/socket.io');

const app = express()
dotenv.config()
dataBase()
const port = process.env.PORT || 4000

app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

app.use('/api', auth)
app.use('/api', sendOtp)
app.use('/api', verifyOtp)
app.use('/api', resetPassword)
app.use('/api', listings)
app.use('/api', schedule)
app.use('/api', agreeDisagreeForm)
app.use('/api', profile)
app.use('/api', chat)

const server = http.createServer(app);
initializeSocket(server);

server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});