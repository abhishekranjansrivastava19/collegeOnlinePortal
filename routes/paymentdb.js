const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Transaction = require("../models/paymentdb");


router.get(`/:userId`, async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid User Id" });
    } 
    const transaction = await Transaction.find({ userId: new mongoose.Types.ObjectId(userId) })
    .populate({ path: 'userId', populate: { path: 'course session majorSubjects minorSubjects vocationalSubjects'}})
    if (!transaction) {
      return res
        .status(500)
        .json({ message: "The transaction with the given ID was not found." });
    }
    return res.status(200).json(transaction);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;
