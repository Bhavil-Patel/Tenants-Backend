const express = require('express');
const router = express.Router();
const BASE_URL = process.env.BASE_URL;
const schema = require('../models/visitSchema');
const { scheduleVisitsEmail } = require('../middlewares/mailer');

const agreeDisagreeForm = async (req, res) => {
    try {
        const { id, response } = req.query;

        const visitRecord = await schema.findById(id);

        if (!visitRecord) {
            return res.send('<h3>Invalid or missing visit record.</h3>');
        }

        if (visitRecord.status) {
            return res.send(`<h3 style="color:red;">You have already ${visitRecord.status}ed this appointment.</h3>`);
        }

        const email = visitRecord.visitorContact || '';

        if (response === 'disagree') {
            await schema.findByIdAndUpdate(id, { status: 'disagree' });

            return res.send(`
                <h2>Sorry to hear that you can't make it.</h2>
                <form method="POST" action="${BASE_URL}/agreeDisagreeForm">
                    <input type="hidden" name="email" value="${email}" />
                    <input type="hidden" name="id" value="${id}" />
                    <label for="reason">Please provide a reason:</label><br/>
                    <textarea name="reason" rows="4" cols="50" required></textarea><br/><br/>
                    <button type="submit">Submit Reason</button>
                </form>
            `);
        } else if (response === 'agree') {
            await schema.findByIdAndUpdate(id, { status: 'agree' });
            const mailFormat = `
            Hi ${visitRecord.ownerName},
            
            Thank you for your interest in renting with Tenants!
            
            We're pleased to let you know that your visit to the property ${visitRecord.propertyTitle} has been successfully scheduled.
            
            Property Details:
                Property: ${visitRecord.propertyTitle}
                Address: ${visitRecord.propertyAddress}
                Date & Time: ${visitRecord.visitDate} at ${visitRecord.visitTime}
                Owner: ${visitRecord.ownerName} (${visitRecord.ownerContact})
            
            We look forward to helping you find your next home!
            
            Warm regards,
            Team Tenants
                        `;
            await scheduleVisitsEmail("Schedule Visit Confirmation", visitRecord.visitorContact, mailFormat);
            return res.send('<h2>Thank you, your visit has been confirmed!</h2>');
        }
    } catch (err) {
        console.error('Error processing form:', err);
        res.status(500).send('<h3>Something went wrong. Please try again later.</h3>');
    }
};

const handleDisagreePost = async (req, res) => {
    try {
        const { email, id, reason } = req.body;

        if (!email || !id || !reason) {
            return res.send('<h3>Missing required fields.</h3>');
        }   

        const visitRecord = await schema.findById(id);

        const mailFormat = `
        Hi ${visitRecord.ownerName},
        
         We hope this message finds you well.

            We wanted to inform you that the scheduled property visit for the following listing has been **cancelled**
            Reason for cancellation:  
            "${reason}"

            Thank you for your continued interest in working with Tenants.

            If you have any questions or require further assistance, please don't hesitate to reach out.

            Best regards,  
            **Team Tenants**
        `;

        await scheduleVisitsEmail("Property Visit Cancellation Notice", visitRecord.visitorContact, mailFormat);

        const updated = await schema.findByIdAndUpdate(
            id,
            { reasonForDisagreement: reason },
            { new: true }
        );

        if (!updated) {
            return res.send('<h3>Failed to update the visit record. Invalid ID.</h3>');
        }

        res.send('<h3>Thank you for your response. We’ve noted your reason.</h3>');
    } catch (error) {
        console.error('Error updating reason:', error);
        res.status(500).send('<h3>Something went wrong. Please try again later.</h3>');
    }
};

router.get('/visit', agreeDisagreeForm);
router.post('/visit', handleDisagreePost);

module.exports = router;