const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    // sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    photo: { type: String },
    fatherName: { type: String },
    motherName: { type: String },
    fatherOccupation: { type: String },
    motherOccupation: { type: String },
    fatherPhone: { type: String },
    motherPhone: { type: String },
    address: { type: String },
    majorSubjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MajorSubjects',
        required: true
    }],
    minorSubjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MinorSubject',
        required: true
    }],
    vocationalSubjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VocationalSubject',
        required: true
    }],
    gender: { type: String },
    caste: { type: String },
    religion: { type: String },
    isAccepted: { type: Boolean }
  });
  
profileSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

profileSchema.set('toJSON', {
    virtuals:true
})

exports.profileSchema = mongoose.model('Profile', profileSchema);