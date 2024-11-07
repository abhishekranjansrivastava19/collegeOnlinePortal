const mongoose = require("mongoose");

const vocationalSubjectSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
    required: true,
  },
  subjectname: {
    type: String,
    required: true
  }
});

vocationalSubjectSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

vocationalSubjectSchema.set("toJSON", {
  virtuals: true,
});

const VocationalSubject = mongoose.model("VocationalSubject", vocationalSubjectSchema);
module.exports = VocationalSubject;
