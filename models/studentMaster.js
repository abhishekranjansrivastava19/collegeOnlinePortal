const mongoose = require("mongoose");

const studentMasterSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  father_name: { type: String, required: true },
  mother_name: { type: String, required: true },
  permanent_address: { type: String, required: true },
  correspondence_address: { type: String },
  father_phone: {
    type: String,
  },
  mother_phone: {
    type: String,
  },
  createdTime: { type: Date, default: Date.now },
  father_occupation: { type: String },
  father_qualification: { type: String },
  mother_qualification: { type: String },
  mother_occupation: { type: String },
  aadhar_no: { type: String, required: true },
  caste: { type: String, required: true },
  religion: { type: String, required: true },
});

studentMasterSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

studentMasterSchema.set("toJSON", {
  virtuals: true,
});

// exports.studentSchema = mongoose.model('Student', studentSchema);
const StudentMaster = mongoose.model("StudentMaster", studentMasterSchema);
module.exports = StudentMaster;
