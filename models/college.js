const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String, required: true },
  address: { type: String, required: true },
  country: { type: String, required: true},
  state: {type: String, required: true},
  city: { type: String, required: true},
  phone: { type: String, required: true },
  email: { type: String, required: true },
  brandColor: { type: String },
  primaryColor: { type: String },
  secondaryColor: { type: String },
  tertiaryColor: { type: String },
  quaternaryColor: { type: String },
  brandTextColor: { type: String },
  primaryTextColor: { type: String },
  secondaryTextColor: { type: String },
  tertiaryTextColor: { type: String },
  quaternaryTextColor: { type: String },
  remark: { type: String },
  lastDate: { type: Date, required: true, default: Date.now() },
});

collegeSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

collegeSchema.set("toJSON", {
  virtuals: true,
});

// exports.College = mongoose.model('College', collegeSchema);
const College = mongoose.model("College", collegeSchema);
module.exports = College;
