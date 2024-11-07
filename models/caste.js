const mongoose = require("mongoose");

const casteSchema = new mongoose.Schema({
  collegeId : {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
  },  
  name: { type: String, required: true },
});

casteSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

casteSchema.set("toJSON", {
  virtuals: true,
});

const Caste = mongoose.model("Caste", casteSchema);
module.exports = Caste;
