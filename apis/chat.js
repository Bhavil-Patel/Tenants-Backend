const express = require('express');
const router = express.Router();
const schema = require('../models/chatSchema');
const userSchema = require('../models/userSchema');
const { emitEvent } = require('../middlewares/socket.io');

const chat = async (req, res) => {
    const { senderId, reciverId, message, propertyId, propertyTitle, propertyLocation, visitorName, visitorContact, ownerName, ownerContact, } = req.body;

    if (!senderId || !reciverId || !message) {
        return res.status(400).json({ message: "senderId, reciverId and message are required" });
    }

    try {
        const newMessage = new schema({
            senderId,
            reciverId,
            message,
            propertyId,
            propertyTitle,
            propertyLocation,
            visitorName,
            visitorContact,
            ownerName,
            ownerContact,
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

const getUsers = async (req, res) => {
    const { id } = req.query;

    try {
        const findUsers = await schema.find({
            $or: [{ senderId: id }, { reciverId: id }]
        });

        const userPropertyPairs = [];

        findUsers.forEach(item => {
            const otherUserId = item.senderId.toString() === id ? item.reciverId.toString() : item.senderId.toString();
            if (otherUserId !== id && item.propertyId) {
                userPropertyPairs.push({
                    userId: otherUserId,
                    propertyId: item.propertyId.toString()
                });
            }
        });

        const uniquePairs = Array.from(
            new Map(
                userPropertyPairs.map(pair => [pair.userId + '_' + pair.propertyId, pair])
            ).values()
        );

        const userIds = uniquePairs.map(pair => pair.userId);
        const users = await userSchema.find({ _id: { $in: userIds } }).select('_id userName contact');

        const userMap = new Map();
        users.forEach(user => {
            userMap.set(user._id.toString(), user);
        });

        const result = uniquePairs.map(pair => {
            const user = userMap.get(pair.userId);
            return {
                _id: user._id,
                userName: user.userName,
                contact: user.contact,
                propertyId: pair.propertyId
            };
        });

        return res.status(200).json({ users: result });
    } catch (error) {
        console.error("chat error", error);
        return res.status(500).json({ error: error.message });
    }
};

const getChat = async (req, res) => {
    const { id } = req.query;
    try {
        const allChat = await schema.find({
            propertyId: id
        });

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
router.get('/users', getUsers);
router.get('/getChat', getChat);

module.exports = router;
