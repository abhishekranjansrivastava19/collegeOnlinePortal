const express = require("express");
const Reminder = require("../models/reminder")
const router = express.Router();
const axios = require('axios');

// router.post('/send/:collegeId', async (req, res) => {
//     try {
//       const collegeId = req.params.collegeId;
//       const college = await College.findById(collegeId);
  
//       if (!college) {
//         return res.status(404).json({ success: false, message: 'College not found' });
//       }
  
//       // Create a temporary reminder message (this could be stored in a DB or another system)
//       const reminderMessage = {
//         message: `Reminder: Your deadline is approaching on ${college.lastDate}`,
//         sentAt: new Date(),
//         expiresAt: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000), // 40 days from now
//       };
  
//       // Here you can integrate your logic to send the reminder (e.g., save to a database, log, etc.)
//       console.log(`Reminder sent to ${college.name}:`, reminderMessage);
  
//       res.status(200).json({
//         success: true,
//         message: 'Reminder sent successfully!',
//         reminder: reminderMessage,
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: 'Error sending reminder',
//         error: error.message,
//       });
//     }
//   });

router.post('/send/:collegeId', async (req, res) => {
    const collegeId = req.params.collegeId;
    const message = "This is your reminder message"; // Customize your message here
  
    try {
      // Save the reminder to the database
      const newReminder = new Reminder({ collegeId, message });
      await newReminder.save();
  
      // Send response
      res.status(200).json({
        success: true,
        message: 'Reminder sent successfully!',
      });
    } catch (error) {
      console.error('Error sending reminder:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send reminder',
        error: error.message,
      });
    }
  });
  

//   router.get('/:collegeId', async (req, res) => {
//     const collegeId = req.params.collegeId;
  
//     try {
//       // Find reminders for the specific college
//       const reminders = await Reminder.find({ collegeId }).sort({ sentAt: -1 });
  
//       res.status(200).json({
//         success: true,
//         reminders,
//       });
//     } catch (error) {
//       console.error('Error retrieving reminders:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to retrieve reminders',
//         error: error.message,
//       });
//     }
//   });

  

module.exports = router
