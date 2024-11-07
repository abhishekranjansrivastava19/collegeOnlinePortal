const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  fname: { type: String, required: true },
  lname: { type: String },
  passwordHash: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  createdTime: { type: Date, default: Date.now },
  dob: { type: Date, default: Date.now() },
  gender: { type: String, required: true },
  userRole: { type: String, default: "Student" },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true,
  },
  isVarified: { type: Boolean, default: false },
  isFinalized: { type: Boolean, default: false },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
    required: true,
  },
  courseType: {
    type: String,
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  majorSubjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MajorSubject",
    },
  ],
  minorSubjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MinorSubject",
    },
  ],
  vocationalSubjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VocationalSubject",
    },
  ],
  tenthQualification: {
    instituteName: { type: String },
    passingYear: { type: String },
    enrollmentNumber: { type: String },
    maxMarks: { type: Number },
    obtainedMarks: { type: Number },
    percentage: { type: Number },
  },
  twelthQualification: {
    instituteName: { type: String },
    passingYear: { type: String },
    enrollmentNumber: { type: String },
    maxMarks: { type: Number },
    obtainedMarks: { type: Number },
    percentage: { type: Number },
  },
  ugQualification: {
    instituteName: { type: String },
    passingYear: { type: String },
    enrollmentNumber: { type: String },
    maxMarks: { type: Number },
    obtainedMarks: { type: Number },
    percentage: { type: Number },
  },
  paymentStatus: { type: Boolean, required: true, default: false}
});

studentSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

studentSchema.set("toJSON", {
  virtuals: true,
});

// exports.studentSchema = mongoose.model('Student', studentSchema);
const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
