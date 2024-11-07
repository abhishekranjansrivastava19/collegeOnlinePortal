const mongoose = require("mongoose");

const majorsubjectSchema = new mongoose.Schema({
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

majorsubjectSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

majorsubjectSchema.set("toJSON", {
  virtuals: true,
});

const MajorSubject = mongoose.model("MajorSubject", majorsubjectSchema);
module.exports = MajorSubject;
