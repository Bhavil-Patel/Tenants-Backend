const express = require('express');
const { scheduleVisitsEmail } = require('../middlewares/mailer');
const router = express.Router();
const BASE_URL = process.env.BASE_URL || 'http://192.168.1.8:4000/api';
const schema = require('../models/visitSchema');

const validateScheduleVisit = (req, res, next) => {
    const {
        ownerName,
        ownerContact,
        propertyTitle,
        propertyAddress,
        visitDate,
        visitTime,
        visitorName,
        visitorContact,
    } = req.body;

    if (!ownerName || !ownerContact || !propertyTitle || !propertyAddress ||
        !visitDate || !visitTime || !visitorName || !visitorContact) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required',
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(ownerContact) || !emailRegex.test(visitorContact)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid email format for owner or visitor contact',
        });
    }

    next();
};

const scheduleVisits = async (req, res) => {
    try {
        const {
            ownerName,
            ownerContact,
            propertyTitle,
            propertyAddress,
            visitDate,
            visitTime,
            visitorName,
            visitorContact,
        } = req.body;

        const schedule = new schema({
            ownerName,
            ownerContact,
            propertyTitle,
            propertyAddress,
            visitDate,
            visitTime,
            visitorName,
            visitorContact,
        });

        const addSchedule = await schedule.save();

        console.log('Scheduling visit with data:', req.body);

        const mailFormatText = `
New Property Visit Schedule

Hello ${ownerName},

You have been scheduled for a property visit:

    Property: ${propertyTitle}
    Address: ${propertyAddress}
    Date & Time: ${visitDate} at ${visitTime}
    Client: ${visitorName} (${visitorContact})

Please confirm your availability by visiting one of the following links:
- Agree: ${BASE_URL}/agreeDisagreeForm?response=agree&id=${addSchedule._id}
- Disagree: ${BASE_URL}/agreeDisagreeForm?response=disagree&id=${addSchedule._id}

Thanks,
The Tenants Team
`;

        const mailFormatHtml = `
<!DOCTYPE html>
<html>
<head><title>New Property Visit Schedule</title></head>
<body>
    <h2>New Property Visit Schedule</h2>
    <p>Hello ${ownerName},</p>
    <p>You have been scheduled for a property visit:</p>
    <ul>
        <li><strong>Property:</strong> ${propertyTitle}</li>
        <li><strong>Address:</strong> ${propertyAddress}</li>
        <li><strong>Date & Time:</strong> ${visitDate} at ${visitTime}</li>
        <li><strong>Client:</strong> ${visitorName} (${visitorContact})</li>
    </ul>
    <p>Please confirm your availability by clicking one of the following links:</p>
    <p>
        <a href="${BASE_URL}/agreeDisagreeForm?response=agree&id=${addSchedule._id}">Agree</a> |
        <a href="${BASE_URL}/agreeDisagreeForm?response=disagree&id=${addSchedule._id}">Disagree</a>
    </p>
    <p>
        To confirm, click "Agree".<br>
        To decline, click "Disagree" and provide your reason.
    </p>
    <p>Thanks,<br>The Tenants Team</p>
</body>
</html>
`;

        await scheduleVisitsEmail("Schedule Visit", ownerContact, mailFormatText, mailFormatHtml);

        res.status(200).json({
            success: true,
            message: 'Visit scheduled and email sent successfully',
        });
    } catch (error) {
        console.error('Error scheduling visit:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to schedule visit',
            error: error.message,
        });
    }
};

router.post('/schedule', validateScheduleVisit, scheduleVisits);

module.exports = router;