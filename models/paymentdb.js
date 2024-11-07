const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College", // Assuming you have a User model
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student", // Assuming you have a User model
    required: true,
  },
  txnId: {
    type: String,
    required: true,
    unique: true,
  },
  txnStatusCode: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  surchargeAmount: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  txnDate: {
    type: Date,
    default: Date.now,
  },
  custEmail: {
    type: String,
  },
  custMobile: {
    type: String,
  }
});

transactionSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

transactionSchema.set("toJSON", {
  virtuals: true,
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
