const mongoose = require('mongoose');

const trafficSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  count: {
    type: Number,
    required: true,
  },
});

const Traffic = mongoose.model('Traffic', trafficSchema);

module.exports = Traffic;