const express = require('express')
const router = express.Router
const userSchema = require('./models/authSchema')

const register = async (req, res) => {
    const { userName, contact, password } = req.body
    console.log(userName, contact, password)
    console.log(req.body)
    

    try {
        // const user = new userSchema({
        //     _id: new mongoose.Types.ObjectId(),
        //     userName,
        //     contact,
        //     password,
        // });

        // jwt.sign(user, process.env.JWT_SECRET)
        // const newUser = await user.save();

        // res.status(200).json({message: "Register successfully"})

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


router.post("/auth", register)

module.exports = router