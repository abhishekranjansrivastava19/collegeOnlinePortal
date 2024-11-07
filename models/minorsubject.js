const mongoose = require("mongoose");

const minorsubjectSchema = new mongoose.Schema({
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

minorsubjectSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

minorsubjectSchema.set("toJSON", {
  virtuals: true,
});

const MinorSubject = mongoose.model("MinorSubject", minorsubjectSchema);
module.exports = MinorSubject;
