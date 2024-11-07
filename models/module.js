const mongoose = require("mongoose");

// const submoduleSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   permissions: {
//     view: { type: Boolean, default: false },
//     create: { type: Boolean, default: false },
//     update: { type: Boolean, default: false },
//     delete: { type: Boolean, default: false },
//   },
//   tag: {
//     type: String,
//     required: true,
//     unique: true, // For unique identification, like 'mnuStudentAdmission'
//   },
// });




const moduleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    permissions: {
      view: { type: Boolean, default: true },
      create: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);


const Module = mongoose.model("Module", moduleSchema);
module.exports = Module;
