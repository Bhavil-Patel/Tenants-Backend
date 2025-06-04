const express = require('express');
const router = express.Router();
const applicationSchema = require('../models/applicationSchema');
const { scheduleVisitsEmail } = require('../middlewares/mailer');

const sendApplication = async (req, res) => {
    try {
        const {
            userId,
            propertyId,
            ownerId,
            ownerName,
            ownerContact,
            propertyTitle,
            propertyAddress,
            userName,
            contact,
            email,
            dob,
            profession,
            income,
            CurrentAddress,
            moveInDate,
            pet,
            drinking,
            foodPreference,
            livingPreference,
            smoking
        } = req.body;

        console.log("User ID:", userId);
        console.log("Property ID:", propertyId);
        console.log("Owner ID:", ownerId);
        console.log("Owner Name:", ownerName);
        console.log("Owner Contact:", ownerContact);
        console.log("Property Title:", propertyTitle);
        console.log("Property Address:", propertyAddress);
        console.log("User Name:", userName);
        console.log("Contact:", contact);
        console.log("Email:", email);
        console.log("Date of Birth:", dob);
        console.log("Profession:", profession);
        console.log("Income:", income);
        console.log("Current Address:", CurrentAddress);
        console.log("Move-In Date:", moveInDate);
        console.log("Pet:", pet);
        console.log("Drinking:", drinking);
        console.log("Food Preference:", foodPreference);
        console.log("Living Preference:", livingPreference);
        console.log("Smoking:", smoking);

        if (!userId || !userName || !contact || !email || !dob) {
            return res.status(400).json({
                message: "Missing required fields (userId, userName, contact, email, dob)."
            });
        }

        const newApplication = new applicationSchema({
            userId,
            propertyId,
            ownerId,
            ownerName,
            ownerContact,
            propertyTitle,
            propertyAddress,
            userName,
            contact,
            email,
            dob,
            profession,
            income,
            CurrentAddress,
            moveInDate,
            pet,
            drinking,
            foodPreference,
            livingPreference,
            smoking,
        });

        const savedApplication = await newApplication.save();

        const mailFormatText = `
New Property Visit Schedule

Dear ${ownerName},

    You have received a new application for your property ${propertyTitle}.
    Applicant Name: ${userName}
    Contact: ${contact}
    Email: ${email}
    Please log in to your profile to view full details.

Thanks,
The Tenants Team
`;
        await scheduleVisitsEmail("New Application Received for Your Property", ownerContact, mailFormatText)

        return res.status(201).json({
            message: "Application submitted successfully.",
            application: savedApplication
        });

    } catch (error) {
        console.error("Error while submitting application:", error);
        return res.status(500).json({
            message: "An error occurred while submitting the application.",
            error: error.message
        });
    }
};

const getApplications = async (req, res) => {
    try {
        const { id } = req.query;
        console.log("id: ", id)
        if (!id) {
            return res.status(400).json({ error: 'Property ID is required' });
        }
        const application = await applicationSchema.find({ ownerId: id });

        res.status(200).json({ application });
    } catch (error) {
        console.error('Error tracking visit status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


router.post('/sendApplication', sendApplication);
router.get('/getApplications', getApplications);

module.exports = router;