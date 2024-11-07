const mongoose = require('mongoose');

const SubjectgroupSchema = new mongoose.Schema({
    course : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    name : {
        type : String,
        required : true
    }
})

SubjectgroupSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

SubjectgroupSchema.set('toJSON', {
    virtuals:true
})

exports.SubjectgroupSchema = mongoose.model('SubjectGroup', SubjectgroupSchema);