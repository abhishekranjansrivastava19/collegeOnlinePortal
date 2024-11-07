const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    start: {
        type : Date,
        required : true
    },
    end: {
        type : Date,
        required : true
    },
    collegeId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "College",
        required: true,
    }
})

sessionSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

sessionSchema.set('toJSON', {
    virtuals:true
})

const Session = mongoose.model("Session", sessionSchema);
module.exports = Session;
