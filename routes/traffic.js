const express = require("express");
const router = express.Router();
const Traffic = require("../models/traffic");

// Log traffic
// router.post("/log-traffic", async (req, res) => {
//   try {
//     // Create a new traffic entry
//     const traffic = new Traffic({ count: 1 });
//     await traffic.save();
//     res
//       .status(201)
//       .json({ success: true, message: "Traffic logged successfully" });
//       console.log(traffic)
//   } catch (error) {
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: "Error logging traffic",
//         error: error.message,
//       });
//   }
// });

router.post('/log-traffic', async (req, res) => {
    try {
      // Find the latest traffic record (optional: filter by date if needed)
      let traffic = await Traffic.findOne().sort({ timestamp: -1 });
  
      // If no record exists, create a new one
      if (!traffic) {
        traffic = new Traffic({ count: 1 });
      } else {
        // Increment the count
        traffic.count += 1;
      }
  
      // Save the traffic record
      await traffic.save();
  
      res.status(201).json({ success: true, message: 'Traffic logged successfully' });
    } catch (error) {
      console.error('Error logging traffic:', error);
      res.status(500).json({ success: false, message: 'Error logging traffic', error: error.message });
    }
  });
  


router.get("/", async (req, res) => {
  try {
    const trafficData = await Traffic.find().sort({ timestamp: 1 }); // Sort by timestamp
    res.status(200).json(trafficData);
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching traffic data",
        error: error.message,
      });
  }
});

module.exports = router;
