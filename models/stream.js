const mongoose = require("mongoose");

const streamSchema = new mongoose.Schema({
  collegeId : {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
  },  
  name: { type: String, required: true },
});

streamSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

streamSchema.set("toJSON", {
  virtuals: true,
});

const Stream = mongoose.model("Stream", streamSchema);
module.exports = Stream;
