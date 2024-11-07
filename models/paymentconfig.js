const mongoose = require("mongoose");

const paymentConfigSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    merchId: { type: String, required: true },
    merchPass: { type: String, required: true },
    prodId: { type: String, required: true }, // Default product ID
    hashRequestKey: { type: String, required: true }, // HashRequest Key
    aesRequestKey: { type: String, required: true }, // AES Request Salt/IV Key
    hashResponseKey: { type: String, required: true }, // HashResponse Key
    aesResponseKey: { type: String, required: true }, // AES Response Salt/IV Key
    Authurl: {
      type: String,
      default: "https://payment.atomtech.in/paynetz/epi/fts",
    }, // Payment URL
    mccCode: { type: String },
    correctTType: { type: String, required: true},
    currency: {
      type: String,
      required: true,
      default: "INR",
    },
    transactionTimeout: {
      type: Number,
      required: true,
      default: 300, // example timeout in seconds
    },
  },
  { timestamps: true }
);

paymentConfigSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

paymentConfigSchema.set("toJSON", {
  virtuals: true,
});

const PaymentConfig = mongoose.model("PaymentConfig", paymentConfigSchema);

module.exports = PaymentConfig;
