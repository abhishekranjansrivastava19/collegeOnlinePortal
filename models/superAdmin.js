const mongoose = require('mongoose');

const superAdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  isSuperAdmin: { type: Boolean, default: false }
});

superAdminSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

superAdminSchema.set('toJSON', {
    virtuals:true
})

const SuperAdmin = mongoose.model('SuperAdmin', superAdminSchema);
module.exports = SuperAdmin;