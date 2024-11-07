const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const PaymentConfig = require("../models/paymentconfig");

router.post("/add_payment_config", async (req, res) => {
  try {
    const {
      collegeId,
      merchId,
      merchPass,
      prodId,
      hashRequestKey,
      hashResponseKey,
      aesRequestKey,
      aesResponseKey,
      mccCode,
      correctTType,
      currency,
      transactionTimeout,
    } = req.body;

    // Create a new college payment record
    const collegePayment = new PaymentConfig({
      collegeId,
      merchId,
      merchPass,
      prodId,
      hashRequestKey,
      hashResponseKey,
      aesRequestKey,
      aesResponseKey,
      mccCode,
      correctTType,
      currency,
      transactionTimeout,
    });

    const existingCollege = await PaymentConfig.findOne({
      collegeId: new mongoose.Types.ObjectId(collegeId),
    });
    if (existingCollege) {
      res
        .status(400)
        .json({
          success: false,
          message: "Payment configuration is already exists for this college",
        });
    } else {
      await collegePayment.save();
      res
        .status(201)
        .json({
          success: true,
          message: "Payment credentials added successfully!",
        });
    }
  } catch (error) {
    console.error("Error adding payment credentials:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to add payment credentials." });
  }
});

// Route to get payment gateway credentials for a college
router.get("/get_payment_config/:collegeId", async (req, res) => {
  try {
    const { collegeId } = req.params;

    // Fetch the payment credentials for the specified college
    const collegePayment = await PaymentConfig.findOne({ collegeId });
    if (!collegePayment) {
      return res
        .status(404)
        .json({ success: false, message: "College not found" });
    }

    res.status(200).json({ success: true, data: collegePayment });
  } catch (error) {
    console.error("Error fetching payment credentials:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to retrieve payment credentials.",
      });
  }
});

module.exports = router;
