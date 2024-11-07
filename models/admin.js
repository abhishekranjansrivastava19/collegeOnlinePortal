const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
    required: true,
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  passwordHash: { type: String, required: true },
  createdTime: { type: Date, default: Date.now },
  userRole: { type: String, default: "Admin" },
  editProfile: {
    type: Boolean,
    default: false,
  },
  editRegisAmt: {
    type: Boolean,
    default: false,
  }
});

adminSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

adminSchema.set("toJSON", {
  virtuals: true,
});

// exports.adminSchema = mongoose.model('Admin', adminSchema);
const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
