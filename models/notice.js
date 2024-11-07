const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
    collegeId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "College",
        required: true,
    },
    title : {
        type : String,
        required : true
    },
    description :{
        type: String,
        required : true
    },
    date : {
        type : Date,
        required : true,
        default : Date.now()
    }
})

noticeSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

noticeSchema.set('toJSON', {
    virtuals:true
})

const Notice = mongoose.model("Notice", noticeSchema);
module.exports = Notice;