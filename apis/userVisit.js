const express = require('express');
const router = express.Router();
const schema = require('../models/visitSchema');

const trackVisitStatus = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ error: 'Property ID is required' });
        }
        const visitStatus = await schema.find(
            {
                $or: [
                    { visitorId: id },
                    { ownerId: id },
                ]
            });

        res.status(200).json({ visitStatus });
    } catch (error) {
        console.error('Error tracking visit status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

router.get('/userVisit', trackVisitStatus);

module.exports = router;
