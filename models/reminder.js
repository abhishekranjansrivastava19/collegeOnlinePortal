const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  message: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
});

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;