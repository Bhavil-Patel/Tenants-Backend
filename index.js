const express = require('express')
const app = express()
const dotenv = require('dotenv')
const dataBase = require('./config/dataBaseConfig')
const cors = require('cors')
const auth = require('./auth')
dotenv.config()
dataBase()
const port = process.env.PORT || 5000

app.use(cors())

app.use('/api', auth)


app.listen(port, () => {
    console.log(`http://localhost/${port}`)
})