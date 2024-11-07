const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  profile_image: { type: String, required: true },
  aadhar_image: { type: String, required: true },
  transfer_certificate: { type: String, default: "" },
  courseType: {
    type: String,
    enum: ["Under Graduate", "Post Graduate"], // Course type can only be 'ug' (undergraduate) or 'pg' (postgraduate)
    required: true,
  },
  twelth_marksheet: {
    type: String,
    validate: {
      validator: function (value) {
        // If courseType is 'ug', twelth_marksheet is required
        if (this.courseType === "Under Graduate") {
          return value != null && value.trim() !== "";
        }
        return true;
      },
      message: "Twelth marksheet is required for UG courses",
    },
  },
  ug_marksheet: {
    type: String,
    validate: {
      validator: function (value) {
        // If courseType is 'pg', ug_marksheet is required
        if (this.courseType === "Post Graduate") {
          return value != null && value.trim() !== "";
        }
        return true;
      },
      message: "UG marksheet is required for PG courses",
    },
  },
});

documentSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

documentSchema.set("toJSON", {
  virtuals: true,
});

const Document = mongoose.model("Document", documentSchema);
module.exports = Document;
