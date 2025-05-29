const express = require('express');
const router = express.Router();
const schema = require('../models/chatSchema');
const { emitEvent } = require('../middlewares/socket.io');

const chat = async (req, res) => {
    const { senderId, reciverId, message } = req.body;

    if (!senderId || !reciverId || !message) {
        return res.status(400).json({ message: "senderId, reciverId and message are required" });
    }

    try {
        const newMessage = new schema({
            senderId,
            reciverId,
            message,
            time: new Date(Date.now() + (5.5 * 60 * 60 * 1000))
        });
        const savedMessage = await newMessage.save();
        emitEvent('message', savedMessage);

        return res.status(200).json({
            message: "Message sent successfully",
            data: savedMessage
        });

    } catch (error) {
        console.error("chat error", error);
        return res.status(500).json({ error: error.message });
    }
};

const getChat = async (req, res) => {
    try {
        const allChat = await schema.find();

        return res.status(200).json({
            message: "Messages fetched successfully",
            chat: allChat
        });

    } catch (error) {
        console.error("Get chat error:", error);
        return res.status(500).json({
            message: "Failed to fetch messages",
            error: error.message
        });
    }
};

router.post('/chat', chat);
router.get('/getChat', getChat);

module.exports = router;
