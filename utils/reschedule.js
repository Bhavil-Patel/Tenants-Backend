const express = require('express');
const router = express.Router();
const BASE_URL = process.env.BASE_URL;
const schema = require('../models/visitSchema');
const { scheduleVisitsEmail } = require('../middlewares/mailer');

router.post('/rescheduleVisit', async (req, res) => {
    try {
        const { id, newDate, newTime, reason } = req.body;
        const { from } = req.query;
        const visitRecord = await schema.findById(id);

        if (!visitRecord) {
            return res.send('<h3>Visit record not found.</h3>');
        }

        const date = { date: newDate, time: newTime, from, rescheduleReason: reason, updatedAt: new Date() }
        visitRecord.rescheduleVisit.push(date)
        visitRecord.status = "Reschedule"
        await visitRecord.save();

        // Plain text version
        const textFormat = `
Hello ${from === "agent" ? visitRecord.visitorName : visitRecord.ownerName},

Your visit to the property "${visitRecord.propertyTitle}" has been rescheduled.

New Visit Details:
- Property: ${visitRecord.propertyTitle}
- Address: ${visitRecord.propertyAddress}
- New Date & Time: ${newDate} at ${newTime}
- Reason: ${reason}

You can reschedule again by visiting the following link:
${BASE_URL}/rescheduleVisit?response=reschedule&reschedule=visitor&id=${id}

Thank you for your understanding.

Regards,  
Team Tenants`;

        const htmlFormat = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #2c3e50;">Hello ${from === "agent" ? visitRecord.visitorName : visitRecord.ownerName},</h2>
    <p>Your visit to the property "<strong>${visitRecord.propertyTitle}</strong>" has been <strong>rescheduled</strong>.</p>

    <h3>New Visit Details:</h3>
    <ul>
        <li><strong>Property:</strong> ${visitRecord.propertyTitle}</li>
        <li><strong>Address:</strong> ${visitRecord.propertyAddress}</li>
        <li><strong>New Date & Time:</strong> ${newDate} at ${newTime}</li>
        <li><strong>Reason:</strong> ${reason}</li>
    </ul>

    <div style="margin: 20px 0;">
        <a href="${BASE_URL}/rescheduleVisit?response=reschedule&reschedule=${from === "agent" ? "visitor" : "agent"}&id=${id}" 
           style="display: inline-block; padding: 10px 20px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px;">
            Reschedule Visit Again
        </a>
    </div>

    <p>Thank you for your understanding.</p>
    <p>Regards,<br><strong>Team Tenants</strong></p>
</div>
`;

        await scheduleVisitsEmail("Visit Rescheduled", from === "agent" ? visitRecord.visitorEmail : visitRecord.ownerEmail, textFormat, htmlFormat);

        res.send(`<h2>Visit has been successfully rescheduled and the ${from === "agent" ? "visitor" : "agent"} has been notified.</h2>`);
    } catch (err) {
        console.error('Error processing POST rescheduleVisit:', err);
        res.status(500).send('<h3>Something went wrong. Please try again later.</h3>');
    }
});


router.get('/rescheduleVisit', async (req, res) => {
    try {
        const { id, reschedule } = req.query;
        const visitRecord = await schema.findById(id);

        if (!visitRecord) {
            return res.send('<h3>Visit record not found.</h3>');
        }

        res.send(`
            <h2>Reschedule Visit for Property: ${visitRecord.propertyTitle}</h2>
            <form method="POST" action="${BASE_URL}/rescheduleVisit?from=${reschedule === "agent" ? "agent" : "visitor"}">
                <input type="hidden" name="email" value="${reschedule === "agent" ? visitRecord.visitorContact : visitRecord.ownerContact}" />
                <input type="hidden" name="id" value="${id}" />
                <label for="newDate">Select a new date:</label><br/>
                <input type="date" name="newDate" required /><br/><br/>
                <label for="newTime">Select a new time:</label><br/>
                <input type="time" name="newTime" required /><br/><br/>
                <label for="reason">Reason for rescheduling:</label><br/>
                <textarea name="reason" rows="4" cols="50" required></textarea><br/><br/>
                <button type="submit">Reschedule Visit</button>
            </form>
        `);
    } catch (err) {
        console.error('Error rendering owner reschedule form:', err);
        res.status(500).send('<h3>Something went wrong.</h3>');
    }
});

module.exports = router;
