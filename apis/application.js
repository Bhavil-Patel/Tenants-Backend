const express = require('express');
const router = express.Router();
const applicationSchema = require('../models/applicationSchema');
const userSchema = require('../models/userSchema')
const listingSchema = require('../models/listingsSchema')
const { scheduleVisitsEmail } = require('../middlewares/mailer');
const upload = require('../middlewares/multer');

const sendApplication = async (req, res) => {
    try {
        const { userId, propertyId, ownerId, moveInDate, } = req.body;

        if (!userId || !propertyId || !ownerId || !moveInDate) {
            return res.status(400).json({
                message: "Missing required fields (userId, userName, contact, email, dob)."
            });
        }

        const visitorDetails = await userSchema.findById(userId).lean();
        const ownerDetails = await userSchema.findById(ownerId).lean();
        const propertyDetails = await listingSchema.findById(propertyId).lean();

        if (!visitorDetails) {
            return res.status(404).json({ message: "User not found." });
        }
        if (!ownerDetails) {
            return res.status(404).json({ message: "Owner not found." });
        }
        if (!propertyDetails) {
            return res.status(404).json({ message: "Property not found." });
        }

        const newApplication = new applicationSchema({
            visitorId: userId,
            propertyId,
            ownerId,
            rent: propertyDetails.rent,
            deposit: propertyDetails.deposit,
            ownerName: ownerDetails.userName,
            ownerContact: ownerDetails.contact,
            ownerEmail: ownerDetails.email,
            propertyTitle: propertyDetails.title,
            propertyAddress: propertyDetails.location,
            visitorName: visitorDetails.userName,
            visitorContact: visitorDetails.contact,
            visitorEmail: visitorDetails.email,
            visitorDob: visitorDetails.dob,
            visitorProfession: visitorDetails.profession,
            visitorIncome: visitorDetails.monthlyIncome,
            visitorCurrentAddress: visitorDetails.currentAddress,
            visitorPet: visitorDetails.pet,
            visitorDrinking: visitorDetails.drinking,
            visitorFoodPreference: visitorDetails.foodPreference,
            visitorLivingPreference: visitorDetails.livingPreference,
            visitorSmoking: visitorDetails.smoking,
            moveInDate,
        });

        const savedApplication = await newApplication.save();
        const mailFormatHtml = `
                        <h3>Dear ${ownerDetails.userName},</h3>
                        <p>You have received a new application for your property <strong>${propertyDetails.propertyTitle}</strong>.</p>
                        <p><strong>Applicant Name:</strong> ${visitorDetails.userName}</p>
                        <p><strong>Contact:</strong> <a href="tel:${visitorDetails.contact}">${visitorDetails.contact}</a></p>
                        <p><strong>Email:</strong> ${visitorDetails.email}</p>
                        <p>Please log in to your profile to view full details.</p>
                        <p>— Tenant Web App</p>
                    `;

        const mailFormatText = `
        Dear ${ownerDetails.userName},

            You have received a new application for your property ${propertyDetails.propertyTitle}.
            Applicant Name: ${visitorDetails.userName}
            Contact: ${visitorDetails.contact}
            Email: ${visitorDetails.email}
            Please log in to your profile to view full details.

        Thanks,
        The Tenants Team
        `;
        await scheduleVisitsEmail("New Application Received for Your Property", ownerDetails.email, mailFormatText, mailFormatHtml)

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
        if (!id) {
            return res.status(400).json({ error: 'Property ID is required' });
        }
        const application = await applicationSchema.find({
            $or: [
                { ownerId: id },
                { visitorId: id },
            ]
        });

        res.status(200).json({ application });
    } catch (error) {
        console.error('Error while getting applications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const changeApplicationStatus = async (req, res) => {
    const { id, status, discription, confirmation, agreementFrom } = req.body;

    try {
        const updatedApplication = await applicationSchema.findByIdAndUpdate(
            id,
            {
                applicationStatus: status, discription, confirmation, agreementFrom
            },
            { new: true }
        );

        if (!updatedApplication) {
            return res.status(404).json({ error: 'Application not found.' });
        }

        const { userName, propertyTitle, ownerEmail } = updatedApplication;

        const subject = `Your Application Has Been ${status === 'agree' ? "Accepted" : "Rejected"}`

        const mailFormatHtml = `
                <h3>Dear ${userName},</h3>
                <p>Your application for the property <strong>${propertyTitle}</strong> has been <strong>${status === 'agree' ? "Accepted" : "Rejected"}</strong>.</p>
                <p><strong>${status === 'agree' ? "Next Steps / Documents: " : "Reason: "}</strong>${discription}</p>
                <p>${status === 'agree' ? "Kindly proceed with the required actions." : "You may explore other available listings on our platform."}</p>
                <p>— Tenant Web App</p>
            `;

        const mailFormatText = `
Dear ${userName},

    Your application for the property <strong>${propertyTitle} has been ${status === 'agree' ? "Accepted" : "Rejected"}.
    ${status === 'agree' ? "Next Steps / Documents: " : "Reason: "}${discription}
    ${status === 'agree' ? "Kindly proceed with the required actions." : "You may explore other available listings on our platform."}

Thanks,
The Tenants Team
`;
        if (status) {
            await scheduleVisitsEmail(subject, ownerEmail, mailFormatText, mailFormatHtml)
        }

        res.status(200).json({ message: 'Application status updated successfully.', application: updatedApplication });
    } catch (error) {
        console.error('Error changing application status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const uploadDocuments = async (req, res) => {
    const { id } = req.body;
    const files = req.files;

    if (!id) {
        return res.status(400).json({ error: 'Application ID is required.' });
    }

    if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ error: 'No documents uploaded.' });
    }

    try {
        const documentUrls = files.map(file => `${process.env.ASSETS_URL}${file.filename}`);

        const updatedApplication = await applicationSchema.findByIdAndUpdate(
            id,
            { documents: documentUrls },
            { new: true }
        );

        if (!updatedApplication) {
            return res.status(404).json({ error: 'Application not found.' });
        }

        res.status(200).json({
            message: 'Documents uploaded successfully.',
            application: updatedApplication
        });
    } catch (error) {
        console.error('Error uploading documents:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const uploadAgreement = async (req, res) => {
    const { id, role } = req.body;
    const lease = req.file;

    if (!id) {
        return res.status(400).json({ error: 'Application ID is required.' });
    }

    if (!lease) {
        return res.status(400).json({ error: 'No documents uploaded.' });
    }

    const leasePath = req.file
        ? `${process.env.ASSETS_URL}${lease.filename}`
        : "";

    const uploadDoc = { document: leasePath, from: role, date: new Date() }

    try {
        const updatedApplication = await applicationSchema.findByIdAndUpdate(
            id,
            {
                $push: { agreement: uploadDoc },
            },
            { new: true }
        );

        if (!updatedApplication) {
            return res.status(404).json({ error: 'Application not found.' });
        }

        res.status(200).json({
            message: 'Documents uploaded successfully.',
            application: updatedApplication
        });
    } catch (error) {
        console.error('Error uploading documents:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateAgreementStatus = async (req, res) => {
    const { id, reason, action } = req.body;

    try {
        const updatedApp = await applicationSchema.findOneAndUpdate(
            { 'agreement._id': id },
            {
                $set: {
                    'agreement.$.reason': reason,
                    'agreement.$.action': action,
                },
            },
            { new: true }
        );
        if (!updatedApp) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        res.status(200).json({ message: 'Agreement updated successfully', data: updatedApp });
    } catch (error) {
        console.error('Error Update Agreement Status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getQRCode = async (req, res) => {
    const { id } = req.query;

    // Validate input
    if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const ownerDetails = await userSchema.findById(id).lean();

        if (!ownerDetails) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!ownerDetails.QRCode) {
            return res.status(404).json({ error: 'QR Code not available for this user' });
        }

        return res.status(200).json({
            message: 'QR Code fetched successfully',
            QRCode: ownerDetails.QRCode
        });

    } catch (error) {
        console.error('Error getting QR Code:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


const payment = async (req, res) => {
    const { id } = req.body
    const payment = req.file;

    if (!id) {
        return res.status(400).json({ error: 'Application ID is required.' });
    }

    if (!payment) {
        return res.status(400).json({ error: 'Payment screen short is required.' });
    }

    const paymentPath = req.file
        ? `${process.env.ASSETS_URL}${payment.filename}`
        : "";

    try {
        const updatedApplication = await applicationSchema.findByIdAndUpdate(
            id,
            {
                payment: paymentPath,
            },
            { new: true }
        );

        res.status(200).json({
            message: 'Payment is recived.',
            application: updatedApplication
        });

    } catch (error) {
        console.error('Error in application:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

router.post('/sendApplication', sendApplication);
router.post('/changeApplicationStatus', changeApplicationStatus);
router.post('/uploadApplicationDocuments', upload.array('documents'), uploadDocuments);
router.post('/uploadAgreement', upload.single("lease"), uploadAgreement);
router.post('/payment', upload.single("payment"), payment);
router.post('/updateAgreementStatus', updateAgreementStatus);
router.get('/getApplications', getApplications);
router.get('/getQRCode', getQRCode);

module.exports = router;