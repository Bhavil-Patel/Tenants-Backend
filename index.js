const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const dataBase = require('./config/dataBaseConfig')
const auth = require('./auth')
const app = express()
dotenv.config()
dataBase()
const port = process.env.PORT || 5000

app.use(express.json());
app.use(cors())

app.use('/api', auth)


app.listen(port, () => {
    console.log(`http://localhost/${port}`)
})