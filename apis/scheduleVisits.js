const express = require('express');
const { scheduleVisitsEmail } = require('../middlewares/mailer');
const router = express.Router();
const BASE_URL = process.env.BASE_URL;
const userSchema = require('../models/userSchema')
const listingSchema = require('../models/listingsSchema')
const schema = require('../models/visitSchema');

const scheduleVisits = async (req, res) => {
  try {
    const { visitDate, visitTime, propertyId, visitorId, ownerId } = req.body;

    if (!(visitDate || visitTime || propertyId || visitorId || ownerId)) {
      return res.status(400).json({
        message: "Missing required fields (visitDate, visitTime, propertyId, visitorId, ownerId)."
      });
    }

    const visitorDetails = await userSchema.findById(visitorId).lean();
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

    const schedule = new schema({
      visitorId,
      ownerId,
      propertyId,
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
      visitDate,
      visitTime,
    });

    const addSchedule = await schedule.save();

    const mailFormatText = `
New Property Visit Schedule

Hello ${ownerDetails.userName},

You have been scheduled for a property visit:

Property: ${propertyDetails.title}
Address: ${propertyDetails.location}
Date & Time: ${visitDate} at ${visitTime}

Client Details:

visitorName: ${visitorDetails.userName}
visitorContact: ${visitorDetails.contact}
visitorEmail: ${visitorDetails.email}
visitorDob: ${visitorDetails.dob}
visitorProfession: ${visitorDetails.profession}
visitorIncome: ${visitorDetails.monthlyIncome}
visitorCurrentAddress: ${visitorDetails.currentAddress}
visitorPet: ${visitorDetails.pet}
visitorFoodPreference: ${visitorDetails.foodPreference}
visitorLivingPreference: ${visitorDetails.livingPreference}
visitorDrinking: ${visitorDetails.drinking ? "Yes" : "No"}
visitorSmoking: ${visitorDetails.smoking ? "Yes" : "No"}


Please confirm your availability by visiting one of the following links:
- Agree: ${BASE_URL}/visit?response=agree&id=${addSchedule._id}
- Reschedule: ${BASE_URL}/rescheduleVisit?response=reschedule&reschedule=agent&id=${addSchedule._id}
- Disagree: ${BASE_URL}/visit?response=disagree&id=${addSchedule._id}

Thanks,
The Tenants Team
`;

    const mailFormatHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>New Property Visit Schedule</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2>New Property Visit Schedule</h2>
  <p>Hello ${ownerDetails.userName},</p>
  <p>You have been scheduled for a property visit:</p>
  <ul>
    <li><strong>Property:</strong> ${propertyDetails.title}</li>
    <li><strong>Address:</strong> ${propertyDetails.location}</li>
    <li><strong>Date & Time:</strong> ${visitDate} at ${visitTime}</li>
  </ul>

  <p>Client Details:</p>
  <ul>
    <li><strong>visitorName:</strong> ${visitorDetails.userName}</li>
    <li><strong>visitorContact:</strong> ${visitorDetails.contact}</li>
    <li><strong>visitorEmail & Time:</strong> ${visitorDetails.email}</li>
    <li><strong>visitorDob:</strong> ${visitorDetails.dob}</li>
    <li><strong>visitorProfession:</strong> ${visitorDetails.profession}</li>
    <li><strong>visitorIncome:</strong> ${visitorDetails.monthlyIncome}</li>
    <li><strong>visitorCurrentAddress & Time:</strong> ${visitorDetails.currentAddress}</li>
    <li><strong>visitorPet:</strong> ${visitorDetails.pet}</li>
    <li><strong>visitorFoodPreference:</strong> ${visitorDetails.foodPreference}</li>
    <li><strong>visitorLivingPreference:</strong> ${visitorDetails.livingPreference}</li>
    <li><strong>visitorDrinking & Time:</strong> ${visitorDetails.drinking ? "Yes" : "No"}</li>
    <li><strong>visitorSmoking:</strong> ${visitorDetails.smoking ? "Yes" : "No"}</li>
  </ul>
  <p>Please confirm your availability by clicking one of the buttons below:</p>
  <div style="margin: 20px 0;">
    <a href="${BASE_URL}/visit?response=agree&id=${addSchedule._id}" 
       style="display:inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin-right: 10px;">
       ✅ Agree
    </a>
    <a href="${BASE_URL}/rescheduleVisit?response=reschedule&reschedule=agent&id=${addSchedule._id}" 
       style="display:inline-block; padding: 10px 20px; background-color: #f0ad4e; color: white; text-decoration: none; border-radius: 5px; margin-right: 10px;">
       📅 Reschedule
    </a>
    <a href="${BASE_URL}/visit?response=disagree&id=${addSchedule._id}" 
       style="display:inline-block; padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px;">
       ❌ Disagree
    </a>
  </div>
  <p>Thanks,<br>The Tenants Team</p>
</body>
</html>
`;
    await scheduleVisitsEmail("Schedule Visit", ownerDetails.email, mailFormatText, mailFormatHtml);

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

router.post('/schedule', scheduleVisits);

module.exports = router;