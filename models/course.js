const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    collegeId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "College",
        required: true,
    },
    streamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stream",
        required: true,
    },
    name : {
        type : String,
        required : true
    },
    courseType :{
        type: String,
        required : true
    },
    registrationAmt : {
        type : Number,
        required : true
    },
    lastDate : {
        type : Date,
        required : true,
        default : Date.now()
    },
    maxMajor : {
        type : Number,
        required : true
    },
    maxMinor : {
        type : Number,
        required : true
    },
    maxVocational : {
        type : Number,
        required : true
    },
    majorSubjects : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MajorSubject'
    }],
    minorSubjects : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MinorSubject'
    }],
    vocationalSubjects : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VocationalSubject'
    }]
})

courseSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

courseSchema.set('toJSON', {
    virtuals:true
})

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;