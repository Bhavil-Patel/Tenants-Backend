const express = require('express');
const router = express.Router();
const BASE_URL = process.env.BASE_URL;
const schema = require('../models/visitSchema');
const { scheduleVisitsEmail } = require('../middlewares/mailer');

router.post('/rescheduleVisit', async (req, res) => {
    try {
        const { email, id, newDate, newTime, reason } = req.body;
        const visitRecord = await schema.findById(id);

        if (!visitRecord) {
            return res.send('<h3>Visit record not found.</h3>');
        }

        visitRecord.visitDate = newDate;
        visitRecord.visitTime = newTime;
        visitRecord.status = 'rescheduled';
        visitRecord.rescheduleReason = reason;
        await visitRecord.save();

        const mailFormat = `
Hi ${visitRecord.visitorName || 'Guest'},

Your visit to the property "${visitRecord.propertyTitle}" has been rescheduled.

New Visit Details:
- Property: ${visitRecord.propertyTitle}
- Address: ${visitRecord.propertyAddress}
- New Date & Time: ${newDate} at ${newTime}
- Reason: ${reason}

Thank you for your understanding.

Regards,  
Team Tenants`;

        await scheduleVisitsEmail("Visit Rescheduled", email, mailFormat);

        res.send('<h2>Visit has been successfully rescheduled and the visitor has been notified.</h2>');
    } catch (err) {
        console.error('Error processing POST rescheduleVisit:', err);
        res.status(500).send('<h3>Something went wrong. Please try again later.</h3>');
    }
});

router.get('/rescheduleVisit', async (req, res) => {
    try {
        const { id } = req.query;
        const visitRecord = await schema.findById(id);

        if (!visitRecord) {
            return res.send('<h3>Visit record not found.</h3>');
        }

        res.send(`
            <h2>Reschedule Visit for Property: ${visitRecord.propertyTitle}</h2>
            <form method="POST" action="${BASE_URL}/rescheduleVisit">
                <input type="hidden" name="email" value="${visitRecord.visitorContact}" />
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
